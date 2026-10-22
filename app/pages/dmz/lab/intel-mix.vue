<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel } from '#shared/dmz-intel.mjs'
import { labNeeds, labDesks, labDesk, mixNeedTargets } from '#shared/dmz-lab.mjs'

// The recommended mix: quick find (E) on top, ask-first tiles (B) that point at
// stations (A), and the stations themselves underneath. ?s= picks a station.
type Entry = (typeof dmzIntel)[number]
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'intel')!.icon
const open = ref<Entry | null>(null)
const query = ref('')
const stations = ref<HTMLElement>()
const desk = computed({
  get: () => labDesk(String(route.query.s || ''))?.id || labDesks[0]!.id,
  set: id => router.replace({ query: { ...route.query, s: id === labDesks[0]!.id ? undefined : id } }),
})
const needs = labNeeds.map(need => ({ ...need, target: mixNeedTargets[need.id as keyof typeof mixNeedTargets] }))
const targetLabel = (target: { desk?: string, to?: string }) => target.desk ? labDesk(target.desk)!.label : target.to === '/dmz/stash' ? 'Key tracker' : 'Orders tracker'

function goDesk(id: string) {
  desk.value = id
  nextTick(() => stations.value?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }))
}
</script>

<template>
  <div class="dmz-page">
    <DmzLabBanner concept="mix" />
    <DmzPageHead title="Intel" :icon="icon" :status="`${labDesks.length} stations · quick find on every DMZ page`" />

    <div class="m-find">
      <DmzLabFind v-model="query" variant="inline" :limit="8" placeholder="Search Intel: a key, a boss, a recipe, a square such as H6" @pick="open = $event" />
      <p class="m-find-note dmz-mono">On every station: <kbd class="dmz-kbd">/</kbd> or <kbd class="dmz-kbd">Ctrl K</kbd></p>
    </div>

    <section class="m-needs" aria-labelledby="m-needs">
      <h2 id="m-needs" class="m-question">What are you doing?</h2>
      <ul class="m-tiles">
        <li v-for="need in needs" :key="need.id">
          <button v-if="need.target.desk" type="button" class="m-tile" @click="goDesk(need.target.desk)">
            <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="need.icon" /></svg>
            <span class="m-tile-label">{{ need.label }}</span>
            <span class="m-tile-to dmz-mono">{{ targetLabel(need.target) }} <span aria-hidden="true">↓</span></span>
          </button>
          <NuxtLink v-else :to="need.target.to!" class="m-tile">
            <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="need.icon" /></svg>
            <span class="m-tile-label">{{ need.label }}</span>
            <span class="m-tile-to dmz-mono">{{ targetLabel(need.target) }} <span aria-hidden="true">↗</span></span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <div ref="stations" class="m-stations">
      <DmzLabStations v-model:desk="desk" @open="open = $event" />
    </div>

    <DmzLabDrawer :entry="open" @close="open = null" />
  </div>
</template>

<style scoped>
.m-find { position: relative; z-index: 5; margin-top: 1.5rem; max-width: 46rem; }
.m-find-note { display: flex; align-items: center; gap: 0.375rem; margin: 0.5rem 0 0 1.125rem; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.m-needs { margin-top: 2rem; }
.m-question { margin: 0 0 0.75rem; font-size: 1.125rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-teal); }
.m-tiles { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5rem; }
.m-tile { display: grid; grid-template-columns: auto 1fr; grid-template-areas: 'icon label' 'icon to'; align-items: center; gap: 0.125rem 0.75rem; width: 100%; height: 100%; min-height: 3.75rem; padding: 0.625rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 14px; background: rgba(20, 24, 23, 0.7); color: var(--dz-ink-2) !important; font: inherit; text-align: left; text-decoration: none; cursor: pointer; }
.m-tile:hover { border-color: var(--dz-line-strong); color: #fff !important; }
.m-tile .lab-icon { grid-area: icon; }
.m-tile-label { grid-area: label; font-size: 1.0625rem; font-weight: 600; line-height: 1.15; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f3f1e5; }
.m-tile-to { grid-area: to; font-size: 0.625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.m-stations { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--dz-line); scroll-margin-top: 1rem; }
@media (max-width: 899px) {
  .m-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .m-find-note { display: none; }
}
</style>
