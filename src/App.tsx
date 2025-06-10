import React, { useState, useCallback } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import SearchInput from './components/SearchInput/SearchInput';
import TrackList from './components/TrackList/TrackList';
import SortSelect from './components/SortSelect/SortSelect';
import CreateTrackModal from './components/modals/CreateTrackModal';
import EditTrackModal from './components/modals/EditTrackModal';
import ConfirmDialog from './components/modals/ConfirmDialog';
import {
    fetchTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    deleteMultipleTracks,
    fetchGenres,
    uploadAudioFile,
    deleteAudioFile,
} from './services/api';
import {
    Track,
    SortOption,
    QueryParams,
    CreateTrackDto,
    UpdateTrackDto,
    Genre,
    BatchDeleteResponse,
    PaginatedResponse
} from './types';
import { debounce } from 'lodash';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SORT_OPTIONS: SortOption[] = [
    { value: 'title_asc', label: 'Назва (А-Я)' },
    { value: 'title_desc', label: 'Назва (Я-А)' },
    { value: 'artist_asc', label: 'Артист (А-Я)' },
    { value: 'artist_desc', label: 'Артист (Я-А)' },
    { value: 'createdAt_desc', label: 'Дата додавання (новіші)' },
    { value: 'createdAt_asc', label: 'Дата додавання (старіші)' },
];

function App() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [trackToEdit, setTrackToEdit] = useState<Track | null>(null);

    const [selectedTrackIds, setSelectedTrackIds] = useState<Set<Track['id']>>(new Set());

    const [queryParams, setQueryParams] = useState<QueryParams>({
        page: 1,
        limit: 12,
        sort: 'title',
        order: 'asc',
        search: '',
        genre: undefined,
        artist: undefined,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [artistFilterTerm, setArtistFilterTerm] = useState('');

    const [playingTrackId, setPlayingTrackId] = useState<Track['id'] | null>(null);

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
    const [pendingDeleteContext, setPendingDeleteContext] =
         useState<{ type: 'track'; id: string | string[] } | { type: 'file'; id: string } | null>(null);

    const queryClient = useQueryClient();

    const {
        data: tracksData,
        isLoading: isLoadingTracks,
        isError: isErrorTracks,
        error: errorTracks,
    } = useQuery({
        queryKey: ['tracks', queryParams],
        queryFn: () => fetchTracks(queryParams),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60,
        retry: 1,
    });

    const { data: genres, isLoading: isLoadingGenres, isError: isErrorGenres, error: errorGenres } = useQuery<Genre[]>({
        queryKey: ['genres'],
        queryFn: fetchGenres,
        staleTime: Infinity,
        retry: false,
    });

    const createTrackMutation = useMutation({
        mutationFn: createTrack,
        onSuccess: (newTrack) => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
            closeCreateModal();
            toast.success(`Трек "${newTrack.title}" успішно створено!`);
        },
        onError: (error: Error) => {
            console.error('Failed to create track:', error);
            toast.error(`Помилка створення треку: ${error.message}`);
        },
    });

    const updateTrackMutation = useMutation({
        mutationFn: updateTrack,
        onSuccess: (updatedTrack) => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
            closeEditModal();
            toast.success(`Трек "${updatedTrack.title}" успішно оновлено!`);
        },
        onError: (error: Error, variables) => {
             console.error(`Failed to update track ${variables.id}:`, error);
             toast.error(`Помилка оновлення треку: ${error.message}`);
        }
    });

    const deleteTrackMutation = useMutation({
        mutationFn: deleteTrack,
        onMutate: async (deletedId: string) => {
            await queryClient.cancelQueries({ queryKey: ['tracks', queryParams] });
            const previousTracksData = queryClient.getQueryData<PaginatedResponse<Track>>(['tracks', queryParams]);

            if (previousTracksData) {
                queryClient.setQueryData<PaginatedResponse<Track>>(['tracks', queryParams], (oldData: PaginatedResponse<Track> | undefined) => {
                    if (!oldData) return oldData;
                    const newTracks = oldData.data.filter((track: Track) => track.id !== deletedId);
                    return {
                        ...oldData,
                        data: newTracks,
                        meta: { ...oldData.meta, total: oldData.meta.total > 0 ? oldData.meta.total - 1 : 0 }
                    };
                });
            }
            setSelectedTrackIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(deletedId);
                return newSet;
            });
            closeConfirmDialog();
            toast.success('Трек успішно видалено (оптимістично).');

            return { previousTracksData };
        },
        onError: (error: Error, deletedId: string, context) => {
             console.error(`Failed to delete track ${deletedId}:`, error);
             if (context?.previousTracksData) {
                 queryClient.setQueryData<PaginatedResponse<Track>>(['tracks', queryParams], context.previousTracksData);
             }
             toast.error(`Помилка видалення треку: ${error.message}`);
        },
        onSuccess: (_, deletedId) => {
            console.log('Track deleted successfully on server:', deletedId);
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
        },
    });

    const deleteMultipleTracksMutation = useMutation({
        mutationFn: deleteMultipleTracks,
         onMutate: async (deletedIds: string[]) => {
             await queryClient.cancelQueries({ queryKey: ['tracks', queryParams] });
             const previousTracksData = queryClient.getQueryData<PaginatedResponse<Track>>(['tracks', queryParams]);

             if (previousTracksData) {
                 queryClient.setQueryData<PaginatedResponse<Track>>(['tracks', queryParams], (oldData: PaginatedResponse<Track> | undefined) => {
                     if (!oldData) return oldData;
                     const newTracks = oldData.data.filter((track: Track) => !deletedIds.includes(track.id));
                     return {
                         ...oldData,
                         data: newTracks,
                         meta: { ...oldData.meta, total: oldData.meta.total > deletedIds.length ? oldData.meta.total - deletedIds.length : 0 }
                     };
                 });
             }
             setSelectedTrackIds(new Set());
             closeConfirmDialog();
             toast.success(`Успішно видалено ${deletedIds.length} треків (оптимістично).`);

             return { previousTracksData };
         },
         onError: (error: Error, deletedIds: string[], context) => {
             console.error('Failed to delete multiple tracks:', error);
             if (context?.previousTracksData) {
                 queryClient.setQueryData<PaginatedResponse<Track>>(['tracks', queryParams], context.previousTracksData);
             }
             toast.error(`Помилка масового видалення: ${error.message}`);
         },
         onSuccess: (result: BatchDeleteResponse) => {
             console.log('Tracks deleted successfully on server:', result);
             queryClient.invalidateQueries({ queryKey: ['tracks'] });
         },
    });

     const uploadFileMutation = useMutation({
         mutationFn: ({ id, file }: { id: string; file: File }) => uploadAudioFile({ id, file }),
         onSuccess: (updatedTrack) => {
             queryClient.invalidateQueries({ queryKey: ['tracks'] });
             toast.success(`Файл для треку "${updatedTrack.title}" успішно завантажено!`);
         },
         onError: (error: Error, variables) => {
              console.error(`Failed to upload file for track ${variables.id}:`, error);
              toast.error(`Помилка завантаження файлу: ${error.message}`);
         },
     });

     const deleteFileMutation = useMutation({
          mutationFn: (id: string) => deleteAudioFile(id),
          onSuccess: (updatedTrack) => {
              queryClient.invalidateQueries({ queryKey: ['tracks'] });
               if (playingTrackId === updatedTrack.id) {
                    setPlayingTrackId(null);
               }
               closeConfirmDialog();
               toast.success(`Файл для треку "${updatedTrack.title}" успішно видалено.`);
          },
          onError: (error: Error, deletedId) => {
              console.error(`Failed to delete file for track ${deletedId}:`, error);
              closeConfirmDialog();
              toast.error(`Помилка видалення файлу: ${error.message}`);
          },
     });

    // --- Modal Handlers ---
    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
    }
    const openEditModal = (track: Track) => {
        setTrackToEdit(track);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setTrackToEdit(null);
    };

     // Handler to open the custom confirmation dialog
     const openConfirmDialog = (message: string, context: { type: 'track'; id: string | string[] } | { type: 'file'; id: string }) => {
         setConfirmDialogMessage(message);
         setPendingDeleteContext(context);
         setIsConfirmDialogOpen(true);
     };

     // Handler to close the custom confirmation dialog
     const closeConfirmDialog = () => {
         setIsConfirmDialogOpen(false);
         setConfirmDialogMessage('');
         setPendingDeleteContext(null);
     };

      // Handler called when confirming delete action in the dialog
      const handleConfirmDelete = () => {
          if (pendingDeleteContext) {
              if (pendingDeleteContext.type === 'track') {
                  if (Array.isArray(pendingDeleteContext.id)) {
                      deleteMultipleTracksMutation.mutate(pendingDeleteContext.id);
                  } else {
                      deleteTrackMutation.mutate(pendingDeleteContext.id);
                  }
              } else if (pendingDeleteContext.type === 'file') {
                   deleteFileMutation.mutateAsync(pendingDeleteContext.id);
              }
          }
      };

    // Handler for play/pause toggle
     const handlePlayToggle = (id: Track['id']) => {
         // If clicking the currently playing track, pause it
         if (playingTrackId === id) {
             setPlayingTrackId(null);
         } else {
             // If clicking a different track or nothing is playing, start playing this track
             setPlayingTrackId(id);
         }
     };

    // --- Filter, Sort, Pagination Handlers ---

    // Search handler (debounced for performance)
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            setQueryParams(prev => ({ ...prev, search: term.trim(), page: 1 }));
        }, 500),
        []
    );
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term); // Update local state immediately for input value
        debouncedSearch(term); // Update queryParams with debounce
    };

    // Sort handler
    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortValue = event.target.value as SortOption['value'];
        const [sortField, sortOrder] = newSortValue.split('_') as [QueryParams['sort'], QueryParams['order']];
        setQueryParams(prev => ({
            ...prev,
            sort: sortField,
            order: sortOrder,
            page: 1,
        }));
    };

     // Genre filter handler
     const handleGenreFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
          const selectedGenre = event.target.value === '' ? undefined : event.target.value;
          setQueryParams(prev => ({
              ...prev,
              genre: selectedGenre,
              page: 1,
          }));
     };

     const debouncedArtistFilter = useCallback(
         debounce((term: string) => {
             setQueryParams(prev => ({ ...prev, artist: term.trim() || undefined, page: 1 }));
         }, 500),
         []
     );
     const handleArtistFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         const term = event.target.value;
         setArtistFilterTerm(term);
         debouncedArtistFilter(term);
     };

    const handlePageChange = (newPage: number) => {
        if (paginationMeta && newPage >= 1 && newPage <= paginationMeta.totalPages) {
             setQueryParams(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleSelectTrack = useCallback((id: Track['id']) => {
        setSelectedTrackIds(prevSelectedIds => {
            const newSelectedIds = new Set(prevSelectedIds);
            if (newSelectedIds.has(id)) {
                newSelectedIds.delete(id);
            } else {
                newSelectedIds.add(id);
            }
            return newSelectedIds;
        });
    }, []);

    const handleEditTrack = (id: Track['id']) => {
         const track = tracksData?.data?.find((t: Track) => t.id === id);
         if (track) {
             openEditModal(track);
         } else {
             console.warn(`Track with id ${id} not found in current data for editing.`);
              toast.error(`Трек з ID ${id} не знайдено в поточних даних.`);
         }
    };

    const handleDeleteTrack = (id: Track['id']) => {
         openConfirmDialog(`Ви впевнені, що хочете видалити цей трек?`, { type: 'track', id: id });
    };

    const handleBulkDelete = () => {
        if (selectedTrackIds.size === 0) return;
         openConfirmDialog(`Ви впевнені, що хочете видалити ${selectedTrackIds.size} вибраних треків?`, { type: 'track', id: Array.from(selectedTrackIds) });
    }

    const handleDeleteFileWithConfirmation = (id: Track['id']) => {
        openConfirmDialog(`Ви впевнені, що хочете видалити аудіофайл для цього треку?`, { type: 'file', id: id });
    };

    const handleUploadFile = async (id: Track['id'], file: File) => {
        await uploadFileMutation.mutateAsync({ id, file });
    };

    const handleCreateSubmit = (newTrackData: CreateTrackDto) => {
        createTrackMutation.mutate(newTrackData);
    };

    const handleEditSubmit = (updatedData: UpdateTrackDto) => {
        if (!trackToEdit || Object.keys(updatedData).length === 0) {
            console.log("No track to edit or no changes.");
            closeEditModal();
            return;
        }
        updateTrackMutation.mutate({ id: trackToEdit.id, data: updatedData });
    };

    const tracks = tracksData?.data ?? [];
    const paginationMeta = tracksData?.meta;
    const currentSortValue = `${queryParams.sort}_${queryParams.order}` as SortOption['value'];

     const isControlsLoading = isLoadingTracks || isLoadingGenres ||
                                createTrackMutation.isPending || updateTrackMutation.isPending ||
                                deleteTrackMutation.isPending || deleteMultipleTracksMutation.isPending ||
                                uploadFileMutation.isPending || deleteFileMutation.isPending;

    return (
        <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
            <h1 data-testid="tracks-header" className="text-3xl font-bold mb-6">
                My tracks
            </h1>

            <div
                className="controls flex flex-wrap gap-4 items-center mb-6"
                data-loading={isControlsLoading ? 'true' : 'false'}
                aria-disabled={isControlsLoading ? 'true' : 'false'}
            >
                <SearchInput
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Пошук за назвою/артистом..."
                    disabled={isControlsLoading}
                />
                <SortSelect
                    options={SORT_OPTIONS}
                    value={currentSortValue}
                    onChange={handleSortChange}
                    disabled={isControlsLoading}
                />

                <div className="relative">
                    <label htmlFor="genre-filter" className="sr-only">Фільтр за жанром</label>
                    <select
                        data-testid="filter-genre"
                        id="genre-filter"
                        value={queryParams.genre || ''}
                        onChange={handleGenreFilterChange}
                        className="px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                        disabled={isControlsLoading || isLoadingGenres || isErrorGenres}
                    >
                        <option value="">Всі жанри</option>
                        {genres && Array.isArray(genres) && genres.map((genre: Genre) => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                    {isLoadingGenres && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">...</span>}
                    {isErrorGenres && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">!</span>}
                </div>

                <div className="relative w-full max-w-xs">
                    <label htmlFor="artist-filter" className="sr-only">Фільтр за артистом</label>
                    <input
                        data-testid="filter-artist"
                        type="text"
                        id="artist-filter"
                        value={artistFilterTerm}
                        onChange={handleArtistFilterChange}
                        placeholder="Фільтр за артистом..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isControlsLoading}
                    />
                </div>

                <button
                    data-testid="create-track-button"
                    onClick={openCreateModal}
                    disabled={createTrackMutation.isPending || isControlsLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-loading={createTrackMutation.isPending ? 'true' : 'false'}
                    aria-disabled={createTrackMutation.isPending ? 'true' : 'false'}
                >
                    {createTrackMutation.isPending ? 'Створення...' : 'Створити трек'}
                </button>

                {selectedTrackIds.size > 0 && (
                    <button
                        data-testid="bulk-delete-button"
                        onClick={handleBulkDelete}
                        disabled={deleteMultipleTracksMutation.isPending || isControlsLoading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        data-loading={deleteMultipleTracksMutation.isPending ? 'true' : 'false'}
                        aria-disabled={deleteMultipleTracksMutation.isPending ? 'true' : 'false'}
                    >
                        {deleteMultipleTracksMutation.isPending ? 'Видалення...' : `Видалити вибрані (${selectedTrackIds.size})`}
                    </button>
                 )}
            </div>

            {isErrorTracks && (
                <div className="text-red-500 bg-red-100 border border-red-400 rounded p-4 mb-4">
                    Помилка завантаження треків: {errorTracks instanceof Error ? errorTracks.message : 'Невідома помилка'}
                </div>
            )}

            <TrackList
                tracks={tracks}
                isLoading={isLoadingTracks}
                selectedTrackIds={selectedTrackIds}
                onSelectTrack={handleSelectTrack}
                onEditTrack={handleEditTrack}
                onDeleteTrack={handleDeleteTrack}
                onUploadFile={handleUploadFile}
                onDeleteFileWithConfirmation={handleDeleteFileWithConfirmation}
                playingTrackId={playingTrackId}
                onPlayToggle={handlePlayToggle}
            />

            {paginationMeta && paginationMeta.totalPages > 1 && (
                <div data-testid="pagination" className="flex justify-center items-center space-x-2 mt-6">
                   <button
                        data-testid="pagination-prev"
                        onClick={() => handlePageChange(paginationMeta.page - 1)}
                        disabled={paginationMeta.page <= 1 || isLoadingTracks}
                        className="px-3 py-1 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                        Назад
                    </button>
                    <span className="text-gray-400">
                        Сторінка {paginationMeta.page} з {paginationMeta.totalPages}
                    </span>
                    <button
                        data-testid="pagination-next"
                        onClick={() => handlePageChange(paginationMeta.page + 1)}
                        disabled={paginationMeta.page >= paginationMeta.totalPages || isLoadingTracks}
                        className="px-3 py-1 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                        Вперед
                    </button>
                </div>
            )}

            <CreateTrackModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                onSubmit={handleCreateSubmit}
                isSubmitting={createTrackMutation.isPending}
                availableGenres={genres || []}
                isLoadingGenres={isLoadingGenres}
                isErrorGenres={isErrorGenres}
            />

            <EditTrackModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                onSave={handleEditSubmit}
                trackToEdit={trackToEdit}
                isSaving={updateTrackMutation.isPending}
                availableGenres={genres || []}
                isLoadingGenres={isLoadingGenres}
                isErrorGenres={isErrorGenres}
            />

            <ConfirmDialog
                isOpen={isConfirmDialogOpen}
                onClose={closeConfirmDialog}
                onConfirm={handleConfirmDelete}
                message={confirmDialogMessage}
                isConfirming={deleteTrackMutation.isPending || deleteMultipleTracksMutation.isPending || deleteFileMutation.isPending}
            />

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                data-testid="toast-container"
            />
        </div>
    );
}

export default App;