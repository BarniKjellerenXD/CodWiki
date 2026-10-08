import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { normalizeCatalogue, createCatalogueManager, readJsonResponse, MAX_CATALOGUE_BYTES } = require('../desktop-app/catalogue.js')
const { migrateSettings, isInternal, isExternalUrl } = require('../desktop-app/runtime.js')
const { newerVersion, releaseResult, createUpdateChecker, RELEASE_PAGE } = require('../desktop-app/updates.js')
const nav = require('../desktop-app/renderer/nav.js')
const bundled = JSON.parse(fs.readFileSync(new URL('../public/desktop-catalogue.json', import.meta.url)))
const copy = () => structuredClone(bundled)
const response = value => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json; charset=utf-8' } })
function temp(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'codwiki-catalogue-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  return path.join(directory, 'library.json')
}
function changed() {
  const next = copy()
  next.entries.find(entry => entry.id === 'iw-spaceland-speakers').label = 'Speaker sequence'
  return next
}
function release(version = '1.6.0') {
  return { tag_name: `desktop-v${version}`, html_url: `https://github.com/BarniKjellerenXD/CodWiki/releases/tag/desktop-v${version}`, draft: false, prerelease: false }
}

test('published metadata includes the complete game library and preserves legacy shortcut IDs', () => {
  const normalized = normalizeCatalogue(bundled)
  assert.equal(normalized.games.length, 13)
  assert.equal(normalized.entries.filter(entry => entry.kind === 'guide').length, 96)
  assert.equal(normalized.entries.filter(entry => entry.kind === 'tool').length, 108)
  assert.equal(normalized.entries.length, 206)
  assert.equal(normalized.entries.filter(entry => ['iw', 'ww2', 'aw', 'vanguard', 'mw3'].includes(entry.game) && entry.kind === 'tool').length, 31)
  assert.ok(normalized.entries.every(entry => entry.status === 'available'))
  assert.equal(normalized.revision, bundled.revision)
  for (const previous of nav) assert.equal(normalized.entries.find(entry => entry.id === previous.id)?.url, previous.url)
  assert.equal(normalized.entries.find(entry => entry.id === 'kowakujo-clock').url, '/tools/kowakujo-clock-solver')
  const extraFields = copy()
  extraFields.revision = 'untrusted-revision'
  extraFields.entries[0].preload = 'malicious.js'
  extraFields.entries[0].nodeIntegration = true
  assert.deepEqual(normalizeCatalogue(extraFields), normalized)
})

test('invalid schema, unsafe routes, duplicates and cross-game associations are rejected as a whole', () => {
  const mutations = [
    raw => { raw.schemaVersion = 2 },
    raw => { raw.games.push(raw.games[0]) },
    raw => { raw.entries.push(raw.entries[0]) },
    raw => { raw.entries[0].id = 'constructor' },
    raw => { raw.entries[0].url = 'https://outside.test/guides/ashes' },
    raw => { raw.entries[0].url = '//outside.test/guides/ashes' },
    raw => { raw.entries[0].url = '/guides/../settings' },
    raw => { raw.entries[0].url = '/guides/test?redirect=outside' },
    raw => { raw.entries[0].url = '/tools/wrong-kind' },
    raw => { raw.entries[0].external = true },
    raw => { raw.entries[1].game = 'iw' },
    raw => { raw.entries[1].map = 'missing-map' },
    raw => { raw.entries[0].label = 'x'.repeat(161) },
    raw => { raw.games.push({ id: 'future-game', name: 'Future game', planned: false }) },
  ]
  for (const mutate of mutations) { const raw = copy(); mutate(raw); assert.throws(() => normalizeCatalogue(raw)) }
})

test('JSON reader rejects error pages, broken JSON and oversized streamed bodies', async () => {
  assert.deepEqual(await readJsonResponse(response({ ok: true })), { ok: true })
  await assert.rejects(readJsonResponse(new Response('{}', { status: 503 })), /request failed/)
  await assert.rejects(readJsonResponse(new Response('<html>offline</html>', { headers: { 'content-type': 'text/html' } })), /not JSON/)
  await assert.rejects(readJsonResponse(new Response('broken', { headers: { 'content-type': 'application/json' } })), SyntaxError)
  await assert.rejects(readJsonResponse(new Response('{}', { headers: { 'content-type': 'application/json', 'content-length': MAX_CATALOGUE_BYTES + 1 } })), /too large/)
  let cancelled = false
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_CATALOGUE_BYTES + 1)) }, cancel() { cancelled = true } })
  await assert.rejects(readJsonResponse(new Response(stream, { headers: { 'content-type': 'application/json' } })), /too large/)
  assert.equal(cancelled, true)
})

test('successful refresh atomically saves metadata and the next launch can use it offline', async t => {
  const cachePath = temp(t), calls = [], notices = []
  const manager = createCatalogueManager({ bundled, site: 'https://codzmwiki.com', cachePath, now: () => 12345, fetchResponse: async (url, options) => { calls.push({ url, options }); return response(changed()) }, onChange: state => notices.push(state) })
  assert.equal(manager.get().source, 'bundled')
  const live = await manager.refresh()
  assert.equal(live.source, 'live')
  assert.equal(live.state, 'current')
  assert.equal(live.checkedAt, 12345)
  assert.notEqual(live.catalogue.revision, bundled.revision)
  assert.equal(calls[0].url, 'https://codzmwiki.com/desktop-catalogue.json')
  assert.equal(calls[0].options.redirect, 'error')
  assert.equal(calls[0].options.credentials, 'omit')
  assert.ok(calls[0].options.signal instanceof AbortSignal)
  assert.equal(notices.length, 1)
  assert.equal(fs.existsSync(cachePath + '.tmp'), false)
  const saved = createCatalogueManager({ bundled, site: 'https://codzmwiki.com', cachePath, fetchResponse: async () => { throw new Error('offline') } })
  assert.equal(saved.get().source, 'saved')
  assert.deepEqual(saved.get().catalogue, live.catalogue)
  assert.equal((await saved.refresh()).state, 'offline')
  assert.deepEqual(saved.get().catalogue, live.catalogue)
})

test('failed and unsupported responses retain the last valid library and cache', async t => {
  const cachePath = temp(t)
  let remote = changed()
  const manager = createCatalogueManager({ bundled, site: 'https://codzmwiki.com', cachePath, fetchResponse: async () => response(remote) })
  const valid = await manager.refresh()
  const contents = fs.readFileSync(cachePath, 'utf8')
  for (const invalid of [{ schemaVersion: 2 }, { schemaVersion: 1, games: [], entries: [] }]) {
    remote = invalid
    const failed = await manager.refresh(true)
    assert.deepEqual(failed.catalogue, valid.catalogue)
    assert.equal(failed.state, invalid.schemaVersion === 2 ? 'unsupported' : 'offline')
    assert.equal(fs.readFileSync(cachePath, 'utf8'), contents)
  }
})

test('corrupt cache falls back to bundled metadata and an unwritable cache still allows a live library', async t => {
  const cachePath = temp(t)
  fs.writeFileSync(cachePath, 'broken JSON')
  assert.equal(createCatalogueManager({ bundled, site: 'https://codzmwiki.com', cachePath, fetchResponse: async () => response(bundled) }).get().source, 'bundled')
  const blocker = path.join(path.dirname(cachePath), 'not-a-directory')
  fs.writeFileSync(blocker, 'file')
  const manager = createCatalogueManager({ bundled, site: 'https://codzmwiki.com', cachePath: path.join(blocker, 'cache.json'), fetchResponse: async () => response(changed()) })
  assert.equal((await manager.refresh()).state, 'save-failed')
  assert.equal(manager.get().source, 'live')
})

test('focus checks are throttled, manual checks bypass the interval and concurrent requests share one fetch', async () => {
  let timestamp = 10, calls = 0, finish
  const manager = createCatalogueManager({ bundled, site: 'https://codzmwiki.com', now: () => timestamp, fetchResponse: () => { calls++; return new Promise(resolve => { finish = resolve }) } })
  const first = manager.refresh(), second = manager.refresh(true)
  assert.equal(calls, 1)
  finish(response(bundled))
  assert.deepEqual(await first, await second)
  await manager.refresh()
  assert.equal(calls, 1)
  const forced = manager.refresh(true)
  assert.equal(calls, 2)
  finish(response(bundled)); await forced
  timestamp += 15 * 60 * 1000
  const later = manager.refresh()
  assert.equal(calls, 3)
  finish(response(bundled)); await later
})

test('a timed-out network check leaves the bundled library usable', async () => {
  const manager = createCatalogueManager({ bundled, site: 'https://codzmwiki.com', timeoutMs: 10, fetchResponse: (url, { signal }) => new Promise((resolve, reject) => {
    const guard = setTimeout(() => reject(new Error('test guard')), 1000)
    signal.addEventListener('abort', () => { clearTimeout(guard); reject(signal.reason) }, { once: true })
  }) })
  const result = await manager.refresh()
  assert.equal(result.state, 'offline')
  assert.equal(result.source, 'bundled')
  assert.equal(result.catalogue.revision, bundled.revision)
})

test('custom bindings for tools without default shortcuts survive upgrade, sync and restart', () => {
  const raw = { shortcuts: { 'nav:iw-spaceland-speakers': 'Ctrl+Alt+J', 'nav:ashes-of-the-damned': null, 'nav:removed': 'Ctrl+Alt+X' }, labels: { 'iw-spaceland-speakers': 'My sequence' }, hidden: ['iw-spaceland-souvenirs'], order: ['iw-spaceland-speakers', 'iw-zombies-in-spaceland'], startZoom: 0.523, restoreLastPage: false }
  const upgraded = migrateSettings(raw, bundled.entries, nav.SYSTEM_ACTIONS)
  const restarted = migrateSettings(JSON.parse(JSON.stringify(upgraded)), normalizeCatalogue(changed()).entries, nav.SYSTEM_ACTIONS)
  assert.equal(restarted.shortcuts['nav:iw-spaceland-speakers'], 'Ctrl+Alt+J')
  assert.equal(restarted.shortcuts['nav:ashes-of-the-damned'], null)
  assert.equal(restarted.shortcuts['nav:removed'], undefined)
  assert.deepEqual(restarted.labels, raw.labels)
  assert.deepEqual(restarted.hidden, raw.hidden)
  assert.deepEqual(restarted.order.slice(0, 2), raw.order)
  assert.equal(restarted.order.length, bundled.entries.length)
  assert.equal(restarted.startZoom, 0.523)
  assert.equal(restarted.restoreLastPage, false)
  assert.equal(Object.keys(restarted.shortcuts).length, bundled.entries.length + nav.SYSTEM_ACTIONS.length)
})

test('URL guards keep credentials, file links and script URLs out of navigation and external opening', () => {
  assert.equal(isInternal('https://codzmwiki.com/tools/mw3-rune-portals', 'https://codzmwiki.com'), true)
  for (const url of ['https://codzmwiki.com.evil.test/', 'https://user:pass@codzmwiki.com/', 'file:///settings', 'javascript:alert(1)', 'data:text/html,hi']) assert.equal(isInternal(url, 'https://codzmwiki.com'), false)
  assert.equal(isExternalUrl('https://github.com/BarniKjellerenXD/CodWiki/releases/latest'), true)
  for (const url of ['file:///settings', 'javascript:alert(1)', 'https://user:pass@outside.test/', 'broken']) assert.equal(isExternalUrl(url), false)
})

test('release checks compare numeric versions and only accept official stable desktop releases', () => {
  assert.equal(newerVersion('1.10.0', '1.9.9'), true)
  assert.equal(newerVersion('2.0.0', '1.99.99'), true)
  for (const version of ['1.6.0', '1.5.9', '1.7.0-beta', 'invalid']) assert.equal(newerVersion(version, '1.6.0'), false)
  assert.equal(releaseResult(release('1.7.0'), '1.6.0').state, 'available')
  assert.equal(releaseResult(release('1.5.0'), '1.6.0').state, 'current')
  for (const patch of [{ draft: true }, { prerelease: true }, { tag_name: 'site-v1.7.0' }, { html_url: 'https://outside.test/download' }]) assert.throws(() => releaseResult({ ...release(), ...patch }, '1.6.0'))
})

test('unavailable app checks give an official download fallback without claiming the app is up to date', async () => {
  const checker = createUpdateChecker({ version: '1.6.0', fetchResponse: async () => { throw new Error('offline') } })
  assert.equal(checker.get().state, 'not-checked')
  assert.deepEqual(await checker.check(), { state: 'unavailable', currentVersion: '1.6.0', url: RELEASE_PAGE })
})

test('native update checks share pending work and manual retries bypass the cache', async () => {
  let calls = 0, finish
  const checker = createUpdateChecker({ version: '1.6.0', fetchResponse: () => { calls++; return new Promise(resolve => { finish = resolve }) } })
  const a = checker.check(), b = checker.check(true)
  finish(response(release('1.7.0')))
  assert.deepEqual(await a, await b)
  await checker.check(); assert.equal(calls, 1)
  const retry = checker.check(true); assert.equal(calls, 2)
  finish(response(release('1.7.0'))); assert.equal((await retry).state, 'available')
})
