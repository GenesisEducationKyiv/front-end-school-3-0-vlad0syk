import React, { useState } from 'react';
import { createTrack } from '../../services/api/track';
import { CreateTrackDto } from '../../types';

export const CreateTrackButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    const newTrack: CreateTrackDto = {
      title: 'New Track',
      artist: 'Artist Name',
      genres: ['Rock'],
      album: 'New Album',
    };
    const result = await createTrack(newTrack);
    setLoading(false);
    if (result.isErr()) {
      setError('Error!');
    }

  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? 'Creating...' : 'Create Track'}
      {error && <span>{error}</span>}
    </button>
  );
}; 