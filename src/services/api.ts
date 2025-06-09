import {
    Track,
    CreateTrackDto,
    UpdateTrackDto,
    QueryParams,
    PaginatedResponse,
    Genre,
    BatchDeleteResponse,
    TrackSchema,
    PaginatedResponseSchema,
    GenreSchema,
    BatchDeleteResponseSchema,
    ApiErrorSchema
} from '../types.ts';

import { handleResponseWithZod } from './api/base.ts';

import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';

const API_BASE_URL = 'http://localhost:8000';

export const fetchTracks = async (params: QueryParams): Promise<Result<PaginatedResponse<Track>, Error>> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sort) query.append('sort', params.sort);
    if (params.order) query.append('order', params.order);
    if (params.search) query.append('search', params.search);
    if (params.genre) query.append('genre', params.genre);
    if (params.artist) query.append('artist', params.artist);

    const response = await fetch(`${API_BASE_URL}/api/tracks?${query.toString()}`);
    return handleResponseWithZod(response, PaginatedResponseSchema);
};

export const fetchGenres = async (): Promise<Result<Genre[], Error>> => {
    const response = await fetch(`${API_BASE_URL}/api/genres`);
    return handleResponseWithZod(response, z.array(GenreSchema));
};

export const createTrack = async (newTrackData: CreateTrackDto): Promise<Result<Track, Error>> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrackData),
    });
    return handleResponseWithZod(response, TrackSchema);
};

export const updateTrack = async ({ id, data }: { id: string; data: UpdateTrackDto }): Promise<Result<Track, Error>> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponseWithZod(response, TrackSchema);
};

export const deleteTrack = async (id: string): Promise<Result<void, Error>> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${id}`, {
        method: 'DELETE',
    });
    return handleResponseWithZod(response, z.void());
};

export const deleteMultipleTracks = async (ids: string[]): Promise<Result<BatchDeleteResponse, Error>> => {
    const response = await fetch(`${API_BASE_URL}/api/tracks/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });
    return handleResponseWithZod(response, BatchDeleteResponseSchema);
};

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