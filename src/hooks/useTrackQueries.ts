import { useQuery } from '@apollo/client';
import { TRACKS_QUERY } from '../services/api/track';
import { GENRES_QUERY } from '../services/api/genres';
import { QueryParams } from '../types';

export function useTracksQuery(params: QueryParams) {
  // Формуємо sort і filters для GraphQL
  const { page, limit, sort, order, search, genre, artist } = params;
  const filters: any = {};
  if (search) filters.search = search;
  if (genre) filters.genre = genre;
  if (artist) filters.artist = artist;
  const variables: any = {
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