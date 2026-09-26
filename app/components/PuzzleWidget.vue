<script setup lang="ts">
import { PuzzleSerum, PuzzleRocket, PuzzleMars, PuzzleOrgan, PuzzlePlanets, PuzzleScroll, PuzzleFlags, PuzzleMurder, PuzzleRings, PuzzlePillars, PuzzleHouse, PuzzleUranium, PuzzleWunder, PuzzleNotes, PuzzleBooks } from '#components'
const props=defineProps<{tool:string}>()
const stateIds:Record<string,string>={'ashes-serum':'serum','ashes-rocket-launch':'rocket','astra-organ':'organ','astra-mars-code':'mars','astra-planets':'planets','kowakujo-pestle':'scroll','kowakujo-clock':'flags','kowakujo-murder':'murder','totenreich-uranium':'uranium','totenreich-wunderbarrage':'wunder','rex-ring':'rings','rex-pillars':'pillars','rex-house-symbols':'house','paradox-notes':'notes','astra-books':'books'}
const legacyNotice=useState(`puzzle-${stateIds[props.tool]}-legacy-notice`,()=> '')
const widgets:Record<string,any>={"ashes-serum":PuzzleSerum,"ashes-rocket-launch":PuzzleRocket,"astra-mars-code":PuzzleMars,"astra-organ":PuzzleOrgan,"astra-planets":PuzzlePlanets,"kowakujo-pestle":PuzzleScroll,"kowakujo-clock":PuzzleFlags,"kowakujo-murder":PuzzleMurder,"rex-ring":PuzzleRings,"rex-pillars":PuzzlePillars,"rex-house-symbols":PuzzleHouse,"totenreich-uranium":PuzzleUranium,"totenreich-wunderbarrage":PuzzleWunder,"paradox-notes":PuzzleNotes,"astra-books":PuzzleBooks}
</script>
<template><p v-if="legacyNotice" class="puzzle-legacy" role="status">{{ legacyNotice }}</p><component :is="widgets[tool]" v-if="widgets[tool]" /></template>

<style scoped>.puzzle-legacy{font-size:.8rem;color:var(--wp-muted);padding:.5rem;border-left:2px solid var(--wp-gold)}</style>
