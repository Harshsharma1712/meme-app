import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import MemeCard from '../components/meme/MemeCard';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 px-4 sm:px-6 lg:px-8"
    >
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#E5E5E5]">Meme Feed</h2>
          <Button
            type="button"
            variant="ghost"
            className="border border-white/10 text-[#E5E5E5]/80 hover:bg-white/10 hover:text-[#E5E5E5]"
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
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="border-white/10 bg-[#171717]/80 p-5 backdrop-blur-xl">
                <CardContent className="space-y-4 p-0">
                  <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
                  <div className="h-64 animate-pulse rounded-xl bg-white/8" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : memes.length === 0 ? (
          <Card className="border-white/10 bg-[#171717]/80">
            <CardContent className="py-8 text-center text-[#E5E5E5]/60">No memes yet. Be the first to post.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {memes.map((meme) => (
              <MemeCard
                key={meme.id}
                meme={meme}
                likeMeta={likeMeta[meme.id]}
                isLikeUpdating={likeUpdatingId === meme.id}
                isExpanded={Boolean(expandedComments[meme.id])}
                comments={commentMap[meme.id] || []}
                isCommentsLoading={Boolean(commentLoading[meme.id])}
                commentDraft={commentDrafts[meme.id] || ''}
                isPostingComment={commentPostingId === meme.id}
                deletingCommentId={commentDeletingId}
                onToggleLike={() => handleToggleLike(meme.id)}
                onToggleComments={() => handleToggleComments(meme.id)}
                onCommentDraftChange={(value) =>
                  setCommentDrafts((prev) => ({ ...prev, [meme.id]: value }))
                }
                onPostComment={() => handlePostComment(meme.id)}
                onDeleteComment={(commentId) => handleDeleteComment(meme.id, commentId)}
                canDeleteComment={canDeleteComment}
                formatRelativeTime={formatRelativeTime}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
