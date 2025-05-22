import React, { useState, useEffect } from 'react';
import { Track, UpdateTrackDto, Genre } from '../../types';
import { isValidUrl } from '../../utils/vaildation.ts'; // Assuming this utility exists

// Props for the Edit Track Modal component
interface EditTrackModalProps {
    isOpen: boolean; // Controls modal visibility
    onClose: () => void; // Handler to close the modal
    onSave: (data: UpdateTrackDto) => void; // Handler to save changes (passed from App.tsx)
    trackToEdit: Track | null; // The track object to edit (or null if none)
    isSaving?: boolean; // Indicates if the save operation is in progress
    availableGenres: Genre[]; // List of available genres (passed from App.tsx)
    isLoadingGenres?: boolean; // State indicating if genres are loading
    isErrorGenres?: boolean; // State indicating if genres failed to load
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
    // Do not render the modal if it's not open or no track is provided
    if (!isOpen || !trackToEdit) {
        return null;
    }

    // --- Form State (initialized with trackToEdit data) ---
    const [title, setTitle] = useState(trackToEdit.title);
    const [artist, setArtist] = useState(trackToEdit.artist);
    const [album, setAlbum] = useState(trackToEdit.album || '');
    const [genres, setGenres] = useState<string[]>(trackToEdit.genres || []); // State for selected genres
    const [coverImage, setCoverImage] = useState(trackToEdit.coverImage || '');
     // --- Validation Errors State ---
     const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});


    // Effect to update form state when trackToEdit or modal visibility changes
    useEffect(() => {
        if (trackToEdit) {
            setTitle(trackToEdit.title);
            setArtist(trackToEdit.artist);
            setAlbum(trackToEdit.album || '');
            setGenres(trackToEdit.genres || []);
            setCoverImage(trackToEdit.coverImage || '');
            setErrors({}); // Reset errors when opening a new track
        }
         // Reset errors when closing the modal
         if (!isOpen) {
             setErrors({});
         }
    }, [trackToEdit, isOpen]); // Dependencies: trackToEdit and isOpen state

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

        if (!trackToEdit) return; // Safety check

        // Build object with only changed data for the update mutation
        const updatedData: UpdateTrackDto = {};
        if (title.trim() !== trackToEdit.title) updatedData.title = title.trim();
        if (artist.trim() !== trackToEdit.artist) updatedData.artist = artist.trim();

        // Check and add album if changed (handle undefined/empty string)
        if ((album.trim() === '' && trackToEdit.album !== undefined && trackToEdit.album !== '') || (album.trim() !== '' && album.trim() !== trackToEdit.album?.trim())) {
             updatedData.album = album.trim() === '' ? undefined : album.trim();
        }
         // Check and add genres if changed (compare array contents)
         if (JSON.stringify(genres.sort()) !== JSON.stringify((trackToEdit.genres || []).sort())) {
             updatedData.genres = genres;
         }
         // Check and add coverImage if changed (handle undefined/empty string and URL validation)
         if ((coverImage.trim() === '' && trackToEdit.coverImage !== undefined && trackToEdit.coverImage !== '') || (coverImage.trim() !== '' && coverImage.trim() !== trackToEdit.coverImage?.trim())) {
              updatedData.coverImage = coverImage.trim() === '' ? undefined : coverImage.trim();
         }


        // If there are changes, call the onSave handler
        if (Object.keys(updatedData).length > 0) {
            console.log("Submitting updates:", updatedData);
             onSave(updatedData); // Call save handler (mutation is in App.tsx)
        } else {
            console.log("No changes to save.");
            onClose(); // Just close the modal if no changes were made
        }

        // Modal closing is handled in App.tsx mutation onSuccess/onError
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
                <h2 className="text-2xl font-bold mb-4">Редагувати трек</h2>
                {/* Close button */}
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl z-10"
                    onClick={onClose} // Close handler
                    disabled={isSaving} // Disable button while saving
                >
                    &times;
                </button>

                {/* Edit form */}
                 <form onSubmit={handleSubmit} data-testid="track-form"> {/* Data-testid for the form */}
                     {/* Title Input */}
                     <div className="mb-4">
                         <label htmlFor="edit-title" className="block text-sm font-medium text-gray-400 mb-1">Назва треку</label>
                         <input
                             data-testid="input-title" // For testing
                             type="text" id="edit-title" value={title}
                             onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: undefined })); }} // Clear specific error on change
                             className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.title ? 'border-red-500' : 'border-gray-600'}`}
                             disabled={isSaving}
                         />
                          {errors.title && <p data-testid="error-title" className="text-red-500 text-sm mt-1">{errors.title}</p>} {/* Display validation error */}
                     </div>

                     {/* Artist Input */}
                     <div className="mb-4">
                         <label htmlFor="edit-artist" className="block text-sm font-medium text-gray-400 mb-1">Виконавець</label>
                         <input
                             data-testid="input-artist" // For testing
                             type="text" id="edit-artist" value={artist}
                             onChange={(e) => { setArtist(e.target.value); setErrors(prev => ({ ...prev, artist: undefined })); }} // Clear specific error on change
                             className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.artist ? 'border-red-500' : 'border-gray-600'}`}
                             disabled={isSaving}
                         />
                          {errors.artist && <p data-testid="error-artist" className="text-red-500 text-sm mt-1">{errors.artist}</p>} {/* Display validation error */}
                     </div>

                     {/* Album Input */}
                     <div className="mb-4">
                         <label htmlFor="edit-album" className="block text-sm font-medium text-gray-400 mb-1">Альбом</label>
                         <input
                             data-testid="input-album" // For testing
                             type="text" id="edit-album" value={album}
                             onChange={(e) => setAlbum(e.target.value)}
                             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                             disabled={isSaving}
                         />
                     </div>

                     {/* Cover Image URL Input */}
                     <div className="mb-6">
                         <label htmlFor="edit-coverImage" className="block text-sm font-medium text-gray-400 mb-1">URL обкладинки</label>
                         <input
                             data-testid="input-cover-image" // For testing
                             type="text" id="edit-coverImage" value={coverImage}
                             onChange={(e) => { setCoverImage(e.target.value); setErrors(prev => ({ ...prev, coverImage: undefined })); }} // Clear specific error on change
                             className={`w-full px-3 py-2 bg-gray-700 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${errors.coverImage ? 'border-red-500' : 'border-gray-600'}`}
                             disabled={isSaving}
                         />
                          {errors.coverImage && <p data-testid="error-cover-image" className="text-red-500 text-sm mt-1">{errors.coverImage}</p>} {/* Display validation error */}
                     </div>

                     {/* Genres Section */}
                     <div className="mb-6">
                         <label htmlFor="edit-genre-select-add" className="block text-sm font-medium text-gray-400 mb-2">Вибрати жанри</label>
                         {isLoadingGenres && <p data-testid="genres-loading" className="text-gray-400 mb-2">Завантаження жанрів...</p>}
                         {isErrorGenres && <p data-testid="genres-error" className="text-red-500 mb-2">Помилка завантаження жанрів.</p>}

                         {/* Genre selection dropdown (rendered if genres are loaded successfully) */}
                         {availableGenres && Array.isArray(availableGenres) && !isLoadingGenres && !isErrorGenres && (
                             <select
                                 data-testid="genre-selector" // For testing
                                 id="edit-genre-select-add"
                                 onChange={handleAddGenre} // Handles adding a genre
                                 value="" // Controlled component, value resets after selection
                                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 mb-3"
                                 disabled={isSaving || isLoadingGenres || isErrorGenres}
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
                                            onClick={() => handleRemoveGenre(genre)} // Handles removing a genre
                                            disabled={isSaving} // Disabled while saving
                                            className="ml-2 text-white hover:text-gray-200 focus:outline-none disabled:opacity-50"
                                            aria-label={`Remove genre ${genre}`}
                                        >
                                            &times;
                                        </button>
                                   </span>
                             ))}
                         </div>
                         {/* Display genre validation error */}
                         {errors.genres && <p data-testid="error-genre" className="text-red-500 text-sm mt-1">{errors.genres}</p>}
                     </div>

                     {/* Form action buttons */}
                     <div className="flex justify-end gap-3">
                         {/* Cancel button */}
                         <button
                             type="button"
                             onClick={onClose} // Close handler
                             disabled={isSaving} // Disabled while saving
                             className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             Скасувати
                         </button>
                         {/* Save button */}
                         <button
                             data-testid="submit-button" // For testing
                             type="submit"
                             disabled={isSaving} // Disabled while saving
                             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             {isSaving ? 'Збереження...' : 'Зберегти'} {/* Text changes while saving */}
                         </button>
                     </div>
                 </form>
            </div>
        </div>
    );
}

export default EditTrackModal;