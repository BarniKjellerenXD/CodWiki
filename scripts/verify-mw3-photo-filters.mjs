// Production UI and actual hidden Electron smoke test. No artificial game-state claims.
// Usage: node scripts/verify-mw3-photo-filters.mjs [base URL]
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { redWormPhotoAtlas } from '../shared/mw3-photo-board.mjs'
const require = createRequire(path.resolve('desktop-app/package.json'))
const { chromium, _electron } = require('playwright')
const base = process.argv[2] || 'http://127.0.0.1:3130'
const output = path.resolve('.impeccable/review/mw3-photo-filters')
fs.mkdirSync(output, { recursive: true })
const checks = [], screenshots = [], errors = [], warnings = []
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
page.on('pageerror', error => errors.push(error.message))
async function go(route) {
  await page.goto(base + route, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => !!document.getElementById('__nuxt')?.__vue_app__)
}
async function ready() {
  await page.waitForFunction(() => { const image = document.querySelector('.atlas .leaflet-image-layer'); return image?.complete && image.naturalWidth === 4096 && !document.querySelector('.atlas-image-loading') })
}
async function pins(prefix, count) {
  await page.waitForFunction(count => document.querySelectorAll('[data-map-location]').length === count, count)
  assert.ok((await page.locator('[data-map-location]').evaluateAll(elements => elements.map(element => element.dataset.mapLocation))).every(id => id.startsWith(prefix)))
}
async function capture(name, fullPage = false) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true, 'No page-wide horizontal overflow')
  const file = path.join(output, name + '.png')
  await page.screenshot({ path: file, fullPage }); screenshots.push(file)
}
try {
  await go('/guides/mw3-urzikstan#map')
  await ready()
  await page.getByRole('button', { name: 'Red Worm', exact: true }).click()
  await pins('loc-image-', 4)
  await capture('red-worm-boards-desktop')
  await page.getByRole('button', { name: /^USB devices/ }).click()
  await pins('usb-key-', 12)
  assert.equal(await page.locator('.photo-select').count(), 12)
  // Every real reference photo selects its independently verified existing pin.
  for (const photo of redWormPhotoAtlas.photos) {
    await page.getByRole('button', { name: new RegExp(`^Photo ${photo.number}:`) }).click()
    await pins('usb-key-', 1)
    assert.equal(await page.locator('[data-map-location]').getAttribute('data-map-location'), photo.locationId)
    assert.equal((await page.locator('.atlas-marker-selected').textContent()).trim(), String(photo.number))
    await page.getByRole('button', { name: 'New board', exact: true }).click()
    await pins('usb-key-', 12)
  }
  for (const number of [1, 4, 8, 12]) await page.getByRole('button', { name: new RegExp(`^Photo ${number}:`) }).click()
  await pins('usb-key-', 4)
  assert.equal(await page.locator('.photo-select:disabled').count(), 8)
  assert.match(decodeURIComponent(new URL(page.url()).hash), /red-worm-photos-1-4-8-12/)
  const stored = await page.evaluate(() => localStorage.getItem('codwiki-mw3-red-worm-photos-v1'))
  assert.equal(stored, '[1,4,8,12]')
  await capture('photo-matches-guide-desktop')
  await page.getByRole('button', { name: 'Unstable Rift', exact: true }).click()
  await pins('obelisk-urzi-', 54)
  assert.equal(await page.locator('.atlas-selection').count(), 0)
  await capture('unstable-rift-desktop')
  await page.getByRole('button', { name: 'Red Worm', exact: true }).click()
  await page.getByRole('button', { name: /^Fight arenas/ }).click()
  await pins('greylom-', 4)
  await page.getByRole('button', { name: /^USB devices/ }).click()
  await pins('usb-key-', 4)
  await page.reload({ waitUntil: 'networkidle' }); await ready(); await pins('usb-key-', 4)
  checks.push('All twelve authentic board photos match their exact pin; four-photo limits, stable numbers, saved selections, reload, candidate arenas and activity isolation work')

  for (const season of [1, 2, 3, 5]) {
    await go('/guides/mw3-dark-aether-season-' + season + '#map')
    await ready()
    await page.getByRole('button', { name: 'Quests', exact: true }).click()
    await pins(season === 3 ? 'obelisk-m' : 'contracts-', 3)
    assert.equal(await page.locator('.atlas-subfilter-buttons button[aria-pressed=true]').textContent(), (season === 3 ? 'Contract starters ' : 'Mr. Peeks starters ') + '3')
    if (season === 2) {
      await page.getByRole('button', { name: /^Story relic obelisks/ }).click()
      assert.equal(await page.locator('[data-map-location]').count(), 3)
      assert.ok((await page.locator('[data-map-location]').evaluateAll(elements => elements.map(element => element.dataset.mapLocation))).every(id => /^(perforated-target|pristine-mirror|tattered-mma-gloves)-/.test(id)))
      await page.getByRole('button', { name: /^Mr. Peeks starters/ }).click()
      await capture('dark-aether-quests-desktop')
    }
  }
  checks.push('All four Dark Aether Quests filters isolate exactly three contract starters; story relics remain separate and Season 3 identifies contract obelisks accurately')

  await go('/tools/mw3-red-worm-photos')
  await ready(); await pins('usb-key-', 4)
  await capture('photo-finder-desktop')
  await page.getByRole('button', { name: /^Enlarge photo 5:/ }).click()
  await page.locator('dialog.lightbox').waitFor({ state: 'visible' })
  assert.equal(await page.locator('dialog.lightbox .reference-crop').getAttribute('viewBox'), '38 864 300 262')
  await capture('photo-enlarged-desktop')
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('button', { name: /^Enlarge photo 5:/ }).evaluate(element => element === document.activeElement), true)
  await page.getByRole('button', { name: /^Photo 4:/ }).focus(); await page.keyboard.press('Space')
  await pins('usb-key-', 3)
  await page.getByRole('button', { name: /^Photo 5:/ }).focus(); await page.keyboard.press('Enter')
  await pins('usb-key-', 4)
  assert.equal(await page.locator('.photo-select[aria-pressed=true]').count(), 4)
  await go('/tools/mw3-red-worm-photos#map:red-worm-photos-12-2-3-10')
  await ready(); await pins('usb-key-', 4)
  assert.equal(await page.evaluate(() => localStorage.getItem('codwiki-mw3-red-worm-photos-v1')), '[2,3,10,12]')
  checks.push('Dedicated finder uses the same saved board, incoming map links replace it, photo previews retain actual crops, and keyboard selection/Escape restore focus')

  await page.setViewportSize({ width: 390, height: 844 })
  await go('/tools/mw3-red-worm-photos#map:red-worm-photos-1-4-8-12')
  await ready()
  const photos = await page.locator('.photo-board').boundingBox(), map = await page.locator('.atlas-map-frame').boundingBox()
  assert.ok(photos.y + photos.height <= map.y, 'Phone places photos before the map')
  await page.locator('.photo-board').scrollIntoViewIfNeeded(); await capture('photo-finder-mobile-sheet')
  await page.getByRole('button', { name: /^View 4 matching USBs/ }).click()
  await page.locator('.atlas-canvas').waitFor({ state: 'visible' })
  await capture('photo-finder-mobile-map')
  await go('/guides/mw3-dark-aether-season-5#map')
  await ready(); await page.getByRole('button', { name: 'Quests', exact: true }).click()
  await pins('contracts-', 3)
  await capture('dark-aether-quests-mobile')
  checks.push('Phone layouts keep the image sheet before the map, offer a direct jump to selected USBs, and expose the nested Dark Aether filters without page overflow')

  const blocked = await context.newPage()
  await blocked.route('**/images/remaining/reddit-red-worm-chart.jpeg*', route => route.abort())
  await blocked.goto(base + '/tools/mw3-red-worm-photos', { waitUntil: 'networkidle' })
  await blocked.getByRole('button', { name: 'Retry images', exact: true }).waitFor({ state: 'visible' })
  assert.equal(await blocked.locator('.photo-fallback').count(), 12)
  await blocked.unroute('**/images/remaining/reddit-red-worm-chart.jpeg*')
  await blocked.getByRole('button', { name: 'Retry images', exact: true }).click()
  await blocked.waitForFunction(() => document.querySelector('.photo-board-preload')?.naturalWidth === 1440)
  assert.equal(await blocked.locator('.photo-fallback').count(), 0)
  await blocked.close()
  const noStorage = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await noStorage.addInitScript(() => { Storage.prototype.setItem = function () { throw Error('Storage unavailable') } })
  const unsaved = await noStorage.newPage()
  await unsaved.goto(base + '/tools/mw3-red-worm-photos', { waitUntil: 'networkidle' })
  await unsaved.getByRole('button', { name: /^Photo 2:/ }).click()
  await unsaved.getByText('Your photos could not be saved. Keep this page open or copy the map link.').waitFor({ state: 'visible' })
  assert.equal(await unsaved.locator('[data-map-location]').count(), 1)
  await noStorage.close()
  checks.push('Failed clue-image requests provide twelve named fallbacks and successful retry; unavailable storage preserves the current selection and explains how to keep it')
} finally { await browser.close() }

const profile = fs.mkdtempSync(path.resolve('.cache/mw3-photos-native-'))
const env = { ...process.env, CW_TEST: '1', CW_TEST_USER_DATA: profile, CW_SITE_URL: base }
delete env.ELECTRON_RUN_AS_NODE
const app = await _electron.launch({ executablePath: require('electron'), args: [path.resolve('desktop-app')], env, timeout: 30000 })
const host = await app.firstWindow()
host.on('pageerror', error => errors.push(error.message))
const guest = (expression, argument) => host.evaluate(({ expression, argument }) => document.getElementById('webview').executeJavaScript(`(${expression})(${JSON.stringify(argument)})`), { expression: expression.toString(), argument })
async function waitGuest(expression, argument) {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    try { if (await guest(expression, argument)) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw Error('Native finder did not become ready: ' + expression.toString())
}
async function nativeShot(name, width, height, selector = '.photo-board') {
  const buffer = await app.evaluate(async ({ BrowserWindow, webContents }, size) => {
    const window = BrowserWindow.getAllWindows()[0]
    window.setSize(size.width, size.height)
    // Finish the prior resize / smooth-scroll frame before the deterministic
    // evidence position. Hidden guest textures otherwise retain the sheet.
    await new Promise(resolve => setTimeout(resolve, 500))
    for (const guest of webContents.getAllWebContents().filter(contents => contents.getType() === 'webview')) {
      await guest.capturePage()
      await guest.executeJavaScript(`(() => { const target = document.querySelector(${JSON.stringify(size.selector)}); const toolbar = document.querySelector('.guide-toolbar'); const offset = toolbar ? toolbar.getBoundingClientRect().height + 16 : 0; window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' }); })()`)
      await new Promise(resolve => setTimeout(resolve, 200))
      await guest.capturePage()
    }
    await window.webContents.capturePage()
    await new Promise(resolve => setTimeout(resolve, 250))
    return (await window.webContents.capturePage()).toPNG().toString('base64')
  }, { width, height, selector })
  const file = path.join(output, name + '.png')
  fs.writeFileSync(file, Buffer.from(buffer, 'base64')); screenshots.push(file)
}
try {
  await host.waitForFunction(() => !!window.CW_LIBRARY)
  await host.locator('#nav-game').selectOption('mw3')
  assert.match(await host.locator('#nav-game-info').textContent(), /5 maps.*photo finder/)
  await host.locator('[data-id="mw3-red-worm-photos"]').click()
  await waitGuest(() => location.pathname.endsWith('mw3-red-worm-photos') && document.querySelector('.photo-select') && document.querySelector('.leaflet-image-layer')?.naturalWidth === 4096)
  const point = await guest(() => { const r = document.querySelector('.photo-select').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
  await app.evaluate(({ webContents }, point) => {
    const view = webContents.getAllWebContents().find(contents => contents.getType() === 'webview')
    const position = { x: Math.round(point.x), y: Math.round(point.y) }
    view.sendInputEvent({ type: 'mouseMove', ...position })
    view.sendInputEvent({ type: 'mouseDown', ...position, button: 'left', clickCount: 1 })
    view.sendInputEvent({ type: 'mouseUp', ...position, button: 'left', clickCount: 1 })
  }, point)
  await waitGuest(() => document.querySelectorAll('[data-map-location]').length === 1 && document.querySelector('.photo-select').getAttribute('aria-pressed') === 'true')
  for (const [index, number] of [4, 8, 12].entries()) {
    await guest(number => { Array.from(document.querySelectorAll('.photo-select')).find(button => button.getAttribute('aria-label').startsWith(`Photo ${number}:`)).click(); return true }, number)
    await waitGuest(count => document.querySelectorAll('[data-map-location]').length === count, index + 2)
  }
  await waitGuest(() => document.querySelectorAll('[data-map-location]').length === 4)
  await nativeShot('electron-photo-finder-desktop', 1440, 920, '.tool-page')
  await nativeShot('electron-photo-finder-minimum-sheet', 760, 620)
  await guest(() => { document.querySelector('.photo-board-locate').click(); return true })
  await nativeShot('electron-photo-finder-minimum-map', 760, 620, '.atlas-map-tools')
  assert.ok(await guest(() => document.querySelector('.atlas-map-frame').getBoundingClientRect().top < innerHeight / 2), 'Minimum-window map evidence must actually show the map')
  assert.equal(await guest(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true)
  assert.deepEqual(await guest(() => [typeof window.cw, typeof require, typeof process]), ['undefined', 'undefined', 'undefined'])
  await host.locator('[data-id="mw3-dark-aether-season-1"]').click()
  await waitGuest(() => location.pathname.endsWith('mw3-dark-aether-season-1') && !!document.getElementById('__nuxt')?.__vue_app__)
  await guest(() => { Array.from(document.querySelectorAll('.reading-switch button')).find(button => button.textContent === 'Map').click(); return true })
  await waitGuest(() => document.querySelector('.atlas-filters') && document.querySelector('.leaflet-image-layer')?.naturalWidth === 4096)
  await guest(() => { Array.from(document.querySelectorAll('.atlas-filters button')).find(button => button.textContent.trim() === 'Quests').click(); return true })
  await waitGuest(() => document.querySelectorAll('[data-map-location]').length === 3)
  await nativeShot('electron-dark-aether-minimum', 760, 620, '.guide-map-view')
  await nativeShot('electron-dark-aether-minimum-map', 760, 620, '.atlas-map-tools')
  checks.push('Actual Electron catalogue discovers the finder; native pointer events select real photos, four matches fit both window sizes, and Dark Aether filters isolate starters with native isolation intact')
} finally { await app.close() }
assert.deepEqual(errors, [])
const report = { story: 'Guide and tool discovery → activity/subfilter or observed board photos → authored local location/photo data → matching Leaflet pins → saved/shareable observations on web and Electron.', base, checkedAt: new Date().toISOString(), checks, screenshots, errors, warnings }
fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
