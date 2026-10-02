<script setup lang="ts">
defineProps<{ mark: number; label: string }>()
</script>
<template>
  <svg viewBox="0 0 120 120" role="img" :aria-label="label" class="voyage-dial">
    <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" opacity=".3" />
    <text v-for="n in 12" :key="n" :x="60+44*Math.sin(n*Math.PI/6)" :y="64-44*Math.cos(n*Math.PI/6)" text-anchor="middle" fill="currentColor" font-size="11">{{n}}</text>
    <line x1="60" y1="60" :x2="60+32*Math.sin(mark*Math.PI/6)" :y2="60-32*Math.cos(mark*Math.PI/6)" stroke="var(--wp-gold-bright)" stroke-width="4" stroke-linecap="round" />
    <circle cx="60" cy="60" r="4" fill="currentColor" />
  </svg>
</template>
<style scoped>.voyage-dial{width:110px;height:110px;max-width:100%;display:block}</style>
