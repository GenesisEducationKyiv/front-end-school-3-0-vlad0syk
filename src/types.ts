import { z } from 'zod';

export type Track = z.infer<typeof TrackSchema>;

export type Genre = z.infer<typeof GenreSchema>;

export type CreateTrackDto = z.infer<typeof CreateTrackDtoSchema>;

export type UpdateTrackDto = z.infer<typeof UpdateTrackDtoSchema>;

export type QueryParams = z.infer<typeof QueryParamsSchema>;

export type PaginatedResponse<T> = z.infer<typeof PaginatedResponseSchema>;

export interface SortOption {
    value: `${Exclude<QueryParams['sort'], undefined>}_${Exclude<QueryParams['order'], undefined>}`;
    label: string;
}

export type BatchDeleteResponse = z.infer<typeof BatchDeleteResponseSchema>;

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
    search: z.string().optional(), // Зробіть search необов'язковим відповідно до інтерфейсу
    genre: z.string().optional(), // Зробіть genre необов'язковим відповідно до інтерфейсу
    artist: z.string().optional(), // Зробіть artist необов'язковим відповідно до інтерфейсу
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