import { useState } from 'react';

export function usePagination(initialPage = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  function resetPage() {
    setCurrentPage(initialPage);
  }

  return {
    currentPage,
    setCurrentPage,
    resetPage,
  };
}
