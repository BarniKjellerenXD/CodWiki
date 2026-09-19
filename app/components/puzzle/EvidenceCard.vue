<script setup lang="ts">
defineProps<{ label: string, image: string, selected: boolean, caption?: string }>()
defineEmits<{ select: [] }>()
</script>
<template>
  <button type="button" class="evidence-choice" :aria-pressed="selected" @click="$emit('select')">
    <span class="evidence-image"><img :src="image" alt="" width="80" height="80"></span>
    <span class="evidence-name">{{ label }}</span><small v-if="caption">{{ caption }}</small>
    <span v-if="selected" class="evidence-selected" aria-hidden="true">●</span>
  </button>
</template>
<style scoped>
.puzzle .evidence-choice{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;min-width:0;padding:.65rem .35rem;background:var(--surface);border-radius:12px}
.evidence-image{display:grid;place-items:center;width:100%;height:76px;background:radial-gradient(ellipse,var(--gold-dim),transparent 75%)}
.puzzle .evidence-choice img{display:block;width:76px;height:76px;object-fit:contain;float:none;margin:0;max-width:100%}
.evidence-name{font-size:.82rem;font-weight:650;line-height:1.3}
.evidence-choice small{font-size:.7rem;color:var(--muted)}
.evidence-selected{position:absolute;right:.5rem;top:.3rem;color:var(--gold)}
.puzzle .evidence-choice[aria-pressed=true]{border-color:var(--gold);background:var(--gold-dim);box-shadow:inset 0 0 0 1px var(--gold-border)}
@media(max-width:500px){.evidence-image{height:58px}.puzzle .evidence-choice img{width:58px;height:58px}.evidence-name{font-size:.76rem}}
</style>
