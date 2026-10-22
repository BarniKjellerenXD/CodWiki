<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel } from '#shared/dmz-intel.mjs'
import { labDesks, labDesk } from '#shared/dmz-lab.mjs'

// Concept A: Intel split into FOB-style stations. The station sits in ?s= so
// each one has its own link, as separate pages would.
type Entry = (typeof dmzIntel)[number]
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'intel')!.icon
const open = ref<Entry | null>(null)
const desk = computed({
  get: () => labDesk(String(route.query.s || ''))?.id || labDesks[0]!.id,
  set: id => router.replace({ query: { ...route.query, s: id === labDesks[0]!.id ? undefined : id } }),
})
</script>

<template>
  <div class="dmz-page">
    <DmzLabBanner concept="a" />
    <DmzPageHead title="Intel stations" :icon="icon" :status="`${labDesks.length} stations · ${dmzIntel.length} entries · locations and keys stay on the Tac-Map and key tracker`">
      <p class="lab-lede">Pick a station, as you would at the FOB. Each one shows a single job, laid out for that job.</p>
    </DmzPageHead>
    <div class="a-body">
      <DmzLabStations v-model:desk="desk" @open="open = $event" />
    </div>
    <DmzLabDrawer :entry="open" @close="open = null" />
  </div>
</template>

<style scoped>
.a-body { margin-top: 1.75rem; }
</style>
