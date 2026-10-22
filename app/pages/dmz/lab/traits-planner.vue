<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { TRAITS_CHECKED } from '#shared/dmz-traits.mjs'

// Concept T2: the same tree with the build planner switched on.
const icon = dmzStations.find(station => station.id === 'operators')!.icon
</script>

<template>
  <div class="dmz-page">
    <DmzTraitsLabBanner concept="t2" />
    <DmzPageHead title="Trait planner" :icon="icon" :checked="TRAITS_CHECKED" status="18 points · 9 per tree · saved on this device">
      <p class="lab-lede">Plan where your 18 Trait Points go. Tap nodes from the bottom up, one per row.</p>
    </DmzPageHead>
    <DmzTraitsBoard planner start-planning />
  </div>
</template>
