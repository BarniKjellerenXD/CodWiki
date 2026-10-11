<template><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="paths" /></template>
<script setup lang="ts">
import icons from '~/data/mapIcons.json'
const props = defineProps<{ name: string }>()
// Only vendored static icon paths may enter the SVG, never dataset/remote HTML.
const paths = computed(() => (icons as Record<string,string>)[props.name] || icons.MapPin)
</script>
