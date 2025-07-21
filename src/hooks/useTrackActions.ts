import { useCallback } from 'react';
import { TrackIdType } from '../types';
import { useUIStore } from '../stores/uiStore';
import { useTrackStore } from '../stores/trackStore';
import {
  useCreateTrackMutation,
  useUpdateTrackMutation,
  useDeleteTrackMutation,
  useDeleteMultipleTracksMutation,
  useUploadAudioFileMutation,
  useDeleteAudioFileMutation,
} from './useTrackMutations';

export function useTrackActions() {
  const { openConfirmDialog } = useUIStore();
  const {
    selectTrack,
    deselectTrack,
    setPlayingTrack,
    setSearchTerm,
    setArtistFilterTerm,
    clearSearchTerms,
  } = useTrackStore();

  const [createTrack, createTrackMutation] = useCreateTrackMutation();
  const [updateTrack, updateTrackMutation] = useUpdateTrackMutation();
  const [deleteTrack, deleteTrackMutation] = useDeleteTrackMutation();
  const [deleteMultipleTracks, deleteMultipleTracksMutation] = useDeleteMultipleTracksMutation();
  const [uploadAudioFile, uploadAudioFileMutation] = useUploadAudioFileMutation();
  const [deleteAudioFile, deleteAudioFileMutation] = useDeleteAudioFileMutation();

  const handleSelectTrack = useCallback((id: TrackIdType) => {
    selectTrack(id);
  }, [selectTrack]);

  const handleDeselectTrack = useCallback((id: TrackIdType) => {
    deselectTrack(id);
  }, [deselectTrack]);

  const handlePlayToggle = useCallback((id: TrackIdType) => {
    const currentState = useTrackStore.getState();
    const isCurrentlyPlaying = currentState.playingTrackId === id;
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

  // Приклад використання мутацій:
  // await deleteTrack({ variables: { id: trackId } });
  // await updateTrack({ variables: { id: trackId, data: updateData } });
  // await deleteMultipleTracks({ variables: { ids: selectedIds } });
  // await uploadAudioFile({ variables: { id: trackId, file } });
  // await deleteAudioFile({ variables: { id: trackId } });

  const handleUploadFile = useCallback(async (id: TrackIdType, file: File) => {
    await uploadAudioFile({ variables: { id, file } });
  }, [uploadAudioFile]);

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
    handleSelectTrack,
    handleDeselectTrack,
    handlePlayToggle,
    handleDeleteTrack,
    handleBulkDelete,
    handleUploadFile,
    handleDeleteFileWithConfirmation,
    handleSearchChange,
    handleArtistFilterChange,
    handleClearFilters,
    createTrack,
    updateTrack,
    deleteTrack,
    deleteMultipleTracks,
    uploadAudioFile,
    deleteAudioFile,
    createTrackMutation,
    updateTrackMutation,
    deleteTrackMutation,
    deleteMultipleTracksMutation,
    uploadAudioFileMutation,
    deleteFileMutation: deleteAudioFileMutation,
  };
} 