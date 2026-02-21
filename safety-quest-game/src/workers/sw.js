/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
    ({ url, request }) => url.pathname.startsWith('/api/v1/') && request.method === 'GET',
    new NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
    }),
);

registerRoute(
    ({ request }) => request.destination === 'image',
    new StaleWhileRevalidate({ cacheName: 'image-cache' }),
);

const bgSyncPlugin = new BackgroundSyncPlugin('hazardCycleQueue', {
    maxRetentionTime: 24 * 60,
});

registerRoute(
    ({ url, request }) =>
        url.pathname.startsWith('/api/v1/hazard-cycles') &&
        request.method === 'POST',
    new NetworkOnly({ plugins: [bgSyncPlugin] }),
    'POST',
);

self.addEventListener('sync', (event) => {
    if (event.tag === 'hazardCycleSync') {
        event.waitUntil(Promise.resolve());
    }
});
