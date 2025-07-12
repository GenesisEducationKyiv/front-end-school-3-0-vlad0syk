import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchTracks, createTrack, updateTrack, deleteTrack, deleteMultipleTracks } from '../../services/api/track';
import { Track, CreateTrackDto, UpdateTrackDto, isOk, isErr } from '../../types';

const testTrack: CreateTrackDto = {
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  genres: ['rock', 'pop'],
  coverImage: 'https://example.com/cover.jpg'
};

let createdTrackId: string | null = null;

const cleanup = async () => {
  if (createdTrackId !== null) {
    await deleteTrack(createdTrackId);
    createdTrackId = null;
  }
};

beforeEach(() => {
  let tracks: Track[] = [];
  let nextId = 1;

  vi.stubGlobal('fetch', vi.fn(async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init && init.method) ? init.method.toUpperCase() : 'GET';

    if (url.endsWith('/tracks') && method === 'POST') {
      const body = JSON.parse(init?.body || '{}');
      if (!body.title || body.title === '') {
        return {
          ok: false,
          json: async () => ({
            error: 'Title is required',
            statusCode: 400,
            details: ['Title']
          }),
          status: 400,
          headers: { get: () => 'application/json' },
          text: async () => '',
        };
      }
      const newTrack = {
        id: String(nextId++),
        title: body.title,
        artist: body.artist,
        album: body.album ?? '',
        genres: body.genres ?? [],
        coverImage: body.coverImage ?? '',
        slug: body.title.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      tracks.push(newTrack);
      return {
        ok: true,
        json: async () => newTrack,
        status: 201,
        headers: { get: () => 'application/json' },
        text: async () => '',
      };
    }

    if (url.match(/\/tracks\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const body = JSON.parse(init?.body || '{}');
      const idx = tracks.findIndex(t => t.id === id);
      if (id === 'fake-id' || idx === -1) {
        return {
          ok: false,
          json: async () => ({
            error: 'Track not found',
            statusCode: 404,
            details: ['Not found']
          }),
          status: 404,
          headers: { get: () => 'application/json' },
          text: async () => '',
        };
      }
      tracks[idx] = {
        ...tracks[idx],
        ...body,
        updatedAt: new Date().toISOString(),
        slug: (body.title ?? tracks[idx].title).toLowerCase().replace(/\s+/g, '-'),
      };
      return {
        ok: true,
        json: async () => tracks[idx],
        status: 200,
        headers: { get: () => 'application/json' },
        text: async () => '',
      };
    }

    if (url.match(/\/tracks\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      if (id === 'fake-id' || !tracks.find(t => t.id === id)) {
        return {
          ok: false,
          json: async () => ({
            error: 'Track not found',
            statusCode: 404,
            details: ['Not found']
          }),
          status: 404,
          headers: { get: () => 'application/json' },
          text: async () => '',
        };
      }
      tracks = tracks.filter(t => t.id !== id);
      return {
        ok: true,
        json: async () => ({}),
        status: 204,
        headers: { get: () => 'application/json' },
        text: async () => '',
      };
    }

    if (url.endsWith('/tracks/delete') && method === 'POST') {
      const body = JSON.parse(init?.body || '{}');
      const ids = body.ids ?? [];
      const success = ids.filter((id: string) => id !== 'fake-id' && tracks.find(t => t.id === id));
      const failed = ids.filter((id: string) => id === 'fake-id' || !tracks.find(t => t.id === id));
      tracks = tracks.filter(t => !success.includes(t.id));
      return {
        ok: true,
        json: async () => ({
          success,
          failed,
        }),
        status: 200,
        headers: { get: () => 'application/json' },
        text: async () => '',
      };
    }

    if (url.includes('/tracks') && method === 'GET') {
      const params = new URL(url, 'http://localhost').searchParams;
      let data = [...tracks];

      if (params.has('search')) {
        const search = params.get('search');
        data = data.filter(t => t.title === search);
      }
      if (params.has('genre')) {
        const genre = params.get('genre');
        if (genre !== null) {
          data = data.filter(t => t.genres.includes(genre));
        }
      }
      const page = Number(params.get('page') || 1);
      const limit = Number(params.get('limit') || 10);
      const start = (page - 1) * limit;
      const paged = data.slice(start, start + limit);

      return {
        ok: true,
        json: async () => ({
          data: paged,
          meta: {
            total: data.length,
            page, 
            limit,
            totalPages: Math.ceil(data.length / limit) || 1,
          }
        }),
        status: 200,
        headers: { get: () => 'application/json' },
        text: async () => '',
      };
    }

    return {
      ok: true,
      json: async () => ({}),
      status: 200,
      headers: { get: () => 'application/json' },
      text: async () => '',
    };
  }));

  tracks = [
    {
      id: '1',
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      genres: ['rock', 'pop'],
      coverImage: 'https://example.com/cover.jpg',
      slug: 'test-song',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
  ];
});

afterEach(async () => {
  await cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Track API - Classicist Tests', () => {
  test('should create a track successfully', async () => {
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
    const invalidTrack = { ...testTrack, title: '' };
    const result = await createTrack(invalidTrack);
    
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('Title is required');
    }
  });

  test('should update a track successfully', async () => {
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
    const updateData: UpdateTrackDto = { title: 'Updated Title' };
    const result = await updateTrack({ id: 'fake-id', data: updateData });
    
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('Track not found');
    }
  });

  test('should delete a track successfully', async () => {
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
    const result = await deleteTrack('fake-id');
    
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('Track not found');
    }
  });

  test('should delete multiple tracks successfully', async () => {
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
    const result = await fetchTracks({ search: 'Test Song' });
    
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.data.length).toBeGreaterThan(0);
      expect(result.value.data[0].title).toBe('Test Song');
    }
  });

  test('should fetch tracks with genre filter', async () => {
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