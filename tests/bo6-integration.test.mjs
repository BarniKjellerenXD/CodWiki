import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { bo6Guides, bo6Tools } from '../shared/bo6-guides.mjs'
import { normalizeTool } from '../app/utils/expansionTools.mjs'
import { emptyProgress, ensureRun, readProgress, resetRun } from '../app/utils/companion.mjs'

const root = new URL('../', import.meta.url)
const read = file => JSON.parse(fs.readFileSync(new URL(file, root), 'utf8'))
const catalogue = read('shared/catalogue.json')
const quick = read('app/data/quickQuests.json')
const search = read('app/data/searchIndex.json')
const expected = ['bo6-liberty-falls', 'bo6-terminus', 'bo6-citadelle-des-morts', 'bo6-the-tomb', 'bo6-shattered-veil', 'bo6-reckoning']

test('every BO6 map exposes its complete guide, saved checklist, side quests and tools in the catalogue', () => {
  assert.deepEqual(bo6Guides.map(g => g.id), expected)
  assert.deepEqual(catalogue.maps.filter(g => g.gameId === 'bo6').map(g => g.id), expected)
  for (const guide of bo6Guides) {
    const phases = [...guide.phases, ...(guide.sidePhases || [])]
    const steps = phases.flatMap(p => p.steps)
    assert.equal(new Set(phases.map(p => p.id)).size, phases.length, `${guide.id}: unique phase anchors`)
    assert.equal(new Set(steps.map(s => s.id)).size, steps.length, `${guide.id}: unique progress keys`)
    assert.ok(guide.sidePhases?.length, `${guide.id}: side quests`)
    assert.ok(guide.sources.some(url => url.includes('reddit.com')), `${guide.id}: community research`)
    assert.ok(guide.sources.some(url => !url.includes('reddit.com')), `${guide.id}: corroborating source`)
    assert.ok(bo6Tools.some(t => t.map === guide.id), `${guide.id}: tools`)
    const component = fs.readFileSync(new URL(`app/components/guide/${guide.id}.vue`, root), 'utf8')
    const anchors = [...component.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])
    assert.equal(new Set(anchors).size, anchors.length, `${guide.id}: duplicate generated anchors`)
    assert.deepEqual(quick[guide.id].flatMap(p => p.steps.map(s => s.id)), guide.phases.flatMap(p => p.steps.map(s => s.id)))
    for (const phase of phases) {
      assert.ok(search.some(entry => entry.route === `/guides/${guide.id}#details-${phase.id}`), `${guide.id}: searchable ${phase.id}`)
      for (const id of phase.tools) assert.ok(bo6Tools.some(t => t.id === id && t.map === guide.id), `${guide.id}: own tool ${id}`)
    }
    for (const step of steps) {
      for (const link of step.links || []) {
        if (link.href.startsWith('#')) assert.ok(anchors.includes(link.href.slice(1)), `${guide.id}: broken ${link.href}`)
      }
    }
  }
  for (const tool of bo6Tools) {
    assert.ok(catalogue.tools.some(t => t.id === tool.id && t.route === `/tools/${tool.id}`), tool.id)
    assert.ok(search.some(t => t.id === tool.id && t.kind === 'Tool'), tool.id)
  }
})

test('BO6 guide images are real local image files, not hotlinks or downloaded error pages', () => {
  const sources = new Set(bo6Guides.flatMap(g => [g.image, ...[...g.phases, ...g.sidePhases].flatMap(p => p.steps.flatMap(s => (s.images || []).map(i => i.src)))]))
  for (const src of sources) {
    assert.ok(src?.startsWith('/images/bo6-'), `local BO6 image: ${src}`)
    const file = new URL(`public${src}`, root)
    const bytes = fs.readFileSync(file)
    const type = path.extname(src)
    assert.ok(bytes.length > 128, src)
    if (type === '.webp') assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', src)
    else if (type === '.png') assert.equal(bytes.subarray(1, 4).toString(), 'PNG', src)
    else if (type === '.jpg' || type === '.jpeg') assert.equal(bytes.readUInt16BE(0), 0xffd8, src)
    else assert.fail(`Unexpected guide image type: ${src}`)
  }
})

test('BO6 state restores observations and resets only the selected map run', () => {
  const progress = emptyProgress()
  for (const guide of bo6Guides) ensureRun(progress, guide.id).done = [guide.phases[0].steps[0].id]
  const restored = readProgress(JSON.stringify(progress))
  resetRun(restored, expected[0])
  assert.deepEqual(restored.runs[expected[0]].done, [])
  for (const guide of bo6Guides.slice(1)) assert.deepEqual(restored.runs[guide.id].done, [guide.phases[0].steps[0].id])
  for (const tool of bo6Tools) {
    const value = Object.fromEntries(tool.fields.map(field => [field.id, field.type === 'check' ? true : field.options?.[0] || '01']))
    const normalized = normalizeTool(tool.id, value)
    assert.deepEqual(normalizeTool(tool.id, JSON.parse(JSON.stringify(normalized))), normalized, tool.id)
    assert.equal(Object.hasOwn(normalizeTool(tool.id, {...value, injected: 'unknown'}), 'injected'), false)
  }
})
