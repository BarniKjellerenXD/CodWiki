<template>
  <ToolShell map-name="Ashes of the Damned" back-to="/guides/ashes-of-the-damned">
    <template #title>Wunderbarrage Codes</template>
    <template #sub>Count the light blinks under the balcony in Tyr's head — <strong>amplitude</strong> (left) and <strong>frequency</strong> (right) for both sequences.</template>
    <template #howto>
      <b>Where</b> — under the balcony in Tyr's head. Two lights fire <b>sequences</b>: count the blinks of the
      <b>left light (amplitude)</b> and the <b>right light (frequency)</b> for each sequence, then feed them here.
      The pairs you enter <b>are</b> the code — keep the summary on screen and punch the pairs into the console.
    </template>

    <div class="blocklabel">① Sequences <span class="hint">amplitude 1–7 · frequency 1–8</span></div>
    <div class="wseq">
      <div class="wrow">
        <div class="wpanel">
          <div class="wname">Sequence 1 — Amplitude</div>
          <div class="wmax">1 – 7 blinks</div>
          <Stepper v-model="s1a" :max="7" />
        </div>
        <div class="wpanel">
          <div class="wname">Sequence 1 — Frequency</div>
          <div class="wmax">1 – 8 blinks</div>
          <Stepper v-model="s1f" :max="8" />
        </div>
      </div>
      <div class="wrow">
        <div class="wpanel">
          <div class="wname">Sequence 2 — Amplitude</div>
          <div class="wmax">1 – 7 blinks</div>
          <Stepper v-model="s2a" :max="7" />
        </div>
        <div class="wpanel">
          <div class="wname">Sequence 2 — Frequency</div>
          <div class="wmax">1 – 8 blinks</div>
          <Stepper v-model="s2f" :max="8" />
        </div>
      </div>
    </div>

    <div class="wsum">
      <div class="t">Codes to punch in</div>
      <div class="v">{{ summary }}</div>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const s1a = ref<number | null>(null)
const s1f = ref<number | null>(null)
const s2a = ref<number | null>(null)
const s2f = ref<number | null>(null)

const summary = computed(() => {
  const d = (v: number | null) => (v === null ? '—' : String(v))
  return `${d(s1a.value)} ${d(s1f.value)} · ${d(s2a.value)} ${d(s2f.value)}`
})
</script>

<style scoped>
.wseq {
  display: flex;
  flex-direction: column;
  gap: .7rem;
}

.wrow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: .7rem;
}

.wpanel {
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: .9rem;
  padding: .75rem .85rem;
  background: linear-gradient(155deg, rgba(255, 255, 255, .05), rgba(0, 0, 0, .12));
}

.wname {
  font-size: .8rem;
  font-weight: 800;
  color: #ffe8bf;
}

.wmax {
  font-size: .68rem;
  color: #ffffff77;
  margin-bottom: .5rem;
}
</style>
