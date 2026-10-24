<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { guideTiers, guideTier, GUIDE_CHECKED } from '#shared/dmz-guide.mjs'

// Guide station: pick the stage of the game you are in and get its plan, with
// the steps open and the rest folded into questions. The stage sits in
// ?stage= so links land on it; without one, the guide reopens on the stage
// picked last on this device, or on Early.
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'guide')!.icon
const stepCount = guideTiers.reduce((sum, tier) => sum + tier.steps.length, 0)
const { state, doneIn, remember } = useDmzGuide()
const tier = computed(() => guideTier(String(route.query.stage || '')) || guideTier(state.value.tier) || guideTiers[0]!)
const next = computed(() => guideTiers[guideTiers.indexOf(tier.value) + 1])
const plan = ref<HTMLElement>()

function pick(id: string, scroll = false) {
  remember(id)
  router.replace({ query: { ...route.query, stage: id } })
  if (scroll) nextTick(() => plan.value?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }))
}
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Progression guide" :icon="icon" :checked="GUIDE_CHECKED" :status="`${guideTiers.length} stages · ${stepCount} steps · ticks saved on this device`">
      <p class="g-lede">Your time in DMZ runs in three stages, from your first deploy to the endgame. Pick the one you are in for its plan: what to do in order, then what to print, farm and hunt. New to DMZ? Read the Briefing first.</p>
    </DmzPageHead>

    <section class="g-ask" aria-labelledby="g-ask">
      <h2 id="g-ask" class="g-question">Where are you in DMZ?</h2>
      <div class="g-picks" role="group" aria-labelledby="g-ask">
        <button v-for="(item, index) in guideTiers" :key="item.id" type="button" class="g-pick" :aria-pressed="tier.id === item.id" @click="pick(item.id)">
          <DmzGuideRank class="g-rank" :rank="index + 1" :of="guideTiers.length" />
          <span class="g-stage dmz-mono">Stage {{ index + 1 }}</span>
          <span class="g-name">{{ item.name }} game</span>
          <span class="g-short">{{ item.short }}</span>
          <span class="g-meter" aria-hidden="true"><span :style="{ width: `${doneIn(item.id) / item.steps.length * 100}%` }" /></span>
          <span class="g-done dmz-mono">{{ doneIn(item.id) }}/{{ item.steps.length }}<span class="sr-only"> steps done</span></span>
        </button>
      </div>
    </section>

    <div ref="plan" class="g-plan">
      <DmzGuideTier :key="tier.id" :tier="tier.id" fold />

      <aside v-if="next" class="g-next" aria-labelledby="g-next">
        <DmzGuideRank class="g-next-rank" :rank="guideTiers.indexOf(next) + 1" :of="guideTiers.length" />
        <div>
          <p class="g-next-tag dmz-mono">Next up · Stage {{ guideTiers.indexOf(next) + 1 }}</p>
          <h2 id="g-next" class="g-next-title">{{ next.name }} game</h2>
          <p class="g-next-pitch">{{ next.pitch }}</p>
          <button type="button" class="dmz-pill" @click="pick(next.id, true)">See the {{ next.name.toLowerCase() }}-game plan <span aria-hidden="true">→</span></button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.g-lede { max-width: 46rem; margin: 1rem 0 0; color: #dcd9cb; font-size: 1.0625rem; }
.g-ask { margin-top: 2rem; padding: 1.5rem; border: 1px solid var(--dz-line-strong); border-radius: 20px; background: radial-gradient(120% 140% at 0% 0%, rgba(221, 179, 99, 0.12), rgba(20, 24, 23, 0.8) 55%); }
.g-question { margin: 0 0 1.125rem; font-size: clamp(1.625rem, 5vw, 2.75rem); font-weight: 800; line-height: 1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.g-picks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
.g-pick { display: grid; justify-items: center; align-content: start; gap: 0.25rem; padding: 1.125rem 1rem 1rem; border: 1.5px solid var(--dz-line); border-radius: 16px; background: rgba(11, 13, 12, 0.6); color: var(--dz-ink-2); font: inherit; text-align: center; cursor: pointer; }
.g-pick:hover { border-color: var(--dz-line-strong); }
.g-pick[aria-pressed='true'] { border-color: var(--dz-accent); background: rgba(221, 179, 99, 0.12); box-shadow: 0 0 0 1px var(--dz-accent) inset; }
.g-rank { width: 4.5rem; margin-bottom: 0.25rem; color: var(--dz-ink-2); }
.g-pick[aria-pressed='true'] .g-rank { color: var(--dz-accent); }
.g-stage { font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.g-pick[aria-pressed='true'] .g-stage { color: var(--dz-accent); }
.g-name { font-size: 1.5rem; font-weight: 800; line-height: 1.05; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.g-short { max-width: 16rem; color: #dcd9cb; font-size: 0.9375rem; line-height: 1.35; }
.g-meter { width: 100%; max-width: 9rem; height: 4px; margin-top: 0.5rem; border-radius: 2px; background: var(--dz-line); overflow: hidden; }
.g-meter span { display: block; height: 100%; background: var(--dz-green); }
.g-done { font-size: 0.6875rem; color: var(--dz-muted); }
.g-plan { display: grid; gap: 3rem; margin-top: 2.5rem; scroll-margin-top: 1rem; }
.g-next { display: grid; grid-template-columns: 5rem minmax(0, 1fr); gap: 1.25rem; align-items: center; padding: 1.25rem 1.5rem; border: 1px dashed var(--dz-line-strong); border-radius: 18px; background: rgba(20, 24, 23, 0.6); }
.g-next-rank { width: 5rem; color: var(--dz-teal); }
.g-next-tag { margin: 0; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.g-next-title { margin: 0.125rem 0 0.375rem; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.g-next-pitch { margin: 0 0 0.875rem; color: #dcd9cb; }
/* Phones: the stages stack as rows, the stripes beside the name. */
@media (max-width: 599px) {
  .g-ask { padding: 1.125rem 0.875rem; }
  .g-picks { grid-template-columns: minmax(0, 1fr); gap: 0.5rem; }
  .g-pick { grid-template-columns: 2.75rem minmax(0, 1fr) auto; grid-template-areas: 'rank name done' 'rank short short' 'rank meter meter'; justify-items: start; align-items: center; column-gap: 0.875rem; row-gap: 0.125rem; padding: 0.75rem 0.875rem; border-radius: 12px; text-align: left; }
  .g-rank { grid-area: rank; width: 2.75rem; margin: 0; }
  .g-stage { display: none; }
  .g-name { grid-area: name; font-size: 1.1875rem; }
  .g-short { grid-area: short; max-width: none; font-size: 0.875rem; }
  .g-meter { grid-area: meter; max-width: none; margin-top: 0.375rem; }
  .g-done { grid-area: done; }
  .g-next { grid-template-columns: 3.5rem minmax(0, 1fr); padding: 1rem; gap: 0.875rem; }
  .g-next-rank { width: 3.5rem; }
}
</style>
