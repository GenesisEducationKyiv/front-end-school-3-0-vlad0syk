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

/**
 * Відповідь для операцій масового видалення.
 */
export interface BatchDeleteResponse {
    /** IDs успішно видалених елементів */
    success: string[];
    /** IDs, які не вдалося видалити */
    failed: string[];
  }