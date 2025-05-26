import React, { useRef, useState, useEffect } from 'react';
import { Track } from '../../types';

import { toast } from 'react-toastify';


// Base URL for static files (should match your backend configuration)
const API_BASE_URL = 'http://localhost:8000';

// Props for the TrackItem component
interface TrackItemProps {
    track: Track;
    isSelected: boolean; // Is this track selected for bulk operations
    onSelect: (id: Track['id']) => void; // Handler for selecting/deselecting the track
    onEdit: (id: Track['id']) => void; // Handler for editing the track
    onDelete: (id: Track['id']) => void; // Handler for deleting the track (opens dialog in App.tsx)
    testId: string; // Data-testid attribute for testing
    // Handlers for file operations and playback (passed from App.tsx)
    onUploadFile: (id: Track['id'], file: File) => Promise<void>; // Handler for initiating file upload
    onDeleteFileWithConfirmation: (id: Track['id']) => void; // Handler for file deletion (opens dialog in App.tsx)
    playingTrackId: Track['id'] | null; // ID of the currently playing track (controlled in App.tsx)
    onPlayToggle: (id: Track['id']) => void; // Handler for toggling playback of this track
}

const TrackItem: React.FC<TrackItemProps> = ({
    track,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    testId,
    onUploadFile,
    onDeleteFileWithConfirmation,
    playingTrackId,
    onPlayToggle,
}) => {
    // Determine if this specific track is currently playing
    const isPlaying = playingTrackId === track.id;

    // Refs for DOM elements
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
    const audioRef = useRef<HTMLAudioElement>(null); // Ref for the audio element

    // State for UI elements and processes
    const [uploading, setUploading] = useState(false); // Indicates if a file upload is in progress
    const [audioProgress, setAudioProgress] = useState(0); // Playback progress (0-100%)

    // --- Effects ---

    // Effect to control audio playback based on the isPlaying prop
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            if (isPlaying) {
                audio.play().catch(error => console.error(`Playback error for track ${track.id}:`, error));
            } else {
                audio.pause();
            }
        }
    }, [isPlaying]); // Re-run effect when isPlaying changes

    // Effect to reset audio progress when track or audio file changes
     useEffect(() => {
          const audio = audioRef.current;
          if (audio) {
              const handleLoadedMetadata = () => {
                  setAudioProgress(0); // Reset progress when metadata is loaded
              };
              // Add event listener for loadedmetadata
              audio.addEventListener('loadedmetadata', handleLoadedMetadata);

               // Reset progress initially or when track/file changes
               setAudioProgress(0);

              return () => {
                  audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
              };
          }
     }, [track.id, track.audioFile]); // Re-run effect when track ID or audioFile path changes


    // --- Event Handlers ---

    // Handle change event on the checkbox (for bulk selection)
    const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelect(track.id);
    };

    // Handle click on the Edit button
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent click from bubbling to the parent div
        onEdit(track.id); // Call the edit handler from App.tsx
    };

    // Handle click on the Delete Track button
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent click from bubbling
        onDelete(track.id); // Call the delete track handler from App.tsx (opens dialog)
    };

    // Handle click on the Upload File button
     const handleUploadButtonClick = (e: React.MouseEvent) => {
         e.stopPropagation(); // Prevent click from bubbling
         fileInputRef.current?.click(); // Trigger click on the hidden file input
     };

    // Handle file selection from the hidden input
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Client-side file validation
            const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/x-wav'];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!allowedTypes.includes(file.type)) {
                 toast.error('Invalid file type. Only MP3, WAV, OGG allowed.');
                 e.target.value = ''; // Clear input value
                 return;
            }
             if (file.size > maxSize) {
                 toast.error('File size exceeds 10MB limit.');
                 e.target.value = ''; // Clear input value
                 return;
             }

            setUploading(true); // Set uploading state for UI feedback
            try {
                await onUploadFile(track.id, file); // Call the upload handler from App.tsx
            } catch (error) {
                console.error("Upload failed:", error);
                // Error toast is handled in App.tsx mutation onError
            } finally {
                setUploading(false); // Reset uploading state
                e.target.value = ''; // Clear input value after attempt
            }
        }
    };

    // Handle click on the Delete File button (opens confirmation dialog)
    const handleDeleteFileClick = (e: React.MouseEvent) => {
         e.stopPropagation(); // Prevent click from bubbling
         // Call handler from App.tsx to open the file deletion dialog
         onDeleteFileWithConfirmation(track.id);
     };

    // Handle click on the Play/Pause button
    const handlePlayPauseClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent click from bubbling
        onPlayToggle(track.id); // Call play toggle handler from App.tsx
    };

    // Handle time update event on the audio element (for progress bar)
     const handleTimeUpdate = () => {
          if (audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
              const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
              setAudioProgress(progress);
          } else {
              setAudioProgress(0);
          }
     };

     // Handle audio ended event on the audio element
      const handleAudioEnded = () => {
           onPlayToggle(track.id); // Notify App.tsx that playback ended
           setAudioProgress(0); // Reset progress
      };


    // --- Rendering ---

    // Determine if any file operation managed by TrackItem (currently only upload) is in progress
    // File deletion state is managed by the dialog's isConfirming state in App.tsx
    const isFileOperationInProgress = uploading;

    return (
        // Main container for the track item
        <div
            data-testid={testId} // For testing
            className={`
                relative
                bg-gray-800 rounded-lg shadow-lg p-3
                border-2
                ${isSelected ? 'border-blue-500' : 'border-transparent'}
                hover:bg-gray-700 transition-colors duration-150
                ${isFileOperationInProgress ? 'opacity-60 pointer-events-none' : 'cursor-pointer'} // Dim and disable interactions during file upload
                flex flex-col items-center
            `}
            // Handle click on the whole item for selection
            onClick={() => onSelect(track.id)}
        >
            {/* Checkbox for track selection */}
            <input
                type="checkbox"
                data-testid={`track-checkbox-${track.id}`} // For testing
                checked={isSelected}
                onChange={handleSelectChange}
                onClick={(e) => e.stopPropagation()} // Prevent click on checkbox from selecting item div
                className="absolute top-2 left-2 h-5 w-5 rounded text-blue-600 bg-gray-700 border-gray-500 focus:ring-blue-500 z-10"
                disabled={isFileOperationInProgress} // Disabled during file upload
            />

            {/* Edit/Delete Track buttons */}
            <div className="absolute top-2 right-2 flex space-x-1 z-10">
                <button
                    data-testid={`edit-track-${track.id}`} // For testing
                    onClick={handleEditClick} // Edit track handler
                    className="p-1 rounded-full bg-gray-600 hover:bg-blue-600 text-white transition-colors"
                    aria-label="Edit track"
                    disabled={isFileOperationInProgress} // Disabled during file upload
                >
                    {/* Icon */}
                    <img src="/pencil.svg" alt="Edit icon" className="h-4 w-4" />
                </button>
                <button
                    data-testid={`delete-track-${track.id}`} // For testing
                    onClick={handleDeleteClick} // Delete track handler (opens dialog)
                    className="p-1 rounded-full bg-gray-600 hover:bg-red-600 text-white transition-colors"
                    aria-label="Delete track"
                     disabled={isFileOperationInProgress} // Disabled during file upload
                >
                    {/* Icon */}
                    <img src="/trash.svg" alt="Delete icon" className="h-4 w-4" />
                </button>
            </div>

            {/* Cover image or placeholder */}
             <div className="w-full mb-2">
                 {track.coverImage ? (
                     <img
                         src={track.coverImage}
                         alt={`${track.title} cover`}
                         className="w-full aspect-square object-cover rounded"
                         onError={(e) => {
                             e.currentTarget.style.display = 'none'; // Hide broken image
                             console.error(`Failed to load image for track ${track.id}: ${track.coverImage}`);
                         }}
                     />
                 ) : (
                      // Placeholder if no cover image
                      <div className="w-full aspect-square bg-gray-700 flex items-center justify-center rounded">
                          {/* Music icon */}
                          <img src="/music.svg" alt="Music icon" className="h-10 w-10 text-gray-400" />
                      </div>
                 )}
             </div>

            {/* Track Title */}
            <h3
                data-testid={`track-item-${track.id}-title`} // For testing
                className="font-semibold text-base text-white text-center truncate w-full"
                title={track.title} // Show full title on hover
            >
                {track.title}
            </h3>

            {/* Artist Name */}
            <p
                data-testid={`track-item-${track.id}-artist`} // For testing
                className="text-sm text-gray-400 text-center truncate w-full"
                 title={track.artist} // Show full artist name on hover
            >
                {track.artist}
            </p>

            {/* --- File Operations and Audio Player --- */}
            <div className="mt-3 w-full flex flex-col items-center gap-2">
                {/* Audio element (hidden) - source from backend static files */}
                 {track.audioFile && (
                     <audio
                         ref={audioRef} // Attach ref
                         // Source URL for the audio file
                         src={`${API_BASE_URL}/api/files/${track.audioFile}`} // Make sure this URL is correct!
                         onTimeUpdate={handleTimeUpdate} // Update progress
                         onEnded={handleAudioEnded} // Handle playback end
                         // controls // Uncomment for browser's default controls (for debugging)
                     ></audio>
                 )}

                {track.audioFile ? (
                    // If audio file exists, show player controls
                    <div data-testid={`audio-player-${track.id}`} className="w-full flex flex-col items-center gap-2">
                        {/* Play/Pause button */}
                        <button
                             data-testid={isPlaying ? `pause-button-${track.id}` : `play-button-${track.id}`} // For testing
                             onClick={handlePlayPauseClick} // Play/pause handler
                            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                            disabled={isFileOperationInProgress} // Disabled during file upload
                            aria-label={isPlaying ? 'Pause track' : 'Play track'}
                        >
                            {/* Icon changes based on isPlaying state */}
                            {isPlaying ? (
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                 </svg>
                            ) : (
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                 </svg>
                            )}
                        </button>

                        {/* Audio progress bar */}
                         <div data-testid={`audio-progress-${track.id}`} className="w-full bg-gray-600 rounded-full h-1.5 dark:bg-gray-700">
                             <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${audioProgress}%` }}></div>
                         </div>

                        {/* Button to delete the audio file */}
                        <button
                             onClick={handleDeleteFileClick} // Handler to delete file (opens dialog)
                             className="text-sm text-red-400 hover:text-red-500 disabled:opacity-50"
                             disabled={isFileOperationInProgress} // Disabled during file upload
                             aria-label="Remove audio file"
                         >
                             Видалити файл
                        </button>
                    </div>
                ) : (
                    // If audio file is missing, show the upload button
                    <div className="w-full">
                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef} // Attach ref
                            className="hidden"
                            onChange={handleFileUpload} // Handles file selection and upload
                             accept="audio/*" // Accept audio files
                             disabled={isFileOperationInProgress} // Disabled during upload
                        />
                        {/* Button that triggers the hidden file input */}
                        <button
                            data-testid={`upload-track-${track.id}`} // For testing
                            onClick={handleUploadButtonClick} // Triggers file input click
                            className="w-full px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                             disabled={isFileOperationInProgress} // Disabled during upload
                             data-loading={uploading ? 'true' : 'false'} // Loading indicator attribute
                             aria-disabled={uploading ? 'true' : 'false'} // Accessibility attribute
                        >
                             {/* Button text changes during upload */}
                             {uploading ? (
                                 'Завантаження...'
                             ) : (
                                 <>
                                    {/* Upload icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Завантажити файл
                                 </>
                             )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrackItem;