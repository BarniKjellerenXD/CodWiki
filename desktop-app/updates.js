const { readJsonResponse } = require('./catalogue')
const RELEASE_PAGE = 'https://github.com/BarniKjellerenXD/CodWiki/releases/latest'
const RELEASE_API = 'https://api.github.com/repos/BarniKjellerenXD/CodWiki/releases/latest'
const versionParts = version => typeof version === 'string' && /^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(version) ? version.split('.').map(Number) : null
function newerVersion(latest, current) {
  const a = versionParts(latest), b = versionParts(current)
  if (!a || !b) return false
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i]
  return false
}
function releaseResult(raw, currentVersion) {
  const latestVersion = typeof raw?.tag_name === 'string' ? raw.tag_name.replace(/^desktop-v/, '') : ''
  if (!raw?.tag_name?.startsWith('desktop-v') || !versionParts(latestVersion) || raw.draft !== false || raw.prerelease !== false) throw new Error('Invalid desktop release')
  const expected = `https://github.com/BarniKjellerenXD/CodWiki/releases/tag/desktop-v${latestVersion}`
  if (raw.html_url !== expected) throw new Error('Invalid release destination')
  return { state: newerVersion(latestVersion, currentVersion) ? 'available' : 'current', currentVersion, latestVersion, url: expected }
}
function createUpdateChecker({ version, fetchResponse, now = Date.now, intervalMs = 6 * 60 * 60 * 1000 }) {
  let result = { state: 'not-checked', currentVersion: version, url: RELEASE_PAGE }, pending = null, checkedAt = null
  async function check(force = false) {
    if (pending) return pending
    if (!force && checkedAt !== null && now() - checkedAt < intervalMs) return result
    pending = (async () => {
      try {
        const response = await fetchResponse(RELEASE_API, { signal: AbortSignal.timeout(8000), redirect: 'error', credentials: 'omit', headers: { Accept: 'application/json' } })
        result = releaseResult(await readJsonResponse(response), version)
      } catch { result = { state: 'unavailable', currentVersion: version, url: RELEASE_PAGE } }
      checkedAt = now()
      return result
    })()
    try { return await pending } finally { pending = null }
  }
  return { get: () => result, check }
}
module.exports = { RELEASE_PAGE, newerVersion, releaseResult, createUpdateChecker }
