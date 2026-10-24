<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelConfidence, DMZ_INTEL_CHECKED } from '#shared/dmz-intel.mjs'
import { intelNeeds, intelNeed, intelEntry, intelStations, intelEverything, intelSuggestions, stationEntries, intelCount } from '#shared/dmz-stations.mjs'
import { STUCK_VIDEOS } from '#shared/dmz-sightings.mjs'

// Intel opens on one question: what are you doing right now? Answers stay
// inside Intel: reading lists here (kept in ?need= so Back and shared links
// work) or a Status section. Quick find and Intel's shelves sit underneath.
definePageMeta({ middleware: 'dmz-intel-links' })
type Need = (typeof intelNeeds)[number]
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'intel')!.icon
const query = ref('')
const answer = ref<HTMLElement>()

const sizes: Record<string, string> = {
  broken: `${intelCount('issues')} known issues`,
  next: `${intelCount('dates')} dates`,
}
const readsIn = (need: Need) => (need.steps || []).reduce((sum, step) => sum + step.ids.length, 0)
const need = computed(() => {
  const item = intelNeed(String(route.query.need || ''))
  return item?.kind === 'steps' ? item : null
})
const number = (stepIndex: number, index: number) => String(need.value!.steps!.slice(0, stepIndex).reduce((sum, step) => sum + step.ids.length, 0) + index + 1).padStart(2, '0')

const cards = [
  ...intelStations.filter(station => !station.fob).map(station => ({ ...station, size: `${stationEntries(station).length} entries` })),
  { ...intelEverything, size: `${dmzIntel.length} entries` },
]

function pick(id: string) {
  router.replace({ query: { ...route.query, need: id === need.value?.id ? undefined : id } })
}
watch(need, value => {
  if (value && import.meta.client) nextTick(() => answer.value?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }))
})
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Intel" :icon="icon" :checked="DMZ_INTEL_CHECKED" :status="`${dmzIntel.length} entries · each with its sources and a confidence label`" />

    <section class="ix-ask" aria-labelledby="ix-ask">
      <h2 id="ix-ask" class="ix-question">What are you doing right now?</h2>
      <ul class="ix-tiles">
        <li v-for="item in intelNeeds" :key="item.id">
          <button
            v-if="item.kind === 'steps'" type="button" class="ix-tile" :aria-pressed="need?.id === item.id"
            :aria-controls="need?.id === item.id ? 'ix-answer' : undefined" @click="pick(item.id)"
          >
            <svg class="dz-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>
            <span class="ix-tile-label">{{ item.label }}</span>
            <span class="ix-tile-ask">“{{ item.ask }}”</span>
            <span class="ix-tile-to dmz-mono">{{ readsIn(item) }} short reads <span aria-hidden="true">↓</span></span>
          </button>
          <NuxtLink v-else :to="item.to!" class="ix-tile">
            <svg class="dz-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>
            <span class="ix-tile-label">{{ item.label }}</span>
            <span class="ix-tile-ask">“{{ item.ask }}”</span>
            <span class="ix-tile-to dmz-mono">{{ item.toLabel }} · {{ sizes[item.id] }} <span aria-hidden="true">→</span></span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section v-if="need" id="ix-answer" ref="answer" class="ix-answer dmz-panel" aria-labelledby="ix-answer-title">
      <header class="ix-answer-head">
        <svg class="dz-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="need.icon" /></svg>
        <div>
          <h2 id="ix-answer-title" class="dz-h2">{{ need.label }}</h2>
          <p>{{ need.intro }}</p>
        </div>
        <button type="button" class="ix-close dmz-mono" @click="pick(need.id)">Close<span class="sr-only"> this reading list</span></button>
      </header>
      <DmzVideoGuides v-if="need.id === 'loot'" :refs="STUCK_VIDEOS" variant="strip" />
      <div v-for="(step, stepIndex) in need.steps" :key="step.title">
        <h3 class="dz-sub dmz-mono">{{ step.title }}</h3>
        <ol class="ix-reads">
          <template v-for="(id, index) in step.ids" :key="id">
            <li v-if="intelEntry(id)">
              <span class="ix-num dmz-mono" aria-hidden="true">{{ number(stepIndex, index) }}</span>
              <DmzIntelRow :entry="intelEntry(id)!" summary />
            </li>
          </template>
        </ol>
      </div>
      <footer v-if="need.more" class="ix-more">
        <NuxtLink :to="need.more.to" class="dz-link">{{ need.more.label }}<span aria-hidden="true">&nbsp;→</span></NuxtLink>
      </footer>
    </section>

    <section class="ix-find" aria-labelledby="ix-find">
      <h2 id="ix-find" class="ix-label dmz-mono">Know what you want?</h2>
      <DmzIntelFind v-model="query" placeholder="Search Intel: a key, a boss, a recipe, a square such as H6" />
      <p v-if="!query" class="ix-try">
        <span class="dmz-mono">Try</span>
        <button v-for="word in intelSuggestions" :key="word" type="button" class="dz-chip" @click="query = word">{{ word }}</button>
      </p>
    </section>

    <section class="ix-shelves" aria-labelledby="ix-shelves">
      <h2 id="ix-shelves" class="dz-h2">Intel shelves</h2>
      <ul class="ix-cards">
        <li v-for="card in cards" :key="card.id">
          <NuxtLink :to="card.path" class="ix-card">
            <span class="ix-card-top">
              <svg class="dz-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="card.icon" /></svg>
            </span>
            <span class="ix-card-label">{{ card.label }}</span>
            <span class="ix-card-desc">{{ card.desc }}</span>
            <span class="ix-card-n dmz-mono">{{ card.size }} <span aria-hidden="true">→</span></span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="ix-labels dmz-panel" aria-labelledby="ix-labels">
      <h2 id="ix-labels" class="dmz-label dmz-mono">How sure we are</h2>
      <dl>
        <div v-for="level in intelConfidence" :key="level.id">
          <dt><span class="dz-badge" :class="`is-${level.id}`">{{ level.label }}</span></dt>
          <dd>{{ level.desc }}</dd>
        </div>
      </dl>
      <p>Gathered from official posts, press guides and player reports. Early-access details change quickly, so check the label before you plan a run around it.</p>
    </section>
  </div>
</template>

<style scoped>
.ix-ask { margin-top: 2rem; }
.ix-question { margin: 0 0 1rem; font-size: clamp(1.75rem, 4.5vw, 2.75rem); font-weight: 700; line-height: 1.05; letter-spacing: 0.02em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
/* One row with a column per question, however many there are. */
.ix-tiles { list-style: none; margin: 0; padding: 0; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 0.625rem; }
.ix-tile { display: flex; flex-direction: column; align-items: flex-start; gap: 0.375rem; width: 100%; height: 100%; min-height: 8.5rem; padding: 1rem; border: 1px solid var(--dz-line); border-radius: 16px; background: rgba(20, 24, 23, 0.72); color: var(--dz-ink-2) !important; font: inherit; text-align: left; text-decoration: none; cursor: pointer; }
.ix-tile:hover { border-color: var(--dz-line-strong); color: #fff !important; background: rgba(30, 36, 34, 0.85); }
.ix-tile[aria-pressed='true'] { border-color: var(--dz-accent); background: linear-gradient(180deg, rgba(221, 179, 99, 0.18), rgba(221, 179, 99, 0.05)); color: #fff !important; }
.ix-tile .dz-icon { width: 1.75rem; height: 1.75rem; color: var(--dz-ink); }
.ix-tile-label { font-size: 1.25rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f3f1e5; }
.ix-tile-ask { font-size: 0.925rem; color: var(--dz-muted); }
.ix-tile-to { margin-top: auto; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); }
/* Room above for the site's floating reading-settings button. */
.ix-answer { margin-top: 1.5rem; scroll-margin-top: 4.5rem; display: flex; flex-direction: column; gap: 1rem; }
.ix-answer-head { display: flex; align-items: flex-start; gap: 1rem; }
.ix-answer-head > .dz-icon { flex: none; width: 2rem; height: 2rem; margin-top: 0.125rem; }
.ix-answer-head > div { flex: 1 1 auto; }
.ix-answer-head p { margin: 0.375rem 0 0; color: #dcd9cb; }
.ix-close { flex: none; min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-ink); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.ix-close:hover { border-color: var(--dz-ink); }
.ix-reads { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.ix-reads li { display: grid; grid-template-columns: 2.25rem minmax(0, 1fr); align-items: start; gap: 0.5rem; }
.ix-num { padding-top: 0.75rem; font-size: 0.875rem; font-weight: 700; color: var(--dz-accent); }
.ix-more { padding-top: 0.5rem; border-top: 1px solid var(--dz-line); }
.ix-find { margin-top: 2.5rem; max-width: 46rem; }
.ix-label { margin: 0 0 0.625rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.ix-try { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin: 0.75rem 0 0; }
.ix-try > .dmz-mono { margin-right: 0.25rem; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.ix-shelves { margin-top: 2.5rem; }
.ix-cards { list-style: none; margin: 1rem 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.625rem; }
.ix-card { display: flex; flex-direction: column; gap: 0.375rem; height: 100%; padding: 1rem; border: 1px solid var(--dz-line); border-radius: 16px; background: rgba(20, 24, 23, 0.72); color: var(--dz-ink-2) !important; text-decoration: none; }
.ix-card:hover { border-color: var(--dz-line-strong); background: rgba(30, 36, 34, 0.85); color: #fff !important; }
.ix-card-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; color: var(--dz-ink); }
.ix-card-label { font-size: 1.25rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f3f1e5; }
.ix-card-desc { font-size: 0.925rem; color: #cfccbd; }
.ix-card-n { margin-top: auto; padding-top: 0.25rem; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); }
.ix-labels { margin-top: 2.5rem; }
.ix-labels dl { display: grid; gap: 0.5rem; margin: 0.5rem 0 0; }
.ix-labels dl > div { display: grid; grid-template-columns: 7.5rem 1fr; align-items: baseline; gap: 0.75rem; }
.ix-labels dd { margin: 0; color: #dcd9cb; font-size: 0.95rem; }
.ix-labels p { margin: 0.875rem 0 0; max-width: 46rem; color: var(--dz-muted); font-size: 0.9rem; }
@media (max-width: 899px) {
  .ix-tiles { grid-auto-flow: row; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
  .ix-tiles > li:last-child:nth-child(odd) { grid-column: 1 / -1; }
  .ix-tile { min-height: 7.5rem; padding: 0.875rem; }
  .ix-tile-ask { display: none; }
  .ix-answer { padding: 1rem; }
  .ix-answer-head > .dz-icon { display: none; }
  .ix-labels dl > div { grid-template-columns: 1fr; gap: 0.25rem; }
}
</style>
