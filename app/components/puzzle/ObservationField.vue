<script setup lang="ts">
import { fieldLocked } from '~/utils/remainingUi.mjs'
const props = defineProps<{ field: any, state: Record<string, any> }>()
const emit = defineEmits<{ change: [id: string, value: string | boolean] }>()
const inputId = useId()
const locked = computed(() => fieldLocked(props.field, props.state))
const label = (value: string) => props.field.optionLabels?.[value] || value
const picture = computed(() => props.field.optionImages?.[props.state[props.field.id]])
const selected = ref<any>(null)
</script>
<template>
  <div class="observation-field" :class="{ checked: field.type === 'check' }">
    <label :for="inputId">{{ field.label }}<span v-if="locked" class="locked-label"> · locked</span></label>
    <input v-if="field.type === 'check'" :id="inputId" type="checkbox" :checked="state[field.id]" :disabled="locked" @change="emit('change', field.id, ($event.target as HTMLInputElement).checked)">
    <select v-else-if="field.options" :id="inputId" :value="state[field.id]" :disabled="locked" @change="emit('change', field.id, ($event.target as HTMLSelectElement).value)"><option value="">Not recorded</option><option v-for="value in field.options" :key="value" :value="value">{{ label(value) }}</option></select>
    <input v-else :id="inputId" :value="state[field.id]" :disabled="locked" :maxlength="field.maxLength || 80" :inputmode="field.inputmode || 'text'" :placeholder="field.placeholder || 'Not recorded'" autocomplete="off" spellcheck="false" @input="emit('change', field.id, ($event.target as HTMLInputElement).value)">
    <button v-if="picture" type="button" class="photo-preview" :aria-label="`Enlarge source plate: ${picture.alt}`" @click="selected = picture"><PuzzleReferencePhoto :picture="picture" /></button>
    <small v-if="picture?.credit" class="photo-credit">{{ picture.credit }} · <a v-if="picture.source" :href="picture.source" target="_blank" rel="noopener noreferrer">Source ↗</a></small>
    <details v-if="field.optionImages" class="symbol-picker">
      <summary>Compare symbol photographs</summary>
      <div class="symbol-options"><button v-for="value in field.options" :key="value" type="button" :disabled="locked" :aria-pressed="state[field.id] === value" @click="emit('change', field.id, value)"><PuzzleReferencePhoto v-if="field.optionImages[value]" :picture="field.optionImages[value]" /><span>{{ label(value) }}</span></button></div>
      <p>Photographs identify the shapes. Select the recorded choice above to enlarge its complete source plate.</p>
    </details>
    <ImageLightbox v-if="selected" :src="selected.src" :alt="selected.alt" @close="selected = null" />
  </div>
</template>
<style scoped>
.observation-field{display:flex;flex-direction:column;gap:.45rem;min-width:0}.observation-field label{font-size:.9rem;line-height:1.4}.observation-field input,.observation-field select{min-width:0;width:100%;min-height:44px;padding:.65rem;border:1px solid var(--line);border-radius:6px;background:var(--surface-2);color:var(--text)}.observation-field.checked{position:relative;flex-direction:row-reverse;align-items:center;justify-content:flex-end;min-height:44px;gap:.7rem}.checked label{cursor:pointer;padding:.5rem 0}.checked input{width:22px;min-height:22px;accent-color:var(--gold)}.locked-label{color:var(--muted)}.observation-field :disabled{opacity:.65;cursor:not-allowed}.photo-preview{padding:0;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:var(--surface-2);cursor:zoom-in;max-width:200px}.symbol-picker summary{cursor:pointer;min-height:44px;display:flex;align-items:center;text-decoration:underline;color:var(--gold)}.symbol-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:.5rem}.symbol-options button{min-height:44px;min-width:0;padding:.4rem;border:1px solid var(--line);border-radius:6px;color:var(--text);background:var(--surface-2);cursor:pointer}.symbol-options button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-dim)}.symbol-options span{display:block;font-size:.75rem;margin-top:.4rem}.symbol-picker p{font-size:.8rem;color:var(--muted)}:is(input,select,button,summary):focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.observation-field.checked label{min-height:44px;display:flex;align-items:center}
</style>
