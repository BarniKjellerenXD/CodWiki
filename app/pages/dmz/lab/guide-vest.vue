<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { guideTiers, guideTier, guideVests, GUIDE_CHECKED } from '#shared/dmz-guide.mjs'

// Concept G2: the guide asks which vest you wear, then shows that one tier.
// The pick sits in ?vest= so the back button and shared links work.
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'briefing')!.icon
const picks = ['1-plate', '2-plate', '3-plate', 'tempered'].map(id => guideVests.find(vest => vest.id === id)!)
  .map(vest => ({ ...vest, short: vest.tempered ? 'Ultra' : `${vest.plates}-plate`, tierName: guideTier(vest.tier)!.name }))
const picked = computed(() => picks.find(item => item.id === route.query.vest) || null)
const tier = computed(() => picked.value ? guideTier(picked.value.tier)! : null)
const next = computed(() => tier.value ? guideTiers[guideTiers.indexOf(tier.value) + 1] : null)
const nextVest = computed(() => next.value ? guideVests.find(vest => vest.id === next.value!.vest)! : null)
const body = ref<HTMLElement>()

function pick(id: string, scroll = false) {
  router.replace({ query: { ...route.query, vest: id } })
  if (scroll) nextTick(() => body.value?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }))
}
</script>

<template>
  <div class="dmz-page">
    <DmzGuideLabBanner concept="g2" />
    <DmzPageHead title="DMZ guide" :icon="icon" :status="`${guideTiers.length} tiers · from your first 1-plate to Ultra armor`" :checked="GUIDE_CHECKED" />

    <section class="v-ask" aria-labelledby="v-ask">
      <h2 id="v-ask" class="v-question">What are you wearing?</h2>
      <p class="v-hint">Pick the vest you take on most runs. That is your tier.</p>
      <div class="v-picks" role="group" aria-labelledby="v-ask">
        <button v-for="item in picks" :key="item.id" type="button" class="v-pick" :class="`is-${item.tier}`" :aria-pressed="picked?.id === item.id" @click="pick(item.id)">
          <DmzVest class="v-vest" :plates="item.plates" :rarity="item.rarity" :tempered="item.tempered" />
          <span class="v-short">{{ item.short }}</span>
          <span class="v-tier dmz-mono">{{ item.tierName }} tier</span>
        </button>
      </div>
      <ol class="v-track dmz-mono" aria-label="The three tiers">
        <li v-for="item in guideTiers" :key="item.id" :class="{ 'is-on': tier?.id === item.id }"><span>{{ item.name }}</span> {{ item.armor }}</li>
      </ol>
    </section>

    <div v-if="tier" ref="body" class="v-body">
      <DmzGuideTier :key="tier.id" :tier="tier.id" />

      <aside v-if="next && nextVest" class="v-next" aria-labelledby="v-next">
        <DmzVest class="v-next-vest" :plates="nextVest.plates" :rarity="nextVest.rarity" :tempered="nextVest.tempered" />
        <div>
          <p class="v-next-tag dmz-mono">Next up</p>
          <h2 id="v-next" class="v-next-title">{{ next.name }} tier · {{ next.armor }}</h2>
          <p class="v-next-pitch">{{ next.pitch }}</p>
          <button type="button" class="dmz-pill" @click="pick(next.vest, true)">Read the {{ next.name.toLowerCase() }} tier <span aria-hidden="true">→</span></button>
        </div>
      </aside>
    </div>
    <p v-else class="v-empty">Your plan appears here once you pick a vest. New to DMZ? Pick <button type="button" class="v-link" @click="pick('1-plate')">1-plate</button>.</p>
  </div>
</template>

<style scoped>
.v-ask { margin-top: 2rem; padding: 1.5rem; border: 1px solid var(--dz-line-strong); border-radius: 20px; background: radial-gradient(120% 140% at 0% 0%, rgba(221, 179, 99, 0.12), rgba(20, 24, 23, 0.8) 55%); }
.v-question { margin: 0; font-size: clamp(1.75rem, 5vw, 2.75rem); font-weight: 800; line-height: 1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.v-hint { margin: 0.5rem 0 1.25rem; color: #dcd9cb; }
.v-picks { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; }
.v-pick { display: grid; justify-items: center; gap: 0.25rem; padding: 1rem 0.5rem 0.875rem; border: 1.5px solid var(--dz-line); border-radius: 16px; background: rgba(11, 13, 12, 0.6); color: var(--dz-ink-2); font: inherit; cursor: pointer; }
.v-pick:hover { border-color: var(--dz-line-strong); }
.v-pick[aria-pressed='true'] { border-color: var(--dz-accent); background: rgba(221, 179, 99, 0.12); box-shadow: 0 0 0 1px var(--dz-accent) inset; }
.v-vest { width: min(6.5rem, 100%); }
.v-short { font-size: 1.375rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.v-tier { font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.v-pick[aria-pressed='true'] .v-tier { color: var(--dz-accent); }
.v-track { list-style: none; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.75rem; margin: 0.625rem 0 0; padding: 0; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.v-track li { padding-top: 0.5rem; border-top: 3px solid var(--dz-line-strong); text-align: center; }
.v-track li.is-on { border-color: var(--dz-accent); color: var(--dz-accent); }
.v-track span { font-weight: 700; color: var(--dz-ink-2); }
.v-body { display: grid; gap: 3rem; margin-top: 2.5rem; scroll-margin-top: 1rem; }
.v-next { display: grid; grid-template-columns: 5rem minmax(0, 1fr); gap: 1.25rem; align-items: center; padding: 1.25rem 1.5rem; border: 1px dashed var(--dz-line-strong); border-radius: 18px; background: rgba(20, 24, 23, 0.6); }
.v-next-vest { width: 5rem; }
.v-next-tag { margin: 0; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.v-next-title { margin: 0.125rem 0 0.375rem; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.v-next-pitch { margin: 0 0 0.875rem; color: #dcd9cb; }
.v-empty { margin: 2rem 0 0; color: var(--dz-muted); }
.v-link { padding: 0; border: 0; background: none; color: var(--dz-ink); font: inherit; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
@media (max-width: 599px) {
  .v-ask { padding: 1.125rem 1rem; }
  .v-picks { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
  .v-vest { width: 4.5rem; }
  .v-track { display: none; }
  .v-next { grid-template-columns: 3.5rem minmax(0, 1fr); padding: 1rem; gap: 0.875rem; }
  .v-next-vest { width: 3.5rem; }
}
</style>
