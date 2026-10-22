<script setup lang="ts">
import { DMZ_INTEL_CHECKED } from '#shared/dmz-intel.mjs'
import { intelStation, stationEntries } from '#shared/dmz-stations.mjs'

const station = intelStation('manual')!
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Field manual" :icon="station.icon" :checked="DMZ_INTEL_CHECKED" :status="`Intel · ${stationEntries(station).length} entries`">
      <p class="dz-lede">{{ station.desc }}</p>
    </DmzPageHead>
    <DmzIntelNav />
    <DmzIntelShelf station="manual" />
  </div>
</template>
