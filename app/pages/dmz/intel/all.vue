<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelCategories, intelConfidence, intelSources, intelSourceSite, intelFresh, intelLatest, intelDateLabel, filterIntel, groupIntel, DMZ_INTEL_CHECKED } from '#shared/dmz-intel.mjs'

// Every Intel entry on one page, as full cards. The category lives in the URL
// (?c=keys, or ?c=latest for the newest research round) so links can open a
// filtered view; search and confidence stay on the page. Cards carry their own
// #intel-<id> anchors, so this page opts out of the shell's entry drawer.
definePageMeta({ intelCards: true })
type Entry = (typeof dmzIntel)[number]
type SourceId = keyof typeof intelSources

const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'intel')!.icon
const counts = Object.fromEntries(intelCategories.map(category => [category.id, dmzIntel.filter(entry => entry.category === category.id).length]))
const categories = intelCategories.filter(category => counts[category.id])
const freshCount = dmzIntel.filter(intelFresh).length
const latestLabel = intelLatest ? intelDateLabel(intelLatest) : ''
const query = ref('')
const levels = ref(intelConfidence.map(level => level.id))
const target = ref('')
const results = ref<HTMLElement>()
// The unfiltered view previews each category; search or a category shows everything.
const PREVIEW = 6
const expanded = ref<string[]>([])
// Cards show a few short facts; long tables and the rest fold away.
const FACTS = 4
const LONG_FACT = 240

const category = computed(() => {
  const value = String(route.query.c || '')
  if (value === 'latest' && freshCount) return value
  return categories.some(item => item.id === value) ? value : 'all'
})
const shown = computed(() => filterIntel(dmzIntel, { category: category.value === 'latest' ? 'all' : category.value, fresh: category.value === 'latest', confidence: levels.value, query: query.value }))
const groups = computed(() => groupIntel(shown.value))
const filtered = computed(() => category.value !== 'all' || query.value.trim() !== '' || levels.value.length < intelConfidence.length)
const tally = [...intelConfidence.map(level => `${dmzIntel.filter(entry => entry.confidence === level.id).length} ${level.label.toLowerCase()}`), ...(freshCount ? [`${freshCount} new or updated ${latestLabel}`] : [])].join(' · ')
const sourceList = Object.entries(intelSources).map(([id, source]) => ({ id, ...source })).sort((a, b) => intelSourceSite(a).localeCompare(intelSourceSite(b)))

function pick(id: string) {
  router.replace({ query: { ...route.query, c: id === 'all' ? undefined : id } })
  // Keep the first result in view when the list above the fold changes.
  nextTick(() => { if ((results.value?.getBoundingClientRect().top ?? 0) < 0) results.value?.scrollIntoView() })
}
function toggleLevel(id: string) {
  levels.value = levels.value.includes(id) ? levels.value.filter(level => level !== id) : intelConfidence.map(level => level.id).filter(level => level === id || levels.value.includes(level))
}
function clearFilters() {
  query.value = ''
  levels.value = intelConfidence.map(level => level.id)
  if (category.value !== 'all') pick('all')
}
const previewing = (id: string, size: number) => category.value === 'all' && !query.value.trim() && size > PREVIEW && !expanded.value.includes(id)
function factsOf(entry: Entry) {
  const all = (entry.details || []) as [string, string][]
  const head = all.filter(([, value]) => value.length <= LONG_FACT).slice(0, FACTS)
  return { head, rest: all.filter(pair => !head.includes(pair)) }
}
// One label per site; further pages from the same site follow as numbers.
function sourcesOf(entry: Entry) {
  const sites = new Map<string, { id: string, label: string, url?: string }[]>()
  for (const id of entry.sources) {
    const source = { id, ...intelSources[id as SourceId] }
    const site = intelSourceSite(source)
    sites.set(site, [...(sites.get(site) || []), source])
  }
  return [...sites].map(([site, pages]) => ({ site, pages }))
}
const confidenceLabel = (id: string) => intelConfidence.find(level => level.id === id)?.label

// Search results link to #intel-<id>: open its category preview and mark the card.
function markTarget(hash: string) {
  target.value = hash
  const entry = dmzIntel.find(item => `#intel-${item.id}` === hash)
  if (!entry || expanded.value.includes(entry.category)) return
  expanded.value.push(entry.category)
  // A card past the preview only renders now, after the router has scrolled.
  if (import.meta.client) nextTick(() => document.getElementById(`intel-${entry.id}`)?.scrollIntoView())
}
onMounted(() => markTarget(route.hash))
watch(() => route.hash, markTarget)
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="All Intel" :icon="icon" :checked="DMZ_INTEL_CHECKED" :status="`${dmzIntel.length} entries · ${tally}`">
      <p class="in-lede">Everything known about DMZ so far on one page, gathered from official posts, press guides and player reports. Each entry lists its sources and how sure we are. Early-access details change quickly, so check the label before you plan a run around it.</p>
    </DmzPageHead>
    <DmzIntelNav />

    <div class="in-tools">
      <label class="in-search">
        <span class="sr-only">Search intel</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
        <input v-model="query" type="search" placeholder="Search keys, bosses, traits, exfil…" autocomplete="off" spellcheck="false">
      </label>
      <div class="in-levels" role="group" aria-label="Show confidence levels">
        <button v-for="level in intelConfidence" :key="level.id" type="button" class="in-level dmz-mono" :class="`is-${level.id}`" :aria-pressed="levels.includes(level.id)" :title="level.desc" @click="toggleLevel(level.id)">{{ level.label }}</button>
      </div>
    </div>

    <div class="in-layout">
      <nav class="in-cats" aria-label="Intel categories">
        <ul>
          <li><button type="button" class="in-cat" :aria-pressed="category === 'all'" @click="pick('all')"><span>All intel</span><span class="dmz-mono">{{ dmzIntel.length }}</span></button></li>
          <li v-if="freshCount"><button type="button" class="in-cat is-fresh" :aria-pressed="category === 'latest'" @click="pick('latest')"><span>New · {{ latestLabel }}</span><span class="dmz-mono">{{ freshCount }}</span></button></li>
          <li v-for="item in categories" :key="item.id"><button type="button" class="in-cat" :aria-pressed="category === item.id" @click="pick(item.id)"><span>{{ item.label }}</span><span class="dmz-mono">{{ counts[item.id] }}</span></button></li>
        </ul>
      </nav>

      <div ref="results" class="in-results">
        <p class="in-count dmz-mono" role="status">
          {{ shown.length === dmzIntel.length ? `Showing all ${shown.length} entries` : `${shown.length} of ${dmzIntel.length} entries` }}
          <button v-if="filtered" type="button" class="in-clear" @click="clearFilters">Clear filters</button>
        </p>

        <section v-for="group in groups" :key="group.category.id" class="in-group" :aria-labelledby="`in-h-${group.category.id}`">
          <header class="in-group-head">
            <h2 :id="`in-h-${group.category.id}`">{{ group.category.label }}</h2>
            <p>{{ group.category.desc }}</p>
          </header>
          <div class="in-grid">
            <template v-for="(entry, index) in group.entries" :key="entry.id">
              <article v-if="index < PREVIEW || !previewing(group.category.id, group.entries.length)" :id="`intel-${entry.id}`" class="in-card" :class="{ 'is-target': target === `#intel-${entry.id}` }">
                <header class="in-card-head dmz-mono">
                  <span>{{ entry.type || group.category.label }}<span v-if="intelFresh(entry)" class="in-fresh">{{ intelFresh(entry) === 'new' ? 'New' : 'Updated' }} {{ latestLabel }}</span></span>
                  <span class="in-badge" :class="`is-${entry.confidence}`">{{ confidenceLabel(entry.confidence) }}<template v-if="entry.proof === 'in-game'"> · in-game</template></span>
                </header>
                <h3>{{ entry.name }}</h3>
                <p class="in-summary">{{ entry.summary }}</p>
                <dl v-if="factsOf(entry).head.length" class="in-details">
                  <div v-for="[label, value] in factsOf(entry).head" :key="label"><dt class="dmz-mono">{{ label }}</dt><dd>{{ value }}</dd></div>
                </dl>
                <details v-if="factsOf(entry).rest.length" class="in-facts" :open="query.trim() !== '' || undefined">
                  <summary class="dmz-mono">{{ factsOf(entry).rest.length }} more fact{{ factsOf(entry).rest.length > 1 ? 's' : '' }}</summary>
                  <dl class="in-details">
                    <div v-for="[label, value] in factsOf(entry).rest" :key="label"><dt class="dmz-mono">{{ label }}</dt><dd>{{ value }}</dd></div>
                  </dl>
                </details>
                <p v-if="entry.note" class="in-note">{{ entry.note }}</p>
                <NuxtLink v-if="entry.link" :to="entry.link.to" class="in-link">{{ entry.link.label }}<span aria-hidden="true"> →</span></NuxtLink>
                <footer class="in-sources">
                  <span class="dmz-mono">Source{{ entry.sources.length > 1 ? 's' : '' }}</span>
                  <span v-for="group in sourcesOf(entry)" :key="group.site" class="in-site">
                    <template v-for="(source, page) in group.pages" :key="source.id">
                      <a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" :title="source.label" :class="{ 'in-page': page }">{{ page ? page + 1 : group.site }}<span class="sr-only">: {{ source.label }} (opens in a new tab)</span></a>
                      <span v-else :title="source.label">{{ group.site }}<span class="sr-only">: {{ source.label }}</span></span>
                    </template>
                  </span>
                </footer>
              </article>
            </template>
          </div>
          <button v-if="previewing(group.category.id, group.entries.length)" type="button" class="in-more" @click="expanded.push(group.category.id)">
            Show all {{ group.entries.length }}<span class="sr-only"> {{ group.category.label }} entries</span><span aria-hidden="true"> ↓</span>
          </button>
        </section>

        <div v-if="!shown.length" class="in-empty dmz-panel">
          <p>No intel matches {{ query.trim() ? `“${query.trim()}”` : 'these filters' }}.</p>
          <button type="button" class="dmz-pill dmz-pill--ghost" @click="clearFilters">Clear filters</button>
        </div>
      </div>
    </div>

    <section id="sources" class="dmz-section dmz-panel">
      <details>
        <summary><span class="dmz-label dmz-mono">All sources · {{ sourceList.length }} · checked {{ DMZ_INTEL_CHECKED }}</span></summary>
        <ol class="dmz-sources">
          <li v-for="source in sourceList" :key="source.id">
            <a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }}<span class="sr-only"> (opens in a new tab)</span></a>
            <template v-else>{{ source.label }}</template>
            <span class="in-src-type dmz-mono">{{ source.type }}</span>
          </li>
        </ol>
      </details>
      <p class="in-src-note">Gathered from source review and player reports, not a full in-game playthrough. Rumours and datamines are left out. Spotted something wrong? Treat Reported entries with care until a second source agrees.</p>
    </section>
  </div>
</template>

<style scoped>
.in-lede { max-width: 46rem; margin: 1rem 0 0; color: #dcd9cb; font-size: 1.0625rem; }

.in-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-top: 1.75rem; }
.in-search { flex: 1 1 18rem; display: flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0 1.125rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); }
.in-search:focus-within { border-color: var(--dz-ink); }
.in-search svg { flex: none; width: 1.125rem; height: 1.125rem; fill: none; stroke: var(--dz-muted); stroke-width: 2; stroke-linecap: round; }
.in-search input { flex: 1; min-width: 0; height: 2.75rem; border: 0; background: transparent; color: var(--dz-ink); font: inherit; font-size: 1.0625rem; outline: none; }
.in-search input::placeholder { color: #9a9b8f; }
.in-levels { display: flex; gap: 0.375rem; }
.in-level { min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-muted); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.in-level[aria-pressed='true'] { color: var(--dz-bg); }
.in-level.is-official[aria-pressed='true'] { background: var(--dz-accent); border-color: var(--dz-accent); }
.in-level.is-confirmed[aria-pressed='true'] { background: var(--dz-green); border-color: var(--dz-green); }
.in-level.is-reported[aria-pressed='true'] { background: var(--dz-teal); border-color: var(--dz-teal); }
.in-level[aria-pressed='false'] { text-decoration: line-through; }

.in-layout { display: grid; grid-template-columns: 15rem minmax(0, 1fr); align-items: start; gap: 2rem; margin-top: 1.5rem; }
.in-cats { position: sticky; top: 1.5rem; }
.in-cats ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.125rem; }
.in-cat { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; width: 100%; min-height: 2.75rem; padding: 0 0.875rem; border: 0; border-radius: 10px; background: transparent; color: var(--dz-ink-2); font: inherit; font-size: 1.125rem; font-weight: 500; letter-spacing: 0.03em; text-align: left; text-transform: uppercase; font-variation-settings: 'wdth' 75; cursor: pointer; }
.in-cat .dmz-mono { font-size: 0.75rem; color: var(--dz-muted); font-variation-settings: normal; }
.in-cat:hover { background: rgba(233, 230, 214, 0.08); color: #fff; }
.in-cat[aria-pressed='true'] { background: rgba(233, 230, 214, 0.16); color: #fff; box-shadow: inset 3px 0 var(--dz-ink); }
.in-cat.is-fresh > span:first-child::before { content: ''; display: inline-block; width: 0.5rem; height: 0.5rem; margin-right: 0.5rem; border-radius: 50%; background: var(--dz-accent); vertical-align: 0.15em; }

.in-count { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin: 0 0 0.5rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.in-clear { min-height: 2.75rem; padding: 0 0.25rem; border: 0; background: none; color: var(--dz-ink); font: inherit; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
.in-group { margin-top: 1.25rem; scroll-margin-top: 1.5rem; }
.in-group:first-of-type { margin-top: 0; }
.in-group-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem 1rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--dz-line); }
.in-group-head h2 { margin: 0; font-size: 1.625rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.in-group-head p { margin: 0; color: var(--dz-muted); font-size: 0.95rem; }
.in-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr)); align-items: start; gap: 0.75rem; }

/* No backdrop blur here: hundreds of blurred cards make scrolling heavy. */
.in-card { display: flex; flex-direction: column; gap: 0.625rem; padding: 1rem 1.125rem; background: rgba(20, 24, 23, 0.82); border: 1px solid var(--dz-line); border-radius: 16px; scroll-margin-top: 1.5rem; }
.in-card.is-target { border-color: var(--dz-accent); box-shadow: 0 0 0 1px var(--dz-accent), 0 0 24px rgba(221, 179, 99, 0.18); }
.in-card-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.in-fresh { display: inline-block; margin-left: 0.625rem; padding: 0.15rem 0.45rem; border-radius: 4px; background: var(--dz-accent); color: var(--dz-bg); font-weight: 700; }
.in-badge { flex: none; padding: 0.2rem 0.55rem; border-radius: 999px; border: 1px solid currentColor; font-weight: 700; }
.in-badge.is-official { color: var(--dz-accent); }
.in-badge.is-confirmed { color: var(--dz-green); }
.in-badge.is-reported { color: var(--dz-teal); border-style: dashed; }
.in-card h3 { margin: 0; font-size: 1.375rem; font-weight: 700; line-height: 1.15; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.in-summary { margin: 0; color: #dcd9cb; font-size: 1rem; }
.in-details { display: grid; gap: 0.25rem; margin: 0; }
.in-details > div { display: grid; grid-template-columns: 6.5rem 1fr; gap: 0.75rem; padding: 0.375rem 0.625rem; background: rgba(10, 12, 11, 0.35); border-left: 2px solid var(--dz-line-strong); }
.in-details dt { padding-top: 0.15rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.in-details dd { margin: 0; color: #e3e0d0; font-size: 0.95rem; overflow-wrap: anywhere; }
.in-facts summary { display: flex; align-items: center; min-height: 2.25rem; padding: 0 0.625rem; border: 1px dashed var(--dz-line-strong); font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-ink-2); cursor: pointer; list-style: none; }
.in-facts summary::-webkit-details-marker { display: none; }
.in-facts summary::after { content: '+'; margin-left: auto; font-size: 1rem; color: var(--dz-muted); }
.in-facts[open] summary::after { content: '−'; }
.in-facts[open] summary { margin-bottom: 0.25rem; }
.in-facts dd { white-space: pre-line; }
.in-note { margin: 0; padding: 0.5rem 0.75rem; border-left: 3px solid var(--dz-accent); background: rgba(221, 179, 99, 0.08); color: #e7dcc2; font-size: 0.9rem; }
.in-link { align-self: flex-start; display: inline-flex; align-items: center; min-height: 2.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.in-sources { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.75rem; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--dz-line); font-size: 0.875rem; color: var(--dz-muted); }
.in-sources > .dmz-mono { font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; }
.in-sources a { color: var(--dz-ink-2); text-underline-offset: 0.2em; }
.in-site { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem; }
.in-page { display: inline-block; min-width: 1.5rem; padding: 0.125rem 0; text-align: center; font-size: 0.75rem; }
.in-more { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 2.75rem; margin-top: 0.75rem; border: 1px dashed var(--dz-line-strong); border-radius: 12px; background: transparent; color: var(--dz-ink); font: inherit; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
.in-more:hover { background: rgba(233, 230, 214, 0.08); border-style: solid; }
.in-empty { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
.in-empty p { margin: 0; color: #dcd9cb; }

#sources summary { cursor: pointer; list-style: none; min-height: 2.75rem; display: flex; align-items: center; }
#sources summary::-webkit-details-marker { display: none; }
#sources summary .dmz-label { margin: 0; }
#sources summary::after { content: '+'; margin-left: auto; font-size: 1.25rem; color: var(--dz-muted); }
#sources details[open] summary::after { content: '−'; }
.in-src-type { margin-left: 0.5rem; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.in-src-note { margin: 0.875rem 0 0 !important; font-size: 0.9rem !important; color: var(--dz-muted) !important; }

@media (max-width: 899px) {
  .in-layout { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .in-cats { position: static; margin: 0 -1rem; }
  .in-cats ul { flex-direction: row; gap: 0.375rem; overflow-x: auto; padding: 0 1rem 0.25rem; scrollbar-width: none; }
  .in-cats ul::-webkit-scrollbar { display: none; }
  .in-cat { width: auto; white-space: nowrap; border: 1px solid var(--dz-line-strong); border-radius: 999px; font-size: 1rem; }
  .in-cat[aria-pressed='true'] { box-shadow: none; background: var(--dz-ink); color: var(--dz-bg); }
  .in-cat[aria-pressed='true'] .dmz-mono { color: var(--dz-bg); }
  .in-levels { width: 100%; }
  .in-level { flex: 1; }
  .in-grid { grid-template-columns: 1fr; }
  .in-details > div { grid-template-columns: 5.5rem 1fr; }
}
</style>
