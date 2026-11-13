'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const worker = fs.readFileSync(path.resolve(__dirname, '../sw.js'), 'utf8');
const scope = 'https://exemplo.github.io/codice-de-treino/';
const prefix = 'codice-treino:' + encodeURIComponent(scope) + ':';
const appMarker = '<meta name="codice-app-shell" content="codice-de-treino">';

function resource(url) {
  if (url === scope) return new Response(appMarker, {headers: {'Content-Type': 'text/html'}});
  const type = url.endsWith('.js') ? 'application/javascript' :
    url.endsWith('.json') ? 'application/json' :
    url.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  return new Response(url, {headers: {'Content-Type': type}});
}

function setup(fetch = resource, failWrite = false) {
  const listeners = {};
  const stores = new Map();
  const calls = [];
  const self = {
    registration: {scope},
    addEventListener(name, handler) { listeners[name] = handler; },
    clients: {claim() { calls.push('claim'); }},
    skipWaiting() { calls.push('skipWaiting'); }
  };
  const caches = {
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
    async match(url, {cacheName}) { return stores.get(cacheName)?.get(url)?.clone(); },
    async open(name) {
      const store = stores.get(name) || new Map();
      stores.set(name, store);
      return {
        async put(url, response) {
          if (failWrite && url === scope) throw new Error('quota');
          store.set(url, response);
        }
      };
    }
  };
  vm.runInNewContext(worker, {self, caches, Response, URL, async fetch(url, options) {
    calls.push({url, options});
    return fetch(url, options);
  }});

  return {
    stores,
    calls,
    message(data) { listeners.message({data}); },
    lifecycle(name) {
      let pending;
      listeners[name]({waitUntil(promise) { pending = promise; }});
      return pending;
    },
    request(url, {method = 'GET', mode = 'navigate'} = {}) {
      let pending;
      listeners.fetch({request: {url, method, mode}, respondWith(response) { pending = response; }});
      return pending;
    }
  };
}

test('instala shell e dependências na subpasta e usa a cópia offline', async () => {
  let online = true;
  const env = setup(url => {
    if (!online) throw new Error('offline');
    return resource(url);
  });
  await env.lifecycle('install');
  assert.equal(env.calls.length, 8);
  assert.ok(env.calls.every(call => call.url.startsWith(scope) && call.options.redirect === 'error'));
  assert.ok(!env.calls.includes('skipWaiting'));

  online = false;
  assert.equal(await (await env.request(scope + '?origem=atalho')).text(), appMarker);
  assert.equal(await (await env.request(scope + 'index.html')).text(), appMarker);
  for (const asset of ['app.js', 'vendor/chart.umd.min.js']) {
    const url = scope + asset;
    assert.equal(await (await env.request(url, {mode: 'cors'})).text(), url);
  }
  assert.equal(env.calls.length, 8);
});

test('rejeita login ou erros de hospedagem devolvidos com HTTP 200', async () => {
  for (const failingURL of [scope, scope + 'vendor/chart.umd.min.js']) {
    const env = setup(url => url === failingURL
      ? new Response('<title>Sign in</title>', {headers: {'Content-Type': 'text/html'}})
      : resource(url));
    await assert.rejects(env.lifecycle('install'));
    assert.equal(env.stores.size, 0);
  }
});

test('uma instalação interrompida remove somente seu cache incompleto', async () => {
  const env = setup(resource, true);
  env.stores.set(prefix + 'old', new Map());
  await assert.rejects(env.lifecycle('install'), /quota/);
  assert.deepEqual([...env.stores.keys()], [prefix + 'old']);
});

test('ativação remove apenas versões antigas do próprio escopo', async () => {
  const env = setup();
  await env.lifecycle('install');
  const [current] = env.stores.keys();
  const unrelated = ['codice-treino-v6', 'treino360-pro-v2.0.1',
    'codice-treino:' + encodeURIComponent(scope + 'experimento/') + ':other'];
  env.stores.set(prefix + 'old', new Map());
  for (const name of unrelated) env.stores.set(name, new Map());
  await env.lifecycle('activate');
  assert.deepEqual([...env.stores.keys()], [current, ...unrelated]);
  assert.equal(env.calls.at(-1), 'claim');
});

test('ignora links externos, páginas sem relação, backups e POST', () => {
  const env = setup();
  assert.equal(env.request('https://outro.example/index.html'), undefined);
  assert.equal(env.request('https://exemplo.github.io/outro/'), undefined);
  assert.equal(env.request(scope + 'guia.html'), undefined);
  assert.equal(env.request(scope + 'backup.json'), undefined);
  assert.equal(env.request(scope, {method: 'POST'}), undefined);
  assert.equal(env.calls.length, 0);
});

test('cache ausente tenta rede e retorna erro claro se estiver offline', async () => {
  let online = true;
  const env = setup(url => {
    if (!online) throw new Error('offline');
    return resource(url);
  });
  assert.equal((await env.request(scope)).status, 200);
  online = false;
  const result = await env.request(scope);
  assert.equal(result.status, 503);
  assert.match(await result.text(), /internet/);
});

test('a versão nova só assume quando a pessoa pede "Atualizar agora"', async () => {
  const env = setup();
  await env.lifecycle('install');
  assert.ok(!env.calls.includes('skipWaiting'));
  env.message({tipo: 'outra-coisa'});
  assert.ok(!env.calls.includes('skipWaiting'));
  env.message({tipo: 'atualizar-codice'});
  assert.ok(env.calls.includes('skipWaiting'));
});
