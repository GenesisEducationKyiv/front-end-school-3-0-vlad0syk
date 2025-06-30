import { useQuery } from '@apollo/client';
import { TRACKS_QUERY } from '../services/api/track';
import { GENRES_QUERY } from '../services/api/genres';
import { QueryParams } from '../types';

export function useTracksQuery(params: QueryParams) {
  // Формуємо sort і filters для GraphQL
  const { page, limit, sort, order, search, genre, artist } = params;
  const variables: any = {
    page,
    limit,
    sort: sort && order ? { field: sort.toUpperCase(), order: order.toUpperCase() } : undefined,
    filters: (search || genre || artist) ? { search, genre, artist } : undefined,
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