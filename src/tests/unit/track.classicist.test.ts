import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchTracks, createTrack, updateTrack, deleteTrack, deleteMultipleTracks } from '../../services/api/track';
import { Track, CreateTrackDto, UpdateTrackDto, isOk, isErr } from '../../types';
import { apolloClient } from '../../lib/apollo-client';

vi.mock('../../lib/apollo-client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  }
}));

const testTrack: CreateTrackDto = {
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  genres: ['rock', 'pop'],
  coverImage: 'https://example.com/cover.jpg'
};

const mockTrack: Track = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  genres: ['rock', 'pop'],
  coverImage: 'https://example.com/cover.jpg',
  slug: 'test-song',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

let createdTrackId: string | null = null;

const cleanup = async () => {
  if (createdTrackId !== null) {
    await deleteTrack(createdTrackId);
    createdTrackId = null;
  }
};

beforeEach(() => {
  vi.clearAllMocks();

  apolloClient.query = vi.fn().mockResolvedValue({
    data: {
      tracks: {
        data: [mockTrack],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      }
    }
  });

  apolloClient.mutate = vi.fn();
});

afterEach(async () => {
  await cleanup();
  vi.clearAllMocks();
});

describe('Track API - Classicist Tests', () => {
  test('should create a track successfully', async () => {
    apolloClient.mutate = vi.fn().mockResolvedValue({
      data: {
        createTrack: { ...mockTrack, id: '2' }
      }
    });

    const result = await createTrack(testTrack);
    
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.title).toBe(testTrack.title);
      expect(result.value.artist).toBe(testTrack.artist);
      expect(result.value.genres).toEqual(testTrack.genres);
      createdTrackId = result.value.id;
    }
  });

  test('should fail to create track with empty title', async () => {
    apolloClient.mutate = vi.fn().mockRejectedValue(new Error('Title is required'));

    const invalidTrack = { ...testTrack, title: '' };
    const result = await createTrack(invalidTrack);
    
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('Title is required');
    }
  });

  test('should update a track successfully', async () => {
    apolloClient.mutate = vi.fn()
      .mockResolvedValueOnce({
        data: {
          createTrack: { ...mockTrack, id: '3' }
        }
      })
      .mockResolvedValueOnce({
        data: {
          updateTrack: { 
            ...mockTrack, 
            id: '3',
            title: 'Updated Title',
            artist: 'Updated Artist',
            genres: ['jazz']
          }
        }
      });

    const createResult = await createTrack(testTrack);
    expect(isOk(createResult)).toBe(true);
    
    if (isOk(createResult)) {
      const trackId = createResult.value.id;
      createdTrackId = trackId;
      
      const updateData: UpdateTrackDto = {
        title: 'Updated Title',
        artist: 'Updated Artist',
        genres: ['jazz']
      };
      
      const updateResult = await updateTrack({ id: trackId, data: updateData });
      expect(isOk(updateResult)).toBe(true);
      
      if (isOk(updateResult)) {
        expect(updateResult.value.title).toBe('Updated Title');
        expect(updateResult.value.artist).toBe('Updated Artist');
        expect(updateResult.value.genres).toEqual(['jazz']);
      }
    }
  });

  test('should fail to update non-existent track', async () => {
    apolloClient.mutate = vi.fn().mockRejectedValue(new Error('Track not found'));

    const updateData: UpdateTrackDto = { title: 'Updated Title' };
    const result = await updateTrack({ id: 'fake-id', data: updateData });
    
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('Track not found');
    }
  });

  test('should delete a track successfully', async () => {
    apolloClient.mutate = vi.fn()
      .mockResolvedValueOnce({
        data: {
          createTrack: { ...mockTrack, id: '4' }
        }
      })
      .mockResolvedValueOnce({
        data: {
          deleteTrack: true
        }
      });

    const createResult = await createTrack(testTrack);
    expect(isOk(createResult)).toBe(true);
    
    if (isOk(createResult)) {
      const trackId = createResult.value.id;
      
      const deleteResult = await deleteTrack(trackId);
      expect(isOk(deleteResult)).toBe(true);
      
      createdTrackId = null;
    }
  });

  test('should fail to delete non-existent track', async () => {
    apolloClient.mutate = vi.fn().mockRejectedValue(new Error('Track not found'));

    const result = await deleteTrack('fake-id');
    
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('Track not found');
    }
  });

  test('should delete multiple tracks successfully', async () => {
    apolloClient.mutate = vi.fn()
      .mockResolvedValueOnce({
        data: {
          createTrack: { ...mockTrack, id: '5' }
        }
      })
      .mockResolvedValueOnce({
        data: {
          createTrack: { ...mockTrack, id: '6', title: 'Test Song 2' }
        }
      })
      .mockResolvedValueOnce({
        data: {
          deleteTracks: {
            success: ['5', '6'],
            failed: []
          }
        }
      });

    const track1 = await createTrack(testTrack);
    const track2 = await createTrack({ ...testTrack, title: 'Test Song 2' });
    
    expect(isOk(track1)).toBe(true);
    expect(isOk(track2)).toBe(true);
    
    if (isOk(track1) && isOk(track2)) {
      const ids = [track1.value.id, track2.value.id];
      const result = await deleteMultipleTracks(ids);
      
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.success).toEqual(ids);
        expect(result.value.failed).toEqual([]);
      }
      
      createdTrackId = null;
    }
  });

  test('should handle partial deletion with some invalid IDs', async () => {
    apolloClient.mutate = vi.fn()
      .mockResolvedValueOnce({
        data: {
          createTrack: { ...mockTrack, id: '7' }
        }
      })
      .mockResolvedValueOnce({
        data: {
          deleteTracks: {
            success: ['7'],
            failed: ['fake-id']
          }
        }
      });

    const track = await createTrack(testTrack);
    expect(isOk(track)).toBe(true);
    
    if (isOk(track)) {
      const ids = [track.value.id, 'fake-id'];
      const result = await deleteMultipleTracks(ids);
      
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.success).toEqual([track.value.id]);
        expect(result.value.failed).toEqual(['fake-id']);
      }
      
      createdTrackId = null;
    }
  });

  test('should fetch tracks with pagination', async () => {
    const result = await fetchTracks({ page: 1, limit: 10 });
    
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.data).toBeDefined();
      expect(result.value.meta).toBeDefined();
      expect(result.value.meta.page).toBe(1);
      expect(result.value.meta.limit).toBe(10);
    }
  });

  test('should fetch tracks with search filter', async () => {
    apolloClient.query = vi.fn().mockResolvedValue({
      data: {
        tracks: {
          data: [mockTrack],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          }
        }
      }
    });

    const result = await fetchTracks({ search: 'Test Song' });
    
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.data.length).toBeGreaterThan(0);
      expect(result.value.data[0].title).toBe('Test Song');
    }
  });

  test('should fetch tracks with genre filter', async () => {
    apolloClient.query = vi.fn().mockResolvedValue({
      data: {
        tracks: {
          data: [mockTrack],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          }
        }
      }
    });

    const result = await fetchTracks({ genre: 'rock' });
    
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.data.length).toBeGreaterThan(0);
      expect(result.value.data[0].genres).toContain('rock');
    }
  });

  test('should fetch tracks with sorting', async () => {
    const result = await fetchTracks({ sort: 'title', order: 'asc' });
    
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.data).toBeDefined();
      expect(result.value.meta).toBeDefined();
    }
  });
});