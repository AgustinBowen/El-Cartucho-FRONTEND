/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

// ─── Precache del manifest generado por Vite PWA ─────────────────────────────
// En dev mode __WB_MANIFEST puede no estar inyectado; usamos [] como fallback
// @ts-ignore __WB_MANIFEST es inyectado por VitePWA en build time
const manifest = typeof self.__WB_MANIFEST !== 'undefined' ? self.__WB_MANIFEST : []
precacheAndRoute(manifest)
cleanupOutdatedCaches()

// ─── Tomar control de inmediato al actualizarse ───────────────────────────────
self.skipWaiting()
self.clients.claim()

// ─── Caché de API (NetworkFirst) ─────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// ─── Caché de imágenes (StaleWhileRevalidate) ─────────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
)

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'El Cartucho', body: event.data.text() }
  }

  const title = data.title || 'El Cartucho'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/favicon.ico',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ─── Click en la notificación → abrir la URL ─────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Si ya hay una pestaña abierta, la enfocamos
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      // Si no, abrimos una nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
