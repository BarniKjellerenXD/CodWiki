<template>
  <ToolShell map-name="Rex Infernus" back-to="/guides/rex-infernus" class="ring-page">
    <template #title>🛕 Temple Ring Solver</template>
    <template #sub>Six stops clockwise: <b>Empty → Dravakar → Caltheris → House → Nyxara → Veytharion</b>. Pressing a ring's button moves <b>that ring 1 stop</b> and the <b>other two rings 2 stops</b>, in the lever's direction. Lever flips are free — each press uses the direction you pick.</template>
    <template #howto>
      <b>Align mode</b> — place your three pillars, tap a temple as target, then Solve.
      <b>Tour mode</b> — solve the shortest route visiting all 4 temples.
    </template>

    <div class="mode">
      <button type="button" :class="{ active: mode === 'align' }" @click="setMode('align')">🎯 Align to one temple</button>
      <button type="button" :class="{ active: mode === 'tour' }" @click="setMode('tour')">🔁 Tour all 4 temples</button>
    </div>

    <div class="pick">
      <span class="lbl">Place pillar:</span>
      <button
        v-for="(r, i) in ringNames"
        :key="r"
        type="button"
        class="ringchip"
        :class="[`rc${i}`, { active: active === i }]"
        @click="active = i"
      >{{ r }}</button>
      <button type="button" class="reset" @click="resetBoard">reset</button>
    </div>

    <div class="vizwrap">
      <svg width="300" height="300" viewBox="-150 -150 300 300" aria-hidden="true" @click="onSvgClick">
        <circle v-for="(rad, r) in radii" :key="`c${r}`" :r="rad" fill="none"
          :stroke="r === active ? colors[r] : 'rgba(255,255,255,.12)'"
          :stroke-width="r === active ? 2 : 1" stroke-dasharray="3 5"
          :opacity="r === active ? '.8' : '.9'" />
        <g v-for="i in 6" :key="`spoke${i}`">
          <line :x1="0" :y1="0" :x2="polar(i - 1, 122).x" :y2="polar(i - 1, 122).y" stroke="rgba(255,255,255,.08)" stroke-width="1" />
          <circle :cx="polar(i - 1, 130).x" :cy="polar(i - 1, 130).y" r="2.5"
            :fill="isTemple(i - 1) ? '#f59e0b' : '#5c5647'" />
          <text :x="polar(i - 1, 138).x" :y="polar(i - 1, 138).y + 3" text-anchor="middle" font-size="9.5"
            :font-weight="mode === 'align' && target === i - 1 ? '800' : '700'"
            :fill="mode === 'align' && target === i - 1 ? '#fcd34d' : (isTemple(i - 1) ? '#f59e0b99' : '#8a7548')"
          >{{ mode === 'align' && target === i - 1 ? '🎯 ' : '' }}{{ names[i - 1] }}</text>
          <circle
            v-if="isTemple(i - 1) && mode === 'align'"
            class="hit"
            :cx="polar(i - 1, 130).x" :cy="polar(i - 1, 130).y" r="24"
            fill="rgba(0,0,0,0)" style="cursor:pointer"
            :data-stop="i - 1" data-kind="target"
          />
          <circle
            class="hit"
            :cx="polar(i - 1, 94).x" :cy="polar(i - 1, 94).y" r="34"
            fill="rgba(0,0,0,0)" style="cursor:pointer"
            :data-stop="i - 1" data-kind="place"
          />
        </g>
        <g v-for="(k, ki) in 3" :key="`ring${ki}`">
          <circle
            v-if="ki === active"
            :cx="pillarPos(ki).x" :cy="pillarPos(ki).y" r="14" fill="none"
            :stroke="colors[ki]" stroke-width="1.5" stroke-dasharray="2 3"
          />
          <circle :cx="pillarPos(ki).x" :cy="pillarPos(ki).y" r="9"
            :fill="colors[ki]" stroke="#0a0a0c" stroke-width="2" />
          <text :x="pillarPos(ki).x" :y="pillarPos(ki).y + 3" text-anchor="middle" font-size="8" font-weight="800" fill="#1b1204">{{ ringNames[ki][0] }}</text>
        </g>
      </svg>
      <div class="hintline">Tap a spoke to place the <b :style="{ color: colors[active] }">{{ ringNames[active] }}</b> pillar · chips switch pillar · tap a <b>temple</b> to set the target</div>
    </div>

    <div v-if="mode === 'align'" class="targetrow">
      <span class="tgtlbl">Target:</span>
      <span class="tgtval">{{ target === null ? '— none —' : `${names[target]} (tap a temple on the ring to change)` }}</span>
    </div>

    <button type="button" class="solve" @click="solve">Solve</button>

    <div v-if="result" class="result">
      <div v-if="result.type === 'none'" class="total">No solution found (should not happen).</div>
      <template v-else>
        <div class="counts">
          <div v-for="(c, i) in result.counts" :key="i" class="cnt">
            <span class="n">{{ c }}</span>
            <span class="l">{{ ringNames[i] }}</span>
          </div>
        </div>
        <div class="total" v-html="result.totalHtml" />
        <div class="controls">
          <button type="button" :disabled="step <= 0" @click="step--">◀ Prev</button>
          <span class="stepcap" v-html="stepCapHtml" />
          <button type="button" :disabled="step >= result.seq.length" @click="step++">Next ▶</button>
        </div>
        <div class="seq">
          <template v-if="result.seq.length">
            <div v-for="(mv, i) in result.seq" :key="i" :class="{ visit: visitedSteps.includes(i + 1) }">
              Press {{ i + 1 }}: <b>{{ ringNames[mv[0]] }}</b> · {{ mv[1] === 1 ? 'clockwise' : 'counter-clockwise' }}
            </div>
          </template>
          <div v-else>Already aligned — 0 presses needed.</div>
        </div>
      </template>
    </div>

    <p class="note">Empty and House are alignment stops but not temples. The tour treats a temple you're already aligned with at the start as visited (do its EE first!). Solver: breadth-first search over all 216 ring states — always the fewest possible presses.</p>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const names = ['Empty', 'Dravakar', 'Caltheris', 'House', 'Nyxara', 'Veytharion']
const TEMPLE_IDX: Record<string, number> = { Veytharion: 5, Dravakar: 1, Caltheris: 2, Nyxara: 4 }
const ringNames = ['Inside', 'Middle', 'Outside']
const colors = ['#fbbf24', '#f97316', '#ef4444']
const radii = [52, 80, 108]

function norm(x: number) { return ((x % 6) + 6) % 6 }
function move(state: number[], k: number, d: number): number[] {
  return state.map((p, i) => norm(p + (i === k ? d : 2 * d)))
}
function key(s: number[]) { return s[0] * 36 + s[1] * 6 + s[2] }

function bfsAll(start: number[]) {
  const dist: Record<number, { d: number, prev: number[] | null, mv: [number, number] | null }> = { [key(start)]: { d: 0, prev: null, mv: null as any } }
  const q = [start]
  for (let h = 0; h < q.length; h++) {
    const cur = q[h]
    const cd = dist[key(cur)].d
    for (let k = 0; k < 3; k++) for (const d of [1, -1] as const) {
      const nxt = move(cur, k, d)
      const kk = key(nxt)
      if (!dist[kk]) { dist[kk] = { d: cd + 1, prev: cur, mv: [k, d] }; q.push(nxt) }
    }
  }
  return dist
}

function solveAlign(start: number[], targetName: string): [number, number][] | null {
  const t = TEMPLE_IDX[targetName]
  const goal = [t, t, t]
  const dist = bfsAll(start)
  if (!dist[key(goal)]) return null
  const seq: [number, number][] = []
  let cur: number[] = goal
  while (dist[key(cur)].prev) {
    seq.unshift(dist[key(cur)].mv!)
    cur = dist[key(cur)].prev!
  }
  return seq
}

function maskOf(s: number[]) {
  let m = 0
  for (const v of [5, 1, 2, 4]) if (s[0] === v && s[1] === v && s[2] === v) m |= 1 << [5, 1, 2, 4].indexOf(v)
  return m
}

function solveTour(start: number[]): [number, number][] | null {
  let mk = maskOf(start)
  const seen: Record<string, [number[], number, [number, number] | null]> = {}
  seen[`${key(start)}_${mk}`] = [start, mk, null]
  const q: [number[], number][] = [[start, mk]]
  let goal: string | null = null
  for (let h = 0; h < q.length && !goal; h++) {
    const [st, sm] = q[h]
    for (let k = 0; k < 3; k++) for (const d of [1, -1] as const) {
      const nxt = move(st, k, d)
      const nm = sm | maskOf(nxt)
      const nk = `${key(nxt)}_${nm}`
      if (!(nk in seen)) {
        seen[nk] = [nxt, nm, [k, d]]
        if (nm === 15) { goal = nk; break }
        q.push([nxt, nm])
      }
    }
  }
  if (!goal) return null
  const seq: [number, number][] = []
  let cur = goal
  while (seen[cur][2]) {
    const p = seen[cur]
    seq.unshift(p[2]!)
    cur = `${key(p[0])}_${p[1]}`
  }
  return seq
}

function checkpoints(start: number[], seq: [number, number][]) {
  let p = start.slice()
  const visits: { press: number, name: string }[] = []
  const seenM: Record<string, number> = {}
  const m0 = maskOf(p)
  for (let i = 0; i < 4; i++) if (m0 & (1 << i)) visits.push({ press: 0, name: names[[5, 1, 2, 4][i]] })
  seq.forEach((mv, idx) => {
    p = move(p, mv[0], mv[1])
    if (p[0] === p[1] && p[1] === p[2]) {
      const v = names[p[0]]
      if (TEMPLE_IDX.hasOwnProperty(v) && !seenM[v]) { seenM[v] = 1; visits.push({ press: idx + 1, name: v }) }
    }
  })
  return visits
}

const cur = ref([0, 0, 0])
const active = ref(0)
const mode = ref<'align' | 'tour'>('align')
const target = ref<number | null>(null)
const result = ref<null | { type: 'none' } | { type: 'ok', seq: [number, number][], counts: number[], totalHtml: string }>(null)
const step = ref(0)

const visitedSteps = computed(() => {
  if (result.value?.type !== 'ok' || mode.value !== 'tour') return []
  return checkpoints(cur.value, result.value.seq).map(v => v.press)
})

const stepCapHtml = computed(() => {
  if (result.value?.type !== 'ok') return ''
  const state = cur.value.slice()
  for (let i = 0; i < step.value; i++) move(state, result.value.seq[i][0], result.value.seq[i][1])
  const al = state[0] === state[1] && state[1] === state[2] ? names[state[0]] : null
  if (step.value === 0) {
    return `Start — ${state.map((p, i) => `${ringNames[i]} on ${names[p]}`).join(', ')}${al ? ` — <span class="visit">aligned at ${al} ✓</span>` : ''}`
  }
  const mv = result.value.seq[step.value - 1]
  let cap = `Press ${step.value}/${result.value.seq.length}: <b>${ringNames[mv[0]]} ring · ${mv[1] === 1 ? 'clockwise' : 'counter-clockwise'}</b>`
  if (al) cap += ` — <span class="visit">aligned at ${al} ✓</span>`
  return cap
})

function polar(stop: number, radius: number) {
  const a = (-90 + stop * 60) * Math.PI / 180
  return { x: Math.cos(a) * radius, y: Math.sin(a) * radius }
}

function pillarPos(k: number) {
  return polar(cur.value[k], radii[k])
}

function isTemple(i: number) {
  return names[i] !== 'Empty' && names[i] !== 'House'
}

function onSvgClick(e: MouseEvent) {
  const t = e.target as SVGElement
  const stop = t.getAttribute?.('data-stop')
  const kind = t.getAttribute?.('data-kind')
  if (!stop || !kind) return
  const s = parseInt(stop, 10)
  if (kind === 'place') {
    cur.value = cur.value.map((p, i) => (i === active.value ? s : p))
    active.value = (active.value + 1) % 3
    clearResult()
  } else if (kind === 'target' && mode.value === 'align') {
    target.value = s
    clearResult()
  }
}

function clearResult() {
  result.value = null
  step.value = 0
}

function setMode(m: 'align' | 'tour') {
  mode.value = m
  clearResult()
}

function resetBoard() {
  cur.value = [0, 0, 0]
  active.value = 0
  clearResult()
}

function solve() {
  if (mode.value === 'align' && target.value === null) return
  const seq = mode.value === 'align'
    ? solveAlign(cur.value, names[target.value!])
    : solveTour(cur.value)
  if (!seq) {
    result.value = { type: 'none' }
    return
  }
  step.value = 0
  const counts = [0, 0, 0]
  seq.forEach(mv => counts[mv[0]]++)
  let txt = `<b>${seq.length}</b> total button presses`
  if (mode.value === 'tour') {
    const vis = checkpoints(cur.value, seq)
    txt += ' — visiting order: ' + vis.map(v => (v.press === 0 ? 'start: ' : `press ${v.press}: `) + `<b>${v.name}</b>`).join(' → ')
  } else {
    txt += ` to align all pillars on <b>${names[target.value!]}</b>`
  }
  result.value = { type: 'ok', seq, counts, totalHtml: txt }
}
</script>

<style scoped>
.mode {
  display: flex;
  gap: 8px;
  margin: 16px 0 0;
  flex-wrap: wrap;
}

.mode button {
  flex: 1;
  min-width: 180px;
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .15);
  color: #d6c28d;
  border-radius: 10px;
  padding: 10px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.mode button.active {
  background: #f59e0b;
  color: #1b1204;
  border-color: #f59e0b;
}

.pick {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 14px 0 2px;
  flex-wrap: wrap;
  align-items: center;
}

.pick .lbl {
  font-size: 12px;
  color: #a89062;
  text-transform: uppercase;
  letter-spacing: .06em;
  font-weight: 700;
  margin-right: 2px;
}

.ringchip {
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .16);
  color: #d6c28d;
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 800;
  font-size: .85rem;
  cursor: pointer;
  font-family: inherit;
}

.ringchip.active {
  color: #1b1204;
  border-color: currentColor;
  filter: brightness(1.05);
}

.ringchip.active.rc0 { background: #fbbf24; border-color: #fbbf24; }
.ringchip.active.rc1 { background: #f97316; border-color: #f97316; }
.ringchip.active.rc2 { background: #ef4444; border-color: #ef4444; }

.reset {
  background: none;
  border: none;
  color: #8a7548;
  font-size: .78rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 4px;
  font-family: inherit;
}

.targetrow {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 10px 0 0;
  flex-wrap: wrap;
  align-items: center;
}

.tgtlbl {
  font-size: 12px;
  color: #a89062;
  text-transform: uppercase;
  letter-spacing: .06em;
  font-weight: 700;
}

.tgtval {
  color: #fcd34d;
  font-weight: 800;
  font-size: .95rem;
}

.solve {
  margin-top: 16px;
  width: 100%;
  border: 1px solid #f59e0b;
  background: #f59e0b;
  color: #1b1204;
  border-radius: 10px;
  padding: 12px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
}

.solve:hover {
  filter: brightness(1.08);
}

.result {
  margin-top: 18px;
  border-top: 1px dashed #6b4b0b;
  padding-top: 16px;
}

.counts {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 10px 0;
}

.cnt {
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 12px;
  padding: 10px 18px;
  text-align: center;
  min-width: 92px;
}

.cnt .n {
  font-size: 1.9rem;
  font-weight: 800;
  color: #fcd34d;
  display: block;
  line-height: 1.1;
}

.cnt .l {
  font-size: 11px;
  color: #a89062;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.total {
  text-align: center;
  color: #e8d9b0;
  font-size: .95rem;
  margin: 6px 0 2px;
}

.total b {
  color: #fcd34d;
}

.seq {
  margin-top: 12px;
  background: rgba(0, 0, 0, .35);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: .82rem;
  line-height: 1.9;
  color: #d8c9a3;
  max-height: 220px;
  overflow-y: auto;
}

.seq b {
  color: #fcd34d;
}

.visit {
  color: #7ee787;
  font-weight: 700;
}

.vizwrap {
  text-align: center;
  margin-top: 6px;
}

svg {
  max-width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.hintline {
  text-align: center;
  font-size: .8rem;
  color: #8a7548;
  margin-top: 4px;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

.controls button {
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .16);
  color: #f5ead2;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.controls button:disabled {
  opacity: .35;
  cursor: default;
}

.stepcap {
  font-size: .85rem;
  color: #c7a967;
  min-width: 200px;
  text-align: center;
}

.note {
  font-size: .78rem;
  color: #8a7548;
  margin-top: 14px;
  line-height: 1.5;
}
</style>