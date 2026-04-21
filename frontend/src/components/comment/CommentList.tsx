import CommentItem from './CommentItem';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import type { Comment } from '../../types/comment';

interface CommentListProps {
  comments: Comment[];
  emptyText?: string;
  error?: string;
  deletingCommentId?: number | null;
  onDeleteComment?: (commentId: number) => void | Promise<void>;
  canDeleteComment?: (comment: Comment) => boolean;
  onRetry?: () => void | Promise<void>;
}

export default function CommentList({
  comments,
  emptyText = 'No comments yet.',
  error = '',
  deletingCommentId = null,
  onDeleteComment,
  canDeleteComment,
  onRetry,
}: CommentListProps) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (comments.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <section>
      {comments.map((comment) => {
        const showDeleteButton = onDeleteComment
          ? canDeleteComment
            ? canDeleteComment(comment)
            : true
          : false;

        return (
          <CommentItem
            key={comment.id}
            comment={comment}
            showDeleteButton={showDeleteButton}
            deleting={deletingCommentId === comment.id}
            onDelete={onDeleteComment}
          />
        );
      })}
    </section>
  );
}
