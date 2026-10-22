<script setup lang="ts">
import { dmzIntel, intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { labBossGroups, labDetail, entryPlaces, placeLink, labEntry } from '#shared/dmz-lab.mjs'

// Boss Board station: a roster of named targets with places and drops.
type Entry = (typeof dmzIntel)[number]
const emit = defineEmits<{ open: [entry: Entry] }>()
const groups = labBossGroups()
const board = labEntry('boss-board')
const roster = groups.filter(group => group.id !== 'forces')
const forces = groups.find(group => group.id === 'forces')
// Drops and the route to a Lieutenant are the two facts players ask for.
const drops = (entry: Entry) => labDetail(entry, 'Drops')
const route = (entry: Entry) => labDetail(entry, 'Route') || labDetail(entry, 'Find') || labDetail(entry, 'Find via')
</script>

<template>
  <div class="bb">
    <p v-if="board" class="bb-intro">{{ board.summary }} <button type="button" class="bb-more" @click="emit('open', board)">How the Boss Board works</button></p>

    <section v-for="group in roster" :key="group.id" class="bb-group" :aria-labelledby="`bb-${group.id}`">
      <header class="bb-head">
        <h3 :id="`bb-${group.id}`" class="lab-h2">{{ group.title }}</h3>
        <p v-if="group.intro">{{ group.intro.summary }}</p>
      </header>
      <div class="bb-grid">
        <article v-for="entry in group.entries" :key="entry.id" class="lab-card bb-card">
          <header class="bb-card-head">
            <span class="lab-kind dmz-mono">{{ labDetail(entry, 'Type') || entry.type }}</span>
            <span class="lab-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}</span>
          </header>
          <h4 class="lab-h3">{{ entry.name }}</h4>
          <p class="bb-summary">{{ entry.summary }}</p>
          <div v-if="entryPlaces(entry).length" class="bb-places">
            <span class="dmz-mono">Seen at</span>
            <NuxtLink v-for="place in entryPlaces(entry).slice(0, 4)" :key="place.id" :to="placeLink(place.id)" class="bb-place">{{ place.name }}<span class="dmz-mono">{{ place.square }}</span></NuxtLink>
          </div>
          <dl v-if="drops(entry) || route(entry)" class="lab-facts">
            <div v-if="drops(entry)"><dt>Drops</dt><dd>{{ drops(entry) }}</dd></div>
            <div v-if="route(entry)"><dt>Find</dt><dd>{{ route(entry) }}</dd></div>
          </dl>
          <button type="button" class="bb-open dmz-mono" @click="emit('open', entry)">Full intel<span class="sr-only"> on {{ entry.name }}</span> <span aria-hidden="true">→</span></button>
        </article>
      </div>
    </section>

    <section v-if="forces" class="bb-group" aria-labelledby="bb-forces">
      <header class="bb-head">
        <h3 id="bb-forces" class="lab-h2">{{ forces.title }}</h3>
        <p>The soldiers, machines and patrols that escalate as your threat level rises.</p>
      </header>
      <ul class="bb-forces">
        <li v-for="entry in forces.entries" :key="entry.id"><DmzLabRow :entry="entry" :meta="labDetail(entry, 'Tier') ? `Tier ${labDetail(entry, 'Tier')}` : labDetail(entry, 'Type') || entry.type" @open="emit('open', $event)" /></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.bb-intro { max-width: 48rem; margin: 0; color: #dcd9cb; }
.bb-more { margin-left: 0.25rem; padding: 0; border: 0; background: none; color: var(--dz-ink); font: inherit; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
.bb-group { margin-top: 1.75rem; }
.bb-head { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--dz-line); }
.bb-head p { margin: 0; max-width: 52rem; color: var(--dz-muted); font-size: 0.95rem; }
.bb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); align-items: start; gap: 0.75rem; }
.bb-card-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.bb-summary { margin: 0; color: #dcd9cb; font-size: 0.975rem; }
.bb-places { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; }
.bb-places > .dmz-mono { margin-right: 0.25rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.bb-place { display: inline-flex; align-items: center; gap: 0.375rem; min-height: 2.25rem; padding: 0 0.625rem; border: 1px solid var(--dz-line-strong); border-radius: 8px; font-size: 0.875rem; text-decoration: none; }
.bb-place:hover { border-color: var(--dz-ink); }
.bb-place .dmz-mono { font-size: 0.6875rem; color: var(--dz-muted); }
.bb-open { align-self: flex-start; min-height: 2.75rem; padding: 0; border: 0; background: none; color: var(--dz-ink); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: underline; text-underline-offset: 0.25em; cursor: pointer; }
.bb-forces { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 0.375rem; }
@media (max-width: 899px) {
  .bb-grid { grid-template-columns: 1fr; }
}
</style>
