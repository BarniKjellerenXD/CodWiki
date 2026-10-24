<script setup lang="ts">
import { dmzIntel, intelCategory, filterIntel } from '#shared/dmz-intel.mjs'
import { intelStation, stationEntries } from '#shared/dmz-stations.mjs'

// An Intel shelf: the station's entries grouped by category, or by type when it
// has one category, with a filter. Category groups carry the category id
// (#exfil), so old category links land on them. Tracked Orders are left to the
// DMZ Orders station.
type Entry = (typeof dmzIntel)[number]
const props = defineProps<{ station: string }>()
const query = ref('')
const station = computed(() => intelStation(props.station)!)
const all = computed(() => stationEntries(station.value))
const tracked = computed(() => all.value.filter(entry => entry.tracked))
const shown = computed(() => filterIntel(all.value.filter(entry => !entry.tracked), { query: query.value }))
const groups = computed(() => {
  const byType = station.value.categories.length === 1
  const list: { id: string, title: string, desc?: string, entries: Entry[] }[] = []
  for (const entry of shown.value) {
    const id = byType ? entry.type || 'Other' : entry.category
    const group = list.find(item => item.id === id)
    if (group) group.entries.push(entry)
    else list.push({ id, title: byType ? id : intelCategory(id)!.label, desc: byType ? undefined : intelCategory(id)!.desc, entries: [entry] })
  }
  return list
})
const groupId = (id: string) => station.value.categories.length > 1 ? id : `type-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
</script>

<template>
  <div class="ish">
    <label class="dz-search ish-search">
      <span class="sr-only">Filter {{ station.label }}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
      <input v-model="query" type="search" :placeholder="`Filter ${all.length - tracked.length} entries in ${station.label}`" autocomplete="off" spellcheck="false">
    </label>
    <p class="ish-count dmz-mono" role="status">{{ shown.length === all.length - tracked.length ? `${shown.length} entries` : `${shown.length} of ${all.length - tracked.length} entries` }}</p>
    <nav v-if="station.categories.length > 1 && groups.length > 1" class="ish-jump dz-chips" :aria-label="`${station.label} sections`">
      <a v-for="group in groups" :key="group.id" :href="`#${groupId(group.id)}`" class="dz-chip">{{ group.title }}<span class="dmz-mono">{{ group.entries.length }}</span></a>
    </nav>
    <p v-if="tracked.length" class="ish-tracked">
      <span class="w-semi">{{ tracked.length }} DMZ Orders are not listed here: tick off their tasks on the DMZ Orders station.</span>
    </p>
    <section v-for="group in groups" :id="groupId(group.id)" :key="group.id" class="dz-group" :aria-labelledby="`${groupId(group.id)}-title`">
      <header class="dz-group-head">
        <h2 :id="`${groupId(group.id)}-title`" class="dz-h2">{{ group.title }}<span class="dmz-mono">{{ group.entries.length }}</span></h2>
        <p v-if="group.desc">{{ group.desc }}</p>
      </header>
      <ul class="dz-rows">
        <li v-for="entry in group.entries" :key="entry.id"><DmzIntelRow :entry="entry" summary /></li>
      </ul>
    </section>
    <p v-if="!groups.length" class="dz-empty">Nothing in {{ station.label }} matches “{{ query.trim() }}”.</p>
  </div>
</template>

<style scoped>
.ish { margin-top: 1.5rem; }
.ish-search { max-width: 34rem; }
.ish-count { margin: 0.625rem 0 0 1.125rem; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.ish-jump { margin-top: 0.75rem; }
.ish-tracked { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.25rem 1rem; margin: 1rem 0 0; padding: 0.875rem 1.125rem; border: 1px solid rgba(170, 220, 210, 0.3); border-radius: 14px; background: linear-gradient(90deg, rgba(74, 150, 142, 0.35), rgba(34, 70, 66, 0.25)); }
</style>
