export const portalStorageKey = 'codwiki-mw3-rune-portals-v2'

const validId = (value, points) => typeof value === 'string' && points.some(point => point.id === value) ? value : ''

export function readPortalSelection(query, saved, data) {
  // An explicit link is a complete selection. A bad link must never show a saved trip instead.
  const explicit = ['to', 'from'].some(key => Object.hasOwn(query, key))
  let input = query
  if (!explicit) {
    try { input = JSON.parse(saved || 'null'); if (input?.version !== 2) input = {} } catch { input = {} }
  }
  const to = validId(input?.to, data.destinations)
  const from = validId(input?.from, data.entrances)
  const invalidLink = explicit && ['to', 'from'].some(key => Object.hasOwn(query, key) && query[key] !== (key === 'to' ? to : from))
  return { to, from, invalidLink }
}

export function portalQuery(query, selection) {
  const result = { ...query }
  delete result.to
  delete result.from
  if (selection.to) result.to = selection.to
  if (selection.from) result.from = selection.from
  return result
}

export function portalMatches(point, query) {
  const haystack = `${point.kind} ${point.label} ${point.grid} ${point.nearbyArea}`.toLowerCase()
  return query.toLowerCase().trim().split(/\s+/).every(word => haystack.includes(word))
}

// Separate nearby hit targets in screen pixels. Keep the authored points intact;
// the viewer draws a short leader from each shifted marker to its true position.
export function separatePortalMarkers(projected, gap = 38) {
  const positions = projected.map(point => ({ ...point }))
  for (let pass = 0; pass < 32; pass++) {
    let moved = false
    for (let i = 0; i < positions.length; i++) for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i], b = positions[j]
      const dx = b.x - a.x, dy = b.y - a.y
      const distance = Math.hypot(dx, dy)
      if (distance >= gap) continue
      const ux = distance ? dx / distance : 1
      const uy = distance ? dy / distance : 0
      const shift = (gap - distance) / 2 + 0.05
      a.x -= ux * shift; a.y -= uy * shift
      b.x += ux * shift; b.y += uy * shift
      moved = true
    }
    if (!moved) break
  }
  return positions
}
