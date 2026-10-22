<script setup lang="ts">
import { labConcepts, labConcept, labMix } from '#shared/dmz-lab.mjs'

// Marks a /dmz/lab page as a draft and links the other concepts.
const props = defineProps<{ concept: string }>()
const order = [...labConcepts.map(item => item.id), labMix.id]
const here = computed(() => labConcept(props.concept)!)
const step = (delta: number) => labConcept(order[(order.indexOf(props.concept) + delta + order.length) % order.length]!)!
const tag = (item: { id: string, letter?: string }) => item.id === labMix.id ? 'Mix' : item.letter
</script>

<template>
  <aside class="lb" aria-label="About this concept">
    <div class="lb-main">
      <p class="lb-tag dmz-mono">
        <span>Concept {{ tag(here) }}</span>
        <span v-if="here.id === labMix.id" class="lb-rec">Recommended</span>
      </p>
      <p class="lb-text"><strong>{{ here.name }}.</strong> A clickable draft with real Intel data, made to help choose a new Intel layout. It is not a finished feature. The live <NuxtLink to="/dmz/intel">Intel database</NuxtLink> is unchanged.</p>
    </div>
    <nav class="lb-nav dmz-mono" aria-label="Concepts">
      <NuxtLink :to="step(-1).path" class="lb-step" :aria-label="`Previous: ${step(-1).name}`"><span aria-hidden="true">←</span> {{ tag(step(-1)) }}</NuxtLink>
      <NuxtLink to="/dmz/lab" class="lb-all">All concepts</NuxtLink>
      <NuxtLink :to="step(1).path" class="lb-step" :aria-label="`Next: ${step(1).name}`">{{ tag(step(1)) }} <span aria-hidden="true">→</span></NuxtLink>
    </nav>
  </aside>
</template>

<style scoped>
/* The right margin keeps clear of the site's reading-settings button, as DmzPageHead does. */
.lb { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.5rem; margin: 0 3.5rem 1.5rem 0; padding: 0.75rem 1rem 0.75rem 1.125rem; border: 1px dashed rgba(221, 179, 99, 0.6); border-radius: 14px; background: repeating-linear-gradient(-45deg, rgba(221, 179, 99, 0.07) 0 10px, rgba(221, 179, 99, 0.02) 10px 20px); }
.lb-main { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem 0.875rem; flex: 1 1 26rem; }
.lb-tag { display: inline-flex; gap: 0.375rem; margin: 0; }
.lb-tag span { padding: 0.2rem 0.55rem; border-radius: 4px; background: var(--dz-accent); color: var(--dz-bg); font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.lb-tag .lb-rec { background: var(--dz-green); }
.lb-text { flex: 1 1 18rem; margin: 0; color: #e7dcc2; font-size: 0.95rem; }
.lb-text strong { color: #f7f5ea; }
.lb-text a { text-underline-offset: 0.2em; }
.lb-nav { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; }
.lb-nav a { display: inline-flex; align-items: center; gap: 0.25rem; min-height: 2.75rem; padding: 0 0.75rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; text-decoration: none; font-weight: 700; }
.lb-nav a:hover { border-color: var(--dz-ink); }
.lb-all { background: rgba(14, 16, 15, 0.55); }
/* Phones also keep the search button beside the gear. */
@media (max-width: 899px) {
  .lb { margin-right: 6.75rem; }
}
@media (max-width: 599px) {
  .lb { padding: 0.625rem 0.75rem; }
  .lb-text { font-size: 0.875rem; }
  .lb-nav { width: 100%; }
  .lb-all { flex: 1; justify-content: center; }
}
</style>
