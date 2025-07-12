import { useMutation } from '@apollo/client';
import { 
  CREATE_TRACK_MUTATION, 
  UPDATE_TRACK_MUTATION, 
  DELETE_TRACK_MUTATION, 
  BATCH_DELETE_TRACKS_MUTATION 
} from '../services/api/track';
import { 
  UPLOAD_AUDIO_FILE_MUTATION, 
  DELETE_AUDIO_FILE_MUTATION 
} from '../services/api/audioFile';

export function useCreateTrackMutation() {
  return useMutation(CREATE_TRACK_MUTATION);
}

export function useUpdateTrackMutation() {
  return useMutation(UPDATE_TRACK_MUTATION);
}

export function useDeleteTrackMutation() {
  return useMutation(DELETE_TRACK_MUTATION);
}

export function useDeleteMultipleTracksMutation() {
  return useMutation(BATCH_DELETE_TRACKS_MUTATION);
}

export function useUploadAudioFileMutation() {
  return useMutation(UPLOAD_AUDIO_FILE_MUTATION);
}

export function useDeleteAudioFileMutation() {
  return useMutation(DELETE_AUDIO_FILE_MUTATION);
} 