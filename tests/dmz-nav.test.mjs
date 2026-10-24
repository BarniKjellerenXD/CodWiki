import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dmzStations, dmzDock, dmzRailBreaks, dmzIntelShelves } from '../shared/dmz.mjs'
import { intelStations, intelEverything, intelNeeds, layerLink, placeLink } from '../shared/dmz-stations.mjs'
import { hajinLayers } from '../shared/dmz-map.mjs'
import { guideTiers } from '../shared/dmz-guide.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
// DMZ page content. The lab drafts, their banners and the station menu itself are left out.
const contentFiles = ['app/pages/dmz', 'app/components/dmz']
  .flatMap(dir => fs.readdirSync(new URL(`../${dir}/`, import.meta.url), { recursive: true }).map(file => `${dir}/${file.replaceAll('\\', '/')}`))
  .filter(file => file.endsWith('.vue') && !/\/lab(\/|\.vue$)|LabBanner|DmzStationMenu\.vue$/.test(file))

// The rail is the only way to the top of another tab. Tac-Map pins and the
// drawer's Go to are built in code (:to), so they are not caught here.
test('page content never links to the top of another DMZ page', () => {
  assert.ok(contentFiles.length > 20, 'no DMZ files found')
  const links = contentFiles.flatMap(file => [...read(file).matchAll(/\b(?:to|href)="\/dmz[^"]*"/g)].map(match => `${file}: ${match[0]}`))
  assert.deepEqual(links, [])
  // Intel's chip row only lists Intel's own pages, so it stays inside Intel.
  assert.deepEqual(contentFiles.filter(file => !file.startsWith('app/pages/dmz/intel/') && read(file).includes('<DmzIntelNav')), [])
})

test('dynamic links stay inside their tab', () => {
  for (const need of intelNeeds) {
    for (const target of [need.to, need.more?.to].filter(Boolean)) assert.match(target, /^\/dmz\/intel(\/|#|$)/, `${need.id}: ${target}`)
  }
  for (const tier of guideTiers) for (const step of tier.steps) assert.ok(!step.to, `${tier.id}/${step.id}: ${step.to?.path}`)
  for (const entry of dmzIntel) assert.ok(!entry.link, `${entry.id}: ${entry.link?.to}`)
})

test('place and layer links open the Tac-Map at the map', () => {
  assert.equal(placeLink('nurigo-mall'), '/dmz/hajin?pin=nurigo-mall#map')
  assert.equal(layerLink('police'), '/dmz/hajin?layer=police#map')
  for (const { id } of hajinLayers) assert.equal(layerLink(id), `/dmz/hajin?layer=${id}#map`)
})

test('the rail, dock and Intel shelves agree', () => {
  const ids = dmzStations.map(station => station.id)
  // The dock keeps rail order around the menu button.
  assert.deepEqual(dmzDock.filter(Boolean), ids.filter(id => dmzDock.includes(id)))
  for (const id of dmzRailBreaks) assert.ok(ids.includes(id), id)
  // The shell keeps its own copy of the shelves so it never imports the Intel data.
  assert.deepEqual(dmzIntelShelves, [...intelStations.filter(station => !station.fob), intelEverything].map(({ id, label, path }) => ({ id, label, path })))
  const shell = read('app/pages/dmz.vue')
  assert.doesNotMatch(shell, /#shared\/dmz-[\w-]+\.mjs/)
  assert.ok(!shell.includes('dmz-rail-esc'), 'the ESC key cap is back in the rail')
})
