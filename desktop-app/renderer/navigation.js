// Keep each map together even when an older installation saved a flat order.
function groupNavigation(entries, savedOrder = []) {
  const byId = new Map(entries.map(item => [item.id, item]))
  const ordered = [...new Set([...savedOrder, ...byId.keys()])].map(id => byId.get(id)).filter(Boolean)
  return ordered.filter(item => item.kind === 'guide').map(guide => ({
    id: guide.map,
    name: guide.section,
    items: [guide, ...ordered.filter(item => item.kind === 'tool' && item.map === guide.map)]
  }))
}
if (typeof window !== 'undefined') window.groupNavigation = groupNavigation
if (typeof module !== 'undefined') module.exports = { groupNavigation }
