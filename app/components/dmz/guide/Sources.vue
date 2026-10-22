<script setup lang="ts">
import { guideSource } from '#shared/dmz-guide.mjs'

// The sources behind a guide section, folded away under one line.
const props = defineProps<{ ids: string[], label?: string }>()
const sources = computed(() => [...new Set(props.ids)].map(id => ({ id, ...guideSource(id)! })).filter(source => source.url))
const site = (url: string) => new URL(url).hostname.replace(/^www\./, '')
</script>

<template>
  <details class="gsrc">
    <summary class="dmz-mono">{{ label || 'Sources' }} · {{ sources.length }}</summary>
    <ul>
      <li v-for="source in sources" :key="source.id"><a :href="source.url" target="_blank" rel="noopener">{{ source.label }}</a> <span class="dmz-mono">{{ site(source.url) }}</span></li>
    </ul>
  </details>
</template>

<style scoped>
.gsrc summary { display: inline-flex; align-items: center; min-height: 2.75rem; cursor: pointer; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.gsrc summary:hover { color: var(--dz-ink); }
.gsrc ul { margin: 0; padding-left: 1.1rem; }
.gsrc li { margin: 0.3rem 0; font-size: 0.875rem; color: #dcd9cb; }
.gsrc a { color: var(--dz-ink); text-underline-offset: 0.2em; }
.gsrc li span { font-size: 0.6875rem; color: var(--dz-muted); }
</style>
