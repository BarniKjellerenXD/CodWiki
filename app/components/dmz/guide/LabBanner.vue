<script setup lang="ts">
import { guideConcepts, guideConcept } from '#shared/dmz-guide-lab.mjs'

// Marks a guide concept page as a draft and links the other guide concepts.
const props = defineProps<{ concept: string }>()
const here = computed(() => guideConcept(props.concept)!)
const step = (delta: number) => guideConcepts[(guideConcepts.indexOf(here.value) + delta + guideConcepts.length) % guideConcepts.length]!
</script>

<template>
  <aside class="glb" aria-label="About this concept">
    <p class="glb-text"><span class="glb-tag dmz-mono">Concept {{ here.letter }}</span> <strong>{{ here.name }}.</strong> A clickable draft of the DMZ guide with the real guide content. It is not a finished page.</p>
    <nav class="glb-nav dmz-mono" aria-label="Guide concepts">
      <NuxtLink :to="step(-1).path" :aria-label="`Previous: ${step(-1).name}`"><span aria-hidden="true">←</span> {{ step(-1).letter }}</NuxtLink>
      <NuxtLink to="/dmz/lab/guide">All guide concepts</NuxtLink>
      <NuxtLink :to="step(1).path" :aria-label="`Next: ${step(1).name}`">{{ step(1).letter }} <span aria-hidden="true">→</span></NuxtLink>
    </nav>
  </aside>
</template>

<style scoped>
/* The right margin keeps clear of the site's reading-settings button, as DmzPageHead does. */
.glb { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.5rem; margin: 0 3.5rem 1.5rem 0; padding: 0.75rem 1rem; border: 1px dashed rgba(221, 179, 99, 0.6); border-radius: 14px; background: repeating-linear-gradient(-45deg, rgba(221, 179, 99, 0.07) 0 10px, rgba(221, 179, 99, 0.02) 10px 20px); }
.glb-text { flex: 1 1 22rem; margin: 0; color: #e7dcc2; font-size: 0.95rem; }
.glb-text strong { color: #f7f5ea; }
.glb-tag { margin-right: 0.375rem; padding: 0.2rem 0.55rem; border-radius: 4px; background: var(--dz-accent); color: var(--dz-bg); font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.glb-nav { display: flex; flex-wrap: wrap; gap: 0.25rem; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; }
.glb-nav a { display: inline-flex; align-items: center; gap: 0.25rem; min-height: 2.75rem; padding: 0 0.75rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; text-decoration: none; font-weight: 700; }
.glb-nav a:hover { border-color: var(--dz-ink); }
@media (max-width: 899px) { .glb { margin-right: 6.75rem; } }
</style>
