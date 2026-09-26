import { ringStops, temples, moveRing } from './puzzles.mjs'

const encode = s => s[0] * 36 + s[1] * 6 + s[2]
const decode = n => [Math.floor(n / 36), Math.floor(n / 6) % 6, n % 6]
const templeAt = s => s.every(n => n === s[0]) && temples.includes(s[0]) ? s[0] : null
const bit = temple => temple === null ? 0 : 1 << temples.indexOf(temple)

// Complete each breadth-first layer before advancing: this minimises presses,
// then direction changes. Keeping previous direction in the key preserves ties.
export function planRingRoute(start, target = 'tour', completed = []) {
  if (!Array.isArray(start) || start.length !== 3 || start.some(n => !Number.isInteger(n) || n < 0 || n > 5) || !(target === 'tour' || temples.includes(target))) return null
  const done = new Set(completed.filter(n => temples.includes(n)))
  const initialMask = target === 'tour' ? [...done].reduce((m, n) => m | bit(n), bit(templeAt(start))) : 0
  const key = (position, mask, direction) => (mask * 216 + position) * 3 + direction
  const root = key(encode(start), initialMask, 0)
  const distance = new Int16Array(10368).fill(-1)
  const switches = new Int16Array(10368).fill(32767)
  const parent = new Int32Array(10368).fill(-1)
  const action = new Int8Array(10368)
  distance[root] = 0; switches[root] = 0
  let frontier = [root], depth = 0, goal = -1
  while (frontier.length) {
    for (const id of frontier) {
      const position = Math.floor(id / 3) % 216, mask = Math.floor(id / 648)
      if (target === 'tour' ? mask === 15 : position === target * 43) {
        if (goal < 0 || switches[id] < switches[goal]) goal = id
      }
    }
    if (goal >= 0) break
    const nextLayer = []
    for (const id of frontier) {
      const s = decode(Math.floor(id / 3) % 216), mask = Math.floor(id / 648), last = id % 3
      for (let ring = 0; ring < 3; ring++) for (const direction of [1, -1]) {
        const d = direction === 1 ? 1 : 2, next = moveRing(s, ring, direction)
        const nextMask = target === 'tour' ? mask | bit(templeAt(next)) : 0
        const nextId = key(encode(next), nextMask, d), count = switches[id] + (last && last !== d ? 1 : 0)
        if (distance[nextId] < 0) { distance[nextId] = depth + 1; nextLayer.push(nextId) }
        if (distance[nextId] === depth + 1 && count < switches[nextId]) {
          switches[nextId] = count; parent[nextId] = id; action[nextId] = ring * 2 + (d - 1)
        }
      }
    }
    frontier = nextLayer; depth++
  }
  if (goal < 0) return null
  const moves = []
  for (let id = goal; parent[id] >= 0; id = parent[id]) moves.unshift([Math.floor(action[id] / 2), action[id] % 2 ? -1 : 1])
  const states = [start.slice()]
  for (const [ring, direction] of moves) states.push(moveRing(states.at(-1), ring, direction))
  const checkpoints = [], seen = new Set(done)
  states.forEach((s, press) => {
    const temple = templeAt(s)
    if (temple !== null && (target === 'tour' ? !seen.has(temple) : temple === target)) {
      seen.add(temple); checkpoints.push({ temple, name: ringStops[temple], press })
    }
  })
  let from = 0
  const legs = checkpoints.map(checkpoint => {
    const groups = []
    for (let index = from; index < checkpoint.press; index++) {
      const [ring, direction] = moves[index], last = groups.at(-1)
      if (last && last.ring === ring && last.direction === direction) { last.count++; last.to = index + 1 }
      else groups.push({ ring, direction, count: 1, from: index, to: index + 1 })
    }
    const leg = { ...checkpoint, from, presses: checkpoint.press - from, groups }
    from = checkpoint.press
    return leg
  })
  return { moves, states, legs, presses: moves.length, switches: switches[goal] }
}
