import { waiting, invalid, ready, modulo, orderedSlots } from './remainingCore.mjs'
export const descentColours = ['Red', 'Green', 'Blue', 'Yellow']
const digitLabels = ['Zombies hit by Exo Slam', 'Jumps', 'Wall purchases excluding ammunition', 'Zombie kills']
const digit = value => typeof value === 'string' && /^[0-9]$/.test(value)
export function descentNumberPlan(state) {
  const entries = digitLabels.map((label, i) => {
    const target = state[`target-${i}`] ?? '', current = state[`current-${i}`] ?? ''
    return { label, target, current, missing: !target || !current, invalid: (target !== '' && !digit(target)) || (current !== '' && !digit(current)), remaining: digit(target) && digit(current) ? modulo(Number(target) - Number(current), 10) : null }
  })
  if (entries.some(item => item.invalid)) return invalid('Enter a single observed digit from 0 to 9 in each row. Keep leading zero as 0.')
  const lines = entries.map((item, i) => item.remaining === null ? `${i + 1}. ${item.label}: record both digits.` : `${i + 1}. ${item.label}: ${item.remaining} remaining one-unit events (${item.current} → ${item.target}).`)
  lines.push('First adjust slam hits; one slam may hit several zombies and also change jumps or kills. Then reread ALL four current digits.', 'Adjust wall purchases and ordinary kills next. Buy a wall weapon or counted equipment; buying its ammunition does not advance digit 3.', 'Reread again and adjust jumps last. Any further action can change a matched digit. The panel confirms success automatically when both rows match.')
  if (entries.some(item => item.missing)) return { status: 'waiting', message: 'Known digits have results; missing digits stay unknown.', lines }
  return ready(lines, entries.every(item => item.remaining === 0) ? 'All four observed digits match. Check the panel’s completion cue in-game.' : 'Plan from your observations; reread after coupled actions.')
}
// An explicit event log can update known observations; this cannot detect game events.
export function applyDescentEvent(current, event) {
  if (!Array.isArray(current) || current.length !== 4 || current.some(value => value !== '' && value !== null && !digit(String(value)))) throw new Error('Four current digits or unknown values are required.')
  const count = (value = 0) => {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('Event counts must be non-negative whole numbers.')
    return value
  }
  const hits = count(event.hits), kills = count(event.kills), jumps = count(event.jumps), purchases = event.ammo ? 0 : count(event.purchases)
  const delta = [hits, jumps, purchases, kills]
  return current.map((value, i) => value === '' || value === null ? '' : String(modulo(Number(value) + delta[i], 10)))
}
export function evaluateAW(id, state = {}, definition) {
  if (id === 'aw-descent-numbers') return descentNumberPlan(state)
  if (id !== 'aw-descent-simon') return null
  const layout = Array.from({ length: 4 }, (_, i) => state[`screen-${i}`] || '')
  if (layout.some(colour => colour && !descentColours.includes(colour))) return invalid('Select a recognized colour for each monitor.')
  if (new Set(layout.filter(Boolean)).size !== layout.filter(Boolean).length) return invalid('Each colour occupies one monitor. Recheck the physical arrangement.')
  const sequence = orderedSlots(state, Array.from({ length: 16 }, (_, i) => `flash-${i}`))
  if (sequence.status === 'invalid') return invalid('A flash is missing before a later flash. Fill or remove the gap before replaying.')
  if (sequence.values.some(colour => !descentColours.includes(colour))) return invalid('A recorded flash is not a recognized colour.')
  if (layout.some(colour => !colour)) return waiting('Arrange all four monitor colours before converting flashes to positions.')
  if (!sequence.values.length) return waiting('Record the flashing colours in order. Repeated flashes are valid.')
  return ready(sequence.values.map((colour, i) => `${i + 1}. ${colour} → monitor ${layout.indexOf(colour) + 1} from the left`), 'Replay monitor positions in this order; the cheerful sound confirms the game accepted it.')
}
