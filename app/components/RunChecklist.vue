<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Item {
  id: string
  label: string
  group: string
  optional?: boolean
  condition?: (state: { round: number }) => boolean
  done: boolean
}

const round = ref<number>(1)
const showOptional = ref<boolean>(true)
const search = ref<string>('')

const baseItems: Item[] = [
  { id: 'spawn-setup', label: 'Spawn: build points / doors', group: 'Early Spawn', done: false },
  { id: 'flora-ee', label: 'Aether Flora EE (if doing early)', group: 'Early Spawn', optional: true, done: false },
  { id: 'janus-entry', label: 'Enter Janus hub', group: 'Janus Phase', done: false },
  { id: 'janus-prep', label: 'Janus: initial setup / route check', group: 'Janus Phase', done: false },
  { id: 'blackwater-run', label: 'Blackwater Lake: collect needed items', group: 'Resource Collection', done: false },
  { id: 'ashwood-run', label: 'Ashwood: gather all accessible items', group: 'Resource Collection', done: false },
  { id: 'carcass-exit115', label: 'Exit 115: get carcass (only < round 8 start)', group: 'Conditional (<8)', condition: s => s.round < 8, done: false },
  { id: 'farm-jar-place', label: 'Farm: place jar', group: 'Farm Prep', done: false },
  { id: 'axe-foot', label: 'Farm: axe foot step', group: 'Farm Prep', done: false },
  { id: 'klaus-boss', label: 'Janus: defeat Klaus boss / obtain part', group: 'Klaus Phase', done: false },
  { id: 'summon-klaus', label: 'Summon Klaus companion', group: 'Klaus Phase', done: false },
  { id: 'canister-start', label: 'Start canister fill process', group: 'Canister Fill', done: false },
  { id: 'canister-ashwood', label: 'Fill canister at Ashwood', group: 'Canister Fill', done: false },
  { id: 'canister-blackwater', label: 'Fill canister at Blackwater', group: 'Canister Fill', done: false },
  { id: 'canister-farm', label: 'Fill canister at Farm', group: 'Canister Fill', done: false },
  { id: 'wonder-weapon-complete', label: 'Complete Wonder Weapon steps', group: 'Farm Multi-task', done: false },
  { id: 'jar-horse', label: 'Jar horse step', group: 'Farm Multi-task', done: false },
  { id: 'twins-whisp-perk', label: 'Twins / Whisp perk EE (optional)', group: 'Farm Multi-task', optional: true, done: false },
  { id: 'power-followup', label: 'Activate / route to power after perk EE', group: 'Farm Multi-task', optional: true, done: false }
]

const items = ref<Item[]>([])

function load() {
  const raw = localStorage.getItem('run-checklist')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.items)) {
        // Merge with current base for forward compatibility
        const map: Record<string, Item> = {}
        baseItems.forEach(i => { map[i.id] = { ...i } })
        parsed.items.forEach((saved: any) => {
          if (map[saved.id]) map[saved.id].done = !!saved.done
        })
        items.value = Object.values(map)
      } else {
        items.value = baseItems.map(i => ({ ...i }))
      }
      if (typeof parsed.round === 'number') round.value = parsed.round
    } catch {
      items.value = baseItems.map(i => ({ ...i }))
    }
  } else {
    items.value = baseItems.map(i => ({ ...i }))
  }
}

function persist() {
  localStorage.setItem('run-checklist', JSON.stringify({ round: round.value, items: items.value }))
}

watch([items, round], persist, { deep: true })

function toggle(item: Item) { item.done = !item.done }
function resetAll() { items.value.forEach(i => i.done = false); persist() }
function markGroup(group: string, state: boolean) { items.value.filter(i => i.group === group && visibleItem(i)).forEach(i => i.done = state) }

function visibleItem(item: Item) {
  if (item.condition && !item.condition({ round: round.value })) return false
  if (!showOptional.value && item.optional) return false
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    if (!item.label.toLowerCase().includes(q)) return false
  }
  return true
}

const grouped = computed(() => {
  const map: Record<string, Item[]> = {}
  items.value.forEach(i => { if (visibleItem(i)) { (map[i.group] ||= []).push(i) } })
  return Object.entries(map).map(([group, arr]) => ({ group, arr }))
})

const progress = computed(() => {
  const vis = items.value.filter(visibleItem)
  const done = vis.filter(i => i.done).length
  return { done, total: vis.length, pct: vis.length ? Math.round(done / vis.length * 100) : 0 }
})

function exportRemaining() {
  const remaining = items.value.filter(i => visibleItem(i) && !i.done).map(i => i.label)
  return remaining.join(' → ')
}

function copyRemaining() {
  const text = exportRemaining()
  navigator.clipboard.writeText(text).catch(() => {})
}

function advanceRound() { round.value++ }
function decrementRound() { if (round.value > 1) round.value-- }

function quickRouteSuggestion() {
  // Outline micro-route based on state
  const r = round.value
  if (r < 5) return 'Finish spawn points + optional Flora EE.'
  if (r < 8) return 'Prioritize carcass at Exit 115 before Klaus.'
  if (r === 8) return 'Klaus boss at Janus then summon; start canister.'
  return 'Focus canister fills then consolidate Farm multitasks.'
}

load()
</script>

<template>
  <div class="checklist-wrapper">
    <div class="header-panel">
      <div class="flex flex-wrap items-center gap-3">
        <div class="round-box">
          <div class="label">Round</div>
          <div class="flex items-center gap-2">
            <button class="btn-mini" @click="decrementRound">-</button>
            <input type="number" v-model.number="round" min="1" class="round-input" />
            <button class="btn-mini" @click="advanceRound">+</button>
          </div>
        </div>
        <div class="progress-box">
          <div class="label">Progress</div>
          <div class="bar">
            <div class="fill" :style="{ width: progress.pct + '%' }"></div>
          </div>
          <div class="stats">{{ progress.done }}/{{ progress.total }} ({{ progress.pct }}%)</div>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="search" placeholder="Search" class="search-input" />
          <label class="toggle-opt">
            <input type="checkbox" v-model="showOptional" /> <span>Optional</span>
          </label>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <button class="btn" @click="resetAll">Reset</button>
          <button class="btn" @click="copyRemaining" title="Copy remaining tasks">Copy Remaining</button>
        </div>
      </div>
      <div class="route-hint">Route Hint: {{ quickRouteSuggestion() }}</div>
    </div>
    <div class="groups">
      <div v-for="g in grouped" :key="g.group" class="group-block">
        <div class="group-header">
          <h3>{{ g.group }}</h3>
          <div class="actions">
            <button class="btn-mini" @click="markGroup(g.group, true)" title="Mark all done">✔</button>
            <button class="btn-mini" @click="markGroup(g.group, false)" title="Unmark all">⟳</button>
          </div>
        </div>
        <ul class="item-list">
          <li v-for="item in g.arr" :key="item.id" :class="['item', item.done ? 'done' : '', item.optional ? 'optional' : '']" @click="toggle(item)">
            <div class="check"><span v-if="item.done">✔</span></div>
            <div class="label-text">{{ item.label }}</div>
            <div v-if="item.optional" class="opt-tag">OPT</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checklist-wrapper { display:flex; flex-direction:column; gap:1.25rem; }
.header-panel { backdrop-filter:blur(18px); background:linear-gradient(140deg,rgba(30,41,59,.6),rgba(12,18,30,.55)); border:1px solid rgba(255,255,255,.08); border-radius:1.25rem; padding:1rem 1.25rem; box-shadow:0 8px 28px -6px rgba(0,0,0,.5),0 2px 6px rgba(0,0,0,.4); }
.round-box,.progress-box { display:flex; flex-direction:column; gap:.35rem; }
.label { font-size:.65rem; letter-spacing:.1em; font-weight:600; text-transform:uppercase; color:#94a3b8; }
.round-input { width:4rem; background:#1e293b; border:1px solid rgba(255,255,255,.12); border-radius:.65rem; padding:.35rem .55rem; color:#f1f5f9; font-weight:600; text-align:center; }
.search-input { background:#1e293b; border:1px solid rgba(255,255,255,.12); border-radius:.7rem; padding:.55rem .75rem; color:#f1f5f9; width:10rem; }
.toggle-opt { display:flex; align-items:center; gap:.35rem; font-size:.7rem; font-weight:600; letter-spacing:.08em; color:#cbd5e1; }
.bar { position:relative; width:160px; height:10px; background:#0f172a; border:1px solid rgba(255,255,255,.12); border-radius:999px; overflow:hidden; }
.fill { position:absolute; top:0; left:0; bottom:0; background:linear-gradient(90deg,#06b6d4,#3b82f6); transition:width .35s ease; }
.stats { font-size:.6rem; font-weight:600; letter-spacing:.08em; color:#94a3b8; margin-top:.25rem; text-align:center; }
.btn,.btn-mini { cursor:pointer; border:none; font-weight:600; letter-spacing:.05em; }
.btn { background:linear-gradient(135deg,#0ea5e9,#6366f1); color:#0f172a; padding:.55rem .9rem; font-size:.7rem; border-radius:.75rem; box-shadow:0 4px 14px -3px rgba(0,0,0,.5); }
.btn:hover { filter:brightness(1.15); }
.btn-mini { background:#1e293b; color:#e2e8f0; padding:.35rem .55rem; font-size:.65rem; border-radius:.55rem; border:1px solid rgba(255,255,255,.12); }
.btn-mini:hover { background:#334155; }
.route-hint { margin-top:.6rem; font-size:.65rem; letter-spacing:.05em; font-weight:500; color:#cbd5e1; }
.groups { display:flex; flex-direction:column; gap:1rem; }
.group-block { backdrop-filter:blur(14px); background:linear-gradient(160deg,rgba(15,23,42,.55),rgba(30,41,59,.55)); border:1px solid rgba(255,255,255,.06); border-radius:1.1rem; padding:.85rem 1rem; box-shadow:0 4px 18px -4px rgba(0,0,0,.55); }
.group-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:.5rem; }
.group-header h3 { margin:0; font-size:.8rem; letter-spacing:.08em; font-weight:700; color:#e2e8f0; }
.actions { display:flex; gap:.4rem; }
.item-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.4rem; }
.item { display:flex; align-items:center; gap:.6rem; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:.8rem; padding:.55rem .75rem; font-size:.7rem; letter-spacing:.03em; cursor:pointer; transition:background .25s, border-color .25s; }
.item:hover { background:rgba(255,255,255,.08); }
.item.done { background:rgba(16,185,129,.15); border-color:rgba(16,185,129,.4); text-decoration:line-through; color:#10b981; }
.check { width:1.1rem; height:1.1rem; border:1px solid rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; border-radius:.4rem; font-size:.65rem; background:rgba(0,0,0,.25); }
.item.done .check { background:linear-gradient(135deg,#10b981,#059669); border-color:rgba(16,185,129,.6); color:#022c22; font-weight:700; }
.label-text { flex:1; }
.opt-tag { font-size:.55rem; font-weight:700; padding:.2rem .4rem; background:#334155; color:#e0f2fe; border-radius:.4rem; letter-spacing:.08em; }
@media (max-width: 700px) {
  .header-panel { padding:.85rem .9rem; }
  .groups { gap:.85rem; }
  .item { font-size:.65rem; }
  .group-header h3 { font-size:.75rem; }
}
</style>