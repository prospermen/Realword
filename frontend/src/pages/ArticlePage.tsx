import { Link, useNavigate, useParams } from 'react-router-dom';
import ArticleMetaActions from '../components/article/ArticleMetaActions';
import CommentForm from '../components/comment/CommentForm';
import CommentList from '../components/comment/CommentList';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Spinner from '../components/common/Spinner';
import { useAuthStore } from '../store/authStore';
import { useArticleDetail } from '../features/article/useArticleDetail';
import { useComments } from '../features/comment/useComments';
import type { Comment } from '../types/comment';

export default function ArticlePage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    article,
    loading,
    error,
    retryArticle,
    isOwner,
    favoriteLoading,
    followLoading,
    deletingArticle,
    actionError,
    toggleFavorite,
    toggleFollow,
    deleteArticle,
  } = useArticleDetail({
    slug,
    currentUsername: currentUser?.username,
    isAuthenticated,
    onAuthRequired: () => navigate('/login'),
    onDeleted: () => navigate('/'),
  });

  const {
    comments,
    commentsLoading,
    commentsError,
    deletingCommentId,
    retryComments,
    prependComment,
    removeComment,
  } = useComments(slug);

  function canDeleteComment(comment: Comment) {
    return Boolean(currentUser && comment.author.username === currentUser.username);
  }

  if (loading) return <Spinner />;
  if (error) {
    return <ErrorState message={error} onRetry={retryArticle} />;
  }
  if (!article) return <EmptyState title="Article not found." />;

  return (
    <section>
      <article className="app-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h1>{article.title}</h1>
          {article.isDraft ? <span className="status-pill">Draft</span> : null}
        </div>
        <p>{article.description || (article.isDraft ? 'This draft is not ready for readers yet.' : '')}</p>
        <p style={{ color: 'var(--app-muted)' }}>
          By <Link to={`/profile/${article.author.username}`}>{article.author.username}</Link>
        </p>

        <ArticleMetaActions
          article={article}
          isOwner={isOwner}
          favoriteLoading={favoriteLoading}
          followLoading={followLoading}
          deletingArticle={deletingArticle}
          onToggleFavorite={toggleFavorite}
          onToggleFollow={toggleFollow}
          onEditArticle={() => navigate(`/editor/${article.slug}`)}
          onDeleteArticle={deleteArticle}
        />

        {actionError ? <ErrorState message={actionError} /> : null}

        <div style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
          {article.body || (article.isDraft ? 'Draft body is still empty.' : '')}
        </div>

        {article.tagList.length > 0 ? (
          <div className="tag-row" style={{ marginTop: 16 }}>
            {article.tagList.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: 16, color: 'var(--app-muted)' }}>No tags</p>
        )}
      </article>

      <section className="app-card" style={{ marginTop: 20, padding: 20 }}>
        <h2>Comments</h2>

        {isAuthenticated ? (
          <CommentForm slug={article.slug} onSuccess={prependComment} />
        ) : (
          <p>
            <Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add
            comments.
          </p>
        )}

        {commentsLoading ? (
          <Spinner />
        ) : (
          <CommentList
            comments={comments}
            error={commentsError}
            emptyText="No comments yet."
            deletingCommentId={deletingCommentId}
            onDeleteComment={removeComment}
            canDeleteComment={canDeleteComment}
            onRetry={retryComments}
          />
        )}
      </section>
    </section>
  );
}
