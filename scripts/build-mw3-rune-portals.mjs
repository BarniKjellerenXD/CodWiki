// Join reviewed codes to the calibrated atlas; never infer a destination from its grid alone.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const root = fileURLToPath(new URL('../', import.meta.url))
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'))
const research = read('docs/remaining-games/puzzle-data.json').mwRunePortals
const assets = read('docs/remaining-games/assets.json').assets
const atlas = read('app/data/maps/mw3-urzikstan.json')
const areas = atlas.locations.filter(location => location.category === 'area')

function asset(id) {
  const item = assets.find(item => item.id === id)
  if (!item?.dimensions?.every(value => value > 0)) throw new Error(`Missing portal image: ${id}`)
  const src = `/images/remaining/${path.basename(item.localPath)}`
  const bytes = fs.readFileSync(path.join(root, 'docs/remaining-games', item.localPath))
  if (createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error(`Portal image changed: ${id}`)
  const destination = path.join(root, 'public', src)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  if (!fs.existsSync(destination) || !fs.readFileSync(destination).equals(bytes)) fs.writeFileSync(destination, bytes)
  return { id, src, width: item.dimensions[0], height: item.dimensions[1], source: item.page, credit: item.credit }
}

function point(item, kind, index) {
  const location = atlas.locations.find(location => location.id === `portals-${kind === 'entrance' ? 'entry' : 'exit'}-${item.id}`)
  if (!location || location.grid !== item.grid) throw new Error(`Uncalibrated portal: ${item.id}`)
  const nearest = [...areas].sort((a, b) => Math.hypot(a.x - location.x, a.y - location.y) - Math.hypot(b.x - location.x, b.y - location.y))[0]
  return { id: item.id, kind, label: kind === 'entrance' ? String.fromCharCode(65 + index) : String(index + 1), grid: item.grid, nearbyArea: nearest.label.split(' · ')[0], x: location.x, y: location.y }
}

export const portalData = {
  version: 2,
  reviewed: '2026-10-11',
  source: 'https://wzhub.gg/map/urzikstan/mwz',
  entryCost: research.entryCostReference,
  map: { ...atlas.layers[0], note: undefined },
  grid: atlas.grid,
  entrances: research.entrances.map((item, index) => ({ ...point(item, 'entrance', index), photos: item.assetIds.map(asset) })),
  destinations: research.destinations.map((item, index) => ({ ...point(item, 'destination', index), glyphIds: item.glyphIds, code: asset(item.codeAssetId), photo: asset(item.contextAssetId) })),
  glyphs: research.glyphs.map(({ id, memoryLabel }) => ({ id, label: memoryLabel })),
}
const codes = new Set()
for (const destination of portalData.destinations) {
  if (destination.glyphIds.length !== 3 || destination.glyphIds.some(id => !portalData.glyphs.some(glyph => glyph.id === id))) throw new Error(`Invalid rune code: ${destination.id}`)
  const code = destination.glyphIds.join(',')
  if (codes.has(code)) throw new Error(`Ambiguous rune code: ${destination.id}`)
  codes.add(code)
}
const output = path.join(root, 'app/data/mw3RunePortals.json')
const json = JSON.stringify(portalData, null, 2) + '\n'
if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== json) fs.writeFileSync(output, json)
