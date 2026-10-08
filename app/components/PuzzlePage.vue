<script setup lang="ts">
import catalogue from '~/data/catalogue.json'
import { toolDefinitions } from '~/utils/expansionTools.mjs'
const props=defineProps<{tool:string}>()
const info=computed(()=>catalogue.tools.find(t=>t.id===props.tool)!)
const map=computed(()=>catalogue.maps.find(m=>m.id===info.value.map)!)
</script>
<template><ToolShell :map-name="map.name" :back-to="map.route" :wide="toolDefinitions[tool]?.widget === 'remaining' || tool.startsWith('bo1-') || tool.startsWith('bo2-') || tool.startsWith('bo3-') || tool.startsWith('bo4-') || tool.startsWith('bo6-') || tool.startsWith('cw-') || ['rex-ring','kowakujo-murder'].includes(tool)"><template #title>{{ info.name }}</template><PuzzleWidget :tool="tool" /></ToolShell></template>
