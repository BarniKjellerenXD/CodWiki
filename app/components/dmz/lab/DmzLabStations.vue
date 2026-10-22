<script setup lang="ts">
import { dmzIntel } from '#shared/dmz-intel.mjs'
import { labDesks, labHandoffs, labDesk, deskEntries } from '#shared/dmz-lab.mjs'

// Station strip plus the chosen station, shared by concept A and the mix.
type Entry = (typeof dmzIntel)[number]
const desk = defineModel<string>('desk', { required: true })
const emit = defineEmits<{ open: [entry: Entry] }>()
const current = computed(() => labDesk(desk.value) || labDesks[0]!)
const count = (id: string) => deskEntries(labDesk(id)!).length
const handoffCount = (category: string) => dmzIntel.filter(entry => entry.category === category).length
const strip = ref<HTMLElement>()
// Keep the chosen station visible in the phone strip.
watch(desk, () => nextTick(() => strip.value?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })))
</script>

<template>
  <div class="ls">
    <nav class="ls-strip" aria-label="Intel stations">
      <ul ref="strip">
        <li v-for="item in labDesks" :key="item.id">
          <button type="button" class="ls-tile" :aria-current="item.id === current.id ? 'true' : undefined" @click="desk = item.id">
            <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>
            <span class="ls-label">{{ item.label }}</span>
            <span class="ls-n dmz-mono">{{ count(item.id) }}</span>
          </button>
        </li>
        <li v-for="item in labHandoffs" :key="item.id">
          <NuxtLink :to="item.to" class="ls-tile is-out" :title="item.desc">
            <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>
            <span class="ls-label">{{ item.label }}</span>
            <span class="ls-n dmz-mono">{{ handoffCount(item.category) }} <span aria-hidden="true">↗</span></span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <section class="ls-desk" :aria-labelledby="`ls-${current.id}`">
      <header class="ls-head">
        <span class="ls-head-icon"><svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="current.icon" /></svg></span>
        <div>
          <h2 :id="`ls-${current.id}`" class="ls-title">{{ current.label }}</h2>
          <p>{{ current.desc }}</p>
        </div>
      </header>
      <DmzLabBossBoard v-if="current.id === 'boss'" @open="emit('open', $event)" />
      <LazyDmzLabPrinter v-else-if="current.id === 'printer'" @open="emit('open', $event)" />
      <LazyDmzLabTraits v-else-if="current.id === 'operators'" @open="emit('open', $event)" />
      <LazyDmzLabStatus v-else-if="current.id === 'status'" @open="emit('open', $event)" />
      <LazyDmzLabDeskList v-else :desk="current.id" @open="emit('open', $event)" />
    </section>
  </div>
</template>

<style scoped>
.ls-strip ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: 0.375rem; }
.ls-tile { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 0.375rem; width: 100%; height: 100%; min-height: 6rem; padding: 0.75rem; border: 1px solid var(--dz-line); border-radius: 14px; background: rgba(20, 24, 23, 0.7); color: var(--dz-ink-2) !important; font: inherit; text-align: left; text-decoration: none; cursor: pointer; }
.ls-tile:hover { border-color: var(--dz-line-strong); color: #fff !important; }
.ls-tile[aria-current='true'] { background: linear-gradient(180deg, rgba(233, 230, 214, 0.2), rgba(233, 230, 214, 0.08)); border-color: var(--dz-ink); color: #fff !important; box-shadow: inset 0 3px var(--dz-ink); }
.ls-tile.is-out { border-style: dashed; background: transparent; }
.ls-label { font-size: 1rem; font-weight: 600; line-height: 1.15; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; }
.ls-n { margin-top: auto; font-size: 0.6875rem; color: var(--dz-muted); }
.ls-desk { margin-top: 1.5rem; }
.ls-head { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
.ls-head-icon { flex: none; display: grid; place-items: center; width: 3.25rem; height: 3.25rem; border-radius: 12px; background: rgba(233, 230, 214, 0.12); }
.ls-head-icon .lab-icon { width: 1.875rem; height: 1.875rem; }
.ls-title { margin: 0; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; line-height: 1; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.ls-head p { margin: 0.375rem 0 0; max-width: 46rem; color: #dcd9cb; }
@media (max-width: 1099px) {
  .ls-strip ul { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
@media (max-width: 899px) {
  .ls-strip { margin: 0 -1rem; }
  .ls-strip ul { display: flex; overflow-x: auto; padding: 0 1rem 0.25rem; scrollbar-width: none; }
  .ls-strip ul::-webkit-scrollbar { display: none; }
  .ls-strip li { flex: 0 0 7.25rem; }
  .ls-tile { min-height: 5.5rem; }
}
</style>
