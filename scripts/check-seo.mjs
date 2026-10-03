// Read-only checks against a running build or the deployed site.
// Usage: node scripts/check-seo.mjs http://127.0.0.1:3210 [canonical-origin]
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { DEFAULT_SITE_URL, createSeoPages, resolvePageSeo, renderRobots, renderSitemap, siteOrigin, websiteSchema } from '../shared/seo.mjs'

if (!process.argv[2]) throw new Error('Supply the running site origin, for example http://127.0.0.1:3210')
const base = siteOrigin(process.argv[2])
const canonicalOrigin = siteOrigin(process.argv[3] || DEFAULT_SITE_URL)
const catalogue = JSON.parse(fs.readFileSync(new URL('../shared/catalogue.json', import.meta.url)))
const pages = [...createSeoPages(catalogue).values()]
const decode = text => text.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'" })[entity])
const attributes = tag => Object.fromEntries([...tag.matchAll(/\s([\w:-]+)="([^"]*)"/g)].map(match => [match[1], decode(match[2])]))
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(match => attributes(match[0]))
const observedLinks = new Set()
const load = async path => {
  const response = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(20000) })
  return { response, html: await response.text() }
}

async function checkPage(path) {
  const expected = resolvePageSeo(catalogue, path, canonicalOrigin)
  const { response, html } = await load(path)
  assert.equal(response.status, 200, `${path}: status`)
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)?.[1]
  assert.ok(head, `${path}: HTML head`)
  const titles = [...head.matchAll(/<title>([^<]*)<\/title>/g)]
  assert.equal(titles.length, 1, `${path}: one title`)
  assert.equal(decode(titles[0][1]), expected.title, `${path}: title`)
  const meta = tags(head, 'meta')
  const descriptions = meta.filter(tag => tag.name === 'description')
  assert.equal(descriptions.length, 1, `${path}: one description`)
  assert.equal(descriptions[0].content, expected.description, `${path}: description`)
  const robots = meta.filter(tag => tag.name === 'robots')
  assert.equal(robots.length, 1, `${path}: one robots rule`)
  assert.equal(robots[0].content, expected.robots, `${path}: robots`)
  const canonicals = tags(head, 'link').filter(tag => tag.rel === 'canonical')
  assert.deepEqual(canonicals.map(tag => tag.href), expected.canonical ? [expected.canonical] : [], `${path}: canonical`)
  assert.equal(meta.find(tag => tag.property === 'og:title')?.content, expected.title, `${path}: sharing title`)
  assert.equal(meta.find(tag => tag.property === 'og:url')?.content || null, expected.canonical, `${path}: sharing URL`)
  if (expected.type === 'guide' && expected.path !== '/guides/bo7-super-easter-egg') {
    assert.match(html, /<article[^>]*class="[^"]*guide-article/, `${path}: full article in initial HTML`)
  }
  if (expected.type === 'home') {
    assert.match(html, /Ready for your next run\?/, 'homepage heading preserved')
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
      .filter(match => attributes('<script ' + match[1] + '>').type === 'application/ld+json')
    assert.equal(scripts.length, 1, 'one homepage WebSite object')
    assert.deepEqual(JSON.parse(scripts[0][2]), websiteSchema(canonicalOrigin))
  }
  for (const link of tags(html, 'a')) {
    if (link.href?.startsWith('/') && !link.href.startsWith('//')) observedLinks.add(link.href.split(/[?#]/)[0])
  }
}

const robots = await load('/robots.txt')
assert.equal(robots.response.status, 200)
assert.match(robots.response.headers.get('content-type'), /text\/plain/)
assert.equal(robots.html, renderRobots(canonicalOrigin))
const sitemap = await load('/sitemap.xml')
assert.equal(sitemap.response.status, 200)
assert.match(sitemap.response.headers.get('content-type'), /application\/xml/)
assert.equal(sitemap.html, renderSitemap(catalogue, canonicalOrigin))

// Bound concurrency to avoid flooding a small production server.
for (let offset = 0; offset < pages.length; offset += 3) {
  await Promise.all(pages.slice(offset, offset + 3).map(page => checkPage(page.path)))
}
for (const page of pages.filter(page => page.indexable && page.path !== '/')) {
  assert.ok(observedLinks.has(page.path), `${page.path}: discoverable through existing links`)
}
await checkPage('/guides/bo6-terminus/?utm_source=seo-check')

for (const [path, destination] of [
  ['/guides/ashes-of-the-damned.html', '/guides/ashes-of-the-damned'],
  ['/tools/bo6-liberty-vault', '/guides/bo6-liberty-falls#details-vault'],
  ['/checklist', '/']
]) {
  const { response } = await load(path)
  assert.equal(response.status, 301, `${path}: permanent redirect`)
  assert.equal(new URL(response.headers.get('location'), base).href, base + destination, `${path}: destination`)
}
assert.equal((await load('/codwiki-seo-nonexistent-page')).response.status, 404, 'missing route returns 404')

const wiki = await load('/wiki/terminus')
assert.ok([200, 404, 502, 503].includes(wiki.response.status), `wiki: unexpected status ${wiki.response.status}`)
assert.ok(tags(wiki.html, 'meta').some(tag => tag.name === 'robots' && tag.content.includes('noindex')), 'wiki is excluded from indexing even if Reddit is unavailable')
assert.equal(tags(wiki.html, 'link').filter(tag => tag.rel === 'canonical').length, 0, 'wiki does not claim a canonical guide URL')

console.log(JSON.stringify({
  origin: base,
  canonicalOrigin,
  indexablePages: pages.filter(page => page.indexable).length,
  plannedPages: pages.filter(page => !page.indexable).length,
  passed: ['page metadata', 'sitemap', 'robots', 'server-rendered articles', 'internal discovery', 'query canonical', 'legacy redirects', '404', 'wiki noindex'],
  wikiStatus: wiki.response.status
}, null, 2))
