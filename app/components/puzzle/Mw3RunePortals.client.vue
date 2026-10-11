<script setup lang="ts">
import data from '~/data/mw3RunePortals.json'
import type { PortalPoint } from '~/types/mw3Portals'
import { portalStorageKey, readPortalSelection, portalQuery, portalMatches } from '~/utils/mw3RunePortals.mjs'

const route = useRoute()
const router = useRouter()
const to = ref('')
const from = ref('')
const query = ref('')
const showEntrances = ref(true)
const showDestinations = ref(true)
const invalidLink = ref(false)
const storageError = ref(false)
const shareMessage = ref('')
const shareFallback = ref('')
const codeState = ref<'loading' | 'ready' | 'error'>('loading')
const answer = ref<HTMLElement | null>(null)
const answerHeading = ref<HTMLElement | null>(null)
const answerInView = ref(true)
const portalMap = ref<{ locate: (point: PortalPoint) => void } | null>(null)
let intersection: IntersectionObserver | undefined
let mounted = false

const destination = computed(() => data.destinations.find(point => point.id === to.value))
const entrance = computed(() => data.entrances.find(point => point.id === from.value))
const entrances = computed(() => showEntrances.value ? data.entrances.filter(point => portalMatches(point, query.value)) : [])
const destinations = computed(() => showDestinations.value ? data.destinations.filter(point => portalMatches(point, query.value)) : [])
const visibleIds = computed(() => [...entrances.value, ...destinations.value].map(point => point.id))
const glyphLabel = (id: string) => data.glyphs.find(glyph => glyph.id === id)?.label || 'Unknown rune'
const selection = () => ({ to: to.value, from: from.value })
function save() {
  try { localStorage.setItem(portalStorageKey, JSON.stringify({ version: 2, ...selection() })); storageError.value = false } catch { storageError.value = true }
}
function readRoute(initial = false) {
  let saved = null
  if (initial) { try { saved = localStorage.getItem(portalStorageKey) } catch { storageError.value = true } }
  const value = readPortalSelection(route.query, saved, data)
  to.value = value.to
  from.value = value.from
  invalidLink.value = value.invalidLink
  shareMessage.value = ''
  shareFallback.value = ''
}
async function syncSelection() {
  invalidLink.value = false
  shareMessage.value = ''
  shareFallback.value = ''
  save()
  await router.replace({ query: portalQuery(route.query, selection()) })
}
function choose(point: PortalPoint, locate = false) {
  if (point.kind === 'entrance') from.value = point.id
  else to.value = point.id
  void syncSelection()
  if (locate) portalMap.value?.locate(point)
}
function clearTrip() { to.value = ''; from.value = ''; void syncSelection() }
function clearEntrance() { from.value = ''; void syncSelection() }
function clearFilters() { query.value = ''; showEntrances.value = true; showDestinations.value = true }
async function copyLink() {
  const url = new URL(router.resolve({ path: route.path, query: portalQuery({}, selection()) }).href, window.location.origin).href
  try { await navigator.clipboard.writeText(url); shareMessage.value = 'Trip link copied.'; shareFallback.value = '' }
  catch { shareMessage.value = 'Copy this trip link:'; shareFallback.value = url }
}
function viewCode() {
  answer.value?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  answerHeading.value?.focus({ preventScroll: true })
}
watch(() => route.query, () => { if (mounted) readRoute() })
watch(() => destination.value?.code.src, (src, _, onCleanup) => {
  codeState.value = 'loading'
  if (!src || !import.meta.client) return
  // SVG image failures are not reliably bubbled. Check the same cached image before displaying crops.
  const probe = new Image()
  probe.onload = () => { codeState.value = 'ready' }
  probe.onerror = () => { codeState.value = 'error' }
  probe.src = src
  onCleanup(() => { probe.onload = null; probe.onerror = null })
})
onMounted(async () => {
  mounted = true
  readRoute(true)
  await nextTick()
  if (!mounted) return
  if (answer.value && 'IntersectionObserver' in window) {
    intersection = new IntersectionObserver(entries => { answerInView.value = !!entries[0]?.isIntersecting }, { threshold: 0.15 })
    intersection.observe(answer.value)
  }
})
onBeforeUnmount(() => { mounted = false; intersection?.disconnect() })
</script>

<template>
  <section class="portal-finder" aria-label="Rune portal trip planner">
    <div class="portal-intro"><p>Pick where you want to arrive. Shoot the <strong>three runes in order</strong> at any entrance.</p><span>{{ data.entrances.length }} entrances <i aria-hidden="true">/</i> {{ data.destinations.length }} destinations</span></div>
    <p v-if="invalidLink" class="portal-notice" role="status">This link contains an unknown portal. Choose a destination below to see a valid code.</p>
    <p v-if="storageError" class="portal-notice" role="status">Browser storage is unavailable. Keep this page open or copy your trip link.</p>

    <div class="portal-workspace">
      <aside ref="answer" class="portal-answer" aria-label="Your portal trip">
        <div class="portal-answer-title"><span class="portal-eyebrow">Your destination</span><button v-if="to || from" type="button" class="portal-text-button" @click="clearTrip">Clear trip</button></div>
        <template v-if="destination">
          <h2 ref="answerHeading" tabindex="-1"><span class="portal-badge">{{ destination.label }}</span> Grid {{ destination.grid }}</h2>
          <p class="portal-nearby">Near {{ destination.nearbyArea }}</p>
          <div class="portal-code" :data-destination="destination.id">
            <h3>Shoot left to right</h3>
            <ol class="portal-runes" aria-label="Rune shooting order">
              <li v-for="(id, index) in destination.glyphIds" :key="`${destination.id}-${index}`">
                <span class="portal-order"><b>{{ index + 1 }}</b><span v-if="index < 2" aria-hidden="true">→</span></span>
                <ReferenceCrop v-if="codeState === 'ready'" :src="destination.code.src" :crop="{ x: destination.code.width * index / 3, y: 0, width: destination.code.width / 3, height: destination.code.height, sourceWidth: destination.code.width, sourceHeight: destination.code.height }" :alt="`Rune ${index + 1}: ${glyphLabel(id)}`" />
                <span v-else class="portal-rune-unavailable">{{ codeState === 'loading' ? 'Loading…' : glyphLabel(id) }}</span>
              </li>
            </ol>
            <p v-if="codeState === 'error'" role="status">Rune images could not load. <a :href="destination.code.source" target="_blank" rel="noopener noreferrer">Open the illustrated code ↗</a> before shooting.</p>
            <p class="portal-code-note">This code works from any rune entrance.</p>
          </div>
          <p class="portal-fare">Then interact with the doorway.<br /><strong>{{ data.entryCost.toLocaleString() }} Essence</strong> <span>· check the in-game prompt</span></p>
          <button type="button" class="portal-share" @click="copyLink">Copy trip link <span aria-hidden="true">↗</span></button>
          <p v-if="shareMessage" class="portal-share-status" role="status">{{ shareMessage }}</p>
          <input v-if="shareFallback" class="portal-link-field" aria-label="Trip link" :value="shareFallback" readonly @focus="($event.target as HTMLInputElement).select()" />
          <details class="portal-reference" :key="destination.id"><summary>Arrival photo &amp; original code</summary><PortalPhoto :photo="destination.photo" :alt="`Arrival at destination ${destination.label}, grid ${destination.grid}`" /><PortalPhoto :photo="destination.code" :alt="`Original ordered code for destination ${destination.label}, grid ${destination.grid}`" /></details>
        </template>
        <template v-else>
          <h2 ref="answerHeading" class="portal-empty-title" tabindex="-1">Where do you want to go?</h2>
          <p class="portal-nearby">Choose a round numbered marker or a destination from the list.</p>
          <div class="portal-empty-runes" aria-hidden="true"><span>1</span><span>2</span><span>3</span></div>
          <p class="portal-empty-note">Your three-rune code will appear here.</p>
        </template>
        <div class="portal-entrance-selection">
          <div class="portal-answer-title"><span class="portal-eyebrow">Your entrance <small>Optional</small></span><button v-if="entrance" type="button" class="portal-text-button" aria-label="Clear entrance" @click="clearEntrance">Clear</button></div>
          <template v-if="entrance"><h3><span class="portal-badge portal-badge-entrance">{{ entrance.label }}</span> Grid {{ entrance.grid }}</h3><p class="portal-nearby">Near {{ entrance.nearbyArea }}</p><details :key="entrance.id" class="portal-reference"><summary>See this doorway</summary><PortalPhoto v-for="photo in entrance.photos" :key="photo.id" :photo="photo" :alt="`Rune entrance ${entrance.label}, grid ${entrance.grid}`" /></details></template>
          <p v-else class="portal-empty-note">Square letter markers show where you can enter. Pick one to see its doorway.</p>
        </div>
      </aside>

      <div class="portal-map-column">
        <label class="portal-search"><span>Find a portal</span><input v-model="query" type="search" placeholder="Grid, area or marker… e.g. F2" autocomplete="off" /></label>
        <div class="portal-filters" role="group" aria-label="Show portal locations">
          <button type="button" :aria-pressed="showEntrances" class="portal-filter entrance-filter" @click="showEntrances = !showEntrances"><span class="portal-badge portal-badge-entrance" aria-hidden="true">A</span> Entrances <b>{{ data.entrances.length }}</b><span class="portal-check" aria-hidden="true">{{ showEntrances ? '✓' : '+' }}</span></button>
          <button type="button" :aria-pressed="showDestinations" class="portal-filter" @click="showDestinations = !showDestinations"><span class="portal-badge" aria-hidden="true">1</span> Destinations <b>{{ data.destinations.length }}</b><span class="portal-check" aria-hidden="true">{{ showDestinations ? '✓' : '+' }}</span></button>
        </div>
        <Mw3PortalMap ref="portalMap" :visible-ids="visibleIds" :destination-id="to" :entrance-id="from" @choose="choose" />
      </div>
    </div>

    <div class="portal-list-heading"><h2>Find it in the list</h2><span role="status">{{ entrances.length }} entrances · {{ destinations.length }} destinations</span><button v-if="query || !showEntrances || !showDestinations" type="button" class="portal-text-button" @click="clearFilters">Reset filters</button></div>
    <p v-if="!visibleIds.length" class="portal-no-results">No portals match these filters. Try a grid such as F2, a nearby area, or reset the filters.</p>
    <div class="portal-lists">
      <section v-if="showDestinations" aria-label="Destinations"><h3><span class="portal-badge" aria-hidden="true">1</span> Where to arrive <span>{{ destinations.length }}</span></h3><ul><li v-for="point in destinations" :key="point.id"><button type="button" :aria-pressed="to === point.id" :aria-label="`Destination ${point.label}, ${point.grid}, near ${point.nearbyArea}`" @click="choose(point, true)"><span class="portal-badge">{{ point.label }}</span><span><strong>Grid {{ point.grid }}</strong><small>Near {{ point.nearbyArea }}</small></span><span class="portal-list-action">{{ to === point.id ? 'Selected' : 'See code' }} <span aria-hidden="true">→</span></span></button></li></ul><p v-if="!destinations.length">No matching destinations.</p></section>
      <section v-if="showEntrances" aria-label="Entrances"><h3><span class="portal-badge portal-badge-entrance" aria-hidden="true">A</span> Where to enter <span>{{ entrances.length }}</span></h3><ul><li v-for="point in entrances" :key="point.id"><button type="button" :aria-pressed="from === point.id" :aria-label="`Entrance ${point.label}, ${point.grid}, near ${point.nearbyArea}`" @click="choose(point, true)"><span class="portal-badge portal-badge-entrance">{{ point.label }}</span><span><strong>Grid {{ point.grid }}</strong><small>Near {{ point.nearbyArea }}</small></span><span class="portal-list-action">{{ from === point.id ? 'Selected' : 'Doorway' }} <span aria-hidden="true">→</span></span></button></li></ul><p v-if="!entrances.length">No matching entrances.</p></section>
    </div>
    <details class="portal-sources"><summary>How travel works &amp; map sources</summary><p>Find a lit rune doorway, shoot the destination’s three symbols in the displayed order, then interact and pay the prompt. A destination is an arrival point; it may not have a doorway for a return trip.</p><p>Positions, doorway photos and rune plates: <a :href="data.source" target="_blank" rel="noopener noreferrer">WZHUB Urzikstan map ↗</a>. All 17 published entrances and 24 destinations checked {{ data.reviewed }}. Nearby area names help orient you; zoom in and use the photos to identify the spot. Call of Duty imagery © Activision; individual screenshot creators are not identified by the source.</p><p>Method reference: <a href="https://www.reddit.com/r/CODZombies/comments/17uvwuc/mwz_rune_portals_guide/" target="_blank" rel="noopener noreferrer">Espioth’s portal research ↗</a>. Interactive map uses <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>.</p><NuxtLink to="/guides/mw3-urzikstan#details-rune-portals">Read the rune-doorway guide →</NuxtLink></details>
    <p class="portal-sr-only" role="status">{{ destination ? `Destination ${destination.label}, grid ${destination.grid}. Shoot ${destination.glyphIds.map(glyphLabel).join(', then ')}.` : 'No destination selected.' }} {{ entrance ? `Entrance ${entrance.label}, grid ${entrance.grid}.` : '' }}</p>
    <button v-if="destination && !answerInView" type="button" class="portal-mobile-jump" @click="viewCode">View code for {{ destination.grid }} · #{{ destination.label }} <span aria-hidden="true">↑</span></button>
  </section>
</template>

<style scoped>
.portal-finder { --portal-purple:#be9bdd; --portal-teal:#7cc6b3; font-size:.875rem; }
.portal-finder button,.portal-finder input,.portal-finder summary { font:inherit; }
.portal-finder button { cursor:pointer; }
.portal-finder :is(button,input,summary,a):focus-visible { outline:2px solid var(--gold-bright); outline-offset:3px; }
.portal-intro { display:flex; gap:1rem; align-items:center; justify-content:space-between; margin-bottom:1.5rem; }
.portal-intro p { margin:0; color:var(--muted); max-width:38rem; line-height:1.7; }
.portal-intro strong { color:var(--text); font-weight:600; }
.portal-intro>span { flex-shrink:0; color:var(--muted); font-size:.7rem; }
.portal-intro i { font-style:normal; margin:0 .5rem; color:var(--faint); }
.portal-workspace { display:grid; grid-template-columns:minmax(0,1fr) 320px; gap:1.35rem; align-items:start; }
.portal-map-column { grid-column:1; grid-row:1; min-width:0; }
.portal-answer { grid-column:2; grid-row:1; min-width:0; background:var(--surface-2); border:1px solid var(--line-strong); border-radius:12px; padding:1.2rem; scroll-margin-top:6rem; }
.portal-answer-title { display:flex; justify-content:space-between; gap:.3rem; align-items:center; min-height:36px; }
.portal-eyebrow { font-size:.65rem; letter-spacing:.12em; text-transform:uppercase; font-weight:700; color:var(--muted); }
.portal-eyebrow small { display:inline-block; margin-left:.3rem; letter-spacing:0; text-transform:none; font-weight:400; font-size:.65rem; }
.portal-answer h2,.portal-answer h3 { margin:.5rem 0 0; display:flex; align-items:center; gap:.6rem; font-weight:600; letter-spacing:0; }
.portal-answer h2 { font-size:1.3rem; }
.portal-answer h3 { font-size:1rem; }
.portal-answer .portal-empty-title { font-size:1.15rem; line-height:1.4; }
.portal-nearby { color:var(--muted); font-size:.8rem; margin:.55rem 0 1rem; line-height:1.6; }
.portal-badge { display:inline-grid; place-items:center; flex:0 0 auto; width:26px; height:26px; border:1px solid #c8a9e7; border-radius:50%; background:#322343; color:#f4e8ff; font-size:.68rem; font-weight:700; line-height:1; }
.portal-badge-entrance { border-color:#86c4b3; border-radius:5px; background:#173b34; color:#d8f4ec; }
.portal-code { margin-top:1.1rem; }
.portal-code h3 { font-size:.78rem; margin:0 0 .75rem; }
.portal-runes { list-style:none; padding:0; margin:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
.portal-runes li { min-width:0; }
.portal-order { display:flex; align-items:center; justify-content:space-between; font-size:.75rem; color:var(--muted); padding:0 .15rem .45rem; }
.portal-order b { font-size:.75rem; color:var(--text); }
.portal-order>span { transform:translateX(50%); color:var(--portal-purple); }
.portal-runes :deep(svg) { border-radius:7px; background:#211b2d; border:1px solid #655475; }
.portal-rune-unavailable { display:grid; place-items:center; aspect-ratio:5/6; background:var(--surface-3); font-size:.65rem; text-align:center; padding:.3rem; border-radius:6px; }
.portal-code-note { margin:.65rem 0 0; font-size:.68rem; color:var(--muted); line-height:1.6; }
.portal-fare { font-size:.78rem; color:var(--muted); line-height:1.9; margin:1rem 0; }
.portal-fare strong { color:var(--text); }
.portal-fare span { font-size:.66rem; }
.portal-share { display:flex; width:100%; min-height:44px; align-items:center; justify-content:space-between; background:var(--gold-dim); color:var(--gold-bright); border:1px solid var(--gold-border); border-radius:7px; padding:.6rem .8rem; font-size:.8rem !important; }
.portal-share-status { font-size:.75rem; color:var(--muted); }
.portal-link-field { width:100%; padding:.6rem; color:var(--text); background:var(--surface); border:1px solid var(--line-strong); border-radius:6px; min-width:0; }
.portal-reference { margin-top:.65rem; border-top:1px solid var(--line); font-size:.75rem; }
.portal-reference summary { min-height:44px; align-content:center; cursor:pointer; color:var(--muted); }
.portal-empty-runes { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.5rem; }
.portal-empty-runes span { display:grid; place-items:center; height:75px; border:1px dashed var(--line-strong); border-radius:7px; color:var(--faint); font-size:1.3rem; }
.portal-empty-note { font-size:.75rem; color:var(--muted); line-height:1.7; margin:.7rem 0 0; }
.portal-entrance-selection { border-top:1px solid var(--line-strong); margin-top:1.1rem; padding-top:.75rem; }
.portal-entrance-selection .portal-nearby { margin-bottom:.5rem; }
.portal-text-button { min-height:44px; background:transparent; border:0; color:var(--muted); padding:.4rem .2rem; font-size:.7rem !important; text-decoration:underline; text-underline-offset:3px; }
.portal-search { display:flex; flex-direction:column; gap:.5rem; font-size:.7rem; color:var(--muted); }
.portal-search>span { font-weight:600; }
.portal-search input { min-width:0; min-height:44px; padding:.7rem .85rem; background:var(--surface-2); border:1px solid var(--line-strong); border-radius:8px; color:var(--text); font-size:.85rem; }
.portal-filters { display:flex; flex-wrap:wrap; gap:.5rem; margin:.85rem 0; }
.portal-filter { display:flex; gap:.45rem; align-items:center; min-height:44px; border:1px solid var(--line-strong); border-radius:8px; padding:.45rem .6rem; color:var(--muted); background:var(--surface); font-size:.73rem !important; }
.portal-filter[aria-pressed="true"] { border-color:var(--portal-purple); color:var(--text); background:var(--surface-2); }
.portal-filter.entrance-filter[aria-pressed="true"] { border-color:var(--portal-teal); }
.portal-filter[aria-pressed="false"] .portal-badge { opacity:.45; }
.portal-filter b { font-size:.65rem; color:var(--muted); font-weight:400; }
.portal-filter .portal-badge { width:21px; height:21px; font-size:.6rem; }
.portal-check { width:12px; font-size:.85rem; }
.portal-list-heading { display:flex; gap:1rem; align-items:center; flex-wrap:wrap; margin:1.75rem 0 1rem; }
.portal-list-heading h2 { font-size:1rem; margin:0; font-weight:600; letter-spacing:0; }
.portal-list-heading>span { color:var(--muted); font-size:.7rem; }
.portal-list-heading>button { margin-left:auto; }
.portal-lists { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1.35rem; }
.portal-lists section { min-width:0; }
.portal-lists h3 { display:flex; gap:.6rem; align-items:center; margin:0 0 .75rem; font-size:.8rem; font-weight:600; }
.portal-lists h3>span:last-child { margin-left:auto; color:var(--muted); font-weight:400; }
.portal-lists ul { list-style:none; margin:0; padding:0; max-height:340px; overflow-y:auto; overscroll-behavior:contain; border:1px solid var(--line-strong); border-radius:9px; }
.portal-lists li+li { border-top:1px solid var(--line); }
.portal-lists li button { display:flex; align-items:center; gap:.75rem; width:100%; min-height:66px; text-align:left; padding:.65rem .8rem; color:var(--text); background:var(--surface); border:0; }
.portal-lists li button:hover { background:var(--surface-2); }
.portal-lists li button[aria-pressed="true"] { background:var(--gold-dim); box-shadow:inset 3px 0 var(--gold-bright); }
.portal-lists li strong { font-size:.78rem; font-weight:600; }
.portal-lists li small { display:block; font-size:.68rem; line-height:1.5; margin-top:.2rem; color:var(--muted); }
.portal-list-action { margin-left:auto; white-space:nowrap; font-size:.66rem; color:var(--muted); }
.portal-no-results,.portal-lists section>p { color:var(--muted); font-size:.8rem; line-height:1.6; }
.portal-notice { padding:.75rem 1rem; border-left:2px solid var(--gold); color:var(--text); background:var(--gold-dim); font-size:.8rem; }
.portal-sources { margin-top:1.5rem; border-top:1px solid var(--line); padding-top:.75rem; color:var(--muted); font-size:.72rem; line-height:1.8; }
.portal-sources summary { min-height:44px; align-content:center; cursor:pointer; }
.portal-sources a,.portal-code a { color:var(--gold-bright); }
.portal-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.portal-mobile-jump { display:none; }
@media (max-width:1000px) { .portal-intro { flex-direction:column; align-items:flex-start; gap:.6rem; } .portal-workspace { grid-template-columns:minmax(0,1fr) 290px; gap:1rem; } .portal-answer { padding:1rem; } }
@media (max-width:760px) {
  .portal-workspace { display:flex; flex-direction:column; gap:1.4rem; }
  .portal-answer,.portal-map-column { width:100%; box-sizing:border-box; }
  .portal-answer { padding:1rem; }
  .portal-code { max-width:390px; }
  .portal-empty-runes span { height:48px; }
  .portal-lists { grid-template-columns:1fr; }
  .portal-list-heading { gap:.5rem 1rem; }
  .portal-mobile-jump { display:flex; align-items:center; justify-content:space-between; position:fixed; bottom:max(14px,env(safe-area-inset-bottom)); left:1.2rem; right:1.2rem; z-index:900; min-height:48px; border:1px solid #dbbaf4; border-radius:9px; background:#352145; color:#f5e9ff; padding:.75rem 1rem; box-shadow:0 3px 18px #0006; font-size:.8rem !important; }
  .portal-finder { padding-bottom:2.5rem; }
}
@media (max-width:380px) { .portal-list-action { font-size:.6rem; } .portal-filter { gap:.35rem; padding:.4rem .5rem; } .portal-filter b { display:none; } }
</style>
