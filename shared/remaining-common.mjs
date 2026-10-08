// Authoring-only helpers. Client evaluators use remaining-core.mjs instead.
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
export { waiting, invalid, ready, ambiguous, modulo, orderedSlots } from './remaining-core.mjs'
const assets = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../docs/remaining-games/assets.json', import.meta.url)), 'utf8')).assets
const byAsset = new Map(assets.map(asset => [asset.id, asset]))
export const field = (id, label, options = null, extra = {}) => ({ id, label, options, ...extra })
export const numbers = (length, start = 0) => Array.from({ length }, (_, i) => String(start + i))
export const step = (id, text, quick, extra = {}) => ({ id, text, quick, ...extra })
export const phase = (id, title, steps, extra = {}) => ({ id, title, steps, tools: [], ...extra })
export function image(id, alt) {
  const asset = byAsset.get(id)
  if (!asset?.localPath) throw new Error(`Unavailable local research image: ${id}`)
  const extension = asset.localPath.match(/\.[a-z0-9]+$/i)?.[0]
  if (!extension) throw new Error(`Image extension missing: ${id}`)
  const preview = fs.existsSync(fileURLToPath(new URL(`../docs/remaining-games/assets/previews/${id}.webp`, import.meta.url))) ? `/images/remaining/preview/${id}.webp` : undefined
  return { src: `/images/remaining/${id}${extension}`, ...(preview ? { previewSrc: preview } : {}), alt, caption: alt, credit: asset.credit, width: asset.dimensions?.[0], height: asset.dimensions?.[1], source: asset.page, assetId: id }
}
export const tool = (id, map, name, help, fields, extra = {}) => ({ id, map, name, help, fields, version: 1, kind: 'recorder', evaluate: 'remaining', widget: 'remaining', ...extra })
export const guide = (id, gameId, name, intro, phases, sidePhases, sources, extra = {}) => ({
  id, gameId, name, intro, phases: phases.map((phase, index) => index === 0 && !phase.group ? { ...phase, group: 'Main Quest' } : phase), sidePhases: sidePhases.map((phase, index) => index === 0 && !phase.group ? { ...phase, group: 'Side Quests' } : phase), sources: sources.map(source => typeof source === 'string' ? source : source.url), sourceLabels: Object.fromEntries(sources.filter(source => typeof source === 'object').map(source => [source.url, source.label])), reviewed: '2026-10-08',
  reviewNote: 'Source-reviewed on 8 October 2026, using the references below and the research handoff. These instructions and puzzle calculations have software checks; they have not been verified in a complete in-game playthrough. Record symbols, sequences and completion cues from your match. Screenshot and community-chart creators are credited with each illustration.',
  ...extra,
})
