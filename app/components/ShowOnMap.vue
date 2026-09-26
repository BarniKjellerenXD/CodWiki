<script setup lang="ts">
import { GUIDE_MAP_NAVIGATION } from '~/utils/mapContext'
import { mapAnchor } from '~/utils/mapNavigation.mjs'
const props = defineProps<{ target: string; label?: string }>()
const navigation = inject(GUIDE_MAP_NAVIGATION, null)
function show(event: MouseEvent) {
  if (!navigation || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  event.stopPropagation()
  navigation.open(props.target, event.currentTarget as HTMLElement)
}
</script>

<template>
  <a class="show-on-map" :href="`#${mapAnchor(target)}`" :aria-label="label || 'Show location on map'" :title="label || 'Show location on map'" @click="show">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></svg>
  </a>
</template>

<style scoped>
.show-on-map { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; margin:0 .12rem; border:0; border-radius:4px; background:transparent; color:var(--gold-bright,var(--gold)); text-decoration:none !important; line-height:1; vertical-align:middle; flex:none; }
.show-on-map:hover { background:var(--gold-dim,var(--surface-2)); color:var(--text); }
.show-on-map:focus-visible { outline:2px solid var(--gold); outline-offset:3px; }
@media(pointer:coarse) { .show-on-map { width:32px; height:32px; } }
</style>
