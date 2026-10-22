<script setup lang="ts">
import { treeById, traitRows, majorPair, traitsIn, tipsFor, traitIcon, MINOR_ICON } from '#shared/dmz-traits.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'

// What a tapped node is: a Major with its rival in the fork and what players
// say about it, or a Minor row with the Minors players have seen in that tree.
type Spot = { tree: string, row: number, letter: string }
const props = defineProps<{ spot: Spot }>()
const tree = computed(() => treeById(props.spot.tree)!)
const kind = computed(() => traitRows[props.spot.row - 1]!.kind)
const pair = computed(() => (kind.value === 'major' ? majorPair(props.spot.tree, props.spot.row) : []))
const trait = computed(() => pair.value['ab'.indexOf(props.spot.letter)])
const rival = computed(() => pair.value.find(item => item !== trait.value))
const tips = computed(() => (trait.value ? tipsFor(trait.value.id) : []))
const minors = computed(() => traitsIn(props.spot.tree, 'minor'))
const minorTips = computed(() => minors.value.flatMap(item => tipsFor(item.id).map(tip => ({ ...tip, name: item.name }))))
const sources = computed(() => (trait.value ? trait.value.sources : [...new Set(minors.value.flatMap(item => item.sources))]))
</script>

<template>
  <article class="tc" :style="{ '--tc': tree.colour }" aria-live="polite">
    <template v-if="trait">
      <header class="tc-head">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="traitIcon(trait)" /></svg>
        <div>
          <p class="tc-kicker dmz-mono">{{ tree.name }} · row {{ spot.row }} Major</p>
          <h3 class="tc-name">{{ trait.name }}</h3>
        </div>
      </header>
      <p class="tc-effect">{{ trait.effect }}</p>
      <p class="tc-meta"><span class="dz-badge" :class="`is-${trait.confidence}`">{{ intelConfidenceLabel(trait.confidence) }}</span><span v-if="trait.numbers" class="dmz-mono">{{ trait.numbers }}</span></p>
      <div v-if="rival" class="tc-rival">
        <span class="dmz-label dmz-mono">Or, in the same fork</span>
        <p><strong>{{ rival.name }}.</strong> {{ rival.effect }}</p>
      </div>
      <div class="tc-say">
        <span class="dmz-label dmz-mono">What players say</span>
        <ul v-if="tips.length">
          <li v-for="tip in tips" :key="tip.say">{{ tip.say }} <span v-if="tip.players > 1" class="tc-n dmz-mono">{{ tip.players }} players</span></li>
        </ul>
        <p v-else class="tc-none">No player tips for this trait yet.</p>
      </div>
      <DmzIntelLink v-if="trait.intel" :id="trait.intel" class="tc-more">More in Intel</DmzIntelLink>
    </template>
    <template v-else>
      <header class="tc-head">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="MINOR_ICON" /></svg>
        <div>
          <p class="tc-kicker dmz-mono">{{ tree.name }} · row {{ spot.row }}</p>
          <h3 class="tc-name">{{ kind === 'start' ? 'Starting Minor' : 'Random Minor' }}</h3>
        </div>
      </header>
      <p class="tc-effect">
        <template v-if="kind === 'start'">Your first point in this tree buys one random Minor. You see which one before you spend the point.</template>
        <template v-else>Three random Minors, shown as “?” until you pick in the row below. Every Operator rolls its own, so this row differs between Operators. Pick one to open the next row.</template>
      </p>
      <div class="tc-say">
        <span class="dmz-label dmz-mono">Minors seen in {{ tree.name }} · {{ minors.length }}</span>
        <ul class="tc-minors">
          <li v-for="item in minors" :key="item.id"><strong>{{ item.name }}.</strong> {{ item.effect }} <span class="dz-badge" :class="`is-${item.confidence}`">{{ intelConfidenceLabel(item.confidence) }}</span></li>
        </ul>
      </div>
      <div v-if="minorTips.length" class="tc-say">
        <span class="dmz-label dmz-mono">What players say</span>
        <ul><li v-for="tip in minorTips" :key="tip.say"><strong>{{ tip.name }}:</strong> {{ tip.say }} <span v-if="tip.players > 1" class="tc-n dmz-mono">{{ tip.players }} players</span></li></ul>
      </div>
    </template>
    <DmzGuideSources :ids="sources" />
  </article>
</template>

<style scoped>
.tc { --tc: #ccc; display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem 1.125rem; border: 1px solid var(--dz-line); border-top: 3px solid var(--tc); border-radius: 4px 4px 14px 14px; background: rgba(14, 16, 15, 0.9); }
.tc-head { display: flex; align-items: center; gap: 0.75rem; }
.tc-head svg { flex: none; width: 2.5rem; height: 2.5rem; padding: 0.5rem; border-radius: 10px; background: var(--tc); fill: none; stroke: #fff; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.tc-kicker { margin: 0; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tc); }
.tc-name { margin: 0; font-size: 1.375rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.tc-effect { margin: 0; color: #e3e0d0; }
.tc-meta { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 0.8rem; color: var(--dz-muted); }
.tc-rival { padding: 0.5rem 0.75rem; border-left: 2px solid var(--dz-line-strong); background: rgba(10, 12, 11, 0.4); }
.tc-rival p { margin: 0; color: #dcd9cb; font-size: 0.95rem; }
.tc-say ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.375rem; color: #dcd9cb; font-size: 0.95rem; }
.tc-minors { max-height: 22rem; overflow-y: auto; }
.tc-minors .dz-badge { margin-left: 0.25rem; vertical-align: 0.1em; }
.tc-n { margin-left: 0.25rem; padding: 0.05rem 0.4rem; border-radius: 4px; background: rgba(233, 230, 214, 0.1); font-size: 0.6875rem; color: var(--dz-ink-2); white-space: nowrap; }
.tc-none { margin: 0; color: var(--dz-muted); font-size: 0.925rem; }
.tc-more { align-self: flex-start; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
</style>
