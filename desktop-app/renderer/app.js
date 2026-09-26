;(async function () {
const runtime = await window.cw.getRuntime()
const SITE = runtime.site
const SITE_HOST = new URL(SITE).host

const webview = document.getElementById('webview')
const navEl = document.getElementById('nav')
const address = document.getElementById('address')
const progress = document.getElementById('progress')
const btnBack = document.getElementById('btn-back')
const btnFwd = document.getElementById('btn-fwd')

let settings = window.CW_SETTINGS || await window.cw.getSettings()
const lastPageKey = 'cw-last:' + SITE
let lastSiteUrl = localStorage.getItem(lastPageKey) || localStorage.getItem('cw-last') || SITE + '/'
function isSite(url) { try { return new URL(url).origin === SITE } catch { return false } }
document.getElementById('app-version').textContent = 'v' + runtime.version
address.textContent = SITE_HOST
let errorPageShown = false

/* ---------- companion navigation ---------- */
function filterSidebar() {
 const q = document.getElementById('nav-search').value.trim().toLowerCase()
 for(const item of navEl.querySelectorAll('.nav-item')) item.hidden = !!q && !item.textContent.toLowerCase().includes(q) && !item.dataset.map.toLowerCase().includes(q) && !item.dataset.url.includes(q)
 for(const label of navEl.querySelectorAll('.nav-label')) {
  let next=label.nextElementSibling, shown=false
  while(next && !next.classList.contains('nav-label')) { if(!next.hidden) shown=true; next=next.nextElementSibling }
  label.hidden=!shown
 }
}
document.getElementById('nav-search').addEventListener('input',filterSidebar)
const collapse = document.getElementById('btn-sidebar')
function setCollapsed(value) { document.body.classList.toggle('sidebar-collapsed',value); collapse.setAttribute('aria-expanded',String(!value)); localStorage.setItem('cw-sidebar-collapsed',String(value)) }
collapse.addEventListener('click',()=>setCollapsed(!document.body.classList.contains('sidebar-collapsed')))
setCollapsed(localStorage.getItem('cw-sidebar-collapsed')==='true')
webview.addEventListener('ipc-message',event=>{
 if(event.channel==='cw-theme' && ['archive','midnight','forest','ember','paper'].includes(event.args[0]) && isSite(webview.getURL())) document.documentElement.dataset.theme=event.args[0]
})
/* ---------- build sidebar (settings-aware) ---------- */
function effectiveGroups () {
  const hidden = (settings && Array.isArray(settings.hidden)) ? settings.hidden : []
  const labels = (settings && settings.labels) || {}
  return window.groupNavigation(window.NAV, settings?.order || []).map(group => ({
    ...group,
    items: group.items.filter(item => !hidden.includes(item.id)).map(item => ({ ...item, label: labels[item.id] || item.label }))
  })).filter(group => group.items.length)
}

function makeItem (item) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'nav-item nav-' + item.kind
  if (item.id === 'bo7-super-easter-egg') el.classList.add('quest')
  el.dataset.url = item.url
  el.dataset.map = item.section
  el.setAttribute('aria-label', item.section + ': ' + item.label)
  if (item.thumb && item.id !== 'bo7-super-easter-egg') {
    const img = document.createElement('img')
    img.className = 'thumb'
    img.alt = ''
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
    if (item.external) window.cw.openExternal(item.url)
    else webview.loadURL(SITE + item.url)
  })
  return el
}

function buildSidebar () {
  navEl.innerHTML = ''
  for (const group of effectiveGroups()) {
    const lab = document.createElement('h2')
    lab.className = 'nav-label'
    lab.textContent = group.name
    navEl.appendChild(lab)
    for (const item of group.items) navEl.appendChild(makeItem(item))
  }
  filterSidebar()
  setActive(webview.src || lastSiteUrl)
}
buildSidebar()

window.cw.onSettingsChanged((s) => {
  settings = s
  window.CW_SETTINGS = s
  buildSidebar()
})

/* ---------- helpers ---------- */
function setActive (url) {
  if (!isSite(url)) return
  let path = new URL(url).pathname.replace(/\/$/, '') || '/'
  const q = path.indexOf('?')
  if (q !== -1) path = path.slice(0, q)
  if (path === '' || path === '/') path = '/'
  const items = navEl.querySelectorAll('.nav-item')
  items.forEach((el) => {
    const u = el.dataset.url
    const active = u !== undefined && (SITE + u === SITE + path || (u !== '/' && path.startsWith(u)))
    el.classList.toggle('active', active)
    if (active) {
      const changed = el.getAttribute('aria-current') !== 'page'
      el.setAttribute('aria-current', 'page')
      if (changed && !el.hidden) el.scrollIntoView({ block: 'nearest' })
    }
    else el.removeAttribute('aria-current')
  })
}

function updateButtons () {
  btnBack.disabled = !webview.canGoBack()
  btnFwd.disabled = !webview.canGoForward()
}

function showError (desc) {
  errorPageShown = true
  const message = document.createElement('span')
  message.textContent = desc || 'Network error'
  const html = '<!doctype html><html><body style="background:#111214;color:#f2f2f0;font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0">' +
    '<div style="font-size:36px;color:#ddb363">↗</div>' +
    '<h1 style="font-size:24px;margin:16px 0 10px">Can\'t reach Cod Wiki</h1>' +
    '<p style="color:#b4b7bd;margin:0 0 24px">' + message.innerHTML + '</p>' +
    '<a href="' + SITE + '/" style="background:#ddb363;color:#1b1409;padding:10px 22px;border-radius:9px;text-decoration:none;font-weight:600">Retry</a>' +
    '</body></html>'
  webview.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
}

/* ---------- webview events ---------- */
webview.addEventListener('did-start-loading', () => { progress.style.display = 'block' })
webview.addEventListener('did-stop-loading', () => { progress.style.display = 'none' })

function syncNavigation(e) {
  if (e.isMainFrame === false) return
  const url = e.url
  if (isSite(url)) {
    errorPageShown = false
    lastSiteUrl = url
    localStorage.setItem(lastPageKey, url)
    const u = new URL(url)
    address.textContent = u.host + (u.pathname === '/' ? '' : u.pathname)
  }
  setActive(url)
  updateButtons()
}
webview.addEventListener('did-navigate', syncNavigation)
webview.addEventListener('did-navigate-in-page', syncNavigation)

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
function restoreStart () {
  const restore = !settings || settings.restoreLastPage !== false
  const url = restore && isSite(lastSiteUrl) ? lastSiteUrl : SITE + '/'
  webview.src = url
}
restoreStart()

})().catch(error => { console.error(error); document.getElementById("address").textContent = "Unable to initialise CodWiki. Restart the app." })
