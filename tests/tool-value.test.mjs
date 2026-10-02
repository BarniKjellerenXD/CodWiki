import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { retiredTools, retiredToolDestination } from '../shared/retired-tools.mjs'
import { expansionTools } from '../shared/expansion-tools.mjs'
import { expansionGuides } from '../shared/expansion-guides.mjs'

test('retired helpers disappear from discovery and resolve to preserved guide sections', () => {
  const catalogue=JSON.parse(fs.readFileSync('app/data/catalogue.json','utf8'))
  const search=JSON.parse(fs.readFileSync('app/data/searchIndex.json','utf8'))
  const quick=JSON.parse(fs.readFileSync('app/data/quickQuests.json','utf8'))
  const desktop=fs.readFileSync('desktop-app/renderer/nav.js','utf8')
  assert.equal(expansionTools.filter(t=>t.id.startsWith('bo4-')).length,15)
  assert.equal(expansionTools.filter(t=>t.id.startsWith('bo6-')).length,8)
  for(const [id,destination] of Object.entries(retiredTools)) {
    for(const suffix of ['', '/', '.html', '.html/']) assert.equal(retiredToolDestination(`/tools/${id}${suffix}`),destination)
    assert.ok(!expansionTools.some(t=>t.id===id),id)
    assert.ok(!catalogue.tools.some(t=>t.id===id),id)
    assert.ok(!search.some(t=>t.id===id||t.route===`/tools/${id}`),id)
    assert.ok(!desktop.includes(`"${id}"`),id)
    for(const guide of expansionGuides) {
      for(const phase of [...guide.phases,...(guide.sidePhases||[])]) assert.ok(!phase.tools.includes(id),id)
      for(const phase of quick[guide.id]||[]) for(const step of phase.steps) assert.ok(!step.tools?.includes(id),id)
    }
    const [route,anchor]=destination.split('#')
    const component=fs.readFileSync(`app/components/guide/${route.split('/').at(-1)}.vue`,'utf8')
    assert.ok(component.includes(`id="${anchor}"`),destination)
    const compatibility=fs.readFileSync(`app/pages/tools/${id}.vue`,'utf8')
    assert.ok(compatibility.includes(destination),id)
    assert.ok(!compatibility.includes('PuzzlePage')&&!compatibility.includes('usePuzzleState'),id)
  }
  for(const url of ['/tools/unknown','/guides/bo4-blood-trials','/tools/bo4-blood-trials-extra']) assert.equal(retiredToolDestination(url),null)
})
