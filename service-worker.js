// Nome e versione della cache
const CACHE_NAME = 'domotica-casa-v2';

// File da cachare per funzionamento offline
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './app.js',
  './images/icon-192.svg',
  './images/icon-512.svg'
];

// Installazione del service worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installazione in corso...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aperta, aggiunta file...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installazione completata');
        // Forza l'attivazione immediata
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Errore durante installazione:', error);
      })
  );
});

// Attivazione del service worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione in corso...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // Rimuovi cache vecchie
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Rimozione cache obsoleta:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Attivazione completata');
        // Prendi controllo di tutte le pagine
        return self.clients.claim();
      })
  );
});

// Intercettazione delle richieste
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Non cachare richieste al server domotico
  if (url.hostname === '94.185.76.20' || url.port === '8000') {
    // Passa direttamente alla rete senza cache
    event.respondWith(fetch(request));
    return;
  }

  // Strategia: Cache First, fallback su Network
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          console.log('[Service Worker] Servito dalla cache:', request.url);
          return response;
        }

        console.log('[Service Worker] Richiesta alla rete:', request.url);
        return fetch(request)
          .then(networkResponse => {
            // Opzionale: salva nella cache le nuove risposte
            if (request.method === 'GET' && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('[Service Worker] Errore fetch:', error);
            // Qui potresti restituire una pagina offline personalizzata
            throw error;
          });
      })
  );
});

// Gestione messaggi dal client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
