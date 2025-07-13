import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTracks } from '../../services/api/track';
import { apolloClient } from '../../lib/apollo-client';

vi.mock('../../lib/apollo-client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  }
}));

const mockApolloClient = apolloClient as any;

describe('Tracks API - Whitebox Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Whitebox Tests', () => {
    describe('fetchTracks - internal implementation', () => {
      it('should call apolloClient.query with correct variables for all parameters', async () => {
        mockApolloClient.query.mockResolvedValue({
          data: {
            tracks: {
              data: [], 
              meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
            }
          }
        });
        
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

        expect(mockApolloClient.query).toHaveBeenCalledWith({
          query: expect.any(Object), // GraphQL query object
          variables: params,
          fetchPolicy: 'network-only'
        });
      });

      it('should call apolloClient.query with empty variables when no parameters provided', async () => {
        mockApolloClient.query.mockResolvedValue({
          data: {
            tracks: {
              data: [], 
              meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
            }
          }
        });

        await fetchTracks({});

        expect(mockApolloClient.query).toHaveBeenCalledWith({
          query: expect.any(Object),
          variables: {},
          fetchPolicy: 'network-only'
        });
      });

      it('should call apolloClient.query with only defined parameters', async () => {
        mockApolloClient.query.mockResolvedValue({
          data: {
            tracks: {
              data: [], 
              meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
            }
          }
        });

        const params = {
          page: 1,
          search: 'test'
        };

        await fetchTracks(params);

        expect(mockApolloClient.query).toHaveBeenCalledWith({
          query: expect.any(Object),
          variables: params,
          fetchPolicy: 'network-only'
        });
      });

      it('should handle special characters in parameters correctly', async () => {
        mockApolloClient.query.mockResolvedValue({
          data: {
            tracks: {
              data: [], 
              meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
            }
          }
        });

        const params = {
          search: 'rock & roll',
          artist: 'AC/DC'
        };

        await fetchTracks(params);

        expect(mockApolloClient.query).toHaveBeenCalledWith({
          query: expect.any(Object),
          variables: params,
          fetchPolicy: 'network-only'
        });
      });
    });

    describe('Error handling - internal implementation', () => {
      it('should handle GraphQL errors correctly', async () => {
        mockApolloClient.query.mockRejectedValue(new Error('Network error'));

        const result = await fetchTracks({});

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.error.message).toBe('Network error');
        }
      });

      it('should handle Apollo Client errors correctly', async () => {
        mockApolloClient.query.mockRejectedValue(new Error('Not found'));

        const result = await fetchTracks({ search: 'nonexistent' });

        expect(result.isErr()).toBe(true);
        if (result.isErr() && result.error) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.error.message).toBe('Not found');
        }
      });
    });
  });
});