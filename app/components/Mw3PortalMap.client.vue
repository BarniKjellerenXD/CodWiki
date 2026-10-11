<script setup lang="ts">
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import data from '~/data/mw3RunePortals.json'
import type { PortalPoint } from '~/types/mw3Portals'
import { separatePortalMarkers } from '~/utils/mw3RunePortals.mjs'

const props = defineProps<{ visibleIds: string[]; destinationId: string; entranceId: string }>()
const emit = defineEmits<{ choose: [point: PortalPoint] }>()
const canvas = ref<HTMLElement | null>(null)
const ready = ref(false)
const imageError = ref(false)
const mapError = ref(false)
const imageLoading = ref(true)
const showGrid = ref(true)
const atMinZoom = ref(false)
const atMaxZoom = ref(false)
const points = [...data.entrances, ...data.destinations]
const markers = new Map<string, L.Marker>()
let map: L.Map | undefined
let overlay: L.ImageOverlay | undefined
let grid: L.LayerGroup | undefined
let leaders: L.LayerGroup | undefined
let observer: ResizeObserver | undefined
let disposed = false
const bounds = L.latLngBounds([[0, 0], [data.map.height, data.map.width]])
const latLng = (point: PortalPoint) => L.latLng((1 - point.y) * data.map.height, point.x * data.map.width)

function syncZoom() {
  if (!map) return
  atMinZoom.value = map.getZoom() <= map.getMinZoom()
  atMaxZoom.value = map.getZoom() >= map.getMaxZoom()
}
function fit() {
  if (!map) return
  map.stop()
  map.fitBounds(bounds, { padding: [12, 12], animate: false })
  map.setMinZoom(map.getBoundsZoom(bounds) - 0.5)
  syncZoom()
}
function zoom(delta: number) { map?.setZoom(map.getZoom() + delta * 0.5, { animate: false }) }
function locate(point: PortalPoint) {
  if (!map) return
  map.stop()
  map.setView(latLng(point), Math.max(map.getZoom(), map.getBoundsZoom(bounds) + 1.5), { animate: false })
}
defineExpose({ locate })

function styleMarker(point: PortalPoint, marker: L.Marker) {
  const element = marker.getElement()
  const selected = point.id === props.destinationId || point.id === props.entranceId
  element?.classList.toggle('is-selected', selected)
  element?.setAttribute('aria-pressed', String(selected))
  element?.setAttribute('role', 'button')
  element?.setAttribute('aria-label', `${point.kind === 'entrance' ? 'Entrance' : 'Destination'} ${point.label}, ${point.grid}, near ${point.nearbyArea}`)
  marker.setZIndexOffset(selected ? 1000 : 0)
}
function refresh() {
  if (!map) return
  const visible = new Set(props.visibleIds)
  leaders?.clearLayers()
  const projected = points.filter(point => visible.has(point.id)).map(point => ({ id: point.id, ...map!.latLngToLayerPoint(latLng(point)) }))
  const separated = new Map(separatePortalMarkers(projected).map((point: { id: string; x: number; y: number }) => [point.id, point]))
  for (const point of points) {
    const marker = markers.get(point.id)!
    if (visible.has(point.id)) {
      const position = separated.get(point.id)!
      const shown = map.layerPointToLatLng(L.point(position.x, position.y))
      marker.setLatLng(shown)
      if (leaders && map.latLngToLayerPoint(latLng(point)).distanceTo(L.point(position.x, position.y)) > 2) {
        const color = point.kind === 'entrance' ? '#a6e9d5' : '#d8b8f8'
        L.polyline([latLng(point), shown], { color, weight: 1.5, opacity: 0.85, interactive: false }).addTo(leaders)
        L.circleMarker(latLng(point), { radius: 2.5, color, fillOpacity: 1, weight: 1, interactive: false }).addTo(leaders)
      }
      if (!map.hasLayer(marker)) marker.addTo(map)
      styleMarker(point, marker)
    } else if (map.hasLayer(marker)) marker.remove()
  }
}
function renderGrid() {
  grid?.remove()
  if (!map || !showGrid.value) return
  grid = L.layerGroup().addTo(map)
  const { width, height } = data.map
  for (let i = 1; i < 10; i++) {
    L.polyline([[0, width * i / 10], [height, width * i / 10]], { color: '#ffffff', weight: 1, opacity: 0.13, interactive: false }).addTo(grid)
    L.polyline([[height * i / 10, 0], [height * i / 10, width]], { color: '#ffffff', weight: 1, opacity: 0.13, interactive: false }).addTo(grid)
  }
  for (let i = 0; i < 10; i++) {
    for (const [text, position] of [[data.grid.columns[i], [height * 0.975, width * (i + 0.5) / 10]], [data.grid.rows[i], [height * (1 - (i + 0.5) / 10), width * 0.025]]] as [string, [number, number]][]) {
      L.marker(position, { interactive: false, keyboard: false, icon: L.divIcon({ className: 'portal-grid-label', html: text, iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(grid)
    }
  }
}
function loadImage() {
  if (!map) return
  overlay?.off().remove()
  imageError.value = false
  imageLoading.value = true
  overlay = L.imageOverlay(data.map.image, bounds, { alt: 'Urzikstan overhead map', interactive: false })
  overlay.on('load', () => { imageLoading.value = false })
  overlay.on('error', () => { imageError.value = true; imageLoading.value = false })
  overlay.addTo(map)
}
onMounted(async () => {
  // Nuxt reveals a synchronous client-only component's DOM on the next render.
  await nextTick()
  try {
    if (!canvas.value || disposed) return
    map = L.map(canvas.value, { crs: L.CRS.Simple, minZoom: -8, maxZoom: 1, zoomSnap: 0.25, zoomDelta: 0.5, zoomControl: false, attributionControl: false, scrollWheelZoom: false, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, inertia: false, maxBoundsViscosity: 0.8 })
    map.setMaxBounds(bounds.pad(0.2))
    for (const point of points) {
      const label = document.createElement('span')
      label.textContent = point.label
      label.className = 'portal-pin-label'
      const marker = L.marker(latLng(point), {
        title: `${point.kind === 'entrance' ? 'Entrance' : 'Destination'} ${point.label} · ${point.grid}`,
        icon: L.divIcon({ className: `portal-pin portal-pin-${point.kind}`, html: label, iconSize: [32, 32], iconAnchor: [16, 16] }),
        keyboard: true,
      })
      const tooltip = document.createElement('span')
      tooltip.textContent = `${point.kind === 'entrance' ? 'Entrance' : 'Destination'} ${point.label} · ${point.grid} · Near ${point.nearbyArea}`
      marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -20] })
      marker.on('click', () => emit('choose', point))
      marker.on('add', () => {
        const element = marker.getElement()
        styleMarker(point, marker)
        element?.addEventListener('keydown', event => {
          if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); emit('choose', point) }
        })
      })
      markers.set(point.id, marker)
    }
    fit()
    leaders = L.layerGroup().addTo(map)
    loadImage()
    renderGrid()
    refresh()
    map.on('zoomend', () => { syncZoom(); refresh() })
    ready.value = true
    observer = new ResizeObserver(() => { if (!disposed) { map?.invalidateSize({ pan: false }); if (map) map.setMinZoom(map.getBoundsZoom(bounds) - 0.5); syncZoom() } })
    observer.observe(canvas.value)
  } catch { mapError.value = true; imageLoading.value = false }
})
watch(() => [props.visibleIds, props.destinationId, props.entranceId], refresh)
watch(showGrid, renderGrid)
onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  overlay?.off()
  map?.stop()
  map?.off()
  map?.remove()
  map = undefined
})
</script>

<template>
  <div class="portal-map">
    <div class="portal-map-controls" role="group" aria-label="Portal map controls">
      <button type="button" aria-label="Zoom in" :disabled="!ready || atMaxZoom" @click="zoom(1)">+</button>
      <button type="button" aria-label="Zoom out" :disabled="!ready || atMinZoom" @click="zoom(-1)">−</button>
      <button type="button" :disabled="!ready" @click="fit">Fit map</button>
      <button type="button" :aria-pressed="showGrid" @click="showGrid = !showGrid">Grid</button>
      <span>{{ visibleIds.length }} locations</span>
    </div>
    <div class="portal-map-frame">
      <div ref="canvas" class="portal-map-canvas" role="region" aria-label="Urzikstan rune portal map" aria-describedby="portal-map-help" :inert="imageError || mapError" :aria-hidden="imageError || mapError ? true : undefined" />
      <div v-if="imageError || mapError" class="portal-map-fallback" role="status"><strong>{{ mapError ? 'Map viewer unavailable' : 'Map image could not load' }}</strong><p>Choose an entrance or destination from the list below. The rune codes still work.</p><button v-if="!mapError" type="button" @click="loadImage">Retry map image</button></div>
      <div v-else-if="imageLoading" class="portal-map-loading" role="status">Loading Urzikstan…</div>
    </div>
    <p id="portal-map-help" class="portal-map-help">Drag to pan · Pinch or use + / − to zoom · Arrow keys to pan<br />Close pins spread apart. Their small dots mark the exact spots.</p>
  </div>
</template>

<style scoped>
.portal-map { min-width:0; }
.portal-map-controls { display:flex; gap:.35rem; align-items:center; flex-wrap:wrap; padding:0 0 .65rem; }
.portal-map-controls button,.portal-map-fallback button { min-width:44px; min-height:44px; padding:.45rem .75rem; border:1px solid var(--line-strong); border-radius:7px; background:var(--surface-2); color:var(--text); font:inherit; font-size:.78rem; cursor:pointer; }
.portal-map-controls button[aria-pressed="true"] { border-color:var(--gold-border); background:var(--gold-dim); }
.portal-map-controls button:disabled { opacity:.4; cursor:default; }
.portal-map-controls span { margin-left:auto; color:var(--muted); font-size:.72rem; }
.portal-map-frame { position:relative; border:1px solid var(--line-strong); border-radius:10px; overflow:hidden; isolation:isolate; background:#141a20; }
.portal-map-canvas { height:570px; width:100%; background:#141a20; }
.portal-map-fallback,.portal-map-loading { position:absolute; inset:0; z-index:800; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:2rem; background:var(--surface); color:var(--text); }
.portal-map-loading { pointer-events:none; background:#141a20cc; color:#fff; }
.portal-map-help { color:var(--muted); font-size:.7rem; margin:.6rem 0 0; }
.portal-map :deep(.leaflet-image-layer) { max-width:none !important; max-height:none !important; margin:0 !important; border-radius:0 !important; }
.portal-map :deep(.portal-pin) { background:none; border:0; display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 2px 3px #000); }
.portal-map :deep(.portal-pin-label) { display:grid; place-items:center; width:30px; height:30px; border:2px solid #cdb4ed; border-radius:50%; background:#322343; color:#fff; font:bold 12px/1 system-ui; box-sizing:border-box; position:relative; z-index:1; }
.portal-map :deep(.portal-pin-entrance .portal-pin-label) { border-radius:6px; border-color:#9ed9c9; background:#163c39; }
.portal-map :deep(.portal-pin.is-selected .portal-pin-label) { border:3px solid #fff; box-shadow:0 0 0 3px #b580e5; background:#643c86; }
.portal-map :deep(.portal-pin-entrance.is-selected .portal-pin-label) { box-shadow:0 0 0 3px #64c8b0; background:#246358; }
.portal-map :deep(.portal-pin:focus-visible) { outline:3px solid #fff; outline-offset:4px; border-radius:5px; }
.portal-map :deep(.portal-grid-label) { color:#fff; background:#13161cd9; border-radius:3px; text-align:center; font:600 11px/18px system-ui; pointer-events:none; }
.portal-map :deep(.leaflet-tooltip) { background:#161c23; color:#fff; border-color:#5a6472; font:12px/1.5 system-ui; }
@media (max-width:760px) { .portal-map-canvas { height:440px; } }
@media (max-width:380px) { .portal-map-controls span { width:100%; margin:0; } .portal-map-canvas { height:380px; } }
</style>
