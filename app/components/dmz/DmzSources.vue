<script setup lang="ts">
import { dmzSources, DMZ_CHECKED } from '#shared/dmz.mjs'
</script>

<template>
  <section id="sources" class="dmz-section dmz-panel">
    <span class="dmz-label dmz-mono">Sources · checked {{ DMZ_CHECKED }}</span>
    <ol class="dmz-sources">
      <li v-for="source in dmzSources" :key="source.url"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }}<span class="sr-only"> (opens in a new tab)</span></a></li>
    </ol>
    <p class="dmz-sources-note">Written from early-access reporting and source review, not an in-game playthrough. Details may change after launch.</p>
  </section>
</template>

<style scoped>
.dmz-sources-note { margin: 0.875rem 0 0 !important; font-size: 0.9rem !important; color: var(--dz-muted) !important; }
</style>
