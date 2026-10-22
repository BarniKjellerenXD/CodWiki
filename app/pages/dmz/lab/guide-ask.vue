<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { guideTiers, guideTier, guideVests, guideDeployments, guideOpFit, guideFitLabels, GUIDE_CHECKED } from '#shared/dmz-guide.mjs'
import { intelEntry } from '#shared/dmz-stations.mjs'

// Concept G4: three quick questions lead to a short plan. Answers sit in
// ?vest=&goal=&squad= so a plan can be shared. The plan is CodWiki's reading
// of the guide data, not new facts.
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'briefing')!.icon
const vests = [
  { id: 'early', label: '1 or 2 plates', look: guideVests.find(vest => vest.id === '2-plate')! },
  { id: 'mid', label: '3 plates', look: guideVests.find(vest => vest.id === '3-plate')! },
  { id: 'late', label: 'Ultra', look: guideVests.find(vest => vest.id === 'tempered')! },
]
const goals = [
  { id: 'xp', label: 'Level up', icon: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6-4.5-4.1 6-.7z' },
  { id: 'cash', label: 'Make cash', icon: 'M4 7h16v10H4z M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5 M7 12h.01 M17 12h.01' },
  { id: 'gear', label: 'Better armor', icon: 'M8 4l4-1 4 1 3 3v6c0 4-3 7-7 8-4-1-7-4-7-8V7z' },
  { id: 'boss', label: 'Fight bosses', icon: 'M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4 3 5v3h8v-3c1.7-1 3-2.5 3-5a7 7 0 0 0-7-7z M9 11h.01 M15 11h.01 M10 21h4' },
]
const squads = [{ id: 'solo', label: 'Solo' }, { id: 'squad', label: 'With a squad' }]

// Answers live here and are copied whole into the URL, so quick taps in a
// row never overwrite each other.
const valid = (list: { id: string }[], value: unknown) => list.find(item => item.id === value)?.id || ''
const answers = reactive({ vest: valid(vests, route.query.vest), goal: valid(goals, route.query.goal), squad: valid(squads, route.query.squad) })
const vest = computed(() => answers.vest)
const goal = computed(() => answers.goal)
const squad = computed(() => answers.squad)
function set(key: keyof typeof answers, id: string) {
  answers[key] = id
  router.replace({ query: { ...route.query, ...Object.fromEntries(Object.entries(answers).filter(([, value]) => value)) } })
}
const answered = computed(() => Object.values(answers).filter(Boolean).length)

const { isDone, toggle } = useDmzGuide()
const tier = computed(() => vest.value ? guideTier(vest.value)! : null)
const nextSteps = computed(() => tier.value ? tier.value.steps.filter(step => !isDone(tier.value!.id, step.id)).slice(0, 3) : [])
const solo = computed(() => squad.value === 'solo')

// Goal → the deployment and the card set that serve it best.
const plan = computed(() => {
  if (!tier.value || !goal.value || !squad.value) return null
  const t = tier.value
  const deploy = { xp: 'story', cash: 'ops', gear: 'roam', boss: t.hunt ? 'roam' : 'story' }[goal.value]!
  const ops = guideOpFit.filter(op => op.fit === 'good' || (!solo.value && op.fit === 'caution')).map(op => ({ ...op, name: intelEntry(op.id)!.name }))
  const why = {
    xp: t.id === 'early' ? 'Story Missions are the biggest XP jumps, and Tier 1 opens Tier 2.' : 'Story Missions still pay the most XP per run; Orders keep the levels coming.',
    cash: 'Dynamic Operations pay steady cash and drop a Supply Drop that improves with each op you finish.',
    gear: 'Free Roam lets you loot what the printer needs and leave when the bag is full.',
    boss: t.hunt ? 'Free Roam lets you go straight to the boss without an op pulling you elsewhere.' : 'The Boss Board opens in the mid tier. Until then, Story Missions get you there fastest.',
  }[goal.value]!
  return { deploy: guideDeployments.find(item => item.id === deploy)!, why, ops }
})
</script>

<template>
  <div class="dmz-page">
    <DmzGuideLabBanner concept="g4" />
    <DmzPageHead title="DMZ guide" :icon="icon" :status="`Three questions · ${guideTiers.length} tiers behind them`" :checked="GUIDE_CHECKED" />

    <div class="a-wrap">
      <section class="a-ask" aria-labelledby="a-ask">
        <h2 id="a-ask" class="a-title"><span class="dmz-mono">Handler</span>Tell me where you are.</h2>
        <fieldset class="a-q">
          <legend><span class="a-n dmz-mono">1</span>What vest do you take on most runs?</legend>
          <div class="a-opts a-opts--vest">
            <button v-for="item in vests" :key="item.id" type="button" class="a-opt" :aria-pressed="vest === item.id" @click="set('vest', item.id)">
              <DmzVest class="a-vest" :plates="item.look.plates" :rarity="item.look.rarity" :tempered="item.look.tempered" />{{ item.label }}
            </button>
          </div>
        </fieldset>
        <fieldset class="a-q">
          <legend><span class="a-n dmz-mono">2</span>What do you want next?</legend>
          <div class="a-opts">
            <button v-for="item in goals" :key="item.id" type="button" class="a-opt" :aria-pressed="goal === item.id" @click="set('goal', item.id)">
              <svg class="a-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>{{ item.label }}
            </button>
          </div>
        </fieldset>
        <fieldset class="a-q">
          <legend><span class="a-n dmz-mono">3</span>Solo or with a squad?</legend>
          <div class="a-opts">
            <button v-for="item in squads" :key="item.id" type="button" class="a-opt" :aria-pressed="squad === item.id" @click="set('squad', item.id)">{{ item.label }}</button>
          </div>
        </fieldset>
      </section>

      <section class="a-plan" aria-labelledby="a-plan" aria-live="polite">
        <h2 id="a-plan" class="a-title"><span class="dmz-mono">Your plan</span>{{ plan && tier ? `${tier.name} tier, ${tier.armor}` : `${answered} of 3 answered` }}</h2>
        <template v-if="plan && tier">
          <div class="a-block">
            <h3 class="a-h dmz-mono">Next steps</h3>
            <ol v-if="nextSteps.length" class="a-steps">
              <li v-for="step in nextSteps" :key="step.id">
                <button type="button" class="a-tick" :aria-pressed="isDone(tier.id, step.id)" :aria-label="`Done: ${step.title}`" @click="toggle(tier.id, step.id)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></button>
                <div><strong>{{ step.title }}</strong> <span class="dmz-mono">{{ step.when }}</span><p>{{ step.text }}</p></div>
              </li>
            </ol>
            <p v-else class="a-none">Every {{ tier.name.toLowerCase() }} step is ticked. Move up a tier.</p>
          </div>

          <div class="a-block a-deploy">
            <h3 class="a-h dmz-mono">Deploy into</h3>
            <p class="a-deploy-name"><svg class="a-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="plan.deploy.icon" /></svg>{{ plan.deploy.name }}</p>
            <p>{{ plan.why }}</p>
            <p v-if="plan.deploy.id === 'ops'" class="a-ops"><span class="dmz-mono">{{ solo ? 'Solo-friendly ops' : 'Ops for your squad' }}</span>{{ plan.ops.map(op => op.name).join(', ') }}</p>
          </div>

          <div v-if="goal === 'gear'" class="a-block">
            <h3 class="a-h dmz-mono">Bring home</h3>
            <DmzGuideCards :tier="tier.id" kind="farm" />
          </div>
          <div v-else-if="goal === 'boss' && tier.hunt" class="a-block">
            <h3 class="a-h dmz-mono">{{ tier.id === 'late' ? 'Commanders' : 'Lieutenants, easiest first' }}</h3>
            <DmzGuideCards :tier="tier.id" kind="hunt" />
          </div>
          <div v-else class="a-block">
            <h3 class="a-h dmz-mono">Where to go</h3>
            <DmzMiniMap :pins="tier.places.go" :label="`${tier.name} tier: places that suit your armor`" />
          </div>

          <p v-if="solo" class="a-solo">Solo: take a 1-plate or the Free Loadout on scouting runs, and leave ops rated “{{ guideFitLabels.avoid }}” for a squad.</p>
        </template>
        <p v-else class="a-wait">Answer the three questions and the plan appears here: your next steps, where to deploy and where to go.</p>
      </section>
    </div>

    <details v-if="tier" class="a-more">
      <summary class="dmz-mono">Read the whole {{ tier.name.toLowerCase() }} tier</summary>
      <DmzGuideTier :key="tier.id" :tier="tier.id" class="a-tier" />
    </details>
  </div>
</template>

<style scoped>
.a-wrap { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 1.5rem; margin-top: 2rem; align-items: start; }
.a-ask, .a-plan { padding: 1.25rem 1.5rem 1.5rem; border: 1px solid var(--dz-line-strong); border-radius: 20px; background: rgba(20, 24, 23, 0.82); }
.a-plan { border-color: rgba(169, 217, 138, 0.4); background: linear-gradient(160deg, rgba(169, 217, 138, 0.1), rgba(20, 24, 23, 0.85) 50%); }
.a-title { margin: 0 0 1rem; font-size: 1.5rem; font-weight: 800; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.a-title .dmz-mono { display: block; margin-bottom: 0.25rem; font-size: 0.6875rem; letter-spacing: 0.12em; color: var(--dz-teal); }
.a-plan .a-title .dmz-mono { color: var(--dz-green); }
.a-q { margin: 0 0 1.25rem; padding: 0; border: 0; }
.a-q:last-child { margin-bottom: 0; }
.a-q legend { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.625rem; padding: 0; font-size: 1.0625rem; font-weight: 600; color: var(--dz-ink); }
.a-n { display: grid; place-items: center; width: 1.625rem; height: 1.625rem; border-radius: 50%; background: var(--dz-accent); color: var(--dz-bg); font-size: 0.75rem; font-weight: 800; }
.a-opts { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.a-opts--vest { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.a-opt { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; padding: 0.375rem 0.875rem; border: 1.5px solid var(--dz-line-strong); border-radius: 12px; background: rgba(11, 13, 12, 0.5); color: var(--dz-ink-2); font: inherit; font-weight: 600; cursor: pointer; }
.a-opts--vest .a-opt { flex-direction: column; padding: 0.625rem 0.375rem; font-size: 0.9375rem; }
.a-opt:hover { border-color: var(--dz-ink); }
.a-opt[aria-pressed='true'] { border-color: var(--dz-accent); background: rgba(221, 179, 99, 0.14); color: #fff; }
.a-vest { width: 3.5rem; }
.a-icon { flex: none; width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.a-block { display: grid; gap: 0.5rem; padding-top: 1rem; margin-top: 1rem; border-top: 1px solid var(--dz-line); }
.a-block:first-of-type { margin-top: 0; }
.a-h { margin: 0; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.a-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.625rem; }
.a-steps li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.75rem; align-items: start; }
.a-steps strong { color: var(--dz-ink); font-size: 1.0625rem; }
.a-steps .dmz-mono { margin-left: 0.25rem; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-accent); }
.a-steps p { margin: 0.25rem 0 0; color: #dcd9cb; font-size: 0.95rem; }
.a-tick { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border: 1.5px solid var(--dz-line-strong); border-radius: 10px; background: rgba(14, 16, 15, 0.5); color: transparent; cursor: pointer; }
.a-tick svg { width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.a-tick[aria-pressed='true'] { background: var(--dz-green); border-color: var(--dz-green); color: var(--dz-bg); }
.a-deploy p { margin: 0; color: #dcd9cb; }
.a-deploy .a-deploy-name { display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.a-ops { font-size: 0.95rem; }
.a-ops .dmz-mono { display: block; font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.a-none, .a-wait { margin: 0; color: var(--dz-muted); }
.a-solo { margin: 1rem 0 0; padding: 0.625rem 0.875rem; border-left: 2px solid var(--dz-accent); background: rgba(10, 12, 11, 0.4); color: #dcd9cb; font-size: 0.95rem; }
.a-more { margin-top: 2rem; }
.a-more summary { display: inline-flex; align-items: center; min-height: 2.75rem; padding: 0 1rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; cursor: pointer; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-ink-2); }
.a-tier { margin-top: 1.5rem; }
@media (max-width: 899px) {
  .a-wrap { grid-template-columns: 1fr; }
  .a-ask, .a-plan { padding: 1.125rem 1rem 1.25rem; }
}
</style>
