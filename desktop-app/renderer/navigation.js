// Keep each map together even when an older installation saved a flat order.
function groupNavigation(entries, savedOrder = []) {
  const byId = new Map(entries.map(item => [item.id, item]))
  const ordered = [...new Set([...savedOrder, ...byId.keys()])].map(id => byId.get(id)).filter(Boolean)
  const gameOrder = ['bo7', 'bo6', 'cw', 'bo4', 'bo3']
  return ordered.filter(item => item.kind === 'guide').map(guide => ({
    id: guide.map,
    game: guide.game || 'bo7',
    gameName: guide.gameName || 'Black Ops 7',
    name: guide.section,
    items: [guide, ...ordered.filter(item => item.kind !== 'guide' && item.map === guide.map)]
  })).sort((a, b) => gameOrder.indexOf(a.game) - gameOrder.indexOf(b.game))
}
if (typeof window !== 'undefined') window.groupNavigation = groupNavigation
if (typeof module !== 'undefined') module.exports = { groupNavigation }
