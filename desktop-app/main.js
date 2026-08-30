const { app, BrowserWindow, Menu, shell, ipcMain, webContents } = require('electron')
const path = require('path')
const fs = require('fs')

const SITE = 'https://codguides.wolden.eu'
const HOME = SITE + '/'
const nav = require('./renderer/nav.js')

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

// returns true if the key was handled (caller should preventDefault)
function handleKey (wc, input) {
  if (input.type !== 'keyDown') return false
  const target = wc.getType() === 'webview' ? wc : webviews.get(wc.id)
  if (!target) return false
  const ctrl = input.control || input.meta
  const key = (input.key || '').toLowerCase()
  if (ctrl && /^[1-9]$/.test(key)) {
    const it = nav[+key - 1]
    if (!it) return false
    if (it.external) shell.openExternal(it.url)
    else target.loadURL(SITE + it.url)
    return true
  }
  if (ctrl && key === 'h') { target.loadURL(HOME); return true }
  if (key === 'f5' || (ctrl && key === 'r')) { target.reload(); return true }
  if (input.alt && key === 'arrowleft') { if (target.canGoBack()) target.goBack(); return true }
  if (input.alt && key === 'arrowright') { if (target.canGoForward()) target.goForward(); return true }
  if (ctrl && (key === '=' || key === '+')) { zoom(target, 0.5); return true }
  if (ctrl && key === '-') { zoom(target, -0.5); return true }
  if (ctrl && key === '0') { target.setZoomLevel(0); return true }
  if (ctrl && input.shift && key === 'i') { target.toggleDevTools(); return true }
  if (key === 'f12') { target.toggleDevTools(); return true }
  return false
}

app.on('web-contents-created', (e, wc) => {
  if (wc.getType() === 'webview') {
    const host = wc.hostWebContents
    if (host) webviews.set(host.id, wc)
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
      if (!params.editFlags || (!params.mediaType && !params.linkURL && params.x === 0 && params.y === 0 && !params.isEditable)) {
        // empty area: still allow paste/copy basics
      }
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
    wv.loadURL(SITE + '/guides/rex-infernus')
    await sleep(9000)
    await shot('2-guide')
    wv.loadURL(SITE + '/tools/kowakujo-clock-solver.html')
    await sleep(5000)
    await shot('3-tool')
    console.log('CW_TEST_DONE')
  } catch (err) {
    console.error('CW_TEST_FAIL', err)
  } finally {
    app.exit(0)
  }
}

app.on('window-all-closed', () => app.quit())
