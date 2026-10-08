<script setup lang="ts">
defineProps<{ images: { src: string; previewSrc?: string; alt: string; caption?: string; credit?: string; source?: string; width?: number; height?: number }[] }>()
const selected = ref<{ src: string; alt: string } | null>(null)
</script>
<template>
  <div class="guide-illustrations">
    <figure v-for="picture in images" :key="picture.src">
      <button type="button" :aria-label="`Enlarge: ${picture.alt}`" @click.stop="selected = picture"><img :src="picture.previewSrc || picture.src" :alt="picture.alt" loading="lazy" :width="picture.width || 1280" :height="picture.height || 720" /></button>
      <figcaption>{{ picture.caption || picture.alt }}<span v-if="picture.credit" class="image-credit">{{ picture.credit }}<template v-if="picture.source"> · <a :href="picture.source" target="_blank" rel="noopener noreferrer">Source ↗</a></template></span></figcaption>
    </figure>
  </div>
  <ImageLightbox v-if="selected" :src="selected.src" :alt="selected.alt" @close="selected = null" />
</template>
<style scoped>
.guide-illustrations{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:1rem;margin:1rem 0}.guide-illustrations figure{margin:0}.guide-illustrations button{display:block;width:100%;padding:0;border:1px solid var(--wp-line);border-radius:8px;overflow:hidden;cursor:zoom-in;background:var(--wp-surface-2)}.guide-illustrations img{display:block;width:100%;height:auto;max-height:320px;object-fit:contain;margin:0}.guide-illustrations figcaption{font-size:.8rem;line-height:1.5;color:var(--wp-muted);margin-top:.4rem}.image-credit{display:block;font-size:.7rem;margin-top:.3rem}.image-credit a{color:var(--wp-gold)}button:focus-visible{outline:2px solid var(--wp-gold);outline-offset:3px}
</style>
