import React from 'react';
import { CreateTrackDto, UpdateTrackDto, Genre } from '../../types';
import { useTrackForm } from '../../hooks/useTrackForm';

interface TrackFormModalProps {
    mode: 'create' | 'edit';
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTrackDto | UpdateTrackDto) => void;
    trackToEditId?: string | null;
    isSubmitting?: boolean;
    availableGenres: Genre[];
    isLoadingGenres?: boolean;
    isErrorGenres?: boolean;
}

const TrackFormModal: React.FC<TrackFormModalProps> = ({
    mode,
    isOpen,
    onClose,
    onSubmit,
    trackToEditId,
    isSubmitting = false,
    availableGenres,
    isLoadingGenres = false,
    isErrorGenres = false
}) => {
    const isEditMode = mode === 'edit';
    const modalTitle = isEditMode ? 'Редагувати трек' : 'Створити новий трек';
    const submitButtonText = isSubmitting 
        ? (isEditMode ? 'Збереження...' : 'Створення...')
        : (isEditMode ? 'Зберегти' : 'Створити');

    const {
        control,
        handleSubmit,
        errors,
        genres,
        handleAddGenre,
        handleRemoveGenre,
        handleOverlayClick,
        Controller,
        isLoadingTrack
    } = useTrackForm({
        mode,
        isOpen,
        trackToEditId,
        onSubmit,
        onClose
    });

    if (!isOpen || (isEditMode && !trackToEditId)) {
        return null;
    }

    if (isEditMode && isLoadingTrack) {
        return (
            <div
                className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
                onClick={handleOverlayClick}
            >
                <div
                    className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
                    onClick={e => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-bold mb-4">{modalTitle}</h2>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-400">Завантаження даних треку...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md relative overflow-y-auto max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">{modalTitle}</h2>
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl z-10"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    &times;
                </button>

                <form onSubmit={handleSubmit} data-testid="track-form">
                    <div className="mb-4">
                        <label htmlFor={`${mode}-title`} className="block text-sm font-medium text-gray-400 mb-1">
                            Назва треку
                        </label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    data-testid="input-title"
                                    type="text"
                                    id={`${mode}-title`}
                                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        errors.title ? 'border-red-500' : 'border-gray-600'
                                    }`}
                                    disabled={isSubmitting}
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
                        <label htmlFor={`${mode}-artist`} className="block text-sm font-medium text-gray-400 mb-1">
                            Виконавець
                        </label>
                        <Controller
                            name="artist"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    data-testid="input-artist"
                                    type="text"
                                    id={`${mode}-artist`}
                                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        errors.artist ? 'border-red-500' : 'border-gray-600'
                                    }`}
                                    disabled={isSubmitting}
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
                        <label htmlFor={`${mode}-album`} className="block text-sm font-medium text-gray-400 mb-1">
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
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor={`${mode}-coverImage`} className="block text-sm font-medium text-gray-400 mb-1">
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
                                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        errors.coverImage ? 'border-red-500' : 'border-gray-600'
                                    }`}
                                    disabled={isSubmitting}
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
                        <label htmlFor={`${mode}-genre-select-add`} className="block text-sm font-medium text-gray-400 mb-2">
                            Вибрати жанри
                        </label>
                        {isLoadingGenres && (
                            <p data-testid="genres-loading" className="text-gray-400 mb-2">
                                Завантаження жанрів...
                            </p>
                        )}
                        {isErrorGenres && (
                            <p data-testid="genres-error" className="text-red-500 mb-2">
                                Помилка завантаження жанрів.
                            </p>
                        )}

                        {availableGenres && Array.isArray(availableGenres) && !isLoadingGenres && !isErrorGenres && (
                            <select
                                data-testid="genre-selector"
                                id={`${mode}-genre-select-add`}
                                onChange={(e) => {
                                    handleAddGenre(e.target.value);
                                    e.target.value = '';
                                }}
                                value=""
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 mb-3"
                                disabled={isSubmitting || isLoadingGenres || isErrorGenres}
                            >
                                <option value="" disabled>-- Виберіть жанр --</option>
                                {availableGenres.filter(genre => !genres.includes(genre)).map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        )}

                        {availableGenres && Array.isArray(availableGenres) && availableGenres.length === 0 && !isLoadingGenres && !isErrorGenres && (
                            <p data-testid="no-genres-available" className="text-gray-400 mb-2">
                                Доступні жанри відсутні.
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2" data-testid="selected-genres">
                            {genres.map(genre => (
                                <span
                                    key={genre}
                                    data-testid={`genre-tag-${genre.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="flex items-center bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full"
                                >
                                    {genre}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveGenre(genre)}
                                        disabled={isSubmitting}
                                        className="ml-2 text-white hover:text-gray-200 focus:outline-none disabled:opacity-50"
                                        aria-label={`Remove genre ${genre}`}
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                        {errors.genres && (
                            <p data-testid="error-genre" className="text-red-500 text-sm mt-1">
                                {errors.genres.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        {isEditMode && (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Скасувати
                            </button>
                        )}
                        <button
                            data-testid="submit-button"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitButtonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TrackFormModal;