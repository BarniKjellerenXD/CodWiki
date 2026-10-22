import { hydrateSpotlight } from '#shared/spotlight.mjs'
import version from '~/data/spotlightVersion.json'
import { THEMES } from './useSettings'

// Site-wide search state. The index and preview text are static files fetched
// on first use: a dynamic import() here would sit in the entry chunk, and Nuxt
// prefetches the entry's dynamic imports on every page.
export type SpotlightItem = ReturnType<typeof hydrateSpotlight>[number] & { run?: () => void }

const RECENT_KEY = 'codwiki-spotlight-recent'
const open = ref(false)
const query = ref('')
const scope = ref('all')
const expanded = ref<string[]>([])
const items = shallowRef<SpotlightItem[] | null>(null)
const previews = shallowRef<Record<string, string> | null>(null)
const failed = ref(false)
let loading: Promise<SpotlightItem[]> | null = null
let loadingText: Promise<Record<string, string>> | null = null

function actions(): SpotlightItem[] {
  const { setTheme } = useSettings()
  const rows = [
    { id: 'action:settings', name: 'Reading settings', kind: 'action', route: '', keywords: 'settings theme text size font preferences', run: () => window.dispatchEvent(new CustomEvent('codwiki:open-settings')) },
    ...THEMES.map(theme => ({ id: `action:theme-${theme.id}`, name: `Theme: ${theme.name}`, kind: 'action', route: '', context: theme.description, keywords: `theme colour color appearance ${theme.scheme}`, run: () => setTheme(theme.id) })),
    { id: 'action:zombies', name: 'Go to Zombies home', kind: 'action', route: '/', keywords: 'zombies home maps games start' },
    { id: 'action:dmz', name: 'Go to DMZ stations', kind: 'action', route: '/dmz', keywords: 'dmz mw4 stations menu' },
  ]
  return hydrateSpotlight({}, rows) as SpotlightItem[]
}

async function fetchData(name: keyof typeof version) {
  const response = await fetch(`/spotlight/${name}.json?v=${version[name]}`)
  if (!response.ok) throw new Error(`Spotlight ${name} returned ${response.status}`)
  return response.json()
}

function loadSpotlight() {
  if (items.value) return Promise.resolve(items.value)
  loading ||= fetchData('index')
    .then(index => {
      items.value = [...hydrateSpotlight(index), ...actions()] as SpotlightItem[]
      failed.value = false
      return items.value
    })
    .catch(error => {
      loading = null
      failed.value = true
      throw error
    })
  return loading
}

function loadPreviews() {
  if (previews.value) return Promise.resolve(previews.value)
  loadingText ||= fetchData('text')
    .then(text => (previews.value = text as Record<string, string>))
    .catch(error => {
      loadingText = null
      throw error
    })
  return loadingText
}

function readRecent(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter(id => typeof id === 'string').slice(0, 8) : []
  }
  catch { return [] }
}
const recent = ref<string[]>([])
function writeRecent(list: string[]) {
  recent.value = list
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)) }
  catch {}
}

export function useSpotlight() {
  function openSpotlight(text = '') {
    query.value = text
    scope.value = 'all'
    expanded.value = []
    recent.value = readRecent()
    open.value = true
    loadSpotlight().catch(() => {})
  }
  function closeSpotlight() { open.value = false }
  function prefetchSpotlight() { loadSpotlight().catch(() => {}) }
  function remember(id: string) {
    if (!id || id.startsWith('action:')) return
    writeRecent([id, ...readRecent().filter(other => other !== id)].slice(0, 8))
  }
  function clearRecent() { writeRecent([]) }
  return { open, query, scope, expanded, items, previews, failed, recent, openSpotlight, closeSpotlight, prefetchSpotlight, loadSpotlight, loadPreviews, remember, clearRecent }
}
