import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTracks } from '../../services/api/track';
import { handleResponseWithZod } from '../../services/api/base';
import { ok, err } from 'neverthrow';

vi.mock('../../services/api/base', () => ({
  handleResponseWithZod: vi.fn(),
  API_BASE_URL: 'http://localhost:3000'
}));

const mockedHandleResponseWithZod = vi.mocked(handleResponseWithZod);

describe('Tracks API - Whitebox Tests', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', mockFetch);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('Whitebox Tests', () => {
    describe('fetchTracks - internal implementation', () => {
      it('should construct correct URL with all query parameters', async () => {
        mockedHandleResponseWithZod.mockResolvedValue(ok({ 
          data: [], 
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 } 
        }));
        
        const params = {
          page: 2,
          limit: 20,
          sort: 'title' as const,
          order: 'desc' as const,
          search: 'rock music',
          genre: 'Rock',
          artist: 'Queen'
        };

        await fetchTracks(params);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks?page=2&limit=20&sort=title&order=desc&search=rock+music&genre=Rock&artist=Queen'
        );
      });

      it('should handle empty query parameters correctly', async () => {
        mockedHandleResponseWithZod.mockResolvedValue(ok({ 
          data: [], 
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 } 
        }));

        await fetchTracks({});

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/tracks?');
      });

      it('should skip undefined parameters in URL construction', async () => {
        mockedHandleResponseWithZod.mockResolvedValue(ok({ 
          data: [], 
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 } 
        }));
        
        const params = {
          page: 1,
          search: 'test',
        };

        await fetchTracks(params);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks?page=1&search=test'
        );
      });

      it('should properly encode special characters in search', async () => {
        mockedHandleResponseWithZod.mockResolvedValue(ok({ 
          data: [], 
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 } 
        }));
        
        const params = {
          search: 'rock & roll',
          artist: 'AC/DC'
        };

        await fetchTracks(params);

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks?search=rock+%26+roll&artist=AC%2FDC'
        );
      });
    });

    describe('Error handling - internal implementation', () => {
      it('should propagate errors from handleResponseWithZod', async () => {
        const errorResponse = err(new Error('Network error'));
        mockedHandleResponseWithZod.mockResolvedValue(errorResponse);

        const result = await fetchTracks({});

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.error.message).toBe('Network error');
        }
      });

      it('should handle API errors correctly', async () => {
        const apiError = err(new Error('Not found'));
        mockedHandleResponseWithZod.mockResolvedValue(apiError);

        const result = await fetchTracks({});

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.error.message).toBe('Not found');
        }
      });
    });
  });
});