<script setup lang="ts">
import catalogue from '~/data/catalogue.json'
const props=defineProps<{tool:string}>()
const info=computed(()=>catalogue.tools.find(t=>t.id===props.tool)!)
const map=computed(()=>catalogue.maps.find(m=>m.id===info.value.map)!)
</script>
<template><ToolShell :map-name="map.name" :back-to="map.route"><template #title>{{ info.name }}</template><PuzzleWidget :tool="tool" /></ToolShell></template>
