<script setup lang="ts">
import type { PortalImage } from '~/types/mw3Portals'
const props = defineProps<{ photo: PortalImage; alt: string }>()
const failed = ref(false)
watch(() => props.photo.src, () => { failed.value = false })
</script>

<template>
  <figure class="portal-photo">
    <img v-if="!failed" :src="photo.src" :alt="alt" :width="photo.width" :height="photo.height" loading="lazy" @error="failed = true" />
    <p v-else role="status">This reference photo could not load.</p>
    <figcaption><a :href="photo.source" target="_blank" rel="noopener noreferrer">View WZHUB reference ↗</a></figcaption>
  </figure>
</template>

<style scoped>
.portal-photo { margin:.75rem 0 0; }
.portal-photo img { display:block; width:100%; height:auto; border-radius:7px; }
.portal-photo p { padding:1rem; background:var(--surface-2); color:var(--muted); font-size:.8rem; }
.portal-photo figcaption { font-size:.68rem; margin-top:.4rem; color:var(--muted); }
.portal-photo a { color:inherit; }
</style>
