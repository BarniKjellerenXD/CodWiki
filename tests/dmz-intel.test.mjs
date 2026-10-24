import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dmzIntel, intelCategories, intelConfidence, intelSources, intelSourceSite, intelFresh, intelLatest, intelDateLabel, filterIntel, groupIntel } from '../shared/dmz-intel.mjs'
import { dmzOrders } from '../shared/dmz.mjs'
import { intelHome } from '../shared/dmz-stations.mjs'

const search = JSON.parse(fs.readFileSync(new URL('../app/data/searchIndex.json', import.meta.url)))
const levels = new Set(intelConfidence.map(level => level.id))
const categories = new Set(intelCategories.map(category => category.id))
const sourceTypes = new Set(['official', 'press', 'guide', 'reddit', 'forum', 'video', 'in-game'])

test('every intel entry is well formed', () => {
  const ids = new Set()
  for (const entry of dmzIntel) {
    assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, entry.id)
    assert.ok(!ids.has(entry.id), `duplicate id ${entry.id}`)
    ids.add(entry.id)
    assert.ok(categories.has(entry.category), `${entry.id}: unknown category ${entry.category}`)
    assert.ok(levels.has(entry.confidence), `${entry.id}: unknown confidence ${entry.confidence}`)
    assert.ok(entry.name?.trim() && entry.summary?.trim(), entry.id)
    assert.ok(entry.summary.length <= 420, `${entry.id}: summary is too long`)
    for (const pair of entry.details || []) assert.ok(pair.length === 2 && pair[0] && pair[1], `${entry.id}: bad detail`)
    assert.equal(new Set((entry.details || []).map(pair => pair[0])).size, (entry.details || []).length, `${entry.id}: repeated detail label`)
    assert.ok(entry.sources.length, `${entry.id}: no sources`)
    for (const id of entry.sources) assert.ok(intelSources[id], `${entry.id}: unknown source ${id}`)
    if (entry.link) assert.match(entry.link.to, /^\/dmz\//, entry.id)
  }
})

test('confidence labels are backed by their sources', () => {
  for (const entry of dmzIntel) {
    const sources = entry.sources.map(id => intelSources[id])
    if (entry.confidence === 'official') assert.ok(sources.some(source => source.type === 'official'), `${entry.id}: no official source`)
    // Confirmed needs two independent sources, unless one shows it in-game.
    // Separate player threads count apart; press pages count once per site.
    if (entry.confidence === 'confirmed' && entry.proof !== 'in-game') {
      const independent = new Set(sources.map(source => ['reddit', 'forum', 'video'].includes(source.type) ? source.url : intelSourceSite(source)))
      assert.ok(independent.size >= 2, `${entry.id}: confirmed needs two independent sources`)
    }
    if (['tips', 'issues'].includes(entry.category)) assert.notEqual(entry.confidence, 'reported', `${entry.id}: tips and issues need two sources`)
  }
})

test('every source is used, typed and linked', () => {
  const used = new Set(dmzIntel.flatMap(entry => entry.sources))
  for (const [id, source] of Object.entries(intelSources)) {
    assert.ok(used.has(id), `unused source ${id}`)
    assert.ok(sourceTypes.has(source.type), `${id}: unknown type ${source.type}`)
    assert.ok(source.label?.trim(), id)
    if (source.type === 'in-game') assert.equal(source.url, undefined, id)
    else assert.match(source.url, /^https:\/\/[^\s]+$/, id)
  }
  // Compare URLs without the scheme, a leading www. or a trailing slash, so the
  // same page cannot be registered twice under two spellings.
  const urls = Object.values(intelSources).map(source => source.url).filter(Boolean)
    .map(url => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))
  assert.deepEqual(urls.filter((url, index) => urls.indexOf(url) !== index), [], 'a source URL is listed twice')
})

test('filters combine category, confidence and every search word', () => {
  const ids = filters => filterIntel(dmzIntel, filters).map(entry => entry.id)
  assert.ok(ids({ query: 'Radio  TOWERS' }).includes('order-triangulation'))
  assert.deepEqual(ids({ query: 'radio zebra' }), [])
  assert.deepEqual(ids({ category: 'keys', query: 'radio towers' }), [])
  assert.ok(!ids({ confidence: ['official'] }).includes('order-triangulation'))
  assert.equal(filterIntel(dmzIntel).length, dmzIntel.length)
  const order = groupIntel(dmzIntel).map(group => intelCategories.indexOf(group.category))
  assert.deepEqual(order, [...order].sort((a, b) => a - b))
  assert.ok(groupIntel(dmzIntel).every(group => group.entries.length))
})

test('research rounds stamp ISO dates and the latest filter shows only that round', () => {
  for (const entry of dmzIntel) {
    for (const key of ['added', 'updated']) if (entry[key]) assert.match(entry[key], /^\d{4}-\d{2}-\d{2}$/, `${entry.id}: ${key}`)
    assert.ok(!(entry.added && entry.updated), `${entry.id}: both added and updated`)
  }
  const fresh = filterIntel(dmzIntel, { fresh: true })
  assert.equal(fresh.length, dmzIntel.filter(intelFresh).length)
  assert.ok(fresh.every(entry => [entry.added, entry.updated].includes(intelLatest)))
  if (intelLatest) assert.ok(fresh.length)
  assert.equal(intelDateLabel('2026-10-02'), '2 Oct')
})

test('tracked Orders appear in the database and search opens real cards', () => {
  for (const order of dmzOrders) assert.ok(dmzIntel.some(entry => entry.id === `order-${order.id}`), order.id)
  const intelSearch = search.filter(entry => entry.id.startsWith('dmz-intel:'))
  assert.equal(intelSearch.length, dmzIntel.filter(entry => !entry.tracked).length)
  for (const result of intelSearch) assert.equal(result.route, intelHome(dmzIntel.find(entry => result.id === `dmz-intel:${entry.id}`)), result.id)
})
