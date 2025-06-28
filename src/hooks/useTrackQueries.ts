import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchTracks } from '../services/api/track';
import { fetchGenres } from '../services/api/genres';
import { Track, Genre, PaginatedResponse, QueryParams } from '../types';

export function useTrackQueries(queryParams: QueryParams) {
  const {
    data: tracksData,
    isLoading: isLoadingTracks,
    isError: isErrorTracks,
    error: errorTracks,
  } = useQuery<PaginatedResponse<Track>, Error>({
    queryKey: ['tracks', queryParams],
    queryFn: async () => {
      const result = await fetchTracks(queryParams);
      if (result.isOk()) {
        return result.value;
      } else {
        throw result.error;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const { 
    data: genres, 
    isLoading: isLoadingGenres, 
    isError: isErrorGenres, 
    error: errorGenres 
  } = useQuery<Genre[], Error>({
    queryKey: ['genres'],
    queryFn: async () => {
      const result = await fetchGenres();
      if (result.isOk()) {
        return result.value;
      } else {
        throw result.error;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  return {
    tracksData,
    isLoadingTracks,
    isErrorTracks,
    errorTracks,
    genres,
    isLoadingGenres,
    isErrorGenres,
    errorGenres
  };
} 