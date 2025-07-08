import React from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TRACK_MUTATION } from '../../services/api/track';
import { CreateTrackDto, Track } from '../../types';

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
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Creating...' : 'Create Track'}
      {error && <span>Error!</span>}
    </button>
  );
}; 