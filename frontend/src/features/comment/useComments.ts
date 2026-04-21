import { useEffect, useState } from 'react';
import { commentApi } from '../../api/comment';
import { parseApiErrorMessage } from '../../utils/error';
import type { Comment } from '../../types/comment';

export function useComments(slug?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [commentsRetryKey, setCommentsRetryKey] = useState(0);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  useEffect(() => {
    const currentSlug = slug;

    if (!currentSlug) {
      setCommentsLoading(false);
      setComments([]);
      setCommentsError('Invalid article slug');
      return;
    }

    async function fetchComments(targetSlug: string) {
      try {
        setCommentsLoading(true);
        setCommentsError('');
        const data = await commentApi.getArticleComments(targetSlug);
        setComments(data.comments);
      } catch (error) {
        setComments([]);
        setCommentsError(parseApiErrorMessage(error, 'Failed to load comments'));
      } finally {
        setCommentsLoading(false);
      }
    }

    fetchComments(currentSlug);
  }, [slug, commentsRetryKey]);

  function retryComments() {
    setCommentsRetryKey((value) => value + 1);
  }

  function prependComment(comment: Comment) {
    setComments((prev) => [comment, ...prev]);
  }

  async function removeComment(commentId: number) {
    if (!slug) return;

    try {
      setDeletingCommentId(commentId);
      setCommentsError('');
      await commentApi.deleteComment({ slug, commentId });
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      setCommentsError(parseApiErrorMessage(error, 'Failed to delete comment'));
    } finally {
      setDeletingCommentId(null);
    }
  }

  return {
    comments,
    commentsLoading,
    commentsError,
    deletingCommentId,
    retryComments,
    prependComment,
    removeComment,
  };
}
