/* Settings panel logic — loaded before app.js so it can register listeners first. */
;(function () {
  const panel = document.getElementById('settings-panel')
  const btnSettings = document.getElementById('btn-settings')
  const btnClose = document.getElementById('sp-close')
  const listEl = document.getElementById('sp-shortcut-list')
  const navListEl = document.getElementById('sp-nav-list')
  const selZoom = document.getElementById('sp-zoom')
  const chkRestore = document.getElementById('sp-restore')
  const btnReset = document.getElementById('sp-reset-shortcuts')
  const gameFilter = document.getElementById('sp-game')
  function populateGameFilter() {
  const selected = gameFilter.value || 'all'
  gameFilter.replaceChildren(new Option('All games', 'all'))
  for (const game of window.NAV_GAMES) {
    const option = document.createElement('option')
    option.value = game.id
    option.textContent = game.name
    gameFilter.appendChild(option)
  }
  gameFilter.value = Array.from(gameFilter.options).some(option => option.value === selected) ? selected : 'all'
  }
  populateGameFilter()
  gameFilter.addEventListener('change', () => { renderShortcuts(); renderNavList() })

  let settings = null
  let labelsChanged = false
  let capturing = null // actionId being recorded
  let captureHandler = null

  const allActions = () => [
    ...window.NAV.filter((n) => !n.external && (gameFilter.value === 'all' || n.game === gameFilter.value)).map((n) => ({ id: 'nav:' + n.id, label: n.label, group: n.gameName + ' · ' + n.section, navItem: n })),
    ...window.SYSTEM_ACTIONS.map((s) => ({ id: s.id, label: s.label, group: 'App' }))
  ]

  function accelLabel (a) {
    if (!a) return '—'
    return a.replace('ArrowLeft', '←').replace('ArrowRight', '→').replace('ArrowUp', '↑').replace('ArrowDown', '↓')
  }

  function conflictsWith (accel, exceptId) {
    if (!accel) return null
    for (const [aid, a] of Object.entries(settings.shortcuts)) {
      if (aid !== exceptId && a && a.toLowerCase() === accel.toLowerCase()) return aid
    }
    return null
  }

  /* ---------- capture ---------- */
  function startCapture (actionId, badgeEl, rowEl) {
    stopCapture()
    capturing = actionId
    rowEl.classList.add('capturing')
    badgeEl.textContent = 'Press keys…'
    badgeEl.classList.add('recording')
    captureHandler = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Escape') { stopCapture(); renderShortcuts(); return }
      // ignore pure modifier presses
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return
      const parts = []
      if (e.ctrlKey) parts.push('Ctrl')
      if (e.altKey) parts.push('Alt')
      if (e.shiftKey) parts.push('Shift')
      if (e.metaKey) parts.push('Meta')
      let key = e.key
      if (key === ' ') key = 'Space'
      if (/^[a-z]$/i.test(key)) key = key.toUpperCase()
      const accel = [...parts, key].join('+')
      stopCapture()
      const conflict = conflictsWith(accel, actionId)
      if (conflict) {
        flashConflict(rowEl, conflict)
        renderShortcuts()
        return
      }
      settings.shortcuts[actionId] = accel
      persist()
      renderShortcuts()
    }
    window.addEventListener('keydown', captureHandler, true)
  }

  function stopCapture () {
    if (captureHandler) window.removeEventListener('keydown', captureHandler, true)
    captureHandler = null
    capturing = null
    panel.querySelectorAll('.capturing').forEach((el) => el.classList.remove('capturing'))
  }

  function flashConflict (rowEl, conflictId) {
    const other = listEl.querySelector('[data-action="' + conflictId + '"]')
    for (const el of [rowEl, other]) {
      if (!el) continue
      el.classList.add('conflict')
      setTimeout(() => el.classList.remove('conflict'), 1200)
    }
  }

  /* ---------- render ---------- */
  function renderShortcuts () {
    listEl.innerHTML = ''
    let group = null
    for (const act of allActions()) {
      if (act.group !== group) {
        group = act.group
        const h = document.createElement('div')
        h.className = 'sp-group'
        h.textContent = group
        listEl.appendChild(h)
      }
      const row = document.createElement('div')
      row.className = 'sp-sc-row'
      row.dataset.action = act.id
      const name = document.createElement('span')
      name.className = 'sp-sc-name'
      name.textContent = act.label
      const badge = document.createElement('kbd')
      badge.className = 'sp-kbd'
      badge.textContent = accelLabel(settings.shortcuts[act.id])
      const change = document.createElement('button')
      change.className = 'sp-btn'
      change.textContent = 'Change'
      change.addEventListener('click', () => startCapture(act.id, badge, row))
      const clear = document.createElement('button')
      clear.className = 'sp-btn ghost'
      clear.textContent = 'Clear'
      clear.addEventListener('click', () => { settings.shortcuts[act.id] = null; persist(); renderShortcuts() })
      row.append(name, badge, change, clear)
      listEl.appendChild(row)
    }
  }

  function renderNavList () {
    navListEl.innerHTML = ''
    const ordered = window.groupNavigation(window.NAV, settings.order).flatMap(group => group.items)
    let map = null
    ordered.forEach((item, idx) => {
      if (gameFilter.value !== 'all' && item.game !== gameFilter.value) return
      if (item.map !== map) {
        map = item.map
        const heading = document.createElement('div')
        heading.className = 'sp-group'
        heading.textContent = item.gameName + ' · ' + item.section
        navListEl.appendChild(heading)
      }
      const row = document.createElement('div')
      row.className = 'sp-nav-row' + (settings.hidden.includes(item.id) ? ' hidden-item' : '')
      const up = document.createElement('button')
      up.className = 'sp-btn icon'
      up.textContent = '↑'
      up.setAttribute('aria-label', 'Move ' + item.section + ': ' + item.label + ' up')
      up.disabled = item.kind === 'guide' || ordered[idx - 1]?.kind !== 'tool' || ordered[idx - 1]?.map !== item.map
      up.addEventListener('click', () => move(idx, -1))
      const down = document.createElement('button')
      down.className = 'sp-btn icon'
      down.textContent = '↓'
      down.setAttribute('aria-label', 'Move ' + item.section + ': ' + item.label + ' down')
      down.disabled = item.kind === 'guide' || ordered[idx + 1]?.map !== item.map
      down.addEventListener('click', () => move(idx, 1))
      const chk = document.createElement('input')
      chk.type = 'checkbox'
      chk.checked = !settings.hidden.includes(item.id)
      chk.title = 'Show in sidebar'
      chk.setAttribute('aria-label', 'Show ' + item.section + ': ' + item.label + ' in sidebar')
      chk.addEventListener('change', () => {
        if (chk.checked) settings.hidden = settings.hidden.filter((h) => h !== item.id)
        else settings.hidden = [...settings.hidden, item.id]
        persist()
        renderNavList()
      })
      const icon = document.createElement('span')
      icon.className = 'sp-nav-ico'
      icon.textContent = item.icon
      const inp = document.createElement('input')
      inp.type = 'text'
      inp.className = 'sp-nav-label'
      inp.setAttribute('aria-label', 'Label for ' + item.section + ': ' + item.label)
      inp.value = settings.labels[item.id] !== undefined ? settings.labels[item.id] : item.label
      inp.placeholder = item.label
      inp.addEventListener('input', () => {
        const v = inp.value.trim()
        if (v && v !== item.label) settings.labels[item.id] = v
        else delete settings.labels[item.id]
        labelsChanged = true
      })
      inp.addEventListener('change', persist)
      row.append(up, down, chk, icon, inp)
      navListEl.appendChild(row)
    })
  }

  function move (idx, delta) {
    const items = window.groupNavigation(window.NAV, settings.order).flatMap(group => group.items)
    const order = items.map(item => item.id)
    const j = idx + delta
    if (j < 0 || j >= order.length) return
    if (items[idx].kind !== 'tool' || items[j].kind !== 'tool' || items[idx].map !== items[j].map) return
    ;[order[idx], order[j]] = [order[j], order[idx]]
    settings.order = order
    persist()
    renderNavList()
  }

  function persist () {
    labelsChanged = false
    window.cw.saveSettings({
      shortcuts: settings.shortcuts,
      order: settings.order,
      hidden: settings.hidden,
      labels: settings.labels,
      startZoom: settings.startZoom,
      restoreLastPage: settings.restoreLastPage
    })
  }

  /* ---------- open / close ---------- */
  function open () {
    if (!settings) return
    panel.hidden = false
    btnSettings.setAttribute('aria-expanded', 'true')
    document.getElementById('webview').style.visibility = 'hidden'
    renderShortcuts()
    renderNavList()
    selZoom.value = String(settings.startZoom || 0)
    chkRestore.checked = settings.restoreLastPage !== false
    btnClose.focus()
  }
  function close () {
    if (labelsChanged) persist()
    stopCapture()
    panel.hidden = true
    btnSettings.setAttribute('aria-expanded', 'false')
    document.getElementById('webview').style.visibility = 'visible'
    btnSettings.focus()
  }
  function toggle () { panel.hidden ? open() : close() }

  btnSettings.addEventListener('click', toggle)
  btnClose.addEventListener('click', close)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden && capturing === null) close()
  })

  document.querySelectorAll('.sp-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sp-tab').forEach((t) => t.classList.toggle('active', t === tab))
      document.querySelectorAll('.sp-tab-page').forEach((p) => { p.hidden = p.dataset.page !== tab.dataset.tab })
      gameFilter.parentElement.hidden = tab.dataset.tab === 'general'
    })
  })

  selZoom.addEventListener('change', () => {
    settings.startZoom = parseFloat(selZoom.value) || 0
    persist()
  })
  chkRestore.addEventListener('change', () => {
    settings.restoreLastPage = chkRestore.checked
    persist()
  })
  btnReset.addEventListener('click', async () => {
    const defaults = {}
    for (const it of window.NAV) defaults['nav:' + it.id] = it.accel || null
    for (const s of window.SYSTEM_ACTIONS) defaults[s.id] = s.accel
    settings.shortcuts = defaults
    persist()
    renderShortcuts()
  })

  window.cw.onOpenSettings(() => {
    if (!panel.hidden) close()
    else open()
  })
  window.cw.onSettingsChanged((s) => {
    // A library refresh must not replace a label while it is being edited.
    const editingLabels = labelsChanged ? settings.labels : null
    settings = editingLabels ? { ...s, labels: editingLabels } : s
    if (!panel.hidden && !capturing && !labelsChanged) { renderShortcuts(); renderNavList() }
  })
  const libraryStatus = document.getElementById('sp-library-status')
  const refreshLibrary = document.getElementById('sp-library-refresh')
  function showLibrary(snapshot) {
    const catalogue = snapshot.catalogue
    const counts = `${catalogue.games.length} games, ${catalogue.entries.filter(entry => entry.kind === 'guide').length} maps and destinations, ${catalogue.entries.filter(entry => entry.kind === 'tool').length} tools.`
    const source = snapshot.source === 'live' ? (snapshot.state === 'current' || snapshot.state === 'save-failed' ? 'Latest guide list loaded.' : 'Using the last loaded guide list.') : snapshot.source === 'saved' ? 'Using the last saved guide list.' : 'Using the guide list included in this app.'
    const condition = snapshot.state === 'offline' ? ' Could not check for new guides. Try again when the site is available.' : snapshot.state === 'unsupported' ? ' The latest list needs a newer app. Open Windows downloads below.' : snapshot.state === 'save-failed' ? ' This guide list could not be saved for the next start.' : ''
    libraryStatus.textContent = source + ' ' + counts + condition
  }
  document.addEventListener('cw-library-applied', event => {
    showLibrary(event.detail)
    populateGameFilter()
    if (settings && !panel.hidden && !capturing && !labelsChanged) { renderShortcuts(); renderNavList() }
  })
  refreshLibrary.addEventListener('click', async () => {
    refreshLibrary.disabled = true
    libraryStatus.textContent = 'Checking the latest guide list…'
    try { showLibrary(await window.cw.refreshLibrary()) } catch { libraryStatus.textContent = 'Could not check for new guides. Keep using the current list and try again.' }
    finally { refreshLibrary.disabled = false }
  })
  const updateStatus = document.getElementById('sp-app-update-status')
  const checkUpdate = document.getElementById('sp-app-update-check')
  let updateUrl = 'https://github.com/BarniKjellerenXD/CodWiki/releases/latest'
  function showUpdate(update) {
    updateUrl = update.url
    updateStatus.textContent = update.state === 'available' ? `CodWiki ${update.latestVersion} is available. You have ${update.currentVersion}. Open Windows downloads to update.` : update.state === 'current' ? `CodWiki ${update.currentVersion} is up to date.` : update.state === 'unavailable' ? 'Could not check for app updates. Try again or open the official Windows downloads.' : 'Check whether a newer Windows app is available.'
  }
  window.cw.getUpdate().then(showUpdate).catch(() => {})
  checkUpdate.addEventListener('click', async () => {
    checkUpdate.disabled = true
    updateStatus.textContent = 'Checking the latest Windows release…'
    try { showUpdate(await window.cw.checkUpdate()) } catch { updateStatus.textContent = 'Could not check for app updates. Open the official Windows downloads.' }
    finally { checkUpdate.disabled = false }
  })
  document.getElementById('sp-app-update-download').addEventListener('click', () => window.cw.openExternal(updateUrl))

  // load initial settings; keep a reference for app.js
  window.cw.getSettings().then((s) => {
    settings = s
    window.CW_SETTINGS = s
    document.dispatchEvent(new CustomEvent('cw-settings-ready'))
  })
})()
