<script setup lang="ts">
import { dmzIntel, intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { labRecipes, recipeMaterials, recipeUnlock, sumMaterials } from '#shared/dmz-lab.mjs'

// 3D Printer station: recipes with their materials and a print planner.
// The plan lives on this page only; a real station would save it.
type Entry = (typeof dmzIntel)[number]
const emit = defineEmits<{ open: [entry: Entry] }>()
const query = ref('')
const plan = ref<Record<string, number>>({ 'medkit-recipe': 1, 'medium-backpack-recipe': 1 })
const guides = dmzIntel.filter(entry => entry.category === 'crafting' && !labRecipes.includes(entry))
const shown = computed(() => {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  return labRecipes.filter(entry => words.every(word => `${entry.name} ${recipeMaterials(entry).map(item => item.name).join(' ')} ${recipeUnlock(entry) || ''}`.toLowerCase().includes(word)))
})
const totals = computed(() => sumMaterials(plan.value))
const planned = computed(() => Object.entries(plan.value).filter(([, count]) => count > 0))
const count = (id: string) => plan.value[id] || 0
function change(id: string, delta: number) {
  plan.value = { ...plan.value, [id]: Math.max(0, Math.min(9, count(id) + delta)) }
}
const rarityClass = (rarity?: string) => `is-${(rarity || 'unknown').toLowerCase()}`
const nameOf = (id: string) => dmzIntel.find(entry => entry.id === id)?.name.replace(/ recipe$/i, '')
</script>

<template>
  <div class="pr">
    <div class="pr-main">
      <label class="lab-search pr-search">
        <span class="sr-only">Filter recipes</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
        <input v-model="query" type="search" placeholder="Filter by recipe or material, such as Rigid Synthetics" autocomplete="off" spellcheck="false">
      </label>
      <p class="pr-count dmz-mono" role="status">{{ shown.length }} of {{ labRecipes.length }} recipes</p>
      <ul class="pr-list">
        <li v-for="entry in shown" :key="entry.id" class="pr-recipe" :class="{ 'is-planned': count(entry.id) }">
          <div class="pr-recipe-main">
            <button type="button" class="pr-name" @click="emit('open', entry)">
              <span class="w-semi">{{ entry.name.replace(/ recipe$/i, '') }}</span>
              <span class="lab-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}</span>
            </button>
            <p class="pr-unlock dmz-mono">{{ recipeUnlock(entry) || 'Unlock not reported' }}</p>
            <ul class="pr-mats" :aria-label="`${entry.name} materials`">
              <li v-for="item in recipeMaterials(entry)" :key="item.name" class="pr-mat" :class="rarityClass(item.rarity)"><span class="dmz-mono">{{ item.amount }}</span> {{ item.name }}</li>
            </ul>
          </div>
          <div class="pr-step" role="group" :aria-label="`Prints of ${entry.name}`">
            <button type="button" :disabled="!count(entry.id)" :aria-label="`One fewer ${entry.name}`" @click="change(entry.id, -1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg></button>
            <span class="dmz-mono" aria-live="polite">{{ count(entry.id) }}</span>
            <button type="button" :aria-label="`One more ${entry.name}`" @click="change(entry.id, 1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12 M12 6v12" /></svg></button>
          </div>
        </li>
      </ul>
      <p v-if="!shown.length" class="lab-empty">No recipe uses “{{ query.trim() }}”.</p>

      <section class="pr-guides" aria-labelledby="pr-guides">
        <h3 id="pr-guides" class="lab-h2">How the printer works</h3>
        <ul>
          <li v-for="entry in guides" :key="entry.id"><DmzLabRow :entry="entry" summary @open="emit('open', $event)" /></li>
        </ul>
      </section>
    </div>

    <aside class="pr-plan dmz-panel" aria-labelledby="pr-plan">
      <span id="pr-plan" class="dmz-label dmz-mono">Loot for this run</span>
      <p v-if="!planned.length" class="pr-plan-empty">Add recipes with + to see the materials to bring home.</p>
      <template v-else>
        <p class="pr-plan-for">{{ planned.map(([id, n]) => `${n}× ${nameOf(id)}`).join(' · ') }}</p>
        <ul class="pr-totals">
          <li v-for="item in totals" :key="item.name" :class="rarityClass(item.rarity)">
            <span class="pr-total-name">{{ item.name }}<small v-if="item.rarity && item.rarity !== 'Resource'" class="dmz-mono">{{ item.rarity }}</small></span>
            <span class="dmz-mono pr-total-n">{{ item.amount }}</span>
          </li>
        </ul>
        <button type="button" class="dmz-pill dmz-pill--ghost pr-clear" @click="plan = {}">Clear plan</button>
      </template>
      <p class="pr-plan-note">Resources come from breaking down loot. Ingredients stay whole and must be extracted.</p>
    </aside>
  </div>
</template>

<style scoped>
.pr { display: grid; grid-template-columns: minmax(0, 1fr) 18rem; align-items: start; gap: 1.5rem; }
.pr-count { margin: 0.75rem 0 0.5rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.pr-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.pr-recipe { display: flex; align-items: center; gap: 1rem; padding: 0.625rem 0.75rem 0.625rem 1rem; background: rgba(20, 24, 23, 0.78); border: 1px solid var(--dz-line); border-radius: 14px; }
.pr-recipe.is-planned { border-color: rgba(169, 217, 138, 0.55); box-shadow: inset 3px 0 var(--dz-green); }
.pr-recipe-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.pr-name { display: inline-flex; align-items: center; gap: 0.625rem; align-self: flex-start; min-height: 2.25rem; padding: 0; border: 0; background: none; color: #f3f1e5; font: inherit; font-size: 1.125rem; text-align: left; cursor: pointer; }
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
.pr-guides { margin-top: 2rem; }
.pr-guides ul { list-style: none; margin: 0.75rem 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 0.375rem; }
.pr-plan { position: sticky; top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.pr-plan p { margin: 0; font-size: 0.95rem; color: #dcd9cb; }
.pr-plan-for { color: #f3f1e5 !important; }
.pr-totals { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
.pr-totals li { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.375rem 0.625rem; border: 1px solid var(--dz-line); border-radius: 8px; background: rgba(10, 12, 11, 0.35); }
.pr-total-name { display: flex; flex-direction: column; font-size: 0.95rem; }
.pr-total-name small { font-size: 0.625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.pr-total-n { font-size: 1.125rem; font-weight: 700; }
.pr-clear { align-self: flex-start; min-height: 2.75rem; font-size: 0.9rem; }
.pr-plan-note { font-size: 0.85rem !important; color: var(--dz-muted) !important; }
@media (max-width: 899px) {
  .pr { grid-template-columns: 1fr; }
  .pr-plan { position: static; order: -1; }
  .pr-recipe { align-items: flex-start; }
}
</style>
