<template>
  <ToolShell map-name="Ashes of the Damned" back-to="/guides/ashes-of-the-damned">
    <template #title>Rocket Launch Codes</template>
    <template #sub>Pick the word you found on the launcher and get the <strong>shoot order</strong>.</template>
    <template #howto>
      <b>How it works</b> — find the word on the launcher, pick it below, and shoot the numbered targets
      <b>in the order shown</b>. Each number is the word's letter position (A = 0, B = 1, …).
    </template>

    <div class="blocklabel">① Word you found</div>
    <div class="words">
      <button
        v-for="w in words"
        :key="w"
        type="button"
        class="wordbtn"
        :class="{ sel: selected === w }"
        @click="selected = w"
      >{{ w }}</button>
    </div>

    <div class="results" :class="{ show: selected }">
      <div class="sol-head">✨ Shoot in order<span class="meta">A = 0 · B = 1 · C = 2 …</span></div>
      <div class="chipnum">
        <div v-for="(ch, i) in selected || ''" :key="i" class="chip">
          <b>{{ ch.charCodeAt(0) - 65 }}</b><span>{{ ch }}</span>
        </div>
      </div>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const words = ['ROCKET', 'ENGINE', 'LAUNCH', 'WEAPON']
const selected = ref<string | null>(null)
useToolState('ashes-rocket-launch', { selected })
</script>

<style scoped>
.words {
  display: flex;
  gap: .6rem;
  flex-wrap: wrap;
  justify-content: center;
}

.wordbtn {
  border: 1px solid rgba(245, 158, 11, .4);
  border-radius: .7rem;
  background: rgba(245, 158, 11, .1);
  color: #ffe8bf;
  font-family: inherit;
  font-size: .95rem;
  font-weight: 800;
  letter-spacing: .06em;
  padding: .6rem 1.2rem;
  cursor: pointer;
  transition: all .15s;
}

.wordbtn:hover {
  background: rgba(245, 158, 11, .2);
}

.wordbtn.sel {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #18181b;
  border-color: #f59e0b;
}

.chipnum {
  display: flex;
  gap: .55rem;
  flex-wrap: wrap;
  justify-content: center;
}

.chip {
  border: 1px solid rgba(245, 158, 11, .4);
  border-radius: .65rem;
  background: rgba(245, 158, 11, .12);
  padding: .45rem .7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .15rem;
  min-width: 3.2rem;
}

.chip b {
  font-size: 1.25rem;
  color: #ffe8bf;
}

.chip span {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .08em;
  color: #ffffff99;
}
</style>
