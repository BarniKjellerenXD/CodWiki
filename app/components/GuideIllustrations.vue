<script setup lang="ts">
defineProps<{ images: { src: string; alt: string }[] }>()
const selected = ref<{ src: string; alt: string } | null>(null)
</script>
<template>
  <div class="guide-illustrations">
    <figure v-for="picture in images" :key="picture.src">
      <button type="button" :aria-label="`Enlarge: ${picture.alt}`" @click.stop="selected = picture"><img :src="picture.src" :alt="picture.alt" loading="lazy" width="1280" height="720" /></button>
      <figcaption>{{ picture.alt }}</figcaption>
    </figure>
  </div>
  <ImageLightbox v-if="selected" :src="selected.src" :alt="selected.alt" @close="selected = null" />
</template>
<style scoped>
.guide-illustrations{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:1rem;margin:1rem 0}.guide-illustrations figure{margin:0}.guide-illustrations button{display:block;width:100%;padding:0;border:1px solid var(--wp-line);border-radius:8px;overflow:hidden;cursor:zoom-in;background:var(--wp-surface-2)}.guide-illustrations img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;margin:0}.guide-illustrations figcaption{font-size:.8rem;line-height:1.5;color:var(--wp-muted);margin-top:.4rem}
</style>
