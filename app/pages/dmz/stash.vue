<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { intelConfidence } from '#shared/dmz-intel.mjs'
import { placeLink } from '#shared/dmz-stations.mjs'
import { dmzKeys, dmzKeyGuides, dmzKeyPlaces, filterKeys, haulLabel, keyHaul, keyPlaceIds, keyTally, keyVideos, sortKeysByHaul, KEY_MARKS, DMZ_KEYS_CHECKED } from '#shared/dmz-keys.mjs'

// The key tracker. Search and filters stay on the page; held and used marks
// are saved on this device. Cards link to Intel, to each room's Tac-Map pin and
// to videos of its rooms.
type Key = (typeof dmzKeys)[number]
type Room = Key['rooms'][number]
type Mark = (typeof KEY_MARKS)[number]

const route = useRoute()
const { state, saveError, setMark, reset } = useDmzKeys()
const icon = dmzStations.find(station => station.id === 'stash')!.icon
const query = ref('')
const levels = ref(intelConfidence.map(level => level.id))
const mark = ref<'all' | Mark | 'none'>('all')
const place = ref('all')
const target = ref('')
const confirmReset = ref(false)

const marks = computed(() => state.value.marks)
const tally = computed(() => keyTally(marks.value))
const shown = computed(() => filterKeys(dmzKeys, { query: query.value, mark: mark.value, place: place.value, confidence: levels.value, marks: marks.value }))
const filtered = computed(() => query.value.trim() !== '' || mark.value !== 'all' || place.value !== 'all' || levels.value.length < intelConfidence.length)
const markFilters = computed(() => [
  { id: 'all', label: 'All', count: dmzKeys.length },
  { id: 'held', label: 'Held', count: tally.value.held },
  { id: 'used', label: 'Used', count: tally.value.used },
  { id: 'none', label: 'Unmarked', count: dmzKeys.length - tally.value.held - tally.value.used },
] as const)
const NO_PLACE = 'No place on the map yet'
const placeName = (id: string) => id === 'none' ? NO_PLACE : dmzKeyPlaces.find(item => item.id === id)?.name || id
const placeCount = (id: string) => dmzKeys.filter(key => id === 'none' ? !keyPlaceIds(key).length : keyPlaceIds(key).includes(id)).length

// Keys sit under their first room's place, or under the place being filtered,
// ordered by haul tier and then by published openings.
const groups = computed(() => {
  const list: { id: string, name: string, keys: Key[] }[] = []
  for (const key of shown.value) {
    const id = place.value === 'all' ? key.area || 'none' : place.value
    const group = list.find(item => item.id === id)
    if (group) group.keys.push(key)
    else list.push({ id, name: placeName(id), keys: [key] })
  }
  return list.map(group => ({ ...group, keys: sortKeysByHaul(group.keys) }))
})
const videosOf = Object.fromEntries(dmzKeys.map(key => [key.id, keyVideos(key)]))
const heldIn = (keys: Key[]) => keys.filter(key => marks.value[key.id] === 'held').length

const confidenceLabel = (id: string) => intelConfidence.find(level => level.id === id)?.label
const roomPlace = (room: Room) => room.placeName ? [room.placeName, room.areaName !== room.placeName && room.areaName].filter(Boolean).join(', ') : 'Place not reported'
// A Reported room under a better-sourced key says so.
const roomDoubt = (key: Key, room: Room) => room.confidence === 'reported' && key.confidence !== 'reported'
const markLabel = (value: Mark) => value === 'held' ? 'Held' : 'Used'

function toggleLevel(id: string) {
  levels.value = levels.value.includes(id) ? levels.value.filter(level => level !== id) : intelConfidence.map(level => level.id).filter(level => level === id || levels.value.includes(level))
}
function clearFilters() {
  query.value = ''
  levels.value = intelConfidence.map(level => level.id)
  mark.value = 'all'
  place.value = 'all'
}
function resetAll() {
  if (!confirmReset.value) { confirmReset.value = true; return }
  reset()
  confirmReset.value = false
}
// Links to #key-<id> mark that card.
onMounted(() => { target.value = route.hash })
watch(() => route.hash, hash => { target.value = hash })
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Key tracker" :icon="icon" :checked="DMZ_KEYS_CHECKED" :status="`${dmzKeys.length} keys · ${tally.held} held · ${tally.used} used`">
      <p class="ks-lede">Every key and locked room in Intel, with the rooms players report on the Hajin Tac-Map. Mark a key Held while it sits in your Stash and Used once its room is open. Each card links to its Intel entry and its room on the map.</p>
    </DmzPageHead>

    <div class="ks-tools">
      <label class="ks-search">
        <span class="sr-only">Search keys</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
        <input v-model="query" type="search" placeholder="Search keys, rooms, places or a square like F5" autocomplete="off" spellcheck="false">
      </label>
      <div class="ks-levels" role="group" aria-label="Show confidence levels">
        <button v-for="level in intelConfidence" :key="level.id" type="button" class="ks-level dmz-mono" :class="`is-${level.id}`" :aria-pressed="levels.includes(level.id)" :title="level.desc" @click="toggleLevel(level.id)">{{ level.label }}</button>
      </div>
    </div>
    <div class="ks-filters">
      <div class="ks-seg" role="group" aria-label="Show keys by mark">
        <button v-for="item in markFilters" :key="item.id" type="button" class="dmz-mono" :aria-pressed="mark === item.id" @click="mark = item.id">{{ item.label }}<span>{{ item.count }}</span></button>
      </div>
      <label class="ks-place">
        <span class="sr-only">Show keys at a place</span>
        <select v-model="place">
          <option value="all">All places</option>
          <option v-for="item in dmzKeyPlaces" :key="item.id" :value="item.id">{{ item.name }} ({{ placeCount(item.id) }})</option>
          <option value="none">{{ NO_PLACE }} ({{ placeCount('none') }})</option>
        </select>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </label>
    </div>

    <div class="ks-layout">
      <div class="ks-results">
        <p class="ks-count dmz-mono" role="status">
          {{ shown.length === dmzKeys.length ? `Showing all ${shown.length} keys` : `${shown.length} of ${dmzKeys.length} keys` }}
          <button v-if="filtered" type="button" class="ks-clear" @click="clearFilters">Clear filters</button>
        </p>
        <p v-if="shown.length" class="ks-legend">Ordered by what openings have shown. In each place, top hauls come first, then steady and starter ones, then keys not rated yet. An opening is a published video or write-up of the room with what was inside, and one opening can be luck.</p>

        <section v-for="group in groups" :key="group.id" class="ks-group" :aria-labelledby="`ks-h-${group.id}`">
          <header class="ks-group-head">
            <h2 :id="`ks-h-${group.id}`">{{ group.name }}</h2>
            <p class="dmz-mono">{{ group.keys.length }} key{{ group.keys.length > 1 ? 's' : '' }}<template v-if="heldIn(group.keys)"> · {{ heldIn(group.keys) }} held</template></p>
          </header>
          <div class="ks-grid">
            <article
              v-for="key in group.keys" :id="`key-${key.id}`" :key="key.id" class="ks-key"
              :class="{ 'is-held': marks[key.id] === 'held', 'is-used': marks[key.id] === 'used', 'is-target': target === `#key-${key.id}` }"
            >
              <header class="ks-key-head dmz-mono">
                <span>{{ key.type }}<template v-if="key.rarity"> · {{ key.rarity }}</template></span>
                <span class="ks-badge" :class="`is-${key.confidence}`">{{ confidenceLabel(key.confidence) }}</span>
              </header>
              <h3>{{ key.name }}</h3>
              <p v-if="keyHaul(key)" class="ks-haul dmz-mono" :class="[`is-${keyHaul(key)?.haul}`, { 'is-unopened': !keyHaul(key)?.openings }]">{{ haulLabel(key) }}</p>
              <ul v-if="key.rooms.length" class="ks-rooms">
                <li v-for="room in key.rooms" :key="room.report">
                  <NuxtLink :to="placeLink(room.report)" class="ks-room">
                    <span class="ks-room-top">
                      <span class="ks-room-place w-semi"><template v-if="room.name">{{ room.name }} · </template>{{ roomPlace(room) }}</span>
                      <span class="ks-squares dmz-mono">
                        <span v-for="square in room.squares" :key="square" class="ks-sq" :class="{ 'is-place': room.placeSquare }" :title="room.placeSquare ? 'The place\'s square; no square is reported for this room' : undefined">{{ square }}<span v-if="room.placeSquare" class="sr-only"> (place square)</span></span>
                      </span>
                      <svg class="ks-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14" /></svg>
                    </span>
                    <span class="ks-room-where"><span v-if="roomDoubt(key, room)" class="ks-doubt dmz-mono">Room reported</span>{{ room.where }}</span>
                    <span class="sr-only">Show on the Tac-Map</span>
                  </NuxtLink>
                </li>
              </ul>
              <template v-else>
                <p class="ks-summary">{{ key.summary }}</p>
                <NuxtLink v-if="key.place" :to="placeLink(key.place)" class="ks-room ks-room--place">
                  <span class="ks-room-top">
                    <span class="ks-room-place w-semi">Named at {{ key.placeName }}</span>
                    <svg class="ks-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14" /></svg>
                  </span>
                  <span class="ks-room-where">No room reported yet</span>
                  <span class="sr-only">Show the place on the Tac-Map</span>
                </NuxtLink>
                <p v-else class="ks-none dmz-mono">No room reported yet</p>
              </template>
              <DmzVideoGuides v-if="videosOf[key.id]?.length" :refs="videosOf[key.id] || []" title="Watch it done" variant="fold" />
              <footer class="ks-key-foot">
                <div class="ks-marks" role="group" :aria-label="`${key.name}: mark as`">
                  <button v-for="value in KEY_MARKS" :key="value" type="button" class="ks-mark dmz-mono" :class="`is-${value}`" :aria-pressed="marks[key.id] === value" @click="setMark(key.id, value)">
                    <svg v-if="marks[key.id] === value" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6" /></svg>
                    <span v-else class="ks-box" aria-hidden="true" />
                    {{ markLabel(value) }}
                  </button>
                </div>
                <DmzIntelLink :id="key.intel" class="ks-intel">Intel<span class="sr-only"> entry for {{ key.name }}</span><span aria-hidden="true"> →</span></DmzIntelLink>
              </footer>
            </article>
          </div>
        </section>

        <div v-if="!shown.length" class="ks-empty dmz-panel">
          <p>No keys match {{ query.trim() ? `“${query.trim()}”` : 'these filters' }}.</p>
          <button type="button" class="dmz-pill dmz-pill--ghost" @click="clearFilters">Clear filters</button>
        </div>
        <p class="ks-foot dmz-mono">Squares come from key cards and guides. A dashed square is the place's own, where no square is reported for the room.</p>
      </div>

      <div class="ks-side">
        <section class="dmz-panel dmz-section">
          <span class="dmz-label dmz-mono">How keys work</span>
          <p>Keys open locked loot rooms around Hajin, and each key's in-game description names its grid square. You can keep keys in your Stash between deployments.</p>
          <p>Some keys are spent after one use, such as the Gun Store Weapons Locker key. Lieutenants can drop a key to their own loot room.</p>
          <p>Labels follow Intel: Official comes from Activision, Confirmed has two independent sources or in-game proof, and Reported has one source so far.</p>
          <span class="dmz-label dmz-mono ks-more-label">More on keys and doors</span>
          <ul class="ks-guides">
            <li v-for="entry in dmzKeyGuides" :key="entry.id"><DmzIntelLink :id="entry.id" anchor>{{ entry.name }}</DmzIntelLink></li>
          </ul>
        </section>
        <section class="dmz-panel dmz-section">
          <span class="dmz-label dmz-mono">Saved on this device</span>
          <p>Marks stay in this browser between matches. They are not linked to your game account.</p>
          <p v-if="saveError" class="dmz-note" role="alert">This browser blocked saving, so marks will reset when you leave the page.</p>
          <div class="ks-reset">
            <button type="button" class="dmz-pill dmz-pill--ghost" @click="resetAll">{{ confirmReset ? 'Confirm: clear all marks' : 'Clear all marks' }}</button>
            <button v-if="confirmReset" type="button" class="dmz-pill dmz-pill--ghost" @click="confirmReset = false">Keep them</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ks-lede { max-width: 46rem; margin: 1rem 0 0; color: #dcd9cb; font-size: 1.0625rem; }

.ks-tools, .ks-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.ks-tools { margin-top: 1.75rem; }
.ks-filters { margin-top: 0.75rem; }
.ks-search { flex: 1 1 18rem; display: flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0 1.125rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); }
.ks-search:focus-within { border-color: var(--dz-ink); }
.ks-search svg { flex: none; width: 1.125rem; height: 1.125rem; fill: none; stroke: var(--dz-muted); stroke-width: 2; stroke-linecap: round; }
.ks-search input { flex: 1; min-width: 0; height: 2.75rem; border: 0; background: transparent; color: var(--dz-ink); font: inherit; font-size: 1.0625rem; outline: none; }
.ks-search input::placeholder { color: #9a9b8f; }
.ks-levels { display: flex; gap: 0.375rem; }
.ks-level { min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-muted); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.ks-level[aria-pressed='true'] { color: var(--dz-bg); }
.ks-level.is-official[aria-pressed='true'] { background: var(--dz-accent); border-color: var(--dz-accent); }
.ks-level.is-confirmed[aria-pressed='true'] { background: var(--dz-green); border-color: var(--dz-green); }
.ks-level.is-reported[aria-pressed='true'] { background: var(--dz-teal); border-color: var(--dz-teal); }
.ks-level[aria-pressed='false'] { text-decoration: line-through; }
.ks-seg { display: inline-flex; gap: 0.25rem; padding: 0.25rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.55); }
.ks-seg button { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; min-height: 2.75rem; padding: 0 0.875rem; border: 0; border-radius: 999px; background: transparent; color: var(--dz-ink-2); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.ks-seg button span { font-weight: 500; color: var(--dz-muted); }
.ks-seg button:hover { color: #fff; }
.ks-seg button[aria-pressed='true'], .ks-seg button[aria-pressed='true'] span { background: var(--dz-ink); color: var(--dz-bg); }
.ks-place { position: relative; display: inline-flex; align-items: center; min-height: 3rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); }
.ks-place:focus-within { border-color: var(--dz-ink); }
.ks-place select { -webkit-appearance: none; appearance: none; min-height: 2.875rem; padding: 0 2.75rem 0 1.125rem; border: 0; border-radius: 999px; background: transparent; color: var(--dz-ink); font: inherit; font-size: 1rem; cursor: pointer; }
.ks-place select:focus-visible { outline: none; }
.ks-place option { background: #161a19; color: var(--dz-ink); }
.ks-place svg { position: absolute; right: 1rem; width: 1rem; height: 1rem; fill: none; stroke: var(--dz-muted); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }

.ks-layout { display: grid; grid-template-columns: minmax(0, 1fr) 17.5rem; align-items: start; gap: 2rem; margin-top: 1.5rem; }
.ks-count { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin: 0 0 0.5rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.ks-legend { max-width: 46rem; margin: 0 0 1rem; font-size: 0.9375rem; line-height: 1.5; color: var(--dz-muted); }
.ks-clear { min-height: 2.75rem; padding: 0 0.25rem; border: 0; background: none; color: var(--dz-ink); font: inherit; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
.ks-group { margin-top: 1.5rem; }
.ks-group:first-of-type { margin-top: 0; }
.ks-group-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.25rem 1rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--dz-line); }
.ks-group-head h2 { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.ks-group-head p { margin: 0; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.ks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr)); align-items: start; gap: 0.75rem; }

/* No backdrop blur here, as on the Intel cards: dozens of blurred cards scroll heavily. */
.ks-key { display: flex; flex-direction: column; gap: 0.625rem; padding: 1rem 1.125rem; background: rgba(20, 24, 23, 0.82); border: 1px solid var(--dz-line); border-radius: 16px; scroll-margin-top: 1.5rem; }
.ks-key.is-held { border-color: rgba(169, 217, 138, 0.6); box-shadow: inset 3px 0 var(--dz-green); }
.ks-key.is-used { background: rgba(20, 24, 23, 0.5); }
.ks-key.is-used h3 { color: var(--dz-muted); text-decoration: line-through; text-decoration-color: rgba(184, 185, 172, 0.7); }
.ks-key.is-target { border-color: var(--dz-accent); box-shadow: 0 0 0 1px var(--dz-accent), 0 0 24px rgba(221, 179, 99, 0.18); }
.ks-key-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.ks-badge { flex: none; padding: 0.2rem 0.55rem; border-radius: 999px; border: 1px solid currentColor; font-weight: 700; }
.ks-badge.is-official { color: var(--dz-accent); }
.ks-badge.is-confirmed { color: var(--dz-green); }
.ks-badge.is-reported { color: var(--dz-teal); border-style: dashed; }
.ks-key h3 { margin: 0; font-size: 1.3125rem; font-weight: 700; line-height: 1.15; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.ks-haul { align-self: flex-start; max-width: 100%; margin: 0; padding: 0.2rem 0.55rem; border: 1px solid var(--dz-line-strong); border-radius: 4px; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-ink-2); }
.ks-haul.is-top { border-color: var(--dz-accent); color: var(--dz-accent); }
.ks-haul.is-starter { color: var(--dz-muted); }
.ks-haul.is-unopened { border-style: dashed; }
.ks-rooms { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.ks-room { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0.625rem; background: rgba(10, 12, 11, 0.35); border-left: 2px solid var(--dz-line-strong); color: inherit !important; text-decoration: none; }
.ks-room:hover { background: rgba(233, 230, 214, 0.08); border-left-color: var(--dz-ink); }
.ks-room-top { display: flex; align-items: center; gap: 0.5rem; }
.ks-room-place { flex: 1 1 auto; min-width: 0; font-size: 1rem; font-weight: 600; color: #f0eee2; }
.ks-squares { flex: none; display: flex; gap: 0.25rem; }
.ks-sq { padding: 0.05rem 0.4rem; border: 1px solid var(--dz-line-strong); border-radius: 4px; font-size: 0.75rem; font-weight: 700; color: var(--dz-ink); }
.ks-sq.is-place { border-style: dashed; color: var(--dz-muted); }
.ks-pin { flex: none; width: 1.125rem; height: 1.125rem; fill: none; stroke: var(--dz-muted); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.ks-room:hover .ks-pin { stroke: var(--dz-ink); }
.ks-room-where { font-size: 0.9rem; line-height: 1.45; color: #cfccbd; }
.ks-doubt { display: inline-block; margin-right: 0.5rem; padding: 0 0.4rem; border: 1px dashed var(--dz-teal); border-radius: 4px; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); vertical-align: 0.1em; }
.ks-summary { margin: 0; color: #dcd9cb; font-size: 0.95rem; }
.ks-none { margin: 0; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.ks-key-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-top: auto; padding-top: 0.625rem; border-top: 1px solid var(--dz-line); }
.ks-marks { display: flex; gap: 0.375rem; }
.ks-mark { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-ink-2); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.ks-mark:hover { border-color: var(--dz-ink); color: #fff; }
.ks-mark svg { width: 0.875rem; height: 0.875rem; fill: none; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.ks-box { width: 0.75rem; height: 0.75rem; border: 1.5px solid currentColor; }
.ks-mark.is-held[aria-pressed='true'] { background: var(--dz-green); border-color: var(--dz-green); color: var(--dz-bg); }
.ks-mark.is-used[aria-pressed='true'] { background: var(--dz-ink-2); border-color: var(--dz-ink-2); color: var(--dz-bg); }
.ks-intel { margin-left: auto; display: inline-flex; align-items: center; min-height: 2.75rem; padding: 0 0.25rem; font-size: 0.875rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.ks-empty { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
.ks-empty p { margin: 0; color: #dcd9cb; }
.ks-foot { margin: 1rem 0 0; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }

.ks-side { position: sticky; top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.ks-side .dmz-section { margin-top: 0; }
.ks-side p { font-size: 1rem; }
.ks-more-label { margin-top: 1.25rem; }
.ks-guides { list-style: none; margin: 0; padding: 0; }
.ks-guides li { font-size: 1rem !important; }
.ks-guides a { display: flex; align-items: center; min-height: 2.5rem; text-underline-offset: 0.2em; }
.ks-reset { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ks-reset .dmz-pill { font-size: 0.95rem; min-height: 2.75rem; }

@media (max-width: 899px) {
  .ks-layout { grid-template-columns: 1fr; gap: 1.25rem; margin-top: 1rem; }
  .ks-side { position: static; }
  .ks-levels, .ks-seg, .ks-place { width: 100%; }
  .ks-level { flex: 1; }
  .ks-seg { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ks-seg button { flex-direction: column; gap: 0; padding: 0 0.25rem; font-size: 0.6875rem; letter-spacing: 0.04em; line-height: 1.2; }
  .ks-place select { width: 100%; }
  .ks-grid { grid-template-columns: 1fr; }
}
</style>
