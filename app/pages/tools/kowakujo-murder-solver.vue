<template>
  <ToolShell map-name="Kowakujō" back-to="/guides/kowakujo">
    <template #title>🗡️ Murder Mystery Solver</template>
    <template #sub>Work out the <strong>accomplice, poison and dial</strong> — and what goes under each of the 5 paintings.</template>
    <template #howto>
      <b>The flow</b> — <b>1.</b> Trap a ghost with the D.I.E. remote to reveal the <b>accomplice</b>.
      <b>2.</b> The doctor's note gives the <b>symptom</b> → shows which poison to grab from the meditation room shelf.
      <b>3.</b> The <b>animal</b> on the 4th painting = its zodiac sign = the <b>time of death</b>; pair it with the
      <b>poison delay</b> (1–5) to set the zodiac dial. <b>4.</b> Place the 5 items under the paintings in order.
    </template>

    <div class="blocklabel">① Accomplice <span class="hint">ghost revealed by a trap</span></div>
    <div class="people">
      <div
        v-for="s in suspects"
        :key="s.id"
        class="pcard"
        :class="{ sel: state.suspect === s.id, dis: state.symptom && symptomOwner === s.id }"
        @click="state.suspect = state.suspect === s.id ? null : s.id"
      >
        <img :src="`/tools/kowakujo-murder/${s.item}.png`" :alt="itemName[s.item]">
        <div class="nm">{{ s.name }}</div>
      </div>
    </div>

    <div class="blocklabel">② Symptom <span class="hint">doctor's note</span></div>
    <div class="schips">
      <button
        v-for="s in symptoms"
        :key="s.id"
        type="button"
        class="schip"
        :class="{ sel: state.symptom === s.id, dis: state.suspect === s.owner }"
        @click="state.symptom = state.symptom === s.id ? null : s.id"
      >{{ s.name }}</button>
    </div>
    <div v-if="poison" class="pbar show">
      ☠ Poison: <b>{{ itemName[poison] }}</b> — grab it from the meditation room shelf.
    </div>

    <div class="blocklabel">③ Time of death <span class="hint">4th painting's animal · tap the zodiac wheel</span></div>
    <div class="dialwrap">
      <div class="dial">
        <template v-for="(z, idx) in zodiac" :key="z">
          <button
            type="button"
            class="zbtn"
            :class="{ hour: state.hour === idx, res: resultHour === idx }"
            :style="dialPos(ring, idx)"
            :title="z"
            @click="state.hour = idx"
          ><img :src="`/tools/zodiac/${z.toLowerCase()}.svg`" :alt="z"></button>
          <div class="znum" :style="dialPos(numr, idx)">{{ idx === 0 ? '12' : idx }}</div>
        </template>
        <div class="hand" :style="{ transform: `rotate(${(resultHour ?? 0) * 30}deg)` }" />
        <div class="center"><div class="cv">{{ dialText }}</div></div>
      </div>
    </div>

    <div class="blocklabel">④ Poison delay <span class="hint">from the poison type</span></div>
    <div class="dchips">
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        class="schip"
        :class="{ sel: state.delay === n }"
        @click="state.delay = state.delay === n ? null : n"
      >{{ n }}</button>
    </div>

    <div class="blocklabel">⑥ 4th painting <span class="hint">which animal is on it</span></div>
    <div class="paints">
      <div
        v-for="(p, k) in paintings"
        :key="k"
        class="pcard"
        :class="{ sel: state.painting === k }"
        @click="state.painting = state.painting === k ? null : k"
      >
        <img :src="`/tools/kowakujo-murder/painting-${k}.png`" :alt="p.label">
        <div class="nm">{{ p.label }}</div>
      </div>
    </div>

    <div class="blocklabel">⑦ Solution — place under each painting <span class="hint">{{ filled }}/5 placed</span></div>
    <div class="slots">
      <div v-for="(it, i) in slotItems" :key="i" class="slot" :class="{ filled: !!it }">
        <template v-if="it">
          <img :src="`/tools/kowakujo-murder/${it}.png`" :alt="itemName[it]">
          <div class="ord">{{ ordinal(i) }} · {{ itemName[it] }}</div>
        </template>
        <template v-else>
          <div class="ph">?</div>
          <div class="ord">{{ ordinal(i) }}</div>
        </template>
      </div>
    </div>

    <div class="opts">
      <button type="button" class="btn ghost" @click="reset">↻ Reset</button>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const suspects = [
  { id: 'merchant', name: 'Merchant', item: 'abacus' },
  { id: 'courtier', name: 'Courtier', item: 'nobleHat' },
  { id: 'gardener', name: 'Gardener', item: 'shears' },
]
const symptoms = [
  { id: 'paralysie', name: 'Paralysis', owner: 'courtier' },
  { id: 'vomissement', name: 'Vomiting', owner: 'merchant' },
  { id: 'vegetal', name: 'Plant origin', owner: 'gardener' },
]
const POISON: Record<string, Record<string, string>> = {
  courtier: { vomissement: 'pufferfish', vegetal: 'monkshood' },
  gardener: { vomissement: 'plumPit', vegetal: 'monkshood' },
  merchant: { paralysie: 'pufferfish', vegetal: 'plumPit' },
}
const zodiac = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
const paintings: Record<string, { item: string, label: string }> = {
  fish: { item: 'teaWhisk', label: 'Fish' },
  mountains: { item: 'horse', label: 'Mountains' },
  bird: { item: 'brush', label: 'Bird' },
}
const itemName: Record<string, string> = {
  comb: 'Comb', medallion: 'Medallion', abacus: "Merchant's Abacus", nobleHat: "Noble's Hat",
  shears: 'Shears', pufferfish: 'Pufferfish', plumPit: 'Plum Pit', monkshood: 'Monkshood', teaWhisk: 'Tea Whisk',
  horse: 'Horse Statue', brush: "Painter's Brush",
}

const state = reactive<{ suspect: string | null, symptom: string | null, hour: number | null, delay: number | null, painting: string | null }>({
  suspect: null, symptom: null, hour: null, delay: null, painting: null,
})

const symptomOwner = computed(() => symptoms.find(s => s.id === state.symptom)?.owner ?? null)
const poison = computed(() =>
  state.suspect && state.symptom ? POISON[state.suspect][state.symptom] || null : null
)

const ring = 126
const numr = 92

function dialPos(radius: number, idx: number) {
  const ang = (-90 + idx * 30) * Math.PI / 180
  return {
    left: `${160 + radius * Math.cos(ang)}px`,
    top: `${160 + radius * Math.sin(ang)}px`,
    transform: 'translate(-50%, -50%)',
  }
}

const resultHour = computed(() => {
  if (state.hour === null || state.delay === null) return null
  return (((state.hour - state.delay) % 12) + 12) % 12
})
const dialText = computed(() => {
  if (state.hour === null || state.delay === null) return 'Set dial'
  const r = resultHour.value!
  return `${zodiac[r]} (${r === 0 ? 12 : r})`
})

const slotItems = computed<(string | null)[]>(() => [
  state.suspect ? 'comb' : null,
  state.suspect ? suspects.find(s => s.id === state.suspect)!.item : null,
  poison.value,
  state.painting ? paintings[state.painting].item : null,
  state.suspect ? 'medallion' : null,
])
const filled = computed(() => slotItems.value.filter(Boolean).length)

function ordinal(i: number) {
  return `${i + 1}${['st', 'nd', 'rd'][i] ?? 'th'}`
}
useToolState('kowakujo-murder-solver', { state })
</script>

<style scoped>
.people {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: .6rem;
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

.pcard.dis {
  opacity: .3;
  pointer-events: none;
}

.pcard img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: .6rem;
}

.pcard .nm {
  margin-top: .3rem;
  font-size: .7rem;
  font-weight: 700;
  color: #ffffffcc;
}

.schips,
.dchips {
  display: flex;
  gap: .45rem;
  flex-wrap: wrap;
}

.schip {
  border: 1px solid rgba(255, 255, 255, .15);
  border-radius: .65rem;
  background: rgba(255, 255, 255, .04);
  color: #ffffffcc;
  font-size: .8rem;
  font-weight: 700;
  padding: .45rem .8rem;
  cursor: pointer;
  font-family: inherit;
  transition: all .15s;
}

.schip:hover {
  border-color: rgba(245, 158, 11, .5);
}

.schip.sel {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(245, 158, 11, .22), rgba(249, 115, 22, .10));
  color: #ffe8bf;
}

.schip.dis {
  opacity: .3;
  pointer-events: none;
}

.pbar {
  display: none;
  margin-top: .6rem;
  border-radius: .8rem;
  border: 1px solid rgba(239, 68, 68, .4);
  background: linear-gradient(135deg, rgba(239, 68, 68, .12), rgba(255, 255, 255, .02));
  color: #fca5a5;
  font-size: .82rem;
  font-weight: 600;
  padding: .5rem .7rem;
}

.pbar.show {
  display: block;
}

.pbar b {
  color: #ffe8bf;
}

.dialwrap {
  display: flex;
  justify-content: center;
}

.dial {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, .14);
  background: radial-gradient(circle, rgba(255, 255, 255, .05), rgba(0, 0, 0, .2));
}

.zbtn {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, .18);
  background: rgba(20, 19, 24, .9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: border-color .15s, box-shadow .15s;
}

.zbtn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.zbtn:hover {
  border-color: rgba(245, 158, 11, .6);
}

.zbtn.hour {
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(245, 158, 11, .5);
}

.zbtn.res {
  border-color: #86efac;
  box-shadow: 0 0 10px rgba(134, 239, 172, .5);
}

.znum {
  position: absolute;
  font-size: .68rem;
  font-weight: 800;
  color: #ffffff66;
  transform: translate(-50%, 50%);
}

.hand {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 78px;
  margin-left: -1.5px;
  transform-origin: 50% 0;
  background: linear-gradient(180deg, #f59e0b, #f97316);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(245, 158, 11, .5);
  transition: transform .2s;
}

.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 1px solid rgba(245, 158, 11, .4);
  background: rgba(10, 10, 12, .9);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cv {
  font-size: .82rem;
  font-weight: 800;
  color: #ffe8bf;
  line-height: 1.3;
}

.paints {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: .6rem;
}

.slots {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: .55rem;
}

.slot {
  border: 1px dashed rgba(255, 255, 255, .18);
  border-radius: .8rem;
  padding: .55rem .4rem;
  text-align: center;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .3rem;
}

.slot.filled {
  border-style: solid;
  border-color: rgba(245, 158, 11, .5);
  background: linear-gradient(135deg, rgba(245, 158, 11, .1), rgba(255, 255, 255, .02));
}

.slot .ph {
  font-size: 1.4rem;
  color: #ffffff44;
  font-weight: 800;
}

.slot img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: .5rem;
}

.ord {
  font-size: .62rem;
  font-weight: 700;
  color: #ffffff99;
}
</style>