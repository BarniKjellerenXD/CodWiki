<script setup lang="ts">
defineProps<{ name: 'search' | 'close' | 'settings' }>()
</script>
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'search'"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></template>
    <path v-else-if="name === 'close'" d="m6 6 12 12M18 6 6 18" />
    <template v-else><path d="M4 6h3m4 0h9M4 12h9m4 0h3M4 18h3m4 0h9" /><circle cx="9" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="9" cy="18" r="2" /></template>
  </svg>
</template>
