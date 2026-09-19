<script setup lang="ts">
const props = defineProps<{ mapId: string, phases: any[], completed: string[] }>()
const emit = defineEmits<{ toggle: [id: string], details: [anchor: string], visit: [anchor: string] }>()
const count = computed(() => props.phases.reduce((n, p) => n + p.steps.filter((s: any) => props.completed.includes(s.id)).length, 0))
const total = computed(() => props.phases.reduce((n, p) => n + p.steps.length, 0))
</script>

<template>
  <section class="quest-steps" aria-label="Main quest checklist">
    <div class="quest-progress"><div><span class="companion-label">Your current run</span><h2>Main quest</h2></div><span>{{ count }} / {{ total }} steps</span></div>
    <progress :value="count" :max="total" :aria-label="`${count} of ${total} steps complete`" />
    <p class="companion-muted">Check off steps as you play. Open full details for locations, images and explanations.</p>
    <section v-for="(phase, i) in phases" :id="`quick-${phase.id}`" :key="phase.id" class="quest-phase" :aria-labelledby="`phase-heading-${phase.id}`">
      <header><span class="phase-number">{{ String(i + 1).padStart(2, '0') }}</span><h3 :id="`phase-heading-${phase.id}`">{{ phase.title }}</h3><button class="companion-button subtle" @click="emit('details', phase.detail)">Full details ↗</button></header>
      <ol class="quest-list">
        <li v-for="step in phase.steps" :key="step.id" :class="{ completed: completed.includes(step.id) }">
          <input :id="`${mapId}-${step.id}`" type="checkbox" :checked="completed.includes(step.id)" :aria-label="`Complete ${phase.title} step ${phase.steps.indexOf(step) + 1}`" @change="emit('toggle', step.id); emit('visit', `quick-${phase.id}`)" />
          <div class="step-copy" v-html="step.html" />
        </li>
      </ol>
    </section>
  </section>
</template>

<style scoped>
.quest-progress { display:flex; justify-content:space-between; align-items:center; gap:1rem; }
.quest-progress h2 { margin:.3rem 0 .8rem; font-size:1.7rem; }
.quest-progress > span { color:var(--gold); font-variant-numeric:tabular-nums; }
progress { width:100%; height:6px; accent-color:var(--gold); }
.quest-phase { margin-top:1.6rem; border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; scroll-margin-top:6rem; }
.quest-phase header { display:flex; flex-wrap:wrap; align-items:center; gap:.8rem; background:var(--surface-2); padding:1rem; }
.quest-phase h3 { flex:1; font-size:1.05rem; margin:0; }
.phase-number { color:var(--gold); font-size:.8rem; }
.quest-list { list-style:none; margin:0; padding:0 1rem; }
.quest-list > li { display:flex; align-items:flex-start; gap:1rem; padding:1.1rem 0; border-bottom:1px solid var(--line); }
.quest-list > li:last-child { border:0; }
input { flex:none; width:1.3rem; height:1.3rem; margin-top:.2rem; accent-color:var(--gold); cursor:pointer; }
.step-copy { line-height:1.8; color:var(--text); min-width:0; }
.completed .step-copy { color:var(--muted); }
.completed { background:var(--gold-dim); }
.step-copy :deep(a) { color:var(--gold-bright); text-decoration:underline; }
.step-copy :deep(ul), .step-copy :deep(ol) { padding-left:1.2rem; }
@media(max-width:600px) { .quest-phase header { gap:.5rem; } .quest-phase header button { margin-left:auto; } }
</style>
