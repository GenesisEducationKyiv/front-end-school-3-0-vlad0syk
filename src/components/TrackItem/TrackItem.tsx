import React, { useRef, memo } from 'react';
import { Track } from '../../types';
import { useFileUpload } from '../../lib/useFileUpload';
import { useAudioPlayer } from '../../lib/useAudioPlayer';
import { useTrackStore } from '../../stores/trackStore';
import { useUIStore } from '../../stores/uiStore';
import { useTrackActions } from '../../hooks/useTrackActions';

interface TrackItemProps {
    track: Track;
    testId?: string;
}

const TrackItem: React.FC<TrackItemProps> = memo(({ track, testId }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploading, uploadFile } = useFileUpload();
    
    const isTrackSelected = useTrackStore(state => state.isTrackSelected(track.id));
    const isTrackPlaying = useTrackStore(state => state.isTrackPlaying(track.id));
    const selectTrack = useTrackStore(state => state.selectTrack);
    const deselectTrack = useTrackStore(state => state.deselectTrack);
    const setPlayingTrack = useTrackStore(state => state.setPlayingTrack);
    const openEditModal = useUIStore(state => state.openEditModal);
    const { handleUploadFile } = useTrackActions({});
    // Add other actions as needed (delete, upload, etc.)

    const { audioRef, audioProgress, audioSrc, handleTimeUpdate, handleAudioEnded } = useAudioPlayer(
        track,
        isTrackPlaying,
        () => setPlayingTrack(isTrackPlaying ? null : track.id)
    );

    const handleCheckboxChange = () => {
        if (isTrackSelected) {
            deselectTrack(track.id);
        } else {
            selectTrack(track.id);
        }
    };

    return (
        <div
            data-testid={testId}
            className={`relative bg-gray-800 rounded-lg p-4 border-2 transition-all duration-200 ${
                isTrackSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'
            }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={isTrackSelected}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <h3 className="text-white font-semibold text-sm truncate max-w-[120px]">
                        {track.title}
                    </h3>
                </div>
                <div className="flex space-x-1">
                    <button
                        onClick={() => openEditModal({ id: track.id, slug: track.slug })}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Редагувати"
                    >
                        <img src="/pencil.svg" alt="Edit" className="w-4 h-4" loading="lazy" />
                    </button>
                </div>
            </div>

            <p className="text-gray-400 text-xs mb-3 truncate">{track.artist}</p>

            {track.coverImage && (
                <div className="relative mb-3">
                    <img
                        src={track.coverImage}
                        alt={`Cover for ${track.title}`}
                        className="w-full h-32 object-cover rounded"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            // Hide broken images
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div className="flex flex-wrap gap-1 mb-3">
                {track.genres?.map((genre) => (
                    <span
                        key={genre}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                    >
                        {genre}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPlayingTrack(isTrackPlaying ? null : track.id)}
                        disabled={!track.audioFile}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                        title={track.audioFile ? (isTrackPlaying ? 'Пауза' : 'Грати') : 'Немає аудіофайлу'}
                    >
                        <img
                            src={isTrackPlaying ? "/pause.svg" : "/play.svg"}
                            alt={isTrackPlaying ? "Pause" : "Play"}
                            className="w-4 h-4"
                        />
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                        title="Завантажити аудіофайл"
                    >
                        <img src="/upload.svg" alt="Upload" className="w-4 h-4" loading="lazy" />
                    </button>

                    {track.audioFile && (
                        <button
                            onClick={() => {
                                // Implement delete file with confirmation logic
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                            title="Видалити аудіофайл"
                        >
                            <img src="/trash.svg" alt="Delete file" className="w-4 h-4" loading="lazy" />
                        </button>
                    )}
                </div>

                {track.audioFile && (
                    <div className="text-xs text-gray-400">
                        <img src="/music.svg" alt="Audio" className="w-4 h-4 inline mr-1" loading="lazy" />
                        ✓
                    </div>
                )}
            </div>

            {isTrackPlaying && audioProgress > 0 && (
                <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                        <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${audioProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {track.audioFile && (
                <audio
                    ref={audioRef}
                    src={audioSrc}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                />
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                        await uploadFile(file, track.id, handleUploadFile);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    }
                }}
                className="hidden"
            />
        </div>
    );
});

TrackItem.displayName = 'TrackItem';

export default TrackItem;