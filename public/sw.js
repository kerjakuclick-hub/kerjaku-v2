// Mesin Service Worker kerjaKU.click
self.addEventListener('install', (e) => {
  console.log('[kerjaKU] Mesin PWA berhasil di-install!');
});

self.addEventListener('fetch', (e) => {
  // Biarkan kosong untuk MVP. Ini sudah cukup untuk memicu tombol Install.
});