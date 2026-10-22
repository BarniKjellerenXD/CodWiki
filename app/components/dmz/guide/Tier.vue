<script setup lang="ts">
import { guideTier, guideTiers, guideOpFit, guideSignIcons, guideTierSources } from '#shared/dmz-guide.mjs'
import { hajinPin } from '#shared/dmz-map.mjs'

// One whole stage of the game: the signs that you are in it, the steps in
// order, then what to print, farm and hunt, the mistakes and the checklist for
// the next stage. With fold, the parts after the steps become questions that
// open on tap, which keeps a stage short on a phone.
const props = withDefaults(defineProps<{ tier: string, headingLevel?: 2 | 3, fold?: boolean }>(), { headingLevel: 2, fold: false })
const tier = computed(() => guideTier(props.tier)!)
const rank = computed(() => guideTiers.indexOf(tier.value) + 1)
const next = computed(() => guideTiers[rank.value])
const h = computed(() => `h${props.headingLevel}`)
const sub = computed(() => (props.headingLevel + 1) as 3 | 4)
const avoid = computed(() => tier.value.places.avoid.map((id: string) => hajinPin(id)!).map(pin => `${pin.name} (${pin.threat})`).join(', '))
const where = computed(() => `${tier.value.places.go.length} places to play${tier.value.places.avoid.length ? `, ${tier.value.places.avoid.length} to leave for later` : ''}`)
</script>

<template>
  <article class="gt" :aria-labelledby="`gt-${tier.id}`">
    <header class="gt-head">
      <DmzGuideRank class="gt-rank" :rank="rank" :of="guideTiers.length" />
      <div>
        <p class="gt-tag dmz-mono">Stage {{ rank }} of {{ guideTiers.length }}</p>
        <component :is="h" :id="`gt-${tier.id}`" class="gt-title">{{ tier.name }} game</component>
        <p class="gt-pitch">{{ tier.pitch }}</p>
      </div>
    </header>

    <div class="gt-signs">
      <p :id="`gt-signs-${tier.id}`" class="gt-signs-label dmz-mono">Signs you are here</p>
      <ul :aria-labelledby="`gt-signs-${tier.id}`">
        <li v-for="[icon, text] in tier.signs" :key="text"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="guideSignIcons[icon]" /></svg>{{ text }}</li>
      </ul>
    </div>

    <dl class="gt-kit">
      <div v-for="item in tier.kit" :key="item.label"><dt class="dmz-mono">{{ item.label }}</dt><dd>{{ item.text }}</dd></div>
    </dl>

    <DmzGuideFold title="Do this, in order" :level="sub">
      <DmzGuideSteps :tier="tier.id" />
    </DmzGuideFold>

    <DmzGuideFold v-if="tier.id === 'early'" title="Pick a deployment" :level="sub">
      <DmzGuideDeploy :ops="!fold" />
    </DmzGuideFold>

    <div class="gt-parts" :class="{ 'is-folded': fold }">
      <DmzGuideFold v-if="fold && tier.id === 'early'" fold :level="sub" title="The Dynamic Ops" question="Which Dynamic Op should I take?" :hint="`${guideOpFit.length} ops rated for the early game`">
        <DmzGuideOps />
      </DmzGuideFold>

      <DmzGuideFold v-if="tier.hunt" :fold="fold" :level="sub" :title="tier.id === 'late' ? 'Commanders to kill' : 'Lieutenants, easiest first'" :question="tier.id === 'late' ? 'Which Commanders do I go after?' : 'Which Lieutenants do I hunt first?'" :hint="`${tier.hunt.length} bosses, easiest first`">
        <DmzGuideCards :tier="tier.id" kind="hunt" />
        <DmzGuideSources :ids="tier.huntSources" />
      </DmzGuideFold>

      <DmzGuideFold :fold="fold" :level="sub" title="Print first" question="What should I print?" :hint="`${tier.print.length} recipes, most useful first`">
        <DmzGuideCards :tier="tier.id" kind="print" />
        <DmzGuideSources :ids="tier.printSources" />
      </DmzGuideFold>

      <DmzGuideFold :fold="fold" :level="sub" title="Farm these" question="What should I farm, and where?" :hint="`${tier.farm.length} materials with a map`">
        <DmzGuideCards :tier="tier.id" kind="farm" />
        <DmzGuideSources :ids="tier.farmSources" />
      </DmzGuideFold>

      <DmzGuideFold :fold="fold" :level="sub" title="Where to play" question="Where should I play?" :hint="where" class="gt-where">
        <DmzMiniMap :pins="tier.places.go" :label="`${tier.name} game: places to play`" />
        <p v-if="avoid" class="gt-avoid"><span class="dmz-mono">Leave for later</span> {{ avoid }}</p>
      </DmzGuideFold>

      <div class="gt-pair">
        <DmzGuideFold :fold="fold" :level="sub" title="Avoid these mistakes" question="What mistakes should I avoid?" :hint="`${tier.mistakes.length} common ones`">
          <DmzGuideChecks :tier="tier.id" kind="mistakes" />
        </DmzGuideFold>
        <DmzGuideFold v-if="tier.ready.length && next" :fold="fold" :level="sub" title="Ready to move on?" :question="`Am I ready for the ${next.name.toLowerCase()} game?`" :hint="`${tier.ready.length} checks`">
          <DmzGuideChecks :tier="tier.id" kind="ready" />
        </DmzGuideFold>
      </div>
    </div>

    <DmzGuideSources :ids="guideTierSources(tier)" :label="`All ${tier.name.toLowerCase()}-game sources`" />
  </article>
</template>

<style scoped>
.gt { display: grid; gap: 1.5rem; }
.gt-head { display: grid; grid-template-columns: 6rem minmax(0, 1fr); gap: 1.25rem; align-items: center; }
.gt-rank { width: 6rem; color: var(--dz-accent); }
.gt-tag { margin: 0; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-accent); }
.gt-title { margin: 0.125rem 0 0.375rem; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; line-height: 1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.gt-pitch { margin: 0; max-width: 44rem; color: #dcd9cb; font-size: 1.0625rem; }
.gt-signs { display: grid; gap: 0.5rem; }
.gt-signs-label { margin: 0; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.gt-signs ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.gt-signs li { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.25rem; padding: 0.25rem 0.875rem 0.25rem 0.625rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(20, 24, 23, 0.6); color: var(--dz-ink); font-size: 0.9375rem; }
.gt-signs svg { flex: none; width: 1.25rem; height: 1.25rem; fill: none; stroke: var(--dz-teal); stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.gt-kit { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5rem; margin: 0; }
.gt-kit div { padding: 0.75rem 0.875rem; border-top: 2px solid var(--dz-line-strong); background: rgba(20, 24, 23, 0.6); }
.gt-kit dt { margin-bottom: 0.25rem; font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.gt-kit dd { margin: 0; color: var(--dz-ink); font-size: 0.9375rem; line-height: 1.35; }
.gt-parts { display: grid; gap: 1.5rem; }
.gt-parts.is-folded { gap: 0.5rem; }
.gt-where :deep(.mm) { max-width: 34rem; }
.gt-avoid { margin: 0; color: var(--dz-muted); font-size: 0.9375rem; }
.gt-avoid span { margin-right: 0.375rem; font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: #ef7a5a; }
.gt-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; align-items: start; }
.is-folded .gt-pair { grid-template-columns: 1fr; gap: 0.5rem; }
@media (max-width: 899px) {
  .gt-kit { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gt-pair { grid-template-columns: 1fr; }
}
@media (max-width: 479px) {
  .gt-head { grid-template-columns: 4rem minmax(0, 1fr); gap: 0.875rem; }
  .gt-rank { width: 4rem; }
  .gt-signs li { font-size: 0.875rem; }
}
</style>
