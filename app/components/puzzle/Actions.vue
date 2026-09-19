<script setup lang="ts">
defineProps<{ canUndo: boolean, saveError?: boolean }>()
defineEmits<{ undo: [], reset: [] }>()
</script>
<template><div class="p-actions"><button type="button" :disabled="!canUndo" @click="$emit('undo')">Undo</button><button type="button" @click="$emit('reset')">Reset puzzle</button><span role="status">{{ saveError ? 'Could not save on this device.' : 'Saved on this device' }}</span></div></template>
