import { waiting, invalid, ready, ambiguous, modulo, orderedSlots } from './remainingCore.mjs'
import refs from '../data/ww2References.json' with { type: 'json' }

const letters = ['A', 'B', 'C', 'D']
const complete = values => values.every(value => value !== '' && value !== undefined && value !== null)
const integer = (value, min, max) => /^\d+$/.test(String(value)) && Number(value) >= min && Number(value) <= max

// The search is bounded to 4^n combinations and never changes the player's observations.
export function rotationSolution(current, matrix, target) {
  const n = current.length
  if (matrix.length !== n || current.some(value => !Number.isInteger(value) || value < 0 || value > 3)) return null
  let best = null
  for (let code = 0; code < 4 ** n; code++) {
    const actions = Array.from({ length: n }, (_, index) => Math.floor(code / 4 ** (n - index - 1)) % 4)
    if (!current.every((value, row) => modulo(value + matrix[row].reduce((sum, weight, column) => sum + weight * actions[column], 0), 4) === target[row])) continue
    const total = actions.reduce((sum, value) => sum + value, 0)
    // Enumeration is lexicographic A, B, C, D; retain its first minimum.
    if (!best || total < best.total) best = { actions, total }
  }
  return best
}

export function statueMatrix(wall) {
  const rates = refs.shadowedStatues.rateVectors[wall - 1]
  return rates ? rates.map((rate, row) => rates.map((_, column) => Math.abs(row - column) <= 1 ? rate : 0)) : null
}

export function decodeWW2Digits(raw) {
  const text = String(raw || '').trim()
  if (!text) return waiting('Record the short and long beeps, separating the two digits with a space or /.')
  if (/[^.\-\s/]/.test(text)) return invalid('Use dots for short beeps, dashes for long beeps and spaces or / between digits.')
  const groups = text.split(/[\s/]+/).filter(Boolean)
  if (groups.length > 2) return invalid('The axe message has two digits. Keep the groups in their original order.')
  const digits = []
  for (let index = 0; index < groups.length; index++) {
    const group = groups[index]
    if (group.length < 5) return waiting(`Digit ${index + 1} has ${group.length}/5 signals. Finish that digit before entering another.`)
    const digit = Object.keys(refs.morseDigits).find(key => refs.morseDigits[key] === group)
    if (!digit) return invalid(`Digit ${index + 1} is not a five-signal Morse number. Recheck that group; its position is preserved.`)
    digits.push(digit)
  }
  if (digits.length < 2) return waiting(`First digit recorded: ${digits[0]}. Record the second digit.`)
  return ready([`Map clue: ${digits.join('')}`, `Original signals: ${groups.join(' / ')}`, 'Use the church map reference and magnifying glass; the code is a map clue, not the radio tuning frequency.'], 'Decoded axe map clue')
}

export function evaluateWW2(id, state, definition = {}) {
  if (!id.startsWith('ww2-')) return null
  if (id === 'ww2-final-reich-grid') {
    const values = Array.from({ length: 4 }, (_, index) => state[`grid-${index}`])
    if (!complete(values)) return waiting('Read all four lit columns from left to right at the Command Room machine.')
    if (values.some(value => !['Red', 'Green', 'Blue'].includes(value))) return invalid('Each column must be Red, Green or Blue.')
    const routes = ['Command Room: right of the grid machine', 'Sewers: fire-trap end of Pack-a-Punch', 'Sewers: Riverside doorway end of Pack-a-Punch', 'Pub: beside the Tower door']
    const german = { Red: 'Rot', Green: 'Grün', Blue: 'Blau' }
    return ready(values.map((value, index) => `${index + 1}. ${routes[index]} → ${value} (${german[value]})`), 'Power-box route from your observations')
  }
  if (id === 'ww2-final-reich-voice') {
    const stage = state.stage || 'paintings'
    const values = Array.from({ length: 4 }, (_, index) => state[`${stage === 'paintings' ? 'bird' : 'flash'}-${index}`])
    if (!complete(values)) return waiting(stage === 'paintings' ? 'Match each painting’s numeral to its pictured machine bird; enter all four.' : 'Record all four green-flash groups, separated by the pauses. Red marks repetition.')
    if (values.some(value => !integer(value, 1, stage === 'paintings' ? 5 : 12))) return invalid('Use observed positive counts; an unrecorded group must remain blank.')
    return ready(values.map((value, index) => `Reference bird ${index + 1} → ${stage === 'paintings' ? ['I', 'II', 'III', 'IV', 'V'][Number(value) - 1] : `${value} green flashes`}`), stage === 'paintings' ? 'First Voice: match the birds on the machine' : 'Second Voice: use the numbered bird order in the reference')
  }
  if (id === 'ww2-darkest-artillery') {
    if ((state.stage || 'fuse') === 'ships') {
      const selected = state.ship
      if (!selected) return waiting('Match the destroyer’s actual position to one of the eleven photographed aiming examples.')
      if (!integer(selected, 1, 11)) return invalid('Choose an example from the aiming sheet.')
      const pair = refs.darkestArtillery.aimingReferencePairs[Number(selected) - 1]
      return ready([`Chart example ${selected}: ${pair[0]} / ${pair[1]}`, 'Compare both labels with the enlarged sheet. Left panel = elevation; right panel = angle; middle button = fire.', `Ship 1 ${state['ship-1-done'] ? 'confirmed sunk' : 'not confirmed'} · Ship 2 ${state['ship-2-done'] ? 'confirmed sunk' : 'not confirmed'}`, 'The ship moves. Match its position again before firing; fuse coordinates are separate.'], 'Illustrated destroyer aiming reference')
    }
    const values = Array.from({ length: 6 }, (_, index) => state[`dial-${index}`])
    if (!complete(values)) return waiting('Record all six characters by their dial positions, not your visiting order.')
    if (![values[0], values[3]].every(value => ['+', '-'].includes(value)) || [1, 2, 4, 5].some(index => !integer(values[index], 0, 9))) return invalid('Positions 1 and 4 need + or −; the other positions need one digit.')
    return ready([`R.I.P. Saw fuse coordinates: ${values.slice(0, 3).join('')} / ${values.slice(3).join('')}`, 'Use the cannon’s elevation and angle panels, then fire and collect the dropped fuse. This is not a destroyer aiming answer.'], 'Signed coordinates, with zeroes preserved')
  }
  if (id === 'ww2-shadowed-radio') {
    const { region, series, model } = state
    if (!complete([region, series, model])) return waiting('Select the pinned church region and both parts of the Main Street radio code.')
    const record = refs.shadowedRadio.regions.find(item => item.name === region)
    const seriesIndex = refs.shadowedRadio.series.indexOf(series)
    const modelIndex = refs.shadowedRadio.modelNumbers.indexOf(String(model))
    if (!record || seriesIndex < 0 || modelIndex < 0) return invalid('The region or radio code is not in the reviewed church chart.')
    return ready([`Left dial: ${record.bands[seriesIndex]}`, `Right dial: ${record.frequencies[modelIndex]}`, `${region} · ${series}-${model}`, 'Success cue: the radio light turns green and “Contacted the Russians” appears.'], 'Church chart frequencies')
  }
  if (id === 'ww2-shadowed-statues') {
    if (!state.wall) return waiting('Select the wall: counterclockwise from the three-statue wall left of the stairs.')
    const matrix = statueMatrix(Number(state.wall))
    if (!matrix) return invalid('Select wall 1, 2, 3 or 4.')
    const values = Array.from({ length: matrix.length }, (_, index) => state[`statue-${index}`])
    if (!complete(values)) return waiting('Record every statue’s direction on this wall. Down means facing you.')
    if (values.some(value => !integer(value, 0, 3))) return invalid('Directions must be Up, Right, Down or Left.')
    const solution = rotationSolution(values.map(Number), matrix, matrix.map(() => 2))
    if (!solution) return invalid('These directions cannot reach all-front on this wall. Recheck the selected wall and the rate-2 statues; your observations are preserved.')
    return ready(solution.total ? solution.actions.flatMap((count, index) => count ? [`Shoot statue ${letters[index]} ${count} time${count === 1 ? '' : 's'}.`] : []) : ['All statues already face front. Collect this wall’s raven if it has appeared.'], `Minimum route: ${solution.total} shot${solution.total === 1 ? '' : 's'}`)
  }
  if (id === 'ww2-shadowed-safe') {
    const values = Array.from({ length: 4 }, (_, index) => state[`count-${index}`])
    if (!complete(values)) return waiting('Confirm the four clown kill counts in activation order; missed counts can be replayed in game.')
    if (values.some(value => !integer(value, 1, 9))) return invalid('Each clown requires 1–9 kills. Preserve the original order.')
    if (values.some((_, index) => !state[`confirmed-${index}`])) return waiting('Confirm each count after its clown stops accepting energy.')
    const direction = ['Clockwise', 'Counterclockwise', 'Clockwise', 'Counterclockwise']
    return ready(['Reset: turn clockwise for three full rotations, counting passes of your first number.', ...values.map((value, index) => `${index + 1}. ${direction[index]} → ${value}${state[`location-${index}`] ? ` (${state[`location-${index}`]})` : ''}`), 'Hold interact to leave the dial. The safe opening confirms success.'], 'Safe directions from confirmed counts')
  }
  if (id === 'ww2-shadowed-axe') return decodeWW2Digits(state.message)
  if (id === 'ww2-frozen-hammer') {
    if (!state.pillar) return waiting('Choose which of the four base-weapon pillars you are observing.')
    if (!integer(state.pillar, 1, 4)) return invalid('Select pillar 1–4; each stores its own observations.')
    const values = Array.from({ length: 4 }, (_, index) => state[`pillar-${state.pillar}-${index}`])
    if (!complete(values)) return waiting('Record A–D from top to bottom. Front means the lightning bolt faces the bowl where Hammer spawned.')
    if (values.some(value => !integer(value, 0, 3))) return invalid('Choose Front, Right, Back or Left for each block.')
    // Hammer shots subtract these turns in the source's front/right/back/left encoding.
    const influence = refs.frozenHammer.matrix.map(row => row.map(weight => -weight))
    const solution = rotationSolution(values.map(Number), influence, [0, 0, 0, 0])
    if (!solution) return invalid('No base-pillar route matches. Recheck the directions; this tool does not apply to the upgrade apparatus.')
    return ready(solution.total ? solution.actions.flatMap((count, index) => count ? [`Shoot block ${letters[index]} ${count} time${count === 1 ? '' : 's'}.`] : []) : ['This pillar already points toward the Hammer’s bowl.'], `Pillar ${state.pillar}: ${solution.total} shot${solution.total === 1 ? '' : 's'}`)
  }
  if (id === 'ww2-frozen-shield') {
    const pools = Array.from({ length: 3 }, (_, index) => state[`pool-${index}`])
    const patterns = Array.from({ length: 3 }, (_, index) => state[`pattern-${index}`])
    if (!complete([...pools, ...patterns])) return waiting('Record each pool and its pattern as you activate it, first through third.')
    if (new Set(pools).size !== 3 || pools.some(value => !['Ice Caves', 'Morgue', 'Overlook'].includes(value))) return invalid('Each of the three different pools must appear once. Patterns may repeat.')
    if (patterns.some(value => !integer(value, 1, 7))) return invalid('Choose the numbered pattern from the supplied seven-pattern sheet.')
    if (pools.some((_, index) => !state[`confirmed-${index}`])) return waiting('Confirm each observed pattern after its charged Corpse Eater kill.')
    return ready([...pools.map((pool, index) => `${index + 1}. ${pool} → pattern ${patterns[index]}; cycle the Blood Altar radio to it, then get one kill in the large pool.`), 'After all three: wait for the rapid pattern flashing, hold the Shield and allow the intentional down in the Blood Altar pool.'], 'Shield radio order from your activation history')
  }
  if (id === 'ww2-frozen-orrery') {
    const values = ['red', 'green', 'purple'].map(colour => state[colour])
    if (!state.perspective || !complete(values)) return waiting('Record the wall perspective and all three orb target positions before using the apparatus.')
    const positions = ['12 o’clock', '1:30', '3 o’clock', '4:30', '6 o’clock', '7:30', '9 o’clock', '10:30']
    if (values.some(value => !positions.includes(value))) return invalid('Choose each orb’s observed position from the eight stops.')
    return ready(['Perspective: face the wall with Schnellblitz / red-orb side at the top, as the reference shows.', `Red → ${values[0]} (fastest: stop this first)`, `Green → ${values[1]}`, `Purple → ${values[2]}`, 'Use the Cypher Room–Orrery orientation photograph for the physical controls. Correct stops make a distinct sound; a wrong stop needs the remaining orbs stopped to reset.'], 'Recorded orb targets; timing remains your in-game observation')
  }
  if (id === 'ww2-tortured-runes') {
    const stage = state.stage
    if (!['1', '2', '3'].includes(stage)) return waiting('Choose the code stage: initial wall, after the flare rune or after the pool rune.')
    const observed = orderedSlots(state, Array.from({ length: 8 }, (_, index) => `stage-${stage}-${index}`))
    if (observed.status === 'waiting') return waiting('Record the photographed rune shapes left to right; use wall-position labels 1–8 or your own shape descriptions.')
    if (observed.status === 'invalid') return invalid('A sequence slot is blank before a later rune. Fill the gap or clear the later entry; do not collapse the order.')
    if (!state[`stage-${stage}-confirmed`]) return waiting(`Stage ${stage}: ${observed.values.length} runes recorded. Confirm that this is the complete new code.`)
    return ready([`Stage ${stage} code: ${observed.values.join(' → ')}`, state[`stage-${stage}-location`] ? `Observed at: ${state[`stage-${stage}-location`]}` : 'No source location recorded.', 'After an incorrect wall entry, interact with any rune until all depress and rise again before retrying.', 'Old rune clues remain visible. A new stage requires a new observation, not the previous code.'], 'Confirmed rune sequence for the selected stage')
  }
  if (id === 'ww2-shadowed-hangman') {
    const mask = String(state.mask || '').trim().toUpperCase().replace(/\s/g, '')
    const rejected = String(state.rejected || '').trim().toUpperCase().replace(/[\s,]/g, '')
    if (!mask && !rejected) return waiting('Enter the sign’s positional pattern with _ for blanks and any confirmed wrong letters.')
    if (/[^A-Z_?]/.test(mask) || /[^A-Z]/.test(rejected)) return invalid('Use A–Z, _ or ? for unknown positions, and letters for wrong guesses.')
    const rows = Object.entries(refs.shadowedHangman.words).filter(([word]) => (!mask || word.length === mask.length && [...mask].every((letter, index) => ['_', '?'].includes(letter) || word[index] === letter)) && ![...rejected].some(letter => word.includes(letter)))
    if (!rows.length) return invalid('No reviewed word fits that pattern and those wrong letters. Recheck the sign; keep your observations.')
    const lines = rows.map(([word, reward]) => `${word} → ${reward}`)
    return rows.length === 1 ? ready(lines, 'One reviewed Hangman word fits') : ambiguous(lines, `${rows.length} possible words remain`)
  }
  return null
}
