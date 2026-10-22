<script setup lang="ts">
import { guideDeployments, guideMeters } from '#shared/dmz-guide.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'

// The in-game Select Deployment screen: three tiles, then a briefing for the
// one picked. Dynamic Operations lists every op under it, unless ops is false
// because the page shows them elsewhere.
withDefaults(defineProps<{ ops?: boolean }>(), { ops: true })
const picked = ref('ops')
const deployment = computed(() => guideDeployments.find(item => item.id === picked.value)!)

// Arrow keys move between the tiles, as in a tab list.
const tiles = ref<HTMLButtonElement[]>([])
function move(event: KeyboardEvent, index: number) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
  if (!step) return
  event.preventDefault()
  const next = (index + step + guideDeployments.length) % guideDeployments.length
  picked.value = guideDeployments[next]!.id
  tiles.value[next]?.focus()
}
</script>

<template>
  <div class="gd">
    <div class="gd-tiles" role="tablist" aria-label="Select deployment">
      <button v-for="(item, index) in guideDeployments" :id="`gd-tab-${item.id}`" :key="item.id" ref="tiles" type="button" role="tab" class="gd-tile" :aria-selected="picked === item.id" :aria-controls="`gd-panel`" :tabindex="picked === item.id ? 0 : -1" @click="picked = item.id" @keydown="move($event, index)">
        <span class="gd-tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path :d="item.icon" /></svg></span>
        <span class="gd-tile-name">{{ item.name }}</span>
        <span class="gd-tile-line">{{ item.line }}</span>
      </button>
    </div>

    <div id="gd-panel" class="gd-panel" role="tabpanel" :aria-labelledby="`gd-tab-${deployment.id}`">
      <div class="gd-brief">
        <p class="gd-line">{{ deployment.line }}</p>
        <dl class="gd-meters">
          <div v-for="meter in guideMeters" :key="meter.id">
            <dt class="dmz-mono">{{ meter.label }}</dt>
            <dd :aria-label="`${deployment.meters[meter.id as keyof typeof deployment.meters]} of 3`"><span v-for="n in 3" :key="n" :class="{ 'is-on': n <= deployment.meters[meter.id as keyof typeof deployment.meters], 'is-risk': meter.id === 'risk' }" /></dd>
          </div>
        </dl>
        <p class="gd-pick"><span class="dmz-mono">Pick it for</span>{{ deployment.pick }}</p>
        <ol class="gd-how">
          <li v-for="(line, index) in deployment.how" :key="line"><span class="dmz-mono" aria-hidden="true">{{ index + 1 }}</span>{{ line }}</li>
        </ol>
        <p class="gd-note">{{ deployment.note }}</p>
        <p class="gd-foot">
          <span class="dz-badge" :class="`is-${deployment.confidence}`">{{ intelConfidenceLabel(deployment.confidence) }}</span>
          <DmzIntelLink :id="deployment.intel" class="gd-intel">More in Intel</DmzIntelLink>
        </p>
      </div>
    </div>

    <DmzGuideOps v-if="ops && picked === 'ops'" heading class="gd-ops" />
  </div>
</template>

<style scoped>
.gd { display: grid; gap: 0.75rem; }
.gd-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; }
.gd-tile { position: relative; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto 1fr; column-gap: 0.75rem; row-gap: 0.375rem; align-content: start; min-height: 7.5rem; padding: 1rem; border: 1px solid var(--dz-line-strong); background: linear-gradient(160deg, rgba(36, 42, 40, 0.92), rgba(14, 16, 15, 0.92)); color: var(--dz-ink); text-align: left; font: inherit; cursor: pointer; clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%); }
.gd-tile:hover { border-color: var(--dz-ink); }
.gd-tile[aria-selected='true'] { background: linear-gradient(160deg, rgba(233, 230, 214, 0.95), rgba(205, 201, 184, 0.92)); color: var(--dz-bg); border-color: var(--dz-ink); }
.gd-tile-icon { grid-row: 1 / 3; display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border: 1.5px solid currentColor; border-radius: 50%; }
.gd-tile-icon svg { width: 1.375rem; height: 1.375rem; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.gd-tile-name { font-size: 1.25rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; }
.gd-tile-line { font-size: 0.9375rem; line-height: 1.35; opacity: 0.85; }
.gd-panel { padding: 1rem 1.25rem; border: 1px solid var(--dz-line-strong); border-top: 3px solid var(--dz-ink); background: rgba(20, 24, 23, 0.88); }
.gd-brief { display: grid; grid-template-columns: 12rem minmax(0, 1fr); gap: 0.75rem 1.5rem; }
.gd-meters { grid-row: span 4; display: grid; align-content: start; gap: 0.5rem; margin: 0; }
.gd-meters div { display: grid; grid-template-columns: 3.5rem 1fr; align-items: center; gap: 0.5rem; }
.gd-meters dt { font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.gd-meters dd { display: flex; gap: 0.25rem; margin: 0; }
.gd-meters dd span { flex: 1; height: 0.5rem; background: rgba(233, 230, 214, 0.12); transform: skewX(-18deg); }
.gd-meters dd span.is-on { background: var(--dz-green); }
.gd-meters dd span.is-on.is-risk { background: #e8a04f; }
.gd-pick { display: grid; gap: 0.2rem; margin: 0; color: var(--dz-ink); font-size: 1.0625rem; }
.gd-pick span, .gd-how span { font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.gd-how { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
.gd-how li { display: flex; gap: 0.625rem; align-items: baseline; color: #dcd9cb; font-size: 0.975rem; }
.gd-how span { flex: none; display: inline-grid; place-items: center; width: 1.25rem; height: 1.25rem; border: 1px solid var(--dz-line-strong); border-radius: 50%; letter-spacing: 0; }
.gd-note { margin: 0; padding: 0.5rem 0.75rem; border-left: 2px solid var(--dz-accent); background: rgba(221, 179, 99, 0.08); color: #e7dcc2; font-size: 0.9375rem; }
.gd-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin: 0; }
.gd-intel { display: inline-flex; align-items: center; min-height: 2.5rem; font-size: 0.9375rem; font-weight: 600; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.gd-ops { margin-top: 0.75rem; }
.gd-line { display: none; }
@media (max-width: 899px) {
  .gd-brief { grid-template-columns: 1fr; }
  .gd-meters { grid-row: auto; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
/* Phones: three small tiles in a row; the picked one's line moves into the panel. */
@media (max-width: 599px) {
  .gd-tiles { gap: 0.375rem; }
  .gd-tile { grid-template-columns: 1fr; grid-template-rows: none; justify-items: center; min-height: 0; padding: 0.75rem 0.375rem; text-align: center; clip-path: polygon(0 0, calc(100% - 0.625rem) 0, 100% 0.625rem, 100% 100%, 0 100%); }
  .gd-tile-icon { grid-row: auto; width: 2.25rem; height: 2.25rem; }
  .gd-tile-name { font-size: 0.9375rem; line-height: 1.1; }
  .gd-tile-line { display: none; }
  .gd-line { display: block; margin: 0; color: var(--dz-ink); font-size: 1rem; }
  .gd-panel { padding: 0.875rem; }
}
</style>
