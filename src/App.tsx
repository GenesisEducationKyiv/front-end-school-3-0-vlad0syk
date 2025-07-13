import React from 'react';
import SearchInput from './components/SearchInput/SearchInput';
import TrackList from './components/TrackList/TrackList';
import SortSelect from './components/SortSelect/SortSelect';
import CreateTrackModal from './components/modals/CreateTrackModal';
import EditTrackModal from './components/modals/EditTrackModal';
import ConfirmDialog from './components/modals/ConfirmDialog';
import { SortOption, SortField, SortOrder } from './types';
import { useFiltersState } from './hooks/useFiltersState';
import { usePagination } from './hooks/usePagination';
import { useTracksQuery, useGenresQuery } from './hooks/useTrackQueries';
import { useTrackActions } from './hooks/useTrackActions';
import { useUIStore } from './stores/uiStore';
import { useTrackStore } from './stores/trackStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

if (typeof window !== 'undefined') {
    const win = window as Window & { Cypress?: unknown; PW_TEST?: unknown };
    if (win.Cypress || win.PW_TEST) {
        const style = document.createElement('style');
        style.innerHTML = `.Toastify__toast-container { pointer-events: none !important; }`;
        document.head.appendChild(style);
    }
}

const SORT_OPTIONS: SortOption[] = [
    { value: 'title_asc', label: 'Назва (А-Я)' },
    { value: 'title_desc', label: 'Назва (Я-А)' },
    { value: 'artist_asc', label: 'Артист (А-Я)' },
    { value: 'artist_desc', label: 'Артист (Я-А)' },
    { value: 'createdAt_desc', label: 'Дата додавання (новіші)' },
    { value: 'createdAt_asc', label: 'Дата додавання (старіші)' },
];

const validSortFields: SortField[] = ['title', 'artist', 'album', 'createdAt'];
const validSortOrders: SortOrder[] = ['asc', 'desc'];

function App() {
    const {
        params: queryParams,
        setSearch,
        setGenre,
        setArtist,
        setSortAndOrder,
        clearFilters,
        hasActiveFilters
    } = useFiltersState();

    const {
        currentPage,
        setPage: handlePageChange,
        goToPrevPage,
        canGoPrev
    } = usePagination();

    const isCreateModalOpen = useUIStore(state => state.isCreateModalOpen);
    const isEditModalOpen = useUIStore(state => state.isEditModalOpen);
    const isConfirmDialogOpen = useUIStore(state => state.isConfirmDialogOpen);
    const trackToEdit = useUIStore(state => state.trackToEdit);
    const pendingDeleteContext = useUIStore(state => state.pendingDeleteContext);
    const openCreateModal = useUIStore(state => state.openCreateModal);
    const closeCreateModal = useUIStore(state => state.closeCreateModal);
    const closeEditModal = useUIStore(state => state.closeEditModal);
    const closeConfirmDialog = useUIStore(state => state.closeConfirmDialog);

    const searchTerm = queryParams.search || '';
    const artistFilterTerm = queryParams.artist || '';
    const selectedTrackIds = useTrackStore(state => state.selectedTrackIds);

    const { data: tracksData, loading: isLoadingTracks, error: errorTracks } = useTracksQuery(queryParams);
    const { data: genresData, loading: isLoadingGenres, error: errorGenres } = useGenresQuery();

    const isErrorTracks = !!errorTracks;
    const isErrorGenres = !!errorGenres;
    const genres = genresData?.genres ?? [];

    const {
        handleBulkDelete,
        deleteTrackMutation,
        deleteMultipleTracksMutation,
        deleteFileMutation,
        createTrackMutation,
        updateTrackMutation
    } = useTrackActions();

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const [sort, order] = event.target.value.split('_');
        if (validSortFields.includes(sort as SortField) && validSortOrders.includes(order as SortOrder)) {
            setSortAndOrder(sort as SortField, order as SortOrder);
        }
    };

    const handleGenreFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setGenre(event.target.value || undefined);
    };

    const handleClearAllFilters = () => {
        clearFilters();
    };

    const paginationMeta = tracksData?.tracks?.meta;
    const currentSortValue = `${queryParams.sort || 'title'}_${queryParams.order || 'asc'}` as SortOption['value'];

    const isControlsLoading = isLoadingTracks || isLoadingGenres ||
        createTrackMutation.loading || updateTrackMutation.loading ||
        deleteTrackMutation.loading || deleteMultipleTracksMutation.loading ||
        deleteFileMutation.loading;

    if (isErrorGenres) {
        console.error("Помилка завантаження жанрів:", errorGenres);
        return <p className="text-red-500 bg-red-100 border border-red-400 rounded p-4 mb-4">Виникла помилка при завантаженні жанрів: {errorGenres?.message || 'Невідома помилка'}</p>;
    }

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
                    data-testid="search-input"
                    value={searchTerm}
                    onChange={e => setSearch(e.target.value)}
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
                        {genres && Array.isArray(genres) && genres.map((genre) => (
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
                        onChange={e => setArtist(e.target.value)}
                        placeholder="Фільтр за артистом..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isControlsLoading}
                    />
                </div>

                <button
                    data-testid="create-track-button"
                    onClick={openCreateModal}
                    disabled={createTrackMutation.loading || isControlsLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-loading={createTrackMutation.loading ? 'true' : 'false'}
                    aria-disabled={createTrackMutation.loading ? 'true' : 'false'}
                >
                    {createTrackMutation.loading ? 'Створення...' : 'Створити трек'}
                </button>

                {(() => {
                    return selectedTrackIds.size > 0 && (
                        <button
                            data-testid="bulk-delete-button"
                            onClick={handleBulkDelete}
                            disabled={deleteMultipleTracksMutation.loading || isControlsLoading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            data-loading={deleteMultipleTracksMutation.loading ? 'true' : 'false'}
                            aria-disabled={deleteMultipleTracksMutation.loading ? 'true' : 'false'}
                        >
                            {deleteMultipleTracksMutation.loading ? 'Видалення...' : `Видалити вибрані (${selectedTrackIds.size})`}
                        </button>
                    );
                })()}

                {hasActiveFilters && (
                    <button
                        onClick={handleClearAllFilters}
                        disabled={isControlsLoading}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Очистити фільтри
                    </button>
                )}
            </div>

            {isErrorTracks && (
                <div className="text-red-500 bg-red-100 border border-red-400 rounded p-4 mb-4">
                    Помилка завантаження треків: {errorTracks instanceof Error ? errorTracks.message : 'Невідома помилка'}
                </div>
            )}

            <TrackList
                data={tracksData?.tracks}
                loading={isLoadingTracks}
                error={errorTracks}
                meta={paginationMeta}
                onPageChange={handlePageChange}
            />

            {paginationMeta && paginationMeta.totalPages > 1 && (
                <div data-testid="pagination" className="flex justify-center items-center space-x-2 mt-6">
                    <button
                        data-testid="pagination-prev"
                        onClick={goToPrevPage}
                        disabled={!canGoPrev || isLoadingTracks}
                        className="px-3 py-1 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                        Назад
                    </button>
                    <span className="text-gray-400">
                        Сторінка {currentPage} з {paginationMeta.totalPages}
                    </span>
                    <button
                        data-testid="pagination-next"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= paginationMeta.totalPages || isLoadingTracks}
                        className="px-3 py-1 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                        Вперед
                    </button>
                </div>
            )}

            <CreateTrackModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
            />

            {trackToEdit?.slug && (
                <EditTrackModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    trackToEditSlug={trackToEdit.slug}
                />
            )}
            
            {pendingDeleteContext?.type === 'track' && (
                <ConfirmDialog
                    isOpen={isConfirmDialogOpen}
                    onClose={closeConfirmDialog}
                    trackId={Array.isArray(pendingDeleteContext.id) ? undefined : pendingDeleteContext.id}
                    trackIds={Array.isArray(pendingDeleteContext.id) ? pendingDeleteContext.id : undefined}
                />
            )}

            <ToastContainer />
        </div>
    );
}

export default App;