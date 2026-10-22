<script setup lang="ts">
import { dmzIntel, intelDateLabel } from '#shared/dmz-intel.mjs'
import { issueStates, issueState, labDetail, labTimeline } from '#shared/dmz-lab.mjs'

// Status station: known issues by fix state, then the dates that matter.
type Entry = (typeof dmzIntel)[number]
const emit = defineEmits<{ open: [entry: Entry] }>()
const props = withDefaults(defineProps<{ show?: 'all' | 'issues' | 'dates' }>(), { show: 'all' })
const issues = dmzIntel.filter(entry => entry.category === 'issues')
const states = issueStates.map(state => ({ ...state, entries: issues.filter(entry => issueState(entry) === state.id) })).filter(state => state.entries.length)
const timeline = labTimeline()
const dated = timeline.filter(item => item.iso)
const undated = timeline.filter(item => !item.iso)
const pick = ref(states[0]?.id)
const year = (iso: string) => iso.slice(0, 4)
const status = (entry: Entry) => labDetail(entry, 'Status')
</script>

<template>
  <div class="st">
    <section v-if="props.show !== 'dates'" aria-labelledby="st-issues">
      <h3 id="st-issues" class="lab-h2">Known issues</h3>
      <div class="lab-chips st-states" role="group" aria-label="Show issues by fix state">
        <button v-for="state in states" :key="state.id" type="button" class="lab-chip" :aria-pressed="pick === state.id" @click="pick = state.id">{{ state.label }}<span class="dmz-mono">{{ state.entries.length }}</span></button>
      </div>
      <ul class="st-issues">
        <li v-for="entry in states.find(state => state.id === pick)?.entries" :key="entry.id">
          <DmzLabRow :entry="entry" :meta="status(entry) || 'No fix reported yet'" summary @open="emit('open', $event)" />
        </li>
      </ul>
    </section>

    <section v-if="props.show !== 'issues'" class="st-dates" aria-labelledby="st-dates">
      <h3 id="st-dates" class="lab-h2">Dates</h3>
      <ol class="st-line">
        <li v-for="item in dated" :key="item.entry.id">
          <span class="st-when dmz-mono">{{ intelDateLabel(item.iso!) }} {{ year(item.iso!) }}</span>
          <button type="button" class="st-what" @click="emit('open', item.entry)"><span class="w-semi">{{ item.entry.name }}</span><span>{{ item.entry.summary }}</span></button>
        </li>
      </ol>
      <h4 class="st-sub dmz-mono">No date yet · {{ undated.length }}</h4>
      <ul class="st-undated">
        <li v-for="item in undated" :key="item.entry.id"><DmzLabRow :entry="item.entry" @open="emit('open', $event)" /></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.st-states { margin: 0.75rem 0; }
.st-issues { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); gap: 0.375rem; }
.st-dates { margin-top: 2rem; }
.st-line { list-style: none; margin: 0.75rem 0 0; padding: 0; max-width: 48rem; border-left: 1px solid var(--dz-line-strong); }
.st-line li { position: relative; display: grid; grid-template-columns: 7.5rem 1fr; gap: 1rem; padding: 0.375rem 0 0.375rem 1.25rem; }
.st-line li::before { content: ''; position: absolute; left: -0.3rem; top: 1.05rem; width: 0.55rem; height: 0.55rem; transform: rotate(45deg); background: var(--dz-bg); border: 1.5px solid var(--dz-teal); }
.st-when { padding-top: 0.6rem; font-size: 0.8125rem; font-weight: 600; color: var(--dz-teal); }
.st-what { display: flex; flex-direction: column; gap: 0.125rem; padding: 0.5rem 0.75rem; border: 1px solid transparent; border-radius: 10px; background: none; color: #d6d3c4; font: inherit; font-size: 0.925rem; text-align: left; cursor: pointer; }
.st-what .w-semi { font-size: 1.0625rem; font-weight: 600; color: #f3f1e5; }
.st-what:hover { border-color: var(--dz-line-strong); background: rgba(20, 24, 23, 0.6); }
.st-sub { margin: 1.25rem 0 0.5rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.st-undated { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 0.375rem; }
@media (max-width: 599px) {
  .st-line li { grid-template-columns: 1fr; gap: 0; }
  .st-when { padding-top: 0.25rem; }
}
</style>
