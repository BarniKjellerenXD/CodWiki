<script setup lang="ts">
import { recipePlaybook, recipeSpotLine } from '#shared/dmz-recipe-spots.mjs'
import { rowTarget, topRows } from '#shared/dmz-sightings.mjs'
import { layerLink, placeLink } from '#shared/dmz-stations.mjs'

type Row = { where: string, report?: string, pin?: string, layer?: string }
type Target = { pin?: string, layer?: string } | null

// Where one world recipe has been found. The line naming the place with the
// most finds always shows; the closed fold holds every find, a run to get it,
// what to do when it goes wrong and videos.
const props = defineProps<{ id: string }>()
const book = computed(() => recipePlaybook(props.id))
const line = computed(() => recipeSpotLine(props.id) as { kind: string, text: string } | null)
const rows = computed(() => (book.value?.rows || []) as Row[])
const hasFold = computed(() => !!(rows.value.length || book.value?.how?.length))

function linkTo(row: Row) {
  const target = rowTarget(row) as Target
  return target?.pin ? placeLink(target.pin) : target?.layer ? layerLink(target.layer) : null
}
// The line's text cut so each top place it names is a map link. A second name
// starts lower case mid-sentence, so names are matched without case.
const parts = computed(() => {
  const text = line.value?.text || ''
  const lower = text.toLowerCase()
  const out: { text: string, to: string | null }[] = []
  let from = 0
  if (line.value?.kind === 'found') {
    for (const row of topRows(rows.value, 1, 'find') as Row[]) {
      const to = linkTo(row)
      const at = lower.indexOf(row.where.toLowerCase(), from)
      if (!to || at < 0) continue
      out.push({ text: text.slice(from, at), to: null }, { text: text.slice(at, at + row.where.length), to })
      from = at + row.where.length
    }
  }
  return [...out, { text: text.slice(from), to: null }].filter(part => part.text)
})
</script>

<template>
  <div v-if="line || hasFold" class="rs">
    <p v-if="line" class="rs-line" :class="`is-${line.kind}`"><template v-for="(part, index) in parts" :key="index"><NuxtLink v-if="part.to" :to="part.to" class="rs-place">{{ part.text }}</NuxtLink><template v-else>{{ part.text }}</template></template></p>
    <details v-if="hasFold" class="rs-fold">
      <summary class="dmz-mono">Where it drops<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
      <div class="rs-body">
        <DmzSightings v-if="rows.length" :rows="rows" unit="find" />
        <p v-if="book.note" class="rs-note">{{ book.note }}</p>
        <section v-if="book.how?.length" class="rs-part">
          <p class="rs-label dmz-mono">How to get it <span v-if="book.advice" class="dz-badge rs-advice">Advice</span></p>
          <ol class="rs-list"><li v-for="step in book.how" :key="step">{{ step }}</li></ol>
        </section>
        <section v-if="book.fallback?.length" class="rs-part rs-part--fallback">
          <p class="rs-label dmz-mono">If it goes wrong <span class="dz-badge rs-advice">Advice</span></p>
          <ul class="rs-list"><li v-for="step in book.fallback" :key="step">{{ step }}</li></ul>
        </section>
        <DmzVideoGuides :refs="book.videos" :empty="book.noVideo" />
        <DmzGuideSources v-if="book.sources?.length" :ids="book.sources" label="How-to sources" />
      </div>
    </details>
  </div>
</template>

<style scoped>
.rs { display: grid; gap: 0.125rem; min-width: 0; }
.rs-line { margin: 0; color: #dcd9cb; font-size: 0.875rem; line-height: 1.4; overflow-wrap: anywhere; }
.rs-line.is-none { color: var(--dz-muted); }
.rs-place { display: inline-flex; align-items: center; min-height: 2.75rem; font-weight: 700; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.rs-fold summary { display: inline-flex; align-items: center; gap: 0.375rem; min-height: 2.75rem; cursor: pointer; list-style: none; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.rs-fold summary::-webkit-details-marker { display: none; }
.rs-fold summary svg { flex: none; width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.15s; }
.rs-fold[open] > summary svg { transform: rotate(180deg); }
.rs-body { display: grid; gap: 0.75rem; min-width: 0; padding: 0.25rem 0 0.5rem; }
.rs-note { margin: 0; color: var(--dz-muted); font-size: 0.875rem; }
.rs-part { display: grid; gap: 0.375rem; min-width: 0; padding: 0.625rem 0.875rem; border-left: 2px solid var(--dz-accent); background: rgba(11, 13, 12, 0.5); }
.rs-part--fallback { border-left-color: #d8c47c; }
.rs-label { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.5rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-accent); }
.rs-part--fallback .rs-label { color: #d8c47c; }
.rs-advice { color: var(--dz-ink-2); }
.rs-list { margin: 0; padding-left: 1.15rem; display: grid; gap: 0.3rem; }
.rs-list li { color: #dcd9cb; font-size: 0.9375rem; line-height: 1.45; overflow-wrap: anywhere; }
ol.rs-list { list-style: decimal; }
ul.rs-list { list-style: disc; }
ol.rs-list li::marker { color: var(--dz-accent); font-weight: 700; }
@media (prefers-reduced-motion: reduce) { .rs-fold summary svg { transition: none; } }
</style>
