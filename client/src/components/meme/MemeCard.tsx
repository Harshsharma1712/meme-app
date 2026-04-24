import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

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

interface MemeCardProps {
  meme: MemePost;
  likeMeta?: MemeLikeMeta;
  isLikeUpdating: boolean;
  isExpanded: boolean;
  comments: MemeComment[];
  isCommentsLoading: boolean;
  commentDraft: string;
  isPostingComment: boolean;
  deletingCommentId: string;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onCommentDraftChange: (value: string) => void;
  onPostComment: () => void;
  onDeleteComment: (commentId: string) => void;
  canDeleteComment: (comment: MemeComment) => boolean;
  formatRelativeTime: (timestamp: string) => string;
}

export default function MemeCard({
  meme,
  likeMeta,
  isLikeUpdating,
  isExpanded,
  comments,
  isCommentsLoading,
  commentDraft,
  isPostingComment,
  deletingCommentId,
  onToggleLike,
  onToggleComments,
  onCommentDraftChange,
  onPostComment,
  onDeleteComment,
  canDeleteComment,
  formatRelativeTime,
}: MemeCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.01, y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden border-white/10 bg-[#171717]/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-white/15">
                <AvatarImage src={meme.avatar_url} alt={meme.username} />
                <AvatarFallback className="bg-[#111111] text-[#E5E5E5]">
                  {meme.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base text-[#E5E5E5]">{meme.username}</CardTitle>
                <CardDescription className="text-xs text-[#E5E5E5]/55">
                  {formatRelativeTime(meme.created_at)}
                </CardDescription>
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[#E5E5E5]/65">
              #{meme.topic} - {meme.style}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
            <img src={meme.media_url} alt={meme.caption} className="max-h-150 w-full object-contain" />
          </div>
          <p className="text-sm text-[#E5E5E5]/90">{meme.caption}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className={`h-8 px-3 hover:bg-white/10 ${
                likeMeta?.is_liked ? 'text-[#3B82F6]' : 'text-[#E5E5E5]/75 hover:text-[#E5E5E5]'
              }`}
              onClick={onToggleLike}
              disabled={isLikeUpdating}
            >
              {isLikeUpdating ? 'Updating...' : likeMeta?.is_liked ? 'Liked' : 'Like'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-3 text-[#E5E5E5]/75 hover:bg-white/10 hover:text-[#E5E5E5]"
              onClick={onToggleComments}
            >
              {isExpanded ? 'Hide Comments' : 'Comments'}
            </Button>
          </div>
          <div className="text-sm text-[#E5E5E5]/60">
            {likeMeta?.count ?? Number(meme.likes_count || 0)} likes -{' '}
            {comments.length || Number(meme.comments_count || 0)} comments
          </div>
          {isExpanded && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex gap-2">
                <Input
                  value={commentDraft}
                  onChange={(event) => onCommentDraftChange(event.target.value)}
                  placeholder="Write a comment..."
                  className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5] placeholder:text-[#E5E5E5]/35"
                />
                <Button
                  type="button"
                  onClick={onPostComment}
                  disabled={isPostingComment}
                  className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                >
                  {isPostingComment ? 'Posting...' : 'Post'}
                </Button>
              </div>
              {isCommentsLoading ? (
                <p className="text-sm text-[#E5E5E5]/55">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-[#E5E5E5]/55">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-white/10 bg-[#111111] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-7 w-7 border border-white/15">
                          <AvatarImage src={comment.avatar_url} alt={comment.username} />
                          <AvatarFallback className="bg-[#171717] text-xs text-[#E5E5E5]">
                            {comment.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#E5E5E5]">{comment.username}</p>
                          <p className="text-xs text-[#E5E5E5]/45">
                            {formatRelativeTime(comment.created_at)}
                          </p>
                        </div>
                      </div>
                      {canDeleteComment(comment) && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-[#E5E5E5]/55 hover:bg-white/10 hover:text-[#E5E5E5]"
                          onClick={() => onDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                        >
                          {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-[#E5E5E5]/80">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
