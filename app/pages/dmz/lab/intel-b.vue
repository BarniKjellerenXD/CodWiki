<script setup lang="ts">
import { dmzStations, dmzOrderChapters } from '#shared/dmz.mjs'
import { dmzIntel } from '#shared/dmz-intel.mjs'
import { labNeeds, labNeed, labEntry, needEntries, orderIntel } from '#shared/dmz-lab.mjs'

// Concept B: Intel asks what you are doing, then answers that one job.
// The answer sits in ?need= so the back button and shared links work.
type Entry = (typeof dmzIntel)[number]
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'intel')!.icon
const open = ref<Entry | null>(null)
const answer = ref<HTMLElement>()
const keyQuery = ref('')
const chosen = ref<Record<string, string>>({})
const chapters = dmzOrderChapters()

const need = computed(() => labNeed(String(route.query.need || '')) || null)
const sizeOf = (id: string) => {
  const item = labNeed(id)!
  if (item.kind === 'find') return dmzIntel.filter(entry => item.categories!.includes(entry.category)).length
  if (item.kind === 'orders') return chapters.reduce((sum, chapter) => sum + chapter.orders.length, 0)
  if (item.kind === 'issues') return dmzIntel.filter(entry => entry.category === 'issues').length
  if (item.kind === 'dates') return dmzIntel.filter(entry => entry.category === 'dates').length
  return needEntries(item).length - (item.lead?.length || 0)
}
const stepNumber = (stepIndex: number, index: number) => need.value!.steps!.slice(0, stepIndex).reduce((sum, step) => sum + step.ids.length, 0) + index + 1
const choice = computed(() => {
  if (!need.value) return null
  const id = chosen.value[need.value.id] || (need.value.kind === 'orders' ? 'preparation' : need.value.ids?.[0])
  return id || null
})
const chosenEntry = computed(() => choice.value && need.value?.kind === 'choose' ? labEntry(choice.value) : null)
const chosenOrder = computed(() => need.value?.kind === 'orders' ? chapters.flatMap(chapter => chapter.orders).find(order => order.id === choice.value) : null)
const shortName = (entry: Entry) => entry.name.replace(/ recipe$/i, '')

function pick(id: string) {
  router.replace({ query: { ...route.query, need: id === need.value?.id ? undefined : id } })
}
function choose(id: string) { chosen.value = { ...chosen.value, [need.value!.id]: id } }
watch(need, value => {
  if (value && import.meta.client) nextTick(() => answer.value?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }))
})
</script>

<template>
  <div class="dmz-page">
    <DmzLabBanner concept="b" />
    <DmzPageHead title="Intel" :icon="icon" :status="`${dmzIntel.length} entries behind eight questions`" />

    <section class="b-ask" aria-labelledby="b-ask">
      <h2 id="b-ask" class="b-question">What are you doing right now?</h2>
      <ul class="b-tiles">
        <li v-for="item in labNeeds" :key="item.id">
          <button type="button" class="b-tile" :aria-pressed="need?.id === item.id" :aria-controls="need?.id === item.id ? 'b-answer' : undefined" @click="pick(item.id)">
            <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>
            <span class="b-tile-label">{{ item.label }}</span>
            <span class="b-tile-ask">“{{ item.ask }}”</span>
            <span class="b-tile-n dmz-mono">{{ sizeOf(item.id) }} {{ item.kind === 'orders' ? 'Orders' : item.kind === 'find' ? 'keys and rooms' : item.kind === 'steps' ? 'reads' : 'entries' }}</span>
          </button>
        </li>
      </ul>
      <p v-if="!need" class="b-browse">Know exactly what you want? <NuxtLink to="/dmz/intel">Browse all {{ dmzIntel.length }} entries</NuxtLink>.</p>
    </section>

    <section v-if="need" id="b-answer" ref="answer" class="b-answer dmz-panel" aria-labelledby="b-answer-title">
      <header class="b-answer-head">
        <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="need.icon" /></svg>
        <div>
          <h2 id="b-answer-title" class="lab-h2">{{ need.label }}</h2>
          <p>{{ need.intro }}</p>
        </div>
        <button type="button" class="b-close dmz-mono" @click="pick(need.id)">Close<span class="sr-only"> this answer</span></button>
      </header>

      <template v-if="need.kind === 'steps'">
        <div v-for="(step, stepIndex) in need.steps" :key="step.title" class="b-step">
          <h3 class="b-sub dmz-mono">{{ step.title }}</h3>
          <ol class="b-reads">
            <li v-for="(id, index) in step.ids" :key="id">
              <span class="b-num dmz-mono" aria-hidden="true">{{ String(stepNumber(stepIndex, index)).padStart(2, '0') }}</span>
              <DmzLabRow v-if="labEntry(id)" :entry="labEntry(id)!" summary @open="open = $event" />
            </li>
          </ol>
        </div>
      </template>

      <template v-else-if="need.kind === 'find'">
        <DmzLabFind v-model="keyQuery" variant="hero" :categories="need.categories" :limit="6" label="Search keys" placeholder="Type the name on the key card, such as Counting Room" @pick="open = $event" />
        <p v-if="!keyQuery" class="b-hint">Or try <button v-for="word in ['Supreme Leader', 'Armory', 'Penthouse']" :key="word" type="button" class="lab-chip b-try" @click="keyQuery = word">{{ word }}</button></p>
      </template>

      <template v-else-if="need.kind === 'choose'">
        <p v-for="id in need.lead || []" :key="id" class="b-lead">{{ labEntry(id)?.summary }}</p>
        <div class="lab-chips b-choices" role="group" :aria-label="`Pick from ${need.label}`">
          <button v-for="id in need.ids" :key="id" type="button" class="lab-chip" :aria-pressed="choice === id" @click="choose(id)">{{ shortName(labEntry(id)!) }}</button>
        </div>
        <div v-if="chosenEntry" class="b-chosen lab-card">
          <DmzLabDossier :key="chosenEntry.id" :entry="chosenEntry" @open="open = $event" />
        </div>
      </template>

      <template v-else-if="need.kind === 'orders'">
        <div class="b-chapters">
          <div v-for="chapter in chapters" :key="chapter.title" class="b-chapter">
            <h3 class="b-sub dmz-mono">{{ chapter.title }}</h3>
            <div class="lab-chips">
              <button v-for="order in chapter.orders" :key="order.id" type="button" class="lab-chip" :aria-pressed="choice === order.id" @click="choose(order.id)">{{ order.name }}</button>
            </div>
          </div>
        </div>
        <div v-if="chosenOrder" class="b-chosen lab-card">
          <p class="lab-kind dmz-mono">DMZ Order · {{ chosenOrder.chapter }}</p>
          <h3 class="lab-h3">{{ chosenOrder.name }}</h3>
          <p class="b-order-summary">{{ chosenOrder.summary }}</p>
          <ol class="b-tasks">
            <li v-for="task in chosenOrder.tasks" :key="task.id"><span class="b-box" aria-hidden="true" />{{ task.text }}</li>
          </ol>
          <p v-if="chosenOrder.note" class="dmz-note b-note">{{ chosenOrder.note }}</p>
          <template v-if="orderIntel(chosenOrder).length">
            <h4 class="b-sub dmz-mono">Named in this Order</h4>
            <ul class="b-named">
              <li v-for="entry in orderIntel(chosenOrder)" :key="entry.id"><DmzLabRow :entry="entry" @open="open = $event" /></li>
            </ul>
          </template>
        </div>
      </template>

      <DmzLabStatus v-else-if="need.kind === 'issues'" show="issues" @open="open = $event" />
      <DmzLabStatus v-else-if="need.kind === 'dates'" show="dates" @open="open = $event" />

      <footer class="b-more">
        <NuxtLink :to="need.more.to" class="lab-link">{{ need.more.label }}<span aria-hidden="true">&nbsp;→</span></NuxtLink>
      </footer>
    </section>

    <DmzLabDrawer :entry="open" @close="open = null" />
  </div>
</template>

<style scoped>
.b-ask { margin-top: 2rem; }
.b-question { margin: 0 0 1rem; font-size: clamp(1.75rem, 4.5vw, 2.75rem); font-weight: 700; line-height: 1.05; letter-spacing: 0.02em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.b-tiles { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.625rem; }
.b-tile { display: flex; flex-direction: column; align-items: flex-start; gap: 0.375rem; width: 100%; height: 100%; min-height: 8.5rem; padding: 1rem; border: 1px solid var(--dz-line); border-radius: 16px; background: rgba(20, 24, 23, 0.72); color: var(--dz-ink-2); font: inherit; text-align: left; cursor: pointer; }
.b-tile:hover { border-color: var(--dz-line-strong); color: #fff; background: rgba(30, 36, 34, 0.85); }
.b-tile[aria-pressed='true'] { border-color: var(--dz-accent); background: linear-gradient(180deg, rgba(221, 179, 99, 0.18), rgba(221, 179, 99, 0.05)); color: #fff; }
.b-tile .lab-icon { width: 1.75rem; height: 1.75rem; color: var(--dz-ink); }
.b-tile-label { font-size: 1.25rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f3f1e5; }
.b-tile-ask { font-size: 0.925rem; color: var(--dz-muted); }
.b-tile-n { margin-top: auto; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); }
.b-browse { margin: 1rem 0 0; color: var(--dz-muted); }
.b-browse a { text-underline-offset: 0.2em; }
/* Room above for the site's floating reading-settings button. */
.b-answer { margin-top: 1.5rem; scroll-margin-top: 4.5rem; display: flex; flex-direction: column; gap: 1rem; }
.b-answer-head { display: flex; align-items: flex-start; gap: 1rem; }
.b-answer-head > .lab-icon { flex: none; width: 2rem; height: 2rem; margin-top: 0.125rem; }
.b-answer-head > div { flex: 1 1 auto; }
.b-answer-head p { margin: 0.375rem 0 0; color: #dcd9cb; }
.b-close { flex: none; min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-ink); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.b-sub { margin: 0 0 0.5rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.b-reads { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.b-reads li { display: grid; grid-template-columns: 2.25rem minmax(0, 1fr); align-items: start; gap: 0.5rem; }
.b-num { padding-top: 0.75rem; font-size: 0.875rem; font-weight: 700; color: var(--dz-accent); }
.b-hint { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin: 0; color: var(--dz-muted); }
.b-lead { margin: 0; max-width: 48rem; color: #dcd9cb; }
.b-choices { margin-top: 0.25rem; }
.b-chosen { margin-top: 0.25rem; }
.b-chapters { display: grid; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); gap: 1rem; }
.b-order-summary { margin: 0; color: #dcd9cb; }
.b-tasks { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.b-tasks li { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 1.125rem; line-height: 1.3; font-variation-settings: 'wdth' 75; color: #f0eee2; }
.b-box { flex: none; width: 0.9375rem; height: 0.9375rem; margin-top: 0.25rem; border: 1.5px solid #cfd2c4; background: rgba(233, 230, 214, 0.14); }
.b-note { margin: 0; }
.b-named { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 0.375rem; }
.b-more { padding-top: 0.5rem; border-top: 1px solid var(--dz-line); }
@media (max-width: 899px) {
  .b-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
  .b-tile { min-height: 7.5rem; padding: 0.875rem; }
  .b-tile-ask { display: none; }
  .b-answer { padding: 1rem; }
  .b-answer-head > .lab-icon { display: none; }
}
</style>
