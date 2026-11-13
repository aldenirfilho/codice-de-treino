'use strict';

const CACHE_VERSION = '1.7.0'; // @pages-release
const SCOPE = self.registration.scope;
const CACHE_PREFIX = 'codice-treino:' + encodeURIComponent(SCOPE) + ':';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const INDEX_URL = new URL('index.html', SCOPE).href;
const SHELL_MARKER = '<meta name="codice-app-shell" content="codice-de-treino">';
const SHELL = { url: SCOPE, type: /^text\/html\b/i };
const ASSETS = new Map([
  ['manifest.json', /^application\/(?:manifest\+json|json)\b/i],
  ['icon.svg', /^image\/svg\+xml\b/i],
  ['icon-180.png', /^image\/png\b/i],
  ['icon-192.png', /^image\/png\b/i],
  ['icon-512.png', /^image\/png\b/i],
  ['app.js', /^(?:application|text)\/(?:x-)?javascript\b/i],
  ['vendor/chart.umd.min.js', /^(?:application|text)\/(?:x-)?javascript\b/i]
].map(([path, type]) => {
  const url = new URL(path, SCOPE).href;
  return [url, { url, type }];
}));

async function download(resource) {
  const response = await fetch(resource.url, {
    credentials: 'same-origin',
    redirect: 'error',
    cache: 'reload'
  });
  if (!response.ok || response.redirected ||
      !resource.type.test(response.headers.get('Content-Type') || '')) {
    throw new Error('Recurso inválido: ' + resource.url);
  }
  if (resource === SHELL && !(await response.clone().text()).includes(SHELL_MARKER)) {
    throw new Error('A página recebida não é o Códice do Treino.');
  }
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const resources = [...ASSETS.values(), SHELL];
    const responses = await Promise.all(resources.map(download));
    const cache = await caches.open(CACHE_NAME);
    try {
      for (const [index, resource] of resources.entries()) {
        await cache.put(resource.url, responses[index]);
      }
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
  // O novo worker aguarda que as páginas abertas sejam fechadas.
});

// A troca de versão só acontece quando a pessoa toca em "Atualizar agora".
self.addEventListener('message', event => {
  if (event.data && event.data.tipo === 'atualizar-codice') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    const obsolete = names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME);
    await Promise.all(obsolete.map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function respond(resource) {
  try {
    const saved = await caches.match(resource.url, { cacheName: CACHE_NAME });
    if (saved) return saved;
  } catch {
    // Se o navegador bloquear o cache, a versão online continua acessível.
  }

  try {
    return await download(resource);
  } catch {
    if (resource !== SHELL) return Response.error();
    return new Response('Abra o Códice do Treino com internet para carregar o aplicativo.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    url.search = '';
    url.hash = '';
    if (url.href === SCOPE || url.href === INDEX_URL) event.respondWith(respond(SHELL));
    return;
  }
  const asset = ASSETS.get(url.href);
  if (asset) event.respondWith(respond(asset));
});
