import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Track, UpdateTrackDto, Genre, UpdateTrackDtoSchema } from '../../types';

interface EditTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UpdateTrackDto) => void;
    trackToEdit: Track | null;
    isSaving?: boolean;
    availableGenres: Genre[];
    isLoadingGenres?: boolean;
    isErrorGenres?: boolean;
}

const EditTrackModal: React.FC<EditTrackModalProps> = ({
    isOpen,
    onClose,
    onSave,
    trackToEdit,
    isSaving = false,
    availableGenres,
    isLoadingGenres = false,
    isErrorGenres = false
}) => {
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<UpdateTrackDto>({
        resolver: zodResolver(UpdateTrackDtoSchema),
        defaultValues: {
            title: '',
            artist: '',
            album: '',
            genres: [],
            coverImage: ''
        }
    });

    const genres = watch('genres');

    useEffect(() => {
        if (isOpen && trackToEdit) {
            reset({
                title: trackToEdit.title,
                artist: trackToEdit.artist,
                album: trackToEdit.album || '',
                genres: trackToEdit.genres ?? [],
                coverImage: trackToEdit.coverImage || ''
            });
        }
    }, [trackToEdit, isOpen, reset]);

    if (!isOpen || !trackToEdit) {
        return null;
    }

    const handleAddGenre = (selectedGenre: string) => {
        if (selectedGenre && !(genres?.includes(selectedGenre))) {
            setValue('genres', [...(genres ?? []), selectedGenre]);
        }
    };

    const handleRemoveGenre = (genreToRemove: string) => {
        setValue('genres', (genres ?? []).filter(genre => genre !== genreToRemove));
    };

    const onSubmitForm = (formData: UpdateTrackDto) => {
        const currentFormData = {
            title: formData.title?.trim(),
            artist: formData.artist?.trim(),
            album: formData.album?.trim(),
            genres: formData.genres || [],
            coverImage: formData.coverImage?.trim(),
        };

        const updatedData: UpdateTrackDto = {};

        if (currentFormData.title !== trackToEdit.title) {
            updatedData.title = currentFormData.title;
        }
        if (currentFormData.artist !== trackToEdit.artist) {
            updatedData.artist = currentFormData.artist;
        }

        const currentAlbum = currentFormData.album;
        const originalAlbum = trackToEdit.album === '' ? undefined : trackToEdit.album;
        if (currentAlbum !== originalAlbum) {
            updatedData.album = currentAlbum;
        }

        const sortedCurrentGenres = [...currentFormData.genres].sort();
        const sortedOriginalGenres = [...(trackToEdit.genres || [])].sort();
        if (JSON.stringify(sortedCurrentGenres) !== JSON.stringify(sortedOriginalGenres)) {
            updatedData.genres = currentFormData.genres;
        }

        const currentCoverImage = currentFormData.coverImage;
        const originalCoverImage = trackToEdit.coverImage === '' ? undefined : trackToEdit.coverImage;
        if (currentCoverImage !== originalCoverImage) {
            updatedData.coverImage = currentCoverImage;
        }

        if (Object.keys(updatedData).length > 0) {
            console.log("Submitting updates:", updatedData);
            onSave(updatedData);
        } else {
            console.log("No changes to save.");
            onClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md relative overflow-y-auto max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">Редагувати трек</h2>
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl z-10"
                    onClick={onClose}
                    disabled={isSaving}
                >
                    &times;
                </button>

                <form onSubmit={handleSubmit(onSubmitForm)} data-testid="track-form">
                    <div className="mb-4">
                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-400 mb-1">
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
                                    id="edit-title"
                                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        errors.title ? 'border-red-500' : 'border-gray-600'
                                    }`}
                                    disabled={isSaving}
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
                        <label htmlFor="edit-artist" className="block text-sm font-medium text-gray-400 mb-1">
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
                                    id="edit-artist"
                                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        errors.artist ? 'border-red-500' : 'border-gray-600'
                                    }`}
                                    disabled={isSaving}
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
                        <label htmlFor="edit-album" className="block text-sm font-medium text-gray-400 mb-1">
                            Альбом
                        </label>
                        <Controller
                            name="album"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    data-testid="input-album"
                                    type="text"
                                    id="edit-album"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                    disabled={isSaving}
                                />
                            )}
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="edit-coverImage" className="block text-sm font-medium text-gray-400 mb-1">
                            URL обкладинки
                        </label>
                        <Controller
                            name="coverImage"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    data-testid="input-cover-image"
                                    type="text"
                                    id="edit-coverImage"
                                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                                        errors.coverImage ? 'border-red-500' : 'border-gray-600'
                                    }`}
                                    disabled={isSaving}
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
                        <label htmlFor="edit-genre-select-add" className="block text-sm font-medium text-gray-400 mb-2">
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
                                id="edit-genre-select-add"
                                onChange={(e) => {
                                    handleAddGenre(e.target.value);
                                    e.target.value = '';
                                }}
                                value=""
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 mb-3"
                                disabled={isSaving || isLoadingGenres || isErrorGenres}
                            >
                                <option value="" disabled>-- Виберіть жанр --</option>
                                {availableGenres.filter(genre => !(genres?.includes(genre))).map(genre => (
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
                            {genres?.map(genre => (
                                <span
                                    key={genre}
                                    data-testid={`genre-tag-${genre.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="flex items-center bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full"
                                >
                                    {genre}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveGenre(genre)}
                                        disabled={isSaving}
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
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Скасувати
                        </button>
                        <button
                            data-testid="submit-button"
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Збереження...' : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTrackModal;