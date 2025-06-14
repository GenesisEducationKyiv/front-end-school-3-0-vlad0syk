import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pipe } from '@mobily/ts-belt';
import { QueryParams } from '../types';

export function useFiltersState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const urlParams: Partial<QueryParams> = {};
    
    const page = searchParams.get('page');
    if (page) urlParams.page = parseInt(page, 10);
    
    const limit = searchParams.get('limit');
    if (limit) urlParams.limit = parseInt(limit, 10);
    
    const sort = searchParams.get('sort');
    if (sort) urlParams.sort = sort as QueryParams['sort'];
    
    const order = searchParams.get('order');
    if (order) urlParams.order = order as QueryParams['order'];
    
    const search = searchParams.get('search');
    if (search) urlParams.search = search;
    
    const genre = searchParams.get('genre');
    if (genre) urlParams.genre = genre;
    
    const artist = searchParams.get('artist');
    if (artist) urlParams.artist = artist;
    
    return urlParams;
  }, [searchParams]);

  const updateUrl = useCallback((newParams: Partial<QueryParams>) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          updated.delete(key);
        } else {
          updated.set(key, String(value));
        }
      });
      
      return updated;
    });
  }, [setSearchParams]);

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
    searchParams,
    
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