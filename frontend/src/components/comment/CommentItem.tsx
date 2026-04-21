import Button from '../common/Button';
import type { Comment } from '../../types/comment';

interface CommentItemProps {
  comment: Comment;
  showDeleteButton?: boolean;
  deleting?: boolean;
  onDelete?: (commentId: number) => void | Promise<void>;
}

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }
  return date.toLocaleString();
}

export default function CommentItem({
  comment,
  showDeleteButton = false,
  deleting = false,
  onDelete,
}: CommentItemProps) {
  async function handleDelete() {
    if (!onDelete || deleting) return;
    await onDelete(comment.id);
  }

  return (
    <article className="app-card comment-card" style={{ padding: 12, marginBottom: 12 }}>
      <p style={{ margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{comment.body}</p>

      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          fontSize: 14,
          color: '#666',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {comment.author.image ? (
            <img
              src={comment.author.image}
              alt={comment.author.username}
              style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1px solid #ccc',
              }}
            />
          )}
          <strong>{comment.author.username}</strong>
          <span>{formatCreatedAt(comment.createdAt)}</span>
        </div>

        {showDeleteButton && onDelete ? (
          <Button type="button" onClick={handleDelete} disabled={deleting} size="sm" variant="danger">
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        ) : null}
      </footer>
    </article>
  );
}
