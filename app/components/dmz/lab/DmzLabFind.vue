<script setup lang="ts">
import { dmzIntel, intelCategory, intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { rankIntel, placesInSquare, placeLink } from '#shared/dmz-lab.mjs'

// Ranked search over Intel as a combobox: type, use the arrow keys, press Enter.
// The page decides what picking an entry does (usually the drawer).
type Entry = (typeof dmzIntel)[number]
const props = withDefaults(defineProps<{
  categories?: string[]
  placeholder?: string
  limit?: number
  // hero: a big field with results always below it; inline: results drop down.
  variant?: 'hero' | 'inline'
  label?: string
}>(), { placeholder: 'Search Intel: a key, a boss, a recipe…', limit: 8, variant: 'inline', label: 'Search Intel' })
const emit = defineEmits<{ pick: [entry: Entry], active: [entry: Entry | null] }>()
const query = defineModel<string>({ default: '' })

const uid = useId()
const input = ref<HTMLInputElement>()
const focused = ref(false)
const cursor = ref(0)
const pool = computed(() => props.categories ? dmzIntel.filter(entry => props.categories!.includes(entry.category)) : dmzIntel)
const ranked = computed(() => rankIntel(query.value, { entries: pool.value, limit: props.limit }))
const squares = computed(() => props.categories ? [] : placesInSquare(query.value))
const open = computed(() => query.value.trim() !== '' && (props.variant === 'hero' || focused.value))
const activeId = computed(() => open.value && ranked.value.results[cursor.value] ? `${uid}-opt-${cursor.value}` : undefined)

watch(query, () => { cursor.value = 0 })
watch(() => ranked.value.results[cursor.value] || null, entry => emit('active', open.value ? entry : null), { immediate: true })

// Wraps the matched words in <mark> without trusting the name as HTML.
function parts(name: string) {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return [{ text: name, hit: false }]
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
function onKey(event: KeyboardEvent) {
  const count = ranked.value.results.length
  if (event.key === 'ArrowDown' && count) { event.preventDefault(); cursor.value = (cursor.value + 1) % count }
  else if (event.key === 'ArrowUp' && count) { event.preventDefault(); cursor.value = (cursor.value - 1 + count) % count }
  else if (event.key === 'Enter' && count) { event.preventDefault(); pick(ranked.value.results[cursor.value]!) }
  else if (event.key === 'Escape' && query.value) { event.preventDefault(); event.stopPropagation(); query.value = '' }
}
function pick(entry: Entry) {
  emit('pick', entry)
  if (props.variant === 'inline') input.value?.blur()
}
// Clicks on a result land before the field loses focus.
function onBlur() { setTimeout(() => { focused.value = false }, 120) }
defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div class="lf" :class="`lf--${variant}`">
    <label class="lab-search lf-field">
      <span class="sr-only">{{ label }}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
      <input
        ref="input" v-model="query" type="search" role="combobox" :placeholder="placeholder" autocomplete="off" spellcheck="false"
        :aria-expanded="open" :aria-controls="`${uid}-list`" :aria-activedescendant="activeId" aria-autocomplete="list"
        @keydown="onKey" @focus="focused = true" @blur="onBlur"
      >
      <slot name="hint" />
    </label>
    <div v-show="open" class="lf-pop">
      <p class="lf-count dmz-mono" role="status">{{ ranked.total ? `${ranked.total} match${ranked.total === 1 ? '' : 'es'}${ranked.total > ranked.results.length ? ` · top ${ranked.results.length}` : ''}` : `Nothing matches “${query.trim()}”` }}</p>
      <ul :id="`${uid}-list`" role="listbox" class="lf-list" :aria-label="`${label} results`">
        <li
          v-for="(entry, index) in ranked.results" :id="`${uid}-opt-${index}`" :key="entry.id" role="option" :aria-selected="index === cursor"
          class="lf-opt" :class="{ 'is-cursor': index === cursor }" @mousedown.prevent @mousemove="cursor = index" @click="pick(entry)"
        >
          <span class="lf-name w-semi"><template v-for="(part, i) in parts(entry.name)" :key="i"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
          <span class="lf-kind dmz-mono">{{ [entry.type, intelCategory(entry.category)?.label].filter(Boolean).join(' · ') }}</span>
          <span class="lab-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}</span>
        </li>
      </ul>
      <div v-if="squares.length" class="lf-squares">
        <span class="dmz-mono">On the Tac-Map in {{ query.trim().toUpperCase() }}</span>
        <NuxtLink v-for="place in squares" :key="place.id" :to="placeLink(place.id)" class="lab-chip">{{ place.name }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lf { position: relative; }
.lf--hero .lf-field { min-height: 3.75rem; padding: 0 1.375rem; border-radius: 18px; background: rgba(14, 16, 15, 0.78); }
.lf--hero .lf-field input { height: 3.5rem; font-size: 1.25rem; }
.lf-pop { display: flex; flex-direction: column; gap: 0.25rem; }
.lf--inline .lf-pop { position: absolute; left: 0; right: 0; top: calc(100% + 0.375rem); z-index: 30; max-height: min(28rem, 60vh); overflow-y: auto; padding: 0.5rem; background: #161a19; border: 1px solid var(--dz-line-strong); border-radius: 16px; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45); }
.lf--hero .lf-pop { margin-top: 0.75rem; }
.lf-count { margin: 0.25rem 0.5rem 0.25rem; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.lf-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.125rem; }
.lf-opt { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'name badge' 'kind badge'; align-items: center; gap: 0.1rem 0.75rem; min-height: 3rem; padding: 0.5rem 0.75rem; border-radius: 10px; cursor: pointer; }
.lf-opt.is-cursor { background: rgba(233, 230, 214, 0.12); box-shadow: inset 3px 0 var(--dz-ink); }
.lf-name { grid-area: name; font-size: 1.0625rem; font-weight: 600; color: #f3f1e5; }
.lf-name mark { background: transparent; color: var(--dz-accent); text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 0.18em; }
.lf-kind { grid-area: kind; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.lf-opt .lab-badge { grid-area: badge; }
.lf-squares { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin-top: 0.5rem; padding: 0.625rem 0.5rem 0.25rem; border-top: 1px solid var(--dz-line); }
.lf-squares .dmz-mono { width: 100%; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
</style>
