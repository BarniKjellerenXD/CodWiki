<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelCategories, intelCategory, filterIntel, groupIntel } from '#shared/dmz-intel.mjs'
import { labEntry } from '#shared/dmz-lab.mjs'

// Concept C: a compact directory of names, and one dossier per entry. In the
// draft a dossier is ?e=<id>; the real thing would be /dmz/intel/<id>.
type Entry = (typeof dmzIntel)[number]
const route = useRoute()
const router = useRouter()
const icon = dmzStations.find(station => station.id === 'intel')!.icon
const query = ref('')
const entry = computed(() => labEntry(String(route.query.e || '')) || null)
const groups = computed(() => groupIntel(filterIntel(dmzIntel, { query: query.value })))
const shownCount = computed(() => groups.value.reduce((sum, group) => sum + group.entries.length, 0))
const siblings = computed(() => entry.value ? dmzIntel.filter(other => other.category === entry.value!.category) : [])
const at = computed(() => siblings.value.findIndex(other => other.id === entry.value?.id))
const prev = computed(() => siblings.value[at.value - 1])
const next = computed(() => siblings.value[at.value + 1])
const go = (other: Entry) => router.push({ query: { e: other.id } })
const counts = Object.fromEntries(intelCategories.map(category => [category.id, dmzIntel.filter(item => item.category === category.id).length]))
// A new dossier starts at the top; going back to the directory keeps the router's scroll.
watch(entry, value => { if (value && import.meta.client) window.scrollTo({ top: 0 }) })
</script>

<template>
  <div class="dmz-page">
    <DmzLabBanner concept="c" />

    <template v-if="entry">
      <nav class="c-crumbs dmz-mono" aria-label="Breadcrumb">
        <NuxtLink :to="{ query: {} }">Intel</NuxtLink><span aria-hidden="true">/</span>
        <NuxtLink :to="{ query: {}, hash: `#c-${entry.category}` }">{{ intelCategory(entry.category)?.label }}</NuxtLink><span aria-hidden="true">/</span>
        <span aria-current="page">{{ entry.name }}</span>
      </nav>
      <p class="c-url dmz-mono"><span>Would live at</span> codzmwiki.com/dmz/intel/{{ entry.id }}</p>
      <div class="c-dossier dmz-panel">
        <DmzLabDossier :key="entry.id" :entry="entry" related @open="go" />
      </div>
      <nav class="c-pager" aria-label="More in this category">
        <NuxtLink v-if="prev" :to="{ query: { e: prev.id } }" class="c-page"><span class="dmz-mono">← Previous</span><span class="w-semi">{{ prev.name }}</span></NuxtLink>
        <span v-else />
        <span class="c-pos dmz-mono">{{ at + 1 }} of {{ siblings.length }} in {{ intelCategory(entry.category)?.label }}</span>
        <NuxtLink v-if="next" :to="{ query: { e: next.id } }" class="c-page is-next"><span class="dmz-mono">Next →</span><span class="w-semi">{{ next.name }}</span></NuxtLink>
        <span v-else />
      </nav>
    </template>

    <template v-else>
      <DmzPageHead title="Intel directory" :icon="icon" :status="`${dmzIntel.length} entries · names only · open one for its dossier`">
        <p class="lab-lede">Every entry by name, grouped. Open one to read all its facts, where it sits on Hajin and what it links to.</p>
      </DmzPageHead>
      <div class="c-tools">
        <label class="lab-search c-search">
          <span class="sr-only">Filter names</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
          <input v-model="query" type="search" :placeholder="`Filter ${dmzIntel.length} names`" autocomplete="off" spellcheck="false">
        </label>
        <p class="c-count dmz-mono" role="status">{{ shownCount === dmzIntel.length ? `${shownCount} entries` : `${shownCount} of ${dmzIntel.length}` }}</p>
      </div>
      <nav class="c-jump" aria-label="Jump to a category">
        <a v-for="group in groups" :key="group.category.id" :href="`#c-${group.category.id}`" class="lab-chip">{{ group.category.label }}<span class="dmz-mono">{{ group.entries.length }}</span></a>
      </nav>
      <section v-for="group in groups" :id="`c-${group.category.id}`" :key="group.category.id" class="c-group" :aria-labelledby="`c-h-${group.category.id}`">
        <header class="c-head">
          <h2 :id="`c-h-${group.category.id}`" class="lab-h2">{{ group.category.label }}</h2>
          <span class="dmz-mono">{{ group.entries.length }}<template v-if="group.entries.length < counts[group.category.id]!"> of {{ counts[group.category.id] }}</template></span>
        </header>
        <ul class="c-names">
          <li v-for="item in group.entries" :key="item.id">
            <NuxtLink :to="{ query: { e: item.id } }" class="c-name">
              <span class="c-dot" :class="`is-${item.confidence}`" :title="item.confidence" aria-hidden="true" />
              <span>{{ item.name }}</span>
              <span v-if="item.type && item.type !== intelCategory(item.category)?.label" class="c-type dmz-mono">{{ item.type }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
      <p v-if="!shownCount" class="lab-empty">No entry matches “{{ query.trim() }}”.</p>
      <p class="c-legend dmz-mono"><span class="c-dot is-official" aria-hidden="true" /> Official <span class="c-dot is-confirmed" aria-hidden="true" /> Confirmed <span class="c-dot is-reported" aria-hidden="true" /> Reported</p>
    </template>
  </div>
</template>

<style scoped>
.c-crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.c-crumbs a { display: inline-flex; align-items: center; min-height: 2.75rem; text-underline-offset: 0.2em; }
.c-crumbs [aria-current] { color: var(--dz-ink); }
.c-url { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0 0 1rem; font-size: 0.75rem; color: var(--dz-ink-2); word-break: break-all; }
.c-url span { color: var(--dz-accent); text-transform: uppercase; letter-spacing: 0.08em; }
.c-dossier { max-width: 52rem; }
.c-pager { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1rem; max-width: 52rem; margin-top: 1rem; }
.c-page { display: flex; flex-direction: column; gap: 0.125rem; min-height: 2.75rem; padding: 0.625rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 12px; text-decoration: none; }
.c-page:hover { border-color: var(--dz-line-strong); }
.c-page.is-next { text-align: right; }
.c-page .dmz-mono { font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.c-pos { font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); text-align: center; }
.c-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1rem; margin-top: 1.75rem; }
.c-search { flex: 1 1 20rem; max-width: 34rem; }
.c-count { margin: 0; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.c-jump { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 1rem; }
.c-group { margin-top: 1.75rem; scroll-margin-top: 1.5rem; }
.c-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; padding-bottom: 0.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--dz-line); }
.c-head .dmz-mono { font-size: 0.75rem; color: var(--dz-muted); }
.c-names { list-style: none; margin: 0; padding: 0; columns: 3 15rem; column-gap: 1.5rem; }
.c-names li { break-inside: avoid; }
.c-name { display: flex; align-items: baseline; gap: 0.5rem; min-height: 2.25rem; padding: 0.3rem 0.25rem; border-radius: 6px; color: #e3e0d0 !important; text-decoration: none; font-size: 1rem; line-height: 1.3; }
.c-name:hover { background: rgba(233, 230, 214, 0.08); color: #fff !important; }
.c-name:hover > span:nth-child(2) { text-decoration: underline; text-underline-offset: 0.2em; }
.c-type { flex: none; margin-left: auto; font-size: 0.625rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.c-dot { flex: none; display: inline-block; width: 0.5rem; height: 0.5rem; border-radius: 50%; transform: translateY(-0.05rem); }
.c-dot.is-official { background: var(--dz-accent); }
.c-dot.is-confirmed { background: var(--dz-green); }
.c-dot.is-reported { border: 1.5px dashed var(--dz-teal); }
.c-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin: 2rem 0 0; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.c-legend .c-dot:not(:first-child) { margin-left: 0.75rem; }
@media (max-width: 599px) {
  .c-pager { grid-template-columns: 1fr 1fr; }
  .c-pos { grid-column: 1 / -1; grid-row: 1; }
  .c-jump { flex-wrap: nowrap; overflow-x: auto; margin: 1rem -1rem 0; padding: 0 1rem 0.25rem; scrollbar-width: none; }
  .c-jump::-webkit-scrollbar { display: none; }
  .c-jump .lab-chip { flex: none; }
}
</style>
