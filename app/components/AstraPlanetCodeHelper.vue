<template>
  <div class="planet-helper">
    <h3>Planet-to-code helper</h3>
    <p>Click the three planets O.S.C.A.R. calls out in order; this converts them to the 3-digit code by solar distance (Mercury=1 … Neptune=8).</p>
    <div class="planet-list">
      <button v-for="p in planets" :key="p.digit" type="button" @click="push(p.digit)">{{ p.digit }}: {{ p.name }}</button>
    </div>
    <div class="planet-output">{{ display }}</div>
    <div class="planet-actions">
      <button type="button" @click="undo">Undo</button>
      <button type="button" @click="clear">Clear</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const planets = [
  { digit: 1, name: 'Mercury' },
  { digit: 2, name: 'Venus' },
  { digit: 3, name: 'Earth' },
  { digit: 4, name: 'Mars' },
  { digit: 5, name: 'Jupiter' },
  { digit: 6, name: 'Saturn' },
  { digit: 7, name: 'Uranus' },
  { digit: 8, name: 'Neptune' },
]

const digits = ref<number[]>([])

const display = computed(() =>
  digits.value.length ? `Code: ${digits.value.join('')}` : 'Click planets to build the code…'
)

function push(d: number) {
  if (digits.value.length >= 3) digits.value.shift()
  digits.value.push(d)
}
function undo() {
  digits.value.pop()
}
function clear() {
  digits.value = []
}
</script>
