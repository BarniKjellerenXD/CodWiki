<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelConfidenceLabel, DMZ_INTEL_CHECKED } from '#shared/dmz-intel.mjs'
import { printerRecipes, recipeMaterials, recipeUnlock, recipeName, sumMaterials, intelEntry, PRINT_MAX } from '#shared/dmz-stations.mjs'

// 3D Printer station: every recipe with its materials, and a planner that adds
// up what to loot for the prints you pick. The plan stays on this device.
const icon = dmzStations.find(station => station.id === 'printer')!.icon
const { state, saveError, prints, change, clear } = useDmzPrinter()
const query = ref('')
const guides = dmzIntel.filter(entry => entry.category === 'crafting' && !printerRecipes.includes(entry))
const shown = computed(() => {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  return printerRecipes.filter(entry => words.every(word => `${entry.name} ${recipeMaterials(entry).map(item => item.name).join(' ')} ${recipeUnlock(entry) || ''}`.toLowerCase().includes(word)))
})
const planned = computed(() => Object.entries(state.value.plan).filter(([, count]) => count > 0))
const totals = computed(() => sumMaterials(state.value.plan))
const rarityClass = (rarity?: string) => `is-${(rarity || 'unknown').toLowerCase()}`
const nameOf = (id: string) => recipeName(intelEntry(id)!)

// On phones the totals sit above the list; while they are off screen, a bar
// above the dock keeps count and jumps back to them.
const planPanel = ref<HTMLElement>()
const planInView = ref(true)
const printCount = computed(() => planned.value.reduce((sum, [, count]) => sum + count, 0))
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(([item]) => { planInView.value = !!item?.isIntersecting })
  if (planPanel.value) observer.observe(planPanel.value)
})
onBeforeUnmount(() => observer?.disconnect())
function showPlan() {
  planPanel.value?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="3D Printer" :icon="icon" :checked="DMZ_INTEL_CHECKED" :status="`${printerRecipes.length} recipes · plan saved on this device`">
      <p class="dz-lede">Pick what you want to print and the planner adds up the materials to bring home. Recipes are still settling after launch, so check each one's label.</p>
    </DmzPageHead>
    <DmzIntelNav />

    <div class="pr">
      <div class="pr-main">
        <label class="dz-search pr-search">
          <span class="sr-only">Filter recipes</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
          <input v-model="query" type="search" placeholder="Filter by recipe or material, such as Rigid Synthetics" autocomplete="off" spellcheck="false">
        </label>
        <p class="pr-count dmz-mono" role="status">{{ shown.length }} of {{ printerRecipes.length }} recipes</p>
        <ul class="pr-list">
          <li v-for="entry in shown" :key="entry.id" class="pr-recipe" :class="{ 'is-planned': prints(entry.id) }" :data-intel="entry.id">
            <div class="pr-recipe-main">
              <DmzIntelLink :id="entry.id" class="pr-name">
                <span class="w-semi">{{ recipeName(entry) }}</span>
                <span class="dz-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}</span>
              </DmzIntelLink>
              <p class="pr-unlock dmz-mono">{{ recipeUnlock(entry) || 'Unlock not reported' }}</p>
              <ul v-if="recipeMaterials(entry).length" class="pr-mats" :aria-label="`${recipeName(entry)} materials`">
                <li v-for="item in recipeMaterials(entry)" :key="item.name" class="pr-mat" :class="rarityClass(item.rarity)"><span class="dmz-mono">{{ item.amount }}</span> {{ item.name }}</li>
              </ul>
              <p v-else class="pr-unlock dmz-mono">Materials not reported</p>
            </div>
            <div class="pr-step" role="group" :aria-label="`Prints of ${recipeName(entry)}`">
              <button type="button" :disabled="!prints(entry.id)" :aria-label="`One fewer ${recipeName(entry)}`" @click="change(entry.id, -1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg></button>
              <span class="dmz-mono" aria-live="polite">{{ prints(entry.id) }}</span>
              <button type="button" :disabled="prints(entry.id) >= PRINT_MAX || !recipeMaterials(entry).length" :aria-label="`One more ${recipeName(entry)}`" @click="change(entry.id, 1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12 M12 6v12" /></svg></button>
            </div>
          </li>
        </ul>
        <p v-if="!shown.length" class="dz-empty">No recipe uses “{{ query.trim() }}”.</p>

        <section class="dz-group" aria-labelledby="pr-guides">
          <header class="dz-group-head">
            <h2 id="pr-guides" class="dz-h2">How the printer works</h2>
          </header>
          <ul class="dz-rows">
            <li v-for="entry in guides" :key="entry.id"><DmzIntelRow :entry="entry" summary /></li>
          </ul>
        </section>
      </div>

      <aside ref="planPanel" class="pr-plan dmz-panel" aria-labelledby="pr-plan">
        <h2 id="pr-plan" class="dmz-label dmz-mono">Loot for this run</h2>
        <p v-if="!planned.length" class="pr-plan-empty">Add recipes with + to see the materials to bring home.</p>
        <template v-else>
          <p class="pr-plan-for">{{ planned.map(([id, n]) => `${n}× ${nameOf(id)}`).join(' · ') }}</p>
          <ul class="pr-totals">
            <li v-for="item in totals" :key="item.name" :class="rarityClass(item.rarity)">
              <span class="pr-total-name">{{ item.name }}<small v-if="item.rarity && item.rarity !== 'Resource'" class="dmz-mono">{{ item.rarity }}</small></span>
              <span class="dmz-mono pr-total-n">{{ item.amount }}</span>
            </li>
          </ul>
          <button type="button" class="dmz-pill dmz-pill--ghost pr-clear" @click="clear">Clear plan</button>
        </template>
        <p class="pr-plan-note">Resources come from breaking down loot. Ingredients stay whole and must be extracted.</p>
        <p class="pr-plan-note">The plan stays in this browser. It is not linked to your game account.</p>
        <p v-if="saveError" class="dmz-note" role="alert">This browser blocked saving, so the plan will reset when you leave the page.</p>
      </aside>
    </div>

    <button v-if="planned.length && !planInView" type="button" class="pr-peek" @click="showPlan">
      <span class="w-semi">{{ printCount }} print{{ printCount === 1 ? '' : 's' }} · {{ totals.length }} material{{ totals.length === 1 ? '' : 's' }}</span>
      <span class="dmz-mono">Totals <span aria-hidden="true">↑</span></span>
    </button>
  </div>
</template>

<style scoped>
.pr { display: grid; grid-template-columns: minmax(0, 1fr) 18rem; align-items: start; gap: 1.5rem; margin-top: 1.5rem; }
.pr-search { max-width: 34rem; }
.pr-count { margin: 0.75rem 0 0.5rem 1.125rem; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.pr-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.pr-recipe { display: flex; align-items: center; gap: 1rem; padding: 0.625rem 0.75rem 0.625rem 1rem; background: rgba(20, 24, 23, 0.78); border: 1px solid var(--dz-line); border-radius: 14px; }
.pr-recipe.is-planned { border-color: rgba(169, 217, 138, 0.55); box-shadow: inset 3px 0 var(--dz-green); }
.pr-recipe:has(.pr-name.is-open) { border-color: var(--dz-accent); }
.pr-recipe-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.pr-name { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.625rem; align-self: flex-start; min-height: 2.75rem; color: #f3f1e5 !important; font-size: 1.125rem; text-decoration: none; }
.pr-name:hover .w-semi { text-decoration: underline; text-underline-offset: 0.2em; }
.pr-unlock { margin: 0; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.pr-mats { list-style: none; margin: 0.125rem 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.25rem; }
.pr-mat { padding: 0.125rem 0.5rem; border: 1px solid var(--dz-line-strong); border-radius: 6px; font-size: 0.875rem; color: #e3e0d0; }
.pr-mat .dmz-mono { font-weight: 700; color: #fff; }
.is-uncommon { border-color: rgba(169, 217, 138, 0.55) !important; }
.is-rare { border-color: rgba(159, 216, 207, 0.7) !important; }
.is-epic, .is-legendary, .is-ultra { border-color: rgba(221, 179, 99, 0.7) !important; }
.is-unknown { border-style: dashed !important; }
.pr-step { flex: none; display: flex; align-items: center; gap: 0.25rem; }
.pr-step button { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border: 1px solid var(--dz-line-strong); border-radius: 50%; background: rgba(10, 12, 11, 0.3); color: var(--dz-ink); cursor: pointer; }
.pr-step button:hover:not(:disabled) { border-color: var(--dz-ink); }
.pr-step button:disabled { opacity: 0.35; cursor: default; }
.pr-step svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; }
.pr-step .dmz-mono { min-width: 1.5rem; text-align: center; font-weight: 700; }
.pr-plan { position: sticky; top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.pr-plan h2 { margin: 0; }
.pr-plan p { margin: 0; font-size: 0.95rem; color: #dcd9cb; }
.pr-plan-for { color: #f3f1e5 !important; }
.pr-totals { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
.pr-totals li { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.375rem 0.625rem; border: 1px solid var(--dz-line); border-radius: 8px; background: rgba(10, 12, 11, 0.35); }
.pr-total-name { display: flex; flex-direction: column; font-size: 0.95rem; }
.pr-total-name small { font-size: 0.625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.pr-total-n { font-size: 1.125rem; font-weight: 700; }
.pr-clear { align-self: flex-start; min-height: 2.75rem; font-size: 0.9rem; }
.pr-plan-note { font-size: 0.85rem !important; color: var(--dz-muted) !important; }
.pr-peek { display: none; }
@media (max-width: 899px) {
  .pr { grid-template-columns: minmax(0, 1fr); }
  .pr-plan { position: static; order: -1; scroll-margin-top: 1rem; }
  /* Ends before the site's back-to-top button. */
  .pr-peek { position: fixed; left: 1rem; right: 4.5rem; bottom: calc(var(--dz-dock) + 1.25rem + env(safe-area-inset-bottom)); z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; min-height: 3rem; padding: 0 1rem; border: 1px solid rgba(169, 217, 138, 0.55); border-radius: 14px; background: rgba(20, 28, 22, 0.94); box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45); color: var(--dz-ink); font: inherit; cursor: pointer; }
  .pr-peek .dmz-mono { font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-green-ink); }
  .pr-recipe { align-items: flex-start; }
}
</style>
