const { app, BrowserWindow, Menu, shell, ipcMain, webContents, net } = require('electron')
const path = require('path')
const fs = require('fs')

const { siteForDevelopment, isInternal, isExternalUrl, migrateSettings, matchAccel } = require('./runtime')
const { createCatalogueManifest, createCatalogueManager } = require('./catalogue')
const { createUpdateChecker } = require('./updates')
const SITE = siteForDevelopment(process.env.CW_SITE_URL, app.isPackaged)
const HOME = SITE + '/'
const bundledNav = require('./renderer/nav.js')
let nav = bundledNav
const SYSTEM_ACTIONS = bundledNav.SYSTEM_ACTIONS || []
let library = null, updates = null

const isTest = !!process.env.CW_TEST
if (isTest && process.env.CW_TEST_USER_DATA) app.setPath('userData', path.resolve(process.env.CW_TEST_USER_DATA))
if (process.platform === 'linux' && (isTest || (typeof process.getuid === 'function' && process.getuid() === 0))) {
  app.commandLine.appendSwitch('no-sandbox')
}
if (isTest) {
  app.commandLine.appendSwitch('disable-gpu')
  app.disableHardwareAcceleration()
}

app.setAppUserModelId('eu.wolden.codguides')
Menu.setApplicationMenu(null)

let win = null
const webviews = new Map() // hostWebContents id -> webview webContents

/* ---------------- settings ---------------- */
let settings = migrateSettings({}, nav, SYSTEM_ACTIONS)
function settingsPath () {
  try { return path.join(app.getPath('userData'), 'codwiki-settings.json') } catch (_) { return null }
}
function loadSettings () {
  const p = settingsPath()
  if (!p || !fs.existsSync(p)) return
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'))
    settings = migrateSettings(raw, nav, SYSTEM_ACTIONS)
  } catch (err) {
    console.error('settings load failed:', err.message)
  }
}
function applyLibrary(snapshot) {
  nav = snapshot.catalogue.entries
  settings = migrateSettings(settings, nav, SYSTEM_ACTIONS)
  for (const wc of webContents.getAllWebContents()) if (wc.getType() === 'window') wc.send('cw:library-changed', snapshot)
  saveSettings({})
}
function saveSettings (next) {
  settings = {
    ...settings,
    ...next,
    shortcuts: { ...settings.shortcuts, ...(next.shortcuts || {}) },
    order: Array.isArray(next.order) && next.order.length ? next.order : settings.order,
    hidden: Array.isArray(next.hidden) ? next.hidden : settings.hidden,
    labels: next.labels && typeof next.labels === 'object' ? next.labels : settings.labels
  }
  const p = settingsPath()
  if (p) {
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true })
      fs.writeFileSync(p, JSON.stringify(settings, null, 2))
    } catch (err) { console.error('settings save failed:', err.message) }
  }
  // live-broadcast to every renderer (sidebar rebuild etc.)
  for (const wc of webContents.getAllWebContents()) {
    if (wc.getType() !== 'window') continue
    try { wc.send('cw:settings-changed', settings) } catch (_) {}
  }
}

/* ---------------- key handling ---------------- */
function dispatchAction (actionId, target) {
  if (actionId.startsWith('nav:')) {
    const id = actionId.slice(4)
    const it = nav.find((n) => n.id === id)
    if (!it) return false
    if (it.external && isExternalUrl(it.url)) shell.openExternal(it.url)
    else target.loadURL(SITE + it.url).catch(() => {})
    return true
  }
  switch (actionId) {
    case 'sys-home': target.loadURL(HOME).catch(() => {}); return true
    case 'sys-reload': target.reload(); return true
    case 'sys-back': if (target.canGoBack()) target.goBack(); return true
    case 'sys-forward': if (target.canGoForward()) target.goForward(); return true
    case 'sys-zoom-in': zoom(target, 0.5); return true
    case 'sys-zoom-out': zoom(target, -0.5); return true
    case 'sys-zoom-reset': target.setZoomLevel(Number(settings.startZoom) || 0); return true
    case 'sys-devtools': target.toggleDevTools(); return true
    case 'sys-settings':
      if (win && !win.isDestroyed()) win.webContents.send('cw:open-settings')
      return true
    default: return false
  }
}

function handleKey (wc, input) {
  if (input.type !== 'keyDown') return false
  const target = wc.getType() === 'webview' ? wc : webviews.get(wc.id)
  if (!target) return false
  for (const [actionId, accel] of Object.entries(settings.shortcuts)) {
    if (accel && matchAccel(accel, input)) return dispatchAction(actionId, target)
  }
  return false
}

function webviewFor (winObj) {
  if (!winObj) return null
  return webviews.get(winObj.webContents.id) || null
}

function allowed (url) {
  return isInternal(url, SITE) || url === 'about:blank' || url.startsWith('data:text/html')
}

// navigate in place for same-site, system browser for anything else
function openUrl (target, url) {
  if (allowed(url)) target.loadURL(url).catch(() => {})
  else if (isExternalUrl(url)) shell.openExternal(url)
}

function zoom (target, delta) {
  const lvl = target.getZoomLevel()
  target.setZoomLevel(Math.max(-5, Math.min(8, lvl + delta)))
}

app.on('web-contents-created', (e, wc) => {
  if (wc.getType() === 'webview') {
    wc.setWindowOpenHandler(({ url }) => {
      openUrl(wc, url)
      return { action: 'deny' }
    })
    wc.on('will-navigate', (ev, url) => {
      if (!allowed(url)) {
        ev.preventDefault()
        if (isExternalUrl(url)) shell.openExternal(url)
      }
    })
    wc.on('context-menu', (ev, params) => {
      const items = []
      if (params.linkURL) {
        if (isExternalUrl(params.linkURL)) items.push({ label: 'Open Link in Browser', click: () => shell.openExternal(params.linkURL) })
        items.push({ label: 'Copy Link Address', click: () => require('electron').clipboard.writeText(params.linkURL) })
        items.push({ type: 'separator' })
      }
      if (params.isEditable) {
        items.push({ role: 'cut', enabled: params.editFlags.canCut })
        items.push({ role: 'copy', enabled: params.editFlags.canCopy })
        items.push({ role: 'paste', enabled: params.editFlags.canPaste })
        items.push({ role: 'selectAll', enabled: params.editFlags.canSelectAll })
      } else if (!params.linkURL) {
        items.push({ role: 'copy', enabled: params.editFlags.canCopy })
        if (params.editFlags.canPaste) items.push({ role: 'paste' })
      }
      if (items.length) {
        const Menu = require('electron').Menu
        Menu.buildFromTemplate(items).popup({ window: BrowserWindow.fromWebContents(wc.hostWebContents) || win })
      }
    })
    wc.on('before-input-event', (ev, input) => {
      if (handleKey(wc, input)) ev.preventDefault()
    })
  } else if (wc.getType() === 'window') {
    wc.on('before-input-event', (ev, input) => {
      if (handleKey(wc, input)) ev.preventDefault()
    })
  }
})

function createWindow () {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 760,
    minHeight: 620,
    backgroundColor: '#111214',
    title: 'CodWiki',
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: false,
    ...(process.platform === 'win32'
      ? { titleBarStyle: 'hidden', titleBarOverlay: { color: '#1c1e22', symbolColor: '#b4b7bd', height: 48 } }
      : {}),
    webPreferences: {
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      ...(isTest ? { backgroundThrottling: false } : {})
    }
  })
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
  win.webContents.on('will-attach-webview', (event, preferences, params) => {
    if (!isInternal(params.src, SITE) && params.src !== 'about:blank') { event.preventDefault(); return }
    preferences.preload = path.join(__dirname, 'webview-preload.js')
    preferences.nodeIntegration = false
    preferences.contextIsolation = true
    preferences.sandbox = true
  })
  win.webContents.on('did-attach-webview', (event, guest) => {
    const hostId = win.webContents.id
    webviews.set(hostId, guest)
    guest.setZoomLevel(Number(settings.startZoom) || 0)
    guest.once('destroyed', () => { if (webviews.get(hostId) === guest) webviews.delete(hostId) })
  })
  win.webContents.on('will-navigate', event => event.preventDefault())
  win.webContents.setWindowOpenHandler(({ url }) => { if (isExternalUrl(url)) shell.openExternal(url); return { action: 'deny' } })
  win.once('ready-to-show', () => { if (!isTest || process.env.CW_TEST_SHOW === '1') win.show() })
  win.on('focus', () => { if (library) void library.refresh() })
  win.on('closed', () => { win = null })
}

function hostOnly(event) {
  if (!win || event.sender !== win.webContents || (event.senderFrame && event.senderFrame !== win.webContents.mainFrame)) throw new Error('Untrusted IPC sender')
}
ipcMain.handle('cw:runtime', event => { hostOnly(event); return { site: SITE, version: app.getVersion() } })
ipcMain.handle('cw:open-external', (e, url) => {
  hostOnly(e)
  if (isExternalUrl(url)) shell.openExternal(url)
})
ipcMain.handle('cw:get-settings', event => { hostOnly(event); return settings })
ipcMain.handle('cw:set-settings', (e, patch) => {
  hostOnly(e)
  saveSettings(patch || {})
  return settings
})
ipcMain.handle('cw:get-library', event => { hostOnly(event); return library.get() })
ipcMain.handle('cw:refresh-library', event => { hostOnly(event); return library.refresh(true) })
ipcMain.handle('cw:get-update', event => { hostOnly(event); return updates.get() })
ipcMain.handle('cw:check-update', event => { hostOnly(event); return updates.check(true) })

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }
  })
  app.whenReady().then(() => {
    library = createCatalogueManager({ bundled: createCatalogueManifest(bundledNav, bundledNav.games), site: SITE, cachePath: path.join(app.getPath('userData'), 'codwiki-library-v1.json'), fetchResponse: (url, options) => net.fetch(url, options), onChange: applyLibrary })
    nav = library.get().catalogue.entries
    updates = createUpdateChecker({ version: app.getVersion(), fetchResponse: (url, options) => net.fetch(url, options) })
    loadSettings()
    createWindow()
    void library.refresh()
    if (process.env.CW_TEST_TOUR === '1') runTestTour()
  })
}

async function runTestTour () {
  const shots = process.env.CW_SHOT_DIR || '/tmp/cw-shots'
  fs.mkdirSync(shots, { recursive: true })
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const shot = async (name) => {
    const img = await win.webContents.capturePage()
    fs.writeFileSync(path.join(shots, name + '.png'), img.toPNG())
    console.log('CW_SHOT ' + name)
  }
  try {
    await sleep(8000) // home loads
    await shot('1-home')
    const wv = webviewFor(win)
    if (!wv) throw new Error('no webview found')
    wv.loadURL(SITE + '/tools/kowakujo-clock-solver.html')
    await sleep(5000)
    await shot('2-tool')
    win.webContents.send('cw:open-settings')
    await sleep(2000)
    await shot('3-settings')
    console.log('CW_TEST_DONE')
  } catch (err) {
    console.error('CW_TEST_FAIL', err)
  } finally {
    app.exit(0)
  }
}

app.on('window-all-closed', () => app.quit())
