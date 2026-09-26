import { readReaderContext } from './mapNavigation.mjs'
export const PROGRESS_KEY = 'codwiki-progress-v1'
export function emptyProgress() { return { version: 1, runs: {}, toys: {}, last: null } }
export function readProgress(raw) {
  try {
    const data = JSON.parse(raw)
    if (data?.version !== 1) return emptyProgress()
    const result = emptyProgress()
    for (const [id, run] of Object.entries(data.runs || {})) {
      if (!/^[a-z0-9-]+$/.test(id) || !run || typeof run !== 'object') continue
      result.runs[id] = {
        done: Array.isArray(run.done) ? [...new Set(run.done.filter(s => typeof s === 'string'))] : [],
        section: typeof run.section === 'string' ? run.section : '',
        view: ['quick', 'full', 'map'].includes(run.view) ? run.view : 'quick',
        reader: readReaderContext(run),
        collapsed: run.collapsed && typeof run.collapsed === 'object' ? run.collapsed : {},
        groups: Array.isArray(run.groups) ? run.groups.filter(s=>typeof s==='string') : [],
        hideCompleted: run.hideCompleted === true,
      }
    }
    for (const [id, done] of Object.entries(data.toys || {})) if (/^[a-z0-9-]+$/.test(id)) result.toys[id] = done === true
    if (data.last && /^\/guides\/[a-z0-9-]+$/.test(data.last.route) && typeof data.last.title === 'string') result.last = { route: data.last.route, title: data.last.title, section: typeof data.last.section === 'string' ? data.last.section : '' }
    return result
  } catch { return emptyProgress() }
}
export function ensureRun(state, id) {
  return state.runs[id] ||= { done: [], section: '', view: 'quick', collapsed: {}, groups: [] }
}
export function resetRun(state, id) {
  const run = ensureRun(state, id)
  run.done = []
  run.section = ''
  if (run.reader) run.reader.section = ''
  if (state.last?.route.endsWith('/' + id)) state.last.section = ''
}
export function partStatus(done, steps) {
  const count = steps.filter(step => done.includes(step.id)).length
  return count === steps.length && count > 0 ? 'complete' : count > 0 ? 'partial' : 'empty'
}
export function togglePart(done, steps) {
  const ids = new Set(steps.map(step => step.id))
  const rest = done.filter(id => !ids.has(id))
  return partStatus(done, steps) === 'complete' ? rest : [...rest, ...ids]
}
export function normalizeSearch(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
export function searchCatalogue(entries, query) {
  const q = normalizeSearch(query)
  if (!q) return []
  const words = q.split(' ')
  return entries.map(entry => {
    const name = normalizeSearch(entry.name)
    const haystack = normalizeSearch(`${entry.name} ${entry.keywords || ''} ${entry.map || ''}`)
    const score = words.every(word => haystack.includes(word)) ? (name === q ? 100 : name.startsWith(q) ? 70 : name.includes(q) ? 50 : 10) + (entry.kind === 'Tool' ? 5 : 0) : 0
    return { entry, score }
  }).filter(hit => hit.score).sort((a,b)=>b.score-a.score || a.entry.name.localeCompare(b.entry.name)).map(hit=>hit.entry)
}
