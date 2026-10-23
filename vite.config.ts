import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [{
    name: 'lad-offline',
    generateBundle(_, bundle) {
      const publicAssets = ['/icon.svg', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest', '/art/ri-poses.png', '/art/ri-balcony-v3.png', '/art/ri-landscape.png', '/art/portals.png', '/art/room-items.png', '/art/neighbors.png', '/art/firefly.png', '/art/station.png', '/art/story-scenes.png'];
      const assets = ['/', '/index.html', '/icon.svg', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest', '/art/ri-poses.png', '/art/ri-balcony-v3.png', '/art/ri-landscape.png', '/art/portals.png', '/art/room-items.png', '/art/neighbors.png', '/art/firefly.png', '/art/station.png', '/art/story-scenes.png', ...Object.keys(bundle).map(n => '/' + n)];
      const revision = createHash('sha256').update(JSON.stringify(Object.values(bundle).map(b => b.type === 'chunk' ? b.code : String(b.source)))).update(Buffer.concat(publicAssets.map(name=>readFileSync(resolve('public', '.'+name))))).digest('hex').slice(0, 12);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `
const CACHE = 'lad-${revision}';
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('lad-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin || new URL(e.request.url).pathname.startsWith('/api/')) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).catch(() => e.request.mode === 'navigate' ? caches.match('/index.html') : Response.error())));
});` });
    }
  }],
  server: { port: 5173, strictPort: true, proxy:{'/api':{target:'http://127.0.0.1:3001',changeOrigin:false}} },
  preview: { port: 4173, strictPort: true }
});
