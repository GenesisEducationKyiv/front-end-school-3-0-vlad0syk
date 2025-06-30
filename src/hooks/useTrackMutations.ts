import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  createTrack, 
  updateTrack, 
  deleteTrack, 
  deleteMultipleTracks 
} from '../services/api/track';
import { uploadAudioFile, deleteAudioFile } from '../services/api/audioFile';
import { CreateTrackDto, UpdateTrackDto, Track, PaginatedResponse, QueryParams } from '../types';
import { useUIStore } from '../stores/uiStore';
import { useTrackStore } from '../stores/trackStore';

export function useTrackMutations(queryParams: QueryParams) {
  const queryClient = useQueryClient();
  const { closeCreateModal, closeEditModal, closeConfirmDialog } = useUIStore();
  const { clearSelections } = useTrackStore();

  const createTrackMutation = useMutation<Track, Error, CreateTrackDto>({
    mutationFn: async (newTrackData: CreateTrackDto) => {
      const result = await createTrack(newTrackData);
      if (result.isOk()) {
        return result.value;
      } else {
        throw result.error;
      }
    },
    onSuccess: (newTrack) => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      closeCreateModal();
      toast.success(`Трек "${newTrack.title}" успішно створено!`);
    },
    onError: (error: Error) => {
      console.error('Failed to create track:', error);
      closeCreateModal();
      toast.error(`Помилка створення треку: ${error.message}`);
    },
  });

  const updateTrackMutation = useMutation<Track, Error, { id: string; data: UpdateTrackDto }>({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTrackDto }) => {
      const result = await updateTrack({ id, data });
      if (result.isOk()) {
        return result.value;
      } else {
        throw result.error;
      }
    },
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

  const deleteTrackMutation = useMutation<
    undefined,
    Error,
    string,
    { previousTracksData: PaginatedResponse<Track> | undefined }
  >({
    mutationFn: async (deletedId: string) => {
      const result = await deleteTrack(deletedId);
      if (result.isOk()) {
        return undefined;
      } else {
        throw result.error;
      }
    },
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
      return { previousTracksData };
    },
    onError: (error: Error, deletedId: string, context) => {
      console.error(`Failed to delete track ${deletedId}:`, error);
      if (context?.previousTracksData) {
        queryClient.setQueryData(['tracks', queryParams], context.previousTracksData);
      }
      toast.error(`Помилка видалення треку: ${error.message}`);
    },
    onSuccess: () => {
      closeConfirmDialog();
      toast.success('Трек успішно видалено!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    }
  });

  const deleteMultipleTracksMutation = useMutation<
    { success: string[]; failed: string[] },
    Error,
    string[],
    { previousTracksData: PaginatedResponse<Track> | undefined }
  >({
    mutationFn: async (trackIds: string[]) => {
      const result = await deleteMultipleTracks(trackIds);
      if (result.isOk()) {
        return result.value;
      } else {
        throw result.error;
      }
    },
    onMutate: async (trackIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ['tracks', queryParams] });
      const previousTracksData = queryClient.getQueryData<PaginatedResponse<Track>>(['tracks', queryParams]);

      if (previousTracksData) {
        queryClient.setQueryData<PaginatedResponse<Track>>(['tracks', queryParams], (oldData: PaginatedResponse<Track> | undefined) => {
          if (!oldData) return oldData;
          const newTracks = oldData.data.filter((track: Track) => !trackIds.includes(track.id));
          return {
            ...oldData,
            data: newTracks,
            meta: { ...oldData.meta, total: Math.max(0, oldData.meta.total - trackIds.length) }
          };
        });
      }
      clearSelections();
      return { previousTracksData };
    },
    onError: (error: Error, trackIds: string[], context) => {
      console.error(`Failed to delete tracks ${trackIds}:`, error);
      if (context?.previousTracksData) {
        queryClient.setQueryData(['tracks', queryParams], context.previousTracksData);
      }
      toast.error(`Помилка видалення треків: ${error.message}`);
    },
    onSuccess: (result) => {
      closeConfirmDialog();
      if (result.success.length > 0) {
        toast.success(`${result.success.length} треків успішно видалено!`);
      }
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} треків не вдалося видалити`);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    }
  });

  const uploadFileMutation = useMutation<Track, Error, { id: string; file: File }>({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const result = await uploadAudioFile({ id, file });
      if (result.isOk()) {
        return result.value;
      } else {
        throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('Аудіофайл успішно завантажено!');
    },
    onError: (error: Error) => {
      console.error('Failed to upload audio file:', error);
      toast.error(`Помилка завантаження аудіофайлу: ${error.message}`);
    }
  });

  const deleteFileMutation = useMutation<Track, Error, string>({
    mutationFn: async (trackId: string) => {
      const result = await deleteAudioFile(trackId);
      if (result.isOk()) {
        return result.value;
      } else {
        throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      closeConfirmDialog();
      toast.success('Аудіофайл успішно видалено!');
    },
    onError: (error: Error) => {
      console.error('Failed to delete audio file:', error);
      toast.error(`Помилка видалення аудіофайлу: ${error.message}`);
    }
  });

  return {
    createTrackMutation,
    updateTrackMutation,
    deleteTrackMutation,
    deleteMultipleTracksMutation,
    uploadFileMutation,
    deleteFileMutation
  };
} 