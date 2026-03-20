const CACHE_NAME = 'drowsycraft-pwa-v1';
const urlsToCache = [
    '/',
    '/styles/main.css'
];

// Install the service worker and cache essential static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercept network requests and serve cached files if offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Listen for incoming Web Push notifications from the server
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'DrowsyCraft Alert', body: 'You have a new notification!' };
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: { url: '/dashboard' } // The URL to open when clicked
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle clicks on notifications (opens the app)
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url || '/dashboard'));
});