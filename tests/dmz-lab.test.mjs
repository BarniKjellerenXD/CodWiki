import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dmzPages, dmzLabPages, dmzStations } from '../shared/dmz.mjs'
import { dmzIntel, intelCategories } from '../shared/dmz-intel.mjs'
import { resolvePageSeo, sitemapUrls, DEFAULT_SITE_URL } from '../shared/seo.mjs'
import { labConcepts, labMix, labCriteria, labScores, labDesks, labHandoffs, labRecipes, recipeMaterials, sumMaterials, labNeeds, mixNeedTargets, rankIntel, mentionsIn, relatedIntel, placesInSquare } from '../shared/dmz-lab.mjs'

const catalogue = JSON.parse(fs.readFileSync(new URL('../shared/catalogue.json', import.meta.url)))
const search = JSON.parse(fs.readFileSync(new URL('../app/data/searchIndex.json', import.meta.url)))
const ids = new Set(dmzIntel.map(entry => entry.id))
const pageFile = path => new URL(`../app/pages${path}${path === '/dmz/lab' ? '/index' : ''}.vue`, import.meta.url)

test('concept pages exist, are noindex and stay out of the sitemap, search and stations', () => {
  const sitemap = sitemapUrls(catalogue)
  const live = new Set(dmzPages.map(page => page.path))
  const routes = new Set(dmzStations.map(station => station.route?.split('#')[0]).filter(Boolean))
  for (const page of dmzLabPages) {
    assert.ok(fs.existsSync(pageFile(page.path)), page.path)
    const meta = resolvePageSeo(catalogue, page.path)
    assert.equal(meta.indexable, false, page.path)
    assert.equal(meta.robots, 'noindex, follow', page.path)
    assert.equal(meta.canonical, null, page.path)
    assert.equal(meta.title, page.title)
    assert.match(page.title, /Lab — CodWiki$/)
    assert.ok(!sitemap.includes(DEFAULT_SITE_URL + page.path), page.path)
    assert.ok(!live.has(page.path) && !routes.has(page.path), page.path)
    assert.ok(!search.some(item => item.route?.startsWith(page.path)), page.path)
  }
  assert.equal(new Set(dmzLabPages.map(page => page.title)).size, dmzLabPages.length)
})

test('every concept page says it is a concept', () => {
  for (const concept of [...labConcepts, labMix]) {
    assert.ok(dmzLabPages.some(page => page.path === concept.path), concept.path)
    assert.match(fs.readFileSync(pageFile(concept.path), 'utf8'), new RegExp(`<DmzLabBanner concept="${concept.id}" />`), concept.path)
  }
  assert.match(fs.readFileSync(pageFile('/dmz/lab'), 'utf8'), /drafts only/)
})

test('concepts carry pros, cons, a cost and a score for every criterion', () => {
  for (const concept of labConcepts) {
    assert.ok(concept.pitch && concept.bestFor && concept.cost && concept.costNote, concept.id)
    assert.ok(concept.pros.length >= 2 && concept.cons.length >= 2, concept.id)
  }
  assert.ok(labMix.parts.every(id => labConcepts.some(concept => concept.id === id)))
  for (const id of [...labConcepts.map(concept => concept.id), labMix.id]) {
    for (const criterion of labCriteria) assert.ok([1, 2, 3].includes(labScores[id][criterion.id]), `${id}: ${criterion.id}`)
  }
})

test('stations and hand-offs give every Intel category exactly one home', () => {
  for (const category of intelCategories) {
    const homes = [...labDesks.filter(desk => desk.categories.includes(category.id)), ...labHandoffs.filter(item => item.category === category.id)]
    assert.equal(homes.length, 1, category.id)
  }
})

test('every printer recipe has materials that parse and add up', () => {
  assert.ok(labRecipes.length > 10)
  for (const recipe of labRecipes) {
    const items = recipeMaterials(recipe)
    assert.ok(items.length, recipe.id)
    // Some named parts have no rarity in the data yet; the planner shows those plain.
    assert.ok(items.every(item => item.amount > 0 && item.name), recipe.id)
  }
  const [first] = labRecipes
  const once = sumMaterials({ [first.id]: 1 })
  const twice = sumMaterials({ [first.id]: 2 })
  assert.deepEqual(twice.map(item => item.amount), once.map(item => item.amount * 2))
  assert.deepEqual(sumMaterials({ [first.id]: 0, missing: 3 }), [])
})

test('ask-first questions point at real entries and the mix routes each one somewhere', () => {
  for (const need of labNeeds) {
    for (const id of [...(need.steps || []).flatMap(step => step.ids), ...(need.ids || []), ...(need.lead || [])]) assert.ok(ids.has(id), `${need.id}: ${id}`)
    const target = mixNeedTargets[need.id]
    assert.ok(target && (target.desk ? labDesks.some(desk => desk.id === target.desk) : target.to?.startsWith('/dmz/')), need.id)
  }
})

test('quick find ranks names first and needs every word', () => {
  assert.equal(rankIntel('bale').results[0]?.id, 'bale')
  assert.deepEqual(rankIntel('  '), { results: [], total: 0 })
  assert.equal(rankIntel('bale zzzz').total, 0)
  const { results, total } = rankIntel('medkit', { limit: 3 })
  assert.ok(results.length <= 3 && total >= results.length)
  assert.ok(results[0].name.toLowerCase().includes('medkit'))
  assert.ok(placesInSquare('h6').length)
  assert.deepEqual(placesInSquare('Bale'), [])
})

test('related entries never point back at the entry itself', () => {
  for (const entry of dmzIntel) {
    const related = relatedIntel(entry)
    for (const list of [related.named, related.namedBy, related.samePlace, related.siblings]) assert.ok(!list.some(other => other.id === entry.id), entry.id)
  }
  assert.ok(mentionsIn('Print a Medium Backpack').some(entry => /medium backpack/i.test(entry.name)))
})
