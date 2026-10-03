import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { plannedMaps } from '../shared/planned-maps.mjs'
import { games } from '../shared/games.mjs'
import { searchCatalogue } from '../app/utils/companion.mjs'
const require = createRequire(import.meta.url)
const nav = require('../desktop-app/renderer/nav.js')
const { groupNavigation, filterNavigation, navigationForRoute, resolveNavigationGame } = require('../desktop-app/renderer/navigation.js')
const { mergeOrder, mergeShortcuts } = require('../desktop-app/runtime.js')
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const catalogue = read('shared/catalogue.json')
const search = read('app/data/searchIndex.json')
const quests = read('app/data/quickQuests.json')
const groups = groupNavigation(nav)

test('all major additional Zombies maps and modes have honest, generated entry routes', () => {
  assert.deepEqual(Object.fromEntries(['iw','ww2','aw','vanguard','mw3'].map(id => [id, plannedMaps.filter(map => map.gameId === id).length])), { iw:5, ww2:11, aw:4, vanguard:4, mw3:6 })
  assert.equal(new Set(catalogue.maps.map(map => map.id)).size, catalogue.maps.length)
  assert.equal(new Set(catalogue.maps.map(map => map.route)).size, catalogue.maps.length)
  assert.deepEqual(catalogue, read('app/data/catalogue.json'))
  assert.deepEqual(nav.games.map(game => game.id), games.map(game => game.id))
  for (const map of plannedMaps) {
    assert.ok(games.some(game => game.id === map.gameId), map.id)
    assert.equal(map.status, 'planned')
    assert.equal(map.interactiveMap, false)
    assert.equal(quests[map.id], undefined)
    assert.ok(!catalogue.tools.some(tool => tool.map === map.id))
    assert.match(fs.readFileSync(`app/pages${map.route}.vue`, 'utf8'), /<Content/)
    assert.match(fs.readFileSync(`app/components/guide/${map.id}.vue`, 'utf8'), /<MapEntry/)
    assert.equal(search.find(entry => entry.id === map.id)?.kind, 'Map entry')
    assert.equal(nav.find(entry => entry.id === map.id)?.status, 'planned')
    assert.equal(nav.find(entry => entry.id === map.id)?.accel, null)
  }
})

test('the website and desktop both find edition names, aliases and accented maps', () => {
  for (const [query, id] of [
    ['iw spaceland', 'iw-zombies-in-spaceland'], ['ww2 groesten', 'ww2-groesten-haus'],
    ['WWII Gröesten', 'ww2-groesten-haus'], ['exo outbreak', 'aw-outbreak'],
    ['vg shi no numa', 'vanguard-shi-no-numa'], ['mwz urzikstan', 'mw3-urzikstan'],
    ['modern warfare 3 countermeasures', 'mw3-dark-aether-season-2'],
    ['mwiii union', 'mw3-dark-aether-season-3'], ['tortured path storm', 'ww2-into-the-storm'],
  ]) {
    assert.ok(searchCatalogue(search, query).some(item => item.id === id), query)
    assert.ok(filterNavigation(groups, 'bo7', query).some(group => group.id === id), query)
  }
  assert.deepEqual(filterNavigation(groups, 'bo7', 'not-a-real-map-987'), [])
  assert.deepEqual(filterNavigation(groups, 'waw', '').map(group => group.game), ['waw','waw','waw','waw'])
  assert.equal(filterNavigation(groups, 'aw', '   ').length, 4)
  assert.ok(filterNavigation(groups, 'bo7', 'outbreak').some(group => group.game === 'cw'))
  assert.ok(filterNavigation(groups, 'bo7', 'outbreak').some(group => group.game === 'aw'))
})

test('direct routes, hashes and legacy URLs reveal the correct game without prefix collisions', () => {
  assert.equal(resolveNavigationGame(nav, 'bo7', '/guides/waw-der-riese#power'), 'waw')
  assert.equal(resolveNavigationGame(nav, 'bo7', '/tools/bo3-origins-ice.html'), 'bo3')
  assert.equal(resolveNavigationGame(nav, 'mw3', '/'), 'mw3')
  assert.equal(resolveNavigationGame(nav, 'removed-game', '/'), 'bo7')
  assert.equal(navigationForRoute(nav, '/guides/mw3-urzikstan/').id, 'mw3-urzikstan')
  assert.equal(navigationForRoute(nav, '/guides/bo1-moon-missing'), null)
  assert.equal(navigationForRoute(nav, 'http://['), null)
})

test('game order grows from the catalogue while saved tool order and shortcuts survive', () => {
  const old = nav.filter(item => !['iw','ww2','aw','vanguard','mw3'].includes(item.game))
  const savedOrder = old.map(item => item.id).reverse()
  const upgraded = groupNavigation(nav, mergeOrder(savedOrder, nav))
  assert.deepEqual([...new Set(upgraded.map(group => group.game))], games.map(game => game.id))
  assert.ok(upgraded.every(group => group.items[0].kind === 'guide'))
  const defaults = Object.fromEntries(nav.map(item => ['nav:' + item.id, item.accel]))
  const saved = { 'nav:ashes-of-the-damned': 'Ctrl+Alt+7', 'nav:astra-malorum': null }
  const shortcuts = mergeShortcuts(defaults, saved)
  assert.equal(shortcuts['nav:ashes-of-the-damned'], 'Ctrl+Alt+7')
  assert.equal(shortcuts['nav:astra-malorum'], null)
  assert.equal(shortcuts['nav:iw-zombies-in-spaceland'], null)
  const customized = groups.map(group => ({ ...group, items: group.items.filter(item => item.id !== 'ashes-serum').map(item => ({ ...item, label: item.id === 'ashes-rocket-codes' ? 'My rockets' : item.label })) }))
  assert.ok(!filterNavigation(customized, 'bo7', 'serum').some(group => group.items.some(item => item.id === 'ashes-serum')))
  const synthetic = [{ game:'iw', gameName:'Infinite Warfare', name:'Spaceland', keywords:'', items:[{label:'My custom shortcut', url:'/guides/iw-zombies-in-spaceland'}] }]
  assert.equal(filterNavigation(synthetic, 'bo7', 'custom shortcut').length, 1)
})
