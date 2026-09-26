import { zodiacHour } from './puzzles.mjs'

export const murderSuspects = [
  { id: 'merchant', name: 'Merchant', item: 'abacus' },
  { id: 'noble', name: 'Courtier / Noble', item: 'nobleHat' },
  { id: 'gardener', name: 'Gardener', item: 'shears' },
]
export const murderSymptoms = [
  { id: 'emesis', name: 'Vomiting', hint: 'Noxious food · signs of emesis' },
  { id: 'plant', name: 'Noxious plant', hint: 'Consumed contaminated or noxious plant' },
  { id: 'paralysis', name: 'Paralysis', hint: 'Showed evidence of paralysis' },
]
export const murderPaintings = [
  { id: 'fish', name: 'Fish', item: 'teaWhisk' },
  { id: 'mountains', name: 'Mountains', item: 'horse' },
  { id: 'bird', name: 'Bird', item: 'brush' },
]
export const murderItems = { comb: 'Comb', abacus: 'Mercantile Abacus', nobleHat: 'Noble’s Hat', shears: 'Gardening Shears', pufferfish: 'Pufferfish', plumPit: 'Plum Pit', monkshood: 'Monkshood Flower', teaWhisk: 'Tea Whisk', horse: 'Horse Statuette', brush: 'Calligraphy Brush', medallion: 'Crest Medallion' }
// All nine pairs checked against Margwa's visible solver, 19 September 2026.
// Unlisted pairs are undocumented, not evidence of an impossible game state.
const poisons = {
  merchant: { plant: 'plumPit', paralysis: 'pufferfish' },
  noble: { emesis: 'pufferfish', plant: 'monkshood' },
  gardener: { emesis: 'plumPit', paralysis: 'monkshood' },
}
export function solveMurder(clues = {}) {
  const suspect = murderSuspects.find(s => s.id === clues.suspect)
  const symptom = murderSymptoms.find(s => s.id === clues.symptom)
  const poison = suspect && symptom ? poisons[suspect.id][symptom.id] || null : null
  const status = !suspect || !symptom ? 'incomplete' : poison ? 'known' : 'unknown'
  return {
    poison, status,
    items: ['comb', suspect?.item || null, poison, murderPaintings.find(p => p.id === clues.painting)?.item || null, 'medallion'],
    dial: Number.isInteger(clues.delay) && clues.delay >= 1 && clues.delay <= 5 ? zodiacHour(clues.hour, clues.delay) : null,
  }
}
