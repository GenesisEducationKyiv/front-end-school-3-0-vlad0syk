const CACHE_NAME = 'genesis-music-v2';
const STATIC_CACHE = 'genesis-static-v2';
const DYNAMIC_CACHE = 'genesis-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/vite.svg',
  '/music.svg',
  '/play.svg',
  '/pause.svg',
  '/search.svg',
  '/pencil.svg',
  '/trash.svg',
  '/upload.svg'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event with enhanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip GraphQL and API requests
  if (url.pathname.includes('/graphql') || url.pathname.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Serving from cache:', request.url);
          return response;
        }

        // Fetch from network
        return fetch(request)
          .then((fetchResponse) => {
            // Check if we received a valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response for caching
            const responseToCache = fetchResponse.clone();
            
            // Determine cache strategy based on resource type
            let targetCache = DYNAMIC_CACHE;
            
            if (STATIC_ASSETS.includes(url.pathname) || 
                request.url.includes('.js') || 
                request.url.includes('.css') ||
                request.url.includes('.svg') ||
                request.url.includes('.ico')) {
              targetCache = STATIC_CACHE;
            }

            // Cache the response
            caches.open(targetCache)
              .then((cache) => {
                console.log('Caching new resource:', request.url);
                cache.put(request, responseToCache);
              })
              .catch((error) => {
                console.error('Failed to cache resource:', error);
              });

            return fetchResponse;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            
            // Return offline fallback for HTML requests
            if (request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/');
            }
            
            throw error;
          });
      })
  );
});
