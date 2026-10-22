<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelCategories } from '#shared/dmz-intel.mjs'
import { labSuggestions, rankIntel } from '#shared/dmz-lab.mjs'

// Concept E: Intel as a search palette. On this page / or Ctrl K focuses it;
// the real version would sit in the DMZ shell and open from any station.
type Entry = (typeof dmzIntel)[number]
const icon = dmzStations.find(station => station.id === 'intel')!.icon
const query = ref('')
const limit = ref(10)
const active = ref<Entry | null>(null)
const open = ref<Entry | null>(null)
const find = ref<{ focus: () => void }>()
const total = computed(() => rankIntel(query.value, { limit: 0 }).total)
const kinds = intelCategories.map(category => ({ ...category, count: dmzIntel.filter(entry => entry.category === category.id).length })).filter(kind => kind.count)

function search(text: string) {
  query.value = text
  nextTick(() => find.value?.focus())
}
watch(query, () => { limit.value = 10 })
// Captured, so on this concept page the keys focus its own field before the
// site-wide search sees them; once that search is open they are its own.
const spotlight = useSpotlight().open
function onKey(event: KeyboardEvent) {
  if (event.defaultPrevented || open.value || spotlight.value || !event.key) return
  const typing = (event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')
  if ((event.key === '/' && !typing) || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))) {
    event.preventDefault()
    find.value?.focus()
  }
}
onMounted(() => window.addEventListener('keydown', onKey, { capture: true }))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, { capture: true }))
</script>

<template>
  <div class="dmz-page">
    <DmzLabBanner concept="e" />
    <DmzPageHead title="Quick find" :icon="icon" :status="`${dmzIntel.length} entries · ranked by name first`">
      <p class="lab-lede">Type what you saw: a key card, a name on the kill feed, a grid square. Arrow keys move, Enter opens. On a real station this palette opens from a search button in the rail, or with <kbd class="dmz-kbd">/</kbd> and <kbd class="dmz-kbd">Ctrl K</kbd>.</p>
    </DmzPageHead>

    <div class="e-palette" :class="{ 'is-searching': query.trim() }">
      <div class="e-left">
        <DmzLabFind ref="find" v-model="query" variant="hero" :limit="limit" placeholder="Search Intel, or a square such as H6" @pick="open = $event" @active="active = $event">
          <template #hint><span class="e-keys dmz-mono" aria-hidden="true"><kbd class="dmz-kbd">/</kbd></span></template>
        </DmzLabFind>
        <button v-if="total > limit && limit < 40" type="button" class="e-more dmz-mono" @click="limit += 10">Show more results</button>

        <div v-if="!query.trim()" class="e-empty">
          <section aria-labelledby="e-try">
            <h2 id="e-try" class="e-sub dmz-mono">Try</h2>
            <div class="lab-chips">
              <button v-for="word in labSuggestions" :key="word" type="button" class="lab-chip" @click="search(word)">{{ word }}</button>
            </div>
          </section>
          <section aria-labelledby="e-kinds">
            <h2 id="e-kinds" class="e-sub dmz-mono">Or browse a kind</h2>
            <div class="lab-chips">
              <button v-for="kind in kinds" :key="kind.id" type="button" class="lab-chip" @click="search(kind.label.toLowerCase())">{{ kind.label }}<span class="dmz-mono">{{ kind.count }}</span></button>
            </div>
          </section>
        </div>
      </div>

      <aside class="e-preview" aria-label="Preview">
        <template v-if="active && query.trim()">
          <DmzLabDossier :key="active.id" :entry="active" />
          <button type="button" class="dmz-pill e-open" @click="open = active">Open with related entries</button>
        </template>
        <div v-else class="e-preview-empty">
          <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
          <p>The highlighted result shows here in full, so you can read without leaving the list.</p>
        </div>
      </aside>
    </div>

    <DmzLabDrawer :entry="open" @close="open = null" />
  </div>
</template>

<style scoped>
.e-palette { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; gap: 1.5rem; margin-top: 1.75rem; }
.e-left { display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; }
.e-keys { display: inline-flex; gap: 0.25rem; }
.e-more { align-self: flex-start; min-height: 2.75rem; padding: 0 0.875rem; border: 1px dashed var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-ink); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.e-empty { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1rem; }
.e-sub { margin: 0 0 0.5rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.e-preview { position: sticky; top: 1.5rem; max-height: calc(100vh - 3rem); overflow-y: auto; padding: 1.25rem 1.375rem; background: rgba(20, 24, 23, 0.82); border: 1px solid var(--dz-line); border-radius: 18px; scrollbar-width: thin; }
.e-open { margin-top: 1rem; min-height: 2.75rem; font-size: 0.95rem; }
.e-preview-empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 2.5rem 1rem; text-align: center; color: var(--dz-muted); }
.e-preview-empty .lab-icon { width: 2.25rem; height: 2.25rem; }
.e-preview-empty p { margin: 0; max-width: 20rem; }
.lab-lede .dmz-kbd { vertical-align: 0.1em; }
@media (max-width: 899px) {
  .e-palette { grid-template-columns: 1fr; margin-top: 1.25rem; }
  .e-preview { display: none; }
  .e-keys { display: none; }
}
</style>
