import { Track, CreateTrackDto, UpdateTrackDto, QueryParams, PaginatedResponse, Genre, BatchDeleteResponse } from '../types.ts';

const API_BASE_URL = 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) {
         return undefined as T;
    }
    return response.json() as Promise<T>;
}

export const fetchTracks = async (params: QueryParams): Promise<PaginatedResponse<Track>> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sort) query.append('sort', params.sort);
    if (params.order) query.append('order', params.order);
    if (params.search) query.append('search', params.search);
    if (params.genre) query.append('genre', params.genre);
    if (params.artist) query.append('artist', params.artist);

    const response = await fetch(`${API_BASE_URL}/api/tracks?${query.toString()}`);
    return handleResponse<PaginatedResponse<Track>>(response);
};

export const fetchGenres = async (): Promise<Genre[]> => {
    const response = await fetch(`${API_BASE_URL}/api/genres`);
    return handleResponse<Genre[]>(response);
};

export const createTrack = async (newTrackData: CreateTrackDto): Promise<Track> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrackData),
    });
    return handleResponse<Track>(response);
};

export const updateTrack = async ({ id, data }: { id: string; data: UpdateTrackDto }): Promise<Track> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse<Track>(response);
};

export const deleteTrack = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}`, {
        method: 'DELETE',
    });
    await handleResponse<void>(response);
};

export const deleteMultipleTracks = async (ids: string[]): Promise<BatchDeleteResponse> => {
     const response = await fetch(`${API_BASE_URL}/api/tracks/delete`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({ ids }),
     });
     return handleResponse<BatchDeleteResponse>(response);
};

export const uploadAudioFile = async ({ id, file }: { id: string; file: File }): Promise<Track> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}/upload`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse<Track>(response);
};

export const deleteAudioFile = async (id: string): Promise<Track> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}/file`, {
        method: 'DELETE',
    });
    return handleResponse<Track>(response);
};