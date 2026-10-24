<script setup lang="ts">
import type { PropType } from 'vue'
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelSources, intelSourceSite, intelCategory, intelConfidence, intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { relatedIntel, entryPlaces, placeLink, intelHome, intelHomeLabel } from '#shared/dmz-stations.mjs'
import { bossPlaybook } from '#shared/dmz-playbooks.mjs'

// Everything about one entry: facts, note, places, related entries, sources and
// a link to the station it lives on. Related entries open in the drawer.
type Entry = (typeof dmzIntel)[number]
type SourceId = keyof typeof intelSources
const props = defineProps({
  entry: { type: Object as PropType<Entry>, required: true },
  titleId: { type: String, default: undefined },
})
const route = useRoute()

const places = computed(() => entryPlaces(props.entry))
const links = computed(() => relatedIntel(props.entry, 6))
const relatedGroups = computed(() => [
  { id: 'named', title: 'Named in this entry', entries: links.value.named },
  { id: 'named-by', title: 'Entries that name it', entries: links.value.namedBy },
  { id: 'place', title: 'At the same places', entries: links.value.samePlace },
  { id: 'siblings', title: `More ${(props.entry.type || intelCategory(props.entry.category)?.label || '').toLowerCase()}`, entries: links.value.siblings },
].filter(group => group.entries.length))
const level = computed(() => intelConfidence.find(item => item.id === props.entry.confidence))
const sites = computed(() => {
  const map = new Map<string, { id: string, label: string, url?: string }[]>()
  for (const id of props.entry.sources) {
    const source = { id, ...intelSources[id as SourceId] }
    const site = intelSourceSite(source)
    map.set(site, [...(map.get(site) || []), source])
  }
  return [...map].map(([site, pages]) => ({ site, pages }))
})
// The one door off the page, drawn as the home station's rail item. It is left
// out on the home page itself.
const home = computed(() => intelHome(props.entry))
const homePath = computed(() => home.value.split(/[?#]/)[0]!)
const atHome = computed(() => homePath.value === route.path.replace(/\/$/, ''))
const homeStation = computed(() => dmzStations.find(station => station.route === homePath.value)
  || (homePath.value.startsWith('/dmz/intel') ? dmzStations.find(station => station.id === 'intel') : undefined))
</script>

<template>
  <article class="id">
    <header class="id-head">
      <p class="dz-kind dmz-mono">{{ [entry.type, intelCategory(entry.category)?.label].filter(Boolean).join(' · ') }}</p>
      <h2 :id="titleId" class="id-title" tabindex="-1">{{ entry.name }}</h2>
      <p class="id-conf">
        <span class="dz-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}<template v-if="entry.proof === 'in-game'"> · in-game</template></span>
        <span class="id-conf-text">{{ level?.desc }}</span>
      </p>
    </header>
    <p class="id-summary">{{ entry.summary }}</p>
    <dl v-if="entry.details?.length" class="dz-facts">
      <div v-for="[label, value] in entry.details" :key="label"><dt>{{ label }}</dt><dd>{{ value }}</dd></div>
    </dl>
    <p v-if="entry.note" class="dmz-note id-note">{{ entry.note }}</p>
    <p v-if="!atHome" class="id-go">
      <NuxtLink :to="home" class="id-door">
        <svg v-if="homeStation" viewBox="0 0 24 24" aria-hidden="true"><path :d="homeStation.icon" /></svg>
        <span>Go to {{ intelHomeLabel(entry) }}</span><span aria-hidden="true">→</span>
      </NuxtLink>
    </p>

    <section v-if="bossPlaybook(entry.id)" class="id-block" aria-label="How to find and kill">
      <h3 class="dz-sub dmz-mono">How to find and kill</h3>
      <DmzPlaybook :id="entry.id" />
    </section>

    <section v-if="places.length" class="id-block" aria-label="Where on Hajin">
      <h3 class="dz-sub dmz-mono">On the Tac-Map</h3>
      <ul class="id-chips">
        <li v-for="place in places" :key="place.id">
          <NuxtLink :to="placeLink(place.id)" class="id-chip"><span class="w-semi">{{ place.name }}</span><span class="dmz-mono">{{ place.square }}<template v-if="place.threat"> · {{ place.threat }}</template></span></NuxtLink>
        </li>
      </ul>
    </section>

    <section v-for="group in relatedGroups" :key="group.id" class="id-block" :aria-label="group.title">
      <h3 class="dz-sub dmz-mono">{{ group.title }}<template v-if="group.id === 'siblings' && links.siblingCount > group.entries.length"> · {{ group.entries.length }} of {{ links.siblingCount }}</template></h3>
      <ul class="id-chips">
        <li v-for="other in group.entries" :key="other.id">
          <DmzIntelLink :id="other.id" class="id-chip"><span>{{ other.name }}</span><span class="dmz-mono">{{ other.type }}</span></DmzIntelLink>
        </li>
      </ul>
    </section>

    <footer class="id-sources">
      <h3 class="dz-sub dmz-mono">Source{{ entry.sources.length > 1 ? 's' : '' }} · {{ entry.sources.length }}</h3>
      <ul>
        <li v-for="group in sites" :key="group.site">
          <template v-for="(source, page) in group.pages" :key="source.id">
            <a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" :title="source.label" :class="{ 'id-page': page }">{{ page ? page + 1 : group.site }}<span class="sr-only">: {{ source.label }} (opens in a new tab)</span></a>
            <span v-else :title="source.label">{{ group.site }}<span class="sr-only">: {{ source.label }}</span></span>
          </template>
        </li>
      </ul>
    </footer>
  </article>
</template>

<style scoped>
.id { display: flex; flex-direction: column; gap: 0.875rem; }
.id-head { display: flex; flex-direction: column; gap: 0.375rem; }
.id-head p { margin: 0; }
.id-title { margin: 0; font-size: clamp(1.625rem, 4vw, 2.25rem); font-weight: 700; line-height: 1.05; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; outline: none; }
.id-conf { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.id-conf-text { color: var(--dz-muted); font-size: 0.875rem; }
.id-summary { margin: 0; color: #e3e0d0; font-size: 1.0625rem; }
.id-note { margin: 0; }
.id-go { margin: 0; }
.id-door { display: inline-flex; align-items: center; gap: 0.625rem; min-height: 2.75rem; padding: 0 0.875rem 0 0.625rem; border: 1px solid var(--dz-line-strong); border-radius: 12px; background: rgba(233, 230, 214, 0.08); color: var(--dz-ink) !important; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; text-decoration: none; }
.id-door:hover { border-color: var(--dz-ink); }
.id-door svg { flex: none; width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.id-block { display: flex; flex-direction: column; }
.id-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.375rem; }
.id-chip { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 10px; background: rgba(10, 12, 11, 0.4); color: var(--dz-ink) !important; font-size: 0.95rem; text-decoration: none; }
.id-chip:hover { border-color: var(--dz-ink); }
.id-chip .dmz-mono { font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.id-sources { padding-top: 0.75rem; border-top: 1px solid var(--dz-line); }
.id-sources ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.25rem 0.875rem; font-size: 0.875rem; color: var(--dz-muted); }
.id-sources li { display: inline-flex; align-items: baseline; gap: 0.25rem; }
.id-sources a { color: var(--dz-ink-2); text-underline-offset: 0.2em; }
.id-page { display: inline-block; min-width: 1.5rem; text-align: center; font-size: 0.75rem; }
</style>
