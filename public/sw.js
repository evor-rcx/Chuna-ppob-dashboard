self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => {
      clients.forEach((client) => {
        if (client && 'navigate' in client) {
          // Biarkan browser menangani navigasi langsung tanpa intervensi SW
        }
      });
    })
  );
});

