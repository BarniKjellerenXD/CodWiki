<script setup lang="ts">
import { DMZ_CHECKED, dmzStations } from '#shared/dmz.mjs'
// checked overrides the section-wide date on a page refreshed on its own.
const props = defineProps<{ title: string, icon: string, status?: string, checked?: string }>()
const route = useRoute()
// The lit station's game name sits above the title when the two differ, so
// DEPLOY reads over Hajin Exclusion Zone. Lab drafts match no station.
const station = computed(() => {
  const path = route.path.replace(/\/+$/, '')
  return dmzStations.find(station => station.route === path) || (path.startsWith('/dmz/intel/') ? dmzStations.find(station => station.id === 'intel') : undefined)
})
const eyebrow = computed(() => station.value && station.value.label.toLowerCase() !== props.title.toLowerCase() ? station.value.label : '')
</script>

<template>
  <header class="dh">
    <p v-if="eyebrow" class="dh-eyebrow dmz-mono">{{ eyebrow }}</p>
    <div class="dh-row">
      <div class="dh-title">
        <span class="dh-skew" aria-hidden="true" />
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="icon" /></svg>
        <h1 class="dmz-mono">{{ title }}</h1>
      </div>
      <p class="dh-pills dmz-mono"><span>MW4 · DMZ</span><span>Checked {{ checked || DMZ_CHECKED }}</span></p>
    </div>
    <p v-if="status" class="dh-status dmz-mono">{{ status }}</p>
    <slot />
  </header>
</template>

<style scoped>
.dh { padding-right: 3.5rem; }
.dh-eyebrow { margin: 0 0 0.375rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dz-muted); }
.dh-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
.dh-title { position: relative; display: inline-flex; align-items: center; gap: 0.875rem; padding: 0.375rem 1.5rem 0.375rem 0.625rem; }
.dh-skew { position: absolute; inset: 0; transform: skewX(-18deg); background: rgba(233, 230, 214, 0.16); }
.dh-title svg { position: relative; width: 1.75rem; height: 1.75rem; fill: none; stroke: var(--dz-ink); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.dh h1 { position: relative; margin: 0; font-size: clamp(1.25rem, 3vw, 1.875rem); font-weight: 800; line-height: 1.2; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dz-ink); }
.dh-pills { display: flex; gap: 0.25rem; margin: 0; padding: 0.25rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.55); font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; }
.dh-pills span { padding: 0.3rem 0.7rem; }
.dh-status { margin: 0.75rem 0 0; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); }
@media (max-width: 899px) {
  /* Phones also keep the search button beside the gear. */
  .dh { padding-right: 6.75rem; }
  .dh-pills { display: none; }
}
</style>
