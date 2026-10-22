// Zones drawn from labelled points, for maps whose sources rate places but draw no
// borders. Each seed colours the ground within its reach; where reaches overlap, the
// nearer seed wins. zoneField samples that on a grid, and traceRegions turns the grid
// into smoothed outlines. Coordinates are whatever units the seeds use.

export function zoneField(seeds, step) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity
  for (const { at: [x, y], reach } of seeds) {
    left = Math.min(left, x - reach)
    right = Math.max(right, x + reach)
    top = Math.min(top, y - reach)
    bottom = Math.max(bottom, y + reach)
  }
  // One empty cell on every side, so every outline closes inside the grid.
  const x0 = (Math.floor(left / step) - 1) * step, y0 = (Math.floor(top / step) - 1) * step
  const cols = Math.ceil((right - x0) / step) + 1, rows = Math.ceil((bottom - y0) / step) + 1
  const owner = new Int16Array(cols * rows).fill(-1)
  const reach2 = seeds.map(seed => seed.reach ** 2)
  for (let j = 0; j < rows; j++) {
    const y = y0 + (j + 0.5) * step
    for (let i = 0; i < cols; i++) {
      const x = x0 + (i + 0.5) * step
      let best = -1, bestD = Infinity
      for (let k = 0; k < seeds.length; k++) {
        const dx = x - seeds[k].at[0], dy = y - seeds[k].at[1]
        const d = dx * dx + dy * dy
        if (d <= reach2[k] && d < bestD) { best = k; bestD = d }
      }
      owner[j * cols + i] = best
    }
  }
  return { x0, y0, step, cols, rows, owner }
}

// The seed that owns a point, or -1.
export function ownerAt(field, [x, y]) {
  const i = Math.floor((x - field.x0) / field.step), j = Math.floor((y - field.y0) / field.step)
  return i >= 0 && i < field.cols && j >= 0 && j < field.rows ? field.owner[j * field.cols + i] : -1
}

// Outlines of the regions keyOf groups seeds into (null leaves a seed's ground out).
// Returns Map(key -> rings); holes are rings too, so draw them with the even-odd rule.
export function traceRegions(field, keyOf, { smooth = 2 } = {}) {
  const { x0, y0, step, cols, rows, owner } = field
  const keys = new Map()
  const keyAt = (i, j) => {
    if (i < 0 || j < 0 || i >= cols || j >= rows) return null
    const seed = owner[j * cols + i]
    if (seed < 0) return null
    if (!keys.has(seed)) keys.set(seed, keyOf(seed) ?? null)
    return keys.get(seed)
  }
  // Cell edges on a region's border run between lattice corners with the region on
  // their right (y grows downwards).
  const W = cols + 1
  const edges = new Map()
  const add = (key, from, to) => {
    let byFrom = edges.get(key)
    if (!byFrom) edges.set(key, byFrom = new Map())
    const list = byFrom.get(from)
    if (list) list.push(to)
    else byFrom.set(from, [to])
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const key = keyAt(i, j)
      if (key === null) continue
      if (keyAt(i, j - 1) !== key) add(key, j * W + i, j * W + i + 1)
      if (keyAt(i + 1, j) !== key) add(key, j * W + i + 1, (j + 1) * W + i + 1)
      if (keyAt(i, j + 1) !== key) add(key, (j + 1) * W + i + 1, (j + 1) * W + i)
      if (keyAt(i - 1, j) !== key) add(key, (j + 1) * W + i, j * W + i)
    }
  }
  const regions = new Map()
  for (const [key, byFrom] of edges) {
    const take = (from, prev) => {
      const list = byFrom.get(from)
      let pick = 0
      // Where two cells of a region touch only at a corner, turn right so each keeps its own ring.
      if (list.length > 1 && prev >= 0) {
        const ax = from % W - prev % W, ay = Math.floor(from / W) - Math.floor(prev / W)
        pick = Math.max(0, list.findIndex(to => ax * (Math.floor(to / W) - Math.floor(from / W)) - ay * (to % W - from % W) > 0))
      }
      const [to] = list.splice(pick, 1)
      if (!list.length) byFrom.delete(from)
      return to
    }
    const rings = []
    while (byFrom.size) {
      const start = byFrom.keys().next().value
      const corners = []
      let prev = -1, at = start
      do {
        corners.push([at % W, Math.floor(at / W)])
        const next = take(at, prev)
        prev = at
        at = next
      } while (at !== start && byFrom.has(at))
      // Single cells and slivers are noise at this scale.
      if (Math.abs(area(corners)) < 3) continue
      // Edge midpoints turn a staircase into a straight diagonal, then corner cutting rounds it.
      let ring = straight(corners.map((point, n) => { const other = corners[(n + 1) % corners.length]; return [(point[0] + other[0]) / 2, (point[1] + other[1]) / 2] }))
      for (let n = 0; n < smooth; n++) ring = chaikin(ring)
      rings.push(ring.map(([i, j]) => [x0 + i * step, y0 + j * step]))
    }
    if (rings.length) regions.set(key, rings)
  }
  return regions
}

function area(ring) {
  let sum = 0
  for (let n = 0; n < ring.length; n++) {
    const [ax, ay] = ring[n], [bx, by] = ring[(n + 1) % ring.length]
    sum += ax * by - bx * ay
  }
  return sum / 2
}
// Drops points that sit on a straight line between their neighbours.
function straight(ring) {
  return ring.filter((point, n) => {
    const a = ring[(n - 1 + ring.length) % ring.length], b = ring[(n + 1) % ring.length]
    return Math.abs((point[0] - a[0]) * (b[1] - a[1]) - (point[1] - a[1]) * (b[0] - a[0])) > 1e-9
  })
}
function chaikin(ring) {
  const out = []
  for (let n = 0; n < ring.length; n++) {
    const [ax, ay] = ring[n], [bx, by] = ring[(n + 1) % ring.length]
    out.push([0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by], [0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by])
  }
  return out
}
