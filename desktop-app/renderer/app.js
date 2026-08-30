const SITE = 'https://codguides.wolden.eu'
const SITE_HOST = 'codguides.wolden.eu'

const webview = document.getElementById('webview')
const navEl = document.getElementById('nav')
const address = document.getElementById('address')
const progress = document.getElementById('progress')
const btnBack = document.getElementById('btn-back')
const btnFwd = document.getElementById('btn-fwd')

let lastSiteUrl = localStorage.getItem('cw-last') || SITE + '/'
let errorPageShown = false

const EXTRA_EXTERNAL = {
  section: 'tools',
  label: 'Uranium Pincers',
  icon: '🕸️',
  url: 'https://cod-zombies.com/tools/uranium-pincers',
  external: true
}

/* ---------- build sidebar ---------- */
function makeItem (item) {
  const el = document.createElement('div')
  el.className = 'nav-item'
  el.dataset.url = item.url
  if (item.thumb) {
    const img = document.createElement('img')
    img.className = 'thumb'
    img.src = SITE + item.thumb
    img.addEventListener('error', () => {
      const s = document.createElement('span')
      s.className = 'ico'
      s.textContent = item.icon
      img.replaceWith(s)
    })
    el.appendChild(img)
  } else {
    const s = document.createElement('span')
    s.className = 'ico'
    s.textContent = item.icon
    el.appendChild(s)
  }
  const label = document.createElement('span')
  label.textContent = item.label
  el.appendChild(label)
  if (item.external) {
    const ext = document.createElement('span')
    ext.className = 'ext'
    ext.textContent = '↗'
    el.appendChild(ext)
  }
  el.addEventListener('click', () => {
    if (item.external) {
      window.cw.openExternal(item.url)
    } else {
      webview.loadURL(SITE + item.url)
    }
  })
  return el
}

let section = null
for (const item of window.NAV) {
  if (item.section !== section) {
    section = item.section
    const lab = document.createElement('div')
    lab.className = 'nav-label'
    lab.textContent = section === 'guides' ? 'Guides' : 'Tools'
    navEl.appendChild(lab)
  }
  navEl.appendChild(makeItem(item))
}
{
  const lab = document.createElement('div')
  lab.className = 'nav-label'
  lab.textContent = 'More'
  navEl.appendChild(lab)
  navEl.appendChild(makeItem(EXTRA_EXTERNAL))
}

/* ---------- helpers ---------- */
function setActive (url) {
  if (!url.startsWith(SITE)) return
  let path = url.slice(SITE.length)
  const q = path.indexOf('?')
  if (q !== -1) path = path.slice(0, q)
  if (path === '' || path === '/') path = '/'
  const items = navEl.querySelectorAll('.nav-item')
  items.forEach((el) => {
    const u = el.dataset.url
    el.classList.toggle('active', u !== undefined && (SITE + u === SITE + path || (u !== '/' && path.startsWith(u))))
  })
}

function updateButtons () {
  btnBack.disabled = !webview.canGoBack()
  btnFwd.disabled = !webview.canGoForward()
}

function showError (desc) {
  errorPageShown = true
  const html = '<!doctype html><html><body style="background:#0a0a0c;color:#e5e7eb;font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0">' +
    '<div style="font-size:44px">⚠️</div>' +
    '<h1 style="color:#f59e0b;font-size:22px;margin:12px 0 6px">Can\'t reach CodWiki</h1>' +
    '<p style="color:#9ca3af;margin:0 0 20px">' + (desc || 'Network error') + '</p>' +
    '<a href="' + SITE + '/" style="background:#f59e0b;color:#18181b;padding:10px 22px;border-radius:10px;text-decoration:none;font-weight:600">Retry</a>' +
    '</body></html>'
  webview.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
}

/* ---------- webview events ---------- */
webview.addEventListener('did-start-loading', () => { progress.style.display = 'block' })
webview.addEventListener('did-stop-loading', () => { progress.style.display = 'none' })

webview.addEventListener('did-navigate', (e) => {
  errorPageShown = false
  const url = e.url
  if (url.startsWith(SITE)) {
    lastSiteUrl = url
    localStorage.setItem('cw-last', url)
  }
  try {
    const u = new URL(url)
    address.textContent = u.host + (u.pathname === '/' ? '' : u.pathname)
  } catch (_) {
    address.textContent = url
  }
  setActive(url)
  updateButtons()
})

webview.addEventListener('did-navigate-in-page', (e) => {
  const url = e.url
  if (url.startsWith(SITE)) {
    lastSiteUrl = url
    localStorage.setItem('cw-last', url)
  }
  setActive(url)
  updateButtons()
})

webview.addEventListener('did-fail-load', (e) => {
  if (e.isMainFrame && e.errorCode !== -3 && !errorPageShown) {
    showError(e.errorDescription || 'Network error')
  }
})

webview.addEventListener('page-title-updated', (e) => {
  document.title = e.title ? e.title + ' — CodWiki' : 'CodWiki'
})

/* ---------- topbar buttons ---------- */
btnBack.addEventListener('click', () => { if (webview.canGoBack()) webview.goBack() })
btnFwd.addEventListener('click', () => { if (webview.canGoForward()) webview.goForward() })
document.getElementById('btn-reload').addEventListener('click', () => webview.reload())
document.getElementById('btn-home').addEventListener('click', () => webview.loadURL(SITE + '/'))
document.getElementById('open-browser').addEventListener('click', () => window.cw.openExternal(lastSiteUrl))

/* ---------- restore last page ---------- */
if (lastSiteUrl.startsWith(SITE)) {
  webview.loadURL(lastSiteUrl)
}
