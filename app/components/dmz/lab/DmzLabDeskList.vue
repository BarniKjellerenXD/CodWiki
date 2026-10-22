<script setup lang="ts">
import { dmzIntel, intelCategory, filterIntel } from '#shared/dmz-intel.mjs'
import { labDesk, deskEntries } from '#shared/dmz-lab.mjs'

// A plain station: its entries grouped by category, or by type when the
// station has one category, with a filter. Tracked Orders point at the tracker.
type Entry = (typeof dmzIntel)[number]
const props = defineProps<{ desk: string }>()
const emit = defineEmits<{ open: [entry: Entry] }>()
const query = ref('')
const desk = computed(() => labDesk(props.desk)!)
const all = computed(() => deskEntries(desk.value))
const tracked = computed(() => all.value.filter(entry => entry.tracked))
const shown = computed(() => filterIntel(all.value.filter(entry => !entry.tracked), { query: query.value }))
const groups = computed(() => {
  const byType = desk.value.categories.length === 1
  const list: { id: string, title: string, desc?: string, entries: Entry[] }[] = []
  for (const entry of shown.value) {
    const id = byType ? entry.type || 'Other' : entry.category
    const group = list.find(item => item.id === id)
    if (group) group.entries.push(entry)
    else list.push({ id, title: byType ? id : intelCategory(id)!.label, desc: byType ? undefined : intelCategory(id)!.desc, entries: [entry] })
  }
  return list
})
watch(() => props.desk, () => { query.value = '' })
</script>

<template>
  <div class="dl">
    <label class="lab-search dl-search">
      <span class="sr-only">Filter {{ desk.label }}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
      <input v-model="query" type="search" :placeholder="`Filter ${all.length - tracked.length} entries in ${desk.label}`" autocomplete="off" spellcheck="false">
    </label>
    <NuxtLink v-if="tracked.length" to="/dmz/orders" class="dl-tracked">
      <span class="w-semi">{{ tracked.length }} DMZ Orders live in the Orders tracker</span>
      <span class="dmz-mono">Tick off tasks there <span aria-hidden="true">→</span></span>
    </NuxtLink>
    <section v-for="group in groups" :key="group.id" class="dl-group" :aria-labelledby="`dl-${desk.id}-${group.id}`">
      <header class="dl-head">
        <h3 :id="`dl-${desk.id}-${group.id}`" class="lab-h2">{{ group.title }}<span class="dmz-mono">{{ group.entries.length }}</span></h3>
        <p v-if="group.desc">{{ group.desc }}</p>
      </header>
      <ul class="dl-grid">
        <li v-for="entry in group.entries" :key="entry.id"><DmzLabRow :entry="entry" summary @open="emit('open', $event)" /></li>
      </ul>
    </section>
    <p v-if="!groups.length" class="lab-empty">Nothing in {{ desk.label }} matches “{{ query.trim() }}”.</p>
  </div>
</template>

<style scoped>
.dl-search { max-width: 34rem; }
.dl-tracked { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.25rem 1rem; margin-top: 1rem; padding: 0.875rem 1.125rem; border: 1px solid rgba(170, 220, 210, 0.3); border-radius: 14px; background: linear-gradient(90deg, rgba(74, 150, 142, 0.35), rgba(34, 70, 66, 0.25)); text-decoration: none; }
.dl-tracked .dmz-mono { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: #cfe9e4; }
.dl-group { margin-top: 1.5rem; }
.dl-head { margin-bottom: 0.625rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--dz-line); }
.dl-head h3 { display: flex; align-items: baseline; gap: 0.625rem; }
.dl-head h3 .dmz-mono { font-size: 0.75rem; color: var(--dz-muted); letter-spacing: 0.06em; }
.dl-head p { margin: 0.25rem 0 0; color: var(--dz-muted); font-size: 0.95rem; }
.dl-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr)); gap: 0.375rem; }
@media (max-width: 599px) {
  .dl-grid { grid-template-columns: 1fr; }
}
</style>
