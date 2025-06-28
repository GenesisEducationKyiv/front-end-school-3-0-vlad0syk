import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {ok, err} from 'neverthrow';
import { fetchTracks, createTrack, updateTrack, deleteTrack, deleteMultipleTracks } from '../../services/api/track';
import { handleResponseWithZod } from '../../services/api/base';

// Mock external dependencies
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
        // Arrange
        mockedHandleResponseWithZod.mockResolvedValue(ok({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }));
        
        const params = {
          page: 2,
          limit: 20,
          sort: 'title' as const,
          order: 'desc' as const,
          search: 'rock music',
          genre: 'Rock',
          artist: 'Queen'
        };

        // Act
        await fetchTracks(params);

        // Assert - check that fetch is called with the correct URL
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks?page=2&limit=20&sort=title&order=desc&search=rock+music&genre=Rock&artist=Queen'
        );
        
        // Перевіряємо, що handleResponseWithZod викликається з правильною схемою
        // expect(handleResponseWithZod).toHaveBeenCalledWith(
        //   expect.any(Response),
        //   PaginatedResponseSchema
        // );
      });

      it('should handle empty query parameters correctly', async () => {
        // Arrange
        mockedHandleResponseWithZod.mockResolvedValue(ok({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }));

        // Act
        await fetchTracks({});

        // Assert - URL must have an empty query string
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/tracks?');
      });

      it('should skip undefined parameters in URL construction', async () => {
        // Arrange
        mockedHandleResponseWithZod.mockResolvedValue(ok({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }));
        
        const params = {
          page: 1,
          search: 'test',
        };

        // Act
        await fetchTracks(params);

        // Assert - only the specified parameters must be in the URL
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks?page=1&search=test'
        );
      });

      it('should properly encode special characters in search', async () => {
        // Arrange
        mockedHandleResponseWithZod.mockResolvedValue(ok({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }));
        
        const params = {
          search: 'rock & roll',
          artist: 'AC/DC'
        };

        // Act
        await fetchTracks(params);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks?search=rock+%26+roll&artist=AC%2FDC'
        );
      });
    });

    describe('createTrack - internal implementation', () => {
      it('should make POST request with correct headers and body', async () => {
        // Arrange
        const trackData = { 
          title: 'Test', 
          artist: 'Test Artist',
          genres: ['Rock']
        };
        mockedHandleResponseWithZod.mockResolvedValue(ok({ 
          id: '1', 
          ...trackData,
          slug: 'test',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }));

        // Act
        await createTrack(trackData);

        // Assert - check the details of the HTTP request
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(trackData),
          }
        );

        // Перевіряємо використання правильної схеми для валідації
        // expect(handleResponseWithZod).toHaveBeenCalledWith(
        //   expect.any(Response),
        //   TrackSchema
        // );
      });

      it('should handle complex track data with all optional fields', async () => {
        // Arrange
        const complexTrackData = {
          title: 'Complex Song',
          artist: 'Complex Artist',
          genres: ['Rock', 'Pop'],
          album: 'Complex Album',
          duration: 240,
          year: 2024
        };
        
        mockedHandleResponseWithZod.mockResolvedValue(ok({ 
          id: '1', 
          ...complexTrackData,
          slug: 'complex-song',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }));

        // Act
        await createTrack(complexTrackData);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks',
          expect.objectContaining({
            body: JSON.stringify(complexTrackData)
          })
        );
      });
    });

    describe('updateTrack - internal implementation', () => {
      it('should construct correct URL with track ID and send PUT request', async () => {
        // Arrange
        const trackId = 'track-123';
        const updateData = { title: 'Updated Title' };
        mockedHandleResponseWithZod.mockResolvedValue(ok({ 
          id: trackId, 
          title: 'Updated Title',
          artist: 'Artist',
          genres: ['Rock'],
          slug: 'updated-title',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }));

        // Act
        await updateTrack({ id: trackId, data: updateData });

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          `http://localhost:3000/api/tracks/${trackId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        );

        // expect(handleResponseWithZod).toHaveBeenCalledWith(
        //   expect.any(Response),
        //   TrackSchema
        // );
      });

      it('should handle partial updates correctly', async () => {
        // Arrange
        const trackId = 'track-456';
        const partialUpdateData = { 
          artist: 'New Artist',
          genres: ['Jazz', 'Blues']
        };
        
        mockedHandleResponseWithZod.mockResolvedValue(ok({ 
          id: trackId, 
          title: 'Original Title',
          artist: 'New Artist',
          genres: ['Jazz', 'Blues'],
          slug: 'original-title',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }));

        // Act
        await updateTrack({ id: trackId, data: partialUpdateData });

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          `http://localhost:3000/api/tracks/${trackId}`,
          expect.objectContaining({
            body: JSON.stringify(partialUpdateData)
          })
        );
      });
    });

    describe('deleteTrack - internal implementation', () => {
      it('should make DELETE request to correct endpoint with track ID', async () => {
        // Arrange
        const trackId = 'track-to-delete';
        mockedHandleResponseWithZod.mockResolvedValue(ok(undefined));

        // Act
        await deleteTrack(trackId);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          `http://localhost:3000/api/tracks/${trackId}`,
          { method: 'DELETE' }
        );

        // Перевіряємо, що використовується z.void() схема для void response
        // expect(handleResponseWithZod).toHaveBeenCalledWith(
        //   expect.any(Response),
        //   expect.any(Object) // z.void() schema
        // );
      });

      it('should handle special characters in track ID', async () => {
        // Arrange
        const trackId = 'track-with-special-chars-123';
        mockedHandleResponseWithZod.mockResolvedValue(ok(undefined));

        // Act
        await deleteTrack(trackId);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          `http://localhost:3000/api/tracks/${trackId}`,
          { method: 'DELETE' }
        );
      });
    });

    describe('deleteMultipleTracks - internal implementation', () => {
      it('should send POST request to batch delete endpoint with IDs array', async () => {
        // Arrange
        const trackIds = ['id1', 'id2', 'id3'];
        mockedHandleResponseWithZod.mockResolvedValue(ok({ success: ['id1', 'id2', 'id3'], failed: [] }));

        // Act
        await deleteMultipleTracks(trackIds);

        // Assert - check the specific endpoint for the batch operation
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks/delete',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: trackIds }),
          }
        );

        // Перевіряємо використання правильної схеми для batch response
        // expect(handleResponseWithZod).toHaveBeenCalledWith(
        //   expect.any(Response),
        //   BatchDeleteResponseSchema
        // );
      });

      it('should handle empty IDs array', async () => {
        // Arrange
        const emptyIds: string[] = [];
        mockedHandleResponseWithZod.mockResolvedValue(ok({ success: [], failed: [] }));

        // Act
        await deleteMultipleTracks(emptyIds);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks/delete',
          expect.objectContaining({
            body: JSON.stringify({ ids: [] }),
          })
        );
      });

      it('should handle large arrays of track IDs', async () => {
        // Arrange
        const largeIdArray = Array.from({ length: 100 }, (_, i) => `track-${i}`);
        mockedHandleResponseWithZod.mockResolvedValue(ok({ success: largeIdArray, failed: [] }));

        // Act
        await deleteMultipleTracks(largeIdArray);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/tracks/delete',
          expect.objectContaining({
            body: JSON.stringify({ ids: largeIdArray }),
          })
        );
      });
    });

    describe('Error handling integration', () => {
      it('should propagate handleResponseWithZod errors correctly', async () => {
        // Arrange
        const networkError = new Error('Connection timeout');
        mockedHandleResponseWithZod.mockResolvedValue(err(networkError));
        mockFetch.mockResolvedValue(new Response());

        // Act
        const result = await fetchTracks({});

        // Assert - check that the error is correctly transmitted via Result
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error).toBe(networkError);
        }
      });

      it('should handle fetch rejections properly', async () => {
        // Arrange
        const fetchError = new Error('Fetch failed');
        mockFetch.mockRejectedValue(fetchError);

        // Act & Assert
        await expect(createTrack({ title: 'Test', artist: 'Test', genres: ['Rock'] }))
          .rejects.toThrow('Fetch failed');
      });

      it('should maintain error context through the chain', async () => {
        // Arrange
        const specificError = new Error('Validation failed: title is required');
        mockedHandleResponseWithZod.mockResolvedValue(err(specificError));
        mockFetch.mockResolvedValue(new Response());

        // Act
        const result = await updateTrack({ id: 'test-id', data: {} });

        // Assert
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toBe('Validation failed: title is required');
        }
      });
    });
  });
});