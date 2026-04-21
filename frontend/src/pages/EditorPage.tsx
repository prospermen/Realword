import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articleApi } from '../api/article';
import Button from '../components/common/Button';
import ErrorState from '../components/common/ErrorState';
import FormErrorList from '../components/common/FormErrorList';
import FormNotice from '../components/common/FormNotice';
import Input from '../components/common/Input';
import PageHeader from '../components/common/PageHeader';
import { useFormFeedback } from '../hooks/useFormFeedback';
import { parseApiErrorMessage } from '../utils/error';

type SubmitMode = 'publish' | 'draft';

export default function EditorPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const isEditMode = Boolean(slug);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const { errors, notice, clearFeedback, setApiErrors, setSuccess } = useFormFeedback();

  useEffect(() => {
    const currentSlug = slug;
    if (!currentSlug) return;

    async function fetchArticle(targetSlug: string) {
      try {
        setLoadError('');
        const data = await articleApi.getArticle(targetSlug);
        setTitle(data.article.title);
        setDescription(data.article.description);
        setBody(data.article.body);
        setTagInput(data.article.tagList.join(','));
        setIsDraft(data.article.isDraft);
      } catch (error) {
        setLoadError(parseApiErrorMessage(error, 'Failed to load article'));
      }
    }

    fetchArticle(currentSlug);
  }, [slug]);

  async function handleSubmit(mode: SubmitMode) {
    clearFeedback();

    const payload = {
      title,
      description,
      body,
      isDraft: mode === 'draft',
      tagList: tagInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      setLoading(true);

      if (isEditMode && slug) {
        const data = await articleApi.updateArticle(slug, payload);

        if (mode === 'draft') {
          setIsDraft(true);
          setSuccess('Draft saved.');
          navigate(`/editor/${data.article.slug}`, { replace: true });
        } else {
          navigate(`/article/${data.article.slug}`);
        }
      } else {
        const data = await articleApi.createArticle(payload);

        if (mode === 'draft') {
          setIsDraft(true);
          setSuccess('Draft created.');
          navigate(`/editor/${data.article.slug}`, { replace: true });
        } else {
          navigate(`/article/${data.article.slug}`);
        }
      }
    } catch (error) {
      setApiErrors(error, 'Failed to save article');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 720 }}>
      <PageHeader
        title={isEditMode ? 'Edit Article' : 'New Article'}
        description="Build a draft, then publish when the story is ready."
      />

      {loadError ? (
        <div style={{ marginBottom: 12 }}>
          <ErrorState message={loadError} />
        </div>
      ) : null}

      <div className="app-card" style={{ padding: 16, marginBottom: 16, background: 'var(--app-surface-soft)' }}>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <strong>{isDraft ? 'Draft mode' : 'Ready to publish'}</strong>
            <p style={{ margin: '6px 0 0', color: 'var(--app-muted)' }}>
              Drafts can be incomplete. Publishing requires a title, description, and body.
            </p>
          </div>
          {isDraft ? <span className="status-pill">Private draft</span> : <span className="status-pill">Publishable</span>}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit('publish');
        }}
        className="form-stack"
      >
        <Input
          type="text"
          placeholder="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="text"
          placeholder="What's this article about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          className="app-textarea"
          placeholder="Write your article..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
        />

        <Input
          type="text"
          placeholder="Enter tags separated by commas"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />

        <div className="form-feedback-stack">
          <FormNotice message={notice} title="Saved" variant="success" />
          <FormErrorList errors={errors} title="Unable to save article:" />
        </div>

        <div className="form-actions">
          <Button
            type="button"
            disabled={loading}
            variant="secondary"
            onClick={() => handleSubmit('draft')}
          >
            {loading ? 'Saving...' : isEditMode ? 'Save Draft' : 'Create Draft'}
          </Button>
          <Button type="submit" disabled={loading} variant="primary">
            {loading ? 'Saving...' : isEditMode ? 'Publish Changes' : 'Publish Article'}
          </Button>
        </div>
      </form>
    </section>
  );
}
