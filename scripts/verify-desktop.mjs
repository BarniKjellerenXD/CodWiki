// Usage: node scripts/verify-desktop.mjs [directory containing Playwright]
// Uses a hidden Electron window, an isolated profile and a loopback fixture site.
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const runtimeDirectory = process.argv[2] ? path.resolve(process.argv[2]) : fileURLToPath(new URL('../desktop-app/node_modules', import.meta.url))
const require = createRequire(path.join(runtimeDirectory, '__desktop_runtime__.cjs'))
const { _electron: electron } = require('playwright')
process.chdir(fileURLToPath(new URL('..', import.meta.url)))
const localRequire = createRequire(import.meta.url)
const { normalizeCatalogue } = localRequire('../desktop-app/catalogue.js')
const bundled = JSON.parse(fs.readFileSync('public/desktop-catalogue.json', 'utf8'))
const version = JSON.parse(fs.readFileSync('desktop-app/package.json', 'utf8')).version
const output = path.resolve('.impeccable/review/desktop')
fs.mkdirSync('.cache', { recursive: true })
const profile = fs.mkdtempSync(path.resolve('.cache/desktop-profile-'))
fs.mkdirSync(output, { recursive: true })
const observations = [], errors = [], screenshots = []
let manifest = bundled, libraryOffline = false, pageOffline = false, requests = 0
const fixture = route => `<!doctype html><html data-theme="archive"><head><title>Desktop test page</title><style>body{background:#111214;color:#f2f2f0;font:16px Segoe UI,sans-serif;padding:40px}input,button,a{font:inherit;display:block;margin:20px 0;padding:12px;background:#26292e;color:#f2f2f0;border:1px solid #50555e}a{color:#ddb363}</style></head><body><h1>${route === '/' ? 'Desktop integration fixture' : route}</h1><label for="observation">Puzzle observation</label><input id="observation"><a href="/guides/iw-zombies-in-spaceland" target="_blank" id="same-site">Open Spaceland</a><a href="https://example.com/reference" target="_blank" id="external">Open source</a><script>const field=document.getElementById('observation');field.value=localStorage.getItem('cw-desktop-test-observation')||'';field.addEventListener('input',()=>localStorage.setItem('cw-desktop-test-observation',field.value));</script></body></html>`
const server = http.createServer((request, response) => {
  if (request.url === '/desktop-catalogue.json') {
    requests++
    response.writeHead(libraryOffline ? 503 : 200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    response.end(JSON.stringify(manifest)); return
  }
  if (pageOffline && request.url.startsWith('/tools/')) { request.socket.destroy(); return }
  response.writeHead(200, { 'content-type': 'text/html', 'cache-control': 'no-store' })
  response.end(fixture(request.url))
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const site = `http://127.0.0.1:${server.address().port}`
fs.writeFileSync(path.join(profile, 'codwiki-settings.json'), JSON.stringify({ shortcuts: { 'nav:iw-spaceland-speakers': 'Ctrl+Alt+J', 'nav:ashes-of-the-damned': null }, labels: { 'iw-spaceland-speakers': 'Saved speaker sequence' }, hidden: ['iw-spaceland-souvenirs'], order: ['iw-zombies-in-spaceland', 'iw-spaceland-speakers'], startZoom: 0.523, restoreLastPage: true }))
let app, page
async function launch() {
  const env = { ...process.env, CW_TEST: '1', CW_TEST_USER_DATA: profile, CW_SITE_URL: site }
  delete env.ELECTRON_RUN_AS_NODE
  app = await electron.launch({ executablePath: path.resolve('desktop-app/node_modules/electron/dist/electron.exe'), args: [path.resolve('desktop-app')], cwd: path.resolve('desktop-app'), env, timeout: 30000 })
  page = await app.firstWindow()
  page.on('pageerror', error => errors.push(error.message))
  await page.waitForFunction(() => { try { return window.CW_LIBRARY && window.CW_SETTINGS && document.getElementById('webview').getURL().startsWith('http:') } catch { return false } })
  await waitGuest(() => document.readyState === 'complete')
}
const guestEval = (expression, arg) => page.evaluate(({ expression, arg }) => document.getElementById('webview').executeJavaScript(`(${expression})(${JSON.stringify(arg)})`), { expression: expression.toString(), arg })
const guestUrl = () => page.evaluate(() => document.getElementById('webview').getURL())
async function waitGuest(expression) {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    try { if (await guestEval(expression)) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Test page did not become ready: ' + expression.toString())
}
async function waitRoute(route) {
  await page.waitForFunction(route => { try { return document.getElementById('webview').getURL().endsWith(route) } catch { return false } }, route)
  await waitGuest(() => document.readyState === 'complete')
}
async function shot(name, width = 1440, height = 920) {
  const buffer = await app.evaluate(async ({ BrowserWindow }, size) => {
    const window = BrowserWindow.getAllWindows()[0]
    window.setSize(size.width, size.height)
    // Warm the hidden window's compositor before taking the evidence frame.
    await window.webContents.capturePage()
    await new Promise(resolve => setTimeout(resolve, 250))
    return (await window.webContents.capturePage()).toPNG().toString('base64')
  }, { width, height })
  const filename = path.join(output, name + '.png')
  fs.writeFileSync(filename, Buffer.from(buffer, 'base64')); screenshots.push(filename)
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }))
  assert.ok(widths.document <= widths.viewport + 1, `${name}: horizontal overflow`)
}
async function key(target, keyCode, modifiers = []) {
  await app.evaluate(({ BrowserWindow, webContents }, input) => {
    const wc = input.target === 'host' ? BrowserWindow.getAllWindows()[0].webContents : webContents.getAllWebContents().find(wc => wc.getType() === 'webview')
    wc.sendInputEvent({ type: 'keyDown', keyCode: input.keyCode, modifiers: input.modifiers })
    wc.sendInputEvent({ type: 'keyUp', keyCode: input.keyCode, modifiers: input.modifiers })
  }, { target, keyCode, modifiers })
}
async function close() {
  await app.evaluate(async ({ session }) => { await session.defaultSession.flushStorageData() })
  await app.close()
}
try {
  await launch()
  assert.equal(await page.evaluate(() => window.cw.getRuntime().then(value => value.version)), version)
  await page.waitForFunction(() => window.CW_LIBRARY.source === 'live')
  assert.equal(await page.locator('#nav-game option').count(), 13)
  assert.equal(await page.evaluate(() => window.NAV.filter(entry => entry.status === 'planned').length), 0)
  const preferences = await app.evaluate(({ BrowserWindow, webContents }) => ({ host: BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences(), guest: webContents.getAllWebContents().find(wc => wc.getType() === 'webview').getLastWebPreferences(), hidden: !BrowserWindow.getAllWindows()[0].isVisible() }))
  for (const prefs of [preferences.host, preferences.guest]) { assert.equal(prefs.contextIsolation, true); assert.equal(prefs.nodeIntegration, false); assert.equal(prefs.sandbox, true) }
  assert.equal(preferences.hidden, true)
  assert.deepEqual(await guestEval(() => [typeof window.cw, typeof require, typeof process]), ['undefined', 'undefined', 'undefined'])
  observations.push('Real host IPC, isolated guest and hidden test profile verified')

  await page.locator('#nav-game').selectOption('iw')
  await page.locator('#nav-search').fill('speaker')
  assert.equal(await page.locator('[data-id="iw-spaceland-speakers"]').innerText(), 'Saved speaker sequence')
  await page.locator('[data-id="iw-spaceland-speakers"]').click()
  await waitRoute('/tools/iw-spaceland-speakers')
  await guestEval(() => { const field = document.getElementById('observation'); field.value = 'Blue, red, green'; field.dispatchEvent(new Event('input')) })
  const before = await guestUrl()
  manifest = structuredClone(bundled)
  manifest.games.push({ id: 'desktop-test-game', name: 'Test catalogue addition', aliases: ['new test'], planned: false })
  manifest.entries.push({ ...manifest.entries.find(entry => entry.kind === 'guide'), id: 'desktop-test-map', map: 'desktop-test-map', game: 'desktop-test-game', gameName: 'Test catalogue addition', section: 'Test map', url: '/guides/desktop-test-map', accel: null })
  manifest.entries.push({ ...manifest.entries.find(entry => entry.id === 'iw-spaceland-speakers'), id: 'desktop-test-tool', map: 'desktop-test-map', game: 'desktop-test-game', gameName: 'Test catalogue addition', section: 'Test map', label: 'Test tool', url: '/tools/desktop-test-tool', accel: null })
  const nextRevision = normalizeCatalogue(manifest).revision
  await page.locator('#nav-search').fill('speaker')
  await page.locator('#nav-search').focus()
  await page.evaluate(() => window.cw.refreshLibrary())
  await page.waitForFunction(revision => window.CW_LIBRARY.catalogue.revision === revision, nextRevision)
  assert.equal(await guestUrl(), before)
  assert.equal(await guestEval(() => document.getElementById('observation').value), 'Blue, red, green')
  assert.equal(await page.locator('#nav-search').inputValue(), 'speaker')
  assert.equal(await page.locator('#nav-game').inputValue(), 'iw')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'nav-search')
  assert.equal(await page.locator('#nav-game option').count(), 14)
  assert.equal(await page.evaluate(() => window.cw.getSettings().then(value => value.shortcuts['nav:iw-spaceland-speakers'])), 'Ctrl+Alt+J')
  observations.push('Live additions preserve the current route, inputs, search, selected game and custom shortcut')

  await page.locator('#btn-home').click(); await waitRoute('/')
  await key('host', 'J', ['control', 'alt']); await waitRoute('/tools/iw-spaceland-speakers')
  await page.locator('#btn-home').click(); await waitRoute('/')
  await key('guest', 'J', ['control', 'alt']); await waitRoute('/tools/iw-spaceland-speakers')
  observations.push('Custom tool shortcut works through actual Electron input events in host and guest')
  await page.locator('#btn-settings').click()
  await page.locator('[data-tab="sidebar"]').click()
  await page.locator('#sp-game').selectOption('iw')
  // Locate by current value because the server may update the authored tool label.
  const editing = page.locator('.sp-nav-label').filter({ visible: true })
  const inputIndex = await editing.evaluateAll(inputs => inputs.findIndex(input => input.value === 'Saved speaker sequence'))
  assert.ok(inputIndex >= 0)
  await editing.nth(inputIndex).fill('Edited during refresh')
  await page.evaluate(() => window.cw.refreshLibrary())
  assert.equal(await editing.nth(inputIndex).inputValue(), 'Edited during refresh')
  await page.locator('#sp-close').click()
  assert.equal(await page.evaluate(() => window.cw.getSettings().then(value => value.labels['iw-spaceland-speakers'])), 'Edited during refresh')
  observations.push('An unsaved label survives background library updates and saves when settings closes')

  libraryOffline = true
  await page.locator('#btn-settings').click()
  await page.locator('[data-tab="general"]').click()
  await page.locator('#sp-library-refresh').click()
  await page.waitForFunction(() => !document.getElementById('sp-library-refresh').disabled)
  assert.match(await page.locator('#sp-library-status').innerText(), /Could not check/)
  assert.equal(await page.evaluate(() => window.CW_LIBRARY.catalogue.revision), nextRevision)
  await shot('general-library-fallback')
  await shot('general-minimum-window', 760, 620)
  await page.locator('#sp-close').click()
  await close()

  await launch()
  await waitRoute('/tools/iw-spaceland-speakers')
  assert.equal(await guestEval(() => document.getElementById('observation').value), 'Blue, red, green')
  assert.equal(await page.evaluate(() => window.CW_LIBRARY.source), 'saved')
  assert.equal(await page.locator('#nav-game option').count(), 14)
  const restored = await page.evaluate(() => window.cw.getSettings())
  assert.equal(restored.shortcuts['nav:iw-spaceland-speakers'], 'Ctrl+Alt+J')
  assert.equal(restored.shortcuts['nav:ashes-of-the-damned'], null)
  assert.equal(restored.labels['iw-spaceland-speakers'], 'Edited during refresh')
  assert.deepEqual(restored.hidden, ['iw-spaceland-souvenirs'])
  assert.equal(restored.startZoom, 0.523)
  observations.push('Restart restores saved catalogue, route, page storage and custom settings during a failed check')

  libraryOffline = false; manifest = { schemaVersion: 2 }
  await page.evaluate(() => window.cw.refreshLibrary())
  assert.equal(await page.evaluate(() => window.CW_LIBRARY.state), 'unsupported')
  assert.equal(await page.evaluate(() => window.CW_LIBRARY.catalogue.revision), nextRevision)
  manifest = bundled
  await page.evaluate(() => window.cw.refreshLibrary())
  assert.equal(await page.locator('#nav-game option').count(), 13)
  observations.push('Unsupported metadata retains the saved library; a valid response recovers without restarting')

  await app.evaluate(({ shell }) => { shell.openExternal = async url => { globalThis.__desktopExternalUrl = url } })
  await guestEval(() => document.getElementById('external').click())
  await page.waitForFunction(() => true)
  await page.waitForTimeout(150)
  assert.equal(await app.evaluate(() => globalThis.__desktopExternalUrl), 'https://example.com/reference')
  await guestEval(() => document.getElementById('same-site').click())
  await waitRoute('/guides/iw-zombies-in-spaceland')
  assert.equal(await page.locator('#nav-game').inputValue(), 'iw')
  observations.push('Same-site new-window links stay in the app; external sources use the system-browser handler')

  pageOffline = true
  await page.evaluate(site => document.getElementById('webview').loadURL(site + '/tools/iw-spaceland-speakers').catch(() => {}), site)
  await page.waitForFunction(() => document.getElementById('webview').getURL().startsWith('data:'))
  assert.equal(await guestEval(() => document.querySelector('a').href), site + '/tools/iw-spaceland-speakers')
  pageOffline = false
  await guestEval(() => document.querySelector('a').click())
  await waitRoute('/tools/iw-spaceland-speakers')
  observations.push('The connection error retries the failed puzzle page and recovers')
  await page.locator('#btn-settings').click()
  await page.locator('[data-tab="shortcuts"]').click()
  await page.locator('#sp-reset-shortcuts').click()
  assert.equal(await page.evaluate(() => window.cw.getSettings().then(value => value.shortcuts['nav:iw-spaceland-speakers'])), null)
  observations.push('Reset all clears custom bindings for tools with no default shortcut')
  assert.deepEqual(errors, [])
  const report = { version, date: new Date().toISOString(), site, profile, requests, checks: observations, screenshots, errors }
  fs.writeFileSync(path.join(output, 'native-verification.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
} finally {
  if (app) await close().catch(() => {})
  await new Promise(resolve => server.close(resolve))
}
