<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { guideTiers, guideVests, GUIDE_CHECKED } from '#shared/dmz-guide.mjs'

// Concept G1: the whole guide on one page, Early to Late. A ladder of vests
// beside it marks the tier in view and jumps between tiers.
const icon = dmzStations.find(station => station.id === 'briefing')!.icon
const rungs = guideTiers.map(tier => ({ ...tier, look: guideVests.find(vest => vest.id === tier.vest)! }))
const stepCount = guideTiers.reduce((sum, tier) => sum + tier.steps.length, 0)
const { doneIn } = useDmzGuide()

const current = ref(guideTiers[0]!.id)
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) current.value = entry.target.id.replace('tier-', '')
  }, { rootMargin: '-35% 0px -60% 0px' })
  for (const tier of guideTiers) {
    const section = document.getElementById(`tier-${tier.id}`)
    if (section) observer.observe(section)
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="dmz-page">
    <DmzGuideLabBanner concept="g1" />
    <DmzPageHead title="DMZ guide" :icon="icon" :status="`${guideTiers.length} tiers · ${stepCount} steps · from your first 1-plate to Ultra armor`" :checked="GUIDE_CHECKED">
      <p class="lab-lede">Your vest tells you how far into DMZ you are. Start on the bottom rung and work your way up: each tier says what to do, in order, and what to bring home.</p>
    </DmzPageHead>

    <div class="l-wrap">
      <nav class="l-ladder" aria-label="Guide tiers">
        <ol>
          <li v-for="rung in rungs" :key="rung.id">
            <a :href="`#tier-${rung.id}`" class="l-rung" :aria-current="current === rung.id ? 'location' : undefined">
              <DmzVest class="l-vest" :plates="rung.look.plates" :rarity="rung.look.rarity" :tempered="rung.look.tempered" />
              <span class="l-name">{{ rung.name }}</span>
              <span class="l-armor dmz-mono">{{ rung.armor }}</span>
              <span class="l-count dmz-mono">{{ doneIn(rung.id) }}/{{ rung.steps.length }}<span class="sr-only"> steps done</span></span>
            </a>
          </li>
        </ol>
      </nav>

      <div class="l-tiers">
        <section v-for="tier in guideTiers" :id="`tier-${tier.id}`" :key="tier.id" class="l-tier">
          <DmzGuideTier :tier="tier.id" />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.l-wrap { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: 2rem; margin-top: 2rem; align-items: start; }
.l-ladder { position: sticky; top: 1.5rem; }
.l-ladder ol { position: relative; list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
/* The two rails of the ladder. */
.l-ladder ol::before, .l-ladder ol::after { content: ''; position: absolute; top: 1rem; bottom: 1rem; width: 2px; background: var(--dz-line-strong); }
.l-ladder ol::before { left: 0.5rem; }
.l-ladder ol::after { right: 0.5rem; }
.l-rung { position: relative; z-index: 1; display: grid; grid-template-columns: 3rem minmax(0, 1fr); grid-template-areas: 'vest name' 'vest armor' 'vest count'; gap: 0 0.75rem; align-items: center; padding: 0.625rem 0.75rem; border: 1px solid var(--dz-line); border-radius: 12px; background: #131716; text-decoration: none; color: var(--dz-ink-2) !important; }
.l-rung:hover { border-color: var(--dz-line-strong); }
.l-rung[aria-current] { border-color: var(--dz-accent); background: linear-gradient(90deg, rgba(221, 179, 99, 0.16), #131716 80%); }
.l-vest { grid-area: vest; width: 3rem; }
.l-name { grid-area: name; font-size: 1.125rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.l-armor { grid-area: armor; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-accent); }
.l-count { grid-area: count; font-size: 0.6875rem; color: var(--dz-muted); }
.l-tiers { display: grid; gap: 3.5rem; }
.l-tier { scroll-margin-top: 1.5rem; }
.l-tier + .l-tier { padding-top: 3rem; border-top: 1px solid var(--dz-line); }
@media (max-width: 899px) {
  .l-wrap { grid-template-columns: 1fr; gap: 1.25rem; }
  /* The right padding clears the site's search and settings buttons. */
  .l-ladder { top: 0; z-index: 4; margin: 0 -1rem; padding: 0.5rem 6.75rem 0.5rem 1rem; background: rgba(11, 13, 12, 0.94); border-bottom: 1px solid var(--dz-line); }
  .l-ladder ol { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.375rem; }
  .l-ladder ol::before, .l-ladder ol::after { display: none; }
  .l-rung { grid-template-columns: 1.75rem minmax(0, 1fr); grid-template-areas: 'vest name' 'vest armor'; padding: 0.375rem 0.5rem; gap: 0 0.5rem; }
  .l-vest { width: 1.75rem; }
  .l-name { font-size: 0.9375rem; }
  .l-armor { font-size: 0.625rem; }
  .l-count { display: none; }
  .l-tier { scroll-margin-top: 5rem; }
}
@media (max-width: 479px) {
  .l-rung { grid-template-columns: 1fr; grid-template-areas: 'vest' 'name'; justify-items: center; padding: 0.25rem; }
  .l-vest { width: 1.5rem; }
  .l-armor { display: none; }
}
</style>
