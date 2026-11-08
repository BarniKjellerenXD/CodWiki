<script setup lang="ts">
import { hajinLayer, hajinPins, hajinReports, hajinRoutes, mapSources, precisionOf, routeStopLabel } from '#shared/dmz-map.mjs'
import { siteLabel, squareLine } from '#shared/dmz-map-view.mjs'
import { keyOfReport } from '#shared/dmz-keys.mjs'
import { dmzIntel, intelConfidenceLabel, intelSourceSite } from '#shared/dmz-intel.mjs'
import { anySource, videoUrl } from '#shared/dmz-sightings.mjs'
import { GLYPHS, layerColor } from './glyphs'

// The selected place, reported site or route on the Hajin Tac-Map. A reported
// site says in words where it is and how sure that spot is; a key room can be
// marked held or used for the key tracker. `compact` is the phone sheet's peek.
interface Pin { id: string, layer: string, name: string, at: [number, number], square: string, threat?: string, parts?: [string, string][], parent?: string, desc?: string, same?: string, near?: string, reports?: string[], intel?: string[] }
interface Source { label: string, url?: string, type?: string }
interface VideoRef { id: string, at?: string, why: string }

const props = defineProps<{ id: string, compact?: boolean, view: 'map' | 'threat', copied?: string, activeStop?: number }>()
const emit = defineEmits<{ close: [], select: [id: string], zoom: [], area: [], copy: [], more: [], stop: [stop: any] }>()

const PLACES = ['poi', 'fortress', 'area', 'compound']
const pinIndex = new Map((hajinPins as Pin[]).map(pin => [pin.id, pin]))
const reportIndex = new Map((hajinReports as any[]).map(report => [report.id, report]))
const routeIndex = new Map((hajinRoutes as any[]).map(route => [route.id, route]))
const intelIndex = new Map(dmzIntel.map(entry => [entry.id, entry]))
const sources = mapSources as Record<string, Source>
const placeName = (id?: string) => (id && pinIndex.get(id)?.name) || ''
const threatClass = (level?: string) => level ? level.toLowerCase() : undefined
const { state: keys, setMark } = useDmzKeys()

const report = computed(() => reportIndex.get(props.id))
const route = computed(() => routeIndex.get(props.id))
const pin = computed(() => {
  const found = pinIndex.get(props.id)
  return found?.same ? pinIndex.get(found.same) : found
})
const kind = computed(() => report.value ? 'report' : route.value ? 'route' : pin.value ? 'pin' : '')
const layer = computed(() => hajinLayer(report.value?.type || pin.value?.layer || 'route')!)
const key = computed(() => report.value && keyOfReport(report.value.id))
const mark = computed(() => key.value ? keys.value.marks[key.value.id] : undefined)

// Other sites hung on the same marker, so a reader sees what else is there.
const alsoHere = computed(() => {
  const current = report.value
  if (!current) return []
  return (hajinReports as any[]).filter(other => other.id !== current.id && other.from === current.from && other.top === current.top).slice(0, 12)
})
// A place lists what it holds: its own parts, places and services inside it,
// and the reported sites hung on it, grouped by kind.
const INTEL_ORDER = ['keys', 'enemies', 'missions', 'exfil', 'map', 'crafting', 'gear', 'vehicles', 'tips']
const place = computed(() => {
  const current = pin.value
  if (!current || report.value) return null
  // A major location lists everything in it; another place or a service what hangs on it.
  const unique = (hajinReports as any[]).filter(item => item.anchor === current.id || item.from === current.id || (current.layer === 'poi' && item.top === current.id))
  const byType = new Map<string, any[]>()
  for (const item of unique) { if (!byType.has(item.type)) byType.set(item.type, []); byType.get(item.type)!.push(item) }
  return {
    parts: (current.parts || []).map(([name, level]) => ({ name, level, pin: [...pinIndex.values()].find(other => other.name === name && other.layer !== 'poi' && !other.same && (other.parent === current.id || other.id === current.id))?.id })),
    inside: (hajinPins as Pin[]).filter(other => other.parent === current.id && PLACES.includes(other.layer) && !other.same),
    services: (hajinPins as Pin[]).filter(other => other.near === current.id),
    reports: [...byType.entries()].map(([type, items]) => ({ type, label: hajinLayer(type)?.label || type, items })),
    count: unique.length,
    intel: (current.intel || []).map(id => intelIndex.get(id)!).filter(Boolean).sort((a, b) => INTEL_ORDER.indexOf(a.category) - INTEL_ORDER.indexOf(b.category)),
  }
})
const allIntel = ref(false)
const INTEL_PREVIEW = 6
watch(() => props.id, () => { allIntel.value = false })

const routeCard = computed(() => {
  const item = route.value
  if (!item) return null
  return {
    stops: item.stops.map((stop: any) => ({ ...stop, label: routeStopLabel(stop) as string })),
    from: item.stops[0].square, to: item.stops.at(-1).square,
    videos: (item.videos || []).map((video: VideoRef) => ({ ...video, label: anySource(video.id)?.label as string | undefined, href: videoUrl(video.id, video.at) as string | undefined })).filter((video: any) => video.href),
  }
})

function sourcesOf(item: { sources: string[], videos?: VideoRef[] }) {
  const seen = new Map<string, Source & { site: string }>()
  const watched = new Set((item.videos || []).map(video => video.id))
  for (const id of item.sources) {
    const source = sources[id]
    if (!source) continue
    // Videos are credited under Watch it done.
    if (watched.has(id) && source.url) continue
    const site = intelSourceSite(source)
    if (!seen.has(site)) seen.set(site, { ...source, site })
  }
  return [...seen.values()]
}
const headingRef = ref<HTMLElement>()
defineExpose({ focus: () => headingRef.value?.focus({ preventScroll: true }) })
</script>

<template>
  <section v-if="kind === 'report' && report" class="tc" :class="{ 'tc--compact': compact }" aria-label="Selected site" :style="{ '--tm-c': layerColor(report.type) }">
    <div class="tc-head">
      <span class="tc-glyph" :class="`is-${report.tier}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[report.type]" /></svg></span>
      <span class="dmz-label dmz-mono">{{ layer.one }}</span>
      <button type="button" class="tc-text" @click="emit('close')">Close</button>
    </div>
    <h3 ref="headingRef" tabindex="-1">{{ report.name }}</h3>
    <p class="tc-meta dmz-mono">
      <span class="tc-tier" :class="`is-${report.tier}`">{{ report.below ? `In ${report.below}` : report.moves ? 'Moves around' : precisionOf(report.precision).label }}</span>
      <span class="tc-conf" :class="`is-${report.confidence}`">{{ intelConfidenceLabel(report.confidence) }}</span>
      <span v-if="report.threat" class="tc-threat" :data-threat="threatClass(report.threat)">{{ report.threat }} threat</span>
    </p>
    <div class="tc-where">
      <p class="tc-label"><strong>{{ siteLabel(report) }}</strong></p>
      <p class="tc-square dmz-mono">{{ squareLine(report) }}</p>
      <p v-if="!compact" class="tc-hint">{{ report.below ? `Underground in ${report.below}, not on the Hajin surface. The marker shows the lift down.` : report.moves ? 'It roams or moves between matches, so look around the ground shown.' : precisionOf(report.precision).desc }}</p>
      <p v-if="compact" class="tc-clamp">{{ report.where }}</p>
    </div>
    <div v-if="key" class="tc-key">
      <span class="tc-key-name">Opens with <strong>{{ key.name }}</strong></span>
      <div class="tc-key-marks" role="group" :aria-label="`Key tracker: ${key.name}`">
        <button type="button" :aria-pressed="mark === 'held'" @click="setMark(key.id, 'held')"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS['key-room']" /></svg>Held</button>
        <button type="button" :aria-pressed="mark === 'used'" @click="setMark(key.id, 'used')"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS.held" /></svg>Used</button>
      </div>
      <NuxtLink v-if="!compact" class="tc-key-link" :to="`/dmz/stash#key-${key.id}`">Key tracker →</NuxtLink>
    </div>
    <div class="tc-actions">
      <button v-if="compact" type="button" class="tc-action is-main" @click="emit('more')">More</button>
      <button v-if="report.tier !== 'pinned'" type="button" class="tc-action" @click="emit('area')">Show the area</button>
      <button v-else type="button" class="tc-action" @click="emit('zoom')">Zoom to</button>
      <button type="button" class="tc-action" @click="emit('copy')">Copy link</button>
      <span v-if="copied" class="tc-copied" role="status">{{ copied }}</span>
    </div>
    <template v-if="!compact">
      <p v-if="report.anchor" class="tc-line">In <button type="button" class="tc-link" @click="emit('select', report.anchor)">{{ placeName(report.anchor) }}</button><template v-if="report.top !== report.anchor && placeName(report.top)">, <button type="button" class="tc-link" @click="emit('select', report.top)">{{ placeName(report.top) }}</button></template></p>
      <div class="tc-block">
        <h4 class="dmz-mono">What sources say</h4>
        <p>{{ report.where }}</p>
        <p v-if="report.note" class="tc-note">{{ report.note }}</p>
        <p v-if="report.season" class="tc-hint">{{ report.season }}</p>
      </div>
      <DmzVideoGuides v-if="report.videos?.length" :refs="report.videos" />
      <p v-if="sourcesOf(report).length" class="tc-src"><span class="dmz-mono">Sources</span> <template v-for="(source, index) in sourcesOf(report)" :key="source.site"><template v-if="index">, </template><a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" :title="source.label">{{ source.site }}<span class="sr-only"> (opens in a new tab)</span></a><span v-else>{{ source.site }}</span></template></p>
      <DmzIntelLink v-if="report.intel" :id="report.intel" class="tc-intel-link">Intel card: {{ intelIndex.get(report.intel)?.name }} →</DmzIntelLink>
      <div v-if="alsoHere.length" class="tc-block">
        <h4 class="dmz-mono">Also here · {{ alsoHere.length }}</h4>
        <ul class="tc-rows">
          <li v-for="other in alsoHere" :key="other.id" :style="{ '--tm-c': layerColor(other.type) }">
            <button type="button" @click="emit('select', other.id)">
              <span class="tc-row-glyph" :class="`is-${other.tier}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[other.type]" /></svg></span>
              <span>{{ other.name }}<small>{{ hajinLayer(other.type)?.one }} · {{ siteLabel(other) }}</small></span>
            </button>
          </li>
        </ul>
      </div>
    </template>
  </section>

  <section v-else-if="kind === 'pin' && pin" class="tc" :class="{ 'tc--compact': compact }" aria-label="Selected place" :data-threat="threatClass(pin.threat)" :style="{ '--tm-c': layerColor(pin.layer) }">
    <div class="tc-head">
      <span class="tc-glyph is-place" :data-threat="threatClass(pin.threat)"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[pin.layer]" /></svg></span>
      <span class="dmz-label dmz-mono">{{ layer.one }}</span>
      <button type="button" class="tc-text" @click="emit('close')">Close</button>
    </div>
    <h3 ref="headingRef" tabindex="-1">{{ PLACES.includes(pin.layer) ? pin.name : `${layer.one} near ${placeName(pin.near)}` }}</h3>
    <p class="tc-meta dmz-mono">
      <span>Square {{ pin.square }}</span>
      <span v-if="pin.threat" class="tc-threat" :data-threat="threatClass(pin.threat)">{{ pin.threat }} threat</span>
      <span v-if="place?.count" class="tc-count">{{ place.count }} reported {{ place.count === 1 ? 'site' : 'sites' }}</span>
    </p>
    <p v-if="pin.parent && pin.parent !== pin.id" class="tc-line">In <button type="button" class="tc-link" @click="emit('select', pin.parent)">{{ placeName(pin.parent) }}</button></p>
    <p v-if="pin.near" class="tc-line">Near <button type="button" class="tc-link" @click="emit('select', pin.near)">{{ placeName(pin.near) }}</button></p>
    <p v-if="!compact" class="tc-desc">{{ pin.desc || layer.desc }}</p>
    <div class="tc-actions">
      <button v-if="compact" type="button" class="tc-action is-main" @click="emit('more')">More</button>
      <button type="button" class="tc-action" @click="emit('zoom')">Zoom to</button>
      <button type="button" class="tc-action" @click="emit('copy')">Copy link</button>
      <span v-if="copied" class="tc-copied" role="status">{{ copied }}</span>
    </div>
    <template v-if="!compact && place">
      <div v-if="place.parts.length" class="tc-block">
        <h4 class="dmz-mono">Threat by area</h4>
        <ul class="tc-parts">
          <li v-for="item in place.parts" :key="item.name" :data-threat="threatClass(item.level)">
            <button v-if="item.pin && item.pin !== pin.id" type="button" class="tc-link" @click="emit('select', item.pin)">{{ item.name }}</button>
            <span v-else>{{ item.name }}</span>
            <span class="tc-threat dmz-mono" :data-threat="threatClass(item.level)">{{ item.level }}</span>
          </li>
        </ul>
      </div>
      <div v-for="group in place.reports" :key="group.type" class="tc-block" :style="{ '--tm-c': layerColor(group.type) }">
        <h4 class="dmz-mono">{{ group.label }} · {{ group.items.length }}</h4>
        <ul class="tc-rows">
          <li v-for="item in group.items" :key="item.id">
            <button type="button" @click="emit('select', item.id)">
              <span class="tc-row-glyph" :class="`is-${item.tier}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[item.type]" /></svg></span>
              <span>{{ item.name }}<small>{{ siteLabel(item) }} · {{ intelConfidenceLabel(item.confidence) }}</small></span>
            </button>
          </li>
        </ul>
      </div>
      <div v-if="place.inside.length || place.services.length" class="tc-block">
        <h4 class="dmz-mono">Marked on the official map here</h4>
        <div class="tc-nearby">
          <button v-for="other in [...place.inside, ...place.services]" :key="other.id" type="button" :style="{ '--tm-c': layerColor(other.layer) }" @click="emit('select', other.id)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[other.layer]" /></svg>{{ PLACES.includes(other.layer) ? other.name : hajinLayer(other.layer)!.one }}<span class="dmz-mono">{{ other.square }}</span>
          </button>
        </div>
      </div>
      <div v-if="place.intel.length" class="tc-block">
        <h4 class="dmz-mono">In the Intel database · {{ place.intel.length }}</h4>
        <ul class="tc-intel">
          <li v-for="entry in allIntel ? place.intel : place.intel.slice(0, INTEL_PREVIEW)" :key="entry.id"><DmzIntelLink :id="entry.id">{{ entry.name }}</DmzIntelLink><span class="dmz-mono">{{ entry.type }}</span></li>
        </ul>
        <button v-if="place.intel.length > INTEL_PREVIEW" type="button" class="tc-text" :aria-expanded="allIntel" @click="allIntel = !allIntel">{{ allIntel ? 'Show fewer' : `Show all ${place.intel.length}` }}</button>
      </div>
    </template>
  </section>

  <section v-else-if="kind === 'route' && route && routeCard" class="tc" :class="{ 'tc--compact': compact }" aria-label="Selected route" :style="{ '--tm-c': layerColor('route') }">
    <div class="tc-head">
      <span class="tc-glyph is-pinned"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS.route" /></svg></span>
      <span class="dmz-label dmz-mono">Route</span>
      <button type="button" class="tc-text" @click="emit('close')">Close</button>
    </div>
    <h3 ref="headingRef" tabindex="-1">{{ route.name }}</h3>
    <p class="tc-meta dmz-mono">
      <span>{{ routeCard.stops.length }} stops</span>
      <span>Square {{ routeCard.from }} to {{ routeCard.to }}</span>
      <span class="tc-conf" :class="`is-${route.confidence}`">{{ intelConfidenceLabel(route.confidence) }}</span>
    </p>
    <div class="tc-actions">
      <button v-if="compact" type="button" class="tc-action is-main" @click="emit('more')">Stops</button>
      <button type="button" class="tc-action" @click="emit('zoom')">Whole route</button>
      <button type="button" class="tc-action" @click="emit('copy')">Copy link</button>
      <span v-if="copied" class="tc-copied" role="status">{{ copied }}</span>
    </div>
    <template v-if="!compact">
      <p class="tc-desc">{{ route.summary }}</p>
      <p v-for="video in routeCard.videos" :key="video.href" class="tc-watch">
        <a :href="video.href" target="_blank" rel="noopener noreferrer">{{ video.label }}<span class="sr-only"> (opens in a new tab)</span></a>
        <span class="tc-hint">{{ video.why }}</span>
      </p>
      <div class="tc-block">
        <h4 class="dmz-mono">Stops · {{ routeCard.stops.length }}</h4>
        <p class="tc-hint">In the order the run takes them. Pick one to zoom the map to it.</p>
        <ol class="tc-stops">
          <li v-for="stop in routeCard.stops" :key="stop.n">
            <button type="button" :aria-pressed="activeStop === stop.n" @click="emit('stop', stop)">
              <span class="tc-stop-n dmz-mono" aria-hidden="true">{{ stop.n }}</span>
              <span>{{ stop.label }}<small>{{ stop.n === 1 ? 'Start · ' : stop.n === routeCard.stops.length ? 'End · ' : '' }}Square {{ stop.square }}</small></span>
            </button>
          </li>
        </ol>
      </div>
      <p class="tc-note">{{ route.traced }}</p>
      <p v-if="sourcesOf(route).length" class="tc-src"><span class="dmz-mono">Sources</span> <template v-for="(source, index) in sourcesOf(route)" :key="source.site"><template v-if="index">, </template><a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" :title="source.label">{{ source.site }}<span class="sr-only"> (opens in a new tab)</span></a><span v-else>{{ source.site }}</span></template></p>
    </template>
  </section>
</template>

<style scoped>
.tc { --tm-low: #a9b39a; --tm-medium: #d8c47c; --tm-high: #e8a04f; --tm-critical: #ef7a5a; --tm-extreme: #ff5468; display: grid; gap: 0.625rem; padding: 1rem 1.125rem 1.125rem; border-bottom: 1px solid var(--dz-line-strong); background: rgba(28, 33, 31, 0.92); color: var(--dz-ink); }
.tc p, .tc li { margin: 0; max-width: none; font-size: inherit; color: inherit; }
.tc svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.tc [data-threat='low'] { --tm-t: var(--tm-low); } .tc [data-threat='medium'] { --tm-t: var(--tm-medium); } .tc [data-threat='high'] { --tm-t: var(--tm-high); } .tc [data-threat='critical'] { --tm-t: var(--tm-critical); } .tc [data-threat='extreme'] { --tm-t: var(--tm-extreme); }
.tc-head { display: flex; align-items: center; gap: 0.5rem; }
.tc-head .dmz-label { margin: 0; flex: 1; }
.tc-glyph { display: grid; place-items: center; flex: none; width: 2rem; height: 2rem; border: 2px solid var(--tm-c); border-radius: 7px; color: var(--tm-c); background: rgba(10, 12, 11, 0.6); }
.tc-glyph.is-approx, .tc-glyph.is-area { border-style: dashed; }
.tc-glyph.is-place { border-radius: 50%; color: var(--tm-t, var(--tm-c)); border-color: var(--tm-t, var(--tm-c)); }
.tc-glyph svg { width: 1.05rem; height: 1.05rem; }
.tc h3 { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; outline: none; }
.tc h3:focus-visible { text-decoration: underline; text-decoration-color: var(--dz-teal); text-underline-offset: 0.2em; }
.tc-meta { display: flex; flex-wrap: wrap; gap: 0.375rem; font-size: 0.72rem !important; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted) !important; }
.tc-meta > span { padding: 0.15rem 0.5rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; }
.tc-tier { color: var(--dz-ink); border-color: var(--tm-c) !important; }
.tc-tier.is-approx, .tc-tier.is-area { border-style: dashed !important; }
.tc-conf.is-official { color: var(--dz-accent); border-color: currentColor !important; }
.tc-conf.is-confirmed { color: var(--dz-green); border-color: currentColor !important; }
.tc-conf.is-reported { color: var(--dz-teal); border-color: currentColor !important; }
.tc-threat { color: var(--tm-t) !important; border-color: currentColor !important; }
.tc-count { color: var(--dz-accent); border-color: currentColor !important; }
.tc-where { display: grid; gap: 0.25rem; padding: 0.625rem 0.75rem; border-left: 3px solid var(--tm-c); background: rgba(10, 12, 11, 0.4); }
.tc-label { font-size: 1.05rem !important; color: #f7f5ea !important; }
.tc-square { font-size: 0.75rem !important; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal) !important; }
.tc-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.9rem !important; color: #dcd9cb !important; }
.tc-line, .tc-desc { font-size: 0.975rem !important; color: #dcd9cb !important; }
.tc-hint { font-size: 0.875rem !important; color: var(--dz-muted) !important; }
.tc-note { color: #e7dcc2 !important; font-size: 0.875rem !important; }
.tc-link { padding: 0; border: 0; background: none; color: var(--dz-ink); font: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; text-align: left; }
.tc-text { min-height: 2.25rem; padding: 0 0.125rem; border: 0; background: none; color: var(--dz-ink); font: inherit; font-size: 0.875rem; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
.tc-key { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.tc-key-name { flex: 1 1 100%; font-size: 0.95rem; }
.tc-key-marks { display: inline-flex; gap: 0.375rem; }
.tc-key-marks button { display: inline-flex; align-items: center; gap: 0.35rem; min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: none; color: var(--dz-ink); font: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.tc-key-marks button svg { width: 1rem; height: 1rem; }
.tc-key-marks button[aria-pressed='true'] { border-color: var(--dz-green); background: color-mix(in srgb, var(--dz-green) 18%, transparent); color: #f7f5ea; }
.tc-key-link { color: var(--dz-ink); font-size: 0.9rem; text-underline-offset: 0.2em; }
.tc-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.tc-action { min-height: 2.75rem; padding: 0 1rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-ink); font: inherit; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
.tc-action:hover { background: rgba(233, 230, 214, 0.1); }
.tc-action.is-main { background: var(--dz-ink); color: var(--dz-bg); border-color: var(--dz-ink); }
.tc-copied { font-size: 0.85rem; color: var(--dz-green); }
.tc-block { display: grid; gap: 0.5rem; padding-top: 0.625rem; border-top: 1px solid var(--dz-line); }
.tc-block h4 { margin: 0; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tc-rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.125rem; }
.tc-rows button { display: flex; align-items: center; gap: 0.625rem; width: 100%; min-height: 3rem; padding: 0.375rem 0.5rem; border: 1px solid transparent; border-radius: 10px; background: rgba(10, 12, 11, 0.3); color: var(--dz-ink); font: inherit; font-size: 0.95rem; line-height: 1.25; text-align: left; cursor: pointer; }
.tc-rows button:hover { background: rgba(233, 230, 214, 0.08); }
.tc-rows small { display: block; margin-top: 0.1rem; font-size: 0.8rem; color: var(--dz-muted); }
.tc-row-glyph { display: grid; place-items: center; flex: none; width: 1.75rem; height: 1.75rem; border: 1.5px solid var(--tm-c); border-radius: 6px; color: var(--tm-c); }
.tc-row-glyph.is-approx, .tc-row-glyph.is-area { border-style: dashed; }
.tc-row-glyph svg { width: 0.95rem; height: 0.95rem; }
.tc-parts { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.125rem; }
.tc-parts li { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; min-height: 2.25rem; padding: 0.3rem 0.5rem; background: rgba(10, 12, 11, 0.35); border-left: 2px solid var(--tm-t, var(--dz-line-strong)); font-size: 0.925rem !important; }
.tc-parts .tc-threat { flex: none; font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; }
.tc-nearby { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.tc-nearby button { display: inline-flex; align-items: center; gap: 0.35rem; min-height: 2.5rem; padding: 0 0.6rem 0 0.45rem; border: 1px solid var(--dz-line); border-radius: 8px; background: rgba(10, 12, 11, 0.4); color: var(--dz-ink); font: inherit; font-size: 0.85rem; cursor: pointer; }
.tc-nearby svg { width: 0.95rem; height: 0.95rem; color: var(--tm-c); }
.tc-nearby .dmz-mono { font-size: 0.7rem; color: var(--dz-muted); }
.tc-src { font-size: 0.825rem !important; color: var(--dz-muted) !important; overflow-wrap: anywhere; }
.tc-src .dmz-mono { font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; }
.tc-src a, .tc-intel a, .tc-intel-link { color: var(--dz-ink); text-underline-offset: 0.2em; }
.tc-intel-link { justify-self: start; font-size: 0.875rem; }
.tc-intel { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
.tc-intel li { display: flex; justify-content: space-between; align-items: baseline; gap: 0.75rem; font-size: 0.925rem !important; }
.tc-intel .dmz-mono { flex: none; font-size: 0.65rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.tc-watch { display: grid; gap: 0.1rem; }
.tc-watch a { justify-self: start; display: inline-flex; align-items: center; min-height: 2.75rem; color: var(--dz-ink); font-weight: 600; text-decoration: underline; text-underline-offset: 0.2em; }
.tc-stops { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.125rem; }
.tc-stops button { display: flex; align-items: center; gap: 0.625rem; width: 100%; min-height: 2.75rem; padding: 0.35rem 0.5rem; border: 1px solid transparent; border-radius: 10px; background: none; color: var(--dz-ink); font: inherit; font-size: 0.95rem; text-align: left; cursor: pointer; }
.tc-stops button:hover { background: rgba(233, 230, 214, 0.07); }
.tc-stops button[aria-pressed='true'] { border-color: var(--dz-line-strong); background: rgba(233, 230, 214, 0.12); }
.tc-stops small { display: block; margin-top: 0.1rem; font-size: 0.8rem; color: var(--dz-muted); }
.tc-stop-n { display: grid; place-items: center; flex: none; width: 1.6rem; height: 1.6rem; border-radius: 50%; background: #ff7ac6; color: #1a0b14; font-size: 0.75rem; font-weight: 800; }
.tc-stops li:is(:first-child, :last-child) .tc-stop-n { background: transparent; color: #ff7ac6; box-shadow: inset 0 0 0 2px #ff7ac6; }
.tc--compact { gap: 0.5rem; padding: 0.75rem 1rem 0.875rem; }
.tc--compact h3 { font-size: 1.15rem; }
.tc--compact .tc-meta { font-size: 0.65rem !important; }
.tc--compact .tc-where { padding: 0.5rem 0.625rem; }
.tc--compact .tc-key-name { display: none; }
.tc--compact .tc-action, .tc--compact .tc-key-marks button { min-height: 2.75rem; padding: 0 0.75rem; }
.tc :is(button, a):focus-visible { outline: 2px solid var(--dz-ink); outline-offset: 2px; }
</style>
