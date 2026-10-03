// Keep each map together even when an older installation saved a flat order.
function groupNavigation(entries, savedOrder = []) {
  const byId = new Map(entries.map(item => [item.id, item]))
  const ordered = [...new Set([...savedOrder, ...byId.keys()])].map(id => byId.get(id)).filter(Boolean)
  const games = entries.games || (typeof window !== 'undefined' ? window.NAV_GAMES : []) || []
  const gameOrder = [...new Set([...games.map(game => game.id), ...entries.map(item => item.game || 'bo7')])]
  return ordered.filter(item => item.kind === 'guide').map(guide => ({
    id: guide.map,
    game: guide.game || 'bo7',
    gameName: guide.gameName || 'Black Ops 7',
    group: guide.group || '',
    status: guide.status || 'available',
    keywords: guide.keywords || '',
    name: guide.section,
    items: [guide, ...ordered.filter(item => item.kind !== 'guide' && item.map === guide.map)]
  })).sort((a, b) => gameOrder.indexOf(a.game) - gameOrder.indexOf(b.game))
}

function normalizeNavigationSearch(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// Searching deliberately crosses the selected game and includes the edition.
function filterNavigation(groups, game, query = '') {
  const words = normalizeNavigationSearch(query).split(' ').filter(Boolean)
  if (!words.length) return groups.filter(group => group.game === game)
  return groups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      const text = normalizeNavigationSearch(`${group.game} ${group.gameName} ${group.name} ${group.group} ${group.keywords} ${item.label} ${item.url}`)
      return words.every(word => text.includes(word))
    }),
  })).filter(group => group.items.length)
}

function navigationForRoute(entries, url) {
  try {
    const route = new URL(url, 'https://codzmwiki.com').pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/'
    return entries.find(item => item.url === route) || null
  } catch { return null }
}

function resolveNavigationGame(entries, savedGame, url) {
  return navigationForRoute(entries, url)?.game || (entries.some(item => item.game === savedGame) ? savedGame : entries[0]?.game) || 'bo7'
}

const navigation = { groupNavigation, filterNavigation, navigationForRoute, resolveNavigationGame }
if (typeof window !== 'undefined') { window.groupNavigation = groupNavigation; window.CW_NAVIGATION = navigation }
if (typeof module !== 'undefined') module.exports = navigation
