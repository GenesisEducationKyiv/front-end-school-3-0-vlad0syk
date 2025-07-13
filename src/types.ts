import { z } from 'zod';

export type Track = z.infer<typeof TrackSchema>;

export type TrackIdType = Track['id'];

export type Genre = z.infer<typeof GenreSchema>;

export type CreateTrackDto = z.infer<typeof CreateTrackDtoSchema>;

export type UpdateTrackDto = z.infer<typeof UpdateTrackDtoSchema>;

export type QueryParams = z.infer<typeof QueryParamsSchema>;

export type PaginatedResponse<T> = {
    data: T[];
    meta: z.infer<typeof PaginatedMetaSchema>;
};

export interface SortOption {
    value: `${NonNullable<QueryParams['sort']>}_${NonNullable<QueryParams['order']>}`;
    label: string;
}

export type SortField = NonNullable<QueryParams['sort']>;

export type SortOrder = NonNullable<QueryParams['order']>;

export type BatchDeleteResponse = z.infer<typeof BatchDeleteResponseSchema>;

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Result type for API operations with proper type guards
export type Result<T, E = Error> = 
  | { isOk(): true; isErr(): false; value: T; error?: never }
  | { isOk(): false; isErr(): true; value?: never; error: E };

// Type guards for better type narrowing
export const isOk = <T, E>(result: Result<T, E>): result is { isOk(): true; isErr(): false; value: T; error?: never } => {
  return result.isOk();
};

export const isErr = <T, E>(result: Result<T, E>): result is { isOk(): false; isErr(): true; value?: never; error: E } => {
  return result.isErr();
};

// Helper functions for creating Results
export const ok = <T>(value: T): Result<T, never> => ({ 
  isOk: () => true, 
  isErr: () => false, 
  value 
});

export const err = <E>(error: E): Result<never, E> => ({ 
  isOk: () => false, 
  isErr: () => true, 
  error 
});

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
    title: z.string().min(1, 'Title cannot be empty'),
    artist: z.string().min(1, 'Artist cannot be empty'),
    album: z.string(),
    genres: z.array(GenreSchema),
    coverImage: z.string(),
    audioFile: z.string(),
}).partial();

export const QueryParamsSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    sort: z.union([z.literal('title'), z.literal('artist'), z.literal('album'), z.literal('createdAt')]),
    order: z.union([z.literal('asc'), z.literal('desc')]),
    search: z.string().optional(),
    genre: z.string().optional(),
    artist: z.string().optional(),
}).partial();

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
    statusCode: z.number().int(),
    details: z.array(z.string()),
}).partial();