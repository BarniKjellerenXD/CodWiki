const { app, BrowserWindow, Menu, shell, ipcMain, webContents } = require('electron')
const path = require('path')
const fs = require('fs')

const SITE = 'https://codguides.wolden.eu'
const HOME = SITE + '/'
const nav = require('./renderer/nav.js')
const SYSTEM_ACTIONS = nav.SYSTEM_ACTIONS || []

const isTest = !!process.env.CW_TEST
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
const DEFAULT_SETTINGS = {
  shortcuts: {},
  order: nav.map((it) => it.id),
  hidden: [],
  labels: {},
  startZoom: 0, // Electron zoom level (0 = 100%)
  restoreLastPage: true
}
for (const it of nav) if (it.accel) DEFAULT_SETTINGS.shortcuts['nav:' + it.id] = it.accel
for (const sa of SYSTEM_ACTIONS) DEFAULT_SETTINGS.shortcuts[sa.id] = sa.accel

let settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
function settingsPath () {
  try { return path.join(app.getPath('userData'), 'codwiki-settings.json') } catch (_) { return null }
}
function loadSettings () {
  const p = settingsPath()
  if (!p || !fs.existsSync(p)) return
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'))
    settings = {
      ...JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
      ...raw,
      shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...(raw.shortcuts || {}) },
      order: Array.isArray(raw.order) && raw.order.length ? raw.order : DEFAULT_SETTINGS.order,
      hidden: Array.isArray(raw.hidden) ? raw.hidden : [],
      labels: raw.labels && typeof raw.labels === 'object' ? raw.labels : {}
    }
  } catch (err) {
    console.error('settings load failed:', err.message)
  }
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
    try { wc.send('cw:settings-changed', settings) } catch (_) {}
  }
}

/* ---------------- key handling ---------------- */
function matchAccel (accel, input) {
  if (!accel) return false
  const parts = String(accel).split('+').map((s) => s.trim()).filter(Boolean)
  const keyName = parts[parts.length - 1].toLowerCase()
  const mods = new Set(parts.slice(0, -1).map((m) => m.toLowerCase()))
  let inKey = (input.key || '').toLowerCase()
  if (inKey === 'plus') inKey = '='
  if (inKey !== keyName) return false
  const ctrl = mods.has('ctrl') || mods.has('cmdorctrl')
  const alt = mods.has('alt')
  const shift = mods.has('shift')
  const meta = mods.has('meta') || mods.has('cmd') || mods.has('super')
  return !!input.control === ctrl && !!input.alt === alt && !!input.shift === shift && !!input.meta === meta
}

function dispatchAction (actionId, target) {
  if (actionId.startsWith('nav:')) {
    const id = actionId.slice(4)
    const it = nav.find((n) => n.id === id)
    if (!it) return false
    if (it.external) shell.openExternal(it.url)
    else target.loadURL(SITE + it.url)
    return true
  }
  switch (actionId) {
    case 'sys-home': target.loadURL(HOME); return true
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
  return url.startsWith(SITE) || url.startsWith('data:') || url.startsWith('about:blank')
}

// navigate in place for same-site, system browser for anything else
function openUrl (target, url) {
  if (allowed(url)) target.loadURL(url)
  else shell.openExternal(url)
}

function zoom (target, delta) {
  const lvl = target.getZoomLevel()
  target.setZoomLevel(Math.max(-5, Math.min(8, lvl + delta)))
}

app.on('web-contents-created', (e, wc) => {
  if (wc.getType() === 'webview') {
    const host = wc.hostWebContents
    if (host) webviews.set(host.id, wc)
    wc.on('did-attach-webview', () => {
      const z = Number(settings.startZoom) || 0
      if (z) wc.setZoomLevel(z)
    })
    wc.setWindowOpenHandler(({ url }) => {
      openUrl(wc, url)
      return { action: 'deny' }
    })
    wc.on('will-navigate', (ev, url) => {
      if (!allowed(url)) {
        ev.preventDefault()
        shell.openExternal(url)
      }
    })
    wc.on('context-menu', (ev, params) => {
      const items = []
      if (params.linkURL) {
        items.push({ label: 'Open Link in Browser', click: () => shell.openExternal(params.linkURL) })
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
    minWidth: 980,
    minHeight: 620,
    backgroundColor: '#0a0a0c',
    title: 'CodWiki',
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: false,
    ...(process.platform === 'win32'
      ? { titleBarStyle: 'hidden', titleBarOverlay: { color: '#0a0a0c', symbolColor: '#d4d4d8', height: 40 } }
      : {}),
    webPreferences: {
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
  win.once('ready-to-show', () => win.show())
  win.on('closed', () => { win = null })
}

ipcMain.handle('cw:open-external', (e, url) => {
  if (/^https?:\/\//i.test(url)) shell.openExternal(url)
})
ipcMain.handle('cw:get-settings', () => settings)
ipcMain.handle('cw:set-settings', (e, patch) => {
  saveSettings(patch || {})
  return settings
})

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
    loadSettings()
    createWindow()
    if (isTest) runTestTour()
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
