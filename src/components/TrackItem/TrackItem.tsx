import React, { useRef, useState, useEffect } from 'react';
import { Track } from '../../types';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { ResultAsync } from 'neverthrow';

import { isHTMLAudioElement } from '../../lib/tg';

const API_BASE_URL = 'http://localhost:8000';

interface TrackItemProps {
    track: Track;
    isSelected: boolean;
    onSelect: (id: Track['id']) => void;
    onEdit: (id: Track['id']) => void;
    onDelete: (id: Track['id']) => void;
    testId: string;
    onUploadFile: (id: Track['id'], file: File) => Promise<void>;
    onDeleteFileWithConfirmation: (id: Track['id']) => void;
    playingTrackId: Track['id'] | null;
    onPlayToggle: (id: Track['id']) => void;
}

const FileSchema = z.object({
    type: z.string().refine(
        (type) => ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/x-wav'].includes(type),
        'Invalid file type. Only MP3, WAV, OGG allowed.'
    ),
    size: z.number().max(10 * 1024 * 1024, 'File size exceeds 10MB limit.'),
});

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
    const isPlaying = playingTrackId === track.id;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [uploading, setUploading] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            if (isPlaying) {
                audio.play().catch(error => {
                    console.error(`Playback error for track ${track.id}:`, error);
                    toast.error(`Failed to play track ${track.title}.`);
                });
            } else {
                audio.pause();
            }
        }
    }, [isPlaying, track.id, track.title]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleLoadedMetadata = () => {
                setAudioProgress(0);
            };
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);

            setAudioProgress(0);

            return () => {
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [track.id, track.audioFile]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelect(track.id);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(track.id);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(track.id);
    };

    const handleUploadButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            toast.error('No file selected.');
            return;
        }

        setUploading(true);

        const uploadResult = await ResultAsync.fromPromise(
            Promise.resolve(FileSchema.parseAsync({ type: file.type, size: file.size })),
            (zodError) => {
                if (zodError instanceof Error && "errors" in zodError) {
                    const first = (zodError as any).errors?.[0]?.message;
                    return first || 'Unknown file validation error.';
                }
                return 'Unknown file validation error.';
            }
        ).andThen(() => {
            return ResultAsync.fromPromise(
                onUploadFile(track.id, file),
                () => "File upload failed."
            );
        });
        uploadResult.match(
            () => {
            },
            (error) => {
                console.error("Upload failed:", error);
                toast.error(error);
            }
        );

        setUploading(false);
        e.target.value = '';
    };

    const handleDeleteFileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteFileWithConfirmation(track.id);
    };

    const handlePlayPauseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPlayToggle(track.id);
    };

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        if (isHTMLAudioElement(e.currentTarget)) {
            const audio = e.currentTarget;
            if (!isNaN(audio.duration) && audio.duration > 0) {
                const progress = (audio.currentTime / audio.duration) * 100;
                setAudioProgress(progress);
            } else {
                setAudioProgress(0);
            }
        }
    };

    const handleAudioEnded = () => {
        onPlayToggle(track.id);
        setAudioProgress(0);
    };

    const isFileOperationInProgress = uploading;

    return (
        <div
            data-testid={testId}
            className={`
                relative
                bg-gray-800 rounded-lg shadow-lg p-3
                border-2
                ${isSelected ? 'border-blue-500' : 'border-transparent'}
                hover:bg-gray-700 transition-colors duration-150
                ${isFileOperationInProgress ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}
                flex flex-col items-center
            `}
            onClick={() => onSelect(track.id)}
        >
            <input
                type="checkbox"
                data-testid={`track-checkbox-${track.id}`}
                checked={isSelected}
                onChange={handleSelectChange}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 left-2 h-5 w-5 rounded text-blue-600 bg-gray-700 border-gray-500 focus:ring-blue-500 z-10"
                disabled={isFileOperationInProgress}
            />

            <div className="absolute top-2 right-2 flex space-x-1 z-10">
                <button
                    data-testid={`edit-track-${track.id}`}
                    onClick={handleEditClick}
                    className="p-1 rounded-full bg-gray-600 hover:bg-blue-600 text-white transition-colors"
                    aria-label="Edit track"
                    disabled={isFileOperationInProgress}
                >
                    <img src="/pencil.svg" alt="Edit icon" className="h-4 w-4" />
                </button>
                <button
                    data-testid={`delete-track-${track.id}`}
                    onClick={handleDeleteClick}
                    className="p-1 rounded-full bg-gray-600 hover:bg-red-600 text-white transition-colors"
                    aria-label="Delete track"
                    disabled={isFileOperationInProgress}
                >
                    <img src="/trash.svg" alt="Delete icon" className="h-4 w-4" />
                </button>
            </div>

            <div className="w-full mb-2">
                {track.coverImage ? (
                    <img
                        src={track.coverImage}
                        alt={`${track.title} cover`}
                        className="w-full aspect-square object-cover rounded"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            console.error(`Failed to load image for track ${track.id}: ${track.coverImage}`);
                        }}
                    />
                ) : (
                    <div className="w-full aspect-square bg-gray-700 flex items-center justify-center rounded">
                        <img src="/music.svg" alt="Music icon" className="h-10 w-10 text-gray-400" />
                    </div>
                )}
            </div>

            <h3
                data-testid={`track-item-${track.id}-title`}
                className="font-semibold text-base text-white text-center truncate w-full"
                title={track.title}
            >
                {track.title}
            </h3>

            <p
                data-testid={`track-item-${track.id}-artist`}
                className="text-sm text-gray-400 text-center truncate w-full"
                title={track.artist}
            >
                {track.artist}
            </p>

            <div className="mt-3 w-full flex flex-col items-center gap-2">
                {track.audioFile && (
                    <audio
                        ref={audioRef}
                        src={`${API_BASE_URL}/api/files/${track.audioFile}`}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleAudioEnded}
                    ></audio>
                )}

                {track.audioFile ? (
                    <div data-testid={`audio-player-${track.id}`} className="w-full flex flex-col items-center gap-2">
                        <button
                            data-testid={isPlaying ? `pause-button-${track.id}` : `play-button-${track.id}`}
                            onClick={handlePlayPauseClick}
                            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                            disabled={isFileOperationInProgress}
                            aria-label={isPlaying ? 'Pause track' : 'Play track'}
                        >
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

                        <div data-testid={`audio-progress-${track.id}`} className="w-full bg-gray-600 rounded-full h-1.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${audioProgress}%` }}></div>
                        </div>

                        <button
                            onClick={handleDeleteFileClick}
                            className="text-sm text-red-400 hover:text-red-500 disabled:opacity-50"
                            disabled={isFileOperationInProgress}
                            aria-label="Remove audio file"
                        >
                            Видалити файл
                        </button>
                    </div>
                ) : (
                    <div className="w-full">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="audio/*"
                            disabled={isFileOperationInProgress}
                            data-loading={uploading ? 'true' : 'false'}
                            aria-disabled={uploading ? 'true' : 'false'}
                        />
                        <button
                            data-testid={`upload-track-${track.id}`}
                            onClick={handleUploadButtonClick}
                            className="w-full px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isFileOperationInProgress}
                            data-loading={uploading ? 'true' : 'false'}
                            aria-disabled={uploading ? 'true' : 'false'}
                        >
                            {uploading ? (
                                'Завантаження...'
                            ) : (
                                <>
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