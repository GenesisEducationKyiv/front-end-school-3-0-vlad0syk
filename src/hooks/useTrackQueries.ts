import { useQuery } from '@apollo/client';
import { TRACKS_QUERY } from '../services/api/track';
import { GENRES_QUERY } from '../services/api/genres';
import { QueryParams } from '../types';

// Тип для фільтрів пошуку
interface SearchFilters {
  search?: string;
  genre?: string;
  artist?: string;
}

interface TracksQueryVariables {
  page?: number;
  limit?: number;
  sort?: { field: string; order: string };
  filters?: SearchFilters;
}

export function useTracksQuery(params: QueryParams) {
  // Формуємо sort і filters для GraphQL
  const { page, limit, sort, order, search, genre, artist } = params;
  const filters: SearchFilters = {};
  if (search) filters.search = search;
  if (genre) filters.genre = genre;
  if (artist) filters.artist = artist;
  const variables: TracksQueryVariables = {
    page,
    limit,
    sort: sort && order ? { field: sort.toUpperCase(), order: order.toUpperCase() } : undefined,
    ...(Object.keys(filters).length > 0 ? { filters } : {}),
  };
  return useQuery(TRACKS_QUERY, {
    variables,
    fetchPolicy: 'network-only'
  });
}

export function useGenresQuery() {
  return useQuery(GENRES_QUERY, {
    fetchPolicy: 'network-only'
  });
} 