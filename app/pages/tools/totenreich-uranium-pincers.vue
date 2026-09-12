<template>
  <ToolShell map-name="Totenreich" back-to="/guides/totenreich">
    <template #title>Uranium Pincers Solver</template>
    <template #sub>Mark the tubes already in the wall, and the solver shows where the <strong>3 uranium tubes</strong> must go.</template>
    <template #howto>
      <b>How it works</b> — the 4×4 grid shows the wall of tube sockets. <b>Tap the 6 cells that already hold a tube</b>
      (they turn <span style="color:var(--gold)">gold</span>). The solver then works out every way to place the
      <b>3 uranium tubes</b> so the wall forms a single big chunk with the right leftovers, and lights those cells
      <span style="color:#e04b4b">red</span>.
    </template>

    <div class="blocklabel">① Grid — tap cells that already hold a tube <span class="hint">tap again to undo</span></div>
    <div class="ugrid">
      <div
        v-for="i in 16"
        :key="i"
        class="ucell"
        :class="{ r: placed.includes(i - 1), u: solution?.includes(i - 1) }"
        @click="onCell(i - 1)"
      >{{ placed.includes(i - 1) ? '■' : (solution?.includes(i - 1) ? '☢' : '') }}</div>
    </div>
    <div class="ustatus" :class="statusClass">{{ status }}</div>
    <div class="usol" :class="{ show: solCount > 0 }">
      {{ solCount }} valid layout{{ solCount === 1 ? '' : 's' }} exist with this grid — any of them works.
    </div>

    <div class="opts">
      <button type="button" class="btn ghost" @click="placed = []">↻ Reset</button>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const placed = ref<number[]>([])
const solution = ref<number[] | null>(null)
const solCount = ref(0)

function compSizes(cellsOn: number[]): number[] {
  const set = new Set(cellsOn)
  const seen = new Set<number>()
  const sizes: number[] = []
  for (const start of cellsOn) {
    if (seen.has(start)) continue
    const q = [start]
    seen.add(start)
    let n = 0
    while (q.length) {
      const cur = q.pop()!
      n++
      const r = Math.floor(cur / 4)
      const c = cur % 4
      for (const [rr, cc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as const) {
        if (rr < 0 || rr > 3 || cc < 0 || cc > 3) continue
        const j = rr * 4 + cc
        if (set.has(j) && !seen.has(j)) {
          seen.add(j)
          q.push(j)
        }
      }
    }
    sizes.push(n)
  }
  return sizes.sort((a, b) => a - b)
}

const VALID = new Set(['2,7', '1,1,7', '1,1,1,6'])

function solve(r: number[]): number[][] {
  const empt: number[] = []
  for (let i = 0; i < 16; i++) if (!r.includes(i)) empt.push(i)
  const out: number[][] = []
  for (let a = 0; a < empt.length; a++)
    for (let b = a + 1; b < empt.length; b++)
      for (let c = b + 1; c < empt.length; c++) {
        const combo = [empt[a], empt[b], empt[c]]
        if (VALID.has(compSizes([...r, ...combo]).join(','))) out.push(combo)
      }
  return out
}

function run() {
  solution.value = null
  solCount.value = 0
  if (placed.value.length === 6) {
    const all = solve(placed.value)
    solCount.value = all.length
    if (all.length) solution.value = all[0]
  }
}

const status = computed(() => {
  const n = placed.value.length
  if (n < 6) return `${6 - n} more tube${6 - n === 1 ? '' : 's'} to place — tap the cells that already hold a tube`
  if (solution.value) return '✓ Place the uranium tubes on the 3 red cells'
  return 'No arrangement works with this grid — check the placed tubes'
})
const statusClass = computed(() => {
  if (placed.value.length < 6) return ''
  return solution.value ? 'ok' : 'bad'
})

function onCell(i: number) {
  const at = placed.value.indexOf(i)
  if (at !== -1) placed.value.splice(at, 1)
  else if (placed.value.length < 6) placed.value.push(i)
  run()
}
</script>

<style scoped>
.ugrid {
  display: grid;
  grid-template-columns: repeat(4, 62px);
  gap: 6px;
  justify-content: center;
  margin-top: .7rem;
}

.ucell {
  width: 62px;
  height: 62px;
  border-radius: .75rem;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .04);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  cursor: pointer;
  transition: all .15s;
  user-select: none;
  -webkit-user-select: none;
}

.ucell:hover {
  border-color: rgba(245, 158, 11, .5);
}

.ucell.r {
  border-color: rgba(245, 158, 11, .7);
  background: linear-gradient(135deg, rgba(245, 158, 11, .3), rgba(249, 115, 22, .16));
  color: #ffe8bf;
}

.ucell.u {
  border-color: #e04b4b;
  background: linear-gradient(135deg, #c22b2b, #8f1414);
  color: #fff;
  box-shadow: 0 0 14px rgba(194, 43, 43, .4);
}

.ustatus {
  margin-top: .9rem;
  text-align: center;
  font-size: .88rem;
  font-weight: 700;
  color: #ffffffb3;
  min-height: 1.4em;
}

.ustatus.ok {
  color: #86efac;
}

.ustatus.bad {
  color: #fca5a5;
}

.usol {
  display: none;
  margin-top: .8rem;
  text-align: center;
  font-size: .78rem;
  color: #ffffff99;
}

.usol.show {
  display: block;
}
</style>
