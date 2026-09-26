const PRODUCTION_SITE = 'https://codguides.wolden.eu'
function siteForDevelopment(value, packaged) {
  if (!value || packaged) return PRODUCTION_SITE
  const url = new URL(value)
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password) throw new Error('CW_SITE_URL must be an HTTP loopback URL')
  return url.origin
}
function isInternal(url, site) {
  try { return new URL(url).origin === site } catch { return false }
}
function mergeOrder(order, entries) {
  const ids = entries.map(item => item.id)
  return [...new Set([...(Array.isArray(order) ? order : []), ...ids])].filter(id => ids.includes(id))
}
function mergeShortcuts(defaults, saved) {
  const previous = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  const result = {}
  const used = new Set(Object.entries(previous)
    .filter(([id, value]) => Object.hasOwn(defaults, id) && typeof value === 'string')
    .map(([, value]) => value.toLowerCase().replace(/\s/g, '')))
  for (const [id, fallback] of Object.entries(defaults)) {
    if (Object.hasOwn(previous, id) && (previous[id] === null || typeof previous[id] === 'string')) {
      result[id] = previous[id]
    } else {
      const key = fallback?.toLowerCase().replace(/\s/g, '')
      result[id] = used.has(key) ? null : fallback
      if (key && result[id]) used.add(key)
    }
  }
  return result
}
function matchAccel(accel, input) {
  if (!accel) return false
  const parts = String(accel).split('+').map(s => s.trim()).filter(Boolean)
  if (!parts.length) return false
  const keyName = parts.pop().toLowerCase()
  const mods = new Set(parts.map(m => m.toLowerCase()))
  let inKey = (input.key || '').toLowerCase()
  // Shift changes Digit1 to "!" on some layouts; numbered navigation still uses 1.
  if (/^[0-9]$/.test(keyName) && /^Digit[0-9]$/.test(input.code || '')) inKey = input.code.slice(-1)
  if (inKey === 'plus') inKey = '='
  if (inKey === ' ') inKey = 'space'
  if (inKey !== keyName) return false
  return !!input.control === (mods.has('ctrl') || mods.has('cmdorctrl')) &&
    !!input.alt === mods.has('alt') && !!input.shift === mods.has('shift') &&
    !!input.meta === (mods.has('meta') || mods.has('cmd') || mods.has('super'))
}
module.exports = { PRODUCTION_SITE, siteForDevelopment, isInternal, mergeOrder, mergeShortcuts, matchAccel }
