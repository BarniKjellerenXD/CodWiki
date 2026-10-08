import { waiting, invalid, ready, ambiguous, orderedSlots } from './remainingCore.mjs'
export const terraPositions = ['Top', 'Bottom', 'Left', 'Right']
export function permutations(items) {
  return items.length ? items.flatMap((item, i) => permutations(items.filter((_, j) => i !== j)).map(rest => [item, ...rest])) : [[]]
}
export const vanguardCipherPairs = [
  ['木 · wood', 1, 1], ['火 · fire', 1, 2], ['土 · earth', 1, 3], ['美 · beauty', 1, 4], ['雨 · rain', 1, 5],
  ['日 · sun', 2, 1], ['水 · water', 2, 2], ['夜 · night', 2, 3], ['風 · wind', 2, 4], ['空 · sky', 2, 5],
  ['月 · moon', 3, 1], ['金 · gold', 3, 2], ['花 · flower', 3, 3], ['鳥 · bird', 3, 4], ['心 · heart', 3, 5],
].map(([paper, column, row]) => ({ paper, column, row }))
const paperLocations = ['Excavation Room', 'Comms Room', 'Dig Site']
export function terraPageCandidates(state = {}) {
  const accepted = orderedSlots(state, Array.from({ length: 4 }, (_, i) => `accepted-${i}`))
  if (accepted.status === 'invalid') return invalid('Accepted positions must form a continuous prefix. Correct the missing earlier position.')
  if (accepted.values.some(position => !terraPositions.includes(position)) || new Set(accepted.values).size !== accepted.values.length) return invalid('Accepted positions must be recognized, distinct door positions.')
  const rawRejections = Array.from({ length: 6 }, (_, i) => state[`rejected-${i}`] || '').filter(Boolean)
  if (rawRejections.some(value => typeof value !== 'string')) return invalid('Choose a recorded rejection from the documented prefix options.')
  const rejections = rawRejections.map(value => value.split(' → '))
  if (rejections.some(order => order.length > 4 || order.some(position => !terraPositions.includes(position)) || new Set(order).size !== order.length)) return invalid('Each rejection needs its observed accepted prefix followed by one distinct failed position.')
  const candidates = permutations(terraPositions).filter(order => accepted.values.every((position, i) => order[i] === position) && !rejections.some(rejection => rejection.every((position, i) => order[i] === position)))
  if (!candidates.length) return invalid('These observations contradict one another. Correct a rejection or accepted position; do not guess a new route.')
  const lines = candidates.map(order => order.join(' → '))
  lines.push('A failed placement clears the physical door. Replay the learned accepted prefix, then test a remaining next choice. Keep rejections only with the prefix under which they were observed.')
  return candidates.length === 1 ? ready(lines, 'One order fits the recorded observations.', { candidates }) : ambiguous(lines, `${candidates.length} orders remain. No order has been inferred.`, { candidates })
}
export function evaluateVanguard(id, state = {}, definition) {
  if (id === 'vanguard-terra-pages') return terraPageCandidates(state)
  if (id === 'vanguard-shi-no-numa-cipher') {
    const observations = paperLocations.map((location, i) => ({ location, paper: state[`paper-${i}`] || '', ring: state[`ring-${i}`] || '' }))
    if (observations.some(item => item.paper && !vanguardCipherPairs.some(pair => pair.paper === item.paper))) return invalid('A paper glyph is unknown. Compare it with the full translation plate; do not invent a wheel target.')
    if (observations.some(item => item.ring && !['Inner', 'Middle', 'Outer'].includes(item.ring))) return invalid('Choose a recognized ring assignment.')
    const chosenRings = observations.map(item => item.ring).filter(Boolean)
    if (new Set(chosenRings).size !== chosenRings.length) return invalid('Each target ring can be assigned once. Recheck the wheel instead of using visit order.')
    const lines = observations.map(item => {
      const pair = vanguardCipherPairs.find(pair => pair.paper === item.paper)
      return pair ? `${item.location}: ${item.paper} → ${item.ring || 'ring not assigned'}; use the RIGHT-HAND wheel marking in plate column ${pair.column}, row ${pair.row}.` : `${item.location}: paper not recorded.`
    })
    const images = definition?.images || [{ src: '/images/remaining/asset-0063.webp', alt: 'Monolith translation plate: paper glyphs left, wheel markings right; count columns and rows from top left' }]
    if (observations.some(item => !item.paper || !item.ring)) return { status: 'waiting', message: 'Recorded papers have paired plate cells. Observe the missing papers and assign all three rings before aligning.', lines, images }
    return ready([...lines, 'Align the three recorded wheel markings at the top of their assigned rings, then lock the monolith. Check its red lighting / glowing-stone cue.'], 'All three paper observations and ring assignments are recorded.', { images })
  }
  if (id !== 'vanguard-archon-runes') return null
  if (!state.stage) return waiting('Choose the current 3-, 4- or 5-symbol preparation round.')
  if (!['3', '4', '5'].includes(state.stage)) return invalid('Select a recognized preparation round.')
  const count = Number(state.stage)
  const items = Array.from({ length: count }, (_, i) => ({ symbol: state[`symbol-${count}-${i}`] || '', landmark: state[`landmark-${count}-${i}`] || '' }))
  if (items.some(item => typeof item.symbol !== 'string' || typeof item.landmark !== 'string' || item.symbol.length > 40 || item.landmark.length > 80)) return invalid('Use a short symbol label and ground landmark for each observation.')
  const lines = items.map((item, i) => `${i + 1}. ${item.symbol.trim() || 'Symbol unrecorded'} — ${item.landmark.trim() || 'ground landmark unrecorded'}`)
  if (items.some(item => !item.symbol.trim())) return { status: 'waiting', message: 'Record every symbol shown. A missing observation stays unknown.', lines }
  if (state[`locked-${count}`] !== true) return { status: 'waiting', message: 'Recheck the observed sequence, then lock it before the traversal.', lines }
  return ready([...lines, 'Traverse the matching ground runes in this recorded order. This preparation sequence is separate from the later capture-runes trial, which forbids zombie kills.'], `${count}-symbol observation locked. Landmark notes are observations, not automatic glyph recognition.`)
}
