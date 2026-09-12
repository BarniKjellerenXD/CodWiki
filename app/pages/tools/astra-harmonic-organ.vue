<template>
  <ToolShell map-name="Astra Malorum" back-to="/guides/astra-malorum">
    <template #title>Harmonic Organ Order</template>
    <template #sub>Tap the 4 medallions the Oculus screen showed — the tool infers the <strong>5th pillar</strong>.</template>
    <template #howto>
      <b>How it works</b> — the Oculus screen shows <b>4 of the 5 pillar medallions</b> in a specific order.
      Tap those 4 below <b>in the order shown on screen</b> — the 5th pillar is the one the screen
      <b>didn't</b> show, and the tool drops it into the right spot.
    </template>

    <div class="blocklabel">① Medallions you heard <span class="hint">in Oculus-screen order — max 4</span></div>
    <div class="pillars">
      <div
        v-for="n in 5"
        :key="n"
        class="pcard"
        :class="{ sel: picked.includes(n), inf: missing === n }"
        @click="toggle(n)"
      >
        <img :src="`/tools/astra-pillars/${n}.png`" :alt="`Pillar ${n}`">
        <div class="nm">Pillar {{ n }}</div>
        <div v-if="picked.includes(n)" class="badge">{{ picked.indexOf(n) + 1 }}</div>
        <div v-else-if="missing === n" class="badge">5</div>
      </div>
    </div>

    <img class="legend" src="/tools/astra-pillars/reference.webp" alt="Pillar medallion reference">

    <div v-if="missing !== null" class="ordchain show">
      <template v-for="(n, idx) in order" :key="idx">
        <span v-if="idx > 0" class="arr">→</span>
        <img :src="`/tools/astra-pillars/${n}.png`" :alt="`Pillar ${n}`" :title="`Pillar ${n}`">
      </template>
    </div>
    <div v-if="missing !== null" class="ordnote show">
      Press the pillars in this order — pillar {{ missing }} (amber) is the inferred 5th.
    </div>

    <div class="opts">
      <button type="button" class="btn ghost" @click="picked = []">↻ Reset</button>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const picked = ref<number[]>([])
const missing = computed(() => {
  if (picked.value.length !== 4) return null
  for (let n = 1; n <= 5; n++) if (!picked.value.includes(n)) return n
  return null
})
const order = computed(() =>
  missing.value === null ? [] : [...picked.value, missing.value]
)

function toggle(n: number) {
  const at = picked.value.indexOf(n)
  if (at !== -1) picked.value.splice(at, 1)
  else if (picked.value.length < 4) picked.value.push(n)
}
</script>

<style scoped>
.pillars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: .7rem;
  margin-top: .5rem;
}

.pcard {
  position: relative;
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: .9rem;
  padding: .6rem .4rem .5rem;
  background: linear-gradient(155deg, rgba(255, 255, 255, .05), rgba(0, 0, 0, .12));
  cursor: pointer;
  text-align: center;
  transition: all .15s;
}

.pcard:hover {
  border-color: rgba(245, 158, 11, .5);
}

.pcard.sel {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(245, 158, 11, .22), rgba(249, 115, 22, .10));
}

.pcard.inf {
  border-color: #fbbf24;
  background: linear-gradient(135deg, rgba(251, 191, 36, .28), rgba(245, 158, 11, .12));
}

.pcard img {
  width: 76px;
  height: 76px;
  object-fit: contain;
  border-radius: .6rem;
}

.pcard .nm {
  margin-top: .3rem;
  font-size: .7rem;
  font-weight: 700;
  color: #ffffffcc;
}

.badge {
  position: absolute;
  top: -9px;
  right: -9px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #18181b;
  font-weight: 800;
  font-size: .85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .4);
}

.legend {
  display: block;
  margin: .8rem auto 0;
  max-width: 100%;
  width: 420px;
  border-radius: .8rem;
  border: 1px solid rgba(255, 255, 255, .14);
}

.ordchain {
  display: none;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: .45rem;
  align-items: center;
  justify-content: center;
}

.ordchain.show {
  display: flex;
}

.ordchain img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: .55rem;
  border: 1px solid rgba(245, 158, 11, .4);
  background: rgba(255, 255, 255, .04);
}

.ordchain .arr {
  color: #ffffff66;
  font-weight: 800;
}

.ordnote {
  display: none;
  margin-top: .5rem;
  text-align: center;
  font-size: .78rem;
  color: #ffffff99;
  font-weight: 600;
}

.ordnote.show {
  display: block;
}
</style>
