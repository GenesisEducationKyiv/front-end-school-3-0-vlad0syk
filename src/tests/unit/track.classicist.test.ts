import { test, expect, beforeEach } from 'vitest';
import { 
  fetchTracks,
  createTrack,
  updateTrack,
  deleteTrack,
  deleteMultipleTracks
} from '../../services/api/track';
import { CreateTrackDto, UpdateTrackDto, QueryParams } from '../../types';
import { vi } from 'vitest';

const testTrack: CreateTrackDto = {
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  genres: ['rock', 'pop'],
  coverImage: 'https://example.com/cover.jpg'
};

let createdTrackId: string | null = null;

const cleanup = async () => {
  if (createdTrackId) {
    await deleteTrack(createdTrackId);
    createdTrackId = null;
  }
};

beforeEach(() => {
  // Зберігаємо створені треки в пам'яті для імітації CRUD
  let tracks: any[] = [];
  let nextId = 1;

  vi.stubGlobal('fetch', vi.fn(async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init && init.method) ? init.method.toUpperCase() : 'GET';

    // --- CREATE ---
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

    // --- UPDATE ---
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

    // --- DELETE ---
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

    // --- BATCH DELETE ---
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

    // --- GET (fetchTracks) ---
    if (url.includes('/tracks') && method === 'GET') {
      const params = new URL(url, 'http://localhost').searchParams;
      let data = [...tracks];

      // search by title
      if (params.has('search')) {
        const search = params.get('search');
        data = data.filter(t => t.title === search);
      }
      // filter by genre
      if (params.has('genre')) {
        const genre = params.get('genre');
        data = data.filter(t => t.genres.includes(genre));
      }
      // pagination
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

    // За замовчуванням
    return {
      ok: true,
      json: async () => ({}),
      status: 200,
      headers: { get: () => 'application/json' },
      text: async () => '',
    };
  }));

  // Очищення "бази" перед кожним тестом
  tracks = [
    {
      id: '1',
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      genres: ['rock', 'pop'],
      coverImage: 'https://example.com/cover.jpg',
      slug: 'test-song',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  nextId = 2;

  cleanup();
});

test('should fetch tracks with default parameters', async () => {
  const result = await fetchTracks({});
  
  expect(result.isOk()).toBe(true);
  
  if (result.isOk()) {
    const response = result.value;
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('meta');
    expect(Array.isArray(response.data)).toBe(true);
    expect(typeof response.meta.total).toBe('number');
    expect(typeof response.meta.page).toBe('number');
  }
});

test('should fetch tracks with pagination', async () => {
  const params: QueryParams = { page: 1, limit: 3 };
  
  const result = await fetchTracks(params);
  
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    expect(result.value.meta.page).toBe(1);
    expect(result.value.meta.limit).toBe(3);
    expect(result.value.data.length).toBeLessThanOrEqual(3);
  }
});

test('should create track with valid data', async () => {
  const result = await createTrack(testTrack);
  
  expect(result.isOk()).toBe(true);
  
  if (result.isOk()) {
    const track = result.value;
    createdTrackId = track.id;
    
    expect(track.title).toBe(testTrack.title);
    expect(track.artist).toBe(testTrack.artist);
    expect(track.album).toBe(testTrack.album);
    expect(track.genres).toEqual(testTrack.genres);
    expect(track).toHaveProperty('id');
    expect(track).toHaveProperty('slug');
    expect(track).toHaveProperty('createdAt');
    expect(typeof track.id).toBe('string');
  }
});

test('should reject empty title', async () => {
  const invalidTrack = { ...testTrack, title: '' };
  
  const result = await createTrack(invalidTrack);
  
  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error.message).toContain('Title');
  }
});

test('should update existing track', async () => {
  // Arrange
  const createResult = await createTrack(testTrack);
  expect(createResult.isOk()).toBe(true);
  
  if (!createResult.isOk()) return;
  createdTrackId = createResult.value.id;
  
  const updateData: UpdateTrackDto = {
    title: 'Updated Title',
    artist: 'Updated Artist'
  };
  
  // Act
  const result = await updateTrack({ id: createdTrackId, data: updateData });
  
  // Assert
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    expect(result.value.title).toBe('Updated Title');
    expect(result.value.artist).toBe('Updated Artist');
    expect(result.value.album).toBe(testTrack.album);
  }
});

test('should fail to update non-existent track', async () => {
  const result = await updateTrack({ 
    id: 'fake-id', 
    data: { title: 'New Title' } 
  });
  
  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error.message).toMatch(/404|not found/i);
  }
});

test('should delete existing track', async () => {
  // Arrange
  const createResult = await createTrack(testTrack);
  expect(createResult.isOk()).toBe(true);
  
  if (!createResult.isOk()) return;
  const trackId = createResult.value.id;
  
  // Act
  const result = await deleteTrack(trackId);
  
  // Assert
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    expect(result.value).toBeUndefined();
  }
  
  createdTrackId = null;
});

test('should delete multiple tracks', async () => {
  // Arrange
  const track1 = await createTrack({ ...testTrack, title: 'Track 1' });
  const track2 = await createTrack({ ...testTrack, title: 'Track 2' });
  
  expect(track1.isOk() && track2.isOk()).toBe(true);
  if (!track1.isOk() || !track2.isOk()) return;
  
  const trackIds = [track1.value.id, track2.value.id];
  
  // Act
  const result = await deleteMultipleTracks(trackIds);
  
  // Assert
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    expect(result.value.success).toEqual(trackIds);
    expect(result.value.failed).toHaveLength(0);
  }
});

test('should handle mixed success/failure in batch delete', async () => {
  // Arrange
  const createResult = await createTrack(testTrack);
  expect(createResult.isOk()).toBe(true);
  
  if (!createResult.isOk()) return;
  createdTrackId = createResult.value.id;
  
  const mixedIds = [createdTrackId, 'fake-id'];
  
  // Act
  const result = await deleteMultipleTracks(mixedIds);
  
  // Assert
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    expect(result.value.success).toContain(createdTrackId);
    expect(result.value.failed).toContain('fake-id');
  }
  
  createdTrackId = null;
});

test('should handle full CRUD workflow', async () => {
  // Create
  const createResult = await createTrack(testTrack);
  expect(createResult.isOk()).toBe(true);
  
  if (!createResult.isOk()) return;
  const trackId = createResult.value.id;
  createdTrackId = trackId;
  
  // Read
  const fetchResult = await fetchTracks({ search: testTrack.title });
  expect(fetchResult.isOk()).toBe(true);
  
  if (fetchResult.isOk()) {
    const foundTrack = fetchResult.value.data.find(t => t.id === trackId);
    expect(foundTrack).toBeDefined();
    expect(foundTrack?.title).toBe(testTrack.title);
  }
  
  // Update
  const updateResult = await updateTrack({
    id: trackId,
    data: { title: 'Workflow Updated' }
  });
  expect(updateResult.isOk()).toBe(true);
  
  if (updateResult.isOk()) {
    expect(updateResult.value.title).toBe('Workflow Updated');
  }
  
  // Delete
  const deleteResult = await deleteTrack(trackId);
  expect(deleteResult.isOk()).toBe(true);
  
  // Verify deletion
  const verifyResult = await fetchTracks({ search: 'Workflow Updated' });
  if (verifyResult.isOk()) {
    const deletedTrack = verifyResult.value.data.find(t => t.id === trackId);
    expect(deletedTrack).toBeUndefined();
  }
  
  createdTrackId = null;
});

test('should search tracks by title', async () => {
  // Arrange
  const uniqueTitle = `Unique Search ${Date.now()}`;
  const searchTrack = { ...testTrack, title: uniqueTitle };
  
  const createResult = await createTrack(searchTrack);
  expect(createResult.isOk()).toBe(true);
  
  if (!createResult.isOk()) return;
  createdTrackId = createResult.value.id;
  
  // Act
  const result = await fetchTracks({ search: uniqueTitle });
  
  // Assert
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    const foundTrack = result.value.data.find(t => t.title === uniqueTitle);
    expect(foundTrack).toBeDefined();
    expect(foundTrack?.artist).toBe(testTrack.artist);
  }
});

test('should filter tracks by genre', async () => {
  const result = await fetchTracks({ genre: 'rock' });
  
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    result.value.data.forEach(track => {
      expect(track.genres).toContain('rock');
    });
  }
});