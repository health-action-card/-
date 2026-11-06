/* 서비스 워커 — 화면 파일을 저장해 두어 인터넷이 끊겨도 앱이 열려요.
   ※ 파일을 고쳐서 다시 올릴 때는 아래 VERSION 숫자를 하나 올려 주세요. (예: v1 → v2)
   ※ 학생 기록은 여기 저장되지 않아요 (기록은 각 기기의 LocalStorage에만). */
const VERSION = 'v6';
const CACHE = 'allergy-shield-' + VERSION;
const FILES = [
  './', './index.html', './manifest.json', './css/style.css',
  './js/qr.js', './js/core.js', './js/card.js', './js/app.js',
  './data/rules.js', './data/holidays.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './assets/cards/bg_certificate.jpg', './assets/cards/bg_lab.jpg', './assets/cards/bg_playground.jpg',
  './assets/characters/pinky_01.png', './assets/characters/pinky_02.png', './assets/characters/pinky_03.png',
  './assets/characters/pinky_04.png', './assets/characters/pinky_05.png',
  './assets/medals/medal_pink.png', './assets/medals/medal_green.png', './assets/medals/medal_blue.png',
  './assets/scenes/s01_intro.jpg', './js/sfx.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* 화면(HTML)은 인터넷 먼저 → 실패하면 저장본 / 나머지 파일은 저장본 먼저 */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
