<script setup lang="ts">
import { PuzzleSerum, PuzzleRocket, PuzzleMars, PuzzleOrgan, PuzzlePlanets, PuzzleScroll, PuzzleFlags, PuzzleMurder, PuzzleRings, PuzzlePillars, PuzzleHouse, PuzzleUranium, PuzzleWunder, PuzzleNotes, PuzzleBooks } from '#components'
const props=defineProps<{tool:string}>()
const Blood = defineAsyncComponent(() => import('./puzzle/Blood.vue'))
const Voyage = defineAsyncComponent(() => import('./puzzle/Voyage.vue'))
const ChaosHands = defineAsyncComponent(() => import('./puzzle/ChaosHands.vue'))
const AlphaTag = defineAsyncComponent(() => import('./puzzle/AlphaTag.vue'))
const NightClassified = defineAsyncComponent(() => import('./puzzle/NightClassified.vue'))
const Expansion = defineAsyncComponent(() => import('./puzzle/Expansion.vue'))
const Bo6TerminusLab = defineAsyncComponent(() => import('./puzzle/Bo6TerminusLab.vue'))
const Bo6LibertyFalls = defineAsyncComponent(() => import('./puzzle/Bo6LibertyFalls.vue'))
const CastleTomb = defineAsyncComponent(() => import('./puzzle/CastleTomb.vue'))
const Bo6Dlc = defineAsyncComponent(() => import('./puzzle/Bo6Dlc.vue'))
const ColdWar = defineAsyncComponent(() => import('./puzzle/ColdWar.vue'))
import { toolDefinitions } from '~/utils/expansionTools.mjs'
const stateIds:Record<string,string>={'ashes-serum':'serum','ashes-rocket-launch':'rocket','astra-organ':'organ','astra-mars-code':'mars','astra-planets':'planets','kowakujo-pestle':'scroll','kowakujo-clock':'flags','kowakujo-murder':'murder','totenreich-uranium':'uranium','totenreich-wunderbarrage':'wunder','rex-ring':'rings','rex-pillars':'pillars','rex-house-symbols':'house','paradox-notes':'notes','astra-books':'books'}
const legacyNotice=useState(`puzzle-${stateIds[props.tool]}-legacy-notice`,()=> '')
const widgets:Record<string,any>={"ashes-serum":PuzzleSerum,"ashes-rocket-launch":PuzzleRocket,"astra-mars-code":PuzzleMars,"astra-organ":PuzzleOrgan,"astra-planets":PuzzlePlanets,"kowakujo-pestle":PuzzleScroll,"kowakujo-clock":PuzzleFlags,"kowakujo-murder":PuzzleMurder,"rex-ring":PuzzleRings,"rex-pillars":PuzzlePillars,"rex-house-symbols":PuzzleHouse,"totenreich-uranium":PuzzleUranium,"totenreich-wunderbarrage":PuzzleWunder,"paradox-notes":PuzzleNotes,"astra-books":PuzzleBooks}
</script>
<template>
  <p v-if="legacyNotice" class="puzzle-legacy" role="status">{{ legacyNotice }}</p>
  <component :is="widgets[tool]" v-if="widgets[tool]" />
  <Blood v-else-if="['bo4-blood-powerhouse','bo4-blood-morse'].includes(tool)" :key="tool" :tool="tool" />
  <Voyage v-else-if="tool.startsWith('bo4-voyage-')" :key="tool" :tool="tool" />
  <ChaosHands v-else-if="['bo4-ix-ra','bo4-ix-danu','bo4-ancient-hands','bo4-ancient-theater','bo4-ancient-tribute'].includes(tool)" :key="tool" :tool="tool" />
  <AlphaTag v-else-if="['bo4-alpha-clocks','bo4-tag-riddles'].includes(tool)" :key="tool" :tool="tool" />
  <NightClassified v-else-if="['bo4-dead-of-the-night-zodiac','bo4-dead-of-the-night-alistair','bo4-dead-of-the-night-stake','bo4-classified-codes'].includes(tool)" :key="tool" :tool="tool" />
  <Bo6TerminusLab v-else-if="tool === 'bo6-terminus-lab'" :key="tool" :tool="tool" />
  <Bo6LibertyFalls v-else-if="tool === 'bo6-liberty-strauss'" :key="tool" :tool="tool" />
  <CastleTomb v-else-if="['bo6-citadelle-raven','bo6-citadelle-symbols','bo6-tomb-symbols'].includes(tool)" :key="tool" :tool="tool" />
  <Bo6Dlc v-else-if="['bo6-shattered-cipher','bo6-reckoning-element','bo6-reckoning-files'].includes(tool)" :key="tool" :tool="tool" />
  <ColdWar v-else-if="tool.startsWith('cw-') && toolDefinitions[tool]" :key="tool" :tool="tool" />
  <Expansion v-else-if="toolDefinitions[tool]" :key="tool" :tool="tool" />
</template>

<style scoped>.puzzle-legacy{font-size:.8rem;color:var(--wp-muted);padding:.5rem;border-left:2px solid var(--wp-gold)}</style>
