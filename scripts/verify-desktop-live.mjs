// Usage: node scripts/verify-desktop-live.mjs [packaged CodWiki.exe]
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const binary = process.argv[2] ? path.resolve(process.argv[2]) : null
process.chdir(fileURLToPath(new URL('..', import.meta.url)))
const require = createRequire(path.resolve('desktop-app/package.json'))
const { _electron: electron } = require('playwright')
const version = require('./package.json').version
fs.mkdirSync('.cache', { recursive: true })
const profile = fs.mkdtempSync(path.resolve('.cache/desktop-live-profile-'))
const output = path.resolve('.impeccable/review/desktop')
fs.mkdirSync(output, { recursive: true })
const env = { ...process.env, CW_TEST: '1', CW_TEST_USER_DATA: profile }
delete env.ELECTRON_RUN_AS_NODE
// A packaged build must ignore a development-site override.
if (binary) env.CW_SITE_URL = 'http://127.0.0.1:1'
else delete env.CW_SITE_URL
const app = await electron.launch({ executablePath: binary || require('electron'), args: binary ? [] : [path.resolve('desktop-app')], env, timeout: 30000 })
const page = await app.firstWindow(), errors = [], checks = [], screenshots = []
page.on('pageerror', error => errors.push(error.message))
const guest = (expression, argument) => page.evaluate(({ expression, argument }) => document.getElementById('webview').executeJavaScript(`(${expression})(${JSON.stringify(argument)})`), { expression: expression.toString(), argument })
async function waitGuest(expression, argument) {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    try { if (await guest(expression, argument)) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Live page did not become ready: ' + expression.toString())
}
async function shot(name, width = 1440, height = 920) {
  const buffer = await app.evaluate(async ({ BrowserWindow }, size) => {
    const window = BrowserWindow.getAllWindows()[0]
    window.setSize(size.width, size.height)
    await window.webContents.capturePage()
    await new Promise(resolve => setTimeout(resolve, 250))
    return (await window.webContents.capturePage()).toPNG().toString('base64')
  }, { width, height })
  const filename = path.join(output, name + '.png')
  fs.writeFileSync(filename, Buffer.from(buffer, 'base64')); screenshots.push(filename)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true)
}
try {
  await page.waitForFunction(() => window.CW_LIBRARY && window.CW_SETTINGS)
  const runtime = await page.evaluate(() => window.cw.getRuntime())
  assert.equal(runtime.version, version)
  assert.equal(runtime.site, 'https://codzmwiki.com')
  assert.equal(await page.locator('#nav-game option').count(), 13)
  await page.locator('#nav-search').fill('Red Worm')
  await page.locator('[data-id="mw3-urzikstan"]').click()
  await waitGuest(() => document.querySelector('.guide-article') && document.getElementById('__nuxt')?.__vue_app__ && document.readyState === 'complete')
  assert.equal(await guest(() => document.querySelectorAll('.guide-surface select, .mwz-milestones').length), 0)
  assert.equal(await guest(() => document.querySelectorAll('.map-tools a[href="/tools/mw3-red-worm-photos"]').length), 1)
  await guest(() => { Array.from(document.querySelectorAll('.guide-shortcuts button')).find(button => button.textContent.includes('Red Worm')).click(); return true })
  await waitGuest(() => location.hash === '#details-red-worm' && document.getElementById('details-red-worm').getClientRects().length > 0)
  assert.match(await guest(() => document.getElementById('details-red-worm').closest('section').textContent), /Alpha.*Bravo.*Charlie.*Delta/)
  assert.equal(await page.locator('#nav-game').inputValue(), 'mw3')
  assert.deepEqual(await guest(() => [typeof window.cw, typeof require, typeof process]), ['undefined', 'undefined', 'undefined'])
  checks.push('Packaged app opens the live Red Worm guide with direct photo-finder discovery and no route dropdowns or milestone panel')
  await shot('live-mw3-red-worm')
  await guest(() => { document.querySelector('#guide-step-mw3-usb-collect .show-on-map').click(); return true })
  await waitGuest(() => decodeURIComponent(location.hash) === '#map:red-worm-usbs' && document.querySelector('.leaflet-image-layer')?.naturalWidth === 4096)
  assert.equal(await guest(() => document.querySelectorAll('.atlas-selected-list > li').length), 12)
  assert.equal(await guest(() => document.querySelectorAll('.atlas-layer-select').length), 0)
  assert.match(await guest(() => document.querySelector('.atlas-selection').textContent), /not permanently tied/)
  await shot('live-mw3-map-usbs')
  await guest(() => { document.querySelector('.atlas-heading button').click(); return true })
  await waitGuest(() => location.hash === '#guide-step-mw3-usb-collect')
  checks.push('Packaged app opens the live 4K Urzikstan map with twelve USB candidates and returns to its guide step')
  await page.locator('[data-id="mw3-red-worm-photos"]').click()
  await waitGuest(() => location.pathname.endsWith('mw3-red-worm-photos') && document.querySelectorAll('.photo-select').length === 12 && document.querySelector('.leaflet-image-layer')?.naturalWidth === 4096)
  for (const [index, number] of [1, 4, 8, 12].entries()) {
    await guest(number => { Array.from(document.querySelectorAll('.photo-select')).find(button => button.getAttribute('aria-label').startsWith(`Photo ${number}:`)).click(); return true }, number)
    await waitGuest(count => document.querySelectorAll('[data-map-location]').length === count, index + 1)
  }
  assert.equal(await guest(() => localStorage.getItem('codwiki-mw3-red-worm-photos-v1')), '[1,4,8,12]')
  assert.equal(await guest(() => document.querySelectorAll('.photo-select:disabled').length), 8)
  await shot('live-mw3-photo-finder')
  await guest(() => { document.querySelector('.atlas-guide-link').click(); return true })
  await waitGuest(() => location.hash === '#guide-step-mw3-usb-collect')
  checks.push('Packaged app loads all twelve authentic live clues, selects four matching USB pins, saves their observations and returns to the original guide step')
  await page.locator('#btn-settings').click()
  await page.locator('[data-tab="general"]').click()
  await page.locator('#sp-app-update-check').click()
  await page.waitForFunction(() => !document.getElementById('sp-app-update-check').disabled)
  const update = await page.evaluate(() => window.cw.getUpdate())
  assert.ok(['current', 'available'].includes(update.state), JSON.stringify(update))
  assert.ok(update.url.startsWith('https://github.com/BarniKjellerenXD/CodWiki/releases/tag/desktop-v'))
  checks.push('Actual GitHub desktop update check returns an official stable release')
  await shot('live-general-settings')
  await shot('live-general-minimum', 760, 620)
  await page.locator('#sp-close').click()
  await page.locator('#btn-sidebar').click()
  assert.equal(await page.locator('#sidebar').isVisible(), false)
  await waitGuest(() => location.hash === '#guide-step-mw3-usb-collect')
  checks.push('Minimum window and collapsed sidebar retain the selected guide section')
  assert.deepEqual(errors, [])
  const report = { version, binary, profile, library: await page.evaluate(() => window.cw.getLibrary()), update, checks, screenshots, errors }
  // Keep the verification record compact; the public manifest owns the full list.
  report.library.catalogue = { revision: report.library.catalogue.revision, games: report.library.catalogue.games.length, entries: report.library.catalogue.entries.length }
  fs.writeFileSync(path.join(output, 'live-verification.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
} finally { await app.close() }
