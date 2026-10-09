// Usage: node scripts/verify-mw3-guides.mjs [base URL] [Chrome binary]
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mw3Guides } from '../shared/mw3-guides.mjs'
import { retiredTools } from '../shared/retired-tools.mjs'
const require = createRequire(path.resolve('desktop-app/package.json'))
const { chromium, _electron } = require('playwright')
const base = process.argv[2] || 'http://127.0.0.1:3130'
const output = path.resolve('.impeccable/review/mw3-guides')
fs.mkdirSync(output, { recursive: true }); fs.mkdirSync('.cache', { recursive: true })
const checks = [], screenshots = [], errors = []
for (const guide of mw3Guides) {
  const response = await fetch(base + '/guides/' + guide.id)
  assert.equal(response.status, 200)
  const html = await response.text()
  assert.ok(html.includes('guide-page'))
  assert.doesNotMatch(html, /<(?:div|details)[^>]+class="[^"]*(?:mwz-milestones|guide-branch)/)
}
for (const [id, target] of Object.entries(retiredTools).filter(([id]) => id.startsWith('mw3-'))) {
  for (const suffix of ['', '.html']) {
    const response = await fetch(base + '/tools/' + id + suffix, { redirect: 'manual' })
    assert.equal(response.status, 301)
    assert.equal(response.headers.get('location'), target)
  }
}
checks.push('Six production guide routes and eight legacy tool redirects verified')
const browser = await chromium.launch({ headless: true, executablePath: process.argv[3] || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
page.on('pageerror', error => errors.push(error.message))
async function go(route) {
  await page.goto(base + route, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.getElementById('__nuxt')?.__vue_app__)
}
async function capture(name) {
  await page.evaluate(async () => {
    const images = Array.from(document.images).filter(image => { const rect = image.getBoundingClientRect(); return rect.bottom > 0 && rect.top < innerHeight })
    await Promise.all(images.map(image => image.decode().catch(() => {})))
  })
  const filename = path.join(output, name + '.png')
  await page.screenshot({ path: filename, animations: 'disabled' }); screenshots.push(filename)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true, name)
}
let app
try {
  for (const guide of mw3Guides) {
    await go('/guides/' + guide.id)
    assert.equal(await page.getByRole('button', { name: 'Full Details', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.equal(await page.locator('.guide-surface select, .mwz-milestones, .map-tools, .guide-article .puzzle').count(), 0)
    for (const phase of guide.phases) assert.equal(await page.locator('#details-' + phase.id).isVisible(), true)
  }
  checks.push('All six guides start readable and expose every phase without a dropdown or tool')
  await go('/guides/mw3-urzikstan')
  await page.evaluate(() => window.scrollTo(0, 0))
  await capture('website-urzikstan-desktop')
  await page.getByRole('button', { name: 'Red Worm boss fight', exact: true }).click()
  await page.waitForFunction(() => location.hash === '#details-red-worm')
  await capture('website-red-worm-desktop')
  await page.setViewportSize({ width: 390, height: 844 })
  await go('/guides/mw3-dark-aether-season-5?branch=ordinary#details-portal')
  assert.equal(await page.locator('#details-infinite-cosmos').isVisible(), true)
  await capture('website-season5-mobile')
  await go('/guides/mw3-urzikstan#details-free-juggernog')
  await capture('website-free-perk-mobile')
  checks.push('Portal, Red Worm and free-perk instructions work at desktop and phone widths')

  const milestone = JSON.stringify({ version: 1, observations: { 'portal-1': true, 'schematic-1-0': true } })
  await page.evaluate(milestone => {
    localStorage.setItem('codwiki-mwz-milestones-v1', milestone)
    localStorage.setItem('guide-pins-mw3-urzikstan', JSON.stringify(['details-red-worm']))
    localStorage.setItem('codwiki-progress-v1', JSON.stringify({ version: 1, runs: { 'mw3-urzikstan': { done: ['mw3-vault-open'], view: 'quick', section: 'quick-vault', groups: [], collapsed: {} } }, toys: {}, last: null }))
  }, milestone)
  await go('/guides/mw3-urzikstan')
  assert.equal(await page.getByRole('button', { name: 'Quick Parts', exact: true }).getAttribute('aria-pressed'), 'true')
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('codwiki-progress-v1')).runs['mw3-urzikstan'].done.includes('mw3-vault-open')), true)
  assert.equal(await page.evaluate(() => localStorage.getItem('codwiki-mwz-milestones-v1')), milestone)
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('guide-pins-mw3-urzikstan'))), ['details-red-worm'])
  await go('/tools/mw3-red-worm-usbs.html')
  assert.ok(page.url().endsWith('/guides/mw3-urzikstan#details-red-worm'))
  assert.equal(await page.locator('#details-red-worm').isVisible(), true)
  checks.push('Saved Quick Parts preference, completion, pins and archived milestones survive; old tool links open the guide')

  const env = { ...process.env, CW_TEST: '1', CW_TEST_USER_DATA: fs.mkdtempSync(path.resolve('.cache/mw3-electron-profile-')), CW_SITE_URL: base }
  delete env.ELECTRON_RUN_AS_NODE
  app = await _electron.launch({ executablePath: require('electron'), args: [path.resolve('desktop-app')], env })
  const host = await app.firstWindow()
  host.on('pageerror', error => errors.push(error.message))
  await host.waitForFunction(() => window.CW_LIBRARY && window.CW_SETTINGS)
  const guest = expression => host.evaluate(expression => document.getElementById('webview').executeJavaScript(`(${expression})()`), expression.toString())
  async function waitGuest(expression) {
    const deadline = Date.now() + 30000
    while (Date.now() < deadline) {
      try { if (await guest(expression)) return } catch {}
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    throw new Error('Guest not ready: ' + expression.toString())
  }
  await waitGuest(() => !!document.getElementById('__nuxt')?.__vue_app__)
  await host.locator('#nav-game').selectOption('mw3')
  assert.equal(await host.locator('#nav .nav-item').count(), 6)
  assert.equal(await host.locator('#nav .nav-map').count(), 0)
  await host.locator('#nav-search').fill('Greylorm')
  await host.locator('[data-id="mw3-urzikstan"]').click()
  await waitGuest(() => !!document.querySelector('.guide-article') && !!document.getElementById('__nuxt')?.__vue_app__)
  await guest(() => { Array.from(document.querySelectorAll('.guide-shortcuts button')).find(button => button.textContent.includes('Red Worm')).click(); return true })
  await waitGuest(() => location.hash === '#details-red-worm' && document.getElementById('details-red-worm').getClientRects().length > 0)
  assert.equal(await guest(() => document.querySelectorAll('.guide-surface select, .mwz-milestones, .map-tools').length), 0)
  assert.equal(await host.locator('#nav-game').inputValue(), 'mw3')
  async function nativeCapture(name, width, height) {
    const buffer = await app.evaluate(async ({ BrowserWindow, webContents }, size) => {
      const window = BrowserWindow.getAllWindows()[0]
      window.setSize(size.width, size.height)
      const guest = webContents.getAllWebContents().find(contents => contents.getType() === 'webview')
      await guest.capturePage(); await window.webContents.capturePage()
      await new Promise(resolve => setTimeout(resolve, 250))
      await guest.capturePage()
      return (await window.webContents.capturePage()).toPNG().toString('base64')
    }, { width, height })
    const filename = path.join(output, name + '.png')
    fs.writeFileSync(filename, Buffer.from(buffer, 'base64')); screenshots.push(filename)
  }
  await nativeCapture('electron-mw3-desktop', 1440, 920)
  await nativeCapture('electron-mw3-minimum', 760, 620)
  await guest(() => { location.href = '/tools/mw3-dark-aether-reference.html'; return true })
  await waitGuest(() => location.pathname === '/guides/mw3-urzikstan' && location.hash === '#details-dark-aether-portals')
  checks.push('Real Electron offers six direct guide links, searches Greylorm, displays the guide and follows retired URLs at normal/minimum sizes')
  assert.deepEqual(errors, [])
  const report = { base, checkedAt: new Date().toISOString(), checks, screenshots, errors }
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
} finally { if (app) await app.close(); await browser.close() }
