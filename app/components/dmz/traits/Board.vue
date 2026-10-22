<script setup lang="ts">
import { traitTrees, traitList, TRAIT_POINTS, buildToQuery, traitIcon } from '#shared/dmz-traits.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'

// The tree with its card beside it (below on phones). With planner, the
// in-game counters sit on top and taps plan a build saved on this device.
type Spot = { tree: string, row: number, letter: string }
const props = withDefaults(defineProps<{ planner?: boolean, startPlanning?: boolean }>(), { planner: false, startPlanning: false })
const { build, ready, shared, saveError, pick, reset, spent } = useDmzTraits()
const planning = ref(props.startPlanning)
const tab = ref(traitTrees[0]!.id)
const selected = ref<Spot | null>(null)
const card = ref<HTMLElement | null>(null)
const view = computed(() => (props.planner && ready.value ? build.value : Object.fromEntries(traitTrees.map(tree => [tree.id, '']))))
const prestige = traitList.filter(trait => trait.kind === 'prestige')
function select(spot: Spot) {
  selected.value = spot
  tab.value = spot.tree
  if (window.matchMedia('(max-width: 899px)').matches) nextTick(() => card.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
}
const copied = ref(false)
async function copyLink() {
  const url = new URL(window.location.href)
  for (const key of ['wf', 'sc', 'sv']) url.searchParams.delete(key)
  for (const [key, value] of Object.entries(buildToQuery(build.value))) url.searchParams.set(key, value as string)
  url.hash = ''
  try { await navigator.clipboard.writeText(url.toString()); copied.value = true; setTimeout(() => { copied.value = false }, 2000) } catch {}
}
</script>

<template>
  <div class="tb">
    <div v-if="planner" class="tb-bar">
      <div class="tb-points">
        <span class="tb-big dmz-mono">{{ planning ? TRAIT_POINTS - spent : TRAIT_POINTS }}</span>
        <span class="tb-cap dmz-mono">{{ planning ? 'Trait points left' : 'Trait points per Operator' }}</span>
      </div>
      <ul v-if="planning" class="tb-trees" aria-label="Points per tree">
        <li v-for="tree in traitTrees" :key="tree.id" :style="{ '--tc': tree.colour }"><span class="dmz-mono">{{ build[tree.id]!.length }}</span>{{ tree.name }}</li>
      </ul>
      <div class="tb-actions">
        <button type="button" class="dz-chip" :aria-pressed="planning" @click="planning = !planning">{{ planning ? 'Planning on' : 'Plan a build' }}</button>
        <template v-if="planning">
          <button type="button" class="dz-chip" :disabled="!spent" @click="reset()">Reset</button>
          <button type="button" class="dz-chip" :disabled="!spent" @click="copyLink">{{ copied ? 'Link copied' : 'Copy link' }}</button>
        </template>
      </div>
      <p v-if="planning" class="tb-help">Tap the nodes from the bottom up, one per row. Tap a pick again to undo it and the rows above. Minor rows only show which slot you took, since each Operator rolls its own Minors.<template v-if="shared"> This build came from a link; changing it saves it as yours.</template><template v-if="saveError"> This browser did not let us save the build.</template></p>
    </div>

    <div class="tb-tabs dz-chips" role="group" aria-label="Show a trait tree">
      <button v-for="tree in traitTrees" :key="tree.id" type="button" class="dz-chip" :aria-pressed="tab === tree.id" @click="tab = tree.id">{{ tree.name }}<span v-if="planner && planning" class="dmz-mono">{{ build[tree.id]!.length }}/9</span></button>
    </div>

    <div class="tb-main">
      <DmzTraitsTree :build="planning ? view : {}" :plan="planning" :selected="selected" :only="tab" @select="select" @pick="spot => pick(spot.tree, spot.row, spot.letter)" />
      <div ref="card" class="tb-side">
        <DmzTraitsCard v-if="selected" :spot="selected" />
        <div v-else class="tb-hint">
          <p class="tb-hint-h dmz-mono">Tap a node</p>
          <p>Each tree climbs from the bottom: a random Minor, then two more Minor rows, then a pair of Majors on rows 3, 6 and 9. Majors are the same for every Operator; Minors (“?”) are rolled for each Operator.</p>
          <p>Tap a Major to read what it does, the trait it competes with and what players say about it.</p>
        </div>
      </div>
    </div>

    <section class="tb-prestige" aria-labelledby="tb-prestige">
      <h3 id="tb-prestige" class="tb-prestige-h dmz-mono">Prestige column · up to 3 permanent traits</h3>
      <p>Each Operator Prestige adds one random Permanent Prestige trait, outside the 18 points. Players have reported these so far; the full list is not known.</p>
      <ul>
        <li v-for="trait in prestige" :key="trait.id"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="traitIcon(trait)" /></svg><span><strong>{{ trait.name }}.</strong> {{ trait.effect }} <span class="dz-badge" :class="`is-${trait.confidence}`">{{ intelConfidenceLabel(trait.confidence) }}</span></span></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.tb { display: grid; gap: 1rem; }
.tb-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.5rem; padding: 0.875rem 1rem; border: 1px solid var(--dz-line); border-radius: 14px; background: rgba(14, 16, 15, 0.7); }
.tb-points { display: flex; align-items: baseline; gap: 0.5rem; }
.tb-big { font-size: 2.25rem; font-weight: 700; line-height: 1; color: #f7f5ea; }
.tb-cap { font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.tb-trees { display: flex; gap: 0.75rem; margin: 0; padding: 0; list-style: none; }
.tb-trees li { display: flex; align-items: center; gap: 0.375rem; color: var(--dz-ink-2); font-size: 0.875rem; }
.tb-trees .dmz-mono { display: inline-grid; place-items: center; min-width: 1.75rem; height: 1.75rem; border-radius: 6px; background: var(--tc); color: #fff; font-weight: 700; }
.tb-actions { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-left: auto; }
.tb-actions .dz-chip:disabled { opacity: 0.45; cursor: default; }
.tb-help { flex-basis: 100%; margin: 0; color: var(--dz-muted); font-size: 0.9rem; }
.tb-tabs { display: none; }
.tb-main { display: grid; grid-template-columns: minmax(0, 1fr) 19rem; gap: 1rem; align-items: start; }
.tb-side { position: sticky; top: 1rem; scroll-margin-top: 1rem; }
.tb-hint { padding: 1rem 1.125rem; border: 1px dashed var(--dz-line-strong); border-radius: 14px; color: #dcd9cb; font-size: 0.95rem; }
.tb-hint p { margin: 0 0 0.625rem; }
.tb-hint p:last-child { margin: 0; }
.tb-hint-h { font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tb-prestige { padding: 1rem; border: 1px solid rgba(233, 140, 70, 0.4); border-radius: 14px; background: rgba(233, 140, 70, 0.06); }
.tb-prestige-h { margin: 0; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: #ec9a5c; }
.tb-prestige > p { margin: 0.25rem 0 0.75rem; color: var(--dz-muted); font-size: 0.925rem; }
.tb-prestige ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.tb-prestige li { display: flex; gap: 0.625rem; color: #dcd9cb; font-size: 0.925rem; }
.tb-prestige svg { flex: none; width: 2rem; height: 2rem; padding: 0.35rem; border-radius: 6px 6px 50% 50%; background: #c9822f; fill: none; stroke: #fff; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.tb-prestige .dz-badge { margin-left: 0.25rem; }
@media (max-width: 1099px) { .tb-main { grid-template-columns: minmax(0, 1fr) 16rem; } }
@media (max-width: 899px) {
  .tb-tabs { display: flex; }
  .tb-main { grid-template-columns: minmax(0, 1fr); }
  .tb-side { position: static; }
  .tb-actions { margin-left: 0; }
}
</style>
