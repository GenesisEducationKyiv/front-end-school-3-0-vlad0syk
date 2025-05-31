import { z } from 'zod';

export interface Track {
    id: string;
    title: string;
    artist: string;
    album?: string;
    genres: string[];
    slug: string;
    coverImage?: string;
    audioFile?: string;
    createdAt: string;
    updatedAt: string;
}

export type Genre = string;

export interface CreateTrackDto {
    title: string;
    artist: string;
    album?: string;
    genres: string[];
    coverImage?: string;
}

export interface UpdateTrackDto {
    title?: string;
    artist?: string;
    album?: string;
    genres?: string[];
    coverImage?: string;
    audioFile?: string;
}

export interface QueryParams {
    page?: number;
    limit?: number;
    sort?: 'title' | 'artist' | 'album' | 'createdAt';
    order?: 'asc' | 'desc';
    search?: string;
    genre?: string;
    artist?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface SortOption {
    value: `${Exclude<QueryParams['sort'], undefined>}_${Exclude<QueryParams['order'], undefined>}`;
    label: string;
}

export interface BatchDeleteResponse {
    success: string[];
    failed: string[];
}

export const GenreSchema = z.string();

export const TrackSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title cannot be empty'),
    artist: z.string().min(1, 'Artist cannot be empty'),
    album: z.string().optional(),
    genres: z.array(GenreSchema),
    slug: z.string().min(1, 'Slug cannot be empty'),
    coverImage: z.string().optional(),
    audioFile: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const CreateTrackDtoSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    artist: z.string().min(1, 'Artist is required'),
    album: z.string().optional(),
    genres: z.array(GenreSchema),
    coverImage: z.string().optional(),
});

export const UpdateTrackDtoSchema = z.object({
    title: z.string().min(1, 'Title cannot be empty').optional(),
    artist: z.string().min(1, 'Artist cannot be empty').optional(),
    album: z.string().optional(),
    genres: z.array(GenreSchema).optional(),
    coverImage: z.string().optional(),
    audioFile: z.string().optional(),
}).partial();

export const QueryParamsSchema = z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().optional(),
    sort: z.enum(['title', 'artist', 'album', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    genre: z.string().optional(),
    artist: z.string().optional(),
});

export const PaginatedMetaSchema = z.object({
    total: z.number().int().min(0),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().min(0),
});

export const PaginatedResponseSchema = z.object({
    data: z.array(TrackSchema),
    meta: PaginatedMetaSchema,
});

export const BatchDeleteResponseSchema = z.object({
    success: z.array(z.string()),
    failed: z.array(z.string()),
});

export const ApiErrorSchema = z.object({
    error: z.string(),
    statusCode: z.number().int().optional(),
    details: z.array(z.string()).optional(),
});