import fs from 'node:fs'
import path from 'node:path'

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const catalog = read('app/data/catalogue.json')
const research = read('docs/map-expansion-research/coverage.json')
const classic = read('docs/map-expansion-research/classic-map-implementation.json')
const gapNotes = new Map(classic.gaps.map(row => [row.id, row.reason]))
gapNotes.set('bo4-tag-der-toten', 'No adequate layout verified. Call of the Dead omits the expanded geography; the local lava image is a gameplay reference.')
gapNotes.set('mw3-unstable-rift', 'No arena layout verified. Urzikstan obelisk entry points do not represent the separate Rift arena.')
const maps = catalog.maps.map(map => {
  const file = `app/data/maps/${map.id}.json`
  const old = research.maps.find(row => row.id === map.id)
  if (!fs.existsSync(file)) {
    const details = old?.research || {}
    const lead = ['lead', 'candidate', 'partial'].includes(old?.status)
    const reason = gapNotes.get(map.id) || (lead
      ? 'Referenced creator/layout lead remains unverified or lacks accepted geometry and usage evidence.'
      : 'No adequate overhead or verified region topology found; guide screenshots alone are insufficient.')
    return { id: map.id, name: map.name, gameId: map.gameId, status: 'gap', reason, geometryCaveats: details.geometryCaveats || [], nextAction: details.nextAction || 'Verify a suitable source or author and review an original layout.', researchStatus: old?.status, sourcePages: old?.sourcePages || [] }
  }
  const data = read(file)
  if (!map.interactiveMap) throw new Error(`${map.id}: catalog not regenerated`)
  const childLinks = Object.values(data.guideQuickLinks || {}).reduce((total, links) => total + Object.keys(links).length, 0)
  const existing = old?.status === 'existing'
  return {
    id: map.id, name: map.name, gameId: map.gameId, status: existing ? 'existing-updated' : 'added',
    coverage: data.coverage || { kind: 'existing', note: 'Existing dataset retained with reviewed physical types and the shared compact controls.' },
    layers: data.layers.length, locations: data.locations.length, targets: data.targets.length,
    guideLinks: Object.keys(data.quickLinks).length + childLinks,
    dataset: file, artwork: data.layers.map(layer => layer.image), sources: data.sources,
  }
})
if (maps.length !== 96 || new Set(maps.map(map => map.id)).size !== 96) throw new Error('Expected all 96 distinct catalog maps')
const accepted = maps.filter(map => map.status !== 'gap')
const counts = {
  catalogMaps: maps.length, interactiveMaps: accepted.length,
  addedMaps: maps.filter(map => map.status === 'added').length,
  updatedMaps: maps.filter(map => map.status === 'existing-updated').length,
  gaps: maps.filter(map => map.status === 'gap').length,
  schematicMaps: accepted.filter(map => map.coverage.kind === 'schematic').length,
  layers: accepted.reduce((total, map) => total + map.layers, 0),
  uniqueArtwork: new Set(accepted.flatMap(map => map.artwork)).size,
  locations: accepted.reduce((total, map) => total + map.locations, 0),
  targets: accepted.reduce((total, map) => total + map.targets, 0),
  guideLinks: accepted.reduce((total, map) => total + map.guideLinks, 0),
}
const report = { reviewed: '2026-10-11', scope: '96 catalog maps; Outbreak child guides share their parent atlas and are not extra map rows.', counts, maps }
const root = 'docs/map-expansion-research'
fs.writeFileSync(path.join(root, 'implementation-coverage.json'), JSON.stringify(report, null, 2) + '\n')
const lines = [
  '# Implemented map coverage', '',
  `${counts.interactiveMaps} interactive maps: ${counts.addedMaps} added and ${counts.updatedMaps} existing maps updated. ${counts.gaps} catalog entries remain explicit source/geometry gaps.`, '',
  `${counts.layers} layers (${counts.uniqueArtwork} distinct artwork files), ${counts.locations} locations, ${counts.targets} guide targets and ${counts.guideLinks} guide bindings. ${counts.schematicMaps} maps use original, partial region diagrams with area precision. These counts do not imply an exhaustive in-game inventory.`, '',
  '## By game', '', '| Game | Catalog maps | Interactive maps | Gaps |', '| --- | ---: | ---: | ---: |',
  ...[...new Set(maps.map(map => map.gameId))].map(id => { const group = maps.filter(map => map.gameId === id); return `| ${id} | ${group.length} | ${group.filter(map => map.status !== 'gap').length} | ${group.filter(map => map.status === 'gap').length} |` }), '',
  '## Accepted layouts', '', '| Map | Coverage | Layers | Locations | Guide targets |', '| --- | --- | ---: | ---: | ---: |',
  ...accepted.map(map => `| ${map.name} (${map.id}) | ${map.coverage.kind} | ${map.layers} | ${map.locations} | ${map.targets} |`), '',
  '## Remaining gaps', '',
  ...maps.filter(map => map.status === 'gap').map(map => `- **${map.name} (${map.id}):** ${map.reason}`), '',
  'Full per-map coverage notes, source credits and asset references are in [implementation-coverage.json](implementation-coverage.json). The earlier [coverage.json](coverage.json) is the pre-implementation research snapshot; candidate status was not a publication approval.', '',
  'Regenerate with `node scripts/report-map-coverage.mjs` after `node scripts/generate-catalogue.mjs`.', '',
]
fs.writeFileSync(path.join(root, 'implementation-coverage.md'), lines.join('\n'))
console.log(JSON.stringify(counts))
