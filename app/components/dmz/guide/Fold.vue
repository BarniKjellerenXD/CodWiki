<script setup lang="ts">
// One part of a stage. Open, it is a plain section under a heading; folded, the
// heading becomes a question with a hint of what is inside, and opens on tap.
const props = withDefaults(defineProps<{ title: string, question?: string, hint?: string, fold?: boolean, level?: 3 | 4 }>(), { question: '', hint: '', fold: false, level: 3 })
const h = computed(() => `h${props.level}`)
</script>

<template>
  <details v-if="fold" class="gf">
    <summary>
      <component :is="h" class="gf-q">{{ question || title }}</component>
      <span v-if="hint" class="gf-hint dmz-mono">{{ hint }}</span>
      <svg class="gf-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
    </summary>
    <div class="gf-body"><slot /></div>
  </details>
  <section v-else class="gf-open">
    <component :is="h" class="gf-title">{{ title }}</component>
    <slot />
  </section>
</template>

<style scoped>
.gf-open { display: grid; gap: 0.625rem; }
.gf-title { margin: 0; font-size: 1.25rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.gf { border: 1px solid var(--dz-line); border-radius: 14px; background: rgba(20, 24, 23, 0.82); }
.gf[open] { border-color: var(--dz-line-strong); }
.gf summary { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 1rem; min-height: 3.5rem; padding: 0.75rem 1.125rem; cursor: pointer; list-style: none; }
.gf summary::-webkit-details-marker { display: none; }
.gf-q { flex: 1 1 15rem; margin: 0; font-size: 1.1875rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.gf-hint { font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.gf-chev { flex: none; width: 1.25rem; height: 1.25rem; fill: none; stroke: var(--dz-muted); stroke-width: 2; transition: transform 0.15s; }
.gf[open] .gf-chev { transform: rotate(180deg); }
.gf-body { display: grid; gap: 0.75rem; padding: 0.25rem 1.125rem 1.25rem; }
@media (prefers-reduced-motion: reduce) { .gf-chev { transition: none; } }
@media (max-width: 599px) {
  .gf summary { padding: 0.625rem 0.875rem; }
  .gf-q { font-size: 1.0625rem; }
  .gf-body { padding: 0.25rem 0.75rem 1rem; }
}
</style>
