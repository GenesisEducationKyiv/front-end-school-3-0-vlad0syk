import { Result } from 'neverthrow';
import { QueryParams, PaginatedResponse, PaginatedResponseSchema, Track, CreateTrackDto, TrackSchema, UpdateTrackDto, BatchDeleteResponse, BatchDeleteResponseSchema } from '../../types.ts';
import { handleResponseWithZod, API_BASE_URL } from './base.ts';
import { z } from 'zod';
import * as Belt from '@mobily/ts-belt';

export const fetchTracks = async (
  params: QueryParams
): Promise<Result<PaginatedResponse<Track>, Error>> => {
    const paramPairs = [
        Belt.O.Some(`page=${params.page}`),
        Belt.O.Some(`limit=${params.limit}`),
        Belt.O.Some(`sort=${params.sort}`),
        Belt.O.Some(`order=${params.order}`),
        Belt.O.map(Belt.O.fromNullable(params.search), (s) => `search=${encodeURIComponent(s)}`),
        Belt.O.map(Belt.O.fromNullable(params.genre), (g) => `genre=${encodeURIComponent(g)}`),
        Belt.O.map(Belt.O.fromNullable(params.artist), (a) => `artist=${encodeURIComponent(a)}`),
    ];

  const query = Belt.A.keepMap(paramPairs, (x) => x).join('&');
  const url = `${API_BASE_URL}/api/tracks?${query}`;

  const response = await fetch(url);
  return handleResponseWithZod(response, PaginatedResponseSchema);
};

// export const fetchTracks = async (params: QueryParams): Promise<Result<PaginatedResponse<Track>, Error>> => {
//     const query = new URLSearchParams();
//     if (params.page) query.append('page', params.page.toString());
//     if (params.limit) query.append('limit', params.limit.toString());
//     if (params.sort) query.append('sort', params.sort);
//     if (params.order) query.append('order', params.order);
//     if (params.search) query.append('search', params.search);
//     if (params.genre) query.append('genre', params.genre);
//     if (params.artist) query.append('artist', params.artist);

//     const response = await fetch(`${API_BASE_URL}/api/tracks?${query.toString()}`);
//     return handleResponseWithZod(response, PaginatedResponseSchema);
// };

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