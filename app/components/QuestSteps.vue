<script setup lang="ts">
import { partStatus } from '~/utils/companion.mjs'
const props = defineProps<{ mapId: string, phases: any[], completed: string[], hideCompleted?: boolean, mapLinks?: Record<string, string> }>()
const emit = defineEmits<{ toggle: [steps: any[]], details: [anchor: string], visit: [anchor: string], hide: [value: boolean] }>()
const expanded = ref<Record<string, boolean>>({})
const status = (phase: any) => partStatus(props.completed, phase.steps)
const count = computed(() => props.phases.filter(p => status(p) === 'complete').length)
const isOpen = (phase: any) => expanded.value[phase.id] ?? !(props.hideCompleted && status(phase) === 'complete')
function reveal(id: string) {
  const phase = props.phases.find(p => id === `quick-${p.id}` || p.steps.some((s:any) => id === `quick-step-${s.id}`))
  if (phase) expanded.value[phase.id] = true
}
function toggle(phase: any) {
  expanded.value[phase.id] = isOpen(phase)
  emit('toggle', phase.steps)
  emit('visit', `quick-${phase.id}`)
}
function setHide(value: boolean) { expanded.value = {}; emit('hide', value) }
defineExpose({ reveal })
</script>
<template>
  <section class="quest-steps" aria-label="Main quest parts">
    <div class="quest-progress"><h2>Main quest</h2><span>{{ count }} / {{ phases.length }} parts</span></div>
    <progress :value="count" :max="phases.length" :aria-label="`${count} of ${phases.length} parts complete`" />
    <div class="quest-options"><span>One optional check per part.</span><label><input type="checkbox" :checked="hideCompleted" @change="setHide(($event.target as HTMLInputElement).checked)"> Hide completed parts</label></div>
    <section v-for="(phase, i) in phases" :id="`quick-${phase.id}`" :key="phase.id" class="quest-phase" :class="{ completed: status(phase) === 'complete' }" :aria-labelledby="`phase-heading-${phase.id}`">
      <header>
        <label class="part-check"><input type="checkbox" :checked="status(phase) === 'complete'" :indeterminate="status(phase) === 'partial'" :aria-label="`Complete ${phase.title}`" @change="toggle(phase)"><span>{{ String(i + 1).padStart(2, '0') }}</span></label>
        <h3 :id="`phase-heading-${phase.id}`"><button :aria-expanded="isOpen(phase)" :aria-controls="`${mapId}-${phase.id}-body`" @click="expanded[phase.id] = !isOpen(phase)">{{ phase.title }} <span aria-hidden="true">{{ isOpen(phase) ? '−' : '+' }}</span></button></h3>
        <button class="part-details" @click="emit('details', phase.detail)">Full details ↗</button>
      </header>
      <div v-show="isOpen(phase)" :id="`${mapId}-${phase.id}-body`" class="part-body">
        <ul class="quest-list"><li v-for="(step, stepIndex) in phase.steps" :id="`quick-step-${step.id}`" :key="step.id" data-guide-step><div class="step-copy" v-html="step.html" /><ShowOnMap v-if="mapLinks?.[step.id]" :target="mapLinks[step.id]" :label="`Show ${phase.title}, step ${stepIndex + 1} on map`" /><InlineTool v-for="tool in step.tools || []" :key="tool" :tool="tool" /></li></ul>
        <ParadoxLocations v-if="mapId === 'paradox-junction'" :phase="phase.id" />
      </div>
    </section>
  </section>
</template>
<style scoped>
.quest-progress,.quest-options { display:flex; justify-content:space-between; align-items:center; gap:.6rem; flex-wrap:wrap; }
.quest-progress h2 { margin:.2rem 0; font-size:1.35rem; }
.quest-progress > span { color:var(--gold); font-variant-numeric:tabular-nums; font-size:.85rem; }
progress { width:100%; height:4px; accent-color:var(--gold); }
.quest-options { font-size:.78rem; color:var(--muted); margin:.3rem 0 .7rem; }
.quest-options label { display:flex; gap:.5rem; align-items:center; min-height:36px; }
.quest-phase { margin-top:.7rem; border:1px solid var(--line); border-radius:var(--radius); scroll-margin-top:6rem; }
.quest-phase header { display:flex; align-items:center; gap:.45rem; background:var(--surface-2); padding:.15rem .65rem; border-radius:var(--radius); }
.quest-phase h3 { flex:1; font-size:.98rem; margin:0; min-width:0; }
.quest-phase h3 button { width:100%; text-align:left; color:var(--text); }
header button { border:0; background:transparent; padding:.4rem; font:inherit; cursor:pointer; min-height:44px; }
.quest-phase h3 span { color:var(--muted); margin-left:.3rem; }
.part-check { display:flex; align-items:center; gap:.45rem; min-height:44px; cursor:pointer; color:var(--gold); font-size:.75rem; }
input { width:1.1rem; height:1.1rem; accent-color:var(--gold); flex:none; }
.part-details { color:var(--gold-bright); font-size:.75rem; }
.quest-list { list-style:disc; margin:0; padding:.35rem .85rem .5rem 1.8rem; }
.quest-list > li { padding:.2rem 0; }
.step-copy { display:inline; line-height:1.5; color:var(--text); }
.completed header { border-left:3px solid var(--gold); }
.step-copy :deep(a) { color:var(--gold-bright); text-decoration:underline; }
.step-copy :deep(.era) { font-size:.72em; text-transform:uppercase; letter-spacing:.04em; color:var(--gold-bright); border:1px solid var(--line-strong); border-radius:4px; padding:.1rem .3rem; white-space:nowrap; }
@media(max-width:600px) { .quest-phase header { flex-wrap:wrap; gap:.15rem; } .quest-phase h3 { flex-basis:65%; } .part-details { margin-left:auto; } .step-copy { font-size:.94rem; } }
</style>
