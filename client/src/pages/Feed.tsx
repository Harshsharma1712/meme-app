import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface MemeTemplate {
  id: string;
  name: string;
  tags: string[];
  media_url: string;
}

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
}

interface MemeFormState {
  template_id: string;
  caption: string;
  topic: string;
  style: string;
}

const initialFormState: MemeFormState = {
  template_id: '',
  caption: '',
  topic: '',
  style: '',
};

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
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [memes, setMemes] = useState<MemePost[]>([]);
  const [likeMeta, setLikeMeta] = useState<Record<string, MemeLikeMeta>>({});
  const [commentMap, setCommentMap] = useState<Record<string, MemeComment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [posting, setPosting] = useState(false);
  const [likeUpdatingId, setLikeUpdatingId] = useState('');
  const [commentPostingId, setCommentPostingId] = useState('');
  const [commentDeletingId, setCommentDeletingId] = useState('');
  const [error, setError] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [formData, setFormData] = useState<MemeFormState>(initialFormState);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === formData.template_id),
    [formData.template_id, templates]
  );

  const loadTemplates = async () => {
    const response = await api.get('/memes/templates');
    const fetchedTemplates = response.data?.data || [];
    setTemplates(Array.isArray(fetchedTemplates) ? fetchedTemplates : []);
  };

  const fetchLikeCount = async (memeId: string, fallbackCount = 0) => {
    try {
      const response = await api.get(`/likes/${memeId}/count`);
      const data = response.data?.data;
      return {
        count: Number(data?.count ?? fallbackCount),
        is_liked: Boolean(data?.is_liked),
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
        await loadTemplates();
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

  const handleInputChange = (field: keyof MemeFormState, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleCreateMeme = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPosting(true);
    setPostMessage('');
    setError('');

    try {
      await api.post('/memes/post', formData);
      setPostMessage('Meme posted successfully.');
      setFormData(initialFormState);
      const memeList = await loadMemes();
      await loadLikeMeta(memeList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to post meme.');
    } finally {
      setPosting(false);
    }
  };

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

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Create Meme</CardTitle>
          <CardDescription className="text-zinc-400">
            Pick a template and share your next banger with the feed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMeme} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-select" className="text-zinc-300">
                Template
              </Label>
              <select
                id="template-select"
                value={formData.template_id}
                onChange={(event) => handleInputChange('template_id', event.target.value)}
                required
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div className="overflow-hidden rounded-lg border border-zinc-800">
                <img src={selectedTemplate.media_url} alt={selectedTemplate.name} className="h-44 w-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-zinc-300">
                  Topic
                </Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(event) => handleInputChange('topic', event.target.value)}
                  placeholder="Relationship, office, tech..."
                  required
                  className="bg-zinc-900 border-zinc-800 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style" className="text-zinc-300">
                  Style
                </Label>
                <Input
                  id="style"
                  value={formData.style}
                  onChange={(event) => handleInputChange('style', event.target.value)}
                  placeholder="Humor, sarcasm, satire..."
                  required
                  className="bg-zinc-900 border-zinc-800 text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption" className="text-zinc-300">
                Caption
              </Label>
              <Input
                id="caption"
                value={formData.caption}
                onChange={(event) => handleInputChange('caption', event.target.value)}
                placeholder="Write your caption..."
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
              />
            </div>

            {postMessage && (
              <div className="rounded-md border border-emerald-900/50 bg-emerald-950/40 p-3 text-sm text-emerald-300">
                {postMessage}
              </div>
            )}
            {error && (
              <div className="rounded-md border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={posting || !formData.template_id}
              className="w-full bg-linear-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
            >
              {posting ? 'Posting...' : 'Post Meme'}
            </Button>
          </form>
        </CardContent>
      </Card>

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
                    {likeUpdatingId === meme.id ? 'Updating...' : likeMeta[meme.id]?.is_liked ? 'Unlike' : 'Like'}
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
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-zinc-400 hover:text-red-300 hover:bg-red-950/40"
                              onClick={() => handleDeleteComment(meme.id, comment.id)}
                              disabled={commentDeletingId === comment.id}
                            >
                              {commentDeletingId === comment.id ? 'Deleting...' : 'Delete'}
                            </Button>
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
