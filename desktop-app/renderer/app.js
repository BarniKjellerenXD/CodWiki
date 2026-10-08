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
function navigate(url) {
  if (isSite(url)) lastSiteUrl = url
  errorPageShown = false
  webview.loadURL(url).catch(() => {}) // did-fail-load provides the recovery UI.
}

/* ---------- companion navigation ---------- */
const { filterNavigation, navigationForRoute, resolveNavigationGame } = window.CW_NAVIGATION
const gameSelect = document.getElementById('nav-game')
const searchInput = document.getElementById('nav-search')
const searchClear = document.getElementById('nav-search-clear')
const searchStatus = document.getElementById('nav-search-status')
const emptyNav = document.getElementById('nav-empty')
const startUrl = settings?.restoreLastPage !== false && isSite(lastSiteUrl) ? lastSiteUrl : SITE + '/'
let selectedGame = resolveNavigationGame(window.NAV, localStorage.getItem('cw-nav-selected-game'), startUrl)
let activeItem = navigationForRoute(window.NAV, startUrl)

function populateGames() {
gameSelect.replaceChildren()
for (const planned of [false, true]) {
  const group = document.createElement('optgroup')
  group.label = planned ? 'Guides planned' : 'Guides available'
  for (const game of window.NAV_GAMES.filter(game => game.planned === planned)) {
    const option = document.createElement('option')
    option.value = game.id
    option.textContent = game.name
    group.appendChild(option)
  }
  if (group.children.length) gameSelect.appendChild(group)
}
gameSelect.value = selectedGame
}
populateGames()
function selectGame(id) {
  selectedGame = id
  gameSelect.value = id
  localStorage.setItem('cw-nav-selected-game', id)
}
gameSelect.addEventListener('change', () => {
  selectGame(gameSelect.value)
  searchInput.value = ''
  buildSidebar()
  navEl.scrollTop = 0
})
function clearSearch() {
  searchInput.value = ''
  buildSidebar()
  searchInput.focus()
}
searchInput.addEventListener('input', buildSidebar)
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Escape' && searchInput.value) { event.preventDefault(); clearSearch() }
  if (event.key === 'Enter' && searchInput.value.trim()) {
    const first = navEl.querySelector('.nav-item')
    if (first) { event.preventDefault(); first.click() }
  }
})
searchClear.addEventListener('click', clearSearch)
const collapse = document.getElementById('btn-sidebar')
function setCollapsed(value) { document.body.classList.toggle('sidebar-collapsed',value); collapse.setAttribute('aria-expanded',String(!value)); localStorage.setItem('cw-sidebar-collapsed',String(value)) }
collapse.addEventListener('click',()=>setCollapsed(!document.body.classList.contains('sidebar-collapsed')))
setCollapsed(localStorage.getItem('cw-sidebar-collapsed')==='true')
webview.addEventListener('ipc-message',event=>{
 if(event.channel==='cw-theme' && ['archive','midnight','forest','ember','paper'].includes(event.args[0]) && isSite(webview.getURL())) document.documentElement.dataset.theme=event.args[0]
})

/* Saved custom labels, visibility and tool order remain authoritative. */
function effectiveGroups () {
  const hidden = Array.isArray(settings?.hidden) ? settings.hidden : []
  const labels = settings?.labels || {}
  return window.groupNavigation(window.NAV, settings?.order || []).map(group => ({
    ...group,
    items: group.items.filter(item => !hidden.includes(item.id)).map(item => ({ ...item, label: labels[item.id] || item.label }))
  })).filter(group => group.items.length)
}

function chevron() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'm9 5 7 7-7 7')
  svg.appendChild(path)
  return svg
}

function makeItem(item, direct = false) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'nav-item nav-' + item.kind + (direct ? ' nav-direct' : '')
  el.dataset.id = item.id
  el.dataset.navFocus = 'item:' + item.id
  el.dataset.url = item.url
  const active = item.id === activeItem?.id
  el.classList.toggle('active', active)
  if (active) el.setAttribute('aria-current', 'page')
  el.setAttribute('aria-label', item.gameName + ': ' + item.section + ': ' + item.label)
  const copy = document.createElement('span')
  copy.className = 'nav-item-copy'
  const label = document.createElement('span')
  label.textContent = direct ? item.section : item.label
  copy.appendChild(label)
  if (direct) {
    const detail = document.createElement('small')
    detail.textContent = item.status === 'planned'
      ? (item.label === 'Map entry · guide planned' ? 'Guide planned' : item.label + ' · Guide planned')
      : item.label === 'Guide' ? 'Open guide' : item.label
    copy.appendChild(detail)
  }
  el.append(copy, chevron())
  el.addEventListener('click', () => navigate(SITE + item.url))
  return el
}

const subgroupNames = {
  chronicles: 'Zombies Chronicles',
  survival: 'Survival & extra modes',
  'tortured-path': 'The Tortured Path',
  rifts: 'Dark Aether & rifts',
}
function buildSidebar() {
  const focusKey = navEl.contains(document.activeElement) ? document.activeElement.dataset.navFocus : null
  navEl.replaceChildren()
  const query = searchInput.value.trim()
  const allGroups = effectiveGroups()
  const groups = filterNavigation(allGroups, selectedGame, query)
  const maps = window.NAV.filter(item => item.game === selectedGame && item.kind === 'guide')
  const planned = maps.filter(map => map.status === 'planned').length
  const tools = window.NAV.filter(item => item.game === selectedGame && item.kind === 'tool').length
  const units = selectedGame === 'mw3' ? 'destinations' : selectedGame === 'ww2' ? 'maps & modes' : 'maps'
  document.getElementById('nav-game-info').textContent = `${maps.length} ${units} · ${planned === maps.length ? 'Guides planned' : tools + ' tools'}`
  searchClear.hidden = !searchInput.value
  searchStatus.textContent = query ? `${groups.reduce((count, group) => count + group.items.length, 0)} results across all games` : ''
  emptyNav.hidden = groups.length > 0
  emptyNav.textContent = query ? 'No matches. Try a map, game or tool name.' : 'All entries for this game are hidden. Show them in Settings → Sidebar.'
  let lastGame = ''
  let lastGroup = null
  for (const group of groups) {
    if (query && group.game !== lastGame) {
      const heading = document.createElement('h2')
      heading.className = 'nav-search-game'
      heading.textContent = group.gameName
      navEl.appendChild(heading)
      lastGame = group.game
      lastGroup = null
    }
    if (!query && group.group !== lastGroup) {
      const title = subgroupNames[group.group] || (group.game === 'bo3' ? 'Original maps' : '')
      if (title) {
        const heading = document.createElement('h2')
        heading.className = 'nav-subgroup-title'
        heading.textContent = title
        navEl.appendChild(heading)
      }
      lastGroup = group.group
    }
    if (group.items.length === 1 && group.items[0].kind === 'guide') {
      navEl.appendChild(makeItem(group.items[0], true))
      continue
    }
    const map = document.createElement('details')
    map.className = 'nav-map'
    map.open = !!query || group.items.some(item => item.id === activeItem?.id) || localStorage.getItem('cw-nav-map-' + group.id) === 'true'
    map.addEventListener('toggle', () => {
      if (map.isConnected && !searchInput.value.trim()) localStorage.setItem('cw-nav-map-' + group.id, String(map.open))
    })
    const label = document.createElement('summary')
    label.className = 'nav-label'
    label.dataset.navFocus = 'map:' + group.id
    const name = document.createElement('span')
    name.textContent = group.name
    label.append(name, chevron())
    map.appendChild(label)
    for (const item of group.items) map.appendChild(makeItem(item))
    navEl.appendChild(map)
  }
  if (focusKey) {
    Array.from(navEl.querySelectorAll('[data-nav-focus]'))
      .find(element => element.dataset.navFocus === focusKey)?.focus({ preventScroll: true })
  }
}
buildSidebar()
function applyCatalogue(snapshot) {
  const { catalogue } = snapshot
  if (window.CW_LIBRARY?.catalogue.revision !== catalogue.revision) {
    window.NAV.splice(0, window.NAV.length, ...catalogue.entries)
    window.NAV_GAMES.splice(0, window.NAV_GAMES.length, ...catalogue.games)
    if (!window.NAV_GAMES.some(game => game.id === selectedGame)) selectedGame = resolveNavigationGame(window.NAV, null, lastSiteUrl)
    activeItem = navigationForRoute(window.NAV, lastSiteUrl)
    populateGames()
    buildSidebar()
  }
  window.CW_LIBRARY = snapshot
  document.getElementById('library-state').textContent = snapshot.source === 'live' ? (snapshot.state === 'current' ? 'Library current' : 'Last loaded library') : snapshot.source === 'saved' ? 'Saved library' : 'Included library'
  document.dispatchEvent(new CustomEvent('cw-library-applied', { detail: snapshot }))
}
window.cw.onLibraryChanged(applyCatalogue)
applyCatalogue(await window.cw.getLibrary())
window.cw.onSettingsChanged(s => {
  settings = s
  window.CW_SETTINGS = s
  buildSidebar()
})

/* Route changes from web links, back/forward and shortcuts reveal their game. */
function setActive(url) {
  if (!isSite(url)) return
  activeItem = navigationForRoute(window.NAV, url)
  if (activeItem) {
    selectGame(activeItem.game)
    searchInput.value = ''
  }
  buildSidebar()
  navEl.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
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
    '<a href="' + new URL(isSite(lastSiteUrl) ? lastSiteUrl : SITE + '/').href.replaceAll('&','&amp;').replaceAll('"','&quot;') + '" style="background:#ddb363;color:#1b1409;padding:10px 22px;border-radius:9px;text-decoration:none;font-weight:600">Retry this page</a>' +
    '</body></html>'
  webview.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html)).catch(() => {})
}

/* ---------- webview events ---------- */
webview.addEventListener('did-start-loading', () => { progress.style.display = 'block' })
webview.addEventListener('will-navigate', event => { if (isSite(event.url)) lastSiteUrl = event.url })
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
    if (isSite(e.validatedURL)) lastSiteUrl = e.validatedURL
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
document.getElementById('btn-home').addEventListener('click', () => navigate(SITE + '/'))
document.getElementById('open-browser').addEventListener('click', () => window.cw.openExternal(lastSiteUrl))

/* ---------- restore last page ---------- */
function restoreStart () {
  const restore = !settings || settings.restoreLastPage !== false
  const url = restore && isSite(lastSiteUrl) ? lastSiteUrl : SITE + '/'
  webview.src = url
}
restoreStart()

})().catch(error => { console.error(error); document.getElementById("address").textContent = "Unable to initialise CodWiki. Restart the app." })
