<script setup lang="ts">
import { dmzIntel, intelCategory, intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { rankIntel, placesInSquare, placeLink } from '#shared/dmz-stations.mjs'

// Ranked search over Intel as a combobox: type, use the arrow keys, press
// Enter. Picking an entry opens it in the drawer on this page.
type Entry = (typeof dmzIntel)[number]
const props = withDefaults(defineProps<{
  categories?: string[]
  placeholder?: string
  limit?: number
  label?: string
}>(), { placeholder: 'Search Intel: a key, a boss, a recipe…', limit: 8, label: 'Search Intel' })
const query = defineModel<string>({ default: '' })
const route = useRoute()
const router = useRouter()

const uid = useId()
const cursor = ref(0)
const pool = computed(() => props.categories ? dmzIntel.filter(entry => props.categories!.includes(entry.category)) : dmzIntel)
const ranked = computed(() => rankIntel(query.value, { entries: pool.value, limit: props.limit }))
const squares = computed(() => props.categories ? [] : placesInSquare(query.value))
const open = computed(() => query.value.trim() !== '')
const activeId = computed(() => open.value && ranked.value.results[cursor.value] ? `${uid}-opt-${cursor.value}` : undefined)

watch(query, () => { cursor.value = 0 })

// Wraps the matched words in <mark> without trusting the name as HTML.
function parts(name: string) {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  const lower = name.toLowerCase()
  const hits = new Array(name.length).fill(false)
  for (const word of words) {
    let at = lower.indexOf(word)
    while (at >= 0) { hits.fill(true, at, at + word.length); at = lower.indexOf(word, at + word.length) }
  }
  const out: { text: string, hit: boolean }[] = []
  for (let i = 0; i < name.length; i++) {
    const last = out.at(-1)
    if (last && last.hit === hits[i]) last.text += name[i]
    else out.push({ text: name[i]!, hit: hits[i]! })
  }
  return out
}
function pick(entry: Entry) {
  router.push({ query: route.query, hash: `#intel-${entry.id}` })
}
function onKey(event: KeyboardEvent) {
  const count = ranked.value.results.length
  if (event.key === 'ArrowDown' && count) { event.preventDefault(); cursor.value = (cursor.value + 1) % count }
  else if (event.key === 'ArrowUp' && count) { event.preventDefault(); cursor.value = (cursor.value - 1 + count) % count }
  else if (event.key === 'Enter' && count) { event.preventDefault(); pick(ranked.value.results[cursor.value]!) }
  // Esc clears the field first; the station menu opens on the next press.
  else if (event.key === 'Escape' && query.value) { event.preventDefault(); event.stopPropagation(); query.value = '' }
}
</script>

<template>
  <div class="if">
    <label class="dz-search if-field">
      <span class="sr-only">{{ label }}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
      <input
        v-model="query" type="search" role="combobox" :placeholder="placeholder" autocomplete="off" spellcheck="false"
        :aria-expanded="open" :aria-controls="`${uid}-list`" :aria-activedescendant="activeId" aria-autocomplete="list"
        @keydown="onKey"
      >
    </label>
    <div v-show="open" class="if-pop">
      <p class="if-count dmz-mono" role="status">{{ ranked.total ? `${ranked.total} match${ranked.total === 1 ? '' : 'es'}${ranked.total > ranked.results.length ? ` · top ${ranked.results.length}` : ''}` : `Nothing matches “${query.trim()}”` }}</p>
      <ul :id="`${uid}-list`" role="listbox" class="if-list" :aria-label="`${label} results`">
        <li
          v-for="(entry, index) in ranked.results" :id="`${uid}-opt-${index}`" :key="entry.id" role="option" :aria-selected="index === cursor"
          class="if-opt" :class="{ 'is-cursor': index === cursor }" @mousedown.prevent @mousemove="cursor = index" @click="pick(entry)"
        >
          <span class="if-name w-semi"><template v-for="(part, i) in parts(entry.name)" :key="i"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
          <span class="if-kind dmz-mono">{{ [entry.type, intelCategory(entry.category)?.label].filter(Boolean).join(' · ') }}</span>
          <span class="dz-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}</span>
        </li>
      </ul>
      <div v-if="squares.length" class="if-squares">
        <span class="dmz-mono">On the Tac-Map in {{ query.trim().toUpperCase() }}</span>
        <NuxtLink v-for="place in squares" :key="place.id" :to="placeLink(place.id)" class="dz-chip">{{ place.name }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.if-field { min-height: 3.75rem; padding: 0 1.375rem; border-radius: 18px; background: rgba(14, 16, 15, 0.78); }
.if-field input { height: 3.5rem; font-size: 1.25rem; }
.if-pop { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.75rem; }
.if-count { margin: 0.25rem 0.5rem; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.if-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.125rem; }
.if-opt { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'name badge' 'kind badge'; align-items: center; gap: 0.1rem 0.75rem; min-height: 3rem; padding: 0.5rem 0.75rem; border-radius: 10px; cursor: pointer; }
.if-opt.is-cursor { background: rgba(233, 230, 214, 0.12); box-shadow: inset 3px 0 var(--dz-ink); }
.if-name { grid-area: name; font-size: 1.0625rem; font-weight: 600; color: #f3f1e5; }
.if-name mark { background: transparent; color: var(--dz-accent); text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 0.18em; }
.if-kind { grid-area: kind; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.if-opt .dz-badge { grid-area: badge; }
.if-squares { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin-top: 0.5rem; padding: 0.625rem 0.5rem 0.25rem; border-top: 1px solid var(--dz-line); }
.if-squares .dmz-mono { width: 100%; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
</style>
