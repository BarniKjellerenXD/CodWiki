<template>
  <div class="min-h-screen bg-slate-900 text-slate-100">
    <NuxtRouteAnnouncer />
    <NuxtPage />
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

.back-to-top {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 50;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.2);
  background: linear-gradient(135deg, rgba(34,211,238,0.28), rgba(217,70,239,0.22));
  color: #0f172a;
  font-weight: 800;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 150ms ease, filter 120ms ease;
}

.back-to-top:hover {
  transform: translateY(-2px) scale(1.03);
  filter: brightness(1.05);
  box-shadow: 0 14px 36px rgba(0,0,0,0.45);
}

.back-to-top:active {
  transform: translateY(0) scale(0.99);
}
</style>
