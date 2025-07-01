import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { gql, useMutation, useQuery } from '@apollo/client';
import { CreateTrackDto, UpdateTrackDto, Genre, Track } from '../../types';

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

const UPDATE_TRACK_MUTATION = gql`
  mutation UpdateTrack($id: ID!, $input: UpdateTrackInput!) {
    updateTrack(id: $id, input: $input) {
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

const TRACK_BY_ID_QUERY = gql`
  query Track($id: ID!) {
    track(id: $id) {
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

const GENRES_QUERY = gql`
  query Genres {
    genres
  }
`;

interface TrackFormModalProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateTrackDto | UpdateTrackDto) => void;
  trackToEditId?: string | null;
}

const GenreMultiSelect = ({ options, value, onChange, disabled }: { options: string[]; value: string[]; onChange: (val: string[]) => void; disabled?: boolean }) => {
  const toggleGenre = (genre: string) => {
    if (value.includes(genre)) {
      onChange(value.filter(g => g !== genre));
    } else {
      onChange([...value, genre]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((genre) => (
        <button
          type="button"
          key={genre}
          className={`px-3 py-1 rounded-full border transition font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            value.includes(genre)
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-white'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => toggleGenre(genre)}
          disabled={disabled}
        >
          <input
            type="checkbox"
            checked={value.includes(genre)}
            readOnly
            className="mr-2 align-middle"
          />
          {genre}
        </button>
      ))}
    </div>
  );
};

export const TrackFormModal: React.FC<TrackFormModalProps> = ({
  mode,
  isOpen,
  onClose,
  onSubmit,
  trackToEditId,
}) => {
  const isEditMode = mode === 'edit';

  const { data: genresData, loading: loadingGenres, error: errorGenres } = useQuery<{ genres: Genre[] }>(GENRES_QUERY);

  const { data: trackData, loading: loadingTrack } = useQuery<{ track: Track }>(
    TRACK_BY_ID_QUERY,
    {
      variables: { id: trackToEditId },
      skip: !isEditMode || !trackToEditId,
    }
  );

  const [createTrack, { loading: creating }] = useMutation(CREATE_TRACK_MUTATION);
  const [updateTrack, { loading: updating }] = useMutation(UPDATE_TRACK_MUTATION);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateTrackDto | UpdateTrackDto>({
    defaultValues: {
      title: '',
      artist: '',
      album: '',
      genres: [],
      coverImage: '',
    },
  });

  useEffect(() => {
    if (isEditMode && trackData?.track) {
      const { title, artist, album, genres, coverImage } = trackData.track;
      reset({ title, artist, album: album || '', genres: genres || [], coverImage: coverImage || '' });
    }
  }, [isEditMode, trackData, reset]);

  const onFormSubmit = async (formData: CreateTrackDto | UpdateTrackDto) => {
    if (isEditMode && trackData?.track) {
      await updateTrack({
        variables: { id: trackData.track.id, input: formData },
        refetchQueries: ['Tracks'],
      });
    } else {
      await createTrack({
        variables: { input: formData },
        refetchQueries: ['Tracks'],
      });
      reset();
    }
    if (onSubmit) onSubmit(formData);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen || (isEditMode && !trackToEditId)) return null;

  if (isEditMode && loadingTrack) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-modal-pop overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold mb-4 text-center">Редагувати трек</h2>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400 text-lg">Завантаження даних треку...</div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && !loadingTrack && !trackData?.track) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-modal-pop overflow-y-auto max-h-[90vh] flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Трек не знайдено</h2>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            onClick={onClose}
          >
            Закрити
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-modal-pop overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">{isEditMode ? 'Редагувати трек' : 'Створити новий трек'}</h2>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl z-10 transition"
          onClick={onClose}
          disabled={creating || updating}
        >
          &times;
        </button>

        <form onSubmit={handleSubmit(onFormSubmit)} data-testid="track-form">
          <div className="mb-4">
            <label htmlFor={`${mode}-title`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Назва треку
            </label>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  data-testid="input-title"
                  type="text"
                  id={`${mode}-title`}
                  className={`w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  disabled={creating || updating}
                />
              )}
            />
            {errors.title && (
              <p data-testid="error-title" className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor={`${mode}-artist`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Виконавець
            </label>
            <Controller
              name="artist"
              control={control}
              rules={{ required: 'Artist is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  data-testid="input-artist"
                  type="text"
                  id={`${mode}-artist`}
                  className={`w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                    errors.artist ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  disabled={creating || updating}
                />
              )}
            />
            {errors.artist && (
              <p data-testid="error-artist" className="text-red-500 text-sm mt-1">
                {errors.artist.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor={`${mode}-album`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Альбом {!isEditMode && '(необов\'язково)'}
            </label>
            <Controller
              name="album"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  data-testid="input-album"
                  type="text"
                  id={`${mode}-album`}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  disabled={creating || updating}
                />
              )}
            />
          </div>

          <div className="mb-6">
            <label htmlFor={`${mode}-coverImage`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              URL обкладинки {!isEditMode && '(необов\'язково)'}
            </label>
            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  data-testid="input-cover-image"
                  type="text"
                  id={`${mode}-coverImage`}
                  className={`w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                    errors.coverImage ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  disabled={creating || updating}
                />
              )}
            />
            {errors.coverImage && (
              <p data-testid="error-cover-image" className="text-red-500 text-sm mt-1">
                {errors.coverImage.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor={`${mode}-genre-select-add`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Вибрати жанри <span className="text-red-500">*</span>
            </label>
            {loadingGenres ? (
              <p data-testid="genres-loading" className="text-gray-400 mb-2">Завантаження жанрів...</p>
            ) : errorGenres ? (
              <p className="text-red-500 mb-2">Помилка завантаження жанрів</p>
            ) : (
              <Controller
                name="genres"
                control={control}
                rules={{
                  validate: ((val: string[] | undefined) => (Array.isArray(val) && val.length > 0) || 'Оберіть хоча б один жанр') as any,
                }}
                render={({ field }) => (
                  <GenreMultiSelect
                    options={genresData?.genres || []}
                    value={field.value || []}
                    onChange={field.onChange}
                    disabled={creating || updating}
                  />
                )}
              />
            )}
            {errors.genres && (
              <p className="text-red-500 text-sm mt-1">{errors.genres.message as string}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            disabled={creating || updating}
          >
            {creating || updating
              ? isEditMode
                ? 'Збереження...'
                : 'Створення...'
              : isEditMode
                ? 'Зберегти'
                : 'Створити'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrackFormModal;