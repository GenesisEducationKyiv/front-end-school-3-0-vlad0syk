import React, { Suspense, useRef } from 'react';
import { Track } from '../../types';
import { useTrackStore } from '../../stores/trackStore';
import useAudioPlayer from '../lazy/AudioPlayer';
import { useUIStore } from '../../stores/uiStore';
import { gql, useMutation } from '@apollo/client';

const UPLOAD_AUDIO_FILE_MUTATION = gql`
  mutation UploadAudioFile($id: ID!, $file: Upload!) {
    uploadAudioFile(id: $id, file: $file) {
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

const DELETE_AUDIO_FILE_MUTATION = gql`
  mutation DeleteAudioFile($id: ID!) {
    deleteAudioFile(id: $id) {
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

interface TrackItemProps {
  track: Track;
  testId?: string;
}

const AudioPlayer = React.lazy(() => import('../lazy/AudioPlayer'));

const TrackItem: React.FC<TrackItemProps> = ({ track, testId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTrackSelected = useTrackStore(state => state.isTrackSelected(track.id));
  const isTrackPlaying = useTrackStore(state => state.isTrackPlaying(track.id));
  const selectTrack = useTrackStore(state => state.selectTrack);
  const deselectTrack = useTrackStore(state => state.deselectTrack);
  const setPlayingTrack = useTrackStore(state => state.setPlayingTrack);
  const openEditModal = useUIStore(state => state.openEditModal);

  // Apollo mutations
  const [uploadAudioFile, { loading: uploading }] = useMutation(UPLOAD_AUDIO_FILE_MUTATION);
  const [deleteAudioFile, { loading: deleting }] = useMutation(DELETE_AUDIO_FILE_MUTATION);

  // Replace this with your own audio player hook or logic, or use the AudioPlayer component directly below.
  // Example: Remove this block and use the AudioPlayer component in the JSX where needed.

  const handleCheckboxChange = () => {
    if (isTrackSelected) {
      deselectTrack(track.id);
    } else {
      selectTrack(track.id);
    }
  };

  const handleUploadFile = async (file: File) => {
    await uploadAudioFile({
      variables: { id: track.id, file },
      // Optionally: refetchQueries or update cache
    });
  };

  const handleDeleteFile = async () => {
    await deleteAudioFile({
      variables: { id: track.id },
      // Optionally: refetchQueries or update cache
    });
  };

  return (
    <div
      data-testid={testId}
      className={`relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 ${
        isTrackSelected ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isTrackSelected}
            onChange={handleCheckboxChange}
            className="w-5 h-5 text-blue-600 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition"
          />
          <h3 className="text-gray-900 dark:text-white font-bold text-base truncate max-w-[160px]">
            {track.title}
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal({ id: track.id, slug: track.slug })}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-700 text-gray-500 hover:text-blue-600 transition"
            title="Редагувати"
          >
            <img src="/pencil.svg" alt="Edit" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 truncate">{track.artist}</p>

      {track.coverImage && (
        <div className="relative mb-4">
          <img
            src={track.coverImage}
            alt={`Cover for ${track.title}`}
            className="w-full h-36 object-cover rounded-xl shadow"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {track.genres?.map((genre) => (
          <span
            key={genre}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white text-xs font-semibold rounded-full shadow-sm"
          >
            {genre}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setPlayingTrack(isTrackPlaying ? null : track.id)}
            disabled={!track.audioFile}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors shadow"
            title={track.audioFile ? (isTrackPlaying ? 'Пауза' : 'Грати') : 'Немає аудіофайлу'}
          >
            <img
              src={isTrackPlaying ? "/pause.svg" : "/play.svg"}
              alt={isTrackPlaying ? "Pause" : "Play"}
              className="w-5 h-5"
            />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors shadow"
            title="Завантажити аудіофайл"
          >
            <img src="/upload.svg" alt="Upload" className="w-5 h-5" />
          </button>

          {track.audioFile && (
            <button
              onClick={handleDeleteFile}
              disabled={deleting}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow"
              title="Видалити аудіофайл"
            >
              <img src="/trash.svg" alt="Delete file" className="w-5 h-5" />
            </button>
          )}
        </div>

        {track.audioFile && (
          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
            <img src="/music.svg" alt="Audio" className="w-4 h-4 inline mr-1" />
            <span className="font-semibold">✓</span>
          </div>
        )}
      </div>

      {/* Progress bar placeholder removed because audioProgress is not defined */}

      {track.audioFile && (
        <Suspense fallback={<div>Завантаження аудіоплеєра...</div>}>
          <AudioPlayer
            track={track}
            isPlaying={isTrackPlaying}
            onPlayToggle={() => setPlayingTrack(isTrackPlaying ? null : track.id)}
          />
        </Suspense>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            await handleUploadFile(file);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default TrackItem;