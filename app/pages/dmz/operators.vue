<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, DMZ_INTEL_CHECKED } from '#shared/dmz-intel.mjs'
import { traitTrees, traitPlace, intelDetail, intelEntry } from '#shared/dmz-stations.mjs'

// Operators station: the three trait trees side by side (one at a time on
// phones), then the Operator rules: Active Duty, MIA and Dog Tags.
const icon = dmzStations.find(station => station.id === 'operators')!.icon
const traits = dmzIntel.filter(entry => entry.category === 'traits' && entry.type === 'Trait')
const overview = intelEntry('trait-trees')
const rules = ['Max points', 'Max traits per tree', 'Permanence', 'MIA effect']
  .map(label => [label, overview && intelDetail(overview, label)]).filter(([, value]) => value) as [string, string][]
const trees = traitTrees.map(tree => {
  const entries = traits.filter(entry => traitPlace(entry).tree === tree)
  return {
    tree,
    id: tree.toLowerCase(),
    head: dmzIntel.find(entry => entry.type === 'Trait tree' && entry.name.startsWith(tree)),
    major: entries.filter(entry => traitPlace(entry).kind === 'Major'),
    minor: entries.filter(entry => traitPlace(entry).kind !== 'Major'),
  }
})
const inTree = new Set(trees.flatMap(item => [item.head?.id, ...item.major.map(entry => entry.id), ...item.minor.map(entry => entry.id)]))
const loose = dmzIntel.filter(entry => entry.category === 'traits' && entry.id !== 'trait-trees' && !inTree.has(entry.id))
const operators = dmzIntel.filter(entry => entry.category === 'operators')
const tab = ref(traitTrees[0])
// Phones show one tree: a link to a trait, or to a tree (#scout), shows its
// tree. The server never sees the hash, so this waits for hydration.
const route = useRoute()
function showTreeOf(hash: string) {
  const entry = intelEntry(decodeURIComponent(hash.replace(/^#intel-/, '')))
  const item = trees.find(tree => `#${tree.id}` === hash || (entry && (tree.head?.id === entry.id || traitPlace(entry).tree === tree.tree)))
  if (item) tab.value = item.tree
}
onMounted(() => showTreeOf(route.hash))
watch(() => route.hash, showTreeOf)
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Operators" :icon="icon" :checked="DMZ_INTEL_CHECKED" :status="`${traits.length} traits · ${traitTrees.length} trees · ${operators.length} Operator entries`">
      <p v-if="overview" class="dz-lede">{{ overview.summary }} <DmzIntelLink :id="overview.id" anchor class="tt-more">How traits work</DmzIntelLink></p>
    </DmzPageHead>
    <DmzIntelNav />

    <section id="traits" class="dz-group" aria-labelledby="traits-title">
      <h2 id="traits-title" class="sr-only">Trait trees</h2>
      <dl v-if="rules.length" class="tt-rules">
        <div v-for="[label, value] in rules" :key="label"><dt class="dmz-mono">{{ label }}</dt><dd>{{ value }}</dd></div>
      </dl>
      <div class="tt-tabs dz-chips" role="group" aria-label="Show a trait tree">
        <button v-for="item in trees" :key="item.tree" type="button" class="dz-chip" :aria-pressed="tab === item.tree" @click="tab = item.tree">{{ item.tree }}<span class="dmz-mono">{{ item.major.length + item.minor.length }}</span></button>
      </div>
      <div class="tt-trees">
        <section v-for="item in trees" :id="item.id" :key="item.tree" class="tt-tree" :class="{ 'is-shown': tab === item.tree }" :aria-labelledby="`${item.id}-title`">
          <header>
            <h3 :id="`${item.id}-title`" class="dz-h2">{{ item.tree }}</h3>
            <p v-if="item.head">{{ item.head.summary }} <DmzIntelLink :id="item.head.id" anchor class="tt-more">More<span class="sr-only"> on the {{ item.tree }} tree</span></DmzIntelLink></p>
          </header>
          <h4 class="tt-sub dmz-mono">Major traits · {{ item.major.length }}</h4>
          <ul class="tt-list">
            <li v-for="entry in item.major" :key="entry.id">
              <DmzIntelLink :id="entry.id" anchor class="tt-trait"><span class="w-semi">{{ entry.name }}</span><span>{{ entry.summary }}</span></DmzIntelLink>
            </li>
          </ul>
          <template v-if="item.minor.length">
            <h4 class="tt-sub dmz-mono">Minor and other · {{ item.minor.length }}</h4>
            <ul class="tt-list">
              <li v-for="entry in item.minor" :key="entry.id">
                <DmzIntelLink :id="entry.id" anchor class="tt-trait is-minor"><span class="w-semi">{{ entry.name }}</span><span>{{ entry.summary }}</span></DmzIntelLink>
              </li>
            </ul>
          </template>
        </section>
      </div>
    </section>

    <section v-if="loose.length" class="dz-group" aria-labelledby="loose-title">
      <header class="dz-group-head"><h2 id="loose-title" class="dz-h2">Not tied to one tree</h2></header>
      <ul class="dz-rows"><li v-for="entry in loose" :key="entry.id"><DmzIntelRow :entry="entry" summary /></li></ul>
    </section>
    <section id="operators" class="dz-group" aria-labelledby="operators-title">
      <header class="dz-group-head">
        <h2 id="operators-title" class="dz-h2">Operators</h2>
        <p>Active Duty slots, what happens when an Operator goes missing in action, and Dog Tag levels.</p>
      </header>
      <ul class="dz-rows"><li v-for="entry in operators" :key="entry.id"><DmzIntelRow :entry="entry" summary /></li></ul>
    </section>
  </div>
</template>

<style scoped>
.tt-more { color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.tt-rules { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 0.5rem; margin: 0 0 1.25rem; }
.tt-rules > div { padding: 0.625rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 12px; background: rgba(20, 24, 23, 0.7); }
.tt-rules dt { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tt-rules dd { margin: 0.125rem 0 0; color: #e3e0d0; font-size: 0.95rem; }
.tt-tabs { display: none; }
.tt-trees { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; align-items: start; }
.tt-tree { padding: 1rem; border: 1px solid var(--dz-line); border-radius: 16px; background: rgba(14, 16, 15, 0.55); scroll-margin-top: 1.5rem; }
.tt-tree header { padding-bottom: 0.625rem; margin-bottom: 0.625rem; border-bottom: 1px solid var(--dz-line); }
.tt-tree header p { margin: 0.375rem 0 0; color: var(--dz-muted); font-size: 0.9rem; }
.tt-sub { margin: 0.75rem 0 0.375rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tt-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
.tt-trait { display: flex; flex-direction: column; gap: 0.125rem; width: 100%; min-height: 2.75rem; padding: 0.5rem 0.75rem; border: 1px solid var(--dz-line); border-left: 3px solid var(--dz-ink-2); border-radius: 8px; background: rgba(20, 24, 23, 0.8); color: #dcd9cb !important; font-size: 0.875rem; line-height: 1.4; text-decoration: none; }
.tt-trait .w-semi { font-size: 1rem; font-weight: 600; color: #f3f1e5; }
.tt-trait.is-minor { border-left-color: var(--dz-line-strong); border-left-style: dashed; }
.tt-trait:hover { border-color: var(--dz-line-strong); background: rgba(34, 40, 38, 0.85); }
.tt-trait.is-open { border-color: var(--dz-accent); }
@media (max-width: 899px) {
  .tt-tabs { display: flex; margin-bottom: 0.75rem; }
  .tt-trees { grid-template-columns: minmax(0, 1fr); }
  .tt-tree { display: none; }
  .tt-tree.is-shown { display: block; }
}
</style>
