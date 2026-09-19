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
module.exports = { PRODUCTION_SITE, siteForDevelopment, isInternal, mergeOrder }
