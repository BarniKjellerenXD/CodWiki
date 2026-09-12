<template>
  <div class="book-helper">
    <h3>Bust book helper</h3>
    <p>Click the book titles you see on the machine; this shows how many times to interact with each bust.</p>
    <div class="book-grid">
      <div v-for="(books, bust) in busts" :key="bust">
        <div class="book-header">Bust {{ bust }}</div>
        <label v-for="b in books" :key="b">
          <input v-model="checked" type="checkbox" :value="b" /> {{ b }}
        </label>
      </div>
    </div>
    <p class="bust-output">{{ output }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const busts: Record<string, string[]> = {
  1: ['The Musica Universalis', 'The Black Veil', 'The Moon Directive'],
  2: ['Ash and Bones', 'Echoes of Andromeda', 'The Unknowable Void'],
  3: ['Pyramids of Cydonia', 'Silence at Singularity', 'Witchlight Codex'],
}

const checked = ref<string[]>([])

const output = computed(() => {
  const counts = [0, 0, 0]
  checked.value.forEach((book) => {
    for (const [bust, books] of Object.entries(busts)) {
      if (books.includes(book)) counts[Number(bust) - 1]++
    }
  })
  const parts = counts
    .map((c, i) => (c ? `Bust ${i + 1}: interact ${c} ${c === 1 ? 'time' : 'times'}` : ''))
    .filter(Boolean)
  return parts.length
    ? parts.join(' • ')
    : 'Select the book titles shown in-game to see how many times to interact with each bust.'
})
</script>

<style scoped>
.bust-output {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.05);
  color: #fef3c7;
  padding: 0.65rem 0.75rem;
}
</style>
