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
    let data = { title: 'DrowsyCraft Alert', body: 'You have a new notification!' };

    if (event.data) {
        try {
            // Try parsing it as JSON (This is what the Java plugin sends)
            data = event.data.json();
        } catch (e) {
            // Fallback for plain text tests (like the Chrome DevTools Test button)
            data = {
                title: 'DrowsyCraft Test',
                body: event.data.text()
            };
        }
    }

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