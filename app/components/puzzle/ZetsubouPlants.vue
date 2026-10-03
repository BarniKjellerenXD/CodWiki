<script setup>
import { plantPlan, plantRecipes, plantWaters, plantSupplies, plantPlanter } from '~/utils/bo3.mjs'

const props = defineProps({ state: { type: Object, required: true } })
const emit = defineEmits(['change'])
const uid = useId()
const selectedWater = ref('')
const plan = computed(() => plantPlan(props.state))
const waterColour = computed(() => selectedWater.value || plan.value.recipe?.water[0] || 'Blue')
const waterReference = computed(() => plantWaters[waterColour.value])
const hasCare = computed(() => [0, 1, 2].some(i => props.state[`water-${i}`] || props.state[`shot-${i}`]))
const invalidRound = computed(() => Boolean(props.state.planted) && plan.value.round === null)

function chooseRecipe(event) {
  selectedWater.value = ''
  emit('change', 'goal', event.target.value)
}
function waterInstruction(i) {
  if (props.state.goal === 'fruit') return 'Use a different colour each round: blue, green and purple, in any order.'
  return `Water once with ${plan.value.recipe.water[i].toLowerCase()} water.`
}
</script>

<template>
  <div class="plant-planner">
    <div class="plant-fields">
      <label :for="`${uid}-goal`">What do you need to grow?
        <select :id="`${uid}-goal`" :value="state.goal" @change="chooseRecipe">
          <option value="">Choose a plant recipe…</option>
          <optgroup label="Main quest & wonder weapon">
            <option v-for="id in ['flak', 'masamune']" :key="id" :value="id">{{ plantRecipes[id].name }}</option>
          </optgroup>
          <optgroup label="Trials & optional rewards">
            <option v-for="id in ['fruit', 'holder', 'killer', 'imprint']" :key="id" :value="id">{{ plantRecipes[id].name }}</option>
          </optgroup>
        </select>
      </label>
      <div>
        <label :for="`${uid}-round`">Round you planted the seed <span class="plant-muted">(optional)</span>
          <input :id="`${uid}-round`" type="text" inputmode="numeric" maxlength="3" placeholder="e.g. 8" :value="state.planted" :aria-invalid="invalidRound" :aria-describedby="`${uid}-round-hint`" @input="emit('change', 'planted', $event.target.value)" />
        </label>
        <small :id="`${uid}-round-hint`">{{ invalidRound ? 'Enter a whole round from 1 to 999.' : 'Add this to number the rounds in your care plan.' }}</small>
      </div>
    </div>

    <div v-if="plan.recipe" class="plant-recipe">
      <p>{{ plan.recipe.purpose }}</p>
      <p><strong>Bring:</strong> {{ plan.recipe.needs }}</p>
      <p><strong>Plant here:</strong> {{ plan.recipe.place }}</p>
      <NuxtLink v-if="plan.recipe.link" :to="`/guides/bo3-zetsubou-no-shima#details-${plan.recipe.link.anchor}`">{{ plan.recipe.link.label }} →</NuxtLink>
    </div>

    <details :open="!state.goal" class="plant-basics">
      <summary>New to plants? Start here · seed, bucket & planter photos</summary>
      <div class="plant-supplies">
        <div v-for="supply in plantSupplies" :key="supply.name" class="plant-supply">
          <img :src="supply.image.src" :alt="supply.image.alt" width="72" height="72" />
          <div><strong>{{ supply.name }}</strong><p>{{ supply.instruction }}</p></div>
        </div>
      </div>
      <p>Once the seed is planted, interact with it to water it. Care for the <strong>same plant once on the planting round and once on each of the next two rounds</strong>. Three waterings in one round do not count as three rounds.</p>
      <p>For recipes that use KT-4, shoot the plant after watering on each of those rounds. Harvest on the following round. For example: plant and care on rounds <strong>8, 9 and 10 → harvest on 11</strong>.</p>
      <GuideIllustrations :images="[plantPlanter]" />
    </details>

    <details open class="plant-water">
      <summary>Where to find water · photos & directions</summary>
      <label :for="`${uid}-water-location`">Water to locate
        <select :id="`${uid}-water-location`" :value="waterColour" @change="selectedWater = $event.target.value">
          <option v-for="(water, colour) in plantWaters" :key="colour" :value="colour">{{ colour }} · {{ water.location }}</option>
        </select>
      </label>
      <div class="plant-water-content">
        <div>
          <h3>{{ waterColour }} water</h3>
          <p class="plant-landmark">{{ waterReference.location }}</p>
          <ol><li v-for="instruction in waterReference.directions" :key="instruction">{{ instruction }}</li></ol>
          <p class="plant-muted">{{ waterColour === 'Rainbow' ? 'Used for the special underwater Masamune plant.' : 'Refill at the pool whenever your bucket runs out. Filling it at another pool changes the water colour.' }}</p>
        </div>
        <GuideIllustrations :images="waterReference.images" />
      </div>
    </details>

    <section v-if="plan.recipe" :aria-labelledby="`${uid}-care-title`" class="plant-schedule">
      <h3 :id="`${uid}-care-title`">Your three-round care plan</h3>
      <p>Do the actions in-game, then fill in the log. Keep caring for the same plant on consecutive rounds.</p>
      <p v-if="hasCare" class="plant-muted">Changing recipes keeps this log for comparison. Use Clear observations below when starting a new plant.</p>
      <div class="plant-care">
        <fieldset v-for="i in [0, 1, 2]" :key="i">
          <legend>{{ plan.round === null ? ['Planting round', 'Next round', 'One round later'][i] : `Round ${plan.round + i}` }}</legend>
          <p v-if="i === 0"><strong>Plant your seed.</strong></p>
          <p>{{ waterInstruction(i) }}</p>
          <p v-if="plan.recipe.shots"><strong>Then shoot the plant</strong> with KT-4 or Masamune.</p>
          <p v-else>{{ state.goal === 'masamune' ? 'Use the revealed underwater planter. No KT-4 shot is needed.' : 'Do not shoot it with KT-4 or Masamune for this recipe.' }}</p>
          <div class="plant-log">
            <label :for="`${uid}-water-${i}`">Water I used
              <select :id="`${uid}-water-${i}`" :value="state[`water-${i}`]" @change="emit('change', `water-${i}`, $event.target.value)">
                <option value="">Not recorded yet</option>
                <option v-for="colour in Object.keys(plantWaters)" :key="colour">{{ colour }}</option>
              </select>
            </label>
            <label v-if="plan.recipe.shots || state[`shot-${i}`]" class="plant-check">
              <input type="checkbox" :checked="state[`shot-${i}`]" @change="emit('change', `shot-${i}`, $event.target.checked)" />
              {{ plan.recipe.shots ? 'I shot it after watering' : 'KT-4 / Masamune shot recorded' }}
            </label>
          </div>
        </fieldset>
      </div>
      <p class="plant-harvest"><strong>{{ plan.harvest === null ? 'Harvest on the next round' : `Harvest on round ${plan.harvest}` }}</strong> · after all three care rounds.</p>
      <p class="plant-result" :class="plan.status" role="status">{{ plan.message }}</p>
      <p class="plant-muted">{{ state.goal === 'masamune' ? 'Return to the hidden underwater planter to collect this ingredient. Refill Rainbow water if your bucket runs out.' : 'This log follows one plant. You can care for several plants at once to improve your chances of a random reward. If you miss a care round, start a fresh seed for this recipe.' }}</p>
    </section>
  </div>
</template>

<style scoped>
.plant-planner{min-width:0;font:inherit;color:var(--text);line-height:1.6}
.plant-planner p{margin:.65rem 0 1rem}.plant-planner h3{font-size:1.05rem;font-weight:650;margin:1rem 0 .4rem}
.plant-fields{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.plant-planner label{display:block;font-size:.88rem}
.plant-planner select,.plant-planner input[type=text]{display:block;width:100%;min-width:0;min-height:44px;margin-top:.35rem;padding:.7rem;border:1px solid var(--line-strong,var(--line));border-radius:6px;background:var(--surface);color:var(--text);font:inherit}
.plant-planner input[aria-invalid=true]{border-color:#db9868}.plant-planner small,.plant-muted{font-size:.78rem;color:var(--muted)}.plant-planner small{display:block;margin-top:.35rem}
.plant-planner :is(select,input,summary,a):focus-visible{outline:2px solid var(--gold);outline-offset:3px}.plant-planner a{color:var(--gold);text-decoration:underline;text-underline-offset:3px}
.plant-recipe{margin:1rem 0 1.5rem}.plant-recipe p{margin:.5rem 0}.plant-recipe a{font-size:.85rem}
.plant-planner details{border-top:1px solid var(--line);margin:1rem 0}.plant-planner summary{cursor:pointer;min-height:44px;padding:.7rem 0;color:var(--gold)}
.plant-supplies{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin:1rem 0}.plant-supply{display:flex;align-items:flex-start;gap:.65rem}.plant-supply img{object-fit:contain;flex:none}.plant-supply p{margin:.35rem 0;font-size:.85rem}
.plant-basics :deep(.guide-illustrations){max-width:34rem}
.plant-water-content{display:grid;grid-template-columns:1fr 1.2fr;gap:1.5rem;align-items:start}.plant-landmark{color:var(--muted);font-size:.85rem}.plant-water-content ol{list-style:decimal;padding-left:1.2rem;margin:.75rem 0}.plant-water-content li{padding:.2rem 0}.plant-water-content :deep(.guide-illustrations){grid-template-columns:1fr}
.plant-schedule{margin-top:1.75rem}.plant-care{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}.plant-care fieldset{border:1px solid var(--line);border-radius:8px;padding:1rem;min-width:0;display:flex;flex-direction:column;margin:.5rem 0}.plant-care legend{font-weight:650;padding:0 .35rem}.plant-care p{font-size:.85rem;margin:.35rem 0 .6rem}.plant-log{border-top:1px solid var(--line);padding-top:.8rem;margin-top:auto}
.plant-planner .plant-check{display:flex!important;flex-direction:row;justify-content:flex-start;align-items:center;gap:.5rem;margin-top:.4rem;min-height:44px;font-size:.8rem!important}.plant-check input{width:1.1rem;height:1.1rem;flex:none;accent-color:var(--gold)}
.plant-harvest{color:var(--gold)}.plant-result{padding:.85rem 1rem;background:var(--surface-2);border-left:3px solid var(--line-strong,var(--line));overflow-wrap:anywhere}.plant-result.ready{border-color:var(--gold)}.plant-result.invalid{border-color:#db9868}
@media(max-width:760px){.plant-water-content{grid-template-columns:1fr;gap:0}.plant-supplies{grid-template-columns:1fr}.plant-care{grid-template-columns:1fr}.plant-care fieldset{margin:.2rem 0}.plant-fields{grid-template-columns:1fr}.plant-water-content :deep(.guide-illustrations){margin-top:0}.plant-supply img{width:56px;height:56px}}
</style>
