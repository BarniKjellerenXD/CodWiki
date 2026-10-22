<script setup lang="ts">
import { DMZ_INTEL_CHECKED } from '#shared/dmz-intel.mjs'
import { intelStation, stationEntries } from '#shared/dmz-stations.mjs'

const station = intelStation('armory')!
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Armory" :icon="station.icon" :checked="DMZ_INTEL_CHECKED" :status="`Intel · ${stationEntries(station).length} entries`">
      <p class="dz-lede">{{ station.desc }}</p>
    </DmzPageHead>
    <DmzIntelNav />
    <DmzIntelShelf station="armory" />
  </div>
</template>
