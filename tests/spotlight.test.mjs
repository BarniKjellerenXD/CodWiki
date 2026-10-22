import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { hydrateSpotlight, searchSpotlight, groupSpotlight, spotlightContext, normalizeSpotlight, SPOTLIGHT_KINDS, SPOTLIGHT_GROUPS } from '../shared/spotlight.mjs'
import { dmzOrders, dmzBriefingSections, dmzPages } from '../shared/dmz.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'
import { dmzKeys } from '../shared/dmz-keys.mjs'
import { hajinPins } from '../shared/dmz-map.mjs'
import { intelHome } from '../shared/dmz-stations.mjs'

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const json = file => JSON.parse(read(file))
const index = json('public/spotlight/index.json')
const previews = json('public/spotlight/text.json')
const version = json('app/data/spotlightVersion.json')
const search = json('app/data/searchIndex.json')
const quickQuests = json('app/data/quickQuests.json')
const portals = json('app/data/mw3RunePortals.json')
const items = hydrateSpotlight(index)
const routes = new Set(items.map(item => item.route))
const top = (query, options) => searchSpotlight(items, query, options).results[0]

test('every row decodes to a known kind with a unique route and a real map', () => {
  assert.equal(routes.size, items.length)
  for (const item of items) {
    assert.ok(SPOTLIGHT_KINDS[item.kind], item.route)
    assert.ok(item.name.trim(), item.route)
    assert.ok(item.route.startsWith('/'), item.route)
    if (item.map) assert.ok(index.maps[item.map], item.route)
    assert.ok(SPOTLIGHT_GROUPS.some(group => group.id === item.group), item.kind)
  }
  for (const route of Object.keys(previews)) assert.ok(routes.has(route), route)
})

test('every route opens an existing page', () => {
  for (const route of routes) {
    const path = route.split(/[?#]/)[0].replace(/\/$/, '')
    const file = path === '' ? 'app/pages/index.vue' : `app/pages${path}.vue`
    assert.ok(fs.existsSync(new URL(`../${file}`, import.meta.url)) || fs.existsSync(new URL(`../app/pages${path}/index.vue`, import.meta.url)), route)
  }
})

test('the index covers the search index, quest steps, map spots and portals', () => {
  for (const entry of search.filter(entry => ['Guide', 'Tool', 'Quick parts'].includes(entry.kind) || (entry.kind === 'Section' && entry.map))) assert.ok(routes.has(entry.route), entry.route)
  for (const [guide, phases] of Object.entries(quickQuests)) for (const phase of phases) for (const step of phase.steps) {
    if (step.html.replace(/<[^>]+>/g, '').trim()) assert.ok([...routes].some(route => route.endsWith(`/guides/${guide}#quick-step-${step.id}`)), `${guide} ${step.id}`)
  }
  for (const file of fs.readdirSync(new URL('../app/data/maps/', import.meta.url))) {
    const data = json(`app/data/maps/${file}`)
    const spots = items.filter(item => item.kind === 'spot' && item.map === data.id)
    const labels = new Set(data.locations.map(location => location.label.toLowerCase().replace(/\s+/g, ' ').trim()))
    assert.equal(spots.length, labels.size, data.id)
    const ids = new Set([...data.locations.map(location => location.id), ...(data.targets || []).map(target => target.id)])
    for (const spot of spots) assert.ok(ids.has(spot.route.split('#map:')[1]), spot.route)
  }
  for (const portal of [...portals.entrances, ...portals.destinations]) assert.ok([...routes].some(route => route.endsWith(`=${portal.id}`)), portal.id)
})

test('DMZ results point at real pins, keys, Orders, Intel and briefing sections', () => {
  const ids = (prefix, pattern) => items.filter(item => item.route.startsWith(prefix)).map(item => item.route.match(pattern)?.[1]).filter(Boolean)
  const pins = new Set(hajinPins.map(pin => pin.id))
  for (const id of ids('/dmz/hajin?pin=', /pin=([^#&]+)/)) assert.ok(pins.has(id), id)
  for (const pin of hajinPins.filter(pin => !pin.same)) assert.ok(routes.has(`/dmz/hajin?pin=${pin.id}#map`), pin.id)
  assert.deepEqual(ids('/dmz/stash#key-', /#key-(.+)$/).sort(), dmzKeys.map(key => key.id).sort())
  assert.deepEqual(ids('/dmz/orders#order-', /#order-(.+)$/).sort(), dmzOrders.map(order => order.id).sort())
  // Intel entries open on the station they live on, in its entry drawer.
  const intel = new Map(dmzIntel.map(entry => [entry.id, entry]))
  for (const item of items.filter(item => item.kind === 'dmz-intel')) assert.equal(item.route, intelHome(intel.get(item.route.match(/#intel-(.+)$/)?.[1])), item.route)
  const keyIntel = new Set(dmzKeys.map(key => key.intel))
  for (const entry of dmzIntel.filter(entry => !entry.tracked && !keyIntel.has(entry.id))) assert.ok(routes.has(intelHome(entry)), entry.id)
  for (const section of dmzBriefingSections) assert.ok(routes.has(`/dmz/briefing#${section.id}`), section.id)
  for (const page of dmzPages) assert.ok(routes.has(page.path), page.path)
})

test('names rank first, the page you are on lifts its own map, and typos still find things', () => {
  assert.equal(top('serum').route, '/tools/ashes-serum')
  assert.equal(top('bale').route, '/dmz/boss-board#intel-bale')
  assert.match(top('kino').route, /^\/guides\/bo\d-kino-der-toten$/)
  assert.equal(top('Kowakujō').route, '/guides/kowakujo')
  assert.equal(top('origins', { here: spotlightContext('/guides/bo2-origins', items) }).route, '/guides/bo2-origins')
  assert.equal(top('origins', { here: spotlightContext('/guides/bo3-origins', items) }).route, '/guides/bo3-origins')
  assert.equal(top('pack a punch', { here: spotlightContext('/guides/bo3-origins', items) }).map, 'bo3-origins')
  assert.notEqual(top('kino', { here: spotlightContext('/guides/bo3-origins', items) }).map, 'bo3-origins')
  const typo = searchSpotlight(items, 'jugernog')
  assert.equal(typo.fuzzy, true)
  assert.match(typo.results[0].name, /Juggernog/)
  assert.equal(searchSpotlight(items, 'juggernog').fuzzy, false)
  assert.ok(searchSpotlight(items, 'h6', { scope: 'd' }).results.some(item => item.kind === 'dmz-place'))
  assert.equal(top('h6', { here: spotlightContext('/dmz/briefing', items) }).mode, 'd')
  assert.equal(top('serum', { here: spotlightContext('/dmz/briefing', items) }).route, '/tools/ashes-serum')
  assert.deepEqual(searchSpotlight(items, '   '), { results: [], total: 0, fuzzy: false })
  for (const query of ['packapunch', 'quickrevive', 'speedcola']) assert.ok(searchSpotlight(items, query).total > 5, query)
  assert.ok(searchSpotlight(items, 'raygun').results.filter(item => /ray gun/i.test(item.name)).length >= 5)
  assert.equal(top('ee').kind, 'quest')
  assert.equal(searchSpotlight(items, 'zzzz qqqq').total, 0)
})

test('scopes keep to one mode or the current map', () => {
  assert.ok(searchSpotlight(items, 'map', { scope: 'd' }).results.every(item => item.mode === 'd'))
  assert.ok(searchSpotlight(items, 'map', { scope: 'z' }).results.every(item => item.mode === 'z'))
  const here = spotlightContext('/tools/ashes-serum/', items)
  assert.equal(here.map, 'ashes-of-the-damned')
  const local = searchSpotlight(items, 'the', { scope: 'map', here })
  assert.ok(local.total > 0 && local.results.every(item => item.map === 'ashes-of-the-damned'))
  assert.equal(searchSpotlight(items, 'the', { scope: 'map', here: {} }).total, 0)
})

test('page context, grouping and actions', () => {
  assert.deepEqual(spotlightContext('/dmz/boss-board#intel-bale', items), { map: '', mode: 'd' })
  assert.deepEqual(spotlightContext('/', items), { map: '', mode: '' })
  assert.equal(spotlightContext('/guides/bo3-origins?branch=x#quick-1', items).map, 'bo3-origins')
  const { results } = searchSpotlight(items, 'pack a punch')
  const groups = groupSpotlight(results, { perGroup: 2 })
  assert.equal(groups[0].id, results[0].group)
  assert.ok(groups.every(group => group.items.length <= 2 && group.total >= group.items.length))
  assert.equal(groupSpotlight(results, { perGroup: 2, open: [groups[0].id] })[0].items.length, groups[0].total)
  const [action] = hydrateSpotlight(index, [{ id: 'action:theme-paper', name: 'Theme: Paper', kind: 'action', route: '', keywords: 'light' }]).slice(-1)
  assert.equal(action.id, 'action:theme-paper')
  assert.equal(searchSpotlight([action], 'light theme').results[0], action)
  assert.equal(normalizeSpotlight('Kowakujō — Pack-a-Punch'), 'kowakujo pack a punch')
})

// Fetched as static files on first use: an import() would be prefetched on every page.
test('the index stays a static download within its size budget, versioned by content', () => {
  const body = name => fs.readFileSync(new URL(`../public/spotlight/${name}.json`, import.meta.url))
  assert.ok(body('index').length < 1_200_000)
  assert.ok(body('text').length < 800_000)
  for (const name of ['index', 'text']) assert.equal(version[name], crypto.createHash('sha1').update(body(name)).digest('hex').slice(0, 10), name)
  const files = fs.readdirSync(new URL('../app/', import.meta.url), { recursive: true }).filter(file => /\.(vue|ts|mjs)$/.test(file))
  for (const file of files) assert.doesNotMatch(read(`app/${file.replaceAll('\\', '/')}`), /data\/spotlight(-text)?\.json|spotlight\/(index|text)\.json/, file)
  assert.match(read('app/composables/useSpotlight.ts'), /fetch\(`\/spotlight\/\$\{name\}\.json\?v=\$\{version\[name\]\}`\)/)
})

// The home search box opens this dialog with its text, so the two rank alike;
// app/data/searchIndex.json only feeds the builder and stays out of page bundles.
test('the home search hands its text to Spotlight instead of bundling an index', () => {
  assert.match(read('app/pages/index.vue'), /openSpotlight\(text\)/)
  const files = fs.readdirSync(new URL('../app/', import.meta.url), { recursive: true }).filter(file => /\.(vue|ts|mjs)$/.test(file))
  for (const file of files) assert.doesNotMatch(read(`app/${file.replaceAll('\\', '/')}`), /searchIndex\.json/, file)
  assert.ok(searchSpotlight(items, 'modern warfare 3 countermeasures').results.some(item => item.route === '/guides/mw3-dark-aether-season-2'))
})
