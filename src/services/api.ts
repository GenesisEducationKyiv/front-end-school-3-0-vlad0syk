// This file contains functions for making API calls to the backend.
import { Track, CreateTrackDto, UpdateTrackDto, QueryParams, PaginatedResponse, Genre, BatchDeleteResponse } from '../types.ts';

// Base URL of your API server
// Make sure this matches your backend's address
const API_BASE_URL = 'http://localhost:8000'; // REPLACE WITH YOUR SERVER ADDRESS IF DIFFERENT

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
    // Check if the response status is OK (2xx range)
    if (!response.ok) {
        // Attempt to parse error details from the response body
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('API Error:', response.status, errorData);
        // Throw an error with details from the backend or HTTP status
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }
    // For 204 No Content responses (like successful DELETE), there is no body
    if (response.status === 204) {
         return undefined as T; // Return undefined for void promises
    }
    // Parse the JSON response body for successful requests
    return response.json() as Promise<T>;
}


// --- API Call Functions ---

// GET /tracks - Fetch a list of tracks with pagination, sorting, filtering, and search
export const fetchTracks = async (params: QueryParams): Promise<PaginatedResponse<Track>> => {
    // Construct query string from parameters
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

// GET /genres - Fetch a list of available genres
export const fetchGenres = async (): Promise<Genre[]> => {
    const response = await fetch(`${API_BASE_URL}/api/genres`);
    return handleResponse<Genre[]>(response);
};

// POST /tracks - Create a new track
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

// PUT /tracks/{id} - Update an existing track by ID
export const updateTrack = async ({ id, data }: { id: string; data: UpdateTrackDto }): Promise<Track> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send only the updated data
    });
    return handleResponse<Track>(response);
};

// DELETE /tracks/{id} - Delete a track by ID
export const deleteTrack = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}`, {
        method: 'DELETE',
    });
    // handleResponse will return undefined for 204 status
    await handleResponse<void>(response);
};

// POST /tracks/delete - Delete multiple tracks by IDs
export const deleteMultipleTracks = async (ids: string[]): Promise<BatchDeleteResponse> => {
     const response = await fetch(`${API_BASE_URL}/api/tracks/delete`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({ ids }), // Send array of IDs in the body
     });
     return handleResponse<BatchDeleteResponse>(response);
};

// POST /tracks/{id}/upload - Upload an audio file for a track
export const uploadAudioFile = async ({ id, file }: { id: string; file: File }): Promise<Track> => {
    const formData = new FormData();
    formData.append('file', file); // 'file' should match the expected key on the server

    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}/upload`, {
        method: 'POST',
        body: formData, // Use FormData body
        // Do NOT manually set Content-Type for FormData, browser handles it
    });
    return handleResponse<Track>(response);
};

// DELETE /tracks/{id}/file - Delete the audio file associated with a track
export const deleteAudioFile = async (id: string): Promise<Track> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}/file`, {
        method: 'DELETE',
    });
    // Expect the updated track object in the response body after deletion
    return handleResponse<Track>(response);
};