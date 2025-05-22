import React, { useState } from 'react';
import { CreateTrackDto, Genre } from '../../types';
import { isValidUrl } from '../../utils/vaildation.ts'; // Assuming this utility exists

// Props for the Create Track Modal component
interface CreateTrackModalProps {
    isOpen: boolean; // Controls modal visibility
    onClose: () => void; // Handler to close the modal
    onSubmit: (data: CreateTrackDto) => void; // Handler to submit form data (passed from App.tsx)
    isSubmitting?: boolean; // Indicates if the form submission is in progress
    availableGenres: Genre[]; // List of available genres (passed from App.tsx)
    isLoadingGenres?: boolean; // State indicating if genres are loading
    isErrorGenres?: boolean; // State indicating if genres failed to load
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
    // Do not render the modal if it's not open
    if (!isOpen) {
        return null;
    }

    // --- Form State ---
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [genres, setGenres] = useState<string[]>([]); // State for selected genres
    const [coverImage, setCoverImage] = useState('');
    // --- Validation Errors State ---
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

    // --- Handlers and Logic ---

    // Handler to add a selected genre from the dropdown
    const handleAddGenre = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedGenre = e.target.value;
        if (selectedGenre && !genres.includes(selectedGenre)) {
            setGenres([...genres, selectedGenre]);
             // Clear genre validation error on adding a genre
             setErrors(prev => ({ ...prev, genres: undefined }));
        }
        // Reset dropdown value
        e.target.value = '';
    };

    // Handler to remove a selected genre tag
    const handleRemoveGenre = (genreToRemove: string) => {
        setGenres(genres.filter(genre => genre !== genreToRemove));
         // Clear genre validation error on removing a genre
         setErrors(prev => ({ ...prev, genres: undefined }));
    };

    // Validation function
    const validate = () => {
        const newErrors: { [key: string]: string | undefined } = {};
        if (!title.trim()) {
             newErrors.title = 'Назва треку є обов\'язковою.';
        }
        if (!artist.trim()) {
             newErrors.artist = 'Виконавець є обов\'язковим.';
        }
        if (genres.length === 0) {
             newErrors.genres = 'Потрібен хоча б один жанр.';
        }

        // Validate cover image URL if provided
        if (coverImage.trim() !== '' && !isValidUrl(coverImage.trim())) {
             newErrors.coverImage = 'Будь ласка, введіть дійсний URL обкладинки (починаючи з http:// або https://).';
        }

        setErrors(newErrors);
        // Return true if there are no errors
        return Object.values(newErrors).every(error => error === undefined);
    };


    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission

        if (!validate()) { // Run validation
             console.error("Validation failed");
             return; // Stop submission if validation fails
         }

        // Create the new track data object
        const newTrack: CreateTrackDto = {
            title: title.trim(), // Trim whitespace
            artist: artist.trim(), // Trim whitespace
            album: album.trim() || undefined, // Trim whitespace, use undefined if empty
            genres, // Include selected genres
            coverImage: coverImage.trim() || undefined, // Trim whitespace, use undefined if empty
        };
        onSubmit(newTrack); // Call the onSubmit handler (mutation is in App.tsx)
        // Form reset and modal closing are handled in App.tsx mutation onSuccess
    };

    // Handle click on the modal overlay to close
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // --- Rendering ---
    return (
        // Modal overlay
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick} // Allows closing by clicking outside
        >
            {/* Modal content box */}
            <div
                 // Added overflow and max height for scrollability if content is tall
                 className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md relative overflow-y-auto max-h-[90vh]"
                 onClick={e => e.stopPropagation()} // Prevent click inside from closing modal via overlay
            >
                {/* Modal title */}
                <h2 className="text-2xl font-bold mb-4">Створити новий трек</h2>
                {/* Close button */}
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl z-10"
                    onClick={onClose} // Close handler
                    disabled={isSubmitting} // Disable button while submitting
                >
                    &times;
                </button>

                {/* Create form */}
                 <form onSubmit={handleSubmit} data-testid="track-form"> {/* Data-testid for the form */}
                     {/* Title Input */}
                     <div className="mb-4">
                         <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Назва треку</label>
                         <input
                             data-testid="input-title" // For testing
                             type="text" id="title" value={title}
                             onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: undefined })); }} // Clear specific error on change
                             className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.title ? 'border-red-500' : 'border-gray-600'}`} // Add error border class
                             disabled={isSubmitting} // Disable while submitting
                         />
                          {errors.title && <p data-testid="error-title" className="text-red-500 text-sm mt-1">{errors.title}</p>} {/* Display validation error */}
                     </div>

                     {/* Artist Input */}
                     <div className="mb-4">
                         <label htmlFor="artist" className="block text-sm font-medium text-gray-400 mb-1">Виконавець</label>
                         <input
                             data-testid="input-artist" // For testing
                             type="text" id="artist" value={artist}
                             onChange={(e) => { setArtist(e.target.value); setErrors(prev => ({ ...prev, artist: undefined })); }} // Clear specific error on change
                             className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.artist ? 'border-red-500' : 'border-gray-600'}`} // Add error border class
                             disabled={isSubmitting} // Disable while submitting
                         />
                          {errors.artist && <p data-testid="error-artist" className="text-red-500 text-sm mt-1">{errors.artist}</p>} {/* Display validation error */}
                     </div>

                     {/* Album Input */}
                     <div className="mb-4">
                         <label htmlFor="album" className="block text-sm font-medium text-gray-400 mb-1">Альбом (необов'язково)</label>
                         <input
                             data-testid="input-album" // For testing
                             type="text" id="album" value={album}
                             onChange={(e) => setAlbum(e.target.value)}
                             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                             disabled={isSubmitting} // Disable while submitting
                         />
                     </div>

                     {/* Cover Image URL Input */}
                     <div className="mb-6">
                         <label htmlFor="coverImage" className="block text-sm font-medium text-gray-400 mb-1">URL обкладинки (необов'язково)</label>
                         <input
                             data-testid="input-cover-image" // For testing
                             type="text" id="coverImage" value={coverImage}
                             onChange={(e) => { setCoverImage(e.target.value); setErrors(prev => ({ ...prev, coverImage: undefined })); }} // Clear specific error on change
                             className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.coverImage ? 'border-red-500' : 'border-gray-600'}`} // Add error border class
                             disabled={isSubmitting} // Disable while submitting
                         />
                          {errors.coverImage && <p data-testid="error-cover-image" className="text-red-500 text-sm mt-1">{errors.coverImage}</p>} {/* Display URL validation error */}
                     </div>

                     {/* Genres Section */}
                     <div className="mb-6">
                         <label htmlFor="genre-select-add" className="block text-sm font-medium text-gray-400 mb-2">Вибрати жанри</label>
                         {/* Loading/Error messages for genres */}
                         {isLoadingGenres && <p data-testid="genres-loading" className="text-gray-400 mb-2">Завантаження жанрів...</p>}
                         {isErrorGenres && <p data-testid="genres-error" className="text-red-500 mb-2">Помилка завантаження жанрів.</p>}

                         {/* Genre selection dropdown (rendered if genres are loaded successfully) */}
                         {availableGenres && Array.isArray(availableGenres) && !isLoadingGenres && !isErrorGenres && (
                             <select
                                 data-testid="genre-selector" // For testing
                                 id="genre-select-add"
                                 onChange={handleAddGenre} // Handler to add genre
                                 value="" // Resets value after selection
                                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 mb-3"
                                 disabled={isSubmitting || isLoadingGenres || isErrorGenres} // Disable while submitting or loading genres
                             >
                                 <option value="" disabled>-- Виберіть жанр --</option>
                                 {/* Filter out already selected genres */}
                                 {availableGenres.filter(genre => !genres.includes(genre)).map(genre => (
                                     <option key={genre} value={genre}>{genre}</option>
                                 ))}
                             </select>
                         )}

                         {/* Message if no genres are available */}
                         {availableGenres && Array.isArray(availableGenres) && availableGenres.length === 0 && !isLoadingGenres && !isErrorGenres && (
                              <p data-testid="no-genres-available" className="text-gray-400 mb-2">Доступні жанри відсутні.</p>
                         )}


                         {/* Display selected genres as tags */}
                         <div className="flex flex-wrap gap-2 mt-2" data-testid="selected-genres">
                             {genres.map(genre => (
                                  <span
                                       key={genre}
                                       data-testid={`genre-tag-${genre.replace(/\s+/g, '-').toLowerCase()}`} // For testing (formatted genre name)
                                       className="flex items-center bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full"
                                   >
                                       {genre}
                                       {/* Button to remove genre tag */}
                                       <button
                                            type="button"
                                            onClick={() => handleRemoveGenre(genre)} // Handler to remove genre
                                            disabled={isSubmitting} // Disable while submitting
                                            className="ml-2 text-white hover:text-gray-200 focus:outline-none disabled:opacity-50"
                                            aria-label={`Remove genre ${genre}`} // Accessibility label
                                        >
                                            &times;
                                        </button>
                                   </span>
                             ))}
                         </div>
                         {/* Display genre validation error */}
                         {errors.genres && <p data-testid="error-genre" className="text-red-500 text-sm mt-1">{errors.genres}</p>}
                     </div>


                     {/* Form submit button */}
                     <div className="flex justify-end">
                         <button
                             data-testid="submit-button" // For testing
                             type="submit"
                             disabled={isSubmitting} // Disable while submitting
                             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             {isSubmitting ? 'Створення...' : 'Створити'} {/* Text changes while submitting */}
                         </button>
                     </div>
                 </form>
            </div>
        </div>
    );
};

export default CreateTrackModal;