<script setup lang="ts">
import type { Ref } from 'vue'
import { SPOTLIGHT_SCOPES, groupSpotlight, normalizeSpotlight, searchSpotlight, spotlightContext } from '#shared/spotlight.mjs'
import type { SpotlightItem } from '~/composables/useSpotlight'

// The search dialog. One list holds every option, so the arrow keys and
// aria-activedescendant work the same for results, recents, chips and tiles.
// more: the group a "Show all" option expands. Option ids come from the
// result, so the active descendant changes whenever the result does.
type Option = { index: number, id: string, item?: SpotlightItem, text?: string, more?: string }
type Section = { id: string, label: string, layout: 'row' | 'chip' | 'tile', options: Option[], total?: number, capped?: boolean, clear?: boolean }
// An expanded group renders at most this many rows.
const SHOW_MAX = 150
const slug = (value: string) => value.replace(/[^a-zA-Z0-9]+/g, '-')

const { open, query, scope, expanded, items, previews, failed, recent, closeSpotlight, loadSpotlight, loadPreviews, remember, clearRecent } = useSpotlight()
const route = useRoute()
const router = useRouter()
const input = ref<HTMLInputElement>()
const panel = ref<HTMLElement>()
const list = ref<HTMLElement>()
const active = ref(0)
const wide = ref(false)
const phone = ref(false)
const isMac = ref(false)
const isDmz = computed(() => /^\/dmz(?:\/|$)/.test(route.path))
let returnFocus: HTMLElement | null = null
let previousOverflow = ''

const TRY = ['Pack-a-Punch', 'Ray Gun', 'Juggernog', 'serum', 'Wunderwaffe', 'Kino', 'Bale', 'H6']
const JUMPS = [
  { id: 'jump:/', name: 'Zombies maps', route: '/', icon: 'guide', badge: 'Page', context: 'Every game and map' },
  { id: 'jump:/#tools', name: 'Puzzle tools', route: '/#tools', icon: 'tool', badge: 'Page', context: 'Solvers and trackers' },
  { id: 'jump:/dmz', name: 'DMZ stations', route: '/dmz', icon: 'station', badge: 'DMZ', context: 'Modern Warfare 4' },
  { id: 'jump:/dmz/stash', name: 'Key tracker', route: '/dmz/stash', icon: 'key', badge: 'DMZ', context: 'Keys and locked rooms' },
  { id: 'jump:/dmz/orders', name: 'Orders tracker', route: '/dmz/orders', icon: 'order', badge: 'DMZ', context: 'Order tasks' },
] as SpotlightItem[]
const ICONS: Record<string, string> = {
  guide: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z M5 19.5A1.5 1.5 0 0 0 6.5 21H19 M9 7h6',
  tool: 'M14.5 4a4.5 4.5 0 0 0-4.3 5.8L3.5 16.5v4h4l6.7-6.7A4.5 4.5 0 1 0 14.5 4z',
  section: 'M5 6h14 M5 12h14 M5 18h9',
  step: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18z M8.5 12.5l2.5 2.5 4.5-5',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z',
  station: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  key: 'M8 15.5a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M11.5 11.5H21 M18 11.5v3 M15 11.5v2',
  order: 'M8 3h8v3H8z M6 4.5H5V21h14V4.5h-1 M8 11h8 M8 15h5',
  intel: 'M12 10v11 M8 6.5a6 6 0 0 0 0 8 M16 6.5a6 6 0 0 1 0 8 M5 3.5a10 10 0 0 0 0 14 M19 3.5a10 10 0 0 1 0 14',
  action: 'M13 3L5 14h6l-1 7 8-11h-6z',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13z M15.5 15.5L21 21',
}

const byId = computed(() => new Map((items.value || []).map(item => [item.id, item])))
const here = computed(() => spotlightContext(route.path, items.value || []))
const mapName = computed(() => here.value.map ? items.value?.find(item => item.kind === 'guide' && item.map === here.value.map && item.route === `/guides/${item.map}`)?.name || items.value?.find(item => item.kind === 'guide' && item.map === here.value.map)?.name || '' : '')
const scopes = computed(() => SPOTLIGHT_SCOPES.filter(option => option.id !== 'map' || here.value.map).map(option => ({ ...option, label: option.id === 'map' ? mapName.value || option.label : option.label })))
const search = computed(() => items.value && query.value.trim() ? searchSpotlight(items.value, query.value, { scope: scope.value, here: here.value, limit: Infinity }) : { results: [], total: 0, fuzzy: false })
const currentPath = computed(() => route.path.replace(/\/+$/, '') || '/')

const sections = computed<Section[]>(() => {
  let index = 0
  const wrap = (section: string, list: SpotlightItem[]): Option[] => list.map(item => ({ index: index++, id: `sp-${section}-${slug(item.id)}`, item }))
  if (query.value.trim()) {
    const [top, ...rest] = search.value.results as SpotlightItem[]
    if (!top) return []
    const groups = groupSpotlight(rest, { perGroup: phone.value ? 4 : 5, open: expanded.value }) as { id: string, label: string, total: number, items: SpotlightItem[] }[]
    return [
      { id: 'top', label: 'Top hit', layout: 'row', options: wrap('top', [top]) },
      ...groups.map(group => {
        const open = expanded.value.includes(group.id)
        const options = wrap(group.id, group.items.slice(0, SHOW_MAX))
        if (!open && group.items.length < group.total) options.push({ index: index++, id: `sp-more-${group.id}`, more: group.id })
        return { id: group.id, label: group.label, layout: 'row' as const, total: group.total, capped: open && group.total > SHOW_MAX, options }
      }),
    ]
  }
  if (!items.value) return []
  const result: Section[] = []
  const recents = recent.value.map(id => byId.value.get(id)).filter((item): item is SpotlightItem => !!item).slice(0, phone.value ? 4 : 6)
  if (recents.length) result.push({ id: 'recent', label: 'Recent', layout: 'row', options: wrap('recent', recents), clear: true })
  const page = pageItems.value
  if (page.length) result.push({ id: 'page', label: `On this map · ${mapName.value}`, layout: 'row', options: wrap('page', page) })
  result.push({ id: 'try', label: 'Try', layout: 'chip', options: TRY.map(text => ({ index: index++, id: `sp-try-${slug(text)}`, text })) })
  result.push({ id: 'jump', label: 'Jump to', layout: 'tile', options: wrap('jump', JUMPS) })
  return result
})
const options = computed(() => sections.value.flatMap(section => section.options))
const current = computed(() => options.value[active.value])
const activeId = computed(() => current.value?.id)

// On a guide or tool page: that map's guide, tools and first quest parts.
// On DMZ pages the rail already lists the stations, so nothing is added.
const pageItems = computed(() => {
  const list = items.value
  if (!list) return []
  if (here.value.mode === 'd') return []
  const map = here.value.map
  if (!map) return []
  const pick = (kind: string) => list.filter(item => item.kind === kind && item.map === map && item.route !== currentPath.value)
  return [...pick('guide'), ...pick('tool'), ...pick('part').slice(0, 3)].slice(0, phone.value ? 5 : 8)
})

watch([query, scope], () => {
  active.value = 0
  expanded.value = []
  list.value?.scrollTo?.({ top: 0 })
})
// Clearing recents shortens the list without a new query.
watch(() => options.value.length, length => { if (active.value >= length) active.value = Math.max(0, length - 1) })
watch(() => route.fullPath, () => { if (open.value) close(false) })

// Highlight each query word where it starts a word, else its first match.
function segments(text: string) {
  const words = normalizeSpotlight(query.value).split(' ').filter(Boolean)
  if (!words.length) return [{ text, mark: false }]
  const lower = text.toLowerCase()
  const ranges: [number, number][] = []
  for (const word of words) {
    const found: [number, number][] = []
    for (let at = lower.indexOf(word); at >= 0; at = lower.indexOf(word, at + 1)) {
      if (at === 0 || !/[a-z0-9]/.test(lower[at - 1]!)) found.push([at, at + word.length])
    }
    const first = lower.indexOf(word)
    ranges.push(...(found.length ? found : first >= 0 && word.length > 2 ? [[first, first + word.length] as [number, number]] : []))
  }
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const range of ranges) {
    const last = merged.at(-1)
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push([...range])
  }
  const parts: { text: string, mark: boolean }[] = []
  let at = 0
  for (const [start, end] of merged) {
    if (start > at) parts.push({ text: text.slice(at, start), mark: false })
    parts.push({ text: text.slice(start, end), mark: true })
    at = end
  }
  if (at < text.length) parts.push({ text: text.slice(at), mark: false })
  return parts
}

const count = computed(() => {
  if (!query.value.trim()) return ''
  if (!items.value) return 'Loading…'
  const total = search.value.total
  return total ? `${total} result${total === 1 ? '' : 's'}` : 'No results'
})
const announcement = ref('')
let announceTimer: ReturnType<typeof setTimeout> | undefined
watch(count, value => {
  clearTimeout(announceTimer)
  announceTimer = setTimeout(() => { announcement.value = value }, 450)
})

function move(delta: number) {
  const total = options.value.length
  if (!total) return
  active.value = (active.value + delta + total) % total
  nextTick(() => document.getElementById(activeId.value || '')?.scrollIntoView({ block: 'nearest' }))
}
function onInputKey(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    event.stopPropagation()
    move(event.key === 'ArrowDown' ? 1 : -1)
  }
  else if (event.key === 'Enter' && current.value) {
    event.preventDefault()
    event.stopPropagation()
    choose(current.value, event.ctrlKey || event.metaKey)
  }
}
function onOptionClick(event: MouseEvent, option: Option) {
  // Let the browser handle new-tab clicks on real links.
  if (option.item?.route && !option.item.run && (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0)) {
    remember(option.item.id)
    return
  }
  event.preventDefault()
  choose(option)
}
function choose(option: Option, newTab = false) {
  if (option.more) return expand(option.more)
  if (option.text) {
    query.value = option.text
    input.value?.focus()
    return
  }
  const item = option.item
  if (!item) return
  if (item.run) {
    item.run()
    close(item.id !== 'action:settings')
    return
  }
  if (!item.id.startsWith('jump:')) remember(item.id)
  if (newTab) {
    window.open(item.route, '_blank', 'noopener')
    return
  }
  close(false)
  go(item.route)
}
// Pages scroll to and highlight their own anchors when the hash changes.
// Picking the address already open changes nothing, so clear its hash first
// and set it again; both steps replace, leaving history as it was.
async function go(target: string) {
  if (target !== route.fullPath) return router.push(target)
  if (!route.hash) return
  await router.replace({ query: route.query, hash: '' })
  await nextTick()
  return router.replace(target)
}
// "Show all" sits after the group's last shown result, so once the group opens
// the same position holds its first newly shown result.
function expand(id: string) {
  const at = options.value.findIndex(option => option.more === id)
  expanded.value = [...expanded.value, id]
  nextTick(() => {
    const target = options.value[at]
    if (target) { active.value = at; document.getElementById(target.id)?.scrollIntoView({ block: 'nearest' }) }
    input.value?.focus()
  })
}
function clear() {
  query.value = ''
  input.value?.focus()
}
function retry() { loadSpotlight().catch(() => {}) }
// Focus goes back where it was when the dialog unmounts, however it closed
// (Ctrl K included), unless it closed to open a result.
let restoreFocus = true
function close(restore = true) {
  restoreFocus = restore
  closeSpotlight()
}

// Esc closes here first, so the DMZ shell does not also open its station menu.
function onWindowKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  event.preventDefault()
  event.stopPropagation()
  close()
}
function onPanelKey(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [...panel.value.querySelectorAll<HTMLElement>(':is(input, button:not([disabled]), a[href]):not([tabindex="-1"])')].filter(el => el.offsetParent !== null)
  const first = focusable[0], last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}

const preview = computed(() => current.value?.item || null)
const previewText = computed(() => preview.value ? previews.value?.[preview.value.id] || '' : '')

// The layout follows the window, so rotating a phone or resizing keeps a way to close.
const media: [MediaQueryList, (event: MediaQueryListEvent) => void][] = []
function follow(query: string, target: Ref<boolean>) {
  const list = window.matchMedia(query)
  const update = (event: MediaQueryListEvent) => { target.value = event.matches }
  target.value = list.matches
  list.addEventListener('change', update)
  media.push([list, update])
}
watch(wide, value => { if (value) loadPreviews().catch(() => {}) })

onMounted(() => {
  returnFocus = document.activeElement as HTMLElement | null
  previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  follow('(min-width: 1024px)', wide)
  follow('(max-width: 640px)', phone)
  isMac.value = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  window.addEventListener('keydown', onWindowKey, { capture: true })
  // Text handed over from the home search keeps the caret at its end, so typing carries on.
  nextTick(() => {
    input.value?.focus()
    input.value?.setSelectionRange(query.value.length, query.value.length)
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKey, { capture: true })
  for (const [list, update] of media) list.removeEventListener('change', update)
  document.documentElement.style.overflow = previousOverflow
  clearTimeout(announceTimer)
  if (restoreFocus) returnFocus?.focus?.({ preventScroll: true })
})
</script>

<template>
  <Teleport to="body">
    <div class="sp" :class="{ dmz: isDmz }">
      <div class="sp-scrim" aria-hidden="true" @click="close()" />
      <div ref="panel" class="sp-panel" :class="{ 'has-preview': wide }" role="dialog" aria-modal="true" aria-label="Search CodWiki" @keydown="onPanelKey">
        <div class="sp-main">
          <div class="sp-head">
            <div class="sp-field">
              <svg class="sp-icon sp-field-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.search" /></svg>
              <input
                ref="input" v-model="query" class="sp-input" type="text" role="combobox" aria-autocomplete="list"
                :aria-expanded="options.length > 0" aria-controls="sp-list" :aria-activedescendant="activeId"
                aria-label="Search CodWiki" placeholder="Search maps, steps, spots, tools, DMZ…"
                autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" @keydown="onInputKey"
              >
              <button v-if="query" type="button" class="sp-clear" aria-label="Clear search" @click="clear"><svg class="sp-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12 M18 6L6 18" /></svg></button>
              <button v-if="!phone" type="button" class="sp-kbd sp-esc" aria-label="Close search" @click="close()">Esc</button>
              <button v-else type="button" class="sp-cancel" @click="close()">Cancel</button>
            </div>
            <div class="sp-scopes" role="group" aria-label="Search in">
              <button v-for="option in scopes" :key="option.id" type="button" class="sp-scope" :aria-pressed="scope === option.id" @click="scope = option.id; input?.focus()">{{ option.label }}</button>
            </div>
          </div>

          <div ref="list" class="sp-body">
            <p v-if="failed" class="sp-status">Search could not load. <button type="button" class="sp-link" @click="retry">Try again</button></p>
            <p v-else-if="!items" class="sp-status">Loading search…</p>
            <p v-if="search.fuzzy" class="sp-note">No exact matches. Showing close spellings.</p>
            <div v-if="items && query.trim() && !search.total" class="sp-empty">
              <p><strong>No results for “{{ query.trim() }}”.</strong></p>
              <p>Try fewer words, a map or item name, or a grid square such as H6.</p>
              <button v-if="scope !== 'all'" type="button" class="sp-link" @click="scope = 'all'">Search everything instead</button>
            </div>
            <!-- Outside the listbox, which may only hold options; it sits over the Recent heading. -->
            <button v-if="sections[0]?.clear" type="button" class="sp-link sp-clear-recent" @click="clearRecent(); input?.focus()">Clear recent</button>
            <div id="sp-list" role="listbox" aria-label="Search results">
              <div v-for="section in sections" :key="section.id" class="sp-group" :class="`is-${section.layout}`" role="group" :aria-labelledby="`sp-g-${section.id}`">
                <div class="sp-group-head">
                  <span :id="`sp-g-${section.id}`" class="sp-group-label">{{ section.label }}</span>
                  <span v-if="section.total && section.total > 1" class="sp-group-count">{{ section.total }}</span>
                </div>
                <div class="sp-options">
                  <template v-for="option in section.options" :key="option.id">
                    <button v-if="option.text" :id="option.id" type="button" role="option" tabindex="-1" class="sp-chip" :aria-selected="option.index === active" @click="choose(option)" @mousemove="active = option.index">{{ option.text }}</button>
                    <div v-else-if="option.more" :id="option.id" role="option" tabindex="-1" class="sp-more" :aria-selected="option.index === active" :aria-label="`Show all ${section.total} ${section.label}`" @click="choose(option)" @mousemove="active = option.index">Show all {{ section.total }}</div>
                    <component
                      :is="option.item!.route && !option.item!.run ? 'a' : 'div'" v-else
                      :id="option.id" :href="option.item!.run ? undefined : option.item!.route || undefined"
                      role="option" tabindex="-1" :aria-selected="option.index === active"
                      :class="section.layout === 'tile' ? 'sp-tile' : ['sp-row', { 'is-top': section.id === 'top' }]"
                      @click="onOptionClick($event, option)" @mousemove="active = option.index"
                    >
                      <span class="sp-kind" aria-hidden="true"><svg class="sp-icon" viewBox="0 0 24 24"><path :d="ICONS[option.item!.icon] || ICONS.section" /></svg></span>
                      <span class="sp-text">
                        <span class="sp-name"><template v-for="(part, i) in segments(option.item!.name)" :key="i"><mark v-if="part.mark">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
                        <span v-if="option.item!.context" class="sp-context">{{ option.item!.context }}</span>
                      </span>
                      <span v-if="section.layout === 'row'" class="sp-badge">{{ option.item!.badge }}</span>
                    </component>
                  </template>
                </div>
                <div v-if="section.capped" class="sp-capped">Showing the first {{ SHOW_MAX }}. Add a word to narrow it.</div>
              </div>
            </div>
          </div>

          <footer v-if="!phone" class="sp-foot" aria-hidden="true">
            <span><kbd class="sp-kbd">↑</kbd><kbd class="sp-kbd">↓</kbd> move</span>
            <span><kbd class="sp-kbd">Enter</kbd> open</span>
            <span><kbd class="sp-kbd">{{ isMac ? '⌘' : 'Ctrl' }} Enter</kbd> new tab</span>
            <span class="sp-foot-count">
              <template v-if="count">{{ count }}</template>
              <template v-else><kbd class="sp-kbd">{{ isMac ? '⌘' : 'Ctrl' }} K</kbd> or <kbd class="sp-kbd">/</kbd> on any page</template>
            </span>
          </footer>
        </div>

        <aside v-if="wide" class="sp-preview" aria-label="Preview">
          <template v-if="preview">
            <p class="sp-preview-kind"><svg class="sp-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS[preview.icon] || ICONS.section" /></svg>{{ preview.badge }}</p>
            <h2 class="sp-preview-name">{{ preview.name }}</h2>
            <p v-if="preview.context" class="sp-preview-context">{{ preview.context }}</p>
            <p v-if="previewText" class="sp-preview-text">{{ previewText }}</p>
            <p v-else-if="preview.run" class="sp-preview-text">Runs right away. Press Enter.</p>
            <button type="button" class="sp-open" @click="choose(current!)">{{ preview.run ? 'Run' : 'Open' }} <span aria-hidden="true">→</span></button>
            <p v-if="!preview.run && preview.route" class="sp-preview-route">{{ preview.route }}</p>
          </template>
          <div v-else class="sp-preview-empty">
            <svg class="sp-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.search" /></svg>
            <p>Search every guide, quest step, map spot and tool, plus DMZ places, keys, Orders and Intel.</p>
          </div>
        </aside>
        <!-- Inside the modal panel, or screen readers would skip it. -->
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Site tokens on Zombies pages, so every reading theme applies; DMZ pages
   swap in the DMZ palette below. */
.sp {
  --sp-bg: var(--surface);
  --sp-raised: var(--surface-2);
  --sp-hover: var(--surface-3);
  --sp-line: var(--line);
  --sp-line-strong: var(--line-strong);
  --sp-text: var(--text);
  --sp-muted: var(--muted);
  --sp-faint: var(--faint);
  --sp-accent: var(--gold);
  --sp-accent-text: var(--gold-bright);
  --sp-accent-dim: var(--gold-dim);
  --sp-accent-border: var(--gold-border);
  --sp-on-accent: var(--on-gold);
  --sp-mark: var(--gold-dim);
  --sp-scrim: rgba(5, 6, 7, 0.62);
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10vh 1rem 1.5rem;
  color: var(--sp-text);
}
.sp.dmz {
  --sp-bg: #141817;
  --sp-raised: rgba(233, 230, 214, 0.07);
  --sp-hover: rgba(233, 230, 214, 0.12);
  --sp-line: var(--dz-line);
  --sp-line-strong: var(--dz-line-strong);
  --sp-text: var(--dz-ink);
  --sp-muted: var(--dz-muted);
  --sp-faint: #9a9b8f;
  --sp-accent: var(--dz-ink);
  --sp-accent-text: var(--dz-teal);
  --sp-accent-dim: rgba(233, 230, 214, 0.14);
  --sp-accent-border: var(--dz-line-strong);
  --sp-on-accent: var(--dz-bg);
  --sp-mark: rgba(221, 179, 99, 0.28);
  position: fixed;
  min-height: 0;
  background: transparent;
}
.sp-scrim { position: absolute; inset: 0; background: var(--sp-scrim); animation: sp-fade 0.14s ease-out both; }
.sp-panel { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); width: min(46rem, 100%); max-height: min(44rem, 80vh); background: var(--sp-bg); border: 1px solid var(--sp-line-strong); border-radius: var(--radius-lg, 18px); box-shadow: var(--shadow-lg, 0 24px 60px -30px rgba(0, 0, 0, 0.95)); overflow: hidden; animation: sp-in 0.16s ease-out both; }
.sp-panel.has-preview { grid-template-columns: minmax(0, 1fr) 20rem; width: min(64rem, 100%); }
.sp-main { display: flex; flex-direction: column; min-height: 0; min-width: 0; }

.sp-head { padding: 0.875rem 0.875rem 0.625rem; border-bottom: 1px solid var(--sp-line); }
.sp-field { display: flex; align-items: center; gap: 0.5rem; padding: 0 0.5rem 0 0.75rem; min-height: 3.25rem; background: var(--sp-raised); border: 1px solid var(--sp-line-strong); border-radius: 12px; }
.sp-field:focus-within { border-color: var(--sp-accent); box-shadow: 0 0 0 1px var(--sp-accent); }
.sp-icon { width: 1.125rem; height: 1.125rem; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.sp-field-icon { width: 1.25rem; height: 1.25rem; color: var(--sp-accent-text); }
.sp-input { flex: 1; min-width: 0; height: 3rem; border: 0; background: transparent; color: var(--sp-text); font: inherit; font-size: 1.0625rem; outline: none; }
.sp-input::placeholder { color: var(--sp-faint); }
.sp-clear { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border: 0; border-radius: 999px; background: transparent; color: var(--sp-muted); cursor: pointer; }
.sp-clear:hover { color: var(--sp-text); background: var(--sp-hover); }
.sp-cancel { min-height: 2.75rem; padding: 0 0.5rem; border: 0; background: transparent; color: var(--sp-accent-text); font: inherit; font-weight: 600; cursor: pointer; }
.sp-kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 1.5rem; height: 1.375rem; padding: 0 0.375rem; border: 1px solid var(--sp-line-strong); border-bottom-width: 2px; border-radius: 5px; background: var(--sp-bg); color: var(--sp-muted); font-family: ui-monospace, 'JetBrains Mono', Consolas, monospace; font-size: 0.6875rem; font-weight: 600; line-height: 1; }
.sp-esc { position: relative; margin-right: 0.25rem; cursor: pointer; }
.sp-esc::before { content: ''; position: absolute; inset: -0.625rem -0.5rem; }
.sp-esc:hover { color: var(--sp-text); border-color: var(--sp-muted); }
.sp-scopes { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.625rem; }
.sp-scope { min-height: 2.25rem; padding: 0 0.875rem; border: 1px solid var(--sp-line); border-radius: 999px; background: transparent; color: var(--sp-muted); font: inherit; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
.sp-scope:hover { color: var(--sp-text); border-color: var(--sp-line-strong); }
.sp-scope[aria-pressed='true'] { background: var(--sp-accent-dim); border-color: var(--sp-accent-border); color: var(--sp-accent-text); }

.sp-body { position: relative; flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0.375rem 0.5rem 0.75rem; scrollbar-width: thin; }
.sp-clear-recent { position: absolute; top: 0.875rem; right: 1.125rem; z-index: 1; font-size: 0.8125rem; }
.sp-status, .sp-note { margin: 0.5rem 0.5rem 0.25rem; color: var(--sp-muted); font-size: 0.875rem; }
.sp-note { color: var(--sp-accent-text); }
.sp-empty { margin: 1rem 0.5rem; color: var(--sp-muted); }
.sp-empty p { margin: 0 0 0.375rem; }
.sp-empty strong { color: var(--sp-text); }
.sp-link { padding: 0; border: 0; background: none; color: var(--sp-accent-text); font: inherit; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }

.sp-group { margin-top: 0.625rem; }
.sp-group-head { display: flex; align-items: baseline; gap: 0.5rem; padding: 0 0.625rem 0.25rem; }
.sp-group-label { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--sp-faint); }
.sp-group-count { font-size: 0.75rem; color: var(--sp-faint); }
.sp-options { display: flex; flex-direction: column; gap: 1px; }
.is-chip .sp-options { flex-direction: row; flex-wrap: wrap; gap: 0.375rem; padding: 0.125rem 0.375rem; }
.is-tile .sp-options { display: grid; grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr)); gap: 0.375rem; padding: 0.125rem 0.375rem; }

.sp-row { display: flex; align-items: center; gap: 0.75rem; min-height: 3.25rem; padding: 0.5rem 0.625rem; border-radius: 10px; color: var(--sp-text) !important; text-decoration: none; cursor: pointer; }
.sp-row.is-top { min-height: 3.75rem; }
.sp-row[aria-selected='true'], .sp-tile[aria-selected='true'] { background: var(--sp-hover); box-shadow: inset 3px 0 var(--sp-accent); }
.sp-kind { display: grid; place-items: center; flex: none; width: 2.125rem; height: 2.125rem; border-radius: 9px; background: var(--sp-raised); color: var(--sp-accent-text); }
.is-top .sp-kind { width: 2.5rem; height: 2.5rem; background: var(--sp-accent-dim); }
.sp-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.sp-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; line-height: 1.3; }
.is-top .sp-name { font-size: 1.0625rem; }
.sp-name mark { background: var(--sp-mark); color: inherit; border-radius: 3px; box-shadow: 0 0 0 1px var(--sp-mark); }
.sp-context { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--sp-muted); font-size: 0.8125rem; line-height: 1.35; }
.sp-badge { flex: none; max-width: 9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0.125rem 0.5rem; border: 1px solid var(--sp-line); border-radius: 999px; color: var(--sp-muted); font-size: 0.75rem; }
.sp-chip { min-height: 2.25rem; padding: 0 0.875rem; border: 1px solid var(--sp-line-strong); border-radius: 999px; background: transparent; color: var(--sp-text); font: inherit; font-size: 0.875rem; cursor: pointer; }
.sp-chip[aria-selected='true'], .sp-chip:hover { border-color: var(--sp-accent); background: var(--sp-accent-dim); }
.sp-tile { display: flex; align-items: center; gap: 0.625rem; min-height: 3.25rem; padding: 0.5rem 0.625rem; border: 1px solid var(--sp-line); border-radius: 12px; color: var(--sp-text) !important; text-decoration: none; cursor: pointer; }
.sp-tile .sp-kind { width: 1.875rem; height: 1.875rem; }
.sp-tile .sp-name { font-size: 0.9375rem; }
.sp-tile .sp-context { font-size: 0.75rem; }
.sp-more { display: flex; align-items: center; min-height: 2.5rem; padding: 0 0.625rem 0 3.5rem; border-radius: 10px; color: var(--sp-accent-text); font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
.sp-more[aria-selected='true'] { background: var(--sp-hover); box-shadow: inset 3px 0 var(--sp-accent); text-decoration: underline; text-underline-offset: 0.2em; }
.sp-capped { margin: 0.25rem 0 0; padding: 0 0.625rem 0 3.5rem; color: var(--sp-faint); font-size: 0.8125rem; }

.sp-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem 1rem; padding: 0.5rem 0.875rem; border-top: 1px solid var(--sp-line); color: var(--sp-faint); font-size: 0.75rem; }
.sp-foot span { display: inline-flex; align-items: center; gap: 0.25rem; }
.sp-foot-count { margin-left: auto; }

.sp-preview { display: flex; flex-direction: column; min-height: 0; overflow-y: auto; padding: 1.25rem; background: var(--sp-raised); border-left: 1px solid var(--sp-line); }
.sp-preview-kind { display: inline-flex; align-items: center; gap: 0.375rem; margin: 0; color: var(--sp-accent-text); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.sp-preview-name { margin: 0.5rem 0 0; font-size: 1.25rem; line-height: 1.25; color: var(--sp-text); }
.sp-preview-context { margin: 0.375rem 0 0; color: var(--sp-muted); font-size: 0.875rem; }
.sp-preview-text { margin: 0.875rem 0 0; color: var(--sp-text); font-size: 0.9375rem; line-height: 1.55; }
.sp-open { align-self: flex-start; display: inline-flex; align-items: center; gap: 0.375rem; margin-top: 1.125rem; min-height: 2.5rem; padding: 0 1.125rem; border: 1px solid var(--sp-accent); border-radius: 999px; background: var(--sp-accent); color: var(--sp-on-accent); font: inherit; font-weight: 700; cursor: pointer; }
.sp-open:hover { filter: brightness(1.08); }
.sp-preview-route { margin: 0.625rem 0 0; color: var(--sp-faint); font-family: ui-monospace, 'JetBrains Mono', Consolas, monospace; font-size: 0.6875rem; word-break: break-all; }
.sp-preview-empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin: auto 0; text-align: center; color: var(--sp-muted); font-size: 0.875rem; }
.sp-preview-empty .sp-icon { width: 2rem; height: 2rem; color: var(--sp-accent-text); }

.sp :focus-visible { outline: 2px solid var(--sp-accent); outline-offset: 2px; }
.sp-input:focus-visible { outline: none; }
.sp.dmz .sp-group-label, .sp.dmz .sp-preview-kind { font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace; }
.sp.dmz .sp-preview-name { font-size: 1.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; font-variation-settings: 'wdth' 75; }

@keyframes sp-fade { from { opacity: 0; } }
@keyframes sp-in { from { opacity: 0; transform: translateY(-0.5rem); } }
@media (prefers-reduced-motion: reduce) {
  .sp-scrim, .sp-panel { animation: none; }
}

/* Phones: a full-screen sheet, field on top, results right under it so the
   keyboard never hides them. */
@media (max-width: 640px) {
  .sp { padding: 0; }
  .sp-panel { width: 100%; height: 100%; max-height: none; border: 0; border-radius: 0; padding-top: env(safe-area-inset-top); }
  .sp-head { padding: 0.625rem 0.75rem 0.5rem; }
  .sp-input { font-size: 1rem; }
  .sp-scopes { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
  .sp-scope { flex: none; }
  .sp-body { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }
  .sp-badge { display: none; }
  .sp-more, .sp-capped { padding-left: 3.25rem; }
}
</style>
