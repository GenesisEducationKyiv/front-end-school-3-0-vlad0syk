import { Result } from 'neverthrow';
import { GenreSchema, Genre } from '../../types.ts';
import { handleResponseWithZod, API_BASE_URL } from './base.ts';
import { z } from 'zod';

export const fetchGenres = async (): Promise<Result<Genre[], Error>> => {
    const response = await fetch(`${API_BASE_URL}/api/genres`);
    return handleResponseWithZod(response, z.array(GenreSchema));
};