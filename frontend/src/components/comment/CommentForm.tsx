import { useState } from 'react';
import { commentApi } from '../../api/comment';
import type { Comment } from '../../types/comment';
import Button from '../common/Button';
import FormErrorList from '../common/FormErrorList';
import { useFormFeedback } from '../../hooks/useFormFeedback';

interface CommentFormProps {
  slug: string;
  placeholder?: string;
  submitText?: string;
  onSuccess?: (comment: Comment) => void;
}

export default function CommentForm({
  slug,
  placeholder = 'Write a comment...',
  submitText = 'Post Comment',
  onSuccess,
}: CommentFormProps) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { errors, clearErrors, setErrorMessages, setApiErrors } = useFormFeedback();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    const nextBody = body.trim();
    if (!nextBody) {
      setErrorMessages(['Comment cannot be empty']);
      return;
    }

    try {
      setSubmitting(true);
      const data = await commentApi.publishComment(slug, nextBody);
      setBody('');
      onSuccess?.(data.comment);
    } catch (error) {
      setApiErrors(error, 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-stack" style={{ marginBottom: 16 }}>
      <textarea
        className="app-textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{ resize: 'vertical' }}
      />

      <div className="form-feedback-stack">
        <FormErrorList errors={errors} title="Could not post comment:" />
      </div>

      <div className="form-actions">
        <Button type="submit" disabled={submitting} variant="primary">
          {submitting ? 'Posting...' : submitText}
        </Button>
      </div>
    </form>
  );
}
