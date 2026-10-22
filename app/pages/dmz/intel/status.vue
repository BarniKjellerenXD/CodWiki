<script setup lang="ts">
import { dmzIntel, intelDateLabel, DMZ_INTEL_CHECKED } from '#shared/dmz-intel.mjs'
import { intelStation, issueStates, issueState, intelDetail, intelEntry, intelTimeline } from '#shared/dmz-stations.mjs'

// Status shelf: known issues sorted by fix state, then the dates that matter in order.
const station = intelStation('status')!
const issues = dmzIntel.filter(entry => entry.category === 'issues')
const states = issueStates.map(state => ({ ...state, entries: issues.filter(entry => issueState(entry) === state.id) })).filter(state => state.entries.length)
const timeline = intelTimeline()
const dated = timeline.filter(item => item.iso)
const undated = timeline.filter(item => !item.iso)
const pick = ref(states[0]?.id)
const shownIssues = computed(() => states.find(state => state.id === pick.value)?.entries || [])
const status = (entry: (typeof dmzIntel)[number]) => intelDetail(entry, 'Status')

// A link to an issue shows the fix state it sits under. The server never sees
// the hash, so this waits for hydration.
const route = useRoute()
function showStateOf(hash: string) {
  const entry = intelEntry(decodeURIComponent(hash.replace(/^#intel-/, '')))
  if (entry?.category === 'issues') pick.value = issueState(entry)
}
onMounted(() => showStateOf(route.hash))
watch(() => route.hash, showStateOf)
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Status" :icon="station.icon" :checked="DMZ_INTEL_CHECKED" :status="`Intel · ${issues.length} known issues · ${timeline.length} dates`">
      <p class="dz-lede">{{ station.desc }}</p>
    </DmzPageHead>
    <DmzIntelNav />

    <section id="issues" class="dz-group" aria-labelledby="issues-title">
      <header class="dz-group-head">
        <h2 id="issues-title" class="dz-h2">Known issues<span class="dmz-mono">{{ issues.length }}</span></h2>
        <p>Bugs and odd behaviour players report, sorted by what the developers have said about each.</p>
      </header>
      <div class="dz-chips st-states" role="group" aria-label="Show issues by fix state">
        <button v-for="state in states" :key="state.id" type="button" class="dz-chip" :aria-pressed="pick === state.id" @click="pick = state.id">{{ state.label }}<span class="dmz-mono">{{ state.entries.length }}</span></button>
      </div>
      <ul class="dz-rows">
        <li v-for="entry in shownIssues" :key="entry.id"><DmzIntelRow :entry="entry" :meta="status(entry) || 'No fix reported yet'" summary /></li>
      </ul>
    </section>

    <section id="dates" class="dz-group" aria-labelledby="dates-title">
      <header class="dz-group-head">
        <h2 id="dates-title" class="dz-h2">Dates<span class="dmz-mono">{{ timeline.length }}</span></h2>
        <p>Launch, seasons and patches, earliest first.</p>
      </header>
      <ol class="st-line">
        <li v-for="item in dated" :key="item.entry.id">
          <span class="st-when dmz-mono">{{ intelDateLabel(item.iso!) }} {{ item.iso!.slice(0, 4) }}</span>
          <DmzIntelLink :id="item.entry.id" anchor class="st-what"><span class="w-semi">{{ item.entry.name }}</span><span>{{ item.entry.summary }}</span></DmzIntelLink>
        </li>
      </ol>
      <template v-if="undated.length">
        <h3 class="dz-sub dmz-mono st-sub">No date yet · {{ undated.length }}</h3>
        <ul class="dz-rows">
          <li v-for="item in undated" :key="item.entry.id"><DmzIntelRow :entry="item.entry" /></li>
        </ul>
      </template>
    </section>
  </div>
</template>

<style scoped>
.st-states { margin-bottom: 0.75rem; }
.st-line { list-style: none; margin: 0; padding: 0; max-width: 48rem; border-left: 1px solid var(--dz-line-strong); }
.st-line li { position: relative; display: grid; grid-template-columns: 7.5rem minmax(0, 1fr); gap: 1rem; padding: 0.375rem 0 0.375rem 1.25rem; }
.st-line li::before { content: ''; position: absolute; left: -0.3rem; top: 1.05rem; width: 0.55rem; height: 0.55rem; transform: rotate(45deg); background: var(--dz-bg); border: 1.5px solid var(--dz-teal); }
.st-when { padding-top: 0.6rem; font-size: 0.8125rem; font-weight: 600; color: var(--dz-teal); }
.st-what { display: flex; flex-direction: column; gap: 0.125rem; padding: 0.5rem 0.75rem; border: 1px solid transparent; border-radius: 10px; color: #d6d3c4 !important; font-size: 0.925rem; text-decoration: none; }
.st-what .w-semi { font-size: 1.0625rem; font-weight: 600; color: #f3f1e5; }
.st-what:hover { border-color: var(--dz-line-strong); background: rgba(20, 24, 23, 0.6); }
.st-what.is-open { border-color: var(--dz-accent); }
.st-sub { margin-top: 1.25rem; }
@media (max-width: 599px) {
  .st-line li { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .st-when { padding-top: 0.25rem; }
}
</style>
