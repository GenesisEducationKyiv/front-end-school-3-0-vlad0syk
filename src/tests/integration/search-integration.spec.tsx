import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../../lib/apollo-client';
import { useFiltersState } from '../../hooks/useFiltersState';

vi.mock('../../lib/apollo-client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
    watchQuery: vi.fn(),
  }
}));

const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams]
}));

describe('Search Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of mockSearchParams.keys()) {
      mockSearchParams.delete(key);
    }
    
    apolloClient.query = vi.fn().mockResolvedValue({
      data: {
        tracks: {
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
        }
      }
    });
    
    apolloClient.watchQuery = vi.fn().mockReturnValue({
      subscribe: vi.fn(),
      refetch: vi.fn(),
      updateQuery: vi.fn(),
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );

  describe('Search and Filter Integration', () => {
    it('should integrate search term with API calls', async () => {
      mockSearchParams.set('search', 'test');

      const { result } = renderHook(() => useFiltersState(), { wrapper });

      await waitFor(() => {
        expect(result.current.params.search).toBe('test');
      });

      expect(result.current.params.search).toBe('test');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should integrate multiple filters together', async () => {
      mockSearchParams.set('search', 'rock');
      mockSearchParams.set('genre', 'Rock');
      mockSearchParams.set('artist', 'Rock Artist');
      mockSearchParams.set('sort', 'title');
      mockSearchParams.set('order', 'asc');

      const { result } = renderHook(() => useFiltersState(), { wrapper });

      await waitFor(() => {
        expect(result.current.params.search).toBe('rock');
        expect(result.current.params.genre).toBe('Rock');
        expect(result.current.params.artist).toBe('Rock Artist');
      });

      expect(result.current.params.search).toBe('rock');
      expect(result.current.params.genre).toBe('Rock');
      expect(result.current.params.artist).toBe('Rock Artist');
      expect(result.current.params.sort).toBe('title');
      expect(result.current.params.order).toBe('asc');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should clear all filters when clearFilters is called', async () => {
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('genre', 'Rock');

      const { result } = renderHook(() => useFiltersState(), { wrapper });

      await waitFor(() => {
        expect(result.current.params.search).toBe('test');
      });

      result.current.clearFilters();

      await waitFor(() => {
        expect(result.current.hasActiveFilters).toBe(false);
      });

      expect(mockSetSearchParams).toHaveBeenCalled();
    });
  });

  describe('API Integration with Search', () => {
    it('should handle URL parameters correctly', async () => {
      mockSearchParams.set('search', 'test search');
      mockSearchParams.set('page', '1');

      const { result } = renderHook(() => useFiltersState(), { wrapper });

      await waitFor(() => {
        expect(result.current.params.search).toBe('test search');
      });

      expect(result.current.params.search).toBe('test search');
      expect(result.current.params.page).toBe(1);
    });

    it('should handle state updates gracefully', async () => {
      mockSearchParams.set('search', 'test');

      const { result } = renderHook(() => useFiltersState(), { wrapper });

      await waitFor(() => {
        expect(result.current.params.search).toBe('test');
      });

      expect(result.current.params.search).toBe('test');
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('Genre Integration', () => {
    it('should integrate genre filtering with filter state', async () => {
      mockSearchParams.set('genre', 'Rock');

      const { result } = renderHook(() => useFiltersState(), { wrapper });

      await waitFor(() => {
        expect(result.current.params.genre).toBe('Rock');
      });

      expect(result.current.params.genre).toBe('Rock');
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('Pagination Integration', () => {
    it('should integrate pagination with search filters', async () => {
      mockSearchParams.set('search', 'test');
      mockSearchParams.set('page', '2');

      const { result } = renderHook(() => useFiltersState(), { wrapper });

      await waitFor(() => {
        expect(result.current.params.search).toBe('test');
        expect(result.current.params.page).toBe(2);
      });

      expect(result.current.params.search).toBe('test');
      expect(result.current.params.page).toBe(2);
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
}); 