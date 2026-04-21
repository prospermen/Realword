import Spinner from '../common/Spinner';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';

interface TagListProps {
  tags: string[];
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
  loading?: boolean;
  error?: string;
  title?: string;
  emptyText?: string;
  showAllOption?: boolean;
}

export default function TagList({
  tags,
  selectedTag = null,
  onSelectTag,
  loading = false,
  error = '',
  title = 'Popular Tags',
  emptyText = 'No tags found.',
  showAllOption = true,
}: TagListProps) {
  function handleSelect(tag: string | null) {
    onSelectTag?.(tag);
  }

  return (
    <section>
      <h3 style={{ margin: '0 0 12px' }}>{title}</h3>

      {loading ? (
        <Spinner label="Loading tags..." minHeight={64} />
      ) : error ? (
        <ErrorState message={error} />
      ) : tags.length === 0 ? (
        <EmptyState title={emptyText} />
      ) : (
        <div className="tag-row">
          {showAllOption ? (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`tab-button ${selectedTag === null ? 'active' : ''}`}
            >
              All
            </button>
          ) : null}

          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleSelect(tag)}
              className={`tab-button ${selectedTag === tag ? 'active' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
