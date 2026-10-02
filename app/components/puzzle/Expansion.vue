<script setup lang="ts">
import { toolDefinitions, evaluateTool, dartNumbers, iceLabels } from '~/utils/expansionTools.mjs'
const props = defineProps<{ tool: string }>()
const definition = toolDefinitions[props.tool]
const { state, change, undo, reset, canUndo, saveError } = usePuzzleState(props.tool)
const result = computed(() => evaluateTool(props.tool, state.value))
const confirmReset = ref(false)
const activeDart = ref(0)
const search = ref('')
const optionsFor = (field:any) => !definition.searchable ? field.options : field.options.filter((option:string)=>option===state.value[field.id] || option.toLowerCase().includes(search.value.toLowerCase()))
function update(id: string, value: string | boolean) { change({ ...state.value, [id]: value }) }
function input(event: Event, id: string) { update(id, (event.target as HTMLInputElement).value) }
function chooseSector(index: number) { update(`slot-${activeDart.value}`, String(index + 1)); activeDart.value = (activeDart.value + 1) % 3 }
</script>
<template>
  <div class="puzzle expansion-tool">
    <p class="helper-kind">{{ definition.kind }}</p>
    <p class="helper-help">{{ definition.help }}</p>
    <label v-if="definition.searchable" class="reference-search">Search clues<input v-model="search" type="search" placeholder="For example: cages" /></label>
    <div v-if="definition.visual === 'ice'" class="glyph-choices"><button v-for="(label,index) in iceLabels" :key="label" :aria-pressed="state.pattern===label" :aria-label="label" @click="update('pattern',label)"><PuzzleOriginsGlyph :value="index" :label="label" /><span>{{ label }}</span></button></div>
    <div v-if="definition.visual === 'dartboard'" class="dart-controls">
      <label>Recording observation <select v-model.number="activeDart"><option v-for="n in 3" :key="n" :value="n - 1">{{ n }}</option></select></label>
      <div class="dartboard" aria-label="Computer sectors clockwise from top">
        <button v-for="(number, index) in dartNumbers" :key="number" :style="{ left: `${50 + 41 * Math.sin(index * Math.PI / 10)}%`, top: `${50 - 41 * Math.cos(index * Math.PI / 10)}%` }" :aria-label="`Sector ${index + 1}, dartboard number ${number}`" @click="chooseSector(index)">{{ number }}</button>
      </div>
    </div>
    <div v-if="definition.visual !== 'ice'" class="observation-grid">
      <label v-for="field in definition.fields.filter((field:any) => !field.hidden)" :key="field.id" :class="{ 'check-field': field.type === 'check' }">
        <input v-if="field.type === 'check'" type="checkbox" :checked="state[field.id]" @change="update(field.id, ($event.target as HTMLInputElement).checked)">
        <span>{{ field.label }}</span>
        <PuzzleOriginsGlyph v-if="field.glyph !== undefined" :value="field.glyph" :label="field.label" />
        <select v-if="field.options" :value="state[field.id]" @change="input($event, field.id)"><option value="">Not recorded</option><option v-for="option in optionsFor(field)" :key="option" :value="option">{{ option }}</option></select>
        <input v-else-if="field.type !== 'check'" :value="state[field.id]" :maxlength="field.maxLength || 80" :inputmode="field.inputmode || 'text'" autocomplete="off" spellcheck="false" placeholder="Not recorded" @input="input($event, field.id)">
      </label>
    </div>
    <div class="helper-result" :class="result.status" role="status" aria-live="polite"><strong>{{ result.message }}</strong><ol v-if="result.lines.length"><li v-for="(line, index) in result.lines" :key="index">{{ line }}</li></ol></div>
    <PuzzleOriginsGlyph v-if="definition.visual==='ice' && result.status==='ready'" :value="iceLabels.indexOf(state.pattern)" mode="rune" :label="result.lines[0]" />
    <a v-if="definition.reference" :href="definition.reference" target="_blank" rel="noopener noreferrer" class="source-link">Open source reference ↗</a>
    <div class="helper-actions"><button class="companion-button" :disabled="!canUndo" @click="undo">Undo</button><button class="companion-button" @click="confirmReset = !confirmReset">Reset helper</button></div>
    <div v-if="confirmReset" class="helper-result"><p>Clear this helper’s observations? Guide progress stays saved.</p><button class="companion-button" @click="reset(); confirmReset = false">Clear observations</button><button class="companion-button" @click="confirmReset = false">Keep observations</button></div>
    <p v-if="saveError" role="alert">Your browser could not save these observations. Keep this page open.</p>
  </div>
</template>
<style scoped>
.glyph-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:.6rem}.glyph-choices button{background:var(--surface-2);border:1px solid var(--line);border-radius:8px;color:var(--text);padding:.5rem;cursor:pointer}.glyph-choices button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-dim)}.glyph-choices span{font-size:.75rem}.reference-search{display:flex;flex-direction:column;gap:.5rem}.reference-search input{padding:.75rem;border:1px solid var(--line);background:var(--surface-2);color:var(--text);border-radius:6px}
.expansion-tool{color:var(--text);padding:.5rem 0}.helper-kind{text-transform:uppercase;letter-spacing:.12em;font-size:.7rem;color:var(--gold)}.helper-help{line-height:1.7;max-width:70ch}.observation-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin:1.25rem 0}.observation-grid label{display:flex;flex-direction:column;gap:.45rem;font-size:.85rem}.observation-grid input,.observation-grid select,.dart-controls select{width:100%;min-height:44px;border:1px solid var(--line);border-radius:6px;background:var(--surface-2);color:var(--text);padding:.6rem}.observation-grid .check-field{flex-direction:row;align-items:center;border:1px solid var(--line);padding:.75rem;border-radius:6px}.check-field input{width:20px;min-height:20px;accent-color:var(--gold)}.helper-result{border-left:3px solid var(--gold);padding:.8rem 1rem;background:var(--surface-2);margin:1rem 0;overflow-wrap:anywhere}.helper-result li{margin:.4rem 0}.helper-result.invalid{border-color:var(--muted)}.helper-actions{display:flex;gap:.6rem;flex-wrap:wrap}.source-link{display:inline-block;color:var(--gold);margin-bottom:1rem}.dartboard{position:relative;width:300px;max-width:100%;aspect-ratio:1;margin:1rem auto;border:1px solid var(--line);border-radius:50%;background:var(--surface-2)}.dartboard button{position:absolute;transform:translate(-50%,-50%);width:36px;height:36px;border:1px solid var(--line);border-radius:50%;background:var(--surface);color:var(--gold);cursor:pointer}.dartboard button:hover{border-color:var(--gold)}
</style>
