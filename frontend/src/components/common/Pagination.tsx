interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

function createRange(start: number, end: number) {
  const result: number[] = [];
  for (let page = start; page <= end; page += 1) {
    result.push(page);
  }
  return result;
}

function getVisiblePages(currentPage: number, totalPages: number, maxVisiblePages: number) {
  if (totalPages <= maxVisiblePages) return createRange(1, totalPages);

  const innerSlots = maxVisiblePages - 2;
  const half = Math.floor(innerSlots / 2);

  let start = Math.max(2, currentPage - half);
  const end = Math.min(totalPages - 1, start + innerSlots - 1);

  if (end - start + 1 < innerSlots) {
    start = Math.max(2, end - innerSlots + 1);
  }

  const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [1];

  if (start > 2) pages.push('ellipsis-left');
  pages.push(...createRange(start, end));
  if (end < totalPages - 1) pages.push('ellipsis-right');

  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 7,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  return (
    <nav aria-label="Pagination" className="pagination">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="app-btn app-btn-secondary app-btn-sm"
      >
        Prev
      </button>

      {pages.map((item) => {
        if (typeof item !== 'number') {
          return (
            <span key={item} style={{ padding: '6px 4px', color: '#666' }}>
              ...
            </span>
          );
        }

        const isActive = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`app-btn app-btn-sm ${isActive ? 'app-btn-primary' : 'app-btn-secondary'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="app-btn app-btn-secondary app-btn-sm"
      >
        Next
      </button>
    </nav>
  );
}
