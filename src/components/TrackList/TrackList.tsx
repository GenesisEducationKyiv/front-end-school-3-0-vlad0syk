import React from 'react';
import TrackItem from '../TrackItem/TrackItem';
import {Track} from '../../types'; // Ensure Track is imported

// Props for the TrackList component
interface TrackListProps {
    tracks: Track[]; // Array of tracks to display
    isLoading: boolean; // Indicates if the track data is currently loading
    selectedTrackIds: Set<Track['id']>; // Set of IDs for selected tracks
    onSelectTrack: (id: Track['id']) => void; // Handler for selecting/deselecting a single track
    onEditTrack: (id: Track['id']) => void; // Handler for editing a track
    onDeleteTrack: (id: Track['id']) => void; // Handler for deleting a track (opens dialog in App.tsx)
    onUploadFile: (id: Track['id'], file: File) => Promise<void>; // Handler for initiating file upload
    onDeleteFileWithConfirmation: (id: Track['id']) => void; // Handler for file deletion (opens dialog in App.tsx)
    playingTrackId: Track['id'] | null; // ID of the currently playing track
    onPlayToggle: (id: Track['id']) => void; // Handler for toggling playback
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
    // Show loading indicator while tracks are loading
    if (isLoading) {
      return (
        <div data-testid="loading-tracks" className="text-center text-gray-400 py-10">
          Завантаження треків...
        </div>
      );
    }

    // Show message if no tracks are found after loading
    if (tracks.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          Треків не знайдено.
        </div>
      );
    }

    // Render the grid of track items
    return (
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" // Responsive grid layout
      >
        {/* Map over the tracks array and render a TrackItem for each track */}
        {tracks.map((track) => (
          <TrackItem
            key={track.id} // Unique key for each item
            track={track} // Pass the track data
            isSelected={selectedTrackIds.has(track.id)} // Check if the track is selected
            onSelect={onSelectTrack} // Pass select handler
            onEdit={onEditTrack} // Pass edit handler
            onDelete={onDeleteTrack} // Pass delete track handler
            onUploadFile={onUploadFile} // Pass upload file handler
            onDeleteFileWithConfirmation={onDeleteFileWithConfirmation} // Pass delete file handler with confirmation
            playingTrackId={playingTrackId} // Pass ID of playing track
            onPlayToggle={onPlayToggle} // Pass play toggle handler
            testId={`track-item-${track.id}`} // Pass data-testid for testing
          />
        ))}
      </div>
    );
};

export default TrackList;