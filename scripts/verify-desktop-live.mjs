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
const guest = expression => page.evaluate(expression => document.getElementById('webview').executeJavaScript(`(${expression})()`), expression.toString())
async function waitGuest(expression) {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    try { if (await guest(expression)) return } catch {}
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
  await page.locator('#nav-search').fill('MWZ rune portal')
  await page.locator('[data-id="mw3-rune-portals"]').click()
  await waitGuest(() => document.querySelector('.remaining-tool select') && document.getElementById('__nuxt')?.__vue_app__ && document.readyState === 'complete')
  const modeResult = await guest(() => { try { const select = Array.from(document.querySelectorAll('select')).find(select => Array.from(select.options).some(option => option.value === 'Destination')); select.value = 'Destination'; select.dispatchEvent(new Event('change', { bubbles: true })); return 'selected' } catch (error) { return error.stack } })
  assert.equal(modeResult, 'selected')
  await waitGuest(() => Array.from(document.querySelectorAll('select')).some(select => Array.from(select.options).some(option => option.value === 'm2112')))
  const destinationResult = await guest(() => { try { const select = Array.from(document.querySelectorAll('select')).find(select => Array.from(select.options).some(option => option.value === 'm2112')); select.value = 'm2112'; select.dispatchEvent(new Event('change', { bubbles: true })); return 'selected' } catch (error) { return error.stack } })
  assert.equal(destinationResult, 'selected')
  await waitGuest(() => document.querySelector('.record-result.ready')?.textContent.includes('I6'))
  assert.equal(await page.locator('#nav-game').inputValue(), 'mw3')
  assert.deepEqual(await guest(() => [typeof window.cw, typeof require, typeof process]), ['undefined', 'undefined', 'undefined'])
  checks.push('Packaged app uses the production origin, complete navigation and isolated live solver')
  await waitGuest(() => Array.from(document.querySelectorAll('.guide-illustrations img')).every(image => image.complete && image.naturalWidth > 0))
  await shot('live-mwz-portal')
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
  await waitGuest(() => document.querySelector('.record-result.ready')?.textContent.includes('I6'))
  checks.push('Minimum window and collapsed sidebar retain the solved puzzle')
  assert.deepEqual(errors, [])
  const report = { version, binary, profile, library: await page.evaluate(() => window.cw.getLibrary()), update, checks, screenshots, errors }
  // Keep the verification record compact; the public manifest owns the full list.
  report.library.catalogue = { revision: report.library.catalogue.revision, games: report.library.catalogue.games.length, entries: report.library.catalogue.entries.length }
  fs.writeFileSync(path.join(output, 'live-verification.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
} finally { await app.close() }
