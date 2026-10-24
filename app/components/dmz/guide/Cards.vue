<script setup lang="ts">
import { guideLootVideos, guideTier } from '#shared/dmz-guide.mjs'
import { intelEntry, layerLink, placeLink } from '#shared/dmz-stations.mjs'
import { bossPlaybook, materialSpots } from '#shared/dmz-playbooks.mjs'
import { hajinPin, hajinReports } from '#shared/dmz-map.mjs'
import { rowTarget } from '#shared/dmz-sightings.mjs'

type VideoRef = { id: string, at?: string, why: string }
type LootRow = { kind: string, report?: string, pin?: string, layer?: string, where: string, search?: string, note?: string, mission?: string, how?: string[], fallback?: string[] }
type LootCard = { id: string, title: string, rows: LootRow[], note?: string, how?: string[], fallback?: string[], intel?: string[], videos?: VideoRef[], noVideo?: string }
type Report = { id: string, anchor?: string | null, where: string, squares?: string[], note?: string, intel?: string }

// One of a stage's card sets: what to print, where to farm, who to hunt, or
// where the loot is. Farm, hunt and loot cards carry a Tac-Map cut of the
// places they name, and open into the exact spots, the boss or the run across
// the full row. Loot cards are not ranked: each row is a reported site, a
// place or a kind of place, and a report row shows the report's own where and
// note.
const props = withDefaults(defineProps<{ tier: string, kind: 'print' | 'farm' | 'hunt' | 'loot', level?: 3 | 4 | 5 }>(), { level: 4 })
const tier = computed(() => guideTier(props.tier)!)
const nameOf = (id: string) => intelEntry(id)?.name || id
const hunt = computed(() => (tier.value.hunt || []).map((item: { intel: string, pins: string[], why: string }) => ({ ...item, name: nameOf(item.intel) })))
const parts = (cost: string) => cost.split(' · ')
const h = computed(() => `h${props.level}`)

const reportOf = new Map((hajinReports as Report[]).map(report => [report.id, report]))
function linkTo(row: LootRow) {
  const target = rowTarget(row) as { pin?: string, layer?: string } | null
  return target?.pin ? placeLink(target.pin) : target?.layer ? layerLink(target.layer) : null
}
// The map marks the places the reports belong to; a report with no place
// (the silos) marks its squares instead. A layer cannot be drawn, so a card of
// layers only has no map.
const loot = computed(() => ((tier.value.loot || []) as LootCard[]).map((card) => {
  const rows = card.rows.map((row) => {
    const report = row.report ? reportOf.get(row.report) : undefined
    const squares = report ? report.squares || [] : row.pin ? [hajinPin(row.pin)?.square].filter(Boolean) as string[] : []
    return { ...row, to: linkTo(row), text: report?.where || '', reportNote: report?.note || '', squares, anchor: report ? report.anchor || null : row.pin || null, intel: report?.intel, missionName: row.mission ? nameOf(row.mission) : '' }
  })
  const steps = [
    ...(card.how?.length || card.fallback?.length ? [{ key: card.id, label: '', how: card.how || [], fallback: card.fallback || [] }] : []),
    ...rows.filter(row => row.how?.length).map(row => ({ key: row.where, label: row.where, how: row.how || [], fallback: row.fallback || [] })),
  ]
  return {
    ...card,
    rows,
    steps,
    pins: [...new Set(rows.flatMap(row => row.anchor || []))],
    squares: [...new Set(rows.filter(row => row.report && !row.anchor).flatMap(row => row.squares))],
    intelIds: [...new Set([...rows.flatMap(row => row.intel || []), ...(card.intel || [])])],
    // The map opens on the first report, which also turns the loot layer on for the visit.
    mapTo: rows.find(row => row.report)?.to || layerLink('loot'),
    watch: guideLootVideos(card) as VideoRef[],
  }
}))
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

  <ul v-else-if="kind === 'loot'" class="gc gc--map">
    <li v-for="card in loot" :id="card.id" :key="card.id" class="gc-card gc-card--loot" :class="{ 'gc-card--map': card.pins.length || card.squares.length }">
      <DmzMiniMap v-if="card.pins.length || card.squares.length" :pins="card.pins" :squares="card.squares" :to="card.mapTo" :label="`${card.title} on the Tac-Map`" :names="false" />
      <div class="gc-main">
        <component :is="h" class="gc-name gc-title">{{ card.title }}</component>
        <ul class="gc-rows" :aria-label="`Places for ${card.title.toLowerCase()}`">
          <li v-for="row in card.rows" :key="`${row.report || row.layer || ''}-${row.where}`" class="gc-row" :class="`is-${row.kind}`">
            <p class="gc-row-head">
              <NuxtLink v-if="row.to" :to="row.to" class="gc-place">{{ row.where }}</NuxtLink><span v-else class="gc-place">{{ row.where }}</span>
              <span v-if="row.squares.length" class="gc-square dmz-mono">{{ row.squares.join(' · ') }}</span>
            </p>
            <p v-if="row.missionName" class="gc-line"><span class="gc-key dmz-mono">Story mission</span> <DmzIntelLink :id="row.mission!" class="gc-inline">{{ row.missionName }}</DmzIntelLink></p>
            <p v-if="row.text" class="gc-line">{{ row.text }}</p>
            <p v-if="row.reportNote" class="gc-line gc-line--note">{{ row.reportNote }}</p>
            <p v-if="row.search" class="gc-line"><span class="gc-key dmz-mono">Search</span> {{ row.search }}</p>
            <p v-if="row.note" class="gc-line gc-line--note">{{ row.note }}</p>
          </li>
        </ul>
        <p v-if="card.note" class="gc-why">{{ card.note }}</p>
        <div v-if="card.intelIds.length" class="gc-intel">
          <p :id="`${card.id}-intel`" class="gc-key dmz-mono">Intel</p>
          <ul class="gc-chips" :aria-labelledby="`${card.id}-intel`">
            <li v-for="id in card.intelIds" :key="id"><DmzIntelLink :id="id" class="gc-chip">{{ nameOf(id) }}</DmzIntelLink></li>
          </ul>
        </div>
        <details v-if="card.steps.length" class="gc-how">
          <summary class="dmz-mono">How to loot it<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
          <div class="gc-steps">
            <div v-for="part in card.steps" :key="part.key" class="gc-part">
              <p v-if="part.label" class="gc-label dmz-mono">{{ part.label }}</p>
              <ol v-if="part.how.length" class="gc-list"><li v-for="line in part.how" :key="line">{{ line }}</li></ol>
              <template v-if="part.fallback.length">
                <p class="gc-label gc-label--fallback dmz-mono">If it goes wrong</p>
                <ul class="gc-list"><li v-for="line in part.fallback" :key="line">{{ line }}</li></ul>
              </template>
            </div>
          </div>
        </details>
        <DmzVideoGuides :refs="card.watch" :empty="card.noVideo" />
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
/* Loot cards: rows of places, Intel chips, the how-to and videos. They differ
   in length, so each is only as tall as its content rather than the tallest
   card in its row. A card a link lands on keeps clear of the top edge. */
.gc-card.gc-card--loot { grid-template-columns: minmax(0, 1fr); align-self: start; align-content: start; gap: 0.625rem; padding: 0.625rem; scroll-margin-top: 1.5rem; }
.gc-card--loot .gc-main { padding: 0 0.375rem 0.25rem; }
.gc-title { margin: 0; line-height: 1.25; }
.gc-rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.gc-row { display: grid; gap: 0.125rem; min-width: 0; padding: 0 0.625rem 0.375rem; border-left: 2px solid var(--dz-teal); background: rgba(11, 13, 12, 0.5); }
.gc-row.is-mission { border-left-color: var(--dz-accent); }
.gc-row-head { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 0 0.5rem; min-width: 0; }
.gc-place { display: inline-flex; align-items: center; min-height: 2.75rem; min-width: 0; overflow-wrap: anywhere; font-size: 0.9375rem; font-weight: 700; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.gc-square { font-size: 0.6875rem; color: var(--dz-muted); }
.gc-line { margin: 0; color: #dcd9cb; font-size: 0.875rem; line-height: 1.45; overflow-wrap: anywhere; }
.gc-line--note { color: var(--dz-muted); }
.gc-key { margin: 0 0.25rem 0 0; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.gc-inline { display: inline-flex; align-items: center; min-height: 2.75rem; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.gc-intel { display: grid; gap: 0.25rem; }
.gc-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.375rem; }
.gc-chip { display: inline-flex; align-items: center; min-height: 2.25rem; padding: 0 0.75rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; font-size: 0.875rem; text-decoration: none; overflow-wrap: anywhere; color: var(--dz-ink-2) !important; }
.gc-chip:hover { border-color: var(--dz-ink); color: #fff !important; }
.gc-steps { display: grid; gap: 0.75rem; }
.gc-part { display: grid; gap: 0.375rem; padding: 0.5rem 0.75rem; border-left: 2px solid var(--dz-accent); background: rgba(11, 13, 12, 0.5); }
.gc-label { margin: 0; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-accent); }
.gc-label--fallback { color: #d8c47c; }
.gc-list { margin: 0; padding-left: 1.15rem; list-style: disc; display: grid; gap: 0.25rem; color: #dcd9cb; font-size: 0.9375rem; line-height: 1.45; }
ol.gc-list { list-style: decimal; }
ol.gc-list li::marker { color: var(--dz-accent); font-weight: 700; }
@media (prefers-reduced-motion: reduce) { .gc-how summary svg { transition: none; } }
@media (max-width: 599px) {
  .gc--print, .gc--map { grid-template-columns: minmax(0, 1fr); }
  .gc-card { grid-template-columns: auto minmax(0, 1fr); }
  .gc-unlock { grid-column: 2; }
  .gc-card.gc-card--map.gc-card--map:has(.gc-how[open]) { grid-template-columns: minmax(0, 1fr); }
  .gc-chip { min-height: 2.75rem; }
}
</style>
