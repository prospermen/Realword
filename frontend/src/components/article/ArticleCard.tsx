import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { articleApi } from '../../api/article';
import { useAuthStore } from '../../store/authStore';
import type { Article } from '../../types/article';
import FavoriteButton from './FavoriteButton';

interface Props {
  article: Article;
  onArticleUpdated?: (article: Article) => void;
}

export default function ArticleCard({ article, onArticleUpdated }: Props) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [currentArticle, setCurrentArticle] = useState(article);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');

  useEffect(() => {
    setCurrentArticle(article);
  }, [article]);

  async function handleToggleFavorite() {
    if (currentArticle.isDraft) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      setFavoriteError('');

      const data = currentArticle.favorited
        ? await articleApi.unfavoriteArticle(currentArticle.slug)
        : await articleApi.favoriteArticle(currentArticle.slug);

      setCurrentArticle(data.article);
      onArticleUpdated?.(data.article);
    } catch {
      setFavoriteError('Failed to update favorite status');
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <article className="app-card article-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 className="article-card-title">
          <Link to={`/article/${currentArticle.slug}`}>{currentArticle.title}</Link>
        </h2>
        {currentArticle.isDraft ? <span className="status-pill">Draft</span> : null}
      </div>
      <p style={{ margin: '0 0 8px' }}>
        {currentArticle.description || (currentArticle.isDraft ? 'Draft description pending.' : '')}
      </p>

      <div className="article-card-meta">
        <small>
          By{' '}
          <Link to={`/profile/${currentArticle.author.username}`}>
            {currentArticle.author.username}
          </Link>
        </small>

        <FavoriteButton
          favorited={currentArticle.favorited}
          favoritesCount={currentArticle.favoritesCount}
          loading={favoriteLoading}
          disabled={currentArticle.isDraft}
          onToggle={handleToggleFavorite}
        />
      </div>

      {favoriteError ? <p className="inline-error">{favoriteError}</p> : null}

      {currentArticle.tagList.length > 0 ? (
        <div className="tag-row">
          {currentArticle.tagList.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
