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

  let settings = null
  let capturing = null // actionId being recorded
  let captureHandler = null

  const allActions = () => [
    ...window.NAV.filter((n) => !n.external).map((n) => ({ id: 'nav:' + n.id, label: n.label, group: n.section, navItem: n })),
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
    const ordered = settings.order.map((id) => window.NAV.find((n) => n.id === id)).filter(Boolean)
    ordered.forEach((item, idx) => {
      const row = document.createElement('div')
      row.className = 'sp-nav-row' + (settings.hidden.includes(item.id) ? ' hidden-item' : '')
      const up = document.createElement('button')
      up.className = 'sp-btn icon'
      up.textContent = '↑'
      up.disabled = idx === 0
      up.addEventListener('click', () => move(idx, -1))
      const down = document.createElement('button')
      down.className = 'sp-btn icon'
      down.textContent = '↓'
      down.disabled = idx === ordered.length - 1
      down.addEventListener('click', () => move(idx, 1))
      const chk = document.createElement('input')
      chk.type = 'checkbox'
      chk.checked = !settings.hidden.includes(item.id)
      chk.title = 'Show in sidebar'
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
      inp.value = settings.labels[item.id] !== undefined ? settings.labels[item.id] : item.label
      inp.placeholder = item.label
      inp.addEventListener('change', () => {
        const v = inp.value.trim()
        if (v && v !== item.label) settings.labels[item.id] = v
        else delete settings.labels[item.id]
        persist()
      })
      row.append(up, down, chk, icon, inp)
      navListEl.appendChild(row)
    })
  }

  function move (idx, delta) {
    const order = [...settings.order]
    const j = idx + delta
    if (j < 0 || j >= order.length) return
    ;[order[idx], order[j]] = [order[j], order[idx]]
    settings.order = order
    persist()
    renderNavList()
  }

  function persist () {
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
    panel.hidden = false
    document.getElementById('webview').style.visibility = 'hidden'
    renderShortcuts()
    renderNavList()
    selZoom.value = String(settings.startZoom || 0)
    chkRestore.checked = settings.restoreLastPage !== false
  }
  function close () {
    stopCapture()
    panel.hidden = true
    document.getElementById('webview').style.visibility = 'visible'
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
    const fresh = await window.cw.getSettings() // refetch
    const defaults = {}
    for (const it of window.NAV) if (it.accel) defaults['nav:' + it.id] = it.accel
    for (const s of window.SYSTEM_ACTIONS) defaults[s.id] = s.accel
    settings.shortcuts = defaults
    persist()
    renderShortcuts()
  })

  window.cw.onOpenSettings(() => {
    if (!panel.hidden) close()
    else open()
  })
  window.cw.onSettingsChanged((s) => { settings = s })

  // load initial settings; keep a reference for app.js
  window.cw.getSettings().then((s) => {
    settings = s
    window.CW_SETTINGS = s
    document.dispatchEvent(new CustomEvent('cw-settings-ready'))
  })
})()
