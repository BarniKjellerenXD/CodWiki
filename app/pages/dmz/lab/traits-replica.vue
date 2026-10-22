<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { TRAITS_CHECKED } from '#shared/dmz-traits.mjs'

// Concept T1: the trait trees as the in-game screen, read-only.
const icon = dmzStations.find(station => station.id === 'operators')!.icon
</script>

<template>
  <div class="dmz-page">
    <DmzTraitsLabBanner concept="t1" />
    <DmzPageHead title="Trait trees" :icon="icon" :checked="TRAITS_CHECKED" status="3 trees · 9 rows each · tap a node">
      <p class="lab-lede">The TRAITS screen as it looks in game. Tap any node to read it.</p>
    </DmzPageHead>
    <DmzTraitsBoard />
  </div>
</template>
