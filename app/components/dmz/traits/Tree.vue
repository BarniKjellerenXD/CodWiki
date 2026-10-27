<script setup lang="ts">
import { traitTrees, traitRows, majorPair, rowChoices, canPick, traitIcon, MINOR_ICON, TREE_CAP } from '#shared/dmz-traits.mjs'

// The trait trees drawn like the in-game TRAITS screen: columns climbed from
// the bottom, Majors in pairs on rows 3, 6 and 9, random Minors as '?'. With
// plan on, tapping a node plans a build; either way it selects the node.
type Spot = { tree: string, row: number, letter: string }
const props = withDefaults(defineProps<{ build: Record<string, string>, plan?: boolean, selected?: Spot | null, only?: string | null }>(), { plan: false, selected: null, only: null })
const emit = defineEmits<{ select: [Spot], pick: [Spot] }>()

const ROWS = traitRows.length
const xs: Record<number, number[]> = { 1: [50], 2: [30, 70], 3: [18, 50, 82] }
const yOf = (row: number) => ((ROWS - row + 0.5) / ROWS) * 100

const trees = computed(() => traitTrees.map(tree => {
  const text = props.build[tree.id] || ''
  const rows = traitRows.map(({ row, kind }) => {
    const letters = rowChoices(row)
    const nodes = letters.map((letter, index) => {
      const trait = kind === 'major' ? majorPair(tree.id, row)[index] : null
      const picked = text[row - 1] === letter
      const state = picked ? 'picked' : row <= text.length ? 'out' : props.plan && canPick(props.build, tree.id, row) ? 'next' : 'idle'
      return { letter, trait, kind, state, x: xs[letters.length]![index]!, y: yOf(row) }
    })
    return { row, kind, nodes }
  })
  const pickedNodes = rows.map(row => row.nodes.find(node => node.state === 'picked')).filter(Boolean) as typeof rows[number]['nodes']
  const lines = pickedNodes.slice(1).map((node, index) => elbow(pickedNodes[index]!, node))
  const last = pickedNodes.at(-1)
  const nextRow = rows[text.length]
  const guides = props.plan && last && nextRow?.nodes.some(node => node.state === 'next') ? nextRow.nodes.map(node => elbow(last, node)) : []
  return { ...tree, rows, lines, guides, spent: text.length }
}))
function elbow(from: { x: number, y: number }, to: { x: number, y: number }) {
  const mid = (from.y + to.y) / 2
  return `M${from.x} ${from.y}V${mid}H${to.x}V${to.y}`
}
const isSelected = (tree: string, row: number, letter: string) => props.selected?.tree === tree && props.selected.row === row && props.selected.letter === letter
function label(tree: string, row: number, node: { trait: { name: string } | null, kind: string, state: string }) {
  const what = node.trait ? `Major: ${node.trait.name}` : node.kind === 'start' ? 'starting Minor (random)' : 'random Minor'
  const state = { picked: ', picked', out: ', not picked', next: ', can be picked', idle: '' }[node.state]
  return `${tree} row ${row}, ${what}${state}`
}
function tap(tree: string, row: number, letter: string, state: string) {
  const spot = { tree, row, letter }
  if (props.plan && (state === 'next' || state === 'picked' || state === 'out')) emit('pick', spot)
  emit('select', spot)
}
</script>

<template>
  <div class="tr-trees" :class="{ 'is-plan': plan }">
    <section v-for="tree in trees" :key="tree.id" class="tr-col" :class="[`is-${tree.shape}`, { 'is-hidden': only && only !== tree.id }]" :style="{ '--tc': tree.colour }" :aria-label="`${tree.name} tree`">
      <div class="tr-body">
        <svg class="tr-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path v-for="(d, index) in tree.guides" :key="`g${index}`" :d="d" class="tr-guide" />
          <path v-for="(d, index) in tree.lines" :key="`l${index}`" :d="d" class="tr-line" />
        </svg>
        <template v-for="row in tree.rows" :key="row.row">
          <button
            v-for="node in row.nodes" :key="node.letter" type="button"
            class="tr-node" :class="[`is-${node.kind}`, `is-${node.state}`, { 'is-sel': isSelected(tree.id, row.row, node.letter) }]"
            :style="{ left: `${node.x}%`, top: `${node.y}%`, '--x': node.x }"
            :aria-label="label(tree.name, row.row, node)" :aria-pressed="plan ? node.state === 'picked' : undefined"
            @click="tap(tree.id, row.row, node.letter, node.state)"
          >
            <span class="tr-shape" aria-hidden="true" />
            <svg v-if="node.trait || node.state === 'picked' || node.kind === 'start'" viewBox="0 0 24 24" aria-hidden="true"><path :d="node.trait ? traitIcon(node.trait) : MINOR_ICON" /></svg>
            <span v-else class="tr-q" aria-hidden="true">?</span>
            <span class="tr-tip" aria-hidden="true">{{ node.trait ? node.trait.name : node.kind === 'start' ? 'Starting Minor' : 'Random Minor' }}</span>
          </button>
        </template>
      </div>
      <footer class="tr-foot">
        <span class="tr-name">{{ tree.name }}</span>
        <span class="tr-count dmz-mono">{{ tree.spent }}/{{ TREE_CAP }}</span>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.tr-trees { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
.tr-col { --tc: #ccc; display: flex; flex-direction: column; padding: 0.75rem 0.5rem 0.5rem; border: 1px solid var(--dz-line); background: linear-gradient(180deg, rgba(14, 16, 15, 0.4), color-mix(in srgb, var(--tc) 9%, rgba(14, 16, 15, 0.85))); }
.tr-col.is-hex { clip-path: polygon(1.25rem 0, calc(100% - 1.25rem) 0, 100% 1.25rem, 100% 100%, 0 100%, 0 1.25rem); }
.tr-col.is-circle { border-radius: 999px 999px 14px 14px / 6rem 6rem 14px 14px; padding-top: 1.5rem; }
.tr-col.is-square { border-radius: 4px; }
.tr-body { position: relative; height: 36rem; }
.tr-lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.tr-lines path { fill: none; vector-effect: non-scaling-stroke; }
.tr-line { stroke: var(--tc); stroke-width: 2; }
.tr-guide { stroke: color-mix(in srgb, var(--tc) 70%, transparent); stroke-width: 1.5; stroke-dasharray: 2 4; }
.tr-node { --edge: color-mix(in srgb, var(--tc) 60%, transparent); --fill: #121514; position: absolute; display: grid; place-items: center; width: 2.75rem; height: 2.75rem; padding: 0; transform: translate(-50%, -50%); border: 0; background: none; color: var(--dz-ink-2); cursor: pointer; font: inherit; }
.tr-node.is-major { --edge: color-mix(in srgb, var(--tc) 85%, transparent); width: 3.25rem; height: 3.25rem; }
.tr-shape { position: absolute; inset: 0; background: var(--edge); }
.tr-shape::after { content: ''; position: absolute; inset: 1.5px; background: var(--fill); }
.is-hex .tr-shape, .is-hex .tr-shape::after { clip-path: polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0 50%); }
.is-circle .tr-shape, .is-circle .tr-shape::after { border-radius: 50%; }
.is-square .tr-shape { border-radius: 5px; }
.is-square .tr-shape::after { border-radius: 4px; }
.tr-node svg, .tr-q { position: relative; z-index: 1; }
.tr-node svg { width: 1.375rem; height: 1.375rem; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.tr-node.is-major svg { width: 1.625rem; height: 1.625rem; }
.tr-q { font-weight: 700; font-size: 1.1rem; color: color-mix(in srgb, var(--tc) 80%, #fff); }
.tr-node.is-picked { --edge: var(--tc); --fill: var(--tc); color: #fff; filter: drop-shadow(0 0 0.5rem color-mix(in srgb, var(--tc) 70%, transparent)); }
.tr-node.is-picked svg { filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.6)); }
.tr-node.is-out { --edge: transparent; --fill: transparent; color: rgba(233, 230, 214, 0.32); }
.tr-node.is-next { --edge: var(--tc); --fill: color-mix(in srgb, var(--tc) 22%, #121514); color: #fff; }
.tr-node:hover, .tr-node:focus-visible { color: #fff; outline: none; }
.tr-node:hover { --edge: var(--tc); }
.tr-node:focus-visible .tr-shape { filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 2px #fff); }
.tr-node.is-sel .tr-shape { filter: drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff); }
/* Tips lean inward by their node's x, so the hex column's clip never cuts the outer ones. */
.tr-tip { position: absolute; left: 50%; bottom: calc(100% + 0.375rem); z-index: 3; transform: translateX(calc(var(--x) * -1%)); padding: 0.25rem 0.5rem; background: rgba(8, 10, 9, 0.95); border-left: 2px solid var(--tc); color: #f3f1e5; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; font-variation-settings: 'wdth' 62.5; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.12s; }
.tr-node:hover .tr-tip, .tr-node:focus-visible .tr-tip { opacity: 1; }
.tr-foot { display: flex; align-items: baseline; justify-content: center; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid color-mix(in srgb, var(--tc) 35%, transparent); }
.tr-name { color: var(--tc); font-size: 1.25rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-variation-settings: 'wdth' 75; }
.tr-count { font-size: 0.75rem; color: var(--dz-muted); }
@media (prefers-reduced-motion: reduce) { .tr-tip { transition: none; } }
@media (hover: none) { .tr-tip { display: none; } }
@media (max-width: 899px) {
  .tr-trees { grid-template-columns: minmax(0, 1fr); }
  .tr-col.is-hidden { display: none; }
  .tr-body { height: 34rem; }
}
</style>
