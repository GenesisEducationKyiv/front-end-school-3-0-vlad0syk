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

import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';

const API_BASE_URL = 'http://localhost:8000';

async function handleResponseWithZod<T>(
    response: Response,
    schema: z.ZodSchema<T>
): Promise<Result<T, Error>> {
    try {
        if (!response.ok) {
            let errorDetails: unknown = { error: `HTTP error! status: ${response.status}` };
            let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;

            const errorHasBody = response.headers.get('content-length') !== '0' && response.headers.get('content-type')?.includes('application/json');

            if (errorHasBody) {
                try {
                    const jsonError = await response.json();
                    const parsedApiError = ApiErrorSchema.safeParse(jsonError);

                    if (parsedApiError.success) {
                        errorDetails = parsedApiError.data;
                        errorMessage = parsedApiError.data.error || parsedApiError.data.error || errorMessage;
                    } else {
                        errorDetails = { error: JSON.stringify(jsonError) || `HTTP error! status: ${response.status}` };
                        errorMessage = JSON.stringify(jsonError) || `HTTP error! status: ${response.status}`;
                    }
                } catch (jsonParseError) {
                    errorDetails = { error: `HTTP error! status: ${response.status}. Could not parse error response.` };
                    errorMessage = `HTTP error! status: ${response.status}. Could not parse error response.`;
                    console.warn("Failed to parse error response as JSON:", jsonParseError);
                }
            } else {
                errorDetails = { error: `HTTP error! status: ${response.status}. No JSON error body.` };
                errorMessage = `HTTP error! status: ${response.status}. No JSON error body.`;
            }
            console.error('API Error:', response.status, errorDetails);
            return err(new Error(errorMessage));
        }

        const contentLength = response.headers.get('content-length');
        const isResponseEmpty = response.status === 204 || (contentLength !== null && parseInt(contentLength) === 0);
        const isContentTypeJson = response.headers.get('content-type')?.includes('application/json');

        if (schema instanceof z.ZodVoid) {
            if (isResponseEmpty) {
                return ok(undefined as T);
            } else {
                let rawData: unknown;
                try {
                    if (isContentTypeJson) {
                        rawData = await response.json();
                        if (typeof rawData === 'object' && rawData !== null && Object.keys(rawData).length === 0) {
                            return ok(undefined as T);
                        }
                    } else {
                        const textData = await response.text();
                        if (textData.trim() === '') {
                             return ok(undefined as T);
                        }
                        return err(new Error(`Expected empty response for void schema, but got non-JSON text: ${textData}`));
                    }
                } catch (e) {
                    return err(new Error(`Expected void response, but got invalid content or parsing error: ${e}`));
                }
                console.error('Expected void response, but got unexpected non-empty data for void schema:', rawData);
                return err(new Error(`Expected void response, but got unexpected data: ${JSON.stringify(rawData)}`));
            }
        }

        if (isResponseEmpty) {
            return err(new Error('API returned an empty response when data was expected.'));
        }
        
        if (!isContentTypeJson) {
            const rawText = await response.text();
            return err(new Error(`Expected JSON response, but got content type '${response.headers.get('content-type') || 'none'}'. Raw content: ${rawText.substring(0, 100)}...`));
        }

        const rawData: unknown = await response.json();

        const parsedData = schema.safeParse(rawData);

        if (!parsedData.success) {
            console.error('Data parsing error:', parsedData.error);
            return err(new Error(`Failed to parse API response: ${parsedData.error.message}`));
        }

        return ok(parsedData.data);
    } catch (e: unknown) {
        console.error('Network or unexpected API error in catch block:', e);
        if (e instanceof Error) {
            return err(e);
        }
        return err(new Error('An unknown error occurred during API call.'));
    }
}

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