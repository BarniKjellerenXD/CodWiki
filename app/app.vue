<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <SettingsPanel />
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

const showTop = ref(false)

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
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', handleScroll)
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
</style>
