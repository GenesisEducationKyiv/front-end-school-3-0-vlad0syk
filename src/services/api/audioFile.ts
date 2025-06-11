import { Result } from 'neverthrow';
import { Track, TrackSchema } from '../../types.ts';
import { handleResponseWithZod, API_BASE_URL } from './base.ts';

export const uploadAudioFile = async ({ id, file }: { id: string; file: File }): Promise<Result<Track, Error>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}/upload`, {
        method: 'POST',
        body: formData,
    });
    return handleResponseWithZod(response, TrackSchema);
};

export const deleteAudioFile = async (id: string): Promise<Result<Track, Error>> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}/file`, {
        method: 'DELETE',
    });
    return handleResponseWithZod(response, TrackSchema);
};