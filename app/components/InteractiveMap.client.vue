<template>
  <section ref="rootRef" class="atlas" :class="{ 'atlas-expanded': expanded }" :aria-label="`${data.name} map`">
    <header class="atlas-heading">
      <div><span class="companion-label">Explore the map</span><h2>{{ data.name }}</h2></div>
      <button v-if="canReturn" type="button" class="companion-button" @click="emit('back')">← Back to step</button>
    </header>

    <div class="atlas-fields">
      <label class="atlas-field atlas-search"><span>Find a location</span><input v-model="query" type="search" placeholder="Search rooms, items and landmarks…" autocomplete="off" /></label>
      <label class="atlas-field atlas-layer-select"><span>Map layer</span><select v-model="layerId" @change="changeLayer"><option v-for="layer in data.layers" :key="layer.id" :value="layer.id">{{ layer.label }}{{ layerCount(layer.id) ? ` · ${layerCount(layer.id)} selected` : '' }}</option></select></label>
    </div>

    <div class="atlas-filters" role="group" aria-label="Location categories">
      <button type="button" :aria-pressed="category === 'quest-areas'" @click="category = 'quest-areas'">Quest &amp; areas <span>{{ questAreaCount }}</span></button>
      <button type="button" :aria-pressed="category === 'all'" @click="category = 'all'">All locations <span>{{ data.locations.length }}</span></button>
      <button v-for="item in categories" :key="item.id" type="button" :aria-pressed="category === item.id" @click="category = item.id"><span class="atlas-category-symbol" aria-hidden="true">{{ categorySymbol(item.id) }}</span>{{ categoryLabel(item.id) }} <span>{{ item.count }}</span></button>
    </div>
    <div v-if="category === 'perk' && peeksCount" class="atlas-perk-options">
      <div class="atlas-perk-switch" role="group" aria-label="Perk locations"><button type="button" :aria-pressed="perkFilter === 'all'" @click="perkFilter = 'all'">All perks <span>{{ perkCount }}</span></button><button type="button" :aria-pressed="perkFilter === 'mister-peeks'" @click="perkFilter = 'mister-peeks'">Mister Peeks <span>{{ peeksCount }}</span></button></div>
      <p>Cursed mode: Mister Peeks locations are possible spawns.</p>
    </div>

    <p v-if="unknownTarget" class="atlas-notice" role="status">That location is no longer in this map. Search the location list to find it.</p>
    <div class="atlas-workspace">
      <div class="atlas-map-column">
        <div class="atlas-map-tools" role="group" aria-label="Map controls">
          <div class="atlas-zoom-controls"><button type="button" aria-label="Zoom in" :disabled="!ready || atMaxZoom" @click="zoom(1)">+</button><button type="button" aria-label="Zoom out" :disabled="!ready || atMinZoom" @click="zoom(-1)">−</button></div>
          <button type="button" :disabled="!ready" @click="fitOverview">Fit map</button>
          <button v-if="selectedLocations.length" type="button" :disabled="!ready" @click="fitSelection">Fit selected</button>
          <button type="button" :aria-pressed="expanded" @click="toggleExpand">{{ expanded ? '↙ Reduce' : '↗ Expand' }}</button>
          <label class="atlas-wheel"><input v-model="wheelZoom" type="checkbox" /> Scroll to zoom</label>
        </div>

        <div class="atlas-map-frame">
          <div ref="canvasRef" class="atlas-canvas" role="region" :inert="imageError || mapError" :aria-hidden="imageError || mapError ? true : undefined" :aria-label="`${data.name}, ${activeLayer?.label || 'overview'}. Use arrow keys to pan and plus or minus to zoom.`" :aria-describedby="`${data.id}-map-help`" />
          <div v-if="imageError || mapError" class="atlas-image-error" role="status"><strong>{{ mapError ? 'The map viewer could not open.' : 'The map image could not load.' }}</strong><span>You can still search locations and read their descriptions below.</span><button v-if="!mapError" type="button" class="companion-button" @click="renderLayer">Try image again</button></div>
          <div v-else-if="imageLoading" class="atlas-image-loading" role="status">Loading map artwork…</div>
          <div v-if="!imageError && !mapError" class="atlas-map-caption"><span>{{ activeLayer?.label }}</span><span>{{ visibleLocations.length }} {{ visibleLocations.length === 1 ? 'location' : 'locations' }}</span></div>
        </div>

        <div :id="`${data.id}-map-help`" class="atlas-map-help"><span>Drag to pan · Pinch or use + / − to zoom</span><span><i class="atlas-legend-point" aria-hidden="true" /> Pin <i class="atlas-legend-area" aria-hidden="true" /> Approximate area</span></div>
        <p v-if="activeLayer?.note" class="atlas-layer-note">{{ activeLayer.note }}</p>
      </div>

      <aside ref="panelRef" class="atlas-panel" aria-label="Map locations">
        <section v-if="selectedLocations.length" class="atlas-selection" aria-label="Selected locations">
          <div class="atlas-selection-head"><span class="companion-label">{{ selectionKind }}</span><button type="button" class="atlas-text-button" @click="emit('select', '')">Clear</button></div>
          <h3 ref="selectionHeadingRef" tabindex="-1" aria-live="polite">{{ selectedTitle }}</h3>
          <p v-if="selectedTarget?.description">{{ selectedTarget.description }}</p>
          <p v-if="selectedTarget?.kind === 'candidates'" class="atlas-selection-note">Check these possible spawn locations. An item may appear at only one.</p>
          <p v-else-if="selectedTarget?.kind === 'sequence' && selectedLocations.length > 1" class="atlas-selection-note">Numbers follow the guide order; they do not show a walking route.</p>

          <div v-if="selectedLayers.length > 1" class="atlas-selected-layers" role="group" aria-label="Layers containing selected locations"><button v-for="layer in selectedLayers" :key="layer.id" type="button" :aria-pressed="layerId === layer.id" @click="selectLayer(layer.id)">{{ layer.label }} <span>{{ layerCount(layer.id) }}</span></button></div>

          <ol class="atlas-selected-list">
            <li v-for="(location, index) in selectedLocations" :key="location.id" :class="{ 'atlas-location-focused': focusId === location.id }">
              <button type="button" class="atlas-selected-location" :aria-pressed="focusId === location.id" :aria-label="`Locate ${location.label} on ${layerLabel(location.layerId)}`" @click="focusLocation(location)"><span class="atlas-location-number" aria-hidden="true">{{ selectedLocations.length > 1 ? index + 1 : categorySymbol(location.category) }}</span><span>{{ location.label }}<small>{{ layerLabel(location.layerId) }}{{ location.floor ? ` · ${location.floor}` : '' }}{{ location.state ? ` · ${location.state}` : '' }}</small></span><span class="atlas-locate-symbol" aria-hidden="true">⌖</span></button>
              <div class="atlas-location-description"><span v-if="location.precision === 'area'" class="atlas-precision">Approximate area</span><p>{{ location.description }}</p><a v-if="sourceUrl(location.source)" :href="sourceUrl(location.source)" target="_blank" rel="noopener noreferrer">Location reference ↗</a></div>
            </li>
          </ol>

          <div v-if="relatedTargets.length" class="atlas-related"><span class="companion-label">In the guide</span><button v-for="target in relatedTargets" :key="target.id" type="button" class="atlas-guide-link" @click="emit('guide', target.guideAnchor!)">{{ target.title }} <span aria-hidden="true">↗</span></button></div>
          <div class="atlas-selection-actions"><button v-if="canReturn" type="button" class="companion-button primary" @click="emit('back')">← Back to step</button><button type="button" class="companion-button" @click="copyLink">Copy map link</button></div>
          <p v-if="copyMessage" class="atlas-copy-message" role="status">{{ copyMessage }}</p>
        </section>

        <div class="atlas-results-heading"><h3>{{ query.trim() ? 'Search results' : 'Locations' }}</h3><span aria-live="polite">{{ filteredLocations.length }}</span></div>
        <p v-if="selectedLocations.length && (query.trim() || category !== 'all')" class="atlas-results-note">Selected locations stay on the map when filters change.</p>
        <p v-if="!filteredLocations.length" class="atlas-no-results">No locations match{{ category !== 'all' ? ' this category' : '' }}. <button v-if="query.trim() && category !== 'all'" type="button" class="atlas-text-button" @click="category = 'all'">Search all locations</button><button v-else type="button" class="atlas-text-button" @click="clearFilters">Clear filters</button></p>
        <ul v-else class="atlas-location-list"><li v-for="location in filteredLocations" :key="location.id"><button type="button" :aria-pressed="selectedIds.has(location.id)" @click="chooseLocation(location)"><span class="atlas-list-symbol" :class="{ 'atlas-list-area': location.precision === 'area' }" aria-hidden="true">{{ categorySymbol(location.category) }}</span><span>{{ location.label }}<small>{{ layerLabel(location.layerId) }} · {{ categoryLabel(location.category) }}</small></span><span v-if="selectedIds.has(location.id)" class="atlas-list-check" aria-hidden="true">✓</span></button></li></ul>
      </aside>
    </div>

    <footer class="atlas-footer"><details><summary>Map sources &amp; credits</summary><ul><li v-for="source in data.sources" :key="source.url + source.name"><a :href="sourceUrl(source.url)" target="_blank" rel="noopener noreferrer">{{ source.name }} ↗</a><span v-if="source.note">{{ source.note }}</span></li></ul><p>Interactive viewer by CodWiki, using <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>.</p></details></footer>
  </section>
</template>

<script setup lang="ts">
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapDataset, MapLayer, MapLocation } from '~/types/map'

const props = withDefaults(defineProps<{ data: MapDataset; targetId?: string; active?: boolean; canReturn?: boolean }>(), { targetId: '', active: true, canReturn: false })
const emit = defineEmits<{ select: [targetId: string]; back: []; guide: [anchor: string] }>()
const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const selectionHeadingRef = ref<HTMLElement | null>(null)
const layerId = ref(props.data.defaultLayer)
const query = ref('')
const category = ref('quest-areas')
const perkFilter = ref<'all' | 'mister-peeks'>('all')
const expanded = ref(false)
const wheelZoom = ref(true)
const focusId = ref('')
const ready = ref(false)
const imageError = ref(false)
const imageLoading = ref(true)
const mapError = ref(false)
const atMinZoom = ref(false)
const atMaxZoom = ref(false)
const copyMessage = ref('')
const activeLayer = computed(() => props.data.layers.find(layer => layer.id === layerId.value) || props.data.layers[0])
const locationIndex = computed(() => new Map(props.data.locations.map(location => [location.id, location])))
const selectedTarget = computed(() => props.data.targets.find(target => target.id === props.targetId))
const selectedLocations = computed(() => {
  const ids = selectedTarget.value?.locationIds || (locationIndex.value.has(props.targetId) ? [props.targetId] : [])
  return [...new Set(ids)].map(id => locationIndex.value.get(id)).filter((location): location is MapLocation => !!location)
})
const selectedIds = computed(() => new Set(selectedLocations.value.map(location => location.id)))
const selectedTitle = computed(() => selectedTarget.value?.title || selectedLocations.value[0]?.label || '')
const selectedLayers = computed(() => props.data.layers.filter(layer => layerCount(layer.id) > 0))
const unknownTarget = computed(() => !!props.targetId && !selectedTarget.value && !locationIndex.value.has(props.targetId))
const selectionKind = computed(() => selectedTarget.value?.kind === 'candidates' ? 'Possible spawns' : selectedTarget.value?.kind === 'sequence' ? 'Quest stops' : selectedLocations.value.length > 1 ? 'Selected locations' : 'Selected location')
const categories = computed(() => {
  const counts = new Map<string, number>()
  props.data.locations.forEach(location => counts.set(location.category, (counts.get(location.category) || 0) + 1))
  return Array.from(counts, ([id, count]) => ({ id, count })).sort((a, b) => categoryLabel(a.id).localeCompare(categoryLabel(b.id)))
})
const questAreaCount = computed(() => props.data.locations.filter(location => location.category === 'quest' || location.category === 'area').length)
const perkCount = computed(() => props.data.locations.filter(location => location.category === 'perk').length)
const peeksCount = computed(() => props.data.locations.filter(location => location.category === 'perk' && location.perkType === 'mister-peeks').length)
const filteredLocations = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return props.data.locations.filter(location => (category.value === 'all' || location.category === category.value || (category.value === 'quest-areas' && ['quest', 'area'].includes(location.category))) && (category.value !== 'perk' || perkFilter.value === 'all' || location.perkType === 'mister-peeks') && (!search || [location.label, location.description, location.category, location.floor, location.state, layerLabel(location.layerId)].filter(Boolean).join(' ').toLocaleLowerCase().includes(search)))
})
const visibleLocations = computed(() => {
  const matches = new Set(filteredLocations.value.map(location => location.id))
  return props.data.locations.filter(location => location.layerId === activeLayer.value?.id && (matches.has(location.id) || selectedIds.value.has(location.id)))
})
const relatedTargets = computed(() => {
  const seen = new Set<string>()
  const targets = selectedTarget.value ? [selectedTarget.value] : props.data.targets.filter(target => target.locationIds.some(id => selectedIds.value.has(id)))
  return targets.filter(target => {
    if (!target.guideAnchor || seen.has(target.guideAnchor)) return false
    seen.add(target.guideAnchor)
    return true
  })
})

let map: L.Map | undefined
let artwork: L.ImageOverlay | undefined
let markers: L.LayerGroup | undefined
let observer: ResizeObserver | undefined
let resizeFrame = 0
let copyTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false
let reducedMotion = false
let motionQuery: MediaQueryList | undefined
let layerRevision = 0
let previouslyZeroSize = false
let lastCanvasWidth = 0
let lastCanvasHeight = 0
let pendingSelectionFocus = false

function categoryLabel(value: string) {
  const labels: Record<string, string> = { area: 'Areas', quest: 'Quest', perk: 'Perks', upgrade: 'Upgrades', travel: 'Travel', ammo: 'Ammo', equipment: 'Equipment', weapon: 'Weapons', trap: 'Traps' }
  return labels[value] || value.replace(/[-_]/g, ' ').replace(/^./, letter => letter.toUpperCase())
}
function categorySymbol(value: string) {
  const symbols: Record<string, string> = { area: '◇', quest: '!', perk: '✚', upgrade: '↑', travel: '↗', ammo: '▪', equipment: '⚒', weapon: '×', trap: 'ϟ' }
  return symbols[value] || '•'
}
function layerLabel(id: string) { return props.data.layers.find(layer => layer.id === id)?.label || id }
function layerCount(id: string) { return selectedLocations.value.filter(location => location.layerId === id).length }
function sourceUrl(source?: string) {
  if (!source) return undefined
  const candidate = props.data.sources.find(item => item.name === source)?.url || source
  try { const url = new URL(candidate); return /^(https?:)$/.test(url.protocol) ? url.href : undefined } catch { return undefined }
}
function coordinate(location: MapLocation, layer: MapLayer): L.LatLng {
  return L.latLng((1 - location.y) * layer.height, location.x * layer.width)
}
function layerBounds(layer: MapLayer) { return L.latLngBounds([0, 0], [layer.height, layer.width]) }
function viewBounds(layer: MapLayer) {
  const crop = layer.focusBounds
  if (!crop || crop.flat().some(value => !Number.isFinite(value) || value < 0 || value > 1) || crop[0][0] >= crop[1][0] || crop[0][1] >= crop[1][1]) return layerBounds(layer)
  return L.latLngBounds([(1 - crop[1][1]) * layer.height, crop[0][0] * layer.width], [(1 - crop[0][1]) * layer.height, crop[1][0] * layer.width])
}
function animation() { return { animate: !reducedMotion && props.active, duration: 0.2 } }
function updateZoomButtons() {
  if (!map) return
  atMinZoom.value = map.getZoom() <= map.getMinZoom()
  atMaxZoom.value = map.getZoom() >= map.getMaxZoom()
}
function zoom(direction: number) {
  if (!map) return
  map.setZoom(map.getZoom() + direction * 0.5, animation())
}
function fitOverview() {
  if (!map || !activeLayer.value) return
  map.fitBounds(viewBounds(activeLayer.value), { padding: [20, 20], animate: false })
  updateZoomButtons()
}
function frameLocations(locations: MapLocation[]) {
  if (!map || !activeLayer.value || !locations.length) return
  const layer = activeLayer.value
  const bounds = L.latLngBounds(locations.map(location => coordinate(location, layer)))
  const overviewZoom = map.getBoundsZoom(viewBounds(layer), false, L.point(40, 40))
  // A room-wide view retains context instead of jumping to the maximum zoom.
  map.fitBounds(bounds, { padding: [60, 60], maxZoom: Math.min(2, overviewZoom + (locations.length === 1 ? 1.5 : 2)), ...animation() })
  updateZoomButtons()
}
function fitSelection() {
  const locations = selectedLocations.value.filter(location => location.layerId === layerId.value)
  if (locations.length) frameLocations(locations)
  else if (selectedLocations.value[0]) selectLayer(selectedLocations.value[0].layerId)
  else fitOverview()
}
function clearFilters() { query.value = ''; category.value = 'all'; perkFilter.value = 'all' }
function chooseLocation(location: MapLocation) {
  if (selectedTarget.value && selectedIds.value.has(location.id)) { focusLocation(location); return }
  if (props.targetId === location.id) { focusLocation(location); return }
  pendingSelectionFocus = !!panelRef.value?.querySelector('.atlas-location-list')?.contains(document.activeElement)
  emit('select', location.id)
}
function focusLocation(location: MapLocation) {
  focusId.value = location.id
  if (layerId.value !== location.layerId) {
    layerId.value = location.layerId
    renderLayer()
    savePreferences()
  }
  renderMarkers()
  frameLocations([location])
}
function changeLayer() {
  focusId.value = ''
  renderLayer()
  if (layerCount(layerId.value)) fitSelection()
  savePreferences()
}
function selectLayer(id: string) { layerId.value = id; changeLayer() }
function renderMarkers() {
  if (!map || !markers || !activeLayer.value) return
  const focusedMarkerId = (document.activeElement as HTMLElement | null)?.dataset?.mapLocation
  markers.clearLayers()
  const layer = activeLayer.value
  for (const location of visibleLocations.value) {
    const selected = selectedIds.value.has(location.id)
    const focused = focusId.value === location.id
    const index = selectedLocations.value.findIndex(item => item.id === location.id)
    const position = coordinate(location, layer)
    if (location.precision === 'area') {
      L.circle(position, { radius: Math.min(layer.width, layer.height) * 0.03, className: selected ? 'atlas-area atlas-area-selected' : 'atlas-area', weight: selected ? 2 : 1, dashArray: '5 5', fillOpacity: selected ? 0.18 : 0.07, interactive: false }).addTo(markers)
    }
    const symbol = document.createElement('span')
    symbol.className = `atlas-marker-symbol${selected ? ' atlas-marker-selected' : ''}${focused ? ' atlas-marker-focused' : ''}${location.precision === 'area' ? ' atlas-marker-area' : ''}`
    symbol.textContent = selected && selectedLocations.value.length > 1 ? String(index + 1) : categorySymbol(location.category)
    symbol.setAttribute('aria-hidden', 'true')
    const marker = L.marker(position, { icon: L.divIcon({ html: symbol, className: 'atlas-marker', iconSize: [44, 44], iconAnchor: [22, 22] }), title: `${location.label}${location.precision === 'area' ? ' (approximate area)' : ''}`, keyboard: true, riseOnHover: true, zIndexOffset: selected ? 500 + (focused ? 100 : 0) : 0 })
    const label = document.createElement('span')
    label.textContent = location.label
    marker.bindTooltip(label, { direction: 'top', offset: [0, -15], className: 'atlas-tooltip' })
    marker.on('click', () => chooseLocation(location))
    marker.addTo(markers)
    const element = marker.getElement()
    element?.setAttribute('data-map-location', location.id)
    element?.setAttribute('aria-label', `${location.label}, ${categoryLabel(location.category)}${location.precision === 'area' ? ', approximate area' : ''}`)
    element?.setAttribute('aria-pressed', String(selected))
    // Leaflet handles Enter for markers; Space is added for the button role.
    if (element) {
      const onSpace = (event: Event) => { if ((event as KeyboardEvent).key === ' ') { event.preventDefault(); chooseLocation(location) } }
      L.DomEvent.on(element, 'keydown', onSpace)
      marker.on('remove', () => L.DomEvent.off(element, 'keydown', onSpace))
      if (props.active && focusedMarkerId === location.id) element.focus({ preventScroll: true })
    }
  }
}
function removeArtwork() {
  const previous = artwork
  artwork = undefined
  // Leaflet attaches its own once('remove') listener to unregister zoom and
  // viewreset events from the map. Preserve that lifecycle listener.
  previous?.off('load error')
  previous?.remove()
}
function renderLayer() {
  if (!map || !activeLayer.value) return
  const revision = ++layerRevision
  const layer = activeLayer.value
  removeArtwork()
  imageError.value = false
  imageLoading.value = true
  map.setMinZoom(-8)
  map.setMaxBounds(viewBounds(layer).pad(0.35))
  artwork = L.imageOverlay(layer.image, layerBounds(layer), { alt: `${props.data.name} — ${layer.label}`, interactive: false })
  artwork.on('load', () => { if (!disposed && revision === layerRevision) { imageLoading.value = false; imageError.value = false } })
  artwork.on('error', () => { if (!disposed && revision === layerRevision) { imageLoading.value = false; imageError.value = true } })
  artwork.addTo(map)
  const minimum = map.getBoundsZoom(viewBounds(layer), false, L.point(40, 40))
  if (Number.isFinite(minimum)) map.setMinZoom(minimum - 0.5)
  renderMarkers()
  fitOverview()
}
function selectTarget() {
  focusId.value = ''
  copyMessage.value = ''
  const first = selectedLocations.value[0]
  if (first) {
    focusId.value = selectedLocations.value.length === 1 ? first.id : ''
    if (layerId.value !== first.layerId) { layerId.value = first.layerId; renderLayer() }
    renderMarkers()
    fitSelection()
  } else {
    renderMarkers()
    fitOverview()
  }
  // Reveal details after rendering. A list selection moves focus to its detail
  // heading; a map-pin selection keeps keyboard focus on the pin. Neither
  // action scrolls the surrounding page.
  const moveFocus = pendingSelectionFocus
  pendingSelectionFocus = false
  if (props.active && panelRef.value && selectedLocations.value.length) {
    const target = props.targetId
    nextTick(() => {
      if (disposed || !props.active || props.targetId !== target || !panelRef.value) return
      panelRef.value.scrollTop = 0
      if (moveFocus) selectionHeadingRef.value?.focus({ preventScroll: true })
    })
  }
  savePreferences()
}
function resizeMap() {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    if (!map || disposed || !canvasRef.value) return
    const box = canvasRef.value.getBoundingClientRect()
    if (!props.active || !box.width || !box.height) { previouslyZeroSize = true; return }
    const dimensionsChanged = box.width !== lastCanvasWidth || box.height !== lastCanvasHeight
    lastCanvasWidth = box.width
    lastCanvasHeight = box.height
    map.invalidateSize({ pan: false, animate: false })
    if (activeLayer.value) {
      const minimum = map.getBoundsZoom(viewBounds(activeLayer.value), false, L.point(40, 40))
      if (Number.isFinite(minimum)) map.setMinZoom(minimum - 0.5)
    }
    if (previouslyZeroSize || dimensionsChanged) {
      previouslyZeroSize = false
      selectedLocations.value.length ? fitSelection() : fitOverview()
    }
    updateZoomButtons()
  })
}
async function toggleExpand() { expanded.value = !expanded.value; await nextTick(); resizeMap() }
function preferenceKey() { return `codwiki-map-ui-v2:${props.data.id}` }
function savePreferences() {
  try { localStorage.setItem(preferenceKey(), JSON.stringify({ layer: layerId.value, category: category.value, perkFilter: perkFilter.value, wheelZoom: wheelZoom.value })) } catch { /* Map browsing remains usable without storage. */ }
}
function restorePreferences() {
  layerId.value = props.data.defaultLayer
  category.value = 'quest-areas'
  perkFilter.value = 'all'
  wheelZoom.value = true
  function readSaved(key: string) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null')
      return value && typeof value === 'object' && !Array.isArray(value) ? value : null
    } catch { return null }
  }
  try {
    const current = readSaved(preferenceKey())
    const saved = current || readSaved(`codwiki-map-ui-v1:${props.data.id}`)
    if (!saved) return
    if (props.data.layers.some(layer => layer.id === saved.layer)) layerId.value = saved.layer
    if (['all', 'quest-areas'].includes(saved.category) || categories.value.some(item => item.id === saved.category)) category.value = saved.category
    if (saved.perkFilter === 'mister-peeks' && peeksCount.value > 0) perkFilter.value = 'mister-peeks'
    // v1 automatically saved the old false default; it cannot distinguish an
    // opt-out from merely opening a map. Only v2 records explicit opt-outs.
    if (current && typeof current.wheelZoom === 'boolean') wheelZoom.value = current.wheelZoom
  } catch { /* Ignore malformed or unavailable preferences. */ }
}
async function copyLink() {
  const url = new URL(window.location.href)
  url.hash = `map:${encodeURIComponent(props.targetId)}`
  try {
    await navigator.clipboard.writeText(url.href)
    copyMessage.value = 'Map link copied.'
  } catch {
    copyMessage.value = 'Copy the address from your browser to share this location.'
  }
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copyMessage.value = '' }, 6000)
}
function preserveBrowserZoom(event: WheelEvent) {
  // Keep Ctrl/Command + wheel available to the browser and Electron app zoom.
  if (event.ctrlKey || event.metaKey) event.stopImmediatePropagation()
}
function motionChanged(event: MediaQueryListEvent) {
  reducedMotion = event.matches
  if (map) { map.options.inertia = !reducedMotion; if (reducedMotion) map.stop() }
}

watch(() => props.targetId, selectTarget)
watch([query, category, perkFilter], () => { renderMarkers(); savePreferences() })
watch(wheelZoom, enabled => { if (enabled) map?.scrollWheelZoom.enable(); else map?.scrollWheelZoom.disable(); savePreferences() })
watch(() => props.active, async active => { if (active) { await nextTick(); resizeMap() } else { previouslyZeroSize = true; map?.stop() } })
watch(() => props.data, () => { query.value = ''; restorePreferences(); renderLayer(); selectTarget() })
onMounted(() => {
  restorePreferences()
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionQuery.matches
  motionQuery.addEventListener('change', motionChanged)
  if (!canvasRef.value) return
  try {
    canvasRef.value.addEventListener('wheel', preserveBrowserZoom, { capture: true, passive: true })
    // Leaflet 1.9.4 leaves a zoom-transition timeout pending after remove().
    // Disable that transition from construction so route changes and HMR
    // cannot run it against a detached map pane. Public pan APIs remain usable.
    map = L.map(canvasRef.value, { crs: L.CRS.Simple, minZoom: -8, maxZoom: 3, zoomSnap: 0.25, zoomDelta: 0.5, zoomControl: false, attributionControl: false, scrollWheelZoom: wheelZoom.value, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, inertia: !reducedMotion, maxBoundsViscosity: 0.8, bounceAtZoomLimits: false })
    markers = L.layerGroup().addTo(map)
    map.on('zoomend', updateZoomButtons)
    renderLayer()
    selectTarget()
    ready.value = true
    observer = new ResizeObserver(resizeMap)
    observer.observe(canvasRef.value)
    resizeMap()
  } catch {
    mapError.value = true
    imageLoading.value = false
  }
})
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(resizeFrame)
  clearTimeout(copyTimer)
  observer?.disconnect()
  motionQuery?.removeEventListener('change', motionChanged)
  canvasRef.value?.removeEventListener('wheel', preserveBrowserZoom, true)
  map?.stop()
  removeArtwork()
  markers?.clearLayers()
  map?.off('zoomend', updateZoomButtons)
  map?.remove()
  map = undefined
})
</script>

<style scoped>
.atlas { min-width:0; padding:1.3rem 0 0; color:var(--text); }
.atlas-heading { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.1rem; }
.atlas-heading h2 { margin:.2rem 0 0; font-size:1.5rem; line-height:1.25; letter-spacing:-.025em; }
.atlas-fields { display:flex; gap:.8rem; }
.atlas-field { display:flex; flex-direction:column; min-width:0; gap:.4rem; font-size:.76rem; font-weight:650; }
.atlas-search { flex:1; }
.atlas-layer-select { flex:0 1 18rem; }
.atlas-field input,.atlas-field select { width:100%; min-height:46px; border:1px solid var(--line-strong); border-radius:var(--radius-sm); background:var(--surface-2); color:var(--text); padding:.7rem .85rem; font:inherit; font-size:.86rem; }
.atlas-field input::placeholder { color:var(--faint); font-weight:400; }
.atlas-filters { display:flex; gap:.4rem; flex-wrap:wrap; margin:.85rem 0 1rem; }
.atlas-filters button,.atlas-selected-layers button,.atlas-perk-switch button { display:inline-flex; align-items:center; gap:.4rem; min-height:38px; border:1px solid var(--line); border-radius:8px; background:var(--surface-2); color:var(--muted); padding:.4rem .65rem; font:inherit; font-size:.74rem; cursor:pointer; }
.atlas-filters button[aria-pressed=true],.atlas-selected-layers button[aria-pressed=true],.atlas-perk-switch button[aria-pressed=true] { color:var(--gold-bright); background:var(--gold-dim); border-color:var(--gold-border); }
.atlas-filters button>span:last-child,.atlas-selected-layers button>span,.atlas-perk-switch button>span { font-size:.67rem; opacity:.8; }
.atlas-perk-options { display:flex; align-items:center; gap:.6rem 1rem; flex-wrap:wrap; margin:-.25rem 0 1rem; }.atlas-perk-switch { display:flex; gap:.4rem; }.atlas-perk-options p { margin:0; color:var(--muted); font-size:.72rem; }.atlas-perk-switch button { min-height:40px; }
.atlas-category-symbol { color:var(--gold); font-size:.92rem; }
.atlas-workspace { display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:1rem; align-items:start; }
.atlas-map-column { min-width:0; }
.atlas-map-tools { display:flex; flex-wrap:wrap; align-items:center; gap:.35rem; margin-bottom:.55rem; }
.atlas-map-tools>button,.atlas-zoom-controls button { min-height:40px; border:1px solid var(--line-strong); border-radius:8px; background:var(--surface-2); color:var(--text); font:inherit; font-size:.74rem; padding:.4rem .65rem; cursor:pointer; }
.atlas-map-tools button:disabled { opacity:.4; cursor:default; }
.atlas-map-tools button[aria-pressed=true] { background:var(--gold-dim); border-color:var(--gold); }
.atlas-zoom-controls { display:flex; gap:.2rem; }
.atlas-zoom-controls button { width:40px; padding:.15rem; font-size:1.3rem; }
.atlas-wheel { display:flex; align-items:center; gap:.35rem; margin-left:auto; min-height:40px; font-size:.7rem; color:var(--muted); cursor:pointer; }
.atlas-wheel input { accent-color:var(--gold); width:16px; height:16px; }
.atlas-map-frame { position:relative; isolation:isolate; overflow:hidden; border:1px solid var(--line-strong); border-radius:var(--radius); background:#17191b; }
.atlas-canvas { width:100%; height:570px; height:clamp(430px,66dvh,750px); background:#17191b; background-image:linear-gradient(#ffffff04 1px,transparent 1px),linear-gradient(90deg,#ffffff04 1px,transparent 1px); background-size:32px 32px; }
.atlas-expanded .atlas-canvas { height:82dvh; min-height:570px; }
.atlas-canvas:focus-visible { outline:2px solid var(--gold); outline-offset:-3px; }
.atlas-map-caption { position:absolute; z-index:700; right:.65rem; bottom:.65rem; left:.65rem; display:flex; justify-content:space-between; gap:.5rem; pointer-events:none; color:#ede9df; font-size:.66rem; }
.atlas-map-caption span { padding:.35rem .6rem; border:1px solid #6c65504d; border-radius:6px; background:#17191bef; }
.atlas-image-error { position:absolute; inset:0; z-index:800; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:.8rem; background:var(--surface-2); text-align:center; padding:2rem; }
.atlas-image-error strong { font-size:1rem; }.atlas-image-error>span { max-width:32ch; font-size:.86rem; color:var(--muted); }
.atlas-image-loading { position:absolute; z-index:700; top:1rem; left:50%; transform:translateX(-50%); width:max-content; max-width:90%; padding:.6rem .8rem; background:var(--surface); border:1px solid var(--line); border-radius:8px; color:var(--muted); font-size:.8rem; }
.atlas-map-help { display:flex; justify-content:space-between; flex-wrap:wrap; gap:.5rem; margin:.65rem 0; color:var(--muted); font-size:.66rem; }
.atlas-map-help>span:last-child { display:flex; align-items:center; gap:.35rem; }
.atlas-legend-point { width:8px; height:8px; border-radius:50%; background:var(--gold); display:inline-block; }
.atlas-legend-area { display:inline-block; width:15px; height:15px; margin-left:.4rem; border:1px dashed var(--gold); border-radius:50%; background:var(--gold-dim); }
.atlas-layer-note,.atlas-notice { border-left:2px solid var(--gold-border); margin:.8rem 0 0; padding:.15rem 0 .15rem .75rem; font-size:.76rem; line-height:1.65; color:var(--muted); }
.atlas-notice { margin:0 0 1rem; }
.atlas-panel { min-width:0; max-height:850px; max-height:calc(66dvh + 120px); overflow:auto; border:1px solid var(--line); border-radius:var(--radius); background:var(--surface-2); scrollbar-width:thin; scrollbar-color:var(--line-strong) transparent; }
.atlas-expanded .atlas-panel { max-height:calc(82dvh + 45px); }
.atlas-selection { padding:1rem; border-bottom:1px solid var(--line); background:var(--surface); }
.atlas-selection-head { display:flex; justify-content:space-between; align-items:center; gap:.5rem; }
.atlas-selection-head .companion-label { font-size:.63rem; }
.atlas-selection h3 { margin:.5rem 0; font-size:1.12rem; line-height:1.35; letter-spacing:-.018em; }
.atlas-selection>p { margin:.5rem 0; font-size:.77rem; line-height:1.65; color:var(--muted); }
.atlas-selection .atlas-selection-note { color:var(--gold-bright); font-size:.71rem; }
.atlas-text-button { min-height:32px; border:0; padding:.1rem .15rem; background:none; color:var(--gold-bright); font:inherit; font-size:.73rem; cursor:pointer; text-decoration:underline; text-underline-offset:3px; }
.atlas-selected-layers { display:flex; gap:.35rem; flex-wrap:wrap; margin:.85rem 0; }
.atlas-selected-layers button { text-align:left; font-size:.69rem; }
.atlas-selected-list { list-style:none; padding:0; margin:.85rem 0 0; display:flex; flex-direction:column; gap:.55rem; }
.atlas-selected-list>li { min-width:0; border:1px solid var(--line); border-radius:9px; overflow:hidden; }
.atlas-selected-list>li.atlas-location-focused { border-color:var(--gold-border); background:var(--gold-dim); }
.atlas-selected-location { display:flex; gap:.55rem; align-items:center; width:100%; border:0; background:none; color:var(--text); padding:.65rem; font:inherit; font-size:.77rem; line-height:1.4; font-weight:650; text-align:left; cursor:pointer; }
.atlas-selected-location>span:nth-child(2) { flex:1; min-width:0; }
.atlas-location-number { display:grid; place-items:center; flex:none; width:23px; height:23px; border:1px solid var(--gold-border); border-radius:6px; color:var(--gold-bright); font-size:.68rem; }
.atlas-locate-symbol { color:var(--gold-bright); font-size:1.05rem; }
.atlas-selected-location small,.atlas-location-list small { display:block; color:var(--muted); font-size:.65rem; line-height:1.5; font-weight:400; margin-top:.18rem; }
.atlas-location-description { padding:0 .7rem .7rem; }.atlas-location-description p { font-size:.73rem; line-height:1.65; margin:.3rem 0 0; color:var(--muted); }
.atlas-precision { display:inline-block; font-size:.59rem; color:var(--gold-bright); border:1px dashed var(--gold-border); border-radius:4px; padding:.1rem .35rem; }
.atlas-location-description a { display:inline-block; color:var(--gold-bright); font-size:.69rem; padding-top:.45rem; text-decoration:underline; text-underline-offset:3px; }
.atlas-related { margin-top:1rem; }.atlas-related>.companion-label { font-size:.6rem; }
.atlas-guide-link { display:flex; gap:.4rem; justify-content:space-between; width:100%; min-height:38px; border:0; border-bottom:1px solid var(--line); background:none; color:var(--gold-bright); padding:.5rem 0; font:inherit; font-size:.73rem; text-align:left; cursor:pointer; }
.atlas-selection-actions { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:1rem; }.atlas-selection-actions .companion-button { font-size:.72rem; padding:.5rem .65rem; }
.atlas-copy-message { font-size:.72rem; color:var(--gold-bright); margin:.5rem 0 0; }
.atlas-results-heading { display:flex; align-items:center; justify-content:space-between; padding:.85rem 1rem .5rem; }.atlas-results-heading h3 { margin:0; font-size:.82rem; }.atlas-results-heading>span { color:var(--muted); font-size:.7rem; }
.atlas-results-note { margin:0; padding:0 1rem .6rem; color:var(--muted); font-size:.68rem; line-height:1.6; }
.atlas-no-results { margin:0; padding:.7rem 1rem 1rem; color:var(--muted); font-size:.8rem; }
.atlas-location-list { list-style:none; margin:0; padding:0 .45rem .5rem; }.atlas-location-list>li { margin:0; }
.atlas-location-list button { display:flex; width:100%; align-items:center; gap:.6rem; min-height:54px; background:none; border:1px solid transparent; border-radius:8px; color:var(--text); padding:.6rem .5rem; text-align:left; font:inherit; font-size:.75rem; line-height:1.35; cursor:pointer; }
.atlas-location-list button:hover { background:var(--surface-3); }.atlas-location-list button[aria-pressed=true] { border-color:var(--gold-border); background:var(--gold-dim); }
.atlas-location-list button>span:nth-child(2) { flex:1; min-width:0; }
.atlas-list-symbol { display:grid; place-items:center; flex:none; border:1px solid var(--line-strong); border-radius:6px; width:26px; height:26px; font-size:.8rem; color:var(--gold-bright); }
.atlas-list-symbol.atlas-list-area { border-style:dashed; border-radius:50%; }.atlas-list-check { color:var(--gold-bright); font-size:.8rem; }
.atlas-footer { margin-top:1rem; padding:.7rem 0 0; border-top:1px solid var(--line); color:var(--muted); font-size:.7rem; }.atlas-footer summary { cursor:pointer; min-height:32px; }.atlas-footer ul { list-style:none; padding:0; margin:.5rem 0; display:flex; flex-direction:column; gap:.6rem; }.atlas-footer li>span { display:block; margin-top:.15rem; font-size:.68rem; line-height:1.6; }.atlas-footer a { color:var(--gold-bright); text-decoration:underline; text-underline-offset:3px; }.atlas-footer p { font-size:.68rem; }
.atlas button:not(:disabled):hover { border-color:var(--gold-border); }.atlas :is(button,input,select,a,h3):focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
.atlas :deep(.atlas-marker) { background:none; border:0; display:grid; place-items:center; }
.atlas :deep(.atlas-marker-symbol) { display:grid; place-items:center; width:28px; height:28px; border:2px solid #edc984; border-radius:8px; background:#252019; color:#f8dda8; box-shadow:0 1px 5px #000b; font:800 15px/1 system-ui,sans-serif; }
.atlas :deep(.atlas-marker-area) { border-style:dashed; border-radius:50%; }
.atlas :deep(.atlas-marker-selected) { background:#edc984; color:#21170a; border-color:#fff3d8; width:32px; height:32px; }
.atlas :deep(.atlas-marker-focused) { outline:2px solid #edc984; outline-offset:3px; }
.atlas :deep(.atlas-marker:focus-visible) { outline:2px solid #fff3d8; outline-offset:2px; border-radius:8px; }
.atlas :deep(.atlas-area) { stroke:#e4b766; fill:#e4b766; }.atlas :deep(.atlas-area-selected) { stroke:#ffe0a8; fill:#e4b766; }
.atlas :deep(.atlas-tooltip) { border:1px solid #6c5c3c; border-radius:6px; background:#1c1e22; box-shadow:0 2px 6px #0005; color:#f5eddc; font:500 12px/1.5 system-ui,sans-serif; padding:.35rem .55rem; white-space:normal; max-width:230px; }.atlas :deep(.atlas-tooltip:before) { border-top-color:#6c5c3c; }
.atlas :deep(.leaflet-image-layer) { max-width:none !important; max-height:none !important; margin:0 !important; border-radius:0 !important; cursor:grab; }
@media (max-width:1050px) { .atlas-workspace { grid-template-columns:minmax(0,1fr) 270px; gap:.75rem; }.atlas-wheel { margin-left:0; }.atlas-map-help { font-size:.61rem; } }
@media (max-width:760px) { .atlas-workspace { display:flex; flex-direction:column; }.atlas-map-column,.atlas-panel { width:100%; }.atlas-panel,.atlas-expanded .atlas-panel { max-height:none; }.atlas-location-list { max-height:350px; overflow:auto; }.atlas-selection { padding:1rem; }.atlas-canvas { height:460px; height:60dvh; min-height:330px; }.atlas-expanded .atlas-canvas { height:80dvh; min-height:400px; }.atlas-fields { flex-wrap:wrap; }.atlas-search { flex-basis:100%; }.atlas-layer-select { flex-basis:100%; }.atlas-field>span { font-size:.73rem; }.atlas-heading h2 { font-size:1.25rem; }.atlas-heading>.companion-button { font-size:.75rem; padding:.5rem .65rem; }.atlas-map-tools { gap:.3rem; }.atlas-wheel { margin-left:auto; }.atlas-selected-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); }.atlas-filters { flex-wrap:nowrap; overflow-x:auto; padding:2px 2px 8px; margin-left:-2px; margin-right:-2px; scrollbar-width:thin; }.atlas-filters button { white-space:nowrap; min-height:42px; }.atlas-map-help { font-size:.64rem; }.atlas-layer-note { margin-bottom:.5rem; } }
@media (max-width:390px) { .atlas-wheel { margin-left:0; }.atlas-heading { gap:.5rem; }.atlas-heading h2 { font-size:1.05rem; }.atlas-selected-list { display:flex; } }
@media (prefers-reduced-motion:reduce) { .atlas :deep(*) { animation:none !important; transition:none !important; } }
</style>
