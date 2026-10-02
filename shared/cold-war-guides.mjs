import { guides as launch } from './cold-war-launch.mjs'
import { guides as finale } from './cold-war-finale.mjs'
import { guides as outbreak } from './cold-war-outbreak.mjs'
import { outbreakRegions, outbreakQuests, tvScreens } from '../app/utils/coldWar.mjs'
export const coldWarGuides = [...launch, ...finale, ...outbreak]
const field = (id, label, options = null, extra = {}) => ({ id, label, options, ...extra })
const tool = (id, map, name, help, kind, fields) => ({ id, map, name, help, kind, fields, version: 1, ...(id === 'cw-firebase-darts' ? { evaluate: 'darts' } : id === 'cw-mauer-safe' ? { evaluate: 'ordered' } : {}) })
export const coldWarTools = [
  tool('cw-die-variants', 'cw-die-maschine', 'D.I.E. port and upgrade reference', 'Match the chamber port to its real photograph. Reveal its weapon, upgrade route and prerequisites.', 'reference', [field('variant', 'Chamber port / weapon', ['cryo', 'nova', 'fire', 'electric']), ...Array.from({ length: 7 }, (_, i) => field(`check-${i}`, 'Previous upgrade confirmation', null, { type: 'check' }))]),
  tool('cw-firebase-darts', 'cw-firebase-z', 'RAI K-84 visual dartboard', 'Tap the computer’s three stopped sectors in order. Get the real dartboard numbers and final bullseye.', 'solver', Array.from({ length: 3 }, (_, i) => field(`slot-${i}`, `Computer stop ${i + 1}`, Array.from({ length: 20 }, (_, n) => String(n + 1))))),
  tool('cw-mauer-safe', 'cw-mauer-der-toten', 'CRBR-S safe and blacklight locations', 'Find each number with the nine clue photographs. Keep the three values in fixed room order.', 'recorder', ['Garment Factory', 'Service Passage', 'Grocery Store'].map((room, i) => field(`slot-${i}`, room, null, { pattern: '^\\d{2}$', maxLength: 2, inputmode: 'numeric' }))),
  tool('cw-forsaken-tvs', 'cw-forsaken', 'Perkaholic TV sequence', 'Record the real colored screens for each 4, 8 and 12-flash stage, then follow your order one shot at a time.', 'recorder', [field('stage', 'Sequence length', ['4', '8', '12']), ...[4, 8, 12].flatMap(n => Array.from({ length: n }, (_, i) => field(`tv-${n}-${i}`, `Stage ${n}: flash ${i + 1}`, tvScreens.map(t => t.id))))]),
  tool('cw-outbreak-regions', 'cw-outbreak', 'Outbreak quest location finder', 'Choose your quest, region and objective for annotated maps, object photographs and availability checks.', 'reference', [field('quest', 'Quest', outbreakQuests), field('region', 'Current region', outbreakRegions), field('stage', 'Objective', ['Radio', 'Monkeys', 'Projector', 'Red rift', 'Sanatorium rover', 'Zoo mask', 'D.I.E. upgrade'])]),
  { ...tool('cw-outbreak-launch', 'cw-outbreak', 'Outbreak launch-light solver', 'Read the three small indicator lights below each A, B and D key switch. Green left is first, middle second, right third.', 'solver', [
    ...['A', 'B', 'D'].map(c => field(`light-${c}`, `Silo ${c}: green light position`, ['1', '2', '3'])),
    ...['first', 'second', 'third'].map((id, i) => field(id, `Previously accepted position ${i + 1}`, ['A', 'B', 'D'])),
    ...[0, 1, 2].flatMap(i => ['A', 'B', 'D'].map(c => field(`reject-${i}-${c}`, `Previously rejected: position ${i + 1}, ${c}`, null, { type: 'check' })))
  ]), evaluate: 'launch' }
]
