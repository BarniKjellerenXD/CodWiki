import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dmzStations, dmzDock, dmzPages, dmzOrders, dmzOrderChapters, dmzBriefingSections, hajinPois, normalizeDmzOrders, readDmzOrders, orderComplete, orderProgress } from '../shared/dmz.mjs'
import { resolvePageSeo } from '../shared/seo.mjs'

const catalogue = JSON.parse(fs.readFileSync(new URL('../shared/catalogue.json', import.meta.url)))
const search = JSON.parse(fs.readFileSync(new URL('../app/data/searchIndex.json', import.meta.url)))
const briefing = fs.readFileSync(new URL('../app/pages/dmz/briefing.vue', import.meta.url), 'utf8')

test('live stations open real DMZ pages or briefing sections; locked stations explain why', () => {
  const paths = new Set(dmzPages.map(page => page.path))
  for (const station of dmzStations) {
    assert.ok(station.icon && station.desc && station.facts.length, station.id)
    if (station.locked) {
      assert.equal(station.route, undefined, station.id)
      assert.ok(station.lockNote, station.id)
      continue
    }
    const [path, hash] = station.route.split('#')
    assert.ok(paths.has(path), station.route)
    if (hash) assert.ok(dmzBriefingSections.some(section => section.id === hash) && briefing.includes(`id="${hash}"`), station.route)
  }
  assert.equal(new Set(dmzStations.map(station => station.id)).size, dmzStations.length)
  assert.equal(dmzDock.filter(id => id === null).length, 1)
  for (const id of dmzDock.filter(Boolean)) assert.ok(dmzStations.some(station => station.id === id), id)
})

test('every briefing section in the contents list exists on the page', () => {
  for (const section of dmzBriefingSections) assert.match(briefing, new RegExp(`id="${section.id}"`), section.id)
})

test('DMZ pages are indexable with their own titles', () => {
  for (const page of dmzPages) {
    assert.ok(fs.existsSync(new URL(`../app/pages${page.path}.vue`, import.meta.url)), page.path)
    const meta = resolvePageSeo(catalogue, page.path)
    assert.equal(meta.indexable, true, page.path)
    assert.equal(meta.title, page.title)
    assert.match(meta.title + meta.description, /DMZ|Hajin/)
  }
})

test('saved Orders keep known tasks, clamp counters and survive bad data', () => {
  const state = normalizeDmzOrders({ counts: { 'run-over-enemies': 12, 'radio-towers': -3, 'steal-vehicle': 1.5, unknown: 4 }, collapsed: { 'eye-in-the-sky': true, ghost: true } })
  assert.equal(state.counts['run-over-enemies'], 7)
  assert.equal(state.counts['radio-towers'], 0)
  assert.equal(state.counts['steal-vehicle'], 0)
  assert.equal('unknown' in state.counts, false)
  assert.deepEqual(state.collapsed, { 'eye-in-the-sky': true })
  assert.deepEqual(readDmzOrders('not json'), normalizeDmzOrders({}))
  assert.deepEqual(readDmzOrders(JSON.stringify({ version: 2, counts: { 'steal-vehicle': 1 } })), normalizeDmzOrders({}))
  assert.equal(readDmzOrders(JSON.stringify({ version: 1, counts: { 'steal-vehicle': 1 } })).counts['steal-vehicle'], 1)
})

test('an Order completes only when every counter reaches its target', () => {
  const order = dmzOrders.find(order => order.id === 'watch-for-bumps')
  const counts = { 'steal-vehicle': 1, 'refuel-repair': 1, 'run-over-enemies': 6 }
  assert.equal(orderComplete(order, counts), false)
  assert.equal(orderComplete(order, { ...counts, 'run-over-enemies': 7 }), true)
  assert.deepEqual(orderProgress({ ...counts, 'run-over-enemies': 7 }), { done: 3, total: dmzOrders.flatMap(order => order.tasks).length })
  assert.equal(new Set(dmzOrders.flatMap(order => order.tasks.map(task => task.id))).size, dmzOrders.flatMap(order => order.tasks).length)
})

test('every Orders page has three Orders and its reward', () => {
  const chapters = dmzOrderChapters()
  for (const chapter of chapters) {
    assert.equal(chapter.orders.length, 3, chapter.title)
    assert.match(chapter.reward || '', /^\$20,000/, chapter.title)
  }
  const runs = dmzOrders.filter((order, index) => order.chapter !== dmzOrders[index - 1]?.chapter)
  assert.equal(runs.length, chapters.length, 'a page\'s Orders are not listed together')
  assert.ok(dmzStations.find(station => station.id === 'orders').facts.some(fact => fact.includes(`${dmzOrders.length} Orders`)))
})

test('search reaches DMZ pages, briefing sections, Hajin POIs and Orders with a DMZ label', () => {
  const dmz = search.filter(entry => entry.route.startsWith('/dmz'))
  for (const page of dmzPages) assert.ok(dmz.some(entry => entry.route === page.path && entry.kind === 'DMZ'), page.path)
  for (const poi of hajinPois) assert.ok(dmz.some(entry => entry.name === poi), poi)
  for (const order of dmzOrders) assert.ok(dmz.some(entry => entry.name === order.name), order.name)
  assert.ok(dmz.every(entry => entry.context?.startsWith('Modern Warfare 4 · DMZ')))
  assert.equal(new Set(search.map(entry => entry.id)).size, search.length)
})

test('the DMZ theme stays inside the DMZ section', () => {
  const main = fs.readFileSync(new URL('../app/assets/css/main.css', import.meta.url), 'utf8')
  assert.doesNotMatch(main, /backdrop-filter:\s*blur|Saira/)
  assert.match(fs.readFileSync(new URL('../app/pages/index.vue', import.meta.url), 'utf8'), /to="\/dmz"/)
})
