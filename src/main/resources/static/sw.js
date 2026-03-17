/* ═══════════════════════════════════════════════════════
   sw.js — Service Worker
   memories. PWA
═══════════════════════════════════════════════════════ */

/*
const APP_CACHE   = 'memories-app-v1';
const PHOTO_CACHE = 'memories-photos-v1';
*/

/* ── 앱 설치 시 미리 캐시할 파일 목록 ── */
/*
const PRECACHE_URLS = [
  '/html/login.html',
  '/js/login.js',
  '/css/login.css',
  '/html/index.html',
  '/js/index.js',
  '/css/index.css',
  '/html/trip.html',
  '/js/trip.js',
  '/css/trip.css',
  '/css/common/common.css',
  '/js/common/common.js',
  '/js/common/api.js',
  '/js/common/popup.js',
  '/extend.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
];
*/

/* ════════════════════════════════════════════════════
   install — precache
════════════════════════════════════════════════════ */
/*
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});
*/

/* ════════════════════════════════════════════════════
   activate — 구버전 캐시 정리
════════════════════════════════════════════════════ */
/*
self.addEventListener('activate', e => {
  const VALID = [APP_CACHE, PHOTO_CACHE];
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => !VALID.includes(k))
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});
*/

/* ════════════════════════════════════════════════════
   fetch — 캐싱 전략
════════════════════════════════════════════════════ */
/*
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(request));
    return;
  }

  if (isPhotoRequest(url)) {
    e.respondWith(cacheFirstPhoto(request));
    return;
  }

  e.respondWith(cacheFirstApp(request));
});
*/

/*
function isPhotoRequest(url) {
  return /\.(jpe?g|png|gif|webp|heic|avif)(\?.*)?$/i.test(url.pathname);
}

async function cacheFirstApp(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const res = await fetch(request);
  const cache = await caches.open(APP_CACHE);
  cache.put(request, res.clone());
  return res;
}

async function cacheFirstPhoto(request) {
  const cache  = await caches.open(PHOTO_CACHE);
  const cached = await cache.match(request);

  const fetchAndStore = fetch(request)
    .then(res => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) {
    fetchAndStore;
    return cached;
  }

  return fetchAndStore ?? new Response(null, { status: 503 });
}
*/

/* ════════════════════════════════════════════════════
   message — 캐시 제어
════════════════════════════════════════════════════ */
/*
self.addEventListener('message', e => {
  if (e.data?.type === 'PRECACHE_PHOTOS') {
    precachePhotos(e.data.urls ?? []);
  }

  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function precachePhotos(urls) {
  const cache = await caches.open(PHOTO_CACHE);
  const existing = await cache.keys().then(keys => new Set(keys.map(k => k.url)));

  await Promise.allSettled(
    urls
      .filter(url => !existing.has(url))
      .map(url =>
        fetch(url, { mode: 'cors' })
          .then(res => res.ok && cache.put(url, res))
          .catch(() => {})
      )
  );
}
*/

/* ════════════════════════════════════════════════════
   push — 푸시 알림 수신
════════════════════════════════════════════════════ */
self.addEventListener('push', e => {
  let data = {};
  try { 
    data = e.data?.json() ?? {}; 
  } catch { 
    data = { title: 'memories.', body: e.data?.text() ?? '' }; 
  }

  const title = data.title ?? 'memories.';

  const options = {
    body: data.body ?? '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: data.image ?? undefined,
    vibrate: [100, 50, 100],
    tag: data.tag ?? 'memories-push',
    renotify: false,
    data: {
      url: data.url ?? '/',
    },
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

/* ════════════════════════════════════════════════════
   notificationclick — 알림 클릭
════════════════════════════════════════════════════ */
self.addEventListener('notificationclick', e => {
  e.notification.close();

  const targetUrl = e.notification.data?.url ?? '/';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(targetUrl) || c.url.endsWith('/'));
      if (existing) return existing.focus();
      return clients.openWindow(targetUrl);
    })
  );
});