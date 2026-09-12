<template>
  <div class="pigpen-helper">
    <div class="helper-card">
      <div class="helper-header">Pigpen Quick Selector</div>
      <div class="helper-options" role="tablist" aria-label="Pigpen words">
        <button
          v-for="w in words"
          :key="w.word"
          class="helper-option"
          :class="{ active: selected === w.word }"
          role="tab"
          :aria-selected="selected === w.word"
          :title="w.word"
          @click="select(w.word)"
        >
          <span class="pigpen">{{ w.word }}</span>
        </button>
      </div>
      <div class="helper-results">
        <div
          v-for="w in words"
          :key="w.word"
          class="helper-numbers"
          :class="{ active: selected === w.word }"
          role="tabpanel"
          :aria-hidden="selected !== w.word"
        >{{ w.numbers }}</div>
      </div>
      <div class="helper-note">Click the matching pigpen word to show its numbers. Others hide automatically.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const words = [
  { word: 'LAUNCH', numbers: '11 - 00 - 20 - 13 - 02 - 07' },
  { word: 'WEAPON', numbers: '22 - 04 - 00 - 15 - 14 - 13' },
  { word: 'ENGINE', numbers: '04 - 13 - 06 - 08 - 13 - 04' },
  { word: 'ROCKET', numbers: '17 - 14 - 02 - 10 - 04 - 19' },
]
const selected = ref<string | null>(null)

function select(word: string) {
  selected.value = selected.value === word ? null : word
}
</script>
