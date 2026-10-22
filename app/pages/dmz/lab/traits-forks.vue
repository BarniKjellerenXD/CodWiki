<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { TRAITS_CHECKED } from '#shared/dmz-traits.mjs'

// Concept T3: each tree as its three Major forks with player tips.
const icon = dmzStations.find(station => station.id === 'operators')!.icon
</script>

<template>
  <div class="dmz-page">
    <DmzTraitsLabBanner concept="t3" />
    <DmzPageHead title="Trait forks" :icon="icon" :checked="TRAITS_CHECKED" status="3 trees · 9 forks · Minors folded">
      <p class="lab-lede">Every tree offers three Major forks. Here they are side by side, with what players say about each side.</p>
    </DmzPageHead>
    <DmzTraitsForks />
  </div>
</template>
