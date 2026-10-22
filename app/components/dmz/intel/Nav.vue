<script setup lang="ts">
import { intelStations, intelEverything } from '#shared/dmz-stations.mjs'

// The Intel stations in one strip, on every station page. It scrolls sideways on phones.
const links = [{ id: 'start', label: 'Start', path: '/dmz/intel' }, ...intelStations, intelEverything]
const strip = ref<HTMLElement>()
onMounted(() => strip.value?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }))
</script>

<template>
  <nav class="inav" aria-label="Intel stations">
    <ul ref="strip" class="inav-list">
      <li v-for="link in links" :key="link.id"><NuxtLink :to="link.path" class="dz-chip inav-chip">{{ link.label }}</NuxtLink></li>
    </ul>
  </nav>
</template>

<style scoped>
.inav { margin-top: 1.25rem; }
.inav-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.375rem; }
.inav-chip { min-height: 2.5rem; padding: 0 0.875rem; font-size: 0.9rem; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; }
@media (max-width: 899px) {
  .inav { margin: 1rem -1rem 0; }
  .inav-list { flex-wrap: nowrap; overflow-x: auto; padding: 0 1rem 0.25rem; scrollbar-width: none; }
  .inav-list::-webkit-scrollbar { display: none; }
  .inav-chip { min-height: 2.75rem; white-space: nowrap; }
}
</style>
