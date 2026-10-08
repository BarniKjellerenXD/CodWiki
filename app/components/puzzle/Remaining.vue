<script setup lang="ts">
import { toolDefinitions, evaluateTool } from '~/utils/expansionTools.mjs'
import { changeObservation, clearScope, groupVisible } from '~/utils/remainingUi.mjs'
const props = defineProps<{ tool: string }>()
const definition: any = toolDefinitions[props.tool]
const { state, change, undo, reset, canUndo, saveError } = usePuzzleState(props.tool)
const result = computed(() => evaluateTool(props.tool, state.value))
const pendingReset = ref<any>(null)
const fields = new Map(definition.fields.map((field: any) => [field.id, field]))
const groups = computed(() => {
  const authored = definition.groups || []
  const assigned = new Set(authored.flatMap((group: any) => group.fields))
  const ungrouped = definition.fields.filter((field: any) => !field.hidden && !assigned.has(field.id))
  return [...authored, ...(ungrouped.length ? [{ id: 'observations', title: authored.length ? 'Other observations' : 'Observations', fields: ungrouped.map((field: any) => field.id) }] : [])].filter((group: any) => groupVisible(group, state.value))
})
const references = computed(() => definition.images || (Array.isArray(definition.reference) ? definition.reference : []))
const source = computed(() => typeof definition.reference === 'string' ? definition.reference : definition.source)
const sequence = computed(() => definition.sequence || (definition.layout?.type === 'sequence' ? { fields: definition.fields.filter((f: any) => f.id.startsWith(definition.layout.sequencePrefix + '-')).map((f: any) => f.id), options: ['Red', 'Green', 'Blue', 'Yellow'], label: 'Record the next flash' } : null))
const sequenceGroup = (group: any) => sequence.value && group.fields.every((id:string) => sequence.value.fields.includes(id))
const resetScopes = computed(() => (definition.resetScopes || []).filter((scope:any) => groupVisible(scope, state.value)))
function update(id: string, value: string | boolean) { change(changeObservation(definition, state.value, id, value)) }
function append(value: string) { const id = sequence.value.fields.find((id: string) => !state.value[id]); if (id) update(id, value) }
function morse(value: string) { const id = definition.layout.field; update(id, ((state.value[id] || '') + value).slice(0, fields.get(id)?.maxLength || 80)) }
function confirmClear() { if (pendingReset.value === 'all') reset(); else change(clearScope(definition, state.value, pendingReset.value)); pendingReset.value = null }
const board = computed(() => result.value.board)
</script>
<template>
  <div class="puzzle remaining-tool">
    <p class="helper-help">{{ definition.help }}</p>
    <details v-if="references.length" class="tool-reference"><summary>Open illustrated reference</summary><GuideIllustrations :images="references" /></details>
    <div v-if="definition.layout?.type === 'morse'" class="pulse-controls" role="group" aria-label="Record Morse pulses"><button class="companion-button" @click="morse('.')">Short ·</button><button class="companion-button" @click="morse('-')">Long −</button><button class="companion-button" @click="morse(' / ')">Next digit /</button></div>
    <component :is="group.collapsible ? 'details' : 'fieldset'" v-for="group in groups" :key="group.id" class="observation-group">
      <component :is="group.collapsible ? 'summary' : 'legend'">{{ group.title }}</component><p v-if="group.help">{{ group.help }}</p>
      <template v-if="sequenceGroup(group)">
        <div class="sequence-controls"><p>{{ sequence.label || 'Record the next flash' }} · {{ sequence.fields.filter((id: string) => state[id]).length }}/{{ sequence.fields.length }}</p><div role="group" aria-label="Append observed flash"><button v-for="value in sequence.options" :key="value" class="companion-button" :disabled="sequence.fields.every((id:string) => state[id])" @click="append(value)">{{ value }}</button></div></div>
        <div class="recorded-sequence" aria-label="Recorded flashes in order"><template v-for="(id,index) in sequence.fields" :key="id"><span v-if="state[id]">{{ index + 1 }} · {{ state[id] }}</span></template><p v-if="!sequence.fields.some((id:string) => state[id])">Record the first flash.</p></div>
        <details class="sequence-editor"><summary>Edit flash observations</summary><div class="observation-grid"><PuzzleObservationField v-for="id in group.fields" :key="id" :field="fields.get(id)" :state="state" @change="update" /></div></details>
      </template>
      <div v-else class="observation-grid" :class="{ 'handle-grid': definition.layout?.type === 'grid' && ['initial', 'current', 'actions', 'current-actions'].includes(group.id), 'spatial-row': definition.spatial?.fields?.every((id: string) => group.fields.includes(id)), 'pillar-column': definition.layout?.type === 'column' && group.id.startsWith('pillar-') }">
        <PuzzleObservationField v-for="id in group.fields.filter((id: string) => fields.get(id) && !fields.get(id).hidden)" :key="id" :field="fields.get(id)" :state="state" @change="update" />
      </div>
    </component>
    <p v-if="definition.layout?.note" class="layout-note">{{ definition.layout.note }}</p>
    <div class="record-result" :class="result.status" role="status" aria-live="polite"><strong>{{ result.message }}</strong><ol v-if="result.lines.length"><li v-for="(line, index) in result.lines" :key="index">{{ line }}</li></ol><p v-if="result.note">{{ result.note }}</p><p v-for="link in result.links || []" :key="link.href"><NuxtLink :to="link.href">{{ link.label }} →</NuxtLink></p></div>
    <div v-if="board" class="queens-board" role="img" aria-label="Eight queens completion; rows 1 to 8 top to bottom, columns A to H left to right"><div v-for="row in board.size" :key="row" class="queen-row"><span v-for="column in board.size" :key="column" :class="{ light: (row + column) % 2 === 0, queen: board.queens[row - 1] === column - 1, original: board.fixed.row === row - 1 && board.fixed.column === column - 1 }">{{ board.queens[row - 1] === column - 1 ? '♛' : '' }}<small v-if="board.fixed.row === row - 1 && board.fixed.column === column - 1">fixed</small></span></div></div>
    <GuideIllustrations v-if="result.images?.length" :images="result.images" />
    <a v-if="source" :href="source" target="_blank" rel="noopener noreferrer" class="source-link">Original illustrated source ↗</a>
    <p v-if="definition.guidePhase"><NuxtLink :to="`/guides/${definition.map}#details-${definition.guidePhase}`">Open this puzzle’s guide steps →</NuxtLink></p>
    <div class="helper-actions"><button class="companion-button" :disabled="!canUndo" @click="undo">Undo</button><button v-for="(scope, index) in resetScopes" :key="scope.id || index" class="companion-button" @click="pendingReset = scope">{{ scope.label }}</button><button class="companion-button" @click="pendingReset = 'all'">Clear entire helper</button></div>
    <div v-if="pendingReset" class="reset-confirm"><p>{{ pendingReset === 'all' ? 'Clear every observation in this helper?' : pendingReset.label + '?' }} Guide checkboxes and MWZ milestones stay saved. Undo can restore this change.</p><button class="companion-button" @click="confirmClear">Confirm clear</button><button class="companion-button" @click="pendingReset = null">Keep observations</button></div>
    <p v-if="saveError" role="alert">Your browser could not save these observations. Keep this page open.</p>
  </div>
</template>
<style scoped>
.remaining-tool{color:var(--text);padding:.5rem 0;min-width:0}.helper-help{line-height:1.7;max-width:70ch}.observation-group{margin:1.5rem 0;padding:0;border:0;min-width:0}.observation-group legend{font-size:1rem;font-weight:650;margin-bottom:.75rem}.observation-group>p{font-size:.85rem;color:var(--muted);line-height:1.6;margin-top:0}.observation-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:1rem}.handle-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.spatial-row{grid-template-columns:repeat(4,minmax(0,1fr))}.record-result,.reset-confirm{border:1px solid var(--line);border-radius:6px;padding:1rem;background:var(--surface-2);margin:1.25rem 0;overflow-wrap:anywhere}.record-result.ready{border-color:var(--gold)}.record-result li{margin:.5rem 0;line-height:1.6}.helper-actions,.pulse-controls,.sequence-controls>div{display:flex;gap:.5rem;flex-wrap:wrap}.helper-actions button,.pulse-controls button,.sequence-controls button{min-height:44px}.source-link{display:inline-block;color:var(--gold);padding:.5rem 0;margin-bottom:.75rem}.tool-reference summary{cursor:pointer;color:var(--gold);min-height:44px;display:flex;align-items:center;text-decoration:underline}.queens-board{max-width:400px;border:1px solid var(--line);margin:1rem auto}.queen-row{display:grid;grid-template-columns:repeat(8,1fr)}.queen-row>span{display:flex;position:relative;aspect-ratio:1;align-items:center;justify-content:center;font-size:1.7rem;background:var(--surface-3)}.queen-row>span.light{background:var(--surface-2)}.queen-row>span.queen{color:var(--gold)}.queen-row>span.original{outline:2px solid var(--gold);outline-offset:-2px}.queen-row small{position:absolute;bottom:0;font-size:.6rem;color:var(--text)}@media(max-width:600px){.spatial-row{grid-template-columns:repeat(2,minmax(0,1fr))}.handle-grid :deep(select){padding:.3rem;font-size:.7rem}.handle-grid :deep(label){font-size:.7rem}}:is(button,summary,a):focus-visible{outline:2px solid var(--gold);outline-offset:3px}
</style>
<style scoped>
.pillar-column{grid-template-columns:minmax(0,300px)}
.observation-group>summary,.sequence-editor>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;color:var(--gold);text-decoration:underline}.observation-group>summary:focus-visible,.sequence-editor>summary:focus-visible{outline:2px solid var(--gold);outline-offset:3px}.recorded-sequence{display:flex;gap:.5rem;flex-wrap:wrap;margin:.8rem 0}.recorded-sequence span{border:1px solid var(--line);border-radius:4px;padding:.4rem .55rem;font-size:.85rem}.recorded-sequence p{font-size:.85rem;color:var(--muted);margin:.3rem 0}.sequence-editor .observation-grid{margin-top:.75rem}
.helper-actions button{white-space:normal;text-align:left;max-width:100%;overflow-wrap:anywhere}
@media(max-width:600px){.spatial-row{grid-template-columns:repeat(4,minmax(0,1fr))}.spatial-row :deep(select){padding:.3rem;font-size:.75rem}.spatial-row :deep(label){font-size:.75rem}}
</style>
