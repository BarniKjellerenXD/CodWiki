<template>
  <ToolShell map-name="Kowakujō" back-to="/guides/kowakujo">
    <template #title>🕐 Clock &amp; Flags Solver</template>
    <template #sub>Enter the clock's <strong>4-digit code</strong> and how many flags of each size you <strong>found</strong> — the tool works out which flags go in which area, using each flag only once.</template>
    <template #howto>
      <b>Code order</b> — <span style="color:var(--gold)">一</span> (1) Stables · <span style="color:var(--gold)">二</span> (2) Flower Garden · <span style="color:var(--gold)">三</span> (3) Central Courtyard · <span style="color:var(--gold)">四</span> (4) Spawn / Outer Ward.<br>
      <b>Flags</b> spawn where the bamboo shoots were, each with a symbol count (3 diamonds, 4 squares…). Count what you picked up, then drop the chosen flags into each area's bamboo shoot and interact with the clock again.
    </template>

    <div class="blocklabel">① Code from the clock</div>
    <div class="inputs">
      <div v-for="(loc, i) in locs" :key="loc.name" class="inbox">
        <label><span class="kanji">{{ loc.kanji }}</span>{{ loc.name }}</label>
        <input v-model.number="code[i]" type="number" min="0" max="99" placeholder="digit" @keydown.enter="solve">
      </div>
    </div>

    <div class="blocklabel">② Flags you have <span class="hint">by symbol count — 0 if you found none</span></div>
    <div class="flags">
      <div v-for="s in maxSize" :key="s" class="fbox">
        <label><b>{{ s }}</b>-sym</label>
        <input v-model.number="inv[s - 1]" type="number" min="0" max="20" @keydown.enter="solve">
      </div>
    </div>

    <div class="opts">
      <span class="optbox">Max flags per number
        <select v-model.number="cap">
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
        </select>
      </span>
      <button type="button" class="btn" @click="solve">🚩 Solve</button>
      <button type="button" class="btn ghost" @click="reset">Reset</button>
    </div>

    <div class="results" :class="{ show: result }">
      <template v-if="result">
        <div v-if="result.type === 'noflags'" class="res-card">
          <h3>Enter how many flags you found first (section ②)</h3>
        </div>

        <div v-else-if="result.type === 'none'" class="res-card">
          <h3>No way to cover all 4 numbers with these flags</h3>
          <div class="res-warn">Check the code or the flag counts. Possible combos per number (from what you have):</div>
          <template v-for="(n, i) in code" :key="i">
            <h3 style="margin-top:.8rem">
              <span class="kanji">{{ locs[i].kanji }}</span>{{ locs[i].name }}
              <span class="need">need <b>{{ n }}</b></span>
            </h3>
            <div v-if="!genPatterns(n, inv, cap).length" class="res-warn">
              Nothing can make {{ n }} — need bigger flags or a higher "Max flags per number".
            </div>
            <div v-else class="combos">
              <span v-for="(p, k) in genPatterns(n, inv, cap).map(patToString)" :key="k" class="combo">
                {{ p }} <span class="flags">({{ p.length ? p.split('+').length : 0 }})</span>
              </span>
            </div>
          </template>
        </div>

        <div v-else class="sol-wrap">
          <div class="sol-head">✨ Solution — place these<span class="meta">{{ bestTotal }} flag{{ bestTotal === 1 ? '' : 's' }} total</span></div>
          <div v-for="(pat, i) in result.best" :key="i" class="res-card">
            <h3>
              <span class="kanji">{{ locs[i].kanji }}</span>{{ locs[i].name }}
              <span class="need">need <b>{{ code[i] }}</b></span>
            </h3>
            <div v-if="!patToString(pat).length" class="res-empty">✓ Nothing to place here — skip this number.</div>
            <div v-else class="combos">
              <span class="combo best">{{ patToString(pat) }} <span class="flags">({{ pat.reduce((a, b) => a + b, 0) }})</span></span>
            </div>
          </div>
          <div class="unused">Unused: {{ leftoverText }}</div>
          <div v-if="result.alts.length" class="alts">
            <div class="alt-title">Alternative ways ({{ result.alts.length }} more)</div>
            <div v-for="(alt, a) in result.alts.slice(0, 3)" :key="a" class="alt">
              Option {{ a + 2 }}: {{ alt.map((pat, i) => `<b>${locs[i].kanji}</b> ${patToString(pat) || '—'}`).join(' · ') }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const locs = [
  { kanji: '一', name: 'Stables' },
  { kanji: '二', name: 'Flower Garden' },
  { kanji: '三', name: 'Central Courtyard' },
  { kanji: '四', name: 'Spawn / Outer Ward' },
]
const maxSize = 9

const code = ref<(number | '')[]>(['', '', '', ''])
const inv = ref<number[]>(new Array(maxSize).fill(0))
const cap = ref(3)
const result = ref<null | { type: 'noflags' | 'none' } | { type: 'ok', best: number[][], alts: number[][] }>(null)

const bestTotal = computed(() =>
  result.value?.type === 'ok'
    ? result.value.best.reduce((a, pat) => a + pat.reduce((x, y) => x + y, 0), 0)
    : 0
)
const leftoverText = computed(() => {
  if (result.value?.type !== 'ok') return ''
  const used = new Array(maxSize).fill(0)
  result.value.best.forEach(pat => pat.forEach((c, s) => { used[s] += c }))
  const leftover: string[] = []
  for (let s = 0; s < maxSize; s++) {
    const left = inv.value[s] - used[s]
    if (left > 0) leftover.push(`${left}× ${s + 1}-flag`)
  }
  return leftover.length ? leftover.join(' · ') : 'none — all flags placed'
})

function readCode(): number[] {
  return code.value.map(v => {
    const n = parseInt(String(v), 10)
    return isNaN(n) || n < 0 ? 0 : n
  })
}
function readInv(): number[] {
  return inv.value.map(v => {
    const n = parseInt(String(v), 10)
    return isNaN(n) || n < 0 ? 0 : n
  })
}

// patterns for target n: count-vectors over sizes, sum(size*count)=n, total flags ≤ cap,
// each count ≤ inv[size-1]. Non-increasing sizes to avoid duplicate multisets.
function genPatterns(n: number, inventory: number[], capLimit: number): number[][] {
  if (n === 0) return [new Array(maxSize).fill(0)]
  const out: number[][] = []
  function rec(sizeIdx: number, rem: number, vec: number[]) {
    if (rem === 0) { out.push(vec.slice()); return }
    if (sizeIdx < 0 || rem < 0) return
    const used = vec.reduce((a, b) => a + b, 0)
    if (used >= capLimit) return
    const size = sizeIdx + 1
    const maxTake = Math.min(inventory[sizeIdx], Math.floor(rem / size), capLimit - used)
    for (let t = maxTake; t >= 0; t--) {
      if (t > 0) { vec[sizeIdx] += t; rec(sizeIdx - 1, rem - t * size, vec); vec[sizeIdx] -= t }
      else rec(sizeIdx - 1, rem, vec)
    }
  }
  rec(maxSize - 1, n, new Array(maxSize).fill(0))
  return out
}

// DFS assign patterns to locations
function solveAll(cd: number[], inventory: number[], capLimit: number): number[][][] {
  const solutions: number[][][] = []
  const MAX_SOL = 200
  function dfs(i: number, invLeft: number[], used: number[][]) {
    if (solutions.length >= MAX_SOL) return
    if (i === cd.length) { solutions.push(used.slice()); return }
    const pats = genPatterns(cd[i], invLeft, capLimit)
    if (pats.length === 0) return
    for (const pat of pats) {
      if (solutions.length >= MAX_SOL) break
      const inv2 = invLeft.slice()
      let ok = true
      for (let s = 0; s < maxSize; s++) {
        if (inv2[s] < pat[s]) { ok = false; break }
        inv2[s] -= pat[s]
      }
      if (!ok) continue
      used.push(pat)
      dfs(i + 1, inv2, used)
      used.pop()
    }
  }
  dfs(0, inventory.slice(), [])
  // score: fewer total flags first
  solutions.sort((a, b) => {
    const ta = a.reduce((acc, pat) => acc + pat.reduce((x, y) => x + y, 0), 0)
    const tb = b.reduce((acc, pat) => acc + pat.reduce((x, y) => x + y, 0), 0)
    return ta - tb
  })
  return solutions
}

function patToString(pat: number[]): string {
  const parts: string[] = []
  for (let s = maxSize - 1; s >= 0; s--)
    for (let k = 0; k < pat[s]; k++) parts.push(`${s + 1}-flag`)
  return parts.join(' + ')
}

function solve() {
  const cd = readCode()
  const inventory = readInv()
  if (inventory.reduce((a, b) => a + b, 0) === 0) {
    result.value = { type: 'noflags' }
    return
  }
  const solutions = solveAll(cd, inventory, cap.value)
  if (solutions.length === 0) {
    result.value = { type: 'none' }
  } else {
    result.value = { type: 'ok', best: solutions[0], alts: solutions.slice(1) }
  }
}

function reset() {
  code.value = ['', '', '', '']
  inv.value = new Array(maxSize).fill(0)
  cap.value = 3
  result.value = null
}
useToolState('kowakujo-clock-solver', { code, inv, cap, result })
</script>

<style scoped>
.inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: .7rem;
}

.inbox {
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: .9rem;
  padding: .65rem .75rem;
  background: linear-gradient(155deg, rgba(255, 255, 255, .05), rgba(0, 0, 0, .12));
  display: flex;
  flex-direction: column;
  gap: .35rem;
}

.inbox label {
  font-size: .72rem;
  font-weight: 800;
  color: #ffffffb3;
  display: flex;
  align-items: center;
  gap: .35rem;
}

.inbox .kanji {
  color: var(--gold);
  font-size: 1rem;
}

.inbox input {
  width: 100%;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  padding: .25rem .3rem;
}

.inbox input::placeholder {
  color: #ffffff40;
  font-weight: 600;
  font-size: 1rem;
}

.flags {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
  gap: .5rem;
}

.fbox {
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: .75rem;
  padding: .45rem .5rem;
  background: linear-gradient(155deg, rgba(255, 255, 255, .04), rgba(0, 0, 0, .12));
  display: flex;
  flex-direction: column;
  gap: .25rem;
  align-items: center;
}

.fbox label {
  font-size: .66rem;
  font-weight: 800;
  color: #ffffff99;
}

.fbox label b {
  color: var(--gold);
  font-size: .85rem;
}

.fbox input {
  width: 100%;
  font-size: 1.1rem;
  font-weight: 800;
  text-align: center;
  padding: .18rem .2rem;
}

.sol-wrap {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.alts {
  margin-top: .7rem;
  border-top: 1px dashed rgba(255, 255, 255, .14);
  padding-top: .6rem;
}
</style>
