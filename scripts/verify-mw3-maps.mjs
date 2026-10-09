// Usage: node scripts/verify-mw3-maps.mjs [base URL] [--native-only]
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(path.resolve('desktop-app/package.json'))
const { chromium, _electron } = require('playwright')
const base = process.argv[2] || 'http://127.0.0.1:3130'
const ids = ['mw3-urzikstan', ...[1, 2, 3, 5].map(season => 'mw3-dark-aether-season-' + season)]
const output = path.resolve('.impeccable/review/mw3-maps')
fs.mkdirSync(output, { recursive: true }); fs.mkdirSync('.cache', { recursive: true })
const checks = [], screenshots = [], errors = []
if (!process.argv.includes('--native-only')) {
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
page.on('pageerror', error => errors.push(error.message))
async function go(route) {
  await page.goto(base + route, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => !!document.getElementById('__nuxt')?.__vue_app__)
}
async function ready() {
  await page.locator('.atlas').waitFor({ state: 'visible' })
  await page.waitForFunction(() => { const image = document.querySelector('.atlas .leaflet-image-layer'); return image?.complete && image.naturalWidth === 4096 && !document.querySelector('.atlas-image-loading') })
  assert.equal(await page.locator('.atlas-layer-select').count(), 0)
  assert.equal(await page.locator('.mwz-milestones, .guide-branch').count(), 0)
  assert.equal(await page.locator('.map-tools:visible').count(), 0)
}
async function capture(name) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true)
  const file = path.join(output, name + '.png')
  await page.screenshot({ path: file }); screenshots.push(file)
}
try {
  for (const id of ids) {
    const requests = []
    const collect = request => { if (request.url().includes('/maps/' + id + '/')) requests.push(request.url()) }
    page.on('request', collect)
    await go('/guides/' + id)
    assert.equal(await page.getByRole('button', { name: 'Full Details', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.equal(requests.length, 0, 'Map artwork must remain lazy before opening Map')
    await page.getByRole('button', { name: 'Map', exact: true }).click()
    await ready()
    assert.equal(requests.length, 1)
    assert.equal(await page.getByRole('button', { name: /^Key locations/ }).getAttribute('aria-pressed'), 'true')
    assert.equal(await page.locator('.atlas-grid-label').count(), 20)
    page.off('request', collect)
  }
  checks.push('All five production maps load local 4K artwork only when requested, with no MW3 route dropdowns or progression trackers')

  await go('/guides/mw3-urzikstan#map')
  await ready(); await capture('urzikstan-desktop')
  const image = page.locator('.atlas .leaflet-image-layer')
  const before = await image.boundingBox()
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  await page.waitForFunction(width => document.querySelector('.atlas .leaflet-image-layer').getBoundingClientRect().width > width, before.width)
  const pane = page.locator('.atlas .leaflet-map-pane')
  const panBefore = await pane.getAttribute('style')
  const canvas = page.locator('.atlas-canvas'), box = await canvas.boundingBox()
  await page.mouse.move(box.x + box.width * .6, box.y + box.height * .6)
  await page.mouse.down(); await page.mouse.move(box.x + box.width * .4, box.y + box.height * .5, { steps: 8 }); await page.mouse.up()
  assert.notEqual(await pane.getAttribute('style'), panBefore)
  await canvas.focus(); const keyBefore = await pane.getAttribute('style'); await page.keyboard.press('ArrowRight')
  await page.waitForFunction(previous => document.querySelector('.atlas .leaflet-map-pane').getAttribute('style') !== previous, keyBefore)
  await page.getByRole('button', { name: 'Grid', exact: true }).click()
  assert.equal(await page.locator('.atlas-grid-label').count(), 0)
  await page.reload({ waitUntil: 'networkidle' }); await ready()
  assert.equal(await page.getByRole('button', { name: 'Grid', exact: true }).getAttribute('aria-pressed'), 'false')
  await page.getByRole('button', { name: 'Grid', exact: true }).click()
  await page.locator('.atlas-search input').fill('Ammo cache')
  assert.ok(await page.locator('.atlas-location-list li').count() > 20, 'Overview search must include support locations')
  await page.locator('.atlas-search input').fill('H7')
  assert.ok(await page.locator('.atlas-location-list li').count() > 0)
  await page.locator('.atlas-search input').fill('zz-no-such-landmark')
  assert.equal(await page.locator('.atlas-no-results').isVisible(), true)
  checks.push('Pointer drag, keyboard pan, zoom, global overview search, grid search, empty results and saved grid preferences work')

  await go('/guides/mw3-urzikstan#guide-step-mw3-usb-collect')
  await page.locator('#guide-step-mw3-usb-collect .show-on-map').click()
  await ready()
  assert.equal(decodeURIComponent(new URL(page.url()).hash), '#map:red-worm-usbs')
  assert.ok(!new URL(page.url()).hash.includes('%25'), 'New map links must not double-encode their target')
  assert.equal(await page.locator('.atlas-selected-list > li').count(), 12)
  await page.getByRole('button', { name: 'Supplies', exact: true }).click()
  await page.getByRole('button', { name: /^Ammo caches/ }).click()
  await page.locator('.atlas-search input').fill('zz-no-such-landmark')
  assert.equal(await page.locator('[data-map-location]').count(), 0, 'Switching activities clears the previous USB selection')
  await page.locator('.atlas-search input').fill('')
  await page.getByRole('button', { name: 'Red Worm', exact: true }).click()
  await page.getByRole('button', { name: /^USB devices/ }).click()
  await capture('urzikstan-usbs-desktop')
  await page.getByRole('button', { name: '← Back to step', exact: true }).first().click()
  assert.equal(new URL(page.url()).hash, '#guide-step-mw3-usb-collect')
  await page.waitForFunction(() => document.querySelector('#guide-step-mw3-usb-collect .show-on-map') === document.activeElement)
  await page.getByRole('button', { name: 'Quick Parts', exact: true }).click()
  await go('/guides/mw3-urzikstan#quick-step-mw3-free-phd')
  const quickLink = page.locator('#quick-step-mw3-free-phd .show-on-map')
  await quickLink.click(); await ready()
  assert.match(await page.locator('.atlas-selection h3').textContent(), /PhD/)
  await page.getByRole('button', { name: '← Back to step', exact: true }).first().click()
  assert.equal(await page.getByRole('button', { name: 'Quick Parts', exact: true }).getAttribute('aria-pressed'), 'true')
  checks.push('Full and Quick map links preserve selected candidates, return anchors, reading mode and keyboard focus')

  await page.setViewportSize({ width: 390, height: 844 })
  await go('/guides/mw3-urzikstan#map:free-phd'); await ready(); await capture('urzikstan-mobile')
  await go('/guides/mw3-dark-aether-season-2#map:exits'); await ready()
  assert.equal(await page.locator('.atlas-selected-list > li').count(), 4)
  await capture('season2-exits-mobile')
  await go('/guides/mw3-dark-aether-season-5#map:cosmos-maze'); await ready()
  assert.match(await page.locator('.atlas-selection').textContent(), /Elder-only/)
  await capture('season5-cosmos-mobile')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await go('/guides/mw3-dark-aether-season-1#map:mw1-keys-officers'); await ready(); await capture('season1-keys-desktop')
  await go('/guides/mw3-dark-aether-season-3#map:gyanxi-spores'); await ready()
  assert.equal(await page.locator('.atlas-selected-list > li').count(), 4)
  await capture('season3-gyanxi-desktop')
  await go('/guides/mw3-urzikstan#map%253Ared-worm-usbs'); await ready()
  assert.equal(await page.locator('.atlas-selected-list > li').count(), 12, 'Old double-encoded map bookmarks remain usable')
  await go('/guides/paradox-junction#map:cursed-mister-peeks')
  await page.waitForFunction(() => document.querySelector('.leaflet-image-layer')?.naturalWidth === 2048)
  assert.equal(await page.locator('.atlas-layer-select').count(), 1)
  assert.ok(await page.locator('.atlas-selected-list > li').count() > 0)
  checks.push('Direct map links, seasonal keys/exits/Gyanxi/Elder areas and responsive map controls work on desktop and phone')

  const failed = await browser.newContext({ viewport: { width: 1000, height: 900 } })
  const failedPage = await failed.newPage()
  failedPage.on('pageerror', error => errors.push(error.message))
  const blocked = '**/maps/mw3-dark-aether-season-1/overview.webp'
  await failedPage.route(blocked, route => route.abort())
  await failedPage.goto(base + '/guides/mw3-dark-aether-season-1#map:exits', { waitUntil: 'networkidle' })
  await failedPage.locator('.atlas-image-error').waitFor({ state: 'visible' })
  assert.equal(await failedPage.locator('.atlas-selected-list > li').count(), 2)
  await failedPage.unroute(blocked)
  await failedPage.getByRole('button', { name: 'Try image again', exact: true }).click()
  await failedPage.waitForFunction(() => document.querySelector('.leaflet-image-layer')?.naturalWidth === 4096 && !document.querySelector('.atlas-image-error'))
  assert.equal(await failedPage.locator('.atlas-selected-list > li').count(), 2)
  await failed.close()
  checks.push('Missing artwork retains searchable location details and retry restores the map without losing selection')
} finally { await browser.close() }
} else {
  const previous = JSON.parse(fs.readFileSync(path.join(output, 'verification.json')))
  checks.push(...previous.checks.filter(check => !check.startsWith('Real Electron')))
  screenshots.push(...previous.screenshots.filter(file => !path.basename(file).startsWith('electron-')))
  assert.deepEqual(previous.errors, [])
}

const profile = fs.mkdtempSync(path.resolve('.cache/mw3-maps-native-'))
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
  throw Error('Native map did not become ready: ' + expression.toString())
}
async function nativeShot(name, width, height) {
  const buffer = await app.evaluate(async ({ BrowserWindow, webContents }, size) => {
    const window = BrowserWindow.getAllWindows()[0]
    window.setSize(size.width, size.height)
    for (const guest of webContents.getAllWebContents().filter(contents => contents.getType() === 'webview')) {
      // Warm hidden-window layout at the new size before framing the map.
      await guest.capturePage()
      await guest.executeJavaScript("document.querySelector('.guide-map-view').scrollIntoView({ behavior: 'instant', block: 'start' })")
      await guest.capturePage()
    }
    await window.webContents.capturePage()
    await new Promise(resolve => setTimeout(resolve, 250))
    return (await window.webContents.capturePage()).toPNG().toString('base64')
  }, { width, height })
  const file = path.join(output, name + '.png')
  fs.writeFileSync(file, Buffer.from(buffer, 'base64')); screenshots.push(file)
}
try {
  await host.waitForFunction(() => !!window.CW_LIBRARY)
  await host.locator('#nav-game').selectOption('mw3')
  assert.match(await host.locator('#nav-game-info').textContent(), /5 maps.*photo finder/)
  await host.locator('[data-id="mw3-urzikstan"]').click()
  await waitGuest(() => !!document.getElementById('__nuxt')?.__vue_app__ && document.readyState === 'complete')
  await guest(() => { Array.from(document.querySelectorAll('.reading-switch button')).find(button => button.textContent === 'Map').click(); return true })
  await waitGuest(() => !!document.querySelector('.atlas .leaflet-image-layer')?.complete && document.querySelector('.atlas .leaflet-image-layer').naturalWidth === 4096)
  const before = await guest(() => document.querySelector('.leaflet-image-layer').getBoundingClientRect().width)
  const zoom = await guest(() => { const r = document.querySelector('[aria-label="Zoom in"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
  // A hidden test window cannot route host CDP mouse input into a guest widget.
  // Send native Electron pointer events to the actual webview WebContents.
  await app.evaluate(({ webContents }, point) => {
    const view = webContents.getAllWebContents().find(contents => contents.getType() === 'webview')
    const position = { x: Math.round(point.x), y: Math.round(point.y) }
    view.sendInputEvent({ type: 'mouseMove', ...position })
    view.sendInputEvent({ type: 'mouseDown', ...position, button: 'left', clickCount: 1 })
    view.sendInputEvent({ type: 'mouseUp', ...position, button: 'left', clickCount: 1 })
  }, zoom)
  await waitGuest(width => document.querySelector('.leaflet-image-layer').getBoundingClientRect().width > width, before)
  assert.ok(await guest(() => document.querySelector('.leaflet-image-layer').getBoundingClientRect().width) > before, 'Actual Electron pointer click zooms the guest map')
  await nativeShot('electron-urzikstan-desktop', 1440, 920)
  await host.locator('[data-id="mw3-dark-aether-season-5"]').click()
  await waitGuest(() => location.pathname.endsWith('mw3-dark-aether-season-5') && !!document.getElementById('__nuxt')?.__vue_app__)
  await guest(() => { document.getElementById('guide-step-mw5-cosmos-spore').querySelector('.show-on-map').click(); return true })
  await waitGuest(() => decodeURIComponent(location.hash) === '#map:cosmos-maze' && document.querySelector('.leaflet-image-layer')?.naturalWidth === 4096)
  assert.match(await guest(() => document.querySelector('.atlas-selection').textContent), /Elder-only/)
  await nativeShot('electron-season5-minimum', 760, 620)
  assert.equal(await guest(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true)
  await guest(() => { document.querySelector('.atlas-heading button').click(); return true })
  await waitGuest(() => location.hash === '#guide-step-mw5-cosmos-spore')
  assert.deepEqual(await guest(() => [typeof window.cw, typeof require, typeof process]), ['undefined', 'undefined', 'undefined'])
  checks.push('Real Electron maps load, respond to native pointer zoom, survive minimum sizing and return to the guide with native isolation intact')
} finally { await app.close() }
assert.deepEqual(errors, [])
const report = { base, checkedAt: new Date().toISOString(), checks, screenshots, errors }
fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
