// DMZ Intel: the searchable database behind /dmz/intel. Every entry names its
// sources and how sure we are. Rumours and datamines stay out; a claim with a
// single source is labelled Reported until a second, independent one agrees.

import { dmzOrders, dmzOrderRewards } from './dmz.mjs'
import { intelData, intelDataSources } from './dmz-intel-data.mjs'

export const DMZ_INTEL_CHECKED = '22 Oct 2026'

export const intelConfidence = [
  { id: 'official', label: 'Official', desc: 'Stated by Activision, Infinity Ward or a platform holder.' },
  { id: 'confirmed', label: 'Confirmed', desc: 'Two or more independent sources agree, or one shows it in-game.' },
  { id: 'reported', label: 'Reported', desc: 'One source so far. Likely, but not settled.' },
]

export const intelCategories = [
  { id: 'mechanics', label: 'Rules of the zone', desc: 'How matches, squads, death and MIA work.' },
  { id: 'exfil', label: 'Infil and exfil', desc: 'Getting in, getting out and what you keep.' },
  { id: 'map', label: 'Hajin locations', desc: 'Points of interest, smaller locations and hazards across the map.' },
  { id: 'vehicles', label: 'Vehicles', desc: 'What you can drive, fly and sail, and how fuel and repair work.' },
  { id: 'enemies', label: 'Enemies and bosses', desc: 'AI forces, Lieutenants, Commanders and what they drop.' },
  { id: 'keys', label: 'Keys and locked rooms', desc: 'Which keys exist and what they open.' },
  { id: 'missions', label: 'Orders and missions', desc: 'DMZ Orders, Story Missions, Dynamic Ops and Side Ops.' },
  { id: 'operators', label: 'Operators', desc: 'Active Duty slots, MIA recovery, Dog Tags and Prestige.' },
  { id: 'traits', label: 'Traits', desc: 'The Warfighter, Scout and Survivalist trees and what each trait does.' },
  { id: 'fob', label: 'FOB stations', desc: 'What each station does and when it unlocks.' },
  { id: 'crafting', label: '3D Printer and crafting', desc: 'Recipes and the materials they need.' },
  { id: 'gear', label: 'Weapons and gear', desc: 'Weapons, contraband, equipment and backpacks.' },
  { id: 'economy', label: 'Cash and progression', desc: 'DMZ Cash, the stash, levels and rewards.' },
  { id: 'tips', label: 'Field notes', desc: 'Advice players keep repeating. Community tips, not rules.' },
  { id: 'issues', label: 'Known issues', desc: 'Bugs and server problems reported since early access.' },
  { id: 'dates', label: 'Launch and seasons', desc: 'Dates, platforms, requirements and the season roadmap.' },
]

// type: official | press | guide | reddit | forum | video | in-game.
// In-game sources have no URL: they are screens CodWiki checked directly.
export const intelSources = {
  'in-game-orders': { label: 'In-game DMZ Orders screen, checked 20 Oct 2026', type: 'in-game' },
  ...intelDataSources,
}

// Tracked Orders come from dmz.mjs, so the tracker and the database agree.
const orderEntries = dmzOrders.map(order => ({
  id: `order-${order.id}`, category: 'missions', type: 'DMZ Order', name: order.name, summary: order.summary,
  details: [['Page', order.chapter], ...order.tasks.map((task, index) => [`Task ${index + 1}`, task.text]), ['Page reward', dmzOrderRewards[order.chapter]]],
  note: order.note, confidence: order.confidence, proof: order.proof, sources: order.sources, tracked: true,
}))

// details: [label, value] pairs shown as a fact list on the card.
// Entries carry no links to other pages; the drawer's one Go to leads to the
// entry's home (intelHome).
export const dmzIntel = [
  ...orderEntries,
  ...intelData,
]

// Entries from a later research round carry added or updated (ISO dates);
// the page flags the ones from the most recent round.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const intelDateLabel = iso => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
export const intelLatest = dmzIntel.map(entry => entry.added || entry.updated || '').sort().at(-1) || null
export function intelFresh(entry) {
  if (!intelLatest) return null
  return entry.added === intelLatest ? 'new' : entry.updated === intelLatest ? 'updated' : null
}

export const intelCategory = id => intelCategories.find(category => category.id === id)
export const intelConfidenceLabel = id => intelConfidence.find(level => level.id === id)?.label || id

export function intelSourceSite(source) {
  if (!source?.url) return 'In-game'
  try { return new URL(source.url).hostname.replace(/^www\./, '') } catch { return source.label }
}

// Everything a search can match: name, type, category, summary and details.
export function intelSearchText(entry) {
  return [entry.name, entry.type, intelCategory(entry.category)?.label, entry.summary, entry.note, ...(entry.details || []).flat()]
    .filter(Boolean).join(' ').toLowerCase()
}

// Every search word must appear somewhere in the entry.
export function filterIntel(entries, { category = 'all', confidence = null, query = '', fresh = false } = {}) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  return entries.filter(entry =>
    (category === 'all' || entry.category === category)
    && (!fresh || intelFresh(entry))
    && (!confidence || confidence.includes(entry.confidence))
    && words.every(word => intelSearchText(entry).includes(word)))
}

// Entries grouped in category order, skipping empty categories.
export function groupIntel(entries) {
  return intelCategories
    .map(category => ({ category, entries: entries.filter(entry => entry.category === category.id) }))
    .filter(group => group.entries.length)
}
