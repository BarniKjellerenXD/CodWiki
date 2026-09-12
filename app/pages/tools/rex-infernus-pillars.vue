<template>
  <ToolShell map-name="Rex Infernus" back-to="/guides/rex-infernus">
    <template #title>Pillars &amp; Levers</template>
    <template #sub>Pick the riddle you received at the Dravakar temple and get the <strong>lever pulls</strong>.</template>
    <template #howto>
      <b>Dravakar temple pillars</b> — one of four riddles is active. Pick the riddle you received and pull each
      lever the shown number of times. <b>Order doesn't matter</b> and the pillars always start in the same position.
      Levers: <b>left</b> = shooting star + galaxy, <b>middle</b> = shooting star + star, <b>right</b> = moon + star.
    </template>

    <div class="blocklabel">① Your riddle</div>
    <div class="riddles">
      <button
        v-for="r in riddles"
        :key="r.key"
        type="button"
        class="riddle"
        :class="{ sel: selected === r.key }"
        @click="selected = r.key"
      >
        <span class="q">{{ r.q }}</span>
      </button>
    </div>

    <div v-if="selected" class="results show">
      <div class="res-card">
        <h3>✨ Lever pulls</h3>
        <div class="levers">
          <div v-for="(l, i) in levers" :key="l.n" class="lever">
            <div class="lv">{{ l.n }}</div>
            <div class="pair">{{ l.p }}</div>
            <div class="pulls">×{{ current!.v[i] }}</div>
          </div>
        </div>
      </div>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const riddles = [
  { key: 'runnerStars', q: '"I remember the runner who races the stars, while the moons and galaxies stay true"', v: [0, 2, 3] },
  { key: 'driftRunner', q: '"I drift toward the runner who races the moon, borrowing from the galaxies while the stars stay true"', v: [3, 2, 1] },
  { key: 'driftStars', q: '"I drift toward the stars that remember the moons, borrowing the runner who races the galaxies"', v: [1, 2, 2] },
  { key: 'galaxiesMoons', q: '"I remember the galaxies that drift toward the moons, borrowing the runner who races the stars"', v: [2, 0, 2] },
]
const levers = [
  { n: 'Left lever', p: 'shooting star + galaxy' },
  { n: 'Middle lever', p: 'shooting star + star' },
  { n: 'Right lever', p: 'moon + star' },
]

const selected = ref<string | null>(null)
const current = computed(() => riddles.find(r => r.key === selected.value) ?? null)
</script>

<style scoped>
.riddles {
  display: flex;
  flex-direction: column;
  gap: .55rem;
  margin-top: .5rem;
}

.riddle {
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: .9rem;
  padding: .75rem .9rem;
  cursor: pointer;
  background: linear-gradient(155deg, rgba(255, 255, 255, .05), rgba(0, 0, 0, .12));
  text-align: left;
  font-family: inherit;
  transition: all .15s;
}

.riddle:hover {
  border-color: rgba(245, 158, 11, .5);
}

.riddle.sel {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(245, 158, 11, .2), rgba(249, 115, 22, .1));
}

.riddle .q {
  font-size: .82rem;
  color: #ffffffcc;
  font-style: italic;
  line-height: 1.5;
}

.levers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: .7rem;
  margin-top: .9rem;
}

.lever {
  border: 1px solid rgba(245, 158, 11, .28);
  border-radius: 1rem;
  padding: .85rem .7rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, .09), rgba(255, 255, 255, .02));
  text-align: center;
}

.lever .lv {
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #ffffff99;
}

.lever .pair {
  margin-top: .3rem;
  font-size: .74rem;
  color: #ffffffcc;
  font-weight: 600;
}

.lever .pulls {
  margin-top: .45rem;
  font-size: 2rem;
  font-weight: 800;
  color: #ffe8bf;
  font-family: ui-monospace, monospace;
}
</style>
