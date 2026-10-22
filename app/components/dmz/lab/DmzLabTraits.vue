<script setup lang="ts">
import { dmzIntel } from '#shared/dmz-intel.mjs'
import { traitTrees, traitPlace, labDetail, labEntry } from '#shared/dmz-lab.mjs'

// Operators station: the three trait trees side by side, then the Operator rules.
type Entry = (typeof dmzIntel)[number]
const emit = defineEmits<{ open: [entry: Entry] }>()
const traits = dmzIntel.filter(entry => entry.category === 'traits' && entry.type === 'Trait')
const overview = labEntry('trait-trees')
const rules = ['Max points', 'Max traits per tree', 'Permanence', 'MIA effect']
  .map(label => [label, overview && labDetail(overview, label)]).filter(([, value]) => value) as [string, string][]
const trees = traitTrees.map(tree => {
  const entries = traits.filter(entry => traitPlace(entry).tree === tree)
  const head = dmzIntel.find(entry => entry.type === 'Trait tree' && entry.name.startsWith(tree))
  return {
    tree, head,
    major: entries.filter(entry => traitPlace(entry).kind === 'Major'),
    minor: entries.filter(entry => traitPlace(entry).kind !== 'Major'),
  }
})
const loose = dmzIntel.filter(entry => entry.category === 'traits' && entry.type !== 'Trait tree' && entry.id !== 'trait-trees' && !traitPlace(entry).tree)
const operators = dmzIntel.filter(entry => entry.category === 'operators')
const tab = ref(traitTrees[0])
</script>

<template>
  <div class="tt">
    <dl v-if="rules.length" class="tt-rules">
      <div v-for="[label, value] in rules" :key="label"><dt class="dmz-mono">{{ label }}</dt><dd>{{ value }}</dd></div>
    </dl>

    <div class="tt-tabs" role="group" aria-label="Show a trait tree">
      <button v-for="item in trees" :key="item.tree" type="button" class="lab-chip" :aria-pressed="tab === item.tree" @click="tab = item.tree">{{ item.tree }}<span class="dmz-mono">{{ item.major.length + item.minor.length }}</span></button>
    </div>
    <div class="tt-trees">
      <section v-for="item in trees" :key="item.tree" class="tt-tree" :class="{ 'is-shown': tab === item.tree }" :aria-labelledby="`tt-${item.tree}`">
        <header>
          <h3 :id="`tt-${item.tree}`" class="lab-h2">{{ item.tree }}</h3>
          <p v-if="item.head">{{ item.head.summary }}</p>
        </header>
        <h4 class="tt-sub dmz-mono">Major traits · {{ item.major.length }}</h4>
        <ul class="tt-list">
          <li v-for="entry in item.major" :key="entry.id">
            <button type="button" class="tt-trait" @click="emit('open', entry)"><span class="w-semi">{{ entry.name }}</span><span>{{ entry.summary }}</span></button>
          </li>
        </ul>
        <template v-if="item.minor.length">
          <h4 class="tt-sub dmz-mono">Minor and other · {{ item.minor.length }}</h4>
          <ul class="tt-list">
            <li v-for="entry in item.minor" :key="entry.id">
              <button type="button" class="tt-trait is-minor" @click="emit('open', entry)"><span class="w-semi">{{ entry.name }}</span><span>{{ entry.summary }}</span></button>
            </li>
          </ul>
        </template>
      </section>
    </div>

    <section v-if="loose.length" class="tt-more" aria-labelledby="tt-loose">
      <h3 id="tt-loose" class="lab-h2">Not tied to one tree</h3>
      <ul class="tt-grid"><li v-for="entry in loose" :key="entry.id"><DmzLabRow :entry="entry" summary @open="emit('open', $event)" /></li></ul>
    </section>
    <section class="tt-more" aria-labelledby="tt-ops">
      <h3 id="tt-ops" class="lab-h2">Operators</h3>
      <ul class="tt-grid"><li v-for="entry in operators" :key="entry.id"><DmzLabRow :entry="entry" summary @open="emit('open', $event)" /></li></ul>
    </section>
  </div>
</template>

<style scoped>
.tt-rules { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 0.5rem; margin: 0 0 1.25rem; }
.tt-rules > div { padding: 0.625rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 12px; background: rgba(20, 24, 23, 0.7); }
.tt-rules dt { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tt-rules dd { margin: 0.125rem 0 0; color: #e3e0d0; font-size: 0.95rem; }
.tt-tabs { display: none; }
.tt-trees { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; align-items: start; }
.tt-tree { padding: 1rem; border: 1px solid var(--dz-line); border-radius: 16px; background: rgba(14, 16, 15, 0.55); }
.tt-tree header { padding-bottom: 0.625rem; margin-bottom: 0.625rem; border-bottom: 1px solid var(--dz-line); }
.tt-tree header p { margin: 0.375rem 0 0; color: var(--dz-muted); font-size: 0.9rem; }
.tt-sub { margin: 0.75rem 0 0.375rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tt-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
.tt-trait { display: flex; flex-direction: column; gap: 0.125rem; width: 100%; min-height: 2.75rem; padding: 0.5rem 0.75rem; border: 1px solid var(--dz-line); border-left: 3px solid var(--dz-ink-2); border-radius: 8px; background: rgba(20, 24, 23, 0.8); color: #dcd9cb; font: inherit; font-size: 0.875rem; line-height: 1.4; text-align: left; cursor: pointer; }
.tt-trait .w-semi { font-size: 1rem; font-weight: 600; color: #f3f1e5; }
.tt-trait.is-minor { border-left-color: var(--dz-line-strong); border-left-style: dashed; }
.tt-trait:hover { border-color: var(--dz-line-strong); background: rgba(34, 40, 38, 0.85); }
.tt-more { margin-top: 1.75rem; }
.tt-grid { list-style: none; margin: 0.75rem 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 0.375rem; }
@media (max-width: 899px) {
  .tt-tabs { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 0.75rem; }
  .tt-trees { grid-template-columns: 1fr; }
  .tt-tree { display: none; }
  .tt-tree.is-shown { display: block; }
}
</style>
