import test from 'node:test'
import assert from 'node:assert/strict'
import { dmzWeapons, weaponClasses, weaponWays, siteTierLists, siteConsensus, redditMeta, REDDIT_META } from '../shared/dmz-weapons.mjs'
import { dmzStations } from '../shared/dmz.mjs'
import { intelSources } from '../shared/dmz-intel.mjs'
import { guideSources } from '../shared/dmz-guide-sources.mjs'

const sources = { ...intelSources, ...guideSources }
const ids = new Set(dmzWeapons.map(weapon => weapon.id))

test('the 33 launch weapons each have a class and real sources', () => {
  assert.equal(dmzWeapons.length, 33)
  assert.equal(ids.size, 33)
  for (const weapon of dmzWeapons) {
    assert.ok(weaponClasses.includes(weapon.class), weapon.id)
    for (const id of weapon.sources) assert.ok(sources[id], `${weapon.id}: ${id}`)
  }
  for (const way of weaponWays) assert.ok(way.sources.length && way.sources.every(id => sources[id]), way.name)
  const station = dmzStations.find(item => item.id === 'gunsmith')
  assert.match(station.facts.join(' '), new RegExp(`${dmzWeapons.length} launch weapons · ${siteTierLists.length} site tier lists`))
})

test('site tier lists only name launch weapons, once each', () => {
  for (const list of siteTierLists) {
    assert.ok(sources[list.source], list.site)
    const named = list.tiers.flatMap(tier => tier.weapons)
    assert.equal(new Set(named).size, named.length, list.site)
    for (const id of named) assert.ok(ids.has(id), `${list.site}: ${id}`)
  }
  assert.ok(siteConsensus().length > 20)
  assert.ok(!siteTierLists.some(list => /skycoach|playerauctions/i.test(sources[list.source].url)))
})

test('Reddit picks are counted from real threads and paraphrased', () => {
  assert.ok(REDDIT_META.from >= '2026-10-20')
  for (const row of redditMeta) {
    assert.ok(ids.has(row.weapon), row.weapon)
    assert.ok(row.players >= 1 && row.threads.length, row.weapon)
    for (const id of row.threads) assert.equal(sources[id]?.type, 'reddit', `${row.weapon}: ${id}`)
    for (const why of row.why) assert.ok(!/["“”]/.test(why) && !/\bu\//.test(why), `${row.weapon}: ${why}`)
  }
  const counts = redditMeta.map(row => row.players)
  assert.deepEqual(counts, [...counts].sort((a, b) => b - a), 'most recommended first')
})
