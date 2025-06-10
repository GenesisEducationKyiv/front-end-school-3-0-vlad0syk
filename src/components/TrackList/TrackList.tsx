import React from 'react';
import TrackItem from '../TrackItem/TrackItem';
import {Track} from '../../types';

interface TrackListProps {
    tracks: Track[];
    isLoading: boolean;
    selectedTrackIds: Set<Track['id']>;
    onSelectTrack: (id: Track['id']) => void;
    onEditTrack: (id: Track['id']) => void;
    onDeleteTrack: (id: Track['id']) => void;
    onUploadFile: (id: Track['id'], file: File) => Promise<void>;
    onDeleteFileWithConfirmation: (id: Track['id']) => void;
    playingTrackId: Track['id'] | null;
    onPlayToggle: (id: Track['id']) => void;
}

const TrackList: React.FC<TrackListProps> = ({
    tracks,
    isLoading,
    selectedTrackIds,
    onSelectTrack,
    onEditTrack,
    onDeleteTrack,
    onUploadFile,
    onDeleteFileWithConfirmation,
    playingTrackId,
    onPlayToggle,
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
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        {tracks.map((track) => (
          <TrackItem
            key={track.id}
            track={track}
            isSelected={selectedTrackIds.has(track.id)}
            onSelect={onSelectTrack}
            onEdit={onEditTrack}
            onDelete={onDeleteTrack}
            onUploadFile={onUploadFile}
            onDeleteFileWithConfirmation={onDeleteFileWithConfirmation}
            playingTrackId={playingTrackId}
            onPlayToggle={onPlayToggle}
            testId={`track-item-${track.id}`}
          />
        ))}
      </div>
    );
};

export default TrackList;