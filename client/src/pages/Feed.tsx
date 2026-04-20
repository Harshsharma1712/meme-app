import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface MemePost {
  id: string;
  caption: string;
  topic: string;
  style: string;
  created_at: string;
  username: string;
  media_url: string;
  avatar_url: string;
  likes_count: string | number;
  comments_count: string | number;
}

interface MemeLikeMeta {
  count: number;
  is_liked: boolean;
}

interface MemeComment {
  id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url?: string;
  user_id?: string;
}

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function Feed() {
  const { user } = useAuth();
  const [memes, setMemes] = useState<MemePost[]>([]);
  const [likeMeta, setLikeMeta] = useState<Record<string, MemeLikeMeta>>({});
  const [commentMap, setCommentMap] = useState<Record<string, MemeComment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [likeUpdatingId, setLikeUpdatingId] = useState('');
  const [commentPostingId, setCommentPostingId] = useState('');
  const [commentDeletingId, setCommentDeletingId] = useState('');
  const [error, setError] = useState('');

  const parseIsLiked = (value: unknown) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    if (typeof value === 'number') return value === 1;
    return false;
  };

  const fetchLikeCount = async (memeId: string, fallbackCount = 0) => {
    try {
      const response = await api.get(`/likes/${memeId}/count`);
      const data = response.data?.data;
      return {
        count: Number(data?.count ?? fallbackCount),
        is_liked: parseIsLiked(data?.is_liked),
      };
    } catch {
      return {
        count: Number(fallbackCount),
        is_liked: false,
      };
    }
  };

  const loadMemes = async () => {
    const response = await api.get('/memes/get');
    const fetchedMemes = response.data?.data || [];
    const list = Array.isArray(fetchedMemes) ? fetchedMemes : [];
    setMemes(list);
    return list as MemePost[];
  };

  const loadLikeMeta = async (list: MemePost[]) => {
    const entries = await Promise.all(
      list.map(async (meme) => {
        const fallbackCount = Number(meme.likes_count || 0);
        const meta = await fetchLikeCount(meme.id, fallbackCount);
        return [meme.id, meta] as const;
      })
    );
    setLikeMeta(Object.fromEntries(entries));
  };

  const fetchCommentsForMeme = async (memeId: string) => {
    setCommentLoading((prev) => ({ ...prev, [memeId]: true }));
    try {
      const response = await api.get(`/comment/${memeId}`);
      const fetchedComments = response.data?.data || [];
      setCommentMap((prev) => ({
        ...prev,
        [memeId]: Array.isArray(fetchedComments) ? fetchedComments : [],
      }));
    } finally {
      setCommentLoading((prev) => ({ ...prev, [memeId]: false }));
    }
  };

  useEffect(() => {
    const loadFeed = async () => {
      setLoadingFeed(true);
      setError('');
      try {
        const memeList = await loadMemes();
        await loadLikeMeta(memeList);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load meme feed.');
      } finally {
        setLoadingFeed(false);
      }
    };

    loadFeed();
  }, []);

  const handleToggleLike = async (memeId: string) => {
    const currentlyLiked = likeMeta[memeId]?.is_liked;
    setLikeUpdatingId(memeId);
    setError('');

    try {
      if (currentlyLiked) {
        await api.delete(`/likes/${memeId}`);
      } else {
        await api.post(`/likes/${memeId}`);
      }

      const updated = await fetchLikeCount(memeId, Number(likeMeta[memeId]?.count || 0));
      setLikeMeta((prev) => ({ ...prev, [memeId]: updated }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update like.');
    } finally {
      setLikeUpdatingId('');
    }
  };

  const handleToggleComments = async (memeId: string) => {
    const nextExpanded = !expandedComments[memeId];
    setExpandedComments((prev) => ({ ...prev, [memeId]: nextExpanded }));
    if (nextExpanded && !commentMap[memeId]) {
      await fetchCommentsForMeme(memeId);
    }
  };

  const handlePostComment = async (memeId: string) => {
    const content = (commentDrafts[memeId] || '').trim();
    if (!content) return;

    setCommentPostingId(memeId);
    setError('');

    try {
      await api.post(`/comment/${memeId}`, { content });
      setCommentDrafts((prev) => ({ ...prev, [memeId]: '' }));
      await fetchCommentsForMeme(memeId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setCommentPostingId('');
    }
  };

  const handleDeleteComment = async (memeId: string, commentId: string) => {
    setCommentDeletingId(commentId);
    setError('');
    try {
      await api.delete(`/comment/${commentId}`);
      await fetchCommentsForMeme(memeId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete comment.');
    } finally {
      setCommentDeletingId('');
    }
  };

  const canDeleteComment = (comment: MemeComment) => {
    if (!user) return false;

    // Prefer stable identity when backend returns user_id; fallback to username.
    if (comment.user_id) {
      return comment.user_id === user.id;
    }

    return comment.username === user.username;
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="rounded-md border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-100">Meme Feed</h2>
          <Button
            type="button"
            variant="ghost"
            className="text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
            onClick={async () => {
              const memeList = await loadMemes();
              await loadLikeMeta(memeList);
            }}
            disabled={loadingFeed}
          >
            Refresh
          </Button>
        </div>

        {loadingFeed ? (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="py-8 text-center text-zinc-400">Loading memes...</CardContent>
          </Card>
        ) : memes.length === 0 ? (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="py-8 text-center text-zinc-400">No memes yet. Be the first to post.</CardContent>
          </Card>
        ) : (
          memes.map((meme) => (
            <Card key={meme.id} className="bg-zinc-950 border-zinc-800 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-zinc-700">
                      <AvatarImage src={meme.avatar_url} alt={meme.username} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-200">
                        {meme.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base text-zinc-100">{meme.username}</CardTitle>
                      <CardDescription className="text-xs text-zinc-400">
                        {formatRelativeTime(meme.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400">
                    #{meme.topic} • {meme.style}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <img src={meme.media_url} alt={meme.caption} className="w-full max-h-100 sm:max-h-125 md:max-h-150 object-contain bg-black rounded-lg border border-zinc-800" />
                <p className="text-zinc-200">{meme.caption}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className={`h-8 px-3 ${likeMeta[meme.id]?.is_liked ? 'text-fuchsia-300 hover:text-fuchsia-200' : 'text-zinc-300 hover:text-zinc-100'} hover:bg-white/10`}
                    onClick={() => handleToggleLike(meme.id)}
                    disabled={likeUpdatingId === meme.id}
                  >
                    {likeUpdatingId === meme.id ? 'Updating...' : likeMeta[meme.id]?.is_liked ? 'Unlike' : '♡ Like'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-3 text-zinc-300 hover:text-zinc-100 hover:bg-white/10"
                    onClick={() => handleToggleComments(meme.id)}
                  >
                    {expandedComments[meme.id] ? 'Hide Comments' : 'Comments'}
                  </Button>
                </div>
                <div className="text-sm text-zinc-400">
                  {likeMeta[meme.id]?.count ?? Number(meme.likes_count || 0)} likes • {commentMap[meme.id]?.length ?? Number(meme.comments_count || 0)} comments
                </div>

                {expandedComments[meme.id] && (
                  <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <div className="flex gap-2">
                      <Input
                        value={commentDrafts[meme.id] || ''}
                        onChange={(event) =>
                          setCommentDrafts((prev) => ({ ...prev, [meme.id]: event.target.value }))
                        }
                        placeholder="Write a comment..."
                        className="bg-zinc-950 border-zinc-800 text-zinc-100"
                      />
                      <Button
                        type="button"
                        onClick={() => handlePostComment(meme.id)}
                        disabled={commentPostingId === meme.id}
                        className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                      >
                        {commentPostingId === meme.id ? 'Posting...' : 'Post'}
                      </Button>
                    </div>

                    {commentLoading[meme.id] ? (
                      <p className="text-sm text-zinc-400">Loading comments...</p>
                    ) : (commentMap[meme.id] || []).length === 0 ? (
                      <p className="text-sm text-zinc-400">No comments yet.</p>
                    ) : (
                      (commentMap[meme.id] || []).map((comment) => (
                        <div key={comment.id} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <Avatar className="h-7 w-7 border border-zinc-700">
                                <AvatarImage src={comment.avatar_url} alt={comment.username} />
                                <AvatarFallback className="bg-zinc-800 text-xs text-zinc-200">
                                  {comment.username?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-zinc-200">{comment.username}</p>
                                <p className="text-xs text-zinc-500">{formatRelativeTime(comment.created_at)}</p>
                              </div>
                            </div>
                            {canDeleteComment(comment) && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-zinc-400 hover:text-red-300 hover:bg-red-950/40"
                                onClick={() => handleDeleteComment(meme.id, comment.id)}
                                disabled={commentDeletingId === comment.id}
                              >
                                {commentDeletingId === comment.id ? 'Deleting...' : 'Delete'}
                              </Button>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-zinc-300">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
