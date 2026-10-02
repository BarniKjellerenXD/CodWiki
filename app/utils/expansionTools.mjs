import expansionTools from '../data/expansionTools.json' with { type: 'json' }
import references from '../data/expansionReferences.json' with { type: 'json' }
import { powerHouseResult } from './bloodOfTheDead.mjs'
import { voyageClockResult, voyageOutletResult, voyageSkyResult } from './voyage.mjs'
import { alphaClockRoute, alphaFinalCode, alphaRooms, tagRiddleLocations } from './bo4AlphaTag.mjs'
import { evaluateNightClassified } from './nightClassified.mjs'
const { tagRiddles, iceLabels, iceRuneLabels, fireValues, rushmoreCodes, voyageLocations } = references
export { iceLabels }
export const toolDefinitions = Object.fromEntries(expansionTools.map(tool => [tool.id, tool]))
export function normalizeTool(id, raw) {
  const definition = toolDefinitions[id]
  if (!definition) return {}
  const input = raw && typeof raw === 'object' ? raw : {}
  return Object.fromEntries(definition.fields.map(field => {
    const value = input[field.id]
    if (field.type === 'check') return [field.id, value === true]
    if (field.options) return [field.id, field.options.includes(value) ? value : '']
    return [field.id, typeof value === 'string' ? value.slice(0, field.maxLength || 80) : '']
  }))
}
export const valveGraph = {
  Armory: ['Supply Depot', 'Tank Factory', 'Department Store'],
  'Department Store': ['Armory', 'Infirmary', 'Dragon Command'],
  'Dragon Command': ['Supply Depot', 'Department Store', 'Infirmary'],
  'Supply Depot': ['Dragon Command', 'Armory', 'Tank Factory'],
  Infirmary: ['Department Store', 'Tank Factory', 'Dragon Command'],
  'Tank Factory': ['Infirmary', 'Supply Depot', 'Armory']
}
export function valveRoutes(start, end) {
  if (!valveGraph[start] || !valveGraph[end] || start === end) return []
  const routes = []
  function visit(path) {
    const last = path.at(-1)
    if (last === end) { if (path.length === 6) routes.push(path); return }
    for (const next of valveGraph[last]) if (!path.includes(next)) visit([...path, next])
  }
  visit([start])
  return routes
}
export const morseDigits = ['-----', '.----', '..---', '...--', '....-', '.....', '-....', '--...', '---..', '----.']
export const dartNumbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
const waiting = message => ({ status: 'waiting', message, lines: [] })
const invalid = message => ({ status: 'invalid', message, lines: [] })
const ready = (lines, message = 'Recorded result') => ({ status: 'ready', message, lines })
export function evaluateTool(id, raw) {
  const tool = toolDefinitions[id]
  if (!tool) return invalid('Unknown helper.')
  const state = normalizeTool(id, raw)
  if (['bo4-dead-of-the-night-zodiac','bo4-dead-of-the-night-alistair','bo4-dead-of-the-night-stake','bo4-classified-codes'].includes(id)) return evaluateNightClassified(id, state)
  if (tool.evaluate === 'voyage-clocks') return voyageClockResult(state)
  if (tool.evaluate === 'voyage-outlets') return voyageOutletResult(state)
  if (tool.evaluate === 'voyage-sky') return voyageSkyResult(state)
  if (tool.evaluate === 'alpha-clocks') {
    const route = alphaClockRoute(state)
    if (route.status === 'invalid') return invalid(route.message)
    if (route.status === 'waiting') return waiting(route.message)
    const finalCode = alphaFinalCode(state['final-hour'], state['final-minute'])
    return ready([...route.clues.map(clue => `${clue.room}: ${clue.time}`), `Read the remaining clock in ${alphaRooms[route.remaining]}; enter its observed time as four digits.`, ...(finalCode ? [`Rushmore: ${finalCode}`] : [])], 'Clock settings')
  }
  if (tool.evaluate === 'riddle') {
    const clue = tagRiddleLocations.find(row => row.key === state.clue)
    return clue ? ready([`${clue.location} — ${clue.action}`], 'Clue location') : waiting('Choose the exact offering or Seal clue to see its location.')
  }
  if (tool.evaluate === 'blood-powerhouse') return powerHouseResult(state)
  if (tool.evaluate === 'blood-trials') {
    if (state.code && !/^\d{3}$/.test(state.code)) return invalid('The Kronorium code must contain three digits, including any leading zero.')
    const count = [0,1,2,3,4].filter(i => state[`check-${i}`]).length
    return ready([...(state.code ? [`Citadel code: ${state.code}`] : []), ...(state.assignment ? [`Assignment: ${state.assignment}`] : []), count === 5 ? 'All five stones recorded. Return to the lab map.' : 'Return to the book after each trial; a failed trial needs a fresh code next round.'], `${count} / 5 stones collected`)
  }
  if (tool.evaluate === 'rushmore') {
    const code = rushmoreCodes.find(row => `${row[0]} · ${row[1]} · ${row[2]}` === state.bonus)
    return code ? ready([`${code[1]} — ${code[2]}`, 'Activate Rushmore first. Only one bonus code per round; main quest codes are separate.'], code[0]) : waiting('Choose a bonus effect. Your quest-code notes remain saved below.')
  }
  const fields = tool.fields.filter(f => f.type !== 'check')
  for (const field of fields) if (state[field.id] && field.pattern && !new RegExp(field.pattern).test(state[field.id])) return invalid(`Check ${field.label}. ${field.inputmode === 'numeric' ? 'Use the requested number of digits.' : 'Use the format described above.'}`)
  if (tool.kind === 'tracker') {
    const completed = tool.fields.filter(f => state[f.id]).length
    return ready([`${completed} / ${tool.fields.length} confirmed`], 'Your progress')
  }
  if (tool.evaluate === 'fire') {
    const values=fireValues.filter(value=>state[`fire-${value}`])
    if(values.length!==4) return waiting(`Select four glowing patterns (${values.length} selected).`)
    return ready(values.map(value=>value===4?'Torch 4 — bloodstain':`Torch ${value}`), 'Torches to light')
  }
  if (tool.evaluate === 'launch') {
    const orders = ['ABD', 'ADB', 'BAD', 'BDA', 'DAB', 'DBA'].filter(order => [...order].every((console, i) => (!state[['first', 'second', 'third'][i]] || state[['first', 'second', 'third'][i]] === console) && !state[`reject-${i}-${console}`]))
    return orders.length ? ready(orders.map(order => [...order].join(' → ')), `${orders.length} possible ${orders.length === 1 ? 'order' : 'orders'}`) : invalid('These observations conflict. Undo or correct the accepted/rejected positions.')
  }
  if (tool.evaluate === 'tiles') {
    const lines = []
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
      const left = state[`tile-0-${a}`].trim().toLowerCase()
      if (left && left === state[`tile-1-${b}`].trim().toLowerCase()) lines.push(`Side A ${a + 1} ↔ Side B ${b + 1}: ${state[`tile-0-${a}`]}`)
    }
    return lines.length ? ready(lines, 'Observed matches') : waiting('Record the same symbol label on both sides to find a match.')
  }
  if (tool.evaluate === 'moon') {
    const screens=[0,1,2,3].map(i=>state[`screen-${i}`])
    if(screens.some(s=>!s)) return waiting('Record the colour at all four screen positions.')
    if(new Set(screens).size!==4) return invalid('Each screen colour must occupy one position. Recheck the layout.')
    const values = Array.from({length:16},(_,i)=>state[`slot-${i}`]); const last = values.findLastIndex(Boolean)
    if (last < 0) return waiting('Record the first display.')
    if (values.slice(0, last + 1).some(v => !v)) return invalid('Fill the gap in the sequence before using it.')
    return ready(values.slice(0, last + 1).map((v, i) => `${i + 1}. ${['Top left','Top right','Bottom left','Bottom right'][screens.indexOf(v)]} (${v})`))
  }
  if (!tool.evaluate) return waiting('Your observations are saved on this device.')
  if (fields.some(f => !state[f.id].trim())) return waiting('Complete every observation to show the result.')
  const values = fields.map(f => state[f.id])
  switch (tool.evaluate) {
    case 'ice': return ready([iceRuneLabels[iceLabels.indexOf(state.pattern)]], 'Shoot this ceiling glyph')
    case 'sky': {
      if (new Set(values).size !== 9) return invalid('Each celestial body must appear exactly once.')
      if (values[8] !== 'Sun') return invalid('The Sun is the final stage. Recheck the sequence.')
      return ready(values.map(body => `${body}: collect its orb at ${voyageLocations[body]}.`), 'Shoot and collect each orb before the timer expires')
    }
    case 'ordered': return ready([values.join(' → ')])
    case 'labelled': return ready(fields.map(f => `${f.label}: ${state[f.id]}`))
    case 'unique-order': return new Set(values).size === values.length ? ready(values.map((v, i) => `${i + 1}. ${v}`)) : invalid('A location or symbol appears more than once. Check the observed order.')
    case 'valves': {
      if (state.start === state.end) return invalid('The green light and cylinder must be in different rooms.')
      const route = valveRoutes(state.start, state.end)[0]
      return route ? ready(route.map((room, i) => i === 5 ? `${room}: cylinder endpoint` : `${room}: position ${valveGraph[room].indexOf(route[i + 1]) + 1}`), 'Valve positions') : invalid('No valid route for these clues.')
    }
    case 'zodiac': {
      const observations = [0, 1, 2].map(i => ({ sign: state[`sign-${i}`], count: [0, 1, 2].reduce((sum, j) => sum + Number(state[`count-${i}-${j}`]), 0) }))
      if (new Set(observations.map(o => o.sign)).size !== 3) return invalid('Each room needs a different zodiac sign. Recheck the observations.')
      if (new Set(observations.map(o => o.count)).size !== 3) return invalid('Totals are tied. Recheck all scratches; no unambiguous order can be shown.')
      return ready(observations.sort((a, b) => a.count - b.count).map(o => `${o.sign}: ${o.count}`), 'Telescope order: lowest total first')
    }
    case 'morse': {
      const digits = values.map(v => /^\d$/.test(v) ? Number(v) : morseDigits.indexOf(v))
      if (digits.some(v => v < 0)) return invalid('Each buoy must be a decimal digit or its five-pulse Morse code.')
      const sum = digits.reduce((a, b) => a + b, 0)
      return ready([`${digits.join(' + ')} = ${sum}`, [...String(sum)].map(d => morseDigits[Number(d)]).join(' ')], 'Morse answer — a space separates digits')
    }
    case 'darts': return ready([...values.map(v => String(dartNumbers[Number(v) - 1])), 'Bullseye'], 'Shoot in this order')
    case 'verruckt': return ready([state.side === 'Jugger-Nog side' ? 'Open the route upstairs from the Jugger-Nog side and work toward the power room.' : 'Open the route upstairs from Quick Revive and work toward the power room.', 'Switch on power to reconnect the two starting halves.'], 'Setup route')
    case 'regions': {
      const ravenov = state.quest === 'Ravenov Implications'
      const lines = [ravenov ? 'Begin with the quest radio from world tier 3 onward; match its three amplifiers, then contact Maxis at the beacon.' : 'From world tier 3 onward, follow the red rift chain and collect the listening device. Respond to Ravenov at the beacon.']
      if (ravenov && state.region === 'Ruka') lines.push('Ruka has no slide projector. Carry collected slides to another region. The quest later forces a return to Ruka for the bunker.')
      else if (!ravenov && state.region === 'Sanatorium') lines.push('Sanatorium has no starting red rift. Warp to another region to begin. The quest later sends you here for the helicopter and rover.')
      else lines.push('Use the linked quest location guide for exact landmarks. Do not confuse ordinary radio side objectives with the main-quest radio.')
      if (['Armada', 'Collateral', 'Zoo'].includes(state.region)) lines.push('These later-added regions are not fully covered by the original location guide. Verify objective availability before searching.')
      return ready(lines, `${state.quest} · ${state.region}`)
    }
    default: return waiting('Your observations are saved on this device.')
  }
}
