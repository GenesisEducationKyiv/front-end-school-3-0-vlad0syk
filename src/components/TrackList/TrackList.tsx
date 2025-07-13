import React, { memo } from 'react';
import TrackItem from '../TrackItem/TrackItem';
import { Track } from '../../types';

interface TrackListProps {
  tracks: Track[];
  isLoading: boolean;
}

const TrackList: React.FC<TrackListProps> = memo(({
  tracks,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div data-testid="loading-tracks" className="text-center text-gray-400 py-10">
        Завантаження треків...
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        Треків не знайдено.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {tracks.map((track) => (
        <TrackItem
          key={track.id}
          track={track}
          testId={`track-item-${track.id}`}
        />
      ))}
    </div>
  );
});

TrackList.displayName = 'TrackList';

export default TrackList;