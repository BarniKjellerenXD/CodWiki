<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { guideTiers, guideTier, guideVests, guideDeployments, GUIDE_CHECKED } from '#shared/dmz-guide.mjs'
import { hajinPin } from '#shared/dmz-map.mjs'

// Concept G3: Early, Mid and Late tabs. Each tab is a list of questions that
// open into the answer. The tab sits in ?tier= so links land on it.
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'briefing')!.icon
const tabs = guideTiers.map(tier => ({ ...tier, look: guideVests.find(vest => vest.id === tier.vest)! }))
const tier = computed(() => guideTier(String(route.query.tier || '')) || guideTiers[0]!)
const next = computed(() => guideTiers[guideTiers.indexOf(tier.value) + 1])
const { doneIn } = useDmzGuide()

const questions = computed(() => {
  const t = tier.value
  return [
    { id: 'steps', q: 'What do I do first?', a: `${t.steps.length} steps, in order` },
    t.id === 'early' && { id: 'deploy', q: 'Which deployment should I pick?', a: `${guideDeployments.length} ways in, and every Dynamic Op` },
    t.hunt && { id: 'hunt', q: t.id === 'late' ? 'Which Commanders do I go after?' : 'Which Lieutenants do I hunt first?', a: `${t.hunt.length} bosses, easiest first` },
    { id: 'print', q: 'What should I print?', a: `${t.print.length} recipes, most useful first` },
    { id: 'farm', q: 'What should I farm, and where?', a: `${t.farm.length} materials with a map` },
    { id: 'where', q: 'Where should I play?', a: `${t.places.go.length} places that suit ${t.armor} armor` },
    { id: 'mistakes', q: 'What mistakes should I avoid?', a: `${t.mistakes.length} common ones` },
    t.ready.length && next.value && { id: 'ready', q: `Am I ready for ${next.value.name.toLowerCase()} tier?`, a: `${t.ready.length} checks` },
  ].filter(Boolean) as { id: string, q: string, a: string }[]
})
const sourcesOf = (kind: string) => (tier.value as Record<string, unknown>)[`${kind}Sources`] as string[]
const avoid = computed(() => tier.value.places.avoid.map((id: string) => hajinPin(id)!.name).join(', '))

const tabEls = ref<HTMLButtonElement[]>([])
function select(id: string) { router.replace({ query: { ...route.query, tier: id === guideTiers[0]!.id ? undefined : id } }) }
function move(event: KeyboardEvent, index: number) {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
  if (!step) return
  event.preventDefault()
  const to = (index + step + tabs.length) % tabs.length
  select(tabs[to]!.id)
  tabEls.value[to]?.focus()
}
</script>

<template>
  <div class="dmz-page">
    <DmzGuideLabBanner concept="g3" />
    <DmzPageHead title="DMZ guide" :icon="icon" :status="`${guideTiers.length} tiers · pick yours, then open a question`" :checked="GUIDE_CHECKED">
      <p class="lab-lede">Early is 1–2 plate armor, Mid starts with your first 3-plate, and Late is Ultra armor. Pick your tier, then open any question.</p>
    </DmzPageHead>

    <div class="t-tabs" role="tablist" aria-label="Guide tiers">
      <button v-for="(item, index) in tabs" :id="`t-tab-${item.id}`" :key="item.id" ref="tabEls" type="button" role="tab" class="t-tab" :aria-selected="tier.id === item.id" aria-controls="t-panel" :tabindex="tier.id === item.id ? 0 : -1" @click="select(item.id)" @keydown="move($event, index)">
        <DmzVest class="t-vest" :plates="item.look.plates" :rarity="item.look.rarity" :tempered="item.look.tempered" />
        <span class="t-name">{{ item.name }}</span>
        <span class="t-armor dmz-mono">{{ item.armor }}</span>
        <span class="t-done dmz-mono">{{ doneIn(item.id) }}/{{ item.steps.length }}<span class="sr-only"> steps done</span></span>
      </button>
    </div>

    <div id="t-panel" :key="tier.id" class="t-panel" role="tabpanel" :aria-labelledby="`t-tab-${tier.id}`">
      <p class="t-pitch"><span class="dmz-mono">{{ tier.levels }}</span>{{ tier.pitch }}</p>
      <ul class="t-qs">
        <li v-for="(item, index) in questions" :key="item.id">
          <details class="t-q" :open="index === 0 || undefined">
            <summary>
              <span class="t-q-text">{{ item.q }}</span>
              <span class="t-q-a dmz-mono">{{ item.a }}</span>
              <svg class="t-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </summary>
            <div class="t-answer">
              <DmzGuideSteps v-if="item.id === 'steps'" :tier="tier.id" />
              <DmzGuideDeploy v-else-if="item.id === 'deploy'" />
              <template v-else-if="item.id === 'hunt' || item.id === 'print' || item.id === 'farm'">
                <DmzGuideCards :tier="tier.id" :kind="item.id" />
                <DmzGuideSources :ids="sourcesOf(item.id)" />
              </template>
              <template v-else-if="item.id === 'where'">
                <DmzMiniMap class="t-map" :pins="tier.places.go" :label="`${tier.name} tier: places that suit your armor`" />
                <p v-if="avoid" class="t-avoid"><span class="dmz-mono">Leave for later</span> {{ avoid }}</p>
              </template>
              <DmzGuideChecks v-else-if="item.id === 'mistakes' || item.id === 'ready'" :tier="tier.id" :kind="item.id" />
            </div>
          </details>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.t-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; margin-top: 2rem; }
.t-tab { display: grid; grid-template-columns: 3rem minmax(0, 1fr) auto; grid-template-areas: 'vest name done' 'vest armor done'; gap: 0 0.75rem; align-items: center; padding: 0.75rem 1rem; border: 1px solid var(--dz-line); border-bottom-width: 3px; border-radius: 14px 14px 4px 4px; background: rgba(20, 24, 23, 0.7); color: var(--dz-ink-2); font: inherit; text-align: left; cursor: pointer; }
.t-tab:hover { border-color: var(--dz-line-strong); }
.t-tab[aria-selected='true'] { border-color: var(--dz-accent); background: rgba(221, 179, 99, 0.12); }
.t-vest { grid-area: vest; width: 3rem; }
.t-name { grid-area: name; font-size: 1.375rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.t-armor { grid-area: armor; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-accent); }
.t-done { grid-area: done; font-size: 0.75rem; color: var(--dz-muted); }
.t-panel { margin-top: 1.25rem; }
.t-pitch { margin: 0 0 1.25rem; max-width: 46rem; color: #e3e0d0; font-size: 1.0625rem; }
.t-pitch .dmz-mono { display: block; margin-bottom: 0.25rem; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.t-qs { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.t-q { border: 1px solid var(--dz-line); border-radius: 14px; background: rgba(20, 24, 23, 0.82); }
.t-q[open] { border-color: var(--dz-line-strong); }
.t-q summary { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 1rem; min-height: 3.5rem; padding: 0.75rem 1.125rem; cursor: pointer; list-style: none; }
.t-q summary::-webkit-details-marker { display: none; }
.t-q-text { flex: 1 1 16rem; font-size: 1.25rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.t-q-a { font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.t-chev { flex: none; width: 1.25rem; height: 1.25rem; fill: none; stroke: var(--dz-muted); stroke-width: 2; transition: transform 0.15s; }
.t-q[open] .t-chev { transform: rotate(180deg); }
.t-answer { display: grid; gap: 0.75rem; padding: 0.25rem 1.125rem 1.25rem; }
.t-map { max-width: 34rem; }
.t-avoid { margin: 0; color: var(--dz-muted); font-size: 0.9375rem; }
.t-avoid span { margin-right: 0.375rem; font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: #ef7a5a; }
@media (prefers-reduced-motion: reduce) { .t-chev { transition: none; } }
@media (max-width: 599px) {
  .t-tab { grid-template-columns: 1fr; grid-template-areas: 'vest' 'name' 'armor'; justify-items: center; gap: 0.125rem; padding: 0.625rem 0.25rem; text-align: center; }
  .t-vest { width: 2.5rem; }
  .t-name { font-size: 1.125rem; }
  .t-done { display: none; }
  .t-q summary { padding: 0.625rem 0.875rem; }
  .t-q-text { font-size: 1.125rem; }
  .t-answer { padding: 0.25rem 0.75rem 1rem; }
}
</style>
