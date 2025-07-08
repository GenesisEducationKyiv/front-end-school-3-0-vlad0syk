import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { CreateTrackDto, Track } from '../../types';

const CREATE_TRACK_MUTATION = gql`
  mutation CreateTrack($input: CreateTrackInput!) {
    createTrack(input: $input) {
      id
      title
      artist
      album
      genres
      slug
      coverImage
      audioFile
      createdAt
      updatedAt
    }
  }
`;

export const CreateTrackButton: React.FC = () => {
  const [createTrack, { loading, error }] = useMutation<{ createTrack: Track }, { input: CreateTrackDto }>(CREATE_TRACK_MUTATION);

  const handleCreate = async () => {
    await createTrack({
      variables: {
        input: {
          title: 'New Track',
          artist: 'Artist Name',
          genres: ['Rock'],
          album: 'New Album'
        }
      },
      refetchQueries: ['Tracks'],
    });
    // Optionally refetch queries or update cache
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Creating...' : 'Create Track'}
      {error && <span>Error!</span>}
    </button>
  );
}; 