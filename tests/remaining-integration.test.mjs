import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { expansionGuides } from '../shared/expansion-guides.mjs'
import { expansionTools } from '../shared/expansion-tools.mjs'
import { remainingMapMetadata } from '../shared/planned-maps.mjs'
import { toolDefinitions, normalizeTool, evaluateTool } from '../app/utils/expansionTools.mjs'
const remaining = expansionGuides.filter(guide => ['iw', 'ww2', 'aw', 'vanguard', 'mw3'].includes(guide.gameId))
test('every authored destination has unique progress anchors and valid tools', () => {
  assert.equal(remaining.length, 30)
  assert.deepEqual(remaining.map(g => g.id).sort(), remainingMapMetadata.map(g => g.id).sort())
  for (const guide of remaining) {
    const phases = [...guide.phases, ...guide.sidePhases]
    const steps = phases.flatMap(phase => phase.steps)
    assert.equal(new Set(phases.map(p => p.id)).size, phases.length, `${guide.id}: phase IDs`)
    assert.equal(new Set(steps.map(s => s.id)).size, steps.length, `${guide.id}: step IDs`)
    for (const phase of phases) {
      assert.ok(phase.steps.length, `${guide.id}/${phase.id}`)
      for (const id of phase.tools) assert.ok(expansionTools.some(t => t.id === id), id)
      for (const branch of phase.branches || []) assert.ok(guide.branches?.some(b => b.id === branch), `${guide.id}/${branch}`)
    }
    const generated = fs.readFileSync(`app/components/guide/${guide.id}.vue`, 'utf8')
    const ids = [...generated.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])
    assert.equal(new Set(ids).size, ids.length, `${guide.id}: rendered IDs`)
  }
})
test('all 31 new helpers use the registered engine, reject undeclared state and can start empty', () => {
  const tools = expansionTools.filter(t => t.widget === 'remaining')
  assert.equal(tools.length, 31)
  for (const tool of tools) {
    assert.ok(toolDefinitions[tool.id], tool.id)
    assert.equal(new Set(tool.fields.map(f => f.id)).size, tool.fields.length, tool.id)
    assert.ok(!('undeclared' in normalizeTool(tool.id, { undeclared: true })))
    const result = evaluateTool(tool.id, {})
    assert.ok(['waiting', 'ready', 'ambiguous', 'invalid'].includes(result.status), tool.id)
    assert.doesNotMatch(result.message, /no registered/, tool.id)
    for (const group of tool.groups || []) for (const id of group.fields) assert.ok(tool.fields.some(f => f.id === id), `${tool.id}/${id}`)
  }
})
test('materialized reference images exist and retain attribution', () => {
  const manifest = JSON.parse(fs.readFileSync('app/data/remainingImages.json', 'utf8'))
  assert.ok(manifest.count > 800)
  for (const asset of manifest.assets) {
    assert.ok(fs.existsSync(`public${asset.src}`), asset.id)
    assert.ok(asset.credit && asset.source && asset.rightsStatus, asset.id)
  }
})
