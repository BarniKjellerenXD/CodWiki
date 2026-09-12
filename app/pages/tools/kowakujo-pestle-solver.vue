<template>
  <ToolShell map-name="Kowakujō" back-to="/guides/kowakujo">
    <template #title>📜 Pestle Scroll Solver</template>
    <template #sub>Storage Rooms — hit the scrolls so they all slide <strong>into</strong> the wall. Set your current board below, then hit <strong>Solve</strong>.</template>
    <template #howto>
      <b>Legend</b> — <b>OUT</b> scrolls are sticking out; <b>IN</b> scrolls are pushed in. Tap cells to toggle,
      then hit <b>Solve</b>. If no solution exists with the current flip rule, the tool retries with the other rule.
    </template>

    <div class="legend">
      <span><span class="scroll out" /> OUT — sticking out</span>
      <span><span class="scroll in" /> IN — pushed in</span>
    </div>

    <div class="grid">
      <button
        v-for="i in 9"
        :key="i"
        type="button"
        class="cell"
        :class="state & (1 << (i - 1)) ? 'out' : 'in'"
        @click="onCell(i - 1)"
      >
        <span class="scroll" />
        <span class="tag">{{ state & (1 << (i - 1)) ? 'OUT' : 'IN' }}</span>
        <span v-if="solvedSteps && solvedSteps.includes(i - 1)" class="badge">{{ solvedSteps.indexOf(i - 1) + 1 }}</span>
      </button>
    </div>

    <div class="quick">
      <button type="button" :disabled="!!solvedSteps" @click="state = 511">Set all OUT</button>
      <button type="button" :disabled="!!solvedSteps" @click="state = 0">Set all IN</button>
    </div>

    <div class="controls">
      <span class="rulebox">Flip rule
        <span class="seg">
          <button type="button" :class="{ on: rule === 'self' }" @click="rule = 'self'">Self + around</button>
          <button type="button" :class="{ on: rule === 'around' }" @click="rule = 'around'">Around only</button>
        </span>
      </span>
      <button type="button" class="btn" @click="solve">🧮 Solve</button>
      <button type="button" class="btn ghost" @click="reset">Reset</button>
    </div>

    <div class="result" :class="{ show: !!solvedSteps || solveFailed }">
      <h2>Solution <span class="rule-note">{{ solvedRule === 'self' ? 'rule: Self + Around' : solvedRule === 'around' ? 'rule: Around only' : '' }}</span></h2>
      <div class="steps">
        <template v-if="solvedSteps">
          <span v-for="(s, i) in solvedSteps" :key="i" class="step-chip"><b>{{ i + 1 }}</b>{{ names[s] }}</span>
        </template>
        <span v-else-if="solveFailed" style="color:#fca5a5;font-weight:700">No solution from this state with either flip rule — double-check the board.</span>
      </div>
      <p class="hint">Tap each scroll in the grid above as you shoot it in-game — it flips on the board too. You can shoot them in any order.</p>
    </div>

    <div class="done" :class="{ show: done }">🎉 All scrolls pushed in! Grab the <strong>Doctor's Note</strong> and the Pestle.</div>
  </ToolShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const names = ['Top-Left', 'Top-Middle', 'Top-Right', 'Middle-Left', 'Center', 'Middle-Right', 'Bottom-Left', 'Bottom-Middle', 'Bottom-Right']
// bit set = OUT (sticking out). Goal: all IN = 0.
const NB: number[] = []
for (let r = 0; r < 3; r++)
  for (let c = 0; c < 3; c++) {
    let m = 0
    const add = (rr: number, cc: number) => { if (rr >= 0 && rr < 3 && cc >= 0 && cc < 3) m |= 1 << (rr * 3 + cc) }
    add(r - 1, c); add(r + 1, c); add(r, c - 1); add(r, c + 1)
    NB[r * 3 + c] = m
  }
const SELF_MASK = NB.map((m, i) => m | (1 << i))

const rule = ref<'self' | 'around'>('self')
const state = ref(511)
const solvedSteps = ref<number[] | null>(null)
const solvedRule = ref<'self' | 'around' | null>(null)
const solveFailed = ref(false)
const done = ref(false)

function solveBFS(start: number, useSelf: boolean): number[] | null {
  const M = useSelf ? SELF_MASK : NB
  const q = [start]
  let head = 0
  const prev: Record<number, number> = {}
  const pmove: Record<number, number> = {}
  prev[start] = -1
  while (head < q.length) {
    const s = q[head++]
    if (s === 0) break
    for (let i = 0; i < 9; i++) {
      const ns = s ^ M[i]
      if (!(ns in prev)) { prev[ns] = s; pmove[ns] = i; q.push(ns) }
    }
  }
  if (!(0 in prev) && start !== 0) return null
  const steps: number[] = []
  let cur = 0
  while (cur !== start) { steps.push(pmove[cur]); cur = prev[cur] }
  return steps
}

function applyPress(i: number) {
  state.value ^= rule.value === 'self' ? SELF_MASK[i] : NB[i]
}

function onCell(i: number) {
  if (solvedSteps.value) {
    const idx = solvedSteps.value.indexOf(i)
    if (idx === -1) return
    applyPress(i)
    solvedSteps.value = solvedSteps.value.slice()
    solvedSteps.value.splice(idx, 1)
    if (solvedSteps.value.length === 0) {
      solvedSteps.value = null
      done.value = true
    }
    return
  }
  state.value ^= 1 << i
}

function solve() {
  let steps = solveBFS(state.value, rule.value === 'self')
  let usedRule = rule.value
  if (!steps) {
    usedRule = rule.value === 'self' ? 'around' : 'self'
    steps = solveBFS(state.value, usedRule === 'self')
  }
  if (!steps) {
    solveFailed.value = true
    solvedSteps.value = null
    solvedRule.value = null
    return
  }
  solvedSteps.value = steps
  solvedRule.value = usedRule
  solveFailed.value = false
  done.value = false
}

function reset() {
  solvedSteps.value = null
  solvedRule.value = null
  solveFailed.value = false
  done.value = false
  state.value = 511
}
</script>

<style scoped>
.legend {
  display: flex;
  gap: .9rem;
  flex-wrap: wrap;
  margin: 1.15rem 0 .7rem;
  font-size: .82rem;
  color: #ffffffcc;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .65rem;
  max-width: 330px;
  margin: 0 auto;
}

.cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: 1rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, .10);
  background: rgba(255, 255, 255, .03);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .3rem;
  transition: border-color .18s, background .18s, transform .12s;
  user-select: none;
  -webkit-user-select: none;
  font-family: inherit;
  color: inherit;
}

.cell:hover {
  border-color: rgba(245, 158, 11, .45);
  background: rgba(245, 158, 11, .06);
}

.cell:active {
  transform: scale(.97);
}

.scroll {
  position: relative;
  width: 34px;
  height: 58px;
  border-radius: 7px;
  border: 1px solid rgba(0, 0, 0, .45);
  transition: all .22s ease;
  display: inline-block;
}

.scroll::before,
.scroll::after {
  content: "";
  position: absolute;
  left: -2px;
  right: -2px;
  height: 11px;
  border-radius: 4px;
  background: #c89a52;
  border: 1px solid rgba(0, 0, 0, .4);
  z-index: 2;
}

.scroll::before { top: -4px; }
.scroll::after { bottom: -4px; }

.legend .scroll.out,
.cell.out .scroll {
  background: linear-gradient(180deg, #f6dcab, #e9c184);
  box-shadow: 0 8px 20px rgba(245, 158, 11, .30), inset 0 1px 0 rgba(255, 255, 255, .55);
  transform: translateX(6px);
}

.legend .scroll.in,
.cell.in .scroll {
  background: linear-gradient(180deg, #8d7a5a, #756546);
  filter: brightness(.55) saturate(.6);
  box-shadow: inset 0 4px 10px rgba(0, 0, 0, .65);
  transform: translateX(-4px) scale(.93);
}

.cell .tag {
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .12em;
}

.cell.out .tag { color: var(--gold); }
.cell.in .tag { color: #8a8a93; }

.badge {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  z-index: 5;
  background: linear-gradient(135deg, var(--gold), var(--orange));
  color: #221503;
  font-weight: 800;
  font-size: .78rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(245, 158, 11, .55), 0 0 0 2px rgba(10, 10, 12, .6);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .7rem;
  flex-wrap: wrap;
  margin-top: 1.15rem;
}

.rulebox {
  display: flex;
  align-items: center;
  gap: .45rem;
  font-size: .78rem;
  color: #ffffffb0;
}

.seg {
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: .7rem;
  overflow: hidden;
}

.seg button {
  border: 0;
  background: transparent;
  color: #ffffffa6;
  font-size: .74rem;
  font-weight: 700;
  padding: .42rem .6rem;
  cursor: pointer;
  transition: all .18s;
  font-family: inherit;
}

.seg button.on {
  background: linear-gradient(135deg, rgba(245, 158, 11, .35), rgba(249, 115, 22, .22));
  color: #ffe8bf;
}

.seg button:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, .12);
}

.quick {
  display: flex;
  justify-content: center;
  gap: .6rem;
  margin-top: .6rem;
}

.quick button {
  border: 0;
  background: transparent;
  color: #fcd34d;
  font-size: .72rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  opacity: .75;
  font-family: inherit;
}

.quick button:disabled {
  opacity: .3;
  cursor: default;
}

.quick button:hover:not(:disabled) {
  opacity: 1;
}

.result {
  display: none;
  margin-top: 1.2rem;
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(245, 158, 11, .3);
  background: linear-gradient(135deg, rgba(245, 158, 11, .10), rgba(255, 255, 255, .02));
}

.result.show {
  display: block;
}

.result h2 {
  font-size: .95rem;
  margin-bottom: .6rem;
  color: #ffe8bf;
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
}

.rule-note {
  font-size: .7rem;
  color: #ffffff99;
  font-weight: 600;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}

.step-chip {
  border: 1px solid rgba(245, 158, 11, .4);
  border-radius: .55rem;
  background: rgba(245, 158, 11, .12);
  color: #ffe8bf;
  font-size: .78rem;
  font-weight: 700;
  padding: .3rem .55rem;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
}

.step-chip b {
  color: var(--amber);
}

.done {
  display: none;
  margin-top: .9rem;
  border: 1px solid rgba(34, 197, 94, .4);
  border-radius: .9rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, .12), rgba(255, 255, 255, .02));
  color: #bbf7d0;
  font-size: .85rem;
  font-weight: 700;
  padding: .6rem .8rem;
}

.done.show {
  display: block;
}
</style>
