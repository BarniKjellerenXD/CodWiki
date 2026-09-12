<template>
  <ToolShell map-name="Astra Malorum" back-to="/guides/astra-malorum">
    <template #title>Mars Console Code</template>
    <template #sub>Turn Oscar's <strong>recording #20</strong> into the console code — each planet is its solar-system position.</template>
    <template #howto>
      <b>How it works</b> — play <b>Oscar's recording #20</b> and note the 3 planets it names. Each planet hides its
      number: its position in the solar system (Mercury = 01, Venus = 02, … Neptune = 08). Tap the planets
      <b>in the order the recording gives them</b>.
    </template>

    <div class="blocklabel">① Planets from the recording <span class="hint">in order — 3 planets</span></div>
    <div class="planets">
      <button
        v-for="p in planets"
        :key="p.id"
        type="button"
        class="pl"
        :class="{ sel: picked.includes(p.id), dis: picked.length >= 3 && !picked.includes(p.id) }"
        @click="toggle(p.id)"
      >
        <div class="dot" :style="{ background: p.c }"></div>
        <div class="nm">{{ p.id }}</div>
        <div class="po">{{ p.n < 10 ? '0' + p.n : p.n }}</div>
      </button>
    </div>

    <div v-if="picked.length === 3" class="mcode show">
      <div class="t">Mars console code</div>
      <div class="v">{{ code }}</div>
    </div>

    <div class="opts">
      <button type="button" class="btn ghost" @click="picked = []">↻ Reset</button>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const planets = [
  { id: 'mercury', n: 1, c: '#b5aa9a' },
  { id: 'venus', n: 2, c: '#e0c98f' },
  { id: 'earth', n: 3, c: '#5f9e6e' },
  { id: 'mars', n: 4, c: '#c93b3b' },
  { id: 'jupiter', n: 5, c: '#d2a679' },
  { id: 'saturn', n: 6, c: '#d4a96a' },
  { id: 'uranus', n: 7, c: '#9fd8d4' },
  { id: 'neptune', n: 8, c: '#4d7fc7' },
]

const picked = ref<string[]>([])
const code = computed(() =>
  picked.value
    .map(id => planets.find(p => p.id === id)!)
    .map(p => (p.n < 10 ? '0' + p.n : String(p.n)))
    .join(' - ')
)

function toggle(id: string) {
  const at = picked.value.indexOf(id)
  if (at !== -1) picked.value.splice(at, 1)
  else if (picked.value.length < 3) picked.value.push(id)
}
</script>

<style scoped>
.planets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
  gap: .55rem;
}

.pl {
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: .8rem;
  background: linear-gradient(155deg, rgba(255, 255, 255, .05), rgba(0, 0, 0, .12));
  color: inherit;
  font-family: inherit;
  padding: .6rem .3rem .5rem;
  cursor: pointer;
  text-align: center;
  transition: all .15s;
}

.pl:hover {
  border-color: rgba(245, 158, 11, .5);
}

.pl.sel {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(245, 158, 11, .22), rgba(249, 115, 22, .10));
}

.pl.dis {
  opacity: .3;
  pointer-events: none;
}

.dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin: 0 auto .35rem;
  border: 1px solid rgba(255, 255, 255, .25);
}

.nm {
  font-size: .72rem;
  font-weight: 700;
  text-transform: capitalize;
  color: #ffffffcc;
}

.po {
  margin-top: .2rem;
  font-size: .78rem;
  font-weight: 800;
  color: var(--gold);
}

.mcode {
  display: none;
  margin-top: 1rem;
  border-radius: 1rem;
  padding: .85rem 1rem;
  border: 1px solid rgba(245, 158, 11, .35);
  background: linear-gradient(135deg, rgba(245, 158, 11, .12), rgba(255, 255, 255, .02));
  text-align: center;
}

.mcode.show {
  display: block;
}

.mcode .t {
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #ffffff99;
}

.mcode .v {
  margin-top: .25rem;
  font-size: 1.6rem;
  font-weight: 800;
  color: #ffe8bf;
  font-family: ui-monospace, monospace;
}
</style>
