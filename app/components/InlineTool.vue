<script setup lang="ts">
import catalogue from '~/data/catalogue.json'
const props=defineProps<{tool:string}>()
const info=computed(()=>catalogue.tools.find(t=>t.id===props.tool))
</script>
<template><details class="inline-puzzle"><summary>{{ info?.name || 'Books & busts' }} <span>Open helper</span></summary><div class="inline-puzzle-body"><PuzzleWidget :tool="tool" /><NuxtLink v-if="info" :to="info.route" class="standalone">Open full-page tool ↗</NuxtLink></div></details></template>
<style scoped>.inline-puzzle{margin:.35rem 0;border:1px solid var(--wp-line);border-radius:8px;background:var(--wp-surface-2)}.inline-puzzle>summary{cursor:pointer;color:var(--wp-gold);padding:.5rem .7rem;font-size:.84rem;min-height:40px}.inline-puzzle>summary span{float:right;color:var(--wp-muted);font-size:.75rem}.inline-puzzle[open]>summary span{display:none}.inline-puzzle-body{padding:.3rem .75rem .75rem}.standalone{display:inline-block;margin-top:.6rem;font-size:.8rem;color:var(--wp-gold);text-decoration:underline}</style>
