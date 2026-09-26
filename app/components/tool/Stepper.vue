<template>
  <div class="steprow">
    <button type="button" @click="dec">−</button>
    <div class="stepval">{{ modelValue === null ? '—' : modelValue }}</div>
    <button type="button" @click="inc">+</button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number | null
  max: number
  min?: number
}>(), { min: 1 })

const emit = defineEmits<{ (e: 'update:modelValue', v: number | null): void }>()

function dec() {
  if (props.modelValue === null) emit('update:modelValue', props.min)
  else emit('update:modelValue', Math.max(props.min, props.modelValue - 1))
}

function inc() {
  if (props.modelValue === null) emit('update:modelValue', props.min)
  else emit('update:modelValue', Math.min(props.max, props.modelValue + 1))
}
</script>

<style scoped>
.steprow {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-top: .45rem;
}

.steprow button {
  width: 32px;
  height: 32px;
  border-radius: .55rem;
  border: 1px solid rgba(245, 158, 11, .45);
  background: rgba(245, 158, 11, .12);
  color: #ffe8bf;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all .12s;
}

.steprow button:hover {
  background: rgba(245, 158, 11, .25);
}

.stepval {
  flex: 1;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffe8bf;
  font-family: ui-monospace, monospace;
}
</style>
