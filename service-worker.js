const CACHE_NAME = 'eduflow-v1';

// Hier alle deine HTML-Dateien und Ressourcen eintragen
const urlsToCache = [
  '/',
  '/index.html',
  '/taschenrechner.html',
  '/Eduflowlogo.png',
  '/Startbild_Eduflow-2.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
  // Füge hier alle weiteren HTML-Dateien deiner App hinzu:
  // '/timer.html',
  // '/notizen.html',
  // etc.
];

// Installation - Cache befüllen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Aktivierung - Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Alter Cache gelöscht:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Aus Cache laden, sonst vom Netzwerk
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - gib die Antwort aus dem Cache zurück
        if (response) {
          return response;
        }

        // Klone die Anfrage
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Prüfe ob gültige Antwort
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Klone die Antwort
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Fallback für Offline-Modus
          return caches.match('/index.html');
        });
      })
  );
});
