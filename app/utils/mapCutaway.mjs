/** Resolve only explicit footprint assignments; room-wide positions stay room-wide. */
export function locationFootprints(cutaway, location) {
  const explicit = new Set(location.footprintIds || [])
  const rooms = new Set(location.roomIds || [])
  return cutaway.footprints.filter(f => explicit.size ? explicit.has(f.id) : rooms.has(f.roomId))
}

/** Directed portals never gain an implicit reverse edge. */
export function cutawayConnections(cutaway, footprintIds, includePortals = false) {
  const selected = new Set(footprintIds)
  return cutaway.connections.flatMap(connection => {
    if (connection.kind === 'portal' && !includePortals) return []
    const forward = connection.from.some(id => selected.has(id))
    const reverse = connection.direction === 'both' && connection.to.some(id => selected.has(id))
    if (!forward && !reverse) return []
    const destinations = (forward ? connection.to : connection.from).filter(id => !selected.has(id))
    if (!destinations.length) return []
    return [{ ...connection, destinations, origins: forward ? connection.from : connection.to }]
  })
}

export function levelLabel(index) { return index > 0 ? `+${index}` : String(index).replace('-', '−') }
