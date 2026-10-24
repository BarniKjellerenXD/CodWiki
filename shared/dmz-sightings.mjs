// Sightings: where players have met a roaming boss or found a world recipe or
// loot, counted per place. Commander where rows, recipe spots, recipe hotspots
// and loot rows share one row shape and these helpers. Counts are reports or
// finds, never spawn or drop rates. Copies (copyOf) and clips from one uploader
// (same) count once here only; the Intel and map confidence rule is unchanged.

import { dmzIntel, intelDateLabel, intelSources } from './dmz-intel.mjs'
import { guideSources } from './dmz-guide-sources.mjs'
import { mapReportSources } from './dmz-map-reports.mjs'

export const SIGHTINGS_CHECKED = '24 Oct 2026'
export const SIGHTINGS_ROUND = '2026-10-24'

// Row: { kind: 'mission' | 'scripted' | 'seen' | 'unplaced' | 'listed', report?, pin?, layer?,
//   where, square?, search?, mission?, seen?, sources: [registry keys], claims?: [{ text, checked: false }],
//   disputed?, note?, videos?: VideoRef[], how?, fallback? }
// A row has at most one of report, pin and layer; layer marks a class row such
// as 'Any police station'. seen is a positive count, left out on listed rows.
// VideoRef: { id: registry key, at?: 'm:ss', why, shows?: true }. shows means the
// video's title, description or chapters name the place: only then is its key in
// row.sources and counted in seen. Without it the video is only a Watch it done link.

export const LEGEND = {
  report: 'Counts are reports from guides, players and videos, not spawn rates.',
  find: 'Counts are published finds, not drop rates.',
}
// Rates stay out of row text; only claims[].text, tagged Not checked, may give one.
export const NO_PERCENT = /%|\bpercent|\ba third\b|\bmost of the time\b/i
export const VIDEO_CAP = 3

export const STUCK_VIDEOS = [
  { id: 'youtube-ap6kpzmgau8', at: '1:57', why: 'Two players catch Colossus between them during a safe run' },
  { id: 'youtube-u8b_ru-p07i', at: '11:19', why: 'The Colossus fight inside Operation Iron Citadel' },
  { id: 'youtube-q0m5u2rkgyu', why: 'The whole Tempered recipe chain, from The Doctor to the extract' },
]

export const anySource = id => intelSources[id] || guideSources[id] || mapReportSources[id]

// A copy counts as the page it copies, clips sharing a same key count once and
// anything else counts once per URL.
export function rootOf(id) {
  const visited = new Set()
  let key = id
  while (anySource(key)?.copyOf && !visited.has(key)) {
    visited.add(key)
    key = anySource(key).copyOf
  }
  const source = anySource(key)
  if (source?.same) return `same:${source.same}`
  return source?.url ? source.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '') : key
}
export const independentReports = (ids = []) => new Set(ids.map(rootOf)).size

export function sourcesSummary(ids = []) {
  const pages = [...new Set(ids)]
  const copies = pages.filter(id => anySource(id)?.copyOf).length
  const text = `${pages.length} ${pages.length === 1 ? 'page' : 'pages'}`
  return copies ? `${text} · ${copies} ${copies === 1 ? 'copies' : 'copy'} another` : text
}

export function rowConfidence(row) {
  const sources = row.sources || []
  if (sources.some(id => anySource(id)?.type === 'official')) return 'official'
  return independentReports(sources) >= 2 ? 'confirmed' : 'reported'
}

// The only place rank words are made. Seen rows and unplaced rows are each
// ranked among their own kind by seen, most first (ties keep data order), with
// competition ranks 1=, 1=, 3, 4. Returns copies of those rows with rank, words
// (or null) and chance; mission, scripted and listed rows get no rank. A row
// without a kind counts as seen.
const MOST = { report: 'reported', find: 'finds' }
const kindOf = row => row.kind || 'seen'

export function rankWords(rows, unit = 'report') {
  return ['seen', 'unplaced'].flatMap(kind => {
    const list = rows.filter(row => kindOf(row) === kind).sort((a, b) => b.seen - a.seen)
    const lead = (list[0]?.seen || 0) - (list[1]?.seen || 0)
    return list.map(row => {
      const ahead = list.filter(other => other.seen > row.seen).length
      const tied = list.filter(other => other.seen === row.seen).length > 1
      // A row alone in its group leads nothing, so it gets no words.
      const words = ahead || list.length < 2 ? null : tied ? `Joint most ${MOST[unit]}` : lead >= 2 ? `Most ${MOST[unit]}` : null
      return { ...row, rank: `${ahead + 1}${tied ? '=' : ''}`, words, chance: row.seen === 1 }
    })
  })
}

export function groupRows(rows, unit = 'report') {
  const ranked = rankWords(rows, unit)
  return {
    mission: rows.filter(row => ['mission', 'scripted'].includes(kindOf(row))),
    seen: ranked.filter(row => kindOf(row) === 'seen'),
    unplaced: ranked.filter(row => kindOf(row) === 'unplaced'),
    listed: rows.filter(row => kindOf(row) === 'listed'),
  }
}

// The first n ranked seen rows, plus any rows tied with the last of them.
export function topRows(rows, n = 3, unit = 'report') {
  const seen = groupRows(rows, unit).seen
  const last = seen[n - 1]
  return last ? seen.filter((row, index) => index < n || row.seen === last.seen) : seen
}

export const countLabel = (n, unit = 'report') => `${n} ${unit}${n === 1 ? '' : 's'}`

export function rowTarget(row) {
  if (row.report || row.pin) return { pin: row.report || row.pin }
  return row.layer ? { layer: row.layer } : null
}

// source is a registry entry or its key; at is 'm:ss' or 'h:mm:ss'.
export function videoUrl(source, at) {
  const url = (typeof source === 'string' ? anySource(source) : source)?.url
  if (!url || !at) return url
  const link = new URL(url)
  link.searchParams.set('t', `${at.split(':').reduce((total, part) => total * 60 + Number(part), 0)}s`)
  return link.href
}

// A patch logged in Intel after this round may have moved spawns and loot.
export function sightingsStale(entries = dmzIntel) {
  const later = entries
    .filter(entry => entry.category === 'dates' && entry.id?.startsWith('patch-'))
    .flatMap(entry => [entry.added, entry.updated])
    .filter(date => date > SIGHTINGS_ROUND)
    .sort()
  return later.length ? `Checked before the ${intelDateLabel(later[0])} patch, may have changed` : null
}
