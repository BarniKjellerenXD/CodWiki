<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelConfidenceLabel, DMZ_INTEL_CHECKED } from '#shared/dmz-intel.mjs'
import { bossGroups, intelDetail, intelEntry, entryPlaces, placeLink } from '#shared/dmz-stations.mjs'
import { bossPlaybook, LIEUTENANT_VIDEOS } from '#shared/dmz-playbooks.mjs'
import { STUCK_VIDEOS } from '#shared/dmz-sightings.mjs'

// Boss Board station: the named targets with where players find them and what
// they drop, then the forces that escalate around you. A card with a playbook
// opens into how to find and kill the boss; every card opens its full entry
// in the drawer. A Commander card shows its most reported places as plain text.
type Entry = (typeof dmzIntel)[number]
const route = useRoute()
const icon = dmzStations.find(station => station.id === 'boss')!.icon
const groups = bossGroups()
const board = intelEntry('boss-board')
const roster = groups.filter(group => group.id !== 'forces')
const forces = groups.find(group => group.id === 'forces')
const count = (id: string) => groups.find(group => group.id === id)?.entries.length || 0
const JUMP: Record<string, string> = { lieutenants: 'Lieutenants', commanders: 'Commanders', named: 'Named', forces: 'Forces' }
const jumps = [...roster, ...(forces ? [forces] : [])].map(group => ({ id: group.id, label: JUMP[group.id] || group.title, count: group.entries.length }))

// Links and site search open #boss-<id>: unfold that card's playbook. The
// router, or the DMZ shell on a first load, scrolls to it.
const openHow = ref(new Set<string>())
function toggleHow(id: string, open: boolean) {
  if (openHow.value.has(id) === open) return
  const next = new Set(openHow.value)
  if (open) next.add(id)
  else next.delete(id)
  openHow.value = next
}
function openTarget(hash: string) {
  const id = hash.startsWith('#boss-') ? hash.slice('#boss-'.length) : ''
  if (id && bossPlaybook(id)) toggleHow(id, true)
}
onMounted(() => openTarget(route.hash))
watch(() => route.hash, openTarget)
// Drops and the way to a target are the two facts players ask for.
const drops = (entry: Entry) => intelDetail(entry, 'Drops')
const way = (entry: Entry) => intelDetail(entry, 'Route') || intelDetail(entry, 'Find') || intelDetail(entry, 'Find via')
const tier = (entry: Entry) => intelDetail(entry, 'Tier') ? `Tier ${intelDetail(entry, 'Tier')}` : intelDetail(entry, 'Type') || entry.type
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Boss Board" :icon="icon" :checked="DMZ_INTEL_CHECKED" :status="`${count('lieutenants')} Lieutenants · ${count('commanders')} Commanders and bosses · ${count('named') + count('forces')} more enemy types`">
      <p v-if="board" class="dz-lede">{{ board.summary }} <DmzIntelLink :id="board.id" anchor class="bb-more">How the Boss Board works</DmzIntelLink></p>
    </DmzPageHead>
    <DmzVideoGuides variant="strip" :refs="STUCK_VIDEOS" class="bb-stuck" />

    <nav class="bb-jump" aria-label="On this page">
      <a v-for="jump in jumps" :key="jump.id" :href="`#${jump.id}`" class="bb-jump-link dmz-mono">{{ jump.label }}<span class="sr-only">, </span><span>{{ jump.count }}</span></a>
    </nav>

    <section v-for="group in roster" :id="group.id" :key="group.id" class="dz-group" :aria-labelledby="`${group.id}-title`">
      <header class="dz-group-head">
        <h2 :id="`${group.id}-title`" class="dz-h2">{{ group.title }}<span class="dmz-mono">{{ group.entries.length }}</span></h2>
        <p v-if="group.intro">{{ group.intro.summary }} <DmzIntelLink :id="group.intro.id" anchor class="bb-more">More on {{ group.title.toLowerCase() }}</DmzIntelLink></p>
        <DmzVideoGuides v-if="group.id === 'lieutenants'" :refs="LIEUTENANT_VIDEOS" />
      </header>
      <div class="bb-grid">
        <article v-for="entry in group.entries" :id="`boss-${entry.id}`" :key="entry.id" class="dz-card bb-card" :data-intel="entry.id">
          <header class="bb-card-head">
            <span class="dz-kind dmz-mono">{{ intelDetail(entry, 'Type') || entry.type }}</span>
            <span class="dz-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}</span>
          </header>
          <h3 class="dz-h3">{{ entry.name }}</h3>
          <p class="bb-summary">{{ entry.summary }}</p>
          <DmzSightings v-if="bossPlaybook(entry.id)?.where?.length" :rows="bossPlaybook(entry.id)!.where" compact />
          <div v-else-if="entryPlaces(entry).length" class="bb-places">
            <span class="dmz-mono">Seen at</span>
            <NuxtLink v-for="place in entryPlaces(entry).slice(0, 4)" :key="place.id" :to="placeLink(place.id)" class="bb-place">{{ place.name }}<span class="dmz-mono">{{ place.square }}</span></NuxtLink>
          </div>
          <dl v-if="drops(entry) || way(entry)" class="dz-facts">
            <div v-if="drops(entry)"><dt>Drops</dt><dd>{{ drops(entry) }}</dd></div>
            <div v-if="way(entry)"><dt>Find</dt><dd>{{ way(entry) }}</dd></div>
          </dl>
          <details v-if="bossPlaybook(entry.id)" class="bb-how" :open="openHow.has(entry.id)" @toggle="toggleHow(entry.id, ($event.target as HTMLDetailsElement).open)">
            <summary class="dmz-mono">How to find and kill<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
            <DmzPlaybook :id="entry.id" />
          </details>
          <DmzIntelLink :id="entry.id" class="bb-open dmz-mono">Full intel<span class="sr-only"> on {{ entry.name }}</span> <span aria-hidden="true">→</span></DmzIntelLink>
        </article>
      </div>
    </section>

    <section v-if="forces" id="forces" class="dz-group" aria-labelledby="forces-title">
      <header class="dz-group-head">
        <h2 id="forces-title" class="dz-h2">{{ forces.title }}<span class="dmz-mono">{{ forces.entries.length }}</span></h2>
        <p>The soldiers, machines and patrols that escalate as your threat level rises.</p>
      </header>
      <ul class="dz-rows">
        <li v-for="entry in forces.entries" :key="entry.id"><DmzIntelRow :entry="entry" :meta="tier(entry)" /></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.bb-more { color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.bb-stuck { margin-top: 1.25rem; }
.bb-jump { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 1.25rem; }
.bb-jump-link { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.45); color: var(--dz-ink) !important; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
.bb-jump-link:hover { background: rgba(233, 230, 214, 0.1); }
.bb-jump-link span { color: var(--dz-muted); font-weight: 500; }
.bb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); align-items: start; gap: 0.75rem; }
.bb-card { scroll-margin-top: 1.5rem; }
.bb-card-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.bb-summary { margin: 0; color: #dcd9cb; font-size: 0.975rem; }
.bb-places { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; }
.bb-places > .dmz-mono { margin-right: 0.25rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.bb-place { display: inline-flex; align-items: center; gap: 0.375rem; min-height: 2.75rem; padding: 0 0.625rem; border: 1px solid var(--dz-line-strong); border-radius: 8px; font-size: 0.875rem; text-decoration: none; }
.bb-place:hover { border-color: var(--dz-ink); }
.bb-place .dmz-mono { font-size: 0.6875rem; color: var(--dz-muted); }
.bb-open { align-self: flex-start; display: inline-flex; align-items: center; min-height: 2.75rem; color: var(--dz-ink) !important; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-underline-offset: 0.25em; }
.bb-how summary { display: inline-flex; align-items: center; gap: 0.375rem; min-height: 2.75rem; cursor: pointer; list-style: none; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-accent); }
.bb-how summary::-webkit-details-marker { display: none; }
.bb-how summary svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.15s; }
.bb-how[open] summary svg { transform: rotate(180deg); }
.bb-grid > .bb-card:has(.bb-how[open]) { grid-column: 1 / -1; }
.bb-card:has(.bb-open.is-open) { border-color: var(--dz-accent); box-shadow: inset 3px 0 var(--dz-accent); }
@media (max-width: 899px) {
  .bb-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
