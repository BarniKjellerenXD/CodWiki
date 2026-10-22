import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
  traitTrees, traitRows, traitList, traitRules, traitTips, traitIcons, majorPair, traitsIn,
  emptyBuild, normalizeBuild, readBuild, buildSpent, buildMajor, canPick, pickInBuild, buildToQuery, buildFromQuery,
  TRAIT_POINTS, TREE_CAP,
} from '../shared/dmz-traits.mjs'
import { traitConcepts, traitCriteria, traitScores, traitMix } from '../shared/dmz-traits-lab.mjs'
import { dmzIntel, intelSources } from '../shared/dmz-intel.mjs'
import { guideSources } from '../shared/dmz-guide-sources.mjs'
import { dmzLabPages } from '../shared/dmz.mjs'
import { traitPlace } from '../shared/dmz-stations.mjs'

const sources = { ...intelSources, ...guideSources }
const intelIds = new Set(dmzIntel.map(entry => entry.id))
const levels = ['official', 'confirmed', 'reported']

test('every tree has three fixed Major pairs on rows 3, 6 and 9', () => {
  assert.deepEqual(traitRows.map(row => row.choices), [1, 3, 2, 3, 3, 2, 3, 3, 2])
  for (const tree of traitTrees) {
    for (const row of [3, 6, 9]) {
      const pair = majorPair(tree.id, row)
      assert.equal(pair.length, 2, `${tree.id} row ${row}`)
      assert.deepEqual(pair.map(trait => trait.pair), [pair[1].id, pair[0].id])
      for (const trait of pair) assert.ok(traitIcons[trait.id], `${trait.id} has an icon`)
    }
    assert.ok(traitsIn(tree.id, 'minor').length >= 10, tree.id)
    assert.ok(traitsIn(tree.id, 'minor').every(trait => trait.row === undefined), `${tree.id} Minors have no fixed row`)
  }
})

test('traits, rules and tips carry a confidence label and real sources', () => {
  assert.equal(new Set(traitList.map(trait => trait.id)).size, traitList.length)
  for (const item of [...traitList, ...traitRules]) {
    assert.ok(levels.includes(item.confidence), item.id || item.label)
    assert.ok(item.sources.length, item.id || item.label)
    for (const id of item.sources) assert.ok(sources[id], `${item.id || item.label}: ${id}`)
  }
  for (const trait of traitList) if (trait.intel) assert.ok(intelIds.has(trait.intel), trait.id)
  for (const tip of traitTips) {
    assert.ok(traitList.some(trait => trait.id === tip.trait), tip.trait)
    assert.ok(tip.say && tip.players >= 1 && tip.threads.length, tip.trait)
    for (const id of tip.threads) assert.equal(sources[id]?.type, 'reddit', `${tip.trait}: ${id}`)
    assert.ok(!/["“”]/.test(tip.say), `${tip.trait}: paraphrase, do not quote`)
    assert.ok(!/\bu\//.test(tip.say), `${tip.trait}: no usernames`)
  }
})

test('Intel agrees with the trees on which traits are Majors', () => {
  for (const entry of dmzIntel.filter(entry => entry.category === 'traits' && entry.type === 'Trait')) {
    const trait = traitList.find(item => item.intel === entry.id)
    if (!trait || trait.kind === 'prestige') continue
    // Some Intel entries give no type or tree yet; the ones that do must agree.
    const place = traitPlace(entry)
    assert.equal(place.kind === 'Major', trait.kind === 'major', entry.id)
    if (place.tree && trait.kind === 'major') assert.equal(place.tree, trait.tree, entry.id)
  }
})

test('new sources do not repeat an Intel URL', () => {
  const intelUrls = new Set(Object.values(intelSources).map(source => source.url?.replace(/\/$/, '')).filter(Boolean))
  for (const [id, source] of Object.entries(guideSources)) assert.ok(!intelUrls.has(source.url.replace(/\/$/, '')), id)
})

test('the planner keeps to the in-game rules', () => {
  let build = emptyBuild()
  assert.ok(canPick(build, 'scout', 1) && !canPick(build, 'scout', 2))
  assert.equal(pickInBuild(build, 'scout', 2, 'l'), build, 'rows go in order')
  build = pickInBuild(build, 'scout', 1, 'm')
  build = pickInBuild(build, 'scout', 2, 'r')
  build = pickInBuild(build, 'scout', 3, 'b')
  assert.equal(build.scout, 'mrb')
  assert.equal(buildMajor(build, 'scout', 3), majorPair('scout', 3)[1])
  assert.equal(pickInBuild(build, 'scout', 3, 'a').scout, 'mra', 'swap a Major in its fork')
  assert.equal(pickInBuild(build, 'scout', 2, 'r').scout, 'm', 'undo drops the rows above')
  assert.equal(pickInBuild(build, 'scout', 3, 'l'), build, 'a Major row takes a or b only')
  const full = normalizeBuild({ warfighter: 'mlammbmrb', scout: 'mlammbmrb', survivalist: 'mlb' })
  assert.equal(full.warfighter.length, TREE_CAP)
  assert.equal(buildSpent(full), TRAIT_POINTS, '18 points at most')
  assert.equal(full.survivalist, '')
  assert.ok(!canPick(full, 'survivalist', 1))
  assert.deepEqual(normalizeBuild({ scout: 'mlammbmrbmm' }).scout, 'mlammbmrb', '9 per tree')
  assert.deepEqual(readBuild('not json'), emptyBuild())
  assert.deepEqual(buildFromQuery(buildToQuery(full)), full)
})

test('trait concepts are drafts with a score for every criterion', () => {
  for (const concept of [...traitConcepts]) {
    assert.ok(dmzLabPages.some(page => page.path === concept.path), concept.path)
    assert.ok(concept.pros.length >= 2 && concept.cons.length >= 2, concept.id)
    assert.match(fs.readFileSync(new URL(`../app/pages${concept.path}.vue`, import.meta.url), 'utf8'), new RegExp(`<DmzTraitsLabBanner concept="${concept.id}" />`))
  }
  assert.ok(dmzLabPages.some(page => page.path === '/dmz/lab/traits'))
  for (const id of [...traitConcepts.map(concept => concept.id), traitMix.id]) {
    for (const criterion of traitCriteria) assert.ok([1, 2, 3].includes(traitScores[id][criterion.id]), `${id}: ${criterion.id}`)
  }
})
