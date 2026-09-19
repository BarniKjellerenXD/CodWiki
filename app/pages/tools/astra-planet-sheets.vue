<template>
  <ToolShell map-name="Astra Malorum" back-to="/guides/astra-malorum">
    <template #title>Planet Sheets Compass</template>
    <template #sub>Assign each <strong>planet sheet</strong> to its compass direction — each planet is used once.</template>
    <template #howto>
      <b>How it works</b> — find the <b>3 planet sheets</b> around the map. Each sheet tells you which direction
      its planet sits in on the compass. Tap a planet dot under a direction to assign it — each planet is used
      <b>once</b>, so assigning it elsewhere moves it.
    </template>

    <div class="blocklabel">① Compass <span class="hint">tap a dot to assign · tap again to clear</span></div>
    <div class="compass">
      <template v-for="cell in layout" :key="cell">
        <div v-if="cell === 'ROSE'" class="cbtn">
          <img class="rose" src="/tools/astra-pillars/compass-rose.svg" alt="Compass rose">
        </div>
        <div v-else class="cbtn">
          <div class="dn">{{ cell }}</div>
          <div class="dots">
            <button
              v-for="p in planets"
              :key="p.id"
              type="button"
              class="pdot"
              :class="[p.id, { on: assignment[cell] === p.id, dis: assignment[cell] !== null && assignment[cell] !== p.id }]"
              @click="assign(cell, p.id)"
            >{{ p.ch }}</button>
          </div>
        </div>
      </template>
    </div>
    <div class="psum">{{ summary }}</div>

    <div class="opts">
      <button type="button" class="btn ghost" @click="reset">↻ Reset</button>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const dirs = [
  { id: 'NW', full: 'North-West' }, { id: 'N', full: 'North' }, { id: 'NE', full: 'North-East' },
  { id: 'W', full: 'West' }, { id: 'E', full: 'East' },
  { id: 'SW', full: 'South-West' }, { id: 'S', full: 'South' }, { id: 'SE', full: 'South-East' },
] as const
const planets = [
  { id: 'mars', ch: 'M' },
  { id: 'saturn', ch: 'S' },
  { id: 'neptune', ch: 'N' },
] as const
const layout = ['NW', 'N', 'NE', 'W', 'ROSE', 'E', 'SW', 'S', 'SE'] as const

const assignment = reactive<Record<string, string | null>>({})
dirs.forEach(d => { assignment[d.id] = null })

const summary = computed(() => {
  const parts: string[] = []
  for (const d of dirs) {
    if (assignment[d.id]) {
      const pl = planets.find(p => p.id === assignment[d.id])!
      parts.push(`${pl.id.charAt(0).toUpperCase() + pl.id.slice(1)} → ${d.full}`)
    }
  }
  return parts.length === 3 ? parts.join(' · ') : 'Assign all three planets…'
})

function assign(dir: string, pl: string) {
  if (assignment[dir] === pl) {
    assignment[dir] = null
  } else {
    dirs.forEach(o => { if (assignment[o.id] === pl) assignment[o.id] = null })
    assignment[dir] = pl
  }
}

function reset() {
  dirs.forEach(d => { assignment[d.id] = null })
}
useToolState('astra-planet-sheets', { assignment })
</script>

<style scoped>
.compass {
  display: grid;
  grid-template-columns: repeat(3, 112px);
  grid-template-rows: repeat(3, auto);
  gap: .45rem;
  justify-content: center;
  align-items: center;
  margin-top: .6rem;
}

.cbtn {
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: .85rem;
  padding: .5rem .3rem .45rem;
  background: linear-gradient(155deg, rgba(255, 255, 255, .05), rgba(0, 0, 0, .12));
  text-align: center;
  font-family: inherit;
}

.cbtn .dn {
  font-size: .72rem;
  font-weight: 800;
  color: #ffffffcc;
}

.dots {
  display: flex;
  gap: .4rem;
  justify-content: center;
  margin-top: .4rem;
}

.pdot {
  width: 27px;
  height: 27px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, .25);
  cursor: pointer;
  font-size: .66rem;
  font-weight: 800;
  color: #18181b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.pdot.mars { background: #c93b3b; color: #fff; }
.pdot.saturn { background: #d4a96a; }
.pdot.neptune { background: #4d7fc7; color: #fff; }

.pdot.dis {
  opacity: .22;
  pointer-events: none;
}

.pdot.on {
  border-color: #ffe8bf;
  box-shadow: 0 0 10px rgba(255, 232, 191, .45);
}

.cbtn img.rose {
  width: 86px;
  height: 86px;
  object-fit: contain;
}

.psum {
  margin-top: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(245, 158, 11, .28);
  background: linear-gradient(135deg, rgba(245, 158, 11, .09), rgba(255, 255, 255, .02));
  padding: .75rem 1rem;
  text-align: center;
  font-size: .92rem;
  font-weight: 700;
  color: #ffe8bf;
  line-height: 1.7;
}
</style>
