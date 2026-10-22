import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dmzStations, dmzPages, dmzOrders } from '../shared/dmz.mjs'
import { dmzIntel, intelCategories } from '../shared/dmz-intel.mjs'
import { hajinPins } from '../shared/dmz-map.mjs'
import { traitRule } from '../shared/dmz-traits.mjs'
import { resolvePageSeo, sitemapUrls, DEFAULT_SITE_URL } from '../shared/seo.mjs'
import {
  intelStations, intelHandoffs, intelEverything, intelHome, intelHomeLabel, categoryHome, stationOf, bossGroups,
  printerRecipes, recipeMaterials, sumMaterials, normalizePrinterPlan, readPrinterPlan, PRINT_MAX,
  traitPlace, intelNeeds, intelEntry, orderIntel, rankIntel,
} from '../shared/dmz-stations.mjs'

const catalogue = JSON.parse(fs.readFileSync(new URL('../shared/catalogue.json', import.meta.url)))
const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const pageFile = path => [`app/pages${path}.vue`, `app/pages${path}/index.vue`].find(file => fs.existsSync(new URL(`../${file}`, import.meta.url)))
const shelves = [...intelStations, intelEverything]

test('every Intel category has one home: a station or a hand-off', () => {
  for (const category of intelCategories.filter(category => dmzIntel.some(entry => entry.category === category.id))) {
    const homes = [...intelStations.filter(station => station.categories.includes(category.id)), ...intelHandoffs.filter(handoff => handoff.category === category.id)]
    assert.equal(homes.length, 1, category.id)
    assert.ok(categoryHome(category.id), category.id)
  }
  assert.equal(categoryHome('latest'), '/dmz/intel/all?c=latest')
  assert.equal(categoryHome('nothing'), null)
})

test('every entry opens on a real page, in the drawer or on its tracker card', () => {
  const pins = new Set(hajinPins.map(pin => pin.id))
  for (const entry of dmzIntel) {
    const home = intelHome(entry)
    const path = home.split(/[?#]/)[0]
    assert.ok(pageFile(path), `${entry.id}: ${home}`)
    assert.ok(intelHomeLabel(entry), entry.id)
    const pin = home.match(/[?&]pin=([^#&]+)/)?.[1]
    if (pin) assert.ok(pins.has(pin), `${entry.id}: ${pin}`)
    if (entry.tracked) assert.ok(dmzOrders.some(order => home === `/dmz/orders#order-${order.id}`), entry.id)
    else if (!home.includes('#key-')) assert.ok(home.endsWith(`#intel-${entry.id}`), `${entry.id}: ${home}`)
    if (!['map', 'keys'].includes(entry.category) && !entry.tracked) assert.equal(path, stationOf(entry).path, entry.id)
  }
  assert.equal(intelHome(intelEntry('bale')), '/dmz/boss-board#intel-bale')
})

test('station and shelf pages are indexable, in the sitemap and unlocked in the station menu', () => {
  const sitemap = sitemapUrls(catalogue)
  for (const shelf of shelves) {
    const page = dmzPages.find(item => item.path === shelf.path)
    assert.ok(page, shelf.path)
    assert.ok(pageFile(shelf.path), shelf.path)
    assert.equal(resolvePageSeo(catalogue, shelf.path).indexable, true, shelf.path)
    assert.ok(sitemap.includes(DEFAULT_SITE_URL + shelf.path), shelf.path)
  }
  for (const station of intelStations.filter(station => station.fob)) {
    const fob = dmzStations.find(item => item.id === station.id)
    assert.equal(fob.route, station.path, station.id)
    assert.ok(!fob.locked && !fob.lockNote, station.id)
  }
})

test('station facts count what the stations show', () => {
  const fact = id => dmzStations.find(station => station.id === id).facts.join(' ')
  const groups = Object.fromEntries(bossGroups().map(group => [group.id, group.entries.length]))
  assert.match(fact('boss'), new RegExp(`${groups.lieutenants} Lieutenants · ${groups.commanders} Commanders`))
  assert.match(fact('printer'), new RegExp(`${printerRecipes.length} recipes`))
  // The official total; the trees on the page draw every slot of it.
  assert.match(fact('operators'), /66 traits · 22 per tree, 3 trees/)
  assert.match(traitRule('Trait count').value, /^66 traits: 22 per tree/)
})

test('the Boss Board shows every enemy and traits sort into three trees', () => {
  const groups = bossGroups()
  const shown = new Set(groups.flatMap(group => [group.intro?.id, ...group.entries.map(entry => entry.id)]))
  for (const entry of dmzIntel.filter(entry => entry.category === 'enemies')) assert.ok(shown.has(entry.id), entry.id)
  assert.equal(new Set(groups.flatMap(group => group.entries)).size, groups.flatMap(group => group.entries).length)
  const trees = new Set(dmzIntel.filter(entry => entry.type === 'Trait').map(entry => traitPlace(entry).tree).filter(Boolean))
  assert.equal(trees.size, 3)
})

test('every recipe parses into materials, and plans add up and survive bad data', () => {
  for (const entry of printerRecipes) assert.ok(recipeMaterials(entry).every(item => item.amount > 0 && item.name), entry.id)
  const [first, second] = printerRecipes
  const one = sumMaterials({ [first.id]: 1 })
  const three = sumMaterials({ [first.id]: 3 })
  assert.deepEqual(three.map(item => item.amount), one.map(item => item.amount * 3))
  const both = sumMaterials({ [first.id]: 1, [second.id]: 1 })
  const total = list => list.reduce((sum, item) => sum + item.amount, 0)
  assert.equal(total(both), total(one) + total(sumMaterials({ [second.id]: 1 })))
  assert.deepEqual(normalizePrinterPlan({ plan: { [first.id]: 40, [second.id]: -1, bale: 2, unknown: 1, x: 1.5 } }), { plan: { [first.id]: PRINT_MAX } })
  assert.deepEqual(readPrinterPlan('not json'), { plan: {} })
  assert.deepEqual(readPrinterPlan(JSON.stringify({ version: 2, plan: { [first.id]: 1 } })), { plan: {} })
  assert.deepEqual(readPrinterPlan(JSON.stringify({ version: 1, plan: { [first.id]: 2 } })), { plan: { [first.id]: 2 } })
})

test('Ask-first answers open real stations, sections and entries', () => {
  assert.equal(new Set(intelNeeds.map(need => need.id)).size, intelNeeds.length)
  for (const need of intelNeeds) {
    for (const target of [need.to, need.more?.to].filter(Boolean)) {
      const [path, hash] = target.split('#')
      const file = pageFile(path)
      assert.ok(file, target)
      if (hash) assert.ok(read(file).includes(`id="${hash}"`) || intelCategories.some(category => category.id === hash), target)
    }
    for (const id of (need.steps || []).flatMap(step => step.ids)) assert.ok(intelEntry(id), `${need.id}: ${id}`)
    assert.ok(need.kind === 'steps' ? need.steps.length : need.to, need.id)
  }
})

test('Orders name real entries and quick find ranks names first', () => {
  for (const order of dmzOrders) for (const entry of orderIntel(order)) assert.ok(!entry.tracked, `${order.id}: ${entry.id}`)
  assert.ok(orderIntel(dmzOrders.find(order => order.id === 'gear-up')).some(entry => entry.id === 'medkit-recipe'))
  assert.equal(rankIntel('bale').results[0].id, 'bale')
  assert.deepEqual(rankIntel('   '), { results: [], total: 0 })
})

test('old Intel links redirect, and the drawer opens from the shell', () => {
  const middleware = read('app/middleware/dmz-intel-links.ts')
  assert.match(middleware, /intelHome\(entry\)/)
  assert.match(middleware, /categoryHome\(/)
  assert.match(read('app/pages/dmz/intel/index.vue'), /middleware: 'dmz-intel-links'/)
  assert.match(read('app/pages/dmz/intel/all.vue'), /definePageMeta\(\{ intelCards: true \}\)/)
  assert.match(read('app/pages/dmz.vue'), /<LazyDmzIntelDrawer v-if="intelOpen" \/>/)
  // The drawer stops Esc before the shell opens the station menu, and leaves keys to Spotlight while it is open.
  const drawer = read('app/components/dmz/intel/Drawer.vue')
  assert.match(drawer, /addEventListener\('keydown', onKey, \{ capture: true \}\)/)
  assert.match(drawer, /spotlight\.value\) return/)
  assert.match(drawer, /aria-modal="true"/)
  const files = fs.readdirSync(new URL('../app/', import.meta.url), { recursive: true }).filter(file => /\.(vue|ts)$/.test(file) && !/lab|middleware/.test(file))
  for (const file of files) assert.doesNotMatch(read(`app/${file.replaceAll('\\', '/')}`), /\/dmz\/intel#intel-|\/dmz\/intel\?c=/, file)
})
