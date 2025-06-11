import React, { useState, useEffect } from 'react';
import { CreateTrackDto, Genre, CreateTrackDtoSchema } from '../../types';
import { ZodError } from 'zod';

interface CreateTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTrackDto) => void;
    isSubmitting?: boolean;
    availableGenres: Genre[];
    isLoadingGenres?: boolean;
    isErrorGenres?: boolean;
}

const CreateTrackModal: React.FC<CreateTrackModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
    availableGenres,
    isLoadingGenres = false,
    isErrorGenres = false
}) => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [genres, setGenres] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    // Скидання форми при відкритті
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setTitle('');
        setArtist('');
        setAlbum('');
        setGenres([]);
        setCoverImage('');
        setErrors({});
    };

    if (!isOpen) return null;

    const handleAddGenre = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedGenre = e.target.value;
        if (selectedGenre && !genres.includes(selectedGenre)) {
            setGenres([...genres, selectedGenre]);
            setErrors(prev => ({ ...prev, genres: undefined }));
        }
        e.target.value = '';
    };

    const handleRemoveGenre = (genreToRemove: string) => {
        setGenres(genres.filter(genre => genre !== genreToRemove));
        setErrors(prev => ({ ...prev, genres: undefined }));
    };

    const validate = (data: CreateTrackDto) => {
        try {
            CreateTrackDtoSchema.parse(data);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof ZodError) {
                const newErrors: { [key: string]: string | undefined } = {};
                error.errors.forEach(err => {
                    if (err.path.length > 0) {
                        newErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
                console.error("Validation errors:", newErrors);
            }
            return false;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData: CreateTrackDto = {
            title: title.trim(),
            artist: artist.trim(),
            album: album.trim(),
            genres,
            coverImage: coverImage.trim(),
        };

        if (!validate(formData)) return;
        const validatedData = CreateTrackDtoSchema.parse(formData);
        onSubmit(validatedData);
        resetForm(); // Очищення після сабміту
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
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
                <h2 className="text-2xl font-bold mb-4">Створити новий трек</h2>
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl z-10"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    &times;
                </button>

                <form onSubmit={handleSubmit} data-testid="track-form">
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Назва треку</label>
                        <input
                            data-testid="input-title"
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: undefined })); }}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.title ? 'border-red-500' : 'border-gray-600'}`}
                            disabled={isSubmitting}
                        />
                        {errors.title && <p data-testid="error-title" className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="artist" className="block text-sm font-medium text-gray-400 mb-1">Виконавець</label>
                        <input
                            data-testid="input-artist"
                            type="text"
                            id="artist"
                            value={artist}
                            onChange={(e) => { setArtist(e.target.value); setErrors(prev => ({ ...prev, artist: undefined })); }}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.artist ? 'border-red-500' : 'border-gray-600'}`}
                            disabled={isSubmitting}
                        />
                        {errors.artist && <p data-testid="error-artist" className="text-red-500 text-sm mt-1">{errors.artist}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="album" className="block text-sm font-medium text-gray-400 mb-1">Альбом (необов'язково)</label>
                        <input
                            data-testid="input-album"
                            type="text"
                            id="album"
                            value={album}
                            onChange={(e) => setAlbum(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-400 mb-1">URL обкладинки (необов'язково)</label>
                        <input
                            data-testid="input-cover-image"
                            type="text"
                            id="coverImage"
                            value={coverImage}
                            onChange={(e) => { setCoverImage(e.target.value); setErrors(prev => ({ ...prev, coverImage: undefined })); }}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.coverImage ? 'border-red-500' : 'border-gray-600'}`}
                            disabled={isSubmitting}
                        />
                        {errors.coverImage && <p data-testid="error-cover-image" className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="genre-select-add" className="block text-sm font-medium text-gray-400 mb-2">Вибрати жанри</label>
                        {isLoadingGenres && <p data-testid="genres-loading" className="text-gray-400 mb-2">Завантаження жанрів...</p>}
                        {isErrorGenres && <p data-testid="genres-error" className="text-red-500 mb-2">Помилка завантаження жанрів.</p>}

                        {availableGenres && Array.isArray(availableGenres) && !isLoadingGenres && !isErrorGenres && (
                            <select
                                data-testid="genre-selector"
                                id="genre-select-add"
                                onChange={handleAddGenre}
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
                            <p data-testid="no-genres-available" className="text-gray-400 mb-2">Доступні жанри відсутні.</p>
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
                        {errors.genres && <p data-testid="error-genre" className="text-red-500 text-sm mt-1">{errors.genres}</p>}
                    </div>

                    <div className="flex justify-end">
                        <button
                            data-testid="submit-button"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Створення...' : 'Створити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTrackModal;
