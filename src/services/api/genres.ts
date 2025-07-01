import { gql } from '@apollo/client';
import { apolloClient } from '../../lib/apollo-client';
import { Genre } from '../../types';

export const GENRES_QUERY = gql`
  query Genres {
    genres
  }
`;

export const fetchGenres = async (): Promise<Genre[]> => {
  const { data } = await apolloClient.query<{ genres: Genre[] }>({
    query: GENRES_QUERY,
    fetchPolicy: 'network-only',
  });
  return data.genres;
};