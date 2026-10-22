<script setup lang="ts">
import { dmzStations, dmzOrderChapters } from '#shared/dmz.mjs'
import { dmzIntel, intelCategory } from '#shared/dmz-intel.mjs'
import { dmzKeys } from '#shared/dmz-keys.mjs'
import { labPlaces, labEntry, orderIntel, recipeMaterials, entryPlaces, placeLink } from '#shared/dmz-lab.mjs'

// Concept D: no Intel page. Entries show up inside the stations where the
// question comes up, and open in a drawer. These are mock-ups of three stations.
type Entry = (typeof dmzIntel)[number]
const route = useRoute()
const router = useRouter()
const open = ref<Entry | null>(null)
const views = [
  { id: 'orders', label: 'Orders tracker', icon: dmzStations.find(station => station.id === 'orders')!.icon },
  { id: 'map', label: 'Tac-Map card', icon: dmzStations.find(station => station.id === 'deploy')!.icon },
  { id: 'keys', label: 'Key tracker', icon: dmzStations.find(station => station.id === 'stash')!.icon },
]
const view = computed(() => views.find(item => item.id === route.query.v)?.id || 'orders')
const setView = (id: string) => router.replace({ query: { ...route.query, v: id === 'orders' ? undefined : id } })

const chapters = dmzOrderChapters()
const orders = chapters.flatMap(chapter => chapter.orders)
const orderId = ref('preparation')
const order = computed(() => orders.find(item => item.id === orderId.value)!)
const ticks = ref<Record<string, boolean>>({})
const placeId = ref('deadtown')
const place = computed(() => labPlaces.find(item => item.id === placeId.value)!)
const placeGroups = computed(() => {
  const groups: { id: string, label: string, entries: Entry[] }[] = []
  for (const entry of place.value.intel) {
    const group = groups.find(item => item.id === entry.category)
    if (group) group.entries.push(entry)
    else groups.push({ id: entry.category, label: intelCategory(entry.category)!.label, entries: [entry] })
  }
  return groups
})
const keys = dmzKeys.filter(key => key.rooms.length)
const keyId = ref(keys.find(key => key.id === 'counting-room-vault-key')?.id || keys[0]!.id)
const key = computed(() => keys.find(item => item.id === keyId.value)!)
const keyIntel = computed(() => labEntry(key.value.intel))

// The one line that answers the question in place: a cost, a square or a summary.
function inline(entry: Entry) {
  const materials = recipeMaterials(entry)
  if (materials.length) return materials.map(item => `${item.amount} ${item.name}`).join(' · ')
  const places = entryPlaces(entry).filter(item => item.major)
  if (entry.category === 'map' && places[0]) return `${places[0].square}${places[0].threat ? ` · ${places[0].threat}` : ''}`
  return entry.summary
}
</script>

<template>
  <div class="dmz-page">
    <DmzLabBanner concept="d" />
    <DmzPageHead title="Intel in the field" :icon="dmzStations.find(station => station.id === 'intel')!.icon" status="No Intel page · entries open inside the stations">
      <p class="lab-lede">Intel stops being a place you go. It shows up where the question comes up, one line at a time, and opens in a drawer when you need the rest. Below are three stations as they could look.</p>
    </DmzPageHead>

    <div class="d-views" role="group" aria-label="Show a station">
      <button v-for="item in views" :key="item.id" type="button" class="d-view" :aria-pressed="view === item.id" @click="setView(item.id)">
        <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="item.icon" /></svg>{{ item.label }}
      </button>
    </div>

    <section v-if="view === 'orders'" class="d-stage" aria-label="Orders tracker mock-up">
      <nav class="d-pick" aria-label="Pick an Order">
        <label class="d-select">
          <span class="sr-only">Order</span>
          <select v-model="orderId">
            <optgroup v-for="chapter in chapters" :key="chapter.title" :label="chapter.title">
              <option v-for="item in chapter.orders" :key="item.id" :value="item.id">{{ item.name }}</option>
            </optgroup>
          </select>
        </label>
        <div v-for="chapter in chapters" :key="chapter.title" class="d-list">
          <span class="dmz-mono">{{ chapter.title }}</span>
          <button v-for="item in chapter.orders" :key="item.id" type="button" :aria-pressed="orderId === item.id" @click="orderId = item.id">{{ item.name }}<span v-if="orderIntel(item).length" class="dmz-mono">{{ orderIntel(item).length }}</span></button>
        </div>
      </nav>
      <article class="d-order">
        <p class="d-order-page dmz-mono">{{ order.chapter }}</p>
        <h2 class="d-order-name dmz-mono">{{ order.name }}</h2>
        <ul class="d-tasks">
          <li v-for="task in order.tasks" :key="task.id">
            <button type="button" class="d-task" :aria-pressed="!!ticks[task.id]" @click="ticks = { ...ticks, [task.id]: !ticks[task.id] }">
              <span class="d-box" aria-hidden="true"><svg v-if="ticks[task.id]" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6" /></svg></span>
              <span class="w-semi">{{ task.text }}</span>
            </button>
          </li>
        </ul>
        <div class="d-intel">
          <h3 class="d-intel-head dmz-mono">Intel for this Order<span>{{ orderIntel(order).length || 'none named' }}</span></h3>
          <ul v-if="orderIntel(order).length">
            <li v-for="entry in orderIntel(order)" :key="entry.id">
              <button type="button" class="d-chip" @click="open = entry">
                <span class="d-chip-top"><span class="w-semi">{{ entry.name }}</span><span class="dmz-mono">{{ entry.type }}</span></span>
                <span class="d-chip-line">{{ inline(entry) }}</span>
              </button>
            </li>
          </ul>
          <p v-else class="d-none">This Order names nothing in Intel. Its tips would sit here once linked by hand.</p>
        </div>
      </article>
    </section>

    <section v-else-if="view === 'map'" class="d-stage" aria-label="Tac-Map card mock-up">
      <nav class="d-pick" aria-label="Pick a place">
        <label class="d-select">
          <span class="sr-only">Place</span>
          <select v-model="placeId"><option v-for="item in labPlaces" :key="item.id" :value="item.id">{{ item.name }}</option></select>
        </label>
        <div class="d-list">
          <span class="dmz-mono">Major locations</span>
          <button v-for="item in labPlaces" :key="item.id" type="button" :aria-pressed="placeId === item.id" @click="placeId = item.id">{{ item.name }}<span class="dmz-mono">{{ item.square }}</span></button>
        </div>
      </nav>
      <article class="d-card">
        <header class="d-card-head">
          <span class="d-diamond" :data-threat="place.threat?.toLowerCase()" aria-hidden="true" />
          <div>
            <h2 class="lab-h2">{{ place.name }}</h2>
            <p class="dmz-mono">{{ place.square }}<template v-if="place.threat"> · {{ place.threat }} threat</template></p>
          </div>
          <NuxtLink :to="placeLink(place.id)" class="d-maplink dmz-mono">On the map ↗</NuxtLink>
        </header>
        <div v-for="group in placeGroups" :key="group.id" class="d-group">
          <h3 class="d-intel-head dmz-mono">{{ group.label }}<span>{{ group.entries.length }}</span></h3>
          <ul>
            <li v-for="entry in group.entries" :key="entry.id">
              <button type="button" class="d-chip" @click="open = entry">
                <span class="d-chip-top"><span class="w-semi">{{ entry.name }}</span><span class="dmz-mono">{{ entry.type }}</span></span>
                <span class="d-chip-line">{{ inline(entry) }}</span>
              </button>
            </li>
          </ul>
        </div>
      </article>
    </section>

    <section v-else class="d-stage" aria-label="Key tracker mock-up">
      <nav class="d-pick" aria-label="Pick a key">
        <label class="d-select">
          <span class="sr-only">Key</span>
          <select v-model="keyId"><option v-for="item in keys" :key="item.id" :value="item.id">{{ item.name }}</option></select>
        </label>
        <div class="d-list d-list--scroll">
          <span class="dmz-mono">Keys with a reported room · {{ keys.length }}</span>
          <button v-for="item in keys" :key="item.id" type="button" :aria-pressed="keyId === item.id" @click="keyId = item.id">{{ item.name }}</button>
        </div>
      </nav>
      <article class="d-card">
        <header class="d-card-head">
          <svg class="lab-icon" viewBox="0 0 24 24" aria-hidden="true"><path :d="views[2]!.icon" /></svg>
          <div>
            <h2 class="lab-h2">{{ key.name }}</h2>
            <p class="dmz-mono">{{ key.type }}<template v-if="key.rarity"> · {{ key.rarity }}</template></p>
          </div>
        </header>
        <ul class="d-rooms">
          <li v-for="room in key.rooms" :key="room.report">
            <NuxtLink :to="placeLink(room.report)" class="d-room">
              <span class="w-semi">{{ [room.name, room.placeName].filter(Boolean).join(' · ') || 'Room' }}</span>
              <span class="dmz-mono">{{ room.squares.join(' ') }}</span>
              <span class="d-room-where">{{ room.where }}</span>
            </NuxtLink>
          </li>
        </ul>
        <div v-if="keyIntel" class="d-inline">
          <h3 class="d-intel-head dmz-mono">From Intel</h3>
          <p>{{ keyIntel.summary }}</p>
          <button type="button" class="d-more dmz-mono" @click="open = keyIntel">All {{ keyIntel.details?.length || 0 }} facts and {{ keyIntel.sources.length }} sources <span aria-hidden="true">→</span></button>
        </div>
      </article>
    </section>

    <section class="d-rest dmz-panel" aria-labelledby="d-rest">
      <span id="d-rest" class="dmz-label dmz-mono">Where everything else goes</span>
      <ul>
        <li><strong>Rules, exfil and the FOB</strong> move into the <NuxtLink to="/dmz/briefing">Briefing</NuxtLink>, as expandable sections.</li>
        <li><strong>Traits and Operators</strong> fill the Operators station, which links to the Briefing today.</li>
        <li><strong>Bugs and dates</strong> become a small Status panel in the station menu.</li>
        <li><strong>Gear and recipes</strong> still need a home: the 3D Printer station, or a fallback list.</li>
      </ul>
    </section>

    <DmzLabDrawer :entry="open" @close="open = null" />
  </div>
</template>

<style scoped>
.d-views { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 1.75rem; }
.d-view { display: inline-flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0 1.125rem 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.5); color: var(--dz-ink-2); font: inherit; font-size: 1.0625rem; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; cursor: pointer; }
.d-view:hover { border-color: var(--dz-ink); color: #fff; }
.d-view[aria-pressed='true'] { background: var(--dz-ink); border-color: var(--dz-ink); color: var(--dz-bg); }
.d-stage { display: grid; grid-template-columns: 15rem minmax(0, 1fr); align-items: start; gap: 1.5rem; margin-top: 1.25rem; }
.d-pick { position: sticky; top: 1.5rem; display: flex; flex-direction: column; gap: 0.875rem; max-height: calc(100vh - 3rem); overflow-y: auto; scrollbar-width: thin; }
.d-select { display: none; }
.d-list { display: flex; flex-direction: column; gap: 0.125rem; }
.d-list > .dmz-mono { margin-bottom: 0.25rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.d-list button { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; min-height: 2.5rem; padding: 0 0.75rem; border: 0; border-radius: 8px; background: transparent; color: var(--dz-ink-2); font: inherit; font-size: 0.975rem; text-align: left; cursor: pointer; }
.d-list button .dmz-mono { font-size: 0.6875rem; color: var(--dz-muted); }
.d-list button:hover { background: rgba(233, 230, 214, 0.08); color: #fff; }
.d-list button[aria-pressed='true'] { background: rgba(233, 230, 214, 0.16); color: #fff; box-shadow: inset 3px 0 var(--dz-ink); }

.d-order { padding: 1rem 1.5rem 1.25rem; background: linear-gradient(180deg, rgba(74, 150, 142, 0.55), rgba(34, 70, 66, 0.5)); border: 1px solid rgba(170, 220, 210, 0.24); border-top: 2px solid rgba(200, 240, 230, 0.55); }
.d-order-page { margin: 0; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #cfe9e4; }
.d-order-name { margin: 0.25rem 0 0.5rem; font-size: 1.25rem; letter-spacing: 0.03em; text-transform: uppercase; color: #f0eee2; }
.d-tasks { list-style: none; margin: 0; padding: 0; }
.d-task { display: flex; align-items: flex-start; gap: 0.875rem; width: 100%; min-height: 3rem; padding: 0.5rem 0; border: 0; background: none; color: #f0eee2; font: inherit; font-size: 1.25rem; line-height: 1.25; text-align: left; font-variation-settings: 'wdth' 75; cursor: pointer; }
.d-box { flex: 0 0 1.375rem; height: 1.5rem; display: grid; place-items: center; }
.d-box::before { content: ''; width: 0.9375rem; height: 0.9375rem; border: 1.5px solid #cfd2c4; background: rgba(233, 230, 214, 0.14); grid-area: 1 / 1; }
.d-box svg { grid-area: 1 / 1; width: 1.25rem; height: 1.25rem; fill: none; stroke: var(--dz-green); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.d-task[aria-pressed='true'] .w-semi { color: var(--dz-green-ink); text-decoration: line-through; }
.d-intel { margin-top: 0.75rem; padding-top: 0.875rem; border-top: 1px solid rgba(233, 230, 214, 0.35); }
.d-intel-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 0 0.5rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #cfe9e4; }
.d-intel-head span { font-weight: 500; }
.d-intel ul, .d-group ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 0.375rem; }
.d-chip { display: flex; flex-direction: column; gap: 0.2rem; width: 100%; min-height: 3rem; padding: 0.5rem 0.75rem; border: 1px solid rgba(233, 230, 214, 0.28); border-radius: 10px; background: rgba(10, 12, 11, 0.35); color: #f0eee2; font: inherit; text-align: left; cursor: pointer; }
.d-chip:hover { border-color: rgba(233, 230, 214, 0.7); background: rgba(10, 12, 11, 0.5); }
.d-chip-top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; }
.d-chip-top .w-semi { font-size: 1rem; font-weight: 600; }
.d-chip-top .dmz-mono { flex: none; font-size: 0.625rem; letter-spacing: 0.06em; text-transform: uppercase; color: #cfe9e4; }
.d-chip-line { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.875rem; line-height: 1.4; color: #d5e6e1; }
.d-none { margin: 0; color: #d5e6e1; font-size: 0.95rem; }

.d-card { display: flex; flex-direction: column; gap: 1rem; padding: 1.125rem 1.25rem 1.25rem; background: rgba(20, 24, 23, 0.9); border: 1px solid var(--dz-line-strong); border-radius: 18px; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3); }
.d-card-head { display: flex; align-items: center; gap: 0.875rem; }
.d-card-head > div { flex: 1 1 auto; }
.d-card-head p { margin: 0.25rem 0 0; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); }
.d-diamond { flex: none; width: 1rem; height: 1rem; transform: rotate(45deg); border: 2px solid var(--dz-ink); background: var(--dz-bg); }
.d-diamond[data-threat='high'], .d-diamond[data-threat='critical'] { border-color: #e39a6b; }
.d-diamond[data-threat='extreme'] { border-color: #e46a6a; background: rgba(228, 106, 106, 0.3); }
.d-diamond[data-threat='medium'] { border-color: var(--dz-accent); }
.d-diamond[data-threat='low'] { border-color: var(--dz-green); }
.d-maplink { flex: none; display: inline-flex; align-items: center; min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
.d-group .d-intel-head { color: var(--dz-teal); }
.d-group .d-chip { border-color: var(--dz-line); background: rgba(10, 12, 11, 0.45); }
.d-group .d-chip-top .dmz-mono { color: var(--dz-muted); }
.d-group .d-chip-line { color: #cfccbd; }
.d-rooms { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.d-room { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.25rem 0.75rem; padding: 0.5rem 0.75rem; border-left: 2px solid var(--dz-line-strong); background: rgba(10, 12, 11, 0.35); text-decoration: none; }
.d-room:hover { border-left-color: var(--dz-ink); }
.d-room .dmz-mono { font-size: 0.75rem; font-weight: 700; }
.d-room-where { grid-column: 1 / -1; font-size: 0.9rem; color: #cfccbd; }
.d-inline { padding: 0.875rem 1rem; border: 1px dashed var(--dz-line-strong); border-radius: 12px; }
.d-inline .d-intel-head { color: var(--dz-teal); }
.d-inline p { margin: 0; color: #dcd9cb; }
.d-more { min-height: 2.75rem; margin-top: 0.25rem; padding: 0; border: 0; background: none; color: var(--dz-ink); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: underline; text-underline-offset: 0.25em; cursor: pointer; }
.d-rest { margin-top: 2rem; }
.d-rest ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.375rem; color: #dcd9cb; }
.d-rest strong { color: #f3f1e5; }
.d-rest a { text-underline-offset: 0.2em; }

@media (max-width: 899px) {
  .d-stage { grid-template-columns: 1fr; gap: 0.875rem; }
  .d-pick { position: static; max-height: none; overflow: visible; }
  .d-list { display: none; }
  .d-select { position: relative; display: flex; align-items: center; min-height: 3rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); }
  .d-select select { -webkit-appearance: none; appearance: none; width: 100%; min-height: 2.875rem; padding: 0 1.125rem; border: 0; border-radius: 999px; background: transparent; color: var(--dz-ink); font: inherit; font-size: 1rem; }
  .d-select option, .d-select optgroup { background: #161a19; color: var(--dz-ink); }
  .d-order { padding: 0.875rem 1rem 1rem; }
  .d-task { font-size: 1.125rem; }
  .d-card { padding: 1rem; }
  .d-card-head { flex-wrap: wrap; }
}
</style>
