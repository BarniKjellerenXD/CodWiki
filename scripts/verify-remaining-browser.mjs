// Usage: node scripts/verify-remaining-browser.mjs [Node package root] [base URL] [Chrome binary]
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import catalogue from '../app/data/catalogue.json' with { type: 'json' }
const require = createRequire(path.resolve(process.argv[2] || '.', '__browser_runtime__.cjs'))
const { chromium } = require('playwright')
const base = process.argv[3] || 'http://127.0.0.1:3100'
const output = path.resolve('.impeccable/review/remaining')
fs.mkdirSync(output, { recursive: true })
const maps = catalogue.maps.filter(map => ['iw', 'ww2', 'aw', 'vanguard', 'mw3'].includes(map.gameId))
const tools = catalogue.tools.filter(tool => maps.some(map => map.id === tool.map))
const routes = [...maps, ...tools]
const routeResults = []
let next = 0
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < routes.length) {
    const route = routes[next++]
    const response = await fetch(base + route.route)
    const html = await response.text()
    assert.equal(response.status, 200, route.route)
    assert.ok(html.includes(route.route.startsWith('/tools') ? 'remaining-tool' : 'guide-page'), route.route)
    routeResults.push({ route: route.route, status: response.status })
  }
}))
console.log(`SSR verified: ${maps.length} guides and ${tools.length} tools`)
const browser = await chromium.launch({ headless: true, ...(process.argv[4] ? { executablePath: process.argv[4] } : {}) })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const checks = [], screenshots = []
async function go(route, width = 1440) {
  await page.setViewportSize({ width, height: 1000 })
  await page.goto(base + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(250)
  assert.equal(await page.locator('.remaining-tool, .guide-page').count() > 0, true, route)
}
async function capture(name) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true, animations: 'disabled' })
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }))
  assert.ok(widths.document <= widths.viewport + 1, `${name}: horizontal overflow ${JSON.stringify(widths)}`)
  screenshots.push(path.join(output, name + '.png'))
}
try {
  await go('/tools/mw3-rune-portals')
  await page.getByLabel('Lookup method', { exact: true }).selectOption('Destination')
  await page.getByLabel('Exit destination', { exact: true }).selectOption('m2112')
  await page.locator('.record-result.ready').waitFor()
  assert.match(await page.locator('.record-result').innerText(), /I6/)
  assert.equal(await page.locator('.guide-illustrations img').count(), 2)
  await capture('desktop-portal')
  await page.getByLabel('Lookup method', { exact: true }).selectOption('Read code')
  for (let i = 1; i <= 3; i++) await page.getByLabel(`Shot ${i}`, { exact: true }).selectOption('mwz-glyph-01')
  await page.locator('.record-result.invalid').waitFor()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  assert.equal(await page.getByLabel('Shot 3', { exact: true }).inputValue(), '')
  checks.push('Photographed portal lookup, unknown/invalid triplet and undo')

  await go('/tools/iw-shaolin-morse', 360)
  await page.getByLabel('Three Morse digits', { exact: true }).fill('----- .---- ..---')
  await page.locator('.record-result.ready').waitFor()
  assert.match(await page.locator('.record-result').innerText(), /012/)
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.getByLabel('Three Morse digits', { exact: true }).inputValue(), '----- .---- ..---')
  await capture('mobile-morse')
  await go('/guides/iw-shaolin-shuffle#details-phone', 360)
  const inline = page.locator('.guide-article .inline-puzzle').filter({ hasText: 'Nightmare Summer phone Morse' })
  await inline.locator('summary').click()
  assert.equal(await inline.getByLabel('Three Morse digits', { exact: true }).inputValue(), '----- .---- ..---')
  checks.push('Morse leading zero, reload persistence and shared inline/full-page state')

  await go('/tools/ww2-shadowed-radio', 768)
  await page.getByLabel('Pinned region', { exact: true }).selectOption('Ober-Havel')
  await page.getByLabel('Radio letters', { exact: true }).selectOption('RS')
  await page.getByLabel('Radio number', { exact: true }).selectOption('0')
  await page.locator('.record-result.ready').waitFor()
  await capture('tablet-radio')
  checks.push('WWII radio inputs and decimal-preserving result')

  await go('/tools/vanguard-archon-runes', 360)
  await page.getByLabel('Preparation sequence length', { exact: true }).selectOption('3')
  for (let i = 1; i <= 3; i++) {
    await page.getByLabel(`3-symbol round: symbol ${i}`, { exact: true }).fill(`shape ${i}`)
    await page.getByLabel(`3-symbol round: ground landmark ${i}`, { exact: true }).fill(`gate ${i}`)
  }
  const lockInput = page.getByLabel('3-symbol observation locked', { exact: true })
  assert.ok(await lockInput.evaluate(input => input.labels[0].getBoundingClientRect().height) >= 44, 'Checkbox label touch target')
  await page.getByText('3-symbol observation locked', { exact: true }).click()
  assert.equal(await lockInput.isChecked(), true, 'Associated label toggles the native checkbox')
  assert.equal(await page.getByLabel('3-symbol round: symbol 1 · locked', { exact: true }).isDisabled(), true)
  await page.getByRole('button', { name: '3-symbol new attempt: archive locked record, keep landmarks', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm clear', exact: true }).click()
  assert.equal(await page.getByLabel('3-symbol previous attempt: symbol 1 · locked', { exact: true }).inputValue(), 'shape 1')
  assert.equal(await page.getByLabel('3-symbol round: symbol 1', { exact: true }).inputValue(), '')
  assert.equal(await page.getByLabel('3-symbol round: ground landmark 1', { exact: true }).inputValue(), 'gate 1')
  await capture('mobile-archon')
  checks.push('Locked observations, archived attempt and retained landmarks')

  await go('/tools/aw-descent-simon', 360)
  for (const [i, colour] of ['Blue', 'Red', 'Yellow', 'Green'].entries()) await page.getByLabel(`Monitor ${i + 1} from the left`, { exact: true }).selectOption(colour)
  await page.getByRole('button', { name: 'Blue', exact: true }).click()
  await page.getByRole('button', { name: 'Blue', exact: true }).click()
  await page.getByRole('button', { name: 'Green', exact: true }).click()
  await page.locator('.record-result.ready').waitFor()
  await page.getByText('Edit flash observations', { exact: true }).click()
  await page.getByLabel('Flash 2', { exact: true }).selectOption('')
  await page.locator('.record-result.invalid').waitFor()
  assert.match(await page.locator('.recorded-sequence').innerText(), /3 · Green/)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.getByText('Edit flash observations', { exact: true }).click()
  await capture('mobile-simon')
  await page.getByRole('button', { name: 'Clear flashes', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm clear', exact: true }).click()
  assert.equal(await page.getByLabel('Monitor 1 from the left', { exact: true }).inputValue(), 'Blue')
  assert.equal(await page.getByLabel('Flash 1', { exact: true }).inputValue(), '')
  checks.push('Repeated Simon flashes and reset preserving physical monitor layout')

  await go('/guides/mw3-dark-aether-season-5?branch=ordinary#details-infinite-cosmos')
  assert.equal(await page.getByLabel('Quest route', { exact: true }).inputValue(), 'elder')
  assert.ok(page.url().includes('#details-infinite-cosmos'))
  assert.equal(await page.locator('[data-guide-branches="elder"]').isVisible(), true)
  await page.getByRole('button', { name: 'Quick Parts', exact: true }).click()
  await page.locator('.mwz-milestones summary').click()
  await page.getByLabel('Personal repeatable portal unlocked', { exact: true }).first().check()
  await page.getByRole('button', { name: 'Start new run', exact: true }).first().click()
  await page.locator('.companion-confirm').getByRole('button', { name: 'Start new run', exact: true }).click()
  assert.equal(await page.getByLabel('Personal repeatable portal unlocked', { exact: true }).first().isChecked(), true)
  await page.locator('.mwz-milestones summary').click()
  await capture('desktop-season5')
  await page.getByLabel('Quest route', { exact: true }).selectOption('ordinary')
  assert.equal(await page.locator('#quick-infinite-cosmos').count(), 0)
  await page.getByLabel('Quest route', { exact: true }).selectOption('elder')
  assert.equal(await page.locator('#quick-infinite-cosmos').count(), 1)
  await go('/guides/mw3-dark-aether-season-1', 360)
  await page.locator('.mwz-milestones summary').click()
  assert.equal(await page.getByLabel('Personal repeatable portal unlocked', { exact: true }).first().isChecked(), true)
  await page.locator('.mwz-milestones summary').click()
  await capture('mobile-season1')
  checks.push('Branch deep-link recovery, Elder-only route filtering and permanent milestones across new runs/maps')
  assert.deepEqual(errors, [], 'Browser runtime exceptions')
  fs.writeFileSync(path.join(output, 'flow-report.json'), JSON.stringify({ base, routeResults, checks, screenshots, runtimeErrors: errors }, null, 2) + '\n')
  console.log(JSON.stringify({ routes: routeResults.length, checks, screenshots: screenshots.length, runtimeErrors: errors }, null, 2))
} finally { await browser.close() }
