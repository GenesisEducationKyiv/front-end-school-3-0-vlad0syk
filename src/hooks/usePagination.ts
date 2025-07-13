import { useCallback } from 'react';
import { useFiltersState } from './useFiltersState';

export function usePagination() {
  const { params, setPage, setLimit } = useFiltersState();
  
  const goToNextPage = useCallback(() => {
    setPage((params.page || 1) + 1);
  }, [params.page, setPage]);
  
  const goToPrevPage = useCallback(() => {
    const currentPage = params.page || 1;
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  }, [params.page, setPage]);
  
  const goToPage = useCallback((page: number) => {
    if (page > 0) {
      setPage(page);
    }
  }, [setPage]);

  return {
    currentPage: params.page || 1,
    limit: params.limit || 10,
    setPage: goToPage,
    setLimit,
    goToNextPage,
    goToPrevPage,
    canGoPrev: (params.page || 1) > 1
  };
}