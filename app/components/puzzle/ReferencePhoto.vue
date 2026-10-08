<script setup lang="ts">
defineProps<{ picture: any }>()
</script>
<template><span class="reference-photo" :class="{ cropped: picture.crop }" :style="picture.crop ? { aspectRatio: String((picture.width || 839) / (picture.height || 336) / picture.crop.columns) } : undefined"><img :src="picture.previewSrc || picture.src" :alt="picture.alt" :width="picture.width" :height="picture.height" loading="lazy" :style="picture.crop ? { width: `${picture.crop.columns * 100}%`, maxWidth: 'none', transform: `translateX(-${picture.crop.column * 100 / picture.crop.columns}%)` } : undefined"></span></template>
<style scoped>.reference-photo{display:block;overflow:hidden;max-height:200px}.reference-photo img{display:block;width:100%;height:auto;object-fit:contain;margin:0}.reference-photo.cropped{position:relative;max-height:none}.cropped img{position:absolute;top:0;left:0}</style>
