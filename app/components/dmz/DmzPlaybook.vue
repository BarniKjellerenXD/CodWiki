<script setup lang="ts">
import { bossPlaybook } from '#shared/dmz-playbooks.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { intelEntry } from '#shared/dmz-stations.mjs'
import { hajinReports } from '#shared/dmz-map.mjs'

// How to find and kill one boss, in the order a squad needs it: where players
// have met it (a roaming Commander), where to look, what the fight throws at
// you, the kill in steps, then what to bring, what to avoid, what drops and
// videos. map adds a Tac-Map cut of the places it names.
const props = withDefaults(defineProps<{ id: string, map?: boolean, level?: 3 | 4 | 5 }>(), { map: false, level: 4 })
const book = computed(() => bossPlaybook(props.id))
const name = computed(() => intelEntry(props.id)?.name || props.id)
const h = computed(() => `h${props.level}`)
const MEET: Record<string, string> = { 'colossus': 'him', 'deathstalker': 'it', 'main-nk-battle-tank': 'it' }
const meet = computed(() => MEET[props.id] || name.value)
// With where rows, the map marks the places their reports belong to.
const anchorOf = new Map(hajinReports.map(report => [report.id, report.anchor]))
const pins = computed(() => {
  const anchors = (book.value?.where || []).flatMap((row: { report?: string }) => (row.report && anchorOf.get(row.report)) || [])
  return anchors.length ? [...new Set(anchors)] : book.value?.pins || []
})
const WHERE_ICON = 'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z M10 10a2 2 0 1 0 4 0a2 2 0 1 0-4 0'
const parts = [
  { key: 'find', label: 'Find', icon: 'M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5' },
  { key: 'fight', label: 'What it does', icon: 'M12 3.5l9 16H3z M12 10v4 M12 17v.5' },
  { key: 'kill', label: 'How to kill', icon: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M17 12a5 5 0 1 1-10 0a5 5 0 1 1 10 0 M12 11v2', ordered: true },
  { key: 'bring', label: 'Bring', icon: 'M3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3 M3 13h18' },
  { key: 'avoid', label: 'Avoid', icon: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18z M9 9l6 6 M15 9l-6 6' },
  { key: 'loot', label: 'Loot', icon: 'M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8' },
] as const
const shown = computed(() => parts.filter(part => book.value?.[part.key]?.length))
</script>

<template>
  <div v-if="book" class="pb">
    <section v-if="book.where?.length" class="pb-where">
      <component :is="h" class="pb-label dmz-mono"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="WHERE_ICON" /></svg>Where players meet {{ meet }}</component>
      <p v-if="book.lead" class="pb-lead">{{ book.lead }}</p>
      <DmzSightings :rows="book.where" />
    </section>
    <DmzMiniMap v-if="map && pins.length" :pins="pins" :label="`Where to find ${name}`" />
    <div class="pb-grid">
      <section v-for="part in shown" :key="part.key" class="pb-part" :class="`pb-part--${part.key}`">
        <component :is="h" class="pb-label dmz-mono"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="part.icon" /></svg>{{ part.label }}</component>
        <component :is="'ordered' in part ? 'ol' : 'ul'" class="pb-list">
          <li v-for="line in book[part.key]" :key="line">{{ line }}</li>
        </component>
      </section>
    </div>
    <div class="pb-foot">
      <span class="dz-badge" :class="`is-${book.confidence}`">{{ intelConfidenceLabel(book.confidence) }}</span>
      <p v-if="book.note" class="pb-note">{{ book.note }}</p>
    </div>
    <DmzVideoGuides :refs="book.videos" :empty="book.noVideo" />
    <DmzGuideSources :ids="book.sources" label="How-to sources" />
  </div>
</template>

<style scoped>
.pb { display: grid; gap: 0.75rem; }
.pb :deep(.mm) { max-width: 30rem; }
.pb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 0.5rem; }
.pb-part { padding: 0.75rem 0.875rem; border-left: 2px solid var(--pb-c, var(--dz-line-strong)); background: rgba(11, 13, 12, 0.5); }
.pb-part--kill { --pb-c: var(--dz-accent); grid-column: 1 / -1; }
.pb-part--fight { --pb-c: #ef7a5a; }
.pb-part--find { --pb-c: var(--dz-teal); }
.pb-part--loot { --pb-c: var(--dz-green); }
.pb-part--avoid { --pb-c: #d8c47c; }
.pb-where { --pb-c: var(--dz-teal); display: grid; gap: 0.5rem; min-width: 0; }
.pb-where .pb-label { margin: 0; }
.pb-lead { margin: 0; max-width: 46rem; color: #f3f1e5; font-size: 1rem; line-height: 1.45; }
.pb-label { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.375rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--pb-c, var(--dz-ink-2)); }
.pb-label svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.pb-list { margin: 0; padding-left: 1.15rem; list-style: disc; display: grid; gap: 0.3rem; color: #dcd9cb; font-size: 0.9375rem; line-height: 1.45; }
ol.pb-list { list-style: decimal; }
ol.pb-list li::marker { color: var(--dz-accent); font-weight: 700; }
.pb-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.pb-note { margin: 0; color: var(--dz-muted); font-size: 0.875rem; }
@media (max-width: 599px) {
  .pb-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
