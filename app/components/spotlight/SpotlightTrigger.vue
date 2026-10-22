<script setup lang="ts">
// The floating search button beside the reading-settings gear. DMZ station
// pages on wide screens use the rail's search button instead.
const { open, openSpotlight, prefetchSpotlight } = useSpotlight()
const route = useRoute()
const isDmz = computed(() => /^\/dmz(?:\/|$)/.test(route.path))
const isHub = computed(() => route.path.replace(/\/+$/, '') === '/dmz')
const isMac = ref(false)
onMounted(() => { isMac.value = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) })
</script>

<template>
  <button
    type="button" class="sp-trigger" :class="{ 'is-dmz': isDmz, 'is-hub': isHub }"
    aria-label="Search CodWiki" :title="`Search (${isMac ? '⌘K' : 'Ctrl K'} or /)`" :aria-expanded="open" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K /"
    @click="openSpotlight()" @pointerenter="prefetchSpotlight" @focus="prefetchSpotlight"
  >
    <UiIcon name="search" />
  </button>
</template>

<style scoped>
/* A circle like the gear, stacked under it in the same right-hand gutter:
   beside it, the button would cover the right end of guide headers and their
   sticky bars, and a wider pill would cover the guides' contents panel. */
.sp-trigger {
  position: fixed;
  top: 4.35rem;
  right: 1.25rem;
  z-index: 60;
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  padding: 0;
  border: 1px solid var(--line-strong);
  border-radius: 9999px;
  background: var(--surface);
  color: var(--muted);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.sp-trigger:hover { color: var(--gold-bright); border-color: var(--gold-border); }
.sp-trigger:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }

/* Phones: above the settings gear in the bottom-right thumb corner. */
@media (max-width: 560px) {
  .sp-trigger { top: auto; right: 1.25rem; bottom: 8.25rem; }
}

/* DMZ station pages carry the search button in the rail on wide screens. */
@media (min-width: 900px) {
  .sp-trigger.is-dmz:not(.is-hub) { display: none; }
}
/* DMZ phones: the gear sits at the top, so search joins it there; the corner
   above the dock belongs to the Tac-Map's controls. */
@media (max-width: 899px) {
  .sp-trigger.is-dmz { top: 1rem; right: 4.25rem; bottom: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .sp-trigger { transition: none; }
}
</style>
