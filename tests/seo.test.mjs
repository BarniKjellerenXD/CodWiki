import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { DEFAULT_SITE_URL, SUPER_EASTER_EGG_PATH, createSeoPages, resolvePageSeo, sitemapUrls, renderSitemap, renderRobots, websiteSchema, siteOrigin, seoPath } from '../shared/seo.mjs'
import { seoOverrides } from '../shared/seo-overrides.mjs'
import { retiredTools } from '../shared/retired-tools.mjs'

const catalogue = JSON.parse(fs.readFileSync(new URL('../shared/catalogue.json', import.meta.url)))

test('sitemap covers actual authored routes, child quests and tools, without placeholders or duplicates', () => {
  const expected = ['/', SUPER_EASTER_EGG_PATH,
    ...catalogue.maps.filter(map => map.status !== 'planned').map(map => map.route),
    ...catalogue.guides.map(guide => guide.route), ...catalogue.tools.map(tool => tool.route)]
  assert.deepEqual(sitemapUrls(catalogue), expected.map(path => DEFAULT_SITE_URL + path).sort())
  assert.equal(new Set(expected).size, expected.length)
  for (const path of expected) {
    assert.ok(fs.existsSync(new URL(`../app/pages${path === '/' ? '/index' : path}.vue`, import.meta.url)), path)
    const meta = resolvePageSeo(catalogue, path)
    assert.equal(meta.indexable, true, path)
    assert.equal(meta.canonical, DEFAULT_SITE_URL + path)
    assert.equal(meta.robots, 'index, follow')
  }
})

test('every eligible page has a distinct factual title and description, and overrides name real routes', () => {
  const pages = [...createSeoPages(catalogue).values()].filter(page => page.indexable)
  assert.equal(new Set(pages.map(page => page.title)).size, pages.length)
  assert.equal(new Set(pages.map(page => page.description)).size, pages.length)
  for (const page of pages) {
    assert.ok(page.title.endsWith('CodWiki'), page.path)
    assert.ok(page.description.length > 30, page.path)
    assert.doesNotMatch(page.title + page.description, /\b(complete|official|verified|best)\b/i, page.path)
  }
  for (const route of Object.keys(seoOverrides)) assert.ok(createSeoPages(catalogue).has(route), route)
})

test('metadata distinguishes map editions and does not invent main quests', () => {
  const bo2 = resolvePageSeo(catalogue, '/guides/bo2-origins')
  const bo3 = resolvePageSeo(catalogue, '/guides/bo3-origins')
  assert.match(bo2.title, /Black Ops 2/)
  assert.match(bo3.title, /Black Ops 3/)
  assert.match(bo3.description, /Chronicles/)
  assert.doesNotMatch(resolvePageSeo(catalogue, '/guides/bo1-kino-der-toten').title, /Easter Egg|main quest/i)
  assert.notEqual(resolvePageSeo(catalogue, '/guides/cw-outbreak-ravenov').title, resolvePageSeo(catalogue, '/guides/cw-outbreak-excision').title)
})

test('planned entries, proxies, redirects and unknown paths never inherit guide indexing metadata', () => {
  const excluded = [...catalogue.maps.filter(map => map.status === 'planned').map(map => map.route),
    '/wiki/terminus', '/checklist', '/guides/ashes-of-the-damned.html', '/unknown',
    ...Object.keys(retiredTools).flatMap(id => [`/tools/${id}`, `/tools/${id}.html`])]
  for (const route of excluded) {
    const meta = resolvePageSeo(catalogue, route)
    assert.equal(meta.robots, 'noindex, follow', route)
    assert.equal(meta.canonical, null, route)
    assert.ok(!sitemapUrls(catalogue).includes(DEFAULT_SITE_URL + route), route)
  }
  // Even an accidental re-addition of a retired tool cannot publish its redirect.
  const stale = structuredClone(catalogue)
  stale.tools.push({ id: 'bo6-liberty-vault', route: '/tools/bo6-liberty-vault', map: 'bo6-liberty-falls', name: 'Vault' })
  assert.deepEqual(sitemapUrls(stale), sitemapUrls(catalogue))
})

test('publishing a planned guide updates head eligibility and sitemap together', () => {
  const updated = structuredClone(catalogue)
  const map = updated.maps.find(map => map.status === 'planned')
  assert.equal(resolvePageSeo(updated, map.route).indexable, false)
  delete map.status
  assert.equal(resolvePageSeo(updated, map.route).indexable, true)
  assert.ok(sitemapUrls(updated).includes(DEFAULT_SITE_URL + map.route))
})

test('canonical metadata strips reader fragments and tracking queries without changing tool identity', () => {
  const path = '/guides/bo6-terminus'
  for (const variant of [path, path + '/', path + '/?utm_source=test#details-setup', path + '#quick-setup']) {
    assert.equal(resolvePageSeo(catalogue, variant).canonical, DEFAULT_SITE_URL + path)
  }
  assert.equal(resolvePageSeo(catalogue, '/tools/bo6-terminus-lab').canonical, DEFAULT_SITE_URL + '/tools/bo6-terminus-lab')
  assert.equal(seoPath('//outside.example/path'), null)
  assert.equal(seoPath('https://outside.example/path'), null)
})

test('robots, sitemap, head and site schema use the same configured origin', () => {
  const configured = 'https://example.test/'
  assert.equal(siteOrigin(configured), 'https://example.test')
  assert.equal(resolvePageSeo(catalogue, '/', configured).canonical, configured)
  assert.ok(sitemapUrls(catalogue, configured).every(url => url.startsWith(configured)))
  assert.equal(renderRobots(configured), 'User-agent: *\nDisallow:\n\nSitemap: https://example.test/sitemap.xml\n')
  assert.deepEqual(websiteSchema(configured), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'CodWiki', url: configured })
  for (const invalid of ['ftp://example.test', 'https://example.test/path', 'https://user:password@example.test', 'https://example.test/?q=x', 'https://example.test/#map']) {
    assert.throws(() => siteOrigin(invalid), /Site URL/)
  }
})

test('sitemap escapes XML and omits invented modification dates and ranking hints', () => {
  const custom = structuredClone(catalogue)
  custom.maps.push({ id: 'xml', gameId: 'bo7', name: 'XML', route: '/guides/a&b' })
  const xml = renderSitemap(custom)
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/)
  assert.match(xml, /<loc>https:\/\/codzmwiki\.com\/guides\/a&amp;b<\/loc>/)
  assert.equal((xml.match(/<loc>/g) || []).length, sitemapUrls(custom).length)
  assert.doesNotMatch(xml, /lastmod|priority|changefreq|<loc>[^<]*[#?]/)
})
