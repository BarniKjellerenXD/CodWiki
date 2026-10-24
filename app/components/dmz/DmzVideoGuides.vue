<script setup lang="ts">
import { VIDEO_CAP, anySource, videoUrl } from '#shared/dmz-sightings.mjs'

type VideoRef = { id: string, at?: string, why: string, shows?: boolean }

// Videos for a player who is stuck, as plain links that open on YouTube: no
// embeds, thumbnails or autoplay. fold starts closed with the first three and
// keeps the rest one more tap away; strip is a short list that always shows.
// empty is the line to show when there is no video yet.
const props = withDefaults(defineProps<{ refs?: VideoRef[], title?: string, variant?: 'fold' | 'strip', empty?: string }>(), { refs: () => [], title: 'Watch it done', variant: 'fold', empty: '' })
const uid = useId()
const items = computed(() => (props.refs || [])
  .map(ref => ({ ...ref, label: anySource(ref.id)?.label as string | undefined, href: videoUrl(ref.id, ref.at) as string | undefined }))
  .filter(item => item.href))
const first = computed(() => items.value.slice(0, VIDEO_CAP))
const rest = computed(() => props.variant === 'fold' ? items.value.slice(VIDEO_CAP) : [])
</script>

<template>
  <section v-if="variant === 'strip' && items.length" class="vg vg--strip" :aria-labelledby="`${uid}-head`">
    <p :id="`${uid}-head`" class="vg-head dmz-mono">Stuck? Start with these</p>
    <ul class="vg-list">
      <li v-for="item in first" :key="`${item.id}-${item.at || ''}`"><a :href="item.href" target="_blank" rel="noopener noreferrer" class="vg-link">{{ item.label }}<span class="sr-only"> (opens in a new tab)</span></a><span v-if="item.at" class="vg-at dmz-mono"> · from {{ item.at }}</span> <span class="vg-why">{{ item.why }}</span></li>
    </ul>
  </section>
  <details v-else-if="items.length" class="vg vg--fold">
    <summary class="dmz-mono">{{ title }} · {{ items.length }}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
    <ul class="vg-list">
      <li v-for="item in first" :key="`${item.id}-${item.at || ''}`"><a :href="item.href" target="_blank" rel="noopener noreferrer" class="vg-link">{{ item.label }}<span class="sr-only"> (opens in a new tab)</span></a><span v-if="item.at" class="vg-at dmz-mono"> · from {{ item.at }}</span> <span class="vg-why">{{ item.why }}</span></li>
    </ul>
    <details v-if="rest.length" class="vg-more">
      <summary class="dmz-mono">{{ rest.length }} more<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
      <ul class="vg-list">
        <li v-for="item in rest" :key="`${item.id}-${item.at || ''}`"><a :href="item.href" target="_blank" rel="noopener noreferrer" class="vg-link">{{ item.label }}<span class="sr-only"> (opens in a new tab)</span></a><span v-if="item.at" class="vg-at dmz-mono"> · from {{ item.at }}</span> <span class="vg-why">{{ item.why }}</span></li>
      </ul>
    </details>
  </details>
  <p v-else-if="empty" class="vg-empty">{{ empty }}</p>
</template>

<style scoped>
.vg { min-width: 0; }
.vg--strip { display: grid; gap: 0.25rem; padding: 0.625rem 0.875rem 0.5rem; border-left: 2px solid var(--dz-accent); background: rgba(11, 13, 12, 0.5); }
.vg-head { margin: 0; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-accent); }
.vg summary { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; min-height: 2.75rem; cursor: pointer; list-style: none; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-accent); }
.vg summary::-webkit-details-marker { display: none; }
.vg summary svg { flex: none; width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.15s; }
.vg[open] > summary svg, .vg-more[open] > summary svg { transform: rotate(180deg); }
.vg-more summary { font-size: 0.6875rem; color: var(--dz-muted); }
.vg-more summary:hover { color: var(--dz-ink); }
.vg-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.125rem; }
.vg-list li { margin: 0; min-width: 0; color: #dcd9cb; font-size: 0.9375rem; line-height: 1.4; overflow-wrap: anywhere; }
.vg-link { display: inline-flex; align-items: center; min-height: 2.75rem; color: var(--dz-ink) !important; font-weight: 600; text-underline-offset: 0.2em; }
.vg-at { font-size: 0.6875rem; color: var(--dz-muted); }
.vg-why { display: block; padding-bottom: 0.25rem; color: var(--dz-muted); font-size: 0.875rem; }
.vg-empty { margin: 0; color: var(--dz-muted); font-size: 0.875rem; }
@media (prefers-reduced-motion: reduce) { .vg summary svg { transition: none; } }
</style>
