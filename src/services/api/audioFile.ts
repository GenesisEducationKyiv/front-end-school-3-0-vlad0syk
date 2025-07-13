import { gql } from '@apollo/client';
import { apolloClient } from '../../lib/apollo-client';
import { Track } from '../../types';

export const UPLOAD_AUDIO_FILE_MUTATION = gql`
  mutation UploadTrackFile($id: ID!, $file: Upload!) {
    uploadTrackFile(id: $id, file: $file) {
      id
      title
      artist
      album
      genres
      slug
      coverImage
      audioFile
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_AUDIO_FILE_MUTATION = gql`
  mutation DeleteTrackFile($id: ID!) {
    deleteTrackFile(id: $id) {
      id
      title
      artist
      album
      genres
      slug
      coverImage
      audioFile
      createdAt
      updatedAt
    }
  }
`;

export const uploadAudioFile = async ({ id, file }: { id: string; file: File }): Promise<Track> => {
  const { data } = await apolloClient.mutate<{ uploadTrackFile: Track }>({
    mutation: UPLOAD_AUDIO_FILE_MUTATION,
    variables: { id, file },
  });
  if (!data) {
    throw new Error('Failed to upload audio file');
  }
  return data.uploadTrackFile;
};

export const deleteAudioFile = async (id: string): Promise<Track> => {
  const { data } = await apolloClient.mutate<{ deleteTrackFile: Track }>({
    mutation: DELETE_AUDIO_FILE_MUTATION,
    variables: { id },
  });
  if (!data) {
    throw new Error('Failed to delete audio file');
  }
  return data.deleteTrackFile;
};