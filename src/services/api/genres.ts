import { gql } from '@apollo/client';
import { Genre } from '../../types';

export const GENRES_QUERY = gql`
  query Genres {
    genres
  }
`;