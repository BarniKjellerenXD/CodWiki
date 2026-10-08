export const waiting = message => ({ status: 'waiting', message, lines: [] })
export const invalid = message => ({ status: 'invalid', message, lines: [] })
export const ready = (lines, message = 'Recorded result', extra = {}) => ({ status: 'ready', message, lines, ...extra })
export const ambiguous = (lines, message = 'More than one result fits', extra = {}) => ({ status: 'ambiguous', message, lines, ...extra })
export const modulo = (value, modulus) => ((value % modulus) + modulus) % modulus
export function orderedSlots(state, ids) {
  const values = ids.map(id => state[id] || '')
  const end = values.findLastIndex(Boolean)
  if (end < 0) return { values: [], status: 'waiting' }
  if (values.slice(0, end + 1).some(value => !value)) return { values: values.slice(0, end + 1), status: 'invalid' }
  return { values: values.slice(0, end + 1), status: 'ready' }
}
