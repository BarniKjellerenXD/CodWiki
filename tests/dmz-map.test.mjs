import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { hajinMap, hajinLayers, hajinPins, hajinPin, hajinReports, hajinThreatParts, hajinThreatSeeds, mapSources, threatLevels, toArt, squareOf, squareCentre } from '../shared/dmz-map.mjs'
import { zoneField, ownerAt, traceRegions } from '../shared/dmz-zones.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'
import { dmzStations } from '../shared/dmz.mjs'

const search = JSON.parse(fs.readFileSync(new URL('../app/data/searchIndex.json', import.meta.url)))

const layers = new Set(hajinLayers.map(layer => layer.id))
const PLACES = new Set(['poi', 'fortress', 'area', 'compound'])
const intelIds = new Set(dmzIntel.map(entry => entry.id))

test('every marker lands on the art and in a grid square', () => {
  for (const pin of hajinPins) {
    assert.ok(layers.has(pin.layer), pin.id)
    const [u, v] = toArt(pin.at)
    assert.ok(u > 0 && u < hajinMap.width && v > 0 && v < hajinMap.height, `${pin.id} at ${u},${v}`)
    assert.equal(pin.square, squareOf(pin.at), pin.id)
    assert.match(pin.square, /^[A-J][1-9]$/, pin.id)
  }
  // The grid starts on the art; the art is cropped partway through row 9.
  const { left, top, cell, columns } = hajinMap.grid
  const [u0, v0] = toArt([left, top]), [u1] = toArt([left + columns.length * cell, top])
  assert.ok(u0 >= 0 && v0 >= 0 && u1 <= hajinMap.width)
  assert.equal(squareOf(squareCentre('D7')), 'D7')
})

test('the grid matches squares read in game', () => {
  const near = (layer, place) => hajinPins.filter(pin => pin.layer === layer && pin.near === place).map(pin => pin.square)
  const anyIn = (layer, square) => hajinPins.some(pin => pin.layer === layer && pin.square === square)
  // The official example, then squares from in-game screenshots and key cards.
  assert.equal(hajinPin('imjin-farmland').square, 'D7')
  assert.ok(near('police', 'nurigo-mall').includes('H5'))
  assert.ok(near('police', 'wolves-stadium').includes('G7'))
  assert.ok(anyIn('fire', 'C2'), 'Hanrim fire station')
  assert.ok(near('lt-tower', 'tong-il-village').includes('D3'))
  assert.equal(hajinPin('fortress-heavenly-luck-casino').square, 'F4')
  assert.equal(hajinPin('fortress-re-education-center').square, 'B7')
})

test('official marker counts', () => {
  const count = layer => hajinPins.filter(pin => pin.layer === layer).length
  assert.deepEqual(
    ['poi', 'fortress', 'area', 'compound', 'police', 'clinic', 'fire', 'gas', 'marine-gas', 'ammo', 'uav', 'lt-tower'].map(count),
    [13, 7, 22, 6, 5, 7, 6, 18, 6, 28, 14, 5],
  )
  // The Deploy station quotes these numbers.
  const facts = dmzStations.find(station => station.id === 'deploy').facts.join(' ')
  assert.match(facts, new RegExp(`\\b${count('poi')} major locations`))
  assert.match(facts, new RegExp(`\\b${hajinPins.length} official markers`))
  assert.match(facts, new RegExp(`\\b${hajinReports.length} reported sites`))
})

test('major locations carry the Deep Dive threat ratings', () => {
  for (const pin of hajinPins.filter(pin => pin.layer === 'poi')) {
    assert.ok(pin.parts?.length, pin.id)
    for (const [, level] of pin.parts) assert.ok(threatLevels.includes(level), `${pin.id}: ${level}`)
    const peak = Math.max(...pin.parts.map(([, level]) => threatLevels.indexOf(level)))
    assert.equal(pin.threat, threatLevels[peak], pin.id)
  }
  for (const pin of hajinPins) {
    if (pin.parent) assert.ok(hajinPin(pin.parent), `${pin.id} parent ${pin.parent}`)
    if (pin.same) assert.equal(hajinPin(pin.same)?.name, pin.name, pin.id)
    if (pin.near) assert.ok(PLACES.has(hajinPin(pin.near)?.layer), `${pin.id} near ${pin.near}`)
    for (const id of pin.intel || []) assert.ok(intelIds.has(id), `${pin.id} intel ${id}`)
  }
})

test('the threat view lists every rated part, drawn at its own label or marked unmapped', () => {
  for (const poi of hajinPins.filter(pin => pin.layer === 'poi')) {
    const parts = hajinThreatParts.filter(part => part.poi === poi.id)
    assert.deepEqual(parts.map(part => [part.name, part.level]), poi.parts, poi.id)
    for (const part of parts) {
      if (!part.pin) { assert.equal(part.at, null, part.id); continue }
      const place = hajinPin(part.pin)
      assert.deepEqual(part.at, place.at, part.id)
      assert.ok(place.id === poi.id || place.parent === poi.id, `${part.id} lies outside ${poi.id}`)
      assert.ok(hajinThreatSeeds.some(seed => seed.part === part.id && seed.at === place.at), part.id)
    }
  }
  // Parts rated above anything drawn for their location get a dashed edge instead.
  assert.deepEqual(hajinThreatParts.filter(part => part.hotter).map(part => part.name), ['Air Base Bunker', 'Nenshin Tech Complex'])
})

test('threat zones keep every label, and unrated places stay uncoloured', () => {
  const field = zoneField(hajinThreatSeeds, 4)
  // A zone that swallowed another label would hide that place's rating, or paint an unrated place.
  hajinThreatSeeds.forEach((seed, k) => assert.equal(ownerAt(field, seed.at), k, seed.part || `unrated place at ${seed.at}`))
  assert.ok(hajinThreatSeeds.some(seed => !seed.level))
  const key = k => hajinThreatSeeds[k].level ? `${hajinThreatSeeds[k].poi}|${hajinThreatSeeds[k].level}` : null
  const regions = traceRegions(field, key)
  assert.deepEqual(new Set(regions.keys()), new Set(hajinThreatSeeds.map((seed, k) => key(k)).filter(Boolean)))
  for (const rings of regions.values()) {
    for (const ring of rings) {
      assert.ok(ring.length >= 8)
      for (const at of ring) {
        const [u, v] = toArt(at)
        assert.ok(u > -60 && u < hajinMap.width + 60 && v > -60 && v < hajinMap.height + 60, `${at}`)
      }
    }
  }
})

test('zone outlines close, and an inner zone leaves a hole', () => {
  const seeds = [{ at: [0, 0], reach: 100 }, { at: [10, 0], reach: 30 }, { at: [400, 0], reach: 50 }]
  const regions = traceRegions(zoneField(seeds, 4), k => ['outer', 'inner', 'far'][k])
  assert.deepEqual([...regions].map(([key, rings]) => [key, rings.length]).sort(), [['far', 1], ['inner', 1], ['outer', 2]])
  const area = ring => Math.abs(ring.reduce((sum, [x, y], n) => { const [x2, y2] = ring[(n + 1) % ring.length]; return sum + x * y2 - x2 * y }, 0) / 2)
  assert.ok(Math.abs(area(regions.get('far')[0]) - Math.PI * 50 ** 2) < 300)
})

test('pins and reports share one id space without clashes', () => {
  const ids = [...hajinPins.map(pin => pin.id), ...hajinReports.map(report => report.id)]
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, id)
})

test('reported sites name a real place or a square, and real sources', () => {
  for (const report of hajinReports) {
    assert.ok(layers.has(report.type) && hajinLayers.find(layer => layer.id === report.type).group === 'Reported', report.id)
    assert.ok(report.name && report.where, report.id)
    if (report.anchor) {
      assert.ok(PLACES.has(hajinPin(report.anchor)?.layer), `${report.id} anchor ${report.anchor}`)
      assert.ok(hajinPin(report.anchor).reports.includes(report.id), report.id)
    } else assert.ok(report.squares?.length, `${report.id} has no place and no square`)
    for (const square of report.squares || []) assert.match(square, /^[A-J][1-9]$/, report.id)
    if (report.threat) assert.ok(threatLevels.includes(report.threat), report.id)
    if (report.intel) assert.ok(intelIds.has(report.intel), `${report.id} intel ${report.intel}`)
    assert.ok(report.sources.length, report.id)
    for (const id of report.sources) assert.ok(mapSources[id]?.url, `${report.id} source ${id}`)
  }
})

test('report confidence follows the Intel rules', () => {
  const host = url => new URL(url).hostname.replace(/^www\./, '')
  for (const report of hajinReports) {
    const sources = report.sources.map(id => mapSources[id])
    const independent = new Set(sources.map(source => ['reddit', 'forum', 'video'].includes(source.type) ? source.url : host(source.url)))
    const expected = sources.some(source => source.type === 'official') ? 'official' : independent.size >= 2 ? 'confirmed' : 'reported'
    assert.equal(report.confidence, expected, report.id)
    // Notes add detail; the confidence label covers how sure the sources are.
    if (report.note) assert.doesNotMatch(report.note, /^(Reported, unconfirmed|Single source|Community-reported)/, report.id)
  }
})

test('every layer has something to show', () => {
  for (const layer of hajinLayers) {
    const size = layer.group === 'Reported' ? hajinReports.filter(report => report.type === layer.id).length : hajinPins.filter(pin => pin.layer === layer.id).length
    assert.ok(size > 0, layer.id)
    assert.ok(layer.label && layer.one && layer.desc, layer.id)
  }
})

test('the Tac-Map art is the credited, reviewed file', () => {
  const assets = JSON.parse(fs.readFileSync(new URL('../docs/mw4-dmz-assets.json', import.meta.url)))
  const entry = assets.find(asset => asset.path === hajinMap.image)
  assert.ok(entry?.credit && entry.page && entry.reviewed)
  const file = fs.readFileSync(new URL(`../public${hajinMap.image}`, import.meta.url))
  assert.equal(crypto.createHash('sha256').update(file).digest('hex'), entry.sha256)
  for (const source of hajinMap.sources) assert.match(source.url, /^https:\/\/www\.callofduty\.com\//)
})

test('site search opens each named place on the Tac-Map', () => {
  for (const pin of hajinPins.filter(pin => PLACES.has(pin.layer) && !pin.same)) {
    const entry = search.find(item => item.route === `/dmz/hajin?pin=${pin.id}#map`)
    assert.equal(entry?.name, pin.name, pin.id)
  }
})
