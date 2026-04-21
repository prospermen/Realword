import ArticleCard from './ArticleCard';
import Spinner from '../common/Spinner';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import type { Article } from '../../types/article';
import type { CSSProperties } from 'react';

interface ArticleListProps {
  articles: Article[];
  loading?: boolean;
  error?: string;
  emptyText?: string;
  emptyDescription?: string;
  onRetry?: () => void | Promise<void>;
  onArticleUpdated?: (article: Article) => void;
  title?: string;
  description?: string;
  showCount?: boolean;
  contentStyle?: CSSProperties;
}

export default function ArticleList({
  articles,
  loading = false,
  error = '',
  emptyText = 'No articles found.',
  emptyDescription = '',
  onRetry,
  onArticleUpdated,
  title = '',
  description = '',
  showCount = false,
  contentStyle,
}: ArticleListProps) {
  const hasHeader = Boolean(title || description || showCount);

  return (
    <section>
      {hasHeader ? (
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            {title ? <h2 style={{ margin: '0 0 4px', fontSize: 22 }}>{title}</h2> : null}
            {description ? <p style={{ margin: 0, color: '#6b7280' }}>{description}</p> : null}
          </div>

          {showCount ? (
            <span className="status-pill">
              {articles.length} article{articles.length === 1 ? '' : 's'}
            </span>
          ) : null}
        </header>
      ) : null}

      {loading ? <Spinner /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={onRetry} /> : null}
      {!loading && !error && articles.length === 0 ? (
        <EmptyState title={emptyText} description={emptyDescription} />
      ) : null}

      {!loading && !error && articles.length > 0 ? (
        <div style={contentStyle}>
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} onArticleUpdated={onArticleUpdated} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
