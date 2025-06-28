import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFiltersState } from '../../hooks/useFiltersState';
import { fetchTracks } from '../../services/api/track';
import { fetchGenres } from '../../services/api/genres';

// Mock the API modules
vi.mock('../../services/api/track', () => ({
  fetchTracks: vi.fn()
}));

vi.mock('../../services/api/genres', () => ({
  fetchGenres: vi.fn()
}));

// Mock the URL search params
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams]
}));

describe('Search Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Clear all mocks
    vi.clearAllMocks();
    // Clear search params by deleting all entries
    for (const key of mockSearchParams.keys()) {
      mockSearchParams.delete(key);
    }
  });

  // Wrapper component for testing hooks
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('Search and Filter Integration', () => {
    it('should integrate search term with API calls', async () => {
      // Mock successful API response
      const mockTracksResponse = {
        isOk: () => true,
        value: {
          data: [
            { id: '1', title: 'Test Track 1', artist: 'Test Artist', genre: 'Rock' },
            { id: '2', title: 'Another Track', artist: 'Another Artist', genre: 'Pop' }
          ],
          meta: { total: 2, totalPages: 1, currentPage: 1, perPage: 10 }
        }
      };

      (fetchTracks as any).mockResolvedValue(mockTracksResponse);

      // Set up search params
      mockSearchParams.set('search', 'test');

      // Render the hook
      const { result } = renderHook(() => useFiltersState(), { wrapper });

      // Wait for the hook to initialize
      await waitFor(() => {
        expect(result.current.params.search).toBe('test');
      });

      // Verify that the search parameter is properly integrated
      expect(result.current.params.search).toBe('test');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should integrate multiple filters together', async () => {
      // Mock successful API response
      const mockTracksResponse = {
        isOk: () => true,
        value: {
          data: [
            { id: '1', title: 'Rock Track', artist: 'Rock Artist', genre: 'Rock' }
          ],
          meta: { total: 1, totalPages: 1, currentPage: 1, perPage: 10 }
        }
      };

      (fetchTracks as any).mockResolvedValue(mockTracksResponse);

      // Set up multiple search params
      mockSearchParams.set('search', 'rock');
      mockSearchParams.set('genre', 'Rock');
      mockSearchParams.set('artist', 'Rock Artist');
      mockSearchParams.set('sort', 'title');
      mockSearchParams.set('order', 'asc');

      // Render the hook
      const { result } = renderHook(() => useFiltersState(), { wrapper });

      // Wait for the hook to initialize
      await waitFor(() => {
        expect(result.current.params.search).toBe('rock');
        expect(result.current.params.genre).toBe('Rock');
        expect(result.current.params.artist).toBe('Rock Artist');
      });

      // Verify that all filters are properly integrated
      expect(result.current.params.search).toBe('rock');
      expect(result.current.params.genre).toBe('Rock');
      expect(result.current.params.artist).toBe('Rock Artist');
      expect(result.current.params.sort).toBe('title');
      expect(result.current.params.order).toBe('asc');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should clear all filters when clearFilters is called', async () => {
      // Mock successful API response
      const mockTracksResponse = {
        isOk: () => true,
        value: {
          data: [],
          meta: { total: 0, totalPages: 0, currentPage: 1, perPage: 10 }
        }
      };

      (fetchTracks as any).mockResolvedValue(mockTracksResponse);

      // Set up search params
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('genre', 'Rock');

      // Render the hook
      const { result } = renderHook(() => useFiltersState(), { wrapper });

      // Wait for the hook to initialize
      await waitFor(() => {
        expect(result.current.params.search).toBe('test');
      });

      // Clear filters
      result.current.clearFilters();

      // Verify that filters are cleared
      await waitFor(() => {
        expect(result.current.hasActiveFilters).toBe(false);
      });

      expect(mockSetSearchParams).toHaveBeenCalled();
    });
  });

  describe('API Integration with Search', () => {
    it('should call API with correct parameters when search changes', async () => {
      const mockTracksResponse = {
        isOk: () => true,
        value: {
          data: [],
          meta: { total: 0, totalPages: 0, currentPage: 1, perPage: 10 }
        }
      };

      (fetchTracks as any).mockResolvedValue(mockTracksResponse);

      // Set up search params
      mockSearchParams.set('search', 'test search');
      mockSearchParams.set('page', '1');

      // Render the hook
      const { result } = renderHook(() => useFiltersState(), { wrapper });

      // Wait for the hook to initialize
      await waitFor(() => {
        expect(result.current.params.search).toBe('test search');
      });

      // Verify that the API would be called with correct parameters
      expect(fetchTracks).toHaveBeenCalledWith({
        search: 'test search',
        page: 1,
        perPage: 10,
        sort: 'title',
        order: 'asc'
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      const mockErrorResponse = {
        isOk: () => false,
        error: new Error('API Error')
      };

      (fetchTracks as any).mockResolvedValue(mockErrorResponse);

      // Set up search params
      mockSearchParams.set('search', 'test');

      // Render the hook
      const { result } = renderHook(() => useFiltersState(), { wrapper });

      // Wait for the hook to initialize
      await waitFor(() => {
        expect(result.current.params.search).toBe('test');
      });

      // The hook should still work even if API fails
      expect(result.current.params.search).toBe('test');
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('Genre Integration', () => {
    it('should integrate genre fetching with filter state', async () => {
      const mockGenresResponse = {
        isOk: () => true,
        value: ['Rock', 'Pop', 'Jazz', 'Classical']
      };

      (fetchGenres as any).mockResolvedValue(mockGenresResponse);

      // Set up genre filter
      mockSearchParams.set('genre', 'Rock');

      // Render the hook
      const { result } = renderHook(() => useFiltersState(), { wrapper });

      // Wait for the hook to initialize
      await waitFor(() => {
        expect(result.current.params.genre).toBe('Rock');
      });

      // Verify genre integration
      expect(result.current.params.genre).toBe('Rock');
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('Pagination Integration', () => {
    it('should integrate pagination with search filters', async () => {
      const mockTracksResponse = {
        isOk: () => true,
        value: {
          data: [],
          meta: { total: 50, totalPages: 5, currentPage: 2, perPage: 10 }
        }
      };

      (fetchTracks as any).mockResolvedValue(mockTracksResponse);

      // Set up search params with pagination
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('page', '2');

      // Render the hook
      const { result } = renderHook(() => useFiltersState(), { wrapper });

      // Wait for the hook to initialize
      await waitFor(() => {
        expect(result.current.params.search).toBe('test');
        expect(result.current.params.page).toBe(2);
      });

      // Verify pagination integration
      expect(result.current.params.search).toBe('test');
      expect(result.current.params.page).toBe(2);
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
}); 