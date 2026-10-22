<script setup lang="ts">
import { guideTier } from '#shared/dmz-guide.mjs'
import { intelEntry } from '#shared/dmz-stations.mjs'
import { bossPlaybook, materialSpots } from '#shared/dmz-playbooks.mjs'

// One of a stage's card sets: what to print, where to farm, or who to hunt.
// Farm and hunt cards carry a Tac-Map cut of the places they name, and open
// into the exact spots or how to find and kill the boss, across the full row.
const props = defineProps<{ tier: string, kind: 'print' | 'farm' | 'hunt' }>()
const tier = computed(() => guideTier(props.tier)!)
const nameOf = (id: string) => intelEntry(id)?.name || id
const hunt = computed(() => (tier.value.hunt || []).map((item: { intel: string, pins: string[], why: string }) => ({ ...item, name: nameOf(item.intel) })))
const parts = (cost: string) => cost.split(' · ')
</script>

<template>
  <ol v-if="kind === 'print'" class="gc gc--print">
    <li v-for="(item, index) in tier.print" :key="item.name" class="gc-card">
      <span class="gc-rank dmz-mono" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
      <div class="gc-main">
        <DmzIntelLink v-if="item.intel" :id="item.intel" class="gc-name">{{ item.name }}</DmzIntelLink>
        <span v-else class="gc-name">{{ item.name }}</span>
        <p class="gc-why">{{ item.why }}</p>
        <ul class="gc-cost" :aria-label="`${item.name} costs`"><li v-for="part in parts(item.cost)" :key="part">{{ part }}</li></ul>
      </div>
      <span class="gc-unlock dmz-mono">{{ item.unlock }}</span>
    </li>
  </ol>

  <ul v-else-if="kind === 'farm'" class="gc gc--map">
    <li v-for="item in tier.farm" :key="item.name" class="gc-card gc-card--map">
      <DmzMiniMap :pins="item.pins" :label="`Where to find ${item.name}`" :names="false" />
      <div class="gc-main">
        <p class="gc-head"><span class="gc-name">{{ item.name }}</span><span class="gc-rarity dmz-mono" :data-rarity="item.rarity.toLowerCase()">{{ item.rarity }}</span></p>
        <p class="gc-why">{{ item.where }}</p>
        <p class="gc-for"><span class="dmz-mono">For</span> {{ item.for }}</p>
        <details v-if="materialSpots(item.name)" class="gc-how">
          <summary class="dmz-mono">Exact spots and a route<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
          <DmzMaterialSpots :name="item.name" :map="false" />
        </details>
      </div>
    </li>
  </ul>

  <ol v-else class="gc gc--map">
    <li v-for="(item, index) in hunt" :key="item.intel" class="gc-card gc-card--map">
      <DmzMiniMap :pins="item.pins" :label="`Where ${item.name} is found`" :names="false" />
      <div class="gc-main">
        <p class="gc-head"><span class="gc-rank dmz-mono" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span><DmzIntelLink :id="item.intel" class="gc-name">{{ item.name }}</DmzIntelLink></p>
        <p class="gc-why">{{ item.why }}</p>
        <details v-if="bossPlaybook(item.intel)" class="gc-how">
          <summary class="dmz-mono">How to find and kill<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
          <DmzPlaybook :id="item.intel" />
        </details>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.gc { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.gc--print { grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr)); }
.gc--map { grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); }
.gc-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.75rem; align-items: start; padding: 0.875rem 1rem; border: 1px solid var(--dz-line); border-radius: 14px; background: rgba(20, 24, 23, 0.82); }
.gc-card.gc-card--map { grid-template-columns: minmax(0, 1fr); gap: 0.625rem; padding: 0.625rem; }
.gc-card--map :deep(figcaption) { display: none; }
.gc-card--map .gc-main { padding: 0 0.375rem 0.25rem; }
.gc-main { display: grid; gap: 0.375rem; min-width: 0; }
.gc-rank { font-size: 0.75rem; color: var(--dz-accent); padding-top: 0.2rem; }
.gc-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; margin: 0; }
.gc-name { font-size: 1.0625rem; font-weight: 700; letter-spacing: 0.02em; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.gc-why { margin: 0; color: #dcd9cb; font-size: 0.9375rem; line-height: 1.45; }
.gc-for { margin: 0; color: var(--dz-ink-2); font-size: 0.875rem; }
.gc-for span { margin-right: 0.25rem; font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.gc-unlock { font-size: 0.625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); white-space: nowrap; padding-top: 0.3rem; }
.gc-cost { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.25rem; }
.gc-cost li { padding: 0.15rem 0.5rem; border: 1px solid var(--dz-line-strong); border-radius: 6px; font-size: 0.8125rem; color: var(--dz-ink-2); }
.gc-rarity { padding: 0.1rem 0.45rem; border: 1px solid currentColor; border-radius: 4px; font-size: 0.5625rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b8b9ac; }
.gc-rarity[data-rarity='uncommon'] { color: #a9d98a; }
.gc-rarity[data-rarity='rare'] { color: #7fb8e6; }
.gc-rarity[data-rarity='epic'] { color: #b99ae8; }
.gc-rarity[data-rarity='legendary'] { color: #ddb363; }
.gc-rarity[data-rarity='ultra'] { color: #ff6a5c; }
.gc-how summary { display: inline-flex; align-items: center; gap: 0.375rem; min-height: 2.75rem; cursor: pointer; list-style: none; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-accent); }
.gc-how summary::-webkit-details-marker { display: none; }
.gc-how summary svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.15s; }
.gc-how[open] summary svg { transform: rotate(180deg); }
.gc-how[open] summary { margin-bottom: 0.25rem; }
/* An open card takes the whole row, its map beside the how-to. */
.gc > li:has(.gc-how[open]) { grid-column: 1 / -1; }
.gc-card.gc-card--map:has(.gc-how[open]) { grid-template-columns: minmax(12rem, 18rem) minmax(0, 1fr); }
@media (max-width: 599px) {
  .gc--print, .gc--map { grid-template-columns: minmax(0, 1fr); }
  .gc-card { grid-template-columns: auto minmax(0, 1fr); }
  .gc-unlock { grid-column: 2; }
  .gc-card.gc-card--map.gc-card--map:has(.gc-how[open]) { grid-template-columns: minmax(0, 1fr); }
}
</style>
