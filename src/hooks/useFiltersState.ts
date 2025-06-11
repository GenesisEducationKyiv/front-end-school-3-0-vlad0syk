import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { pipe } from '@mobily/ts-belt';
import { QueryParams } from '../types';
import { 
  useValidatedSearchParams, 
  mergeSearchParams 
} from './urlParamsPersistence';

export function useFiltersState() {
  const navigate = useNavigate();
  const { params, paramsUrl, isValid } = useValidatedSearchParams();

  const updateUrl = useCallback((newParams: Partial<QueryParams>) => {
    const updatedParams = mergeSearchParams(params, newParams);
    const newSearch = updatedParams.toString();
    
    if (newSearch !== paramsUrl.toString()) {
      navigate(`?${newSearch}`, { replace: true });
    }
  }, [navigate, params, paramsUrl]);

  const setPage = useCallback((page: number) => {
    updateUrl({ page });
  }, [updateUrl]);

  const setLimit = useCallback((limit: number) => {
    updateUrl({ limit, page: 1 });
  }, [updateUrl]);

  const setSort = useCallback((sort: QueryParams['sort']) => {
    updateUrl({ sort });
  }, [updateUrl]);

  const setOrder = useCallback((order: QueryParams['order']) => {
    updateUrl({ order });
  }, [updateUrl]);

  const setSearch = useCallback((search: string | undefined) => {
    updateUrl({ search, page: 1 });
  }, [updateUrl]);

  const setGenre = useCallback((genre: string | undefined) => {
    updateUrl({ genre, page: 1 });
  }, [updateUrl]);

  const setArtist = useCallback((artist: string | undefined) => {
    updateUrl({ artist, page: 1 });
  }, [updateUrl]);

  const setSortAndOrder = useCallback((
    sort: QueryParams['sort'], 
    order: QueryParams['order']
  ) => {
    updateUrl({ sort, order });
  }, [updateUrl]);

  const clearFilters = useCallback(() => {
    updateUrl({
      search: undefined,
      genre: undefined,
      artist: undefined,
      sort: undefined,
      order: undefined,
      page: 1
    });
  }, [updateUrl]);

  const resetPagination = useCallback(() => {
    updateUrl({ page: 1 });
  }, [updateUrl]);

  const updateFilters = useCallback((updates: Partial<QueryParams>) => {
    updateUrl(updates);
  }, [updateUrl]);

  const hasActiveFilters = useMemo(() => {
    return !!(params.search || params.genre || params.artist || params.sort);
  }, [params.search, params.genre, params.artist, params.sort]);

  const apiParams = useMemo(() => {
    return pipe(
      params,
      (p) => ({
        ...p,
        page: p.page || 1,
        limit: p.limit || 10
      })
    );
  }, [params]);

  return {
    params: apiParams,
    paramsUrl,
    isValid,
    
    setPage,
    setLimit,
    setSort,
    setOrder,
    setSearch,
    setGenre,
    setArtist,
    
    setSortAndOrder,
    updateFilters,
    
    clearFilters,
    resetPagination,
    
    hasActiveFilters
  };
}

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