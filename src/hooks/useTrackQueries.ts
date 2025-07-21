import { useQuery } from '@apollo/client';
import { TRACKS_QUERY } from '../services/api/track';
import { GENRES_QUERY } from '../services/api/genres';
import { QueryParams } from '../types';

export function useTracksQuery(params: QueryParams) {
  const { page, limit, sort, order, search, genre, artist } = params;
  
  const variables = {
    page: page || 1,
    limit: limit || 10,
    sort,
    order,
    search,
    genre,
    artist,
  };
  
  return useQuery(TRACKS_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network'
  });
}

export function useGenresQuery() {
  return useQuery(GENRES_QUERY, {
    fetchPolicy: 'network-only'
  });
} 