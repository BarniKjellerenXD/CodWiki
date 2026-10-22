<template>
  <div class="app-shell" :class="{ 'is-dmz': isDmz }">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <SettingsPanel />
    <SpotlightTrigger />
    <LazySpotlightDialog v-if="spotlightOpen" />
    <button
      v-if="showTop"
      class="back-to-top"
      type="button"
      @click="scrollToTop"
      aria-label="Back to top"
    >
      ↑
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

usePageSeo()

// DMZ pages bring their own theme and a phone dock, so the floating
// controls move clear of it there.
const route = useRoute()
const isDmz = computed(() => /^\/dmz(?:\/|$)/.test(route.path))
const showTop = ref(false)
const { open: spotlightOpen, openSpotlight, closeSpotlight } = useSpotlight()

// Ctrl K or Cmd K opens and closes search anywhere, even while typing; / opens
// it when the visitor is not typing. A page that handles the key first wins,
// and neither opens over another dialog, such as settings or an image.
function handleKey(event: KeyboardEvent) {
  // Autofill can send keydown events with no key.
  if (event.defaultPrevented || event.isComposing || !event.key) return
  const typing = (event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]')
  const blocked = !spotlightOpen.value && !!document.querySelector('dialog[open], [aria-modal="true"]')
  if (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && !blocked) {
    event.preventDefault()
    if (spotlightOpen.value) closeSpotlight()
    else openSpotlight()
  }
  else if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey && !spotlightOpen.value && !blocked) {
    event.preventDefault()
    openSpotlight()
  }
}

function handleScroll() {
  showTop.value = (typeof window !== 'undefined') && window.scrollY > 200
}

function scrollToTop() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKey)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKey)
})
</script>

<style>
/* Optional font hook: drop a Pigpen cipher TTF at /public/fonts/pigpen-cipher.ttf */
@font-face {
  font-family: 'PigpenCipher';
  src: url('/fonts/pigpen-cipher.otf') format('opentype'),
       url('/fonts/pigpen-cipher.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.app-shell {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.back-to-top {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 60;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  border: 1px solid var(--gold-border);
  background: var(--surface-2);
  color: var(--gold-bright);
  font-size: 1.05rem;
  font-weight: 700;
  display: grid;
  place-items: center;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
}

.back-to-top:hover {
  background: var(--surface-3);
  border-color: var(--gold);
  transform: translateY(-2px);
}

.back-to-top:active {
  transform: translateY(0);
}

@media (max-width: 899px) {
  .app-shell.is-dmz .back-to-top { bottom: calc(6.75rem + env(safe-area-inset-bottom)); }
  .app-shell.is-dmz .settings-trigger { top: 1rem; bottom: auto; }
}
</style>
