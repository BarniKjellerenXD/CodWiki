<template>
  <ToolShell map-name="Ashes of the Damned" back-to="/guides/ashes-of-the-damned">
    <template #title>Serum Ingredient Order</template>
    <template #sub>Track the <strong>collection order</strong> of your 3 serum ingredients — you must drink them in the same order.</template>
    <template #howto>
      <b>Order matters</b> — collect the 3 ingredients, then tap them below <b>in the same order you picked them up</b>.
      When you drink the serum at the still, drink the ingredients in exactly this order.
    </template>

    <div class="blocklabel">① Ingredients <span class="hint">tap in collection order — max 3</span></div>
    <div class="ing">
      <button
        type="button"
        :aria-pressed="picked.includes(g.id)"
        :disabled="picked.length >= 3 && !picked.includes(g.id)"
        v-for="g in ingredients"
        :key="g.id"
        class="ingcard"
        :class="{ sel: picked.includes(g.id), dis: picked.length >= 3 && !picked.includes(g.id) }"
        @click="toggle(g.id)"
      >
        <img :src="`/tools/ashes-serum/${g.id}.png`" alt="">
        <div class="nm">{{ g.name }}</div>
        <div v-if="picked.includes(g.id)" class="badge">{{ picked.indexOf(g.id) + 1 }}</div>
      </button>
    </div>
    <div class="ingcount">{{ picked.length }} / 3 selected</div>

    <div class="opts">
      <button type="button" class="btn ghost" @click="picked = []">↻ Reset</button>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const ingredients = [
  { id: 'fungi', name: 'Fungi' },
  { id: 'limbs', name: 'Limbs' },
  { id: 'oculi', name: 'Oculi' },
  { id: 'conch', name: 'Conch' },
  { id: 'talus', name: 'Talus' },
]

const picked = ref<string[]>([])

function toggle(id: string) {
  const at = picked.value.indexOf(id)
  if (at !== -1) picked.value.splice(at, 1)
  else if (picked.value.length < 3) picked.value.push(id)
}
useToolState('ashes-serum', { picked })
</script>

<style scoped>
.ing {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: .6rem;
}

.ingcard {
  position: relative;
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: .9rem;
  padding: .7rem .5rem .6rem;
  background: linear-gradient(155deg, rgba(255, 255, 255, .05), rgba(0, 0, 0, .12));
  cursor: pointer;
  text-align: center;
  transition: all .15s;
}

.ingcard:hover {
  border-color: rgba(245, 158, 11, .5);
}

.ingcard.sel {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(245, 158, 11, .22), rgba(249, 115, 22, .10));
}

.ingcard.dis {
  opacity: .35;
  pointer-events: none;
}

.ingcard img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: .6rem;
}

.ingcard .nm {
  margin-top: .35rem;
  font-size: .72rem;
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

.ingcount {
  margin-top: .7rem;
  text-align: center;
  font-size: .8rem;
  font-weight: 700;
  color: #ffffffaa;
}
</style>
