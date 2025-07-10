import { gql } from '@apollo/client';
import { apolloClient } from '../../lib/apollo-client';
import { Track } from '../../types';

export const UPLOAD_AUDIO_FILE_MUTATION = gql`
  mutation UploadAudioFile($id: ID!, $file: Upload!) {
    uploadAudioFile(id: $id, file: $file) {
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
  mutation DeleteAudioFile($id: ID!) {
    deleteAudioFile(id: $id) {
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
  const { data } = await apolloClient.mutate<{ uploadAudioFile: Track }>({
    mutation: UPLOAD_AUDIO_FILE_MUTATION,
    variables: { id, file },
  });
  return data!.uploadAudioFile;
};

export const deleteAudioFile = async (id: string): Promise<Track> => {
  const { data } = await apolloClient.mutate<{ deleteAudioFile: Track }>({
    mutation: DELETE_AUDIO_FILE_MUTATION,
    variables: { id },
  });
  return data!.deleteAudioFile;
};