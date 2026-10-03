<script setup>
import { shadowGlyphs, voidGlyphs, terminalGlyphs } from '~/utils/bo3.mjs'
const props = defineProps({ kind:String, symbol:String })
const config = computed(() => ({
  shadows: { glyphs:shadowGlyphs, src:'/images/bo3-shadows-of-evil/apothicon_sword/wall_with_symbols.webp', width:2560, height:1440 },
  void: { glyphs:voidGlyphs, src:'/images/bo3-der-eisendrache/wrath_of_the_ancients/void_bow/symbol_cheat_sheet.webp', width:1919, height:1078 },
  terminal: { glyphs:terminalGlyphs, src:'/images/bo3-der-eisendrache/main_ee/simon_says_clocktower.webp', width:2560, height:1440 }
}[props.kind]))
const glyph = computed(() => config.value?.glyphs.find(g=>g.id===props.symbol))
</script>
<template>
  <svg v-if="glyph" :viewBox="glyph.box.join(' ')" role="img" :aria-label="glyph.label" class="bo3-glyph">
    <title>{{ glyph.label }}</title>
    <image :href="config.src" :width="config.width" :height="config.height" />
  </svg>
  <span v-else class="bo3-glyph-empty" aria-label="Not recorded">?</span>
</template>
<style scoped>
.bo3-glyph{display:block;width:5rem;max-width:100%;height:5rem;margin:auto;overflow:hidden;border-radius:4px;background:#171713}.bo3-glyph-empty{display:grid;place-items:center;min-height:5rem;font-size:1.5rem;color:var(--muted)}
</style>
