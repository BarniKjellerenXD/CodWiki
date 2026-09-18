<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

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
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('run-checklist') : null
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
  if (typeof localStorage === 'undefined') return
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

onMounted(() => { load() })
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
/* ---------------------------------------------------------- Page chrome --- */

.checklist-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 52rem;
  margin: 0 auto;
}

.header-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.4rem;
  box-shadow: var(--shadow);
}

.round-box,
.progress-box {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--faint);
}

.round-input {
  width: 4.5rem;
  background: var(--bg-accent);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.55rem;
  color: var(--text);
  font-weight: 650;
  text-align: center;
}

.search-input {
  background: var(--bg-accent);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.8rem;
  color: var(--text);
  width: 12rem;
}

.toggle-opt {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}

.bar {
  position: relative;
  width: 180px;
  height: 8px;
  background: var(--bg-accent);
  border: 1px solid var(--line);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--gold);
  transition: width 0.35s ease;
}

.stats {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--faint);
  text-align: center;
}

.btn,
.btn-mini {
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.btn {
  background: var(--gold);
  border: 1px solid transparent;
  color: var(--on-gold);
  padding: 0.55rem 0.95rem;
  font-size: 0.78rem;
}

.btn:hover {
  background: var(--gold-bright);
}

.btn-mini {
  background: var(--surface-2);
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.3rem 0.55rem;
  font-size: 0.72rem;
  line-height: 1;
}

.btn-mini:hover {
  background: var(--surface-3);
  color: var(--text);
}

.route-hint {
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--line);
  font-size: 0.78rem;
  color: var(--muted);
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.group-block {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem 1.15rem 1.15rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.65rem;
}

.group-header h3 {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--gold);
}

.actions {
  display: flex;
  gap: 0.4rem;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.8rem;
  font-size: 0.86rem;
  line-height: 1.4;
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.item:hover {
  border-color: var(--line-strong);
}

.item.optional {
  border-left: 2px solid var(--line-strong);
}

.item.done {
  background: rgba(127, 180, 122, 0.1);
  border-color: rgba(127, 180, 122, 0.35);
  color: #9dc099;
}

.item.done .label-text {
  text-decoration: line-through;
}

.check {
  flex: none;
  width: 1.15rem;
  height: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  background: var(--bg-accent);
  font-size: 0.7rem;
  color: var(--on-gold);
}

.item.done .check {
  background: #7fb47a;
  border-color: #7fb47a;
  color: #12100c;
  font-weight: 700;
}

.label-text {
  flex: 1;
}

.opt-tag {
  flex: none;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.2rem 0.4rem;
  background: var(--surface-3);
  border: 1px solid var(--line);
  color: var(--muted);
  border-radius: 5px;
  letter-spacing: 0.08em;
}

@media (max-width: 700px) {
  .header-panel {
    padding: 1rem 1.1rem;
  }

  .groups {
    gap: 1rem;
  }

  .item {
    font-size: 0.82rem;
  }

  .bar {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }
}
</style>