<template>
  <ToolShell map-name="Rex Infernus" back-to="/guides/rex-infernus">
    <template #title>🏠 House Symbols Tracker</template>
    <template #sub>Mark the symbols that appear on the house <strong>in appearance order</strong> — shoot them in that order on an exfil round.</template>
    <template #howto>
      <b>How it works</b> — from <b>round 5</b>, one symbol appears on the house each round (up to 4).
      <b>Click the symbols on the image in the order they appeared</b>, then shoot them in that same order
      — but only during an <b>exfiltration round</b>. Your marks are saved automatically.
    </template>

    <div class="blocklabel">① The house <span class="hint">click in appearance order — max 4 · click a marker to undo</span></div>
    <div ref="wrapRef" class="housewrap" @click="onWrapClick">
      <img class="house" src="/tools/rex-infernus-house-symbols.jpg" alt="House with symbols">
      <div
        v-for="(p, i) in points"
        :key="i"
        class="mark"
        :style="{ left: p.x + '%', top: p.y + '%' }"
        @click.stop="removeAt(i)"
      >{{ i + 1 }}</div>
    </div>
    <div class="olist">{{ orderText }}</div>
    <div class="onote">{{ noteText }}</div>

    <div class="opts">
      <button type="button" class="btn ghost" @click="points = []">↻ Reset</button>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

interface Point { x: number; y: number }

const KEY = 'cw-rex-house-symbols'
const points = ref<Point[]>([])
const wrapRef = ref<HTMLElement | null>(null)

onMounted(() => {
  try {
    points.value = JSON.parse(localStorage.getItem(KEY) || '[]') || []
  } catch {
    points.value = []
  }
})

watch(points, (v) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {}
}, { deep: true })

const orderText = computed(() =>
  points.value.length
    ? 'Shoot order: ' + points.value.map((_, i) => String(i + 1)).join(' → ')
    : ''
)
const noteText = computed(() => {
  const n = points.value.length
  if (!n) return 'Click the first symbol spot on the image.'
  if (n >= 4) return 'All 4 placed — shoot them in this order during the exfil round.'
  return `${n} of 4 placed — more appear each round from round 5.`
})

function onWrapClick(e: MouseEvent) {
  if (points.value.length >= 4 || !wrapRef.value) return
  const r = wrapRef.value.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  points.value.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
}

function removeAt(i: number) {
  points.value.splice(i, 1)
}
</script>

<style scoped>
.housewrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
  margin-top: .6rem;
  cursor: crosshair;
}

.housewrap img.house {
  display: block;
  max-width: 100%;
  width: 560px;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, .15);
}

.mark {
  position: absolute;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #18181b;
  font-weight: 800;
  font-size: .95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .5), inset 0 1px 0 rgba(255, 255, 255, .35);
}

.mark:hover {
  outline: 2px solid #ffe8bf;
}

.olist {
  margin-top: .7rem;
  text-align: center;
  font-size: .86rem;
  font-weight: 700;
  color: #ffe8bf;
}

.onote {
  margin-top: .4rem;
  text-align: center;
  font-size: .76rem;
  color: #ffffff99;
  font-weight: 600;
}
</style>
