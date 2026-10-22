<script setup lang="ts">
import type { PropType } from 'vue'
import { dmzIntel } from '#shared/dmz-intel.mjs'

// Opens one entry over the current page: a side panel on wide screens and a
// bottom sheet on phones. Related entries open in place, with a Back button.
type Entry = (typeof dmzIntel)[number]
const props = defineProps({
  entry: { type: Object as PropType<Entry | null>, default: null },
  related: { type: Boolean, default: true },
})
const emit = defineEmits<{ close: [] }>()
const stack = ref<Entry[]>([])
const panel = ref<HTMLElement>()
const closeButton = ref<HTMLButtonElement>()
const current = computed(() => stack.value.at(-1) || null)
let returnFocus: HTMLElement | null = null
let previousOverflow = ''

// Search open on top of the drawer handles its own Esc and Tab.
const spotlight = useSpotlight().open
function onKey(event: KeyboardEvent) {
  if (!current.value || spotlight.value) return
  if (event.key === 'Escape') {
    // Stop the shell from opening the station menu as well.
    event.preventDefault()
    event.stopPropagation()
    close()
  }
  else if (event.key === 'Tab' && panel.value) {
    const focusable = [...panel.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
    const first = focusable[0], last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
}
function close() { emit('close') }
function push(entry: Entry) {
  stack.value.push(entry)
  nextTick(() => panel.value?.scrollTo({ top: 0 }))
}
function back() {
  stack.value.pop()
  nextTick(() => panel.value?.scrollTo({ top: 0 }))
}

watch(() => props.entry, (entry, before) => {
  if (!import.meta.client) return
  if (entry && !before) {
    returnFocus = document.activeElement as HTMLElement | null
    previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }
  if (!entry && before) {
    document.documentElement.style.overflow = previousOverflow
    nextTick(() => returnFocus?.focus?.())
  }
  stack.value = entry ? [entry] : []
  if (entry) nextTick(() => closeButton.value?.focus())
})
onMounted(() => window.addEventListener('keydown', onKey, { capture: true }))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey, { capture: true })
  if (current.value) document.documentElement.style.overflow = previousOverflow
})
</script>

<template>
  <Teleport to="body">
    <div v-if="current" class="dmz lab dz-drawer" role="dialog" aria-modal="true" aria-labelledby="lab-drawer-title">
      <div class="dz-backdrop" aria-hidden="true" @click="close" />
      <div ref="panel" class="dz-panel">
        <div class="dz-bar">
          <button v-if="stack.length > 1" type="button" class="dz-btn dmz-mono" @click="back"><span aria-hidden="true">←</span> Back<span class="sr-only"> to {{ stack.at(-2)?.name }}</span></button>
          <span v-else class="dz-bar-label dmz-mono">Intel</span>
          <button ref="closeButton" type="button" class="dz-btn dz-close" aria-label="Close" @click="close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12 M18 6L6 18" /></svg></button>
        </div>
        <LazyDmzLabDossier :key="current.id" :entry="current" :related="related" title-id="lab-drawer-title" @open="push" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Teleported outside .dmz, so it carries the theme classes itself. */
/* Above the site's reading-settings button (z-index 60). */
.dz-drawer { position: fixed; inset: 0; z-index: 70; min-height: 0; background: transparent; }
.dz-backdrop { position: absolute; inset: 0; background: rgba(5, 7, 6, 0.6); animation: dz-fade 0.18s ease-out both; }
.dz-panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(34rem, 100%); overflow-y: auto; overscroll-behavior: contain; padding: 0 1.5rem 2rem; background: #141817; border-left: 1px solid var(--dz-line-strong); box-shadow: -24px 0 48px rgba(0, 0, 0, 0.4); animation: dz-in 0.22s ease-out both; }
.dz-bar { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 -1.5rem 1rem; padding: 0.625rem 1rem 0.625rem 1.5rem; background: rgba(20, 24, 23, 0.94); border-bottom: 1px solid var(--dz-line); }
.dz-bar-label { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dz-teal); }
.dz-btn { display: inline-flex; align-items: center; gap: 0.375rem; min-width: 2.75rem; min-height: 2.75rem; padding: 0 0.75rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-ink); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.dz-btn:hover { border-color: var(--dz-ink); }
.dz-close { justify-content: center; padding: 0; }
.dz-close svg { width: 1.125rem; height: 1.125rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
@keyframes dz-fade { from { opacity: 0; } }
@keyframes dz-in { from { transform: translateX(2rem); opacity: 0; } }
@media (max-width: 899px) {
  .dz-panel { top: auto; left: 0; width: 100%; max-height: 88dvh; padding: 0 1rem 1.5rem; border-left: 0; border-top: 1px solid var(--dz-line-strong); border-radius: 1.5rem 1.5rem 0 0; box-shadow: 0 -24px 48px rgba(0, 0, 0, 0.45); animation-name: dz-up; }
  .dz-bar { margin: 0 -1rem 0.875rem; padding: 0.5rem 0.75rem 0.5rem 1rem; border-radius: 1.5rem 1.5rem 0 0; }
}
@keyframes dz-up { from { transform: translateY(2rem); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .dz-backdrop, .dz-panel { animation: none; }
}
</style>
