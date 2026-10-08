const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const MAX_CATALOGUE_BYTES = 2 * 1024 * 1024
const CATALOGUE_PATH = '/desktop-catalogue.json'
const identifier = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value) && !['constructor', 'prototype'].includes(value)
const text = (value, max = 160) => typeof value === 'string' && value.trim() && value.length <= max ? value : null
function normalizeCatalogue(raw) {
  if (!raw || raw.schemaVersion !== 1) throw new Error('Unsupported guide library format')
  if (!Array.isArray(raw.games) || !raw.games.length || raw.games.length > 40 || !Array.isArray(raw.entries) || !raw.entries.length || raw.entries.length > 2500) throw new Error('Invalid guide library size')
  const games = raw.games.map(game => {
    if (!identifier(game.id) || !text(game.name) || typeof game.planned !== 'boolean') throw new Error('Invalid game')
    return { id: game.id, name: game.name, aliases: Array.isArray(game.aliases) ? game.aliases.filter(alias => text(alias, 100)).slice(0, 20) : [], planned: game.planned }
  })
  const gameIds = new Set(games.map(game => game.id))
  if (gameIds.size !== games.length) throw new Error('Duplicate game')
  const entries = raw.entries.map(entry => {
    const prefix = entry.kind === 'tool' ? '/tools/' : '/guides/'
    if (!identifier(entry.id) || !identifier(entry.map) || !gameIds.has(entry.game) || !['guide', 'quest', 'tool'].includes(entry.kind) || typeof entry.url !== 'string' || !entry.url.startsWith(prefix) || !/^\/(guides|tools)\/[a-z0-9-]+$/.test(entry.url) || entry.external) throw new Error('Invalid guide destination')
    if (!text(entry.section) || !text(entry.label) || (entry.accel != null && !text(entry.accel, 80))) throw new Error('Invalid navigation label or shortcut')
    const game = games.find(game => game.id === entry.game)
    return { id: entry.id, map: entry.map, game: entry.game, gameName: game.name, group: typeof entry.group === 'string' && entry.group.length <= 80 ? entry.group : '', status: entry.status === 'planned' ? 'planned' : 'available', keywords: typeof entry.keywords === 'string' ? entry.keywords.slice(0, 1000) : '', kind: entry.kind, section: entry.section, label: entry.label, url: entry.url, accel: entry.accel || null, icon: entry.kind === 'tool' ? '↗' : '◇' }
  })
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error('Duplicate navigation entry')
  const guides = new Map(entries.filter(entry => entry.kind === 'guide').map(entry => [entry.id, entry]))
  for (const entry of entries) if ((entry.kind === 'guide' && entry.id !== entry.map) || !guides.has(entry.map) || guides.get(entry.map).game !== entry.game) throw new Error('Invalid guide association')
  for (const game of games) if (!entries.some(entry => entry.game === game.id && entry.kind === 'guide')) throw new Error('Game has no guides')
  const revision = crypto.createHash('sha256').update(JSON.stringify({ games, entries })).digest('hex').slice(0, 20)
  return { schemaVersion: 1, revision, games, entries }
}
function createCatalogueManifest(entries, games) { return normalizeCatalogue({ schemaVersion: 1, games, entries }) }
async function readJsonResponse(response) {
  if (!response.ok) throw new Error('Library request failed')
  if (!/application\/json/i.test(response.headers.get('content-type') || '')) throw new Error('Library response is not JSON')
  const declared = Number(response.headers.get('content-length'))
  if (declared > MAX_CATALOGUE_BYTES) throw new Error('Library response is too large')
  const reader = response.body.getReader(), chunks = []
  let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.length
    if (size > MAX_CATALOGUE_BYTES) { await reader.cancel(); throw new Error('Library response is too large') }
    chunks.push(Buffer.from(value))
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
function createCatalogueManager({ bundled, site, cachePath, fetchResponse, onChange = () => {}, now = Date.now, intervalMs = 15 * 60 * 1000, timeoutMs = 8000 }) {
  const base = normalizeCatalogue(bundled)
  let snapshot = { catalogue: base, source: 'bundled', checkedAt: null, state: 'ready' }
  try {
    if (cachePath && fs.statSync(cachePath).size <= MAX_CATALOGUE_BYTES) {
      const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
      const catalogue = normalizeCatalogue(cache.catalogue)
      snapshot = { catalogue, source: 'saved', checkedAt: Number.isFinite(cache.checkedAt) ? cache.checkedAt : null, state: 'ready' }
    }
  } catch {}
  let pending = null, lastAttempt = null
  async function refresh(force = false) {
    if (pending) return pending
    if (!force && lastAttempt !== null && now() - lastAttempt < intervalMs) return snapshot
    lastAttempt = now()
    pending = (async () => {
      try {
        const response = await fetchResponse(new URL(CATALOGUE_PATH, site).href, { signal: AbortSignal.timeout(timeoutMs), redirect: 'error', credentials: 'omit', cache: 'no-store', headers: { Accept: 'application/json' } })
        const catalogue = normalizeCatalogue(await readJsonResponse(response))
        const checkedAt = now()
        let saved = true
        try {
          if (cachePath) {
            fs.mkdirSync(path.dirname(cachePath), { recursive: true })
            fs.writeFileSync(cachePath + '.tmp', JSON.stringify({ catalogue, checkedAt }))
            fs.renameSync(cachePath + '.tmp', cachePath)
          }
        } catch { saved = false }
        snapshot = { catalogue, checkedAt, source: 'live', state: saved ? 'current' : 'save-failed' }
      } catch (error) {
        snapshot = { ...snapshot, state: error.message === 'Unsupported guide library format' ? 'unsupported' : 'offline' }
      }
      onChange(snapshot)
      return snapshot
    })()
    try { return await pending } finally { pending = null }
  }
  return { get: () => snapshot, refresh }
}
module.exports = { CATALOGUE_PATH, MAX_CATALOGUE_BYTES, createCatalogueManifest, normalizeCatalogue, readJsonResponse, createCatalogueManager }
