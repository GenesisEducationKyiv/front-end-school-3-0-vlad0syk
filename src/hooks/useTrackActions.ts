import { useCallback } from 'react';
import { TrackIdType } from '../types';
import { useUIStore } from '../stores/uiStore';
import { useTrackStore } from '../stores/trackStore';
import { useTrackMutations } from './useTrackMutations';
import { QueryParams } from '../types';

export function useTrackActions(queryParams: QueryParams) {
  const { 
    openConfirmDialog 
  } = useUIStore();
  
  const { 
    selectTrack, 
    deselectTrack, 
    setPlayingTrack, 
    setSearchTerm, 
    setArtistFilterTerm,
    clearSearchTerms 
  } = useTrackStore();
  
  const {
    deleteTrackMutation,
    deleteMultipleTracksMutation,
    uploadFileMutation,
    deleteFileMutation,
    createTrackMutation,
    updateTrackMutation
  } = useTrackMutations(queryParams);

  const handleSelectTrack = useCallback((id: TrackIdType) => {
    selectTrack(id);
  }, [selectTrack]);

  const handleDeselectTrack = useCallback((id: TrackIdType) => {
    deselectTrack(id);
  }, [deselectTrack]);

  const handlePlayToggle = useCallback((id: TrackIdType) => {
    const currentState = useTrackStore.getState();
    const isCurrentlyPlaying = currentState.playingTrackId === id;
    
    // If the same track is playing, pause it (set to null)
    // If a different track is playing or no track is playing, play this track
    setPlayingTrack(isCurrentlyPlaying ? null : id);
  }, [setPlayingTrack]);

  const handleDeleteTrack = useCallback((id: TrackIdType) => {
    openConfirmDialog(
      'Ви впевнені, що хочете видалити цей трек?',
      { type: 'track', id }
    );
  }, [openConfirmDialog]);

  const handleBulkDelete = useCallback(() => {
    const selectedIds = Array.from(useTrackStore.getState().selectedTrackIds);
    if (selectedIds.length > 0) {
      openConfirmDialog(
        `Ви впевнені, що хочете видалити ${selectedIds.length} вибраних треків?`,
        { type: 'track', id: selectedIds }
      );
    }
  }, [openConfirmDialog]);

  const handleDeleteFileWithConfirmation = useCallback((id: TrackIdType) => {
    openConfirmDialog(
      'Ви впевнені, що хочете видалити аудіофайл цього треку?',
      { type: 'file', id }
    );
  }, [openConfirmDialog]);

  const handleUploadFile = useCallback(async (id: TrackIdType, file: File) => {
    uploadFileMutation.mutate({ id, file });
  }, [uploadFileMutation]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, [setSearchTerm]);

  const handleArtistFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setArtistFilterTerm(event.target.value);
  }, [setArtistFilterTerm]);

  const handleClearFilters = useCallback(() => {
    clearSearchTerms();
  }, [clearSearchTerms]);

  return {
    // Track selection
    handleSelectTrack,
    handleDeselectTrack,
    
    // Track actions
    handlePlayToggle,
    handleDeleteTrack,
    handleBulkDelete,
    handleUploadFile,
    handleDeleteFileWithConfirmation,
    
    // Search and filters
    handleSearchChange,
    handleArtistFilterChange,
    handleClearFilters,
    
    // Mutations
    deleteTrackMutation,
    deleteMultipleTracksMutation,
    uploadFileMutation,
    deleteFileMutation,
    createTrackMutation,
    updateTrackMutation
  };
} 