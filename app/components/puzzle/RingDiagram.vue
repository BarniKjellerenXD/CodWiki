<script setup lang="ts">
import { ringNames, ringStops, temples } from '~/utils/puzzles.mjs'
const props = defineProps<{ positions: (number | null)[], rotations: number[], active: number, preview: boolean }>()
defineEmits<{ place: [stop: number] }>()
const radii = [66, 102, 138]
function point(n: number, radius: number) { const a = (n * 60 - 90) * Math.PI / 180; return { x: Number((220 + Math.cos(a) * radius).toFixed(3)), y: Number((220 + Math.sin(a) * radius).toFixed(3)) } }
const description = computed(() => ringNames.map((name, i) => `${name}: ${props.positions[i] === null ? 'not recorded' : ringStops[props.positions[i]!]}`).join(', '))
</script>
<template>
  <div class="ring-diagram">
    <svg viewBox="0 0 440 440" role="img" :aria-label="description">
      <circle cx="220" cy="220" r="153" fill="var(--surface)" stroke="var(--line)" />
      <line v-for="n in 6" :key="`line${n}`" x1="220" y1="220" :x2="point(n-1,153).x" :y2="point(n-1,153).y" stroke="var(--line)" stroke-dasharray="3 7" />
      <circle v-for="(radius,i) in radii" :key="radius" cx="220" cy="220" :r="radius" fill="none" :stroke="i===active?'var(--gold)':'var(--line-strong)'" :stroke-width="i===active?2:1" />
      <g v-for="(name,i) in ringNames" :key="name" class="ring-marker" :class="`marker-${i}`" :style="{ transform:`rotate(${rotations[i]}deg)`, opacity: positions[i] === null ? 0 : 1 }">
        <circle cx="220" :cy="220-radii[i]" r="15" />
        <text x="220" :y="225-radii[i]" text-anchor="middle" :transform="`rotate(${-rotations[i]} 220 ${220-radii[i]})`">{{ name[0] }}</text>
      </g>
      <circle cx="220" cy="220" r="37" fill="var(--surface-2)" stroke="var(--line)" />
      <text x="220" y="217" text-anchor="middle" fill="var(--muted)" font-size="9" letter-spacing="1">NEXUS</text>
      <text x="220" y="234" text-anchor="middle" fill="var(--gold)" font-size="12">{{ preview ? 'PREVIEW' : 'CURRENT' }}</text>
    </svg>
    <button v-for="(stop,n) in ringStops" :key="stop" type="button" class="ring-stop" :class="{ temple: temples.includes(n) }" :style="{left:`${point(n,190).x/4.4}%`,top:`${point(n,190).y/4.4}%`}" :disabled="preview" :aria-label="`Set ${ringNames[active]} position to ${stop}`" :aria-pressed="positions[active]===n" @click="$emit('place',n)">{{ stop }}</button>
  </div>
</template>
<style scoped>
.ring-diagram{position:relative;width:100%;max-width:410px;margin:0 auto;aspect-ratio:1}
.ring-diagram svg{display:block;width:100%;height:100%;overflow:visible}
.puzzle .ring-stop{position:absolute;transform:translate(-50%,-50%);padding:.25rem .3rem;min-height:44px;width:25%;max-width:104px;font-size:clamp(.64rem,2.6cqi,.78rem);border-color:transparent;background:transparent;color:var(--muted);font-weight:600}
.puzzle .ring-stop.temple{color:var(--text)}
.puzzle .ring-stop:disabled{opacity:1;cursor:default}
.puzzle .ring-stop[aria-pressed=true]{background:var(--gold-dim);border-color:var(--gold-border);color:var(--gold-bright)}
.ring-marker{transform-origin:220px 220px;transition:transform .35s ease,opacity .15s}
.ring-marker circle{stroke:var(--surface);stroke-width:3}
.ring-marker text{font-size:13px;font-weight:800;fill:var(--on-gold,#171512)}
.marker-0 circle{fill:var(--gold)}.marker-1 circle{fill:var(--orange)}.marker-2 circle{fill:var(--muted)}
@media(prefers-reduced-motion:reduce){.ring-marker{transition:none}}
</style>
