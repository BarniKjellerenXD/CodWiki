<script setup lang="ts">
import { materialSpots } from '#shared/dmz-playbooks.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { hajinPin } from '#shared/dmz-map.mjs'
import { placeLink } from '#shared/dmz-stations.mjs'

// Where exactly one printer material turns up: the places with the room and
// what to search, a route for one run, other ways to get it, and whether the
// printer can make it later.
const props = withDefaults(defineProps<{ name: string, map?: boolean, level?: 3 | 4 | 5 }>(), { map: true, level: 4 })
const spots = computed(() => materialSpots(props.name))
const pins = computed(() => [...new Set((spots.value?.spots || []).map((spot: { pin?: string }) => spot.pin).filter(Boolean))] as string[])
const h = computed(() => `h${props.level}`)
const placeName = (id?: string) => (id && hajinPin(id)?.name) || ''
</script>

<template>
  <div v-if="spots" class="ms">
    <DmzMiniMap v-if="map && pins.length" :pins="pins" :label="`Where to find ${spots.name}`" />
    <section v-if="spots.spots?.length" class="ms-part">
      <component :is="h" class="ms-label dmz-mono">Best spots</component>
      <ul class="ms-spots">
        <li v-for="spot in spots.spots" :key="`${spot.pin}-${spot.where}`">
          <NuxtLink v-if="spot.pin && placeName(spot.pin)" :to="placeLink(spot.pin)" class="ms-place">{{ placeName(spot.pin) }}</NuxtLink>
          <span class="ms-where">{{ spot.where }}</span>
          <span v-if="spot.search" class="ms-search"><span class="dmz-mono">Search</span> {{ spot.search }}</span>
        </li>
      </ul>
    </section>
    <section v-if="spots.route?.length" class="ms-part">
      <component :is="h" class="ms-label dmz-mono">One run</component>
      <ol class="ms-list"><li v-for="step in spots.route" :key="step">{{ step }}</li></ol>
    </section>
    <section v-if="spots.also?.length" class="ms-part">
      <component :is="h" class="ms-label dmz-mono">Also from</component>
      <ul class="ms-list"><li v-for="line in spots.also" :key="line">{{ line }}</li></ul>
    </section>
    <p v-if="spots.print" class="ms-print"><span class="dmz-mono">Print it</span> {{ spots.print }}</p>
    <div class="ms-foot">
      <span class="dz-badge" :class="`is-${spots.confidence}`">{{ intelConfidenceLabel(spots.confidence) }}</span>
      <p v-if="spots.note" class="ms-note">{{ spots.note }}</p>
    </div>
    <DmzGuideSources :ids="spots.sources" label="Spot sources" />
  </div>
</template>

<style scoped>
.ms { display: grid; gap: 0.75rem; }
.ms :deep(.mm) { max-width: 30rem; }
.ms-part { display: grid; gap: 0.375rem; }
.ms-label { margin: 0; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.ms-spots { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.ms-spots li { display: grid; gap: 0.125rem; padding: 0.5rem 0.75rem; border-left: 2px solid var(--dz-teal); background: rgba(11, 13, 12, 0.5); }
.ms-place { justify-self: start; font-weight: 700; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.ms-where { color: #dcd9cb; font-size: 0.9375rem; line-height: 1.45; }
.ms-search { color: var(--dz-ink-2); font-size: 0.875rem; }
.ms-search .dmz-mono, .ms-print .dmz-mono { margin-right: 0.25rem; font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.ms-list { margin: 0; padding-left: 1.15rem; list-style: disc; display: grid; gap: 0.3rem; color: #dcd9cb; font-size: 0.9375rem; line-height: 1.45; }
ol.ms-list { list-style: decimal; }
ol.ms-list li::marker { color: var(--dz-teal); font-weight: 700; }
.ms-print { margin: 0; color: #dcd9cb; font-size: 0.9375rem; }
.ms-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.ms-note { margin: 0; color: var(--dz-muted); font-size: 0.875rem; }
</style>
