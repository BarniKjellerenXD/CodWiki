<script setup lang="ts">
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { hajinMap, hajinLayers, hajinLayer, hajinPins, hajinReports, hajinThreatParts, hajinThreatSeeds, mapSources, threatLevels, toArt, squareCentre, HAJIN_MAP_CHECKED } from '#shared/dmz-map.mjs'
import { zoneField, traceRegions } from '#shared/dmz-zones.mjs'
import { dmzIntel, intelConfidenceLabel, intelSourceSite } from '#shared/dmz-intel.mjs'

// The Hajin Tac-Map. Official markers sit where Activision's map puts them.
// Reported sites have no exact position, so they ride on the place they
// belong to as a gold count badge, and the card lists them. The selection
// lives in ?pin= so a place, service or report can be linked. ?view=threat
// swaps the markers for approximate threat zones.
interface Pin { id: string, layer: string, name: string, at: [number, number], square: string, threat?: string, parts?: [string, string][], parent?: string, desc?: string, same?: string, near?: string, reports?: string[], intel?: string[] }
interface Report { id: string, type: string, name: string, anchor: string | null, where: string, squares?: string[], threat?: string, note?: string, confidence: string, sources: string[], intel?: string }
interface Source { label: string, url?: string }
type Item = { kind: 'pin', id: string, pin: Pin } | { kind: 'report', id: string, report: Report }
interface ThreatPart { id: string, name: string, level: string, poi: string, pin: string | null, at: [number, number] | null, hotter?: boolean }
interface Seed { at: [number, number], reach: number, part: string | null, poi: string | null, level: string | null }
interface Zone { poi: string, level: string, rings: [number, number][][], parts: ThreatPart[] }

const pins = hajinPins as Pin[]
const reports = hajinReports as Report[]
const sources = mapSources as Record<string, Source>
const pinIndex = new Map(pins.map(pin => [pin.id, pin]))
const reportIndex = new Map(reports.map(report => [report.id, report]))
const intelIndex = new Map(dmzIntel.map(entry => [entry.id, entry]))
const PLACES = ['poi', 'fortress', 'area', 'compound']
const PREFS = 'codwiki-dmz-tacmap-v1'
const W = hajinMap.width, H = hajinMap.height
const threatParts = hajinThreatParts as ThreatPart[]
const threatSeeds = hajinThreatSeeds as Seed[]
const partByName = new Map(threatParts.map(part => [`${part.poi}|${part.name}`, part]))
// The threat view names every major location and each drawn part's own place.
const threatPlaces = new Set([...pins.filter(pin => pin.layer === 'poi').map(pin => pin.id), ...threatParts.flatMap(part => part.pin ? [part.pin] : [])])
const levelOf = (id: string) => threatParts.find(part => part.pin === id)?.level
const hotterIn = (poi: string) => threatParts.filter(part => part.poi === poi && part.hotter)

// 24px stroke glyphs, one per layer.
const GLYPHS: Record<string, string> = {
  poi: 'M12 3l9 9l-9 9l-9-9z',
  fortress: 'M4 21V7h3v3h3V7h4v3h3V7h3v14zM10 21v-5h4v5',
  area: 'M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  compound: 'M5 5h14v14H5zM9 9h6v6H9z',
  police: 'M12 3l7 3v5c0 4.5-3 8-7 10c-4-2-7-5.5-7-10V6z',
  clinic: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z',
  fire: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.8 2.2-4.8c0 2 .8 3.3 2 3.8c-.4-3.4.3-6 .8-9z',
  gas: 'M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M3.5 21h12M5 10h9M14 9l3 3v5.5a1.5 1.5 0 0 0 3 0V9l-3-3',
  'marine-gas': 'M12 8v13M8 12h8M5 15a7 7 0 0 0 14 0M10 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  ammo: 'M4 9h16v11H4zM4 9l2-4h12l2 4M9 13h6',
  uav: 'M12 11v10M9 21l3-10l3 10M8.5 7.5a5 5 0 0 1 7 0M5.5 4.5a9 9 0 0 1 13 0',
  'lt-tower': 'M8 21l2-11h4l2 11M7 10h10M9 10V6h6v4M12 3v3M9.5 16h5',
  'key-room': 'M3.5 15.5a4 4 0 1 0 8 0a4 4 0 1 0-8 0M10.5 12.5L20 3M16 7l3 3M13.5 9.5l2 2',
  boss: 'M12 3a8 8 0 0 0-8 8c0 2.5 1.2 4.3 3 5.5V21h10v-4.5c1.8-1.2 3-3 3-5.5a8 8 0 0 0-8-8zM8 11.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M13 11.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M10.5 21v-2.5M13.5 21v-2.5',
  exfil: 'M12 21V9M7 14l5-5l5 5M4 4h16',
  sam: 'M12 3l3 5v8l2 3v2l-5-2l-5 2v-2l2-3V8z',
  'mission-exit': 'M5 21V4M5 4h12l-2.5 4l2.5 4H5',
  bounty: 'M12 3v4M12 17v4M3 12h4M17 12h4M7 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
  station: 'M7 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM5 11h14M8 21l2-4M16 21l-2-4',
  landmark: 'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM10 10a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
}
// Chip names; the full name and what the layer shows sit in the chip's title.
const SHORT: Record<string, string> = {
  poi: 'Major', fortress: 'Fortresses', area: 'Areas', compound: 'Compounds', police: 'Police', clinic: 'Clinics', fire: 'Fire', gas: 'Gas',
  'marine-gas': 'Marine gas', ammo: 'Ammo', uav: 'UAV', 'lt-tower': 'Lt. towers', 'key-room': 'Keys', boss: 'Bosses', exfil: 'Exfils',
  sam: 'SAM', 'mission-exit': 'Mission exits', bounty: 'Bounty', station: 'Stations', landmark: 'Landmarks',
}
const svg = (layer: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${GLYPHS[layer] || GLYPHS.landmark}"/></svg>`

const route = useRoute()
const router = useRouter()
const defaults = hajinLayers.filter(layer => layer.on).map(layer => layer.id)
const enabled = ref<string[]>([...defaults])
const levelsOn = ref<string[]>([...threatLevels])
const view = computed(() => route.query.view === 'threat' ? 'threat' : 'map')
const showGrid = ref(true)
const wheelZoom = ref(true)
const expanded = ref(false)
// Narrow maps fold the layer chips behind a button.
const layersOpen = ref(false)
const query = ref('')
const allIntel = ref(false)
const ready = ref(false)
const imageLoading = ref(true)
const imageError = ref(false)
const mapError = ref(false)
const atMin = ref(false)
const atMax = ref(false)
const cursor = ref('')
const copyMessage = ref('')
const rootRef = ref<HTMLElement>()
const canvasRef = ref<HTMLElement>()
const panelRef = ref<HTMLElement>()
const headingRef = ref<HTMLElement>()

const groups = ['Places', 'Services', 'Reported'].map(name => ({ name, layers: hajinLayers.filter(layer => layer.group === name) }))
const layerCount = (id: string) => PLACES.includes(id) || !hajinLayer(id) || hajinLayer(id)!.group === 'Services' ? pins.filter(pin => pin.layer === id).length : reports.filter(report => report.type === id).length
const threatClass = (level?: string) => level ? level.toLowerCase() : undefined
const placeName = (id?: string) => (id && pinIndex.get(id)?.name) || ''
const reportLabel = (type: string) => hajinLayer(type)?.one || type

// Selection: a pin id or a report id. A report with a place opens that place's card.
const selectedId = computed(() => String(route.query.pin || ''))
const selection = computed(() => {
  const id = selectedId.value
  const pin = pinIndex.get(id)
  if (pin) return { pin: pin.same ? pinIndex.get(pin.same)! : pin, report: undefined as Report | undefined }
  const report = reportIndex.get(id)
  if (report) return { pin: report.anchor ? pinIndex.get(report.anchor) : undefined, report }
  return null
})
const card = computed(() => {
  const current = selection.value
  if (!current) return null
  const pin = current.pin
  const layer = hajinLayer(pin ? pin.layer : current.report!.type)!
  const own = pin ? (pin.reports || []).map(id => reportIndex.get(id)!) : [current.report!]
  const order = hajinLayers.map(item => item.id)
  return {
    pin, layer, report: current.report,
    name: pin ? pin.name : current.report!.name,
    square: pin ? pin.square : current.report!.squares?.join(', '),
    reports: own.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type)),
    parts: (pin?.parts || []).map(([name, level]) => ({ name, level, part: partByName.get(`${pin!.id}|${name}`) })),
    inside: pin ? pins.filter(other => other.parent === pin.id && PLACES.includes(other.layer) && !other.same) : [],
    services: pin ? pins.filter(other => other.near === pin.id) : [],
    intel: (pin?.intel || []).map(id => intelIndex.get(id)!).filter(Boolean).sort((a, b) => INTEL_ORDER.indexOf(a.category) - INTEL_ORDER.indexOf(b.category)),
  }
})
// Things to do at a place come before general map notes.
const INTEL_ORDER = ['keys', 'enemies', 'missions', 'exfil', 'map', 'crafting', 'gear', 'vehicles', 'tips']

// Search: names, squares, layer names, threat parts and report text. "H6" lists a square.
const norm = (text: string) => text.toLocaleLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
const reportText = new Map(reports.map(report => [report.id, norm([report.name, report.where, reportLabel(report.type), ...(report.squares || [])].join(' '))]))
const pinText = new Map(pins.map(pin => [pin.id, norm([pin.name, pin.square, hajinLayer(pin.layer)!.one, ...(pin.parts || []).map(([part]) => part), placeName(pin.near), ...(pin.reports || []).map(id => reportText.get(id))].join(' '))]))
const squareQuery = computed(() => {
  const match = query.value.trim().match(/^([a-j])\s*-?\s*([1-9])$/i)
  return match ? `${match[1]!.toUpperCase()}${match[2]}` : ''
})
const results = computed<Item[]>(() => {
  const text = norm(query.value.trim())
  if (!text) return pins.filter(pin => pin.layer === 'poi').map(pin => ({ kind: 'pin', id: pin.id, pin }))
  const square = squareQuery.value
  const pinHit = (pin: Pin) => square ? pin.square === square : pinText.get(pin.id)!.includes(text)
  const reportHit = (report: Report) => square ? (report.squares || []).includes(square) || (!report.squares && pinIndex.get(report.anchor || '')?.square === square) : reportText.get(report.id)!.includes(text)
  return [
    ...pins.filter(pin => !pin.same && pinHit(pin)).map(pin => ({ kind: 'pin' as const, id: pin.id, pin })),
    ...reports.filter(reportHit).map(report => ({ kind: 'report' as const, id: report.id, report })),
  ]
})
// Threat view list: rated parts, most dangerous first, for the levels switched on.
const threatGroups = computed(() => [...threatLevels].reverse().filter(level => levelsOn.value.includes(level))
  .map(level => ({ level, parts: threatParts.filter(part => part.level === level) })).filter(group => group.parts.length))
const levelCount = (level: string) => threatParts.filter(part => part.level === level).length
const matching = computed(() => {
  if (!query.value.trim()) return null
  const ids = new Set<string>()
  for (const item of results.value) {
    if (item.kind === 'pin') ids.add(item.pin.same || item.id)
    else if (item.report.anchor) ids.add(item.report.anchor)
  }
  return ids
})

let map: L.Map | undefined
let overlay: L.ImageOverlay | undefined
let markers: L.LayerGroup | undefined
let gridLayer: L.LayerGroup | undefined
let squareLayer: L.LayerGroup | undefined
let zoneLayer: L.LayerGroup | undefined
let zones: { areas: Zone[], edges: Zone[] } | undefined
let observer: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
let reducedMotion = false
let fitZoom = 0
let frame = 0
let copyTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false
let fromMap = false
let lastWidth = 0
let lastHeight = 0

const point = (at: [number, number]) => { const [u, v] = toArt(at); return L.latLng(H - v, u) }
const imageBounds = () => L.latLngBounds([0, 0], [H, W])
function squareBounds(square: string) {
  const { cell } = hajinMap.grid
  const [x, y] = squareCentre(square)
  return L.latLngBounds(point([x - cell / 2, y + cell / 2]), point([x + cell / 2, y - cell / 2]))
}
const animate = () => ({ animate: !reducedMotion })

function updateZoom() {
  if (!map) return
  atMin.value = map.getZoom() <= map.getMinZoom()
  atMax.value = map.getZoom() >= map.getMaxZoom()
  const lift = map.getZoom() - fitZoom
  canvasRef.value?.setAttribute('data-detail', lift < 0.6 ? 'far' : lift < 1.35 ? 'mid' : 'near')
}
function measure() {
  if (!map) return
  // getBoundsZoom clamps to the current limits, so open them first.
  map.setMinZoom(-8)
  map.setMaxZoom(8)
  fitZoom = map.getBoundsZoom(imageBounds(), false, L.point(16, 16))
  map.setMinZoom(fitZoom - 0.25)
  map.setMaxZoom(fitZoom + 2.25)
}
function fit() {
  if (!map) return
  measure()
  map.fitBounds(imageBounds(), { padding: [8, 8], animate: false })
  updateZoom()
}
function zoomBy(step: number) { map?.setZoom(map.getZoom() + step, animate()) }

function renderGrid() {
  gridLayer?.clearLayers()
  if (!map || !showGrid.value) return
  gridLayer ||= L.layerGroup().addTo(map)
  const { left, top, cell, columns, rows } = hajinMap.grid
  const right = left + columns.length * cell, bottom = top + rows * cell
  const line = { className: 'tm-grid-line', weight: 1, interactive: false, pane: 'tmGrid' }
  for (let i = 0; i <= columns.length; i++) L.polyline([point([left + i * cell, top]), point([left + i * cell, bottom])], line).addTo(gridLayer)
  for (let j = 0; j <= rows; j++) L.polyline([point([left, top + j * cell]), point([right, top + j * cell])], line).addTo(gridLayer)
  const label = (text: string, at: [number, number]) => {
    const element = document.createElement('span')
    element.textContent = text
    L.marker(point(at), { interactive: false, keyboard: false, zIndexOffset: -1000, icon: L.divIcon({ html: element, className: 'tm-grid-label', iconSize: [22, 18], iconAnchor: [11, 9] }) }).addTo(gridLayer!)
  }
  ;[...columns].forEach((letter, i) => label(letter, [left + (i + 0.5) * cell, top - 34]))
  for (let j = 0; j < rows; j++) label(String(j + 1), [left - 40, top + (j + 0.5) * cell])
}

function renderSquares() {
  squareLayer?.clearLayers()
  if (!map) return
  squareLayer ||= L.layerGroup().addTo(map)
  const report = selection.value?.report
  const squares = new Set<string>()
  if (squareQuery.value) squares.add(squareQuery.value)
  if (report && !report.anchor) report.squares?.forEach(square => squares.add(square))
  for (const square of squares) L.rectangle(squareBounds(square), { className: 'tm-square', pane: 'tmGrid', weight: 2, dashArray: '6 5', fillOpacity: 0.12, interactive: false }).addTo(squareLayer)
}

// Traced the first time the threat view opens. Parts of one location at one level
// share an outline; a location with an undrawn hotter part gets a dashed edge too.
function traceZones() {
  const field = zoneField(threatSeeds, 4)
  const areas = [...traceRegions(field, (k: number) => threatSeeds[k]!.level ? `${threatSeeds[k]!.poi}|${threatSeeds[k]!.level}` : null)].map(([key, rings]) => {
    const [poi, level] = (key as string).split('|') as [string, string]
    return { poi, level, rings, parts: threatParts.filter(part => part.poi === poi && part.level === level) }
  })
  const hot = new Set(threatParts.filter(part => part.hotter).map(part => part.poi))
  const edges = [...traceRegions(field, (k: number) => hot.has(threatSeeds[k]!.poi || '') ? threatSeeds[k]!.poi : null)].flatMap(([poi, rings]) =>
    [...new Set(hotterIn(poi as string).map(part => part.level))].map(level => ({ poi, level, rings, parts: hotterIn(poi as string).filter(part => part.level === level) })))
  return { areas: areas as Zone[], edges: edges as Zone[] }
}
function zoneTip(zone: Zone) {
  const tip = document.createElement('span')
  tip.className = 'tm-zone-tip'
  const head = document.createElement('b')
  head.textContent = `${placeName(zone.poi)} · ${zone.level}`
  tip.append(head)
  const name = (part: ThreatPart) => part.at ? part.name : `${part.name} (spot not mapped)`
  const own = zone.parts.length > 1 || zone.parts[0]?.name !== placeName(zone.poi) ? zone.parts.map(name).join(', ') : ''
  for (const text of [own, ...hotterIn(zone.poi).map(part => `Also inside: ${name(part)}, ${part.level}`)].filter(Boolean)) {
    const line = document.createElement('small')
    line.textContent = text
    tip.append(line)
  }
  return tip
}
function renderZones() {
  zoneLayer?.clearLayers()
  if (!map || view.value !== 'threat') return
  zoneLayer ||= L.layerGroup().addTo(map)
  zones ||= traceZones()
  const on = new Set(levelsOn.value)
  const current = selection.value?.pin
  const focus = current ? (current.layer === 'poi' ? current.id : current.parent) : undefined
  const latLngs = (zone: Zone) => zone.rings.map(ring => ring.map(at => point(at)))
  for (const zone of zones.areas) {
    if (!on.has(zone.level)) continue
    const shape = L.polygon(latLngs(zone), { pane: 'tmZones', className: `tm-zone${zone.poi === focus ? ' is-on' : ''}`, weight: 1.5, smoothFactor: 0.5 })
    shape.bindTooltip(zoneTip(zone), { sticky: true, direction: 'top', offset: [0, -10], className: 'tm-tip' })
    shape.on('click', () => { fromMap = true; select(zone.poi) })
    shape.addTo(zoneLayer)
    shape.getElement()?.setAttribute('data-threat', threatClass(zone.level)!)
  }
  for (const zone of zones.edges) {
    if (!on.has(zone.level)) continue
    const edge = L.polygon(latLngs(zone), { pane: 'tmZones', className: 'tm-zone-edge', weight: 2.5, dashArray: '7 6', fill: false, interactive: false, smoothFactor: 0.5 })
    edge.addTo(zoneLayer)
    edge.getElement()?.setAttribute('data-threat', threatClass(zone.level)!)
  }
}

// One marker per place or service. A place carries a badge for its reported sites,
// or in the threat view the level of the part it stands for.
function placeMarker(pin: Pin, shown: Report[], selected: boolean, dim: boolean, levels: { level: string, inside?: boolean }[] = []) {
  const root = document.createElement('span')
  root.className = `tm-pin tm-pin--${pin.layer}${selected ? ' is-on' : ''}${dim ? ' is-dim' : ''}${pin.same ? ' is-twin' : ''}`
  if (pin.threat) root.dataset.threat = threatClass(pin.threat)
  const glyph = document.createElement('span')
  glyph.className = 'tm-glyph'
  if (pin.layer === 'compound') glyph.textContent = pin.name.split(' ').at(-1)![0]!
  else if (pin.layer !== 'poi' && pin.layer !== 'area') glyph.innerHTML = svg(pin.layer)
  root.append(glyph)
  if (PLACES.includes(pin.layer) && !pin.same) {
    const label = document.createElement('span')
    label.className = 'tm-label'
    label.textContent = pin.name
    for (const { level, inside } of levels) {
      const tag = document.createElement('i')
      tag.className = `tm-level${inside ? ' is-inside' : ''}`
      tag.dataset.threat = threatClass(level)
      tag.textContent = inside ? `+ ${level}` : level
      label.append(tag)
    }
    root.append(label)
  }
  if (shown.length) {
    const badge = document.createElement('span')
    badge.className = 'tm-badge'
    const types = [...new Set(shown.map(report => report.type))]
    badge.innerHTML = types.slice(0, 2).map(svg).join('')
    const count = document.createElement('b')
    count.textContent = String(shown.length)
    badge.append(count)
    root.append(badge)
  }
  return root
}
function describe(pin: Pin, shown: Report[]) {
  const layer = hajinLayer(pin.layer)!
  const parts = [pin.same ? `${pin.name} fortress` : pin.name, PLACES.includes(pin.layer) ? layer.one : '', `square ${pin.square}`, pin.threat ? `${pin.threat} threat` : '', pin.near ? `near ${placeName(pin.near)}` : '']
  if (shown.length) parts.push(`${shown.length} reported ${shown.length === 1 ? 'site' : 'sites'}`)
  return parts.filter(Boolean).join(', ')
}
function renderMarkers() {
  if (!map || !markers) return
  const focused = (document.activeElement as HTMLElement | null)?.dataset?.pin
  markers.clearLayers()
  const on = new Set(enabled.value)
  const threat = view.value === 'threat'
  const levels = new Set(levelsOn.value)
  const current = selection.value
  const selectedPin = current?.pin?.id
  const hits = matching.value
  // Leaflet stacks markers by screen y; these offsets outweigh that so names stay on top.
  const z = { poi: 10000, fortress: 8000, compound: 6000, area: 4000 } as Record<string, number>
  for (const pin of pins) {
    const shown = threat ? [] : (pin.reports || []).map(id => reportIndex.get(id)!).filter(report => on.has(report.type))
    const selected = pin.id === selectedPin || (pin.same === selectedPin && !!pin.same)
    if (!(threat ? threatPlaces.has(pin.id) : on.has(pin.layer) || shown.length) && !selected) continue
    const level = threat ? levelOf(pin.id) : undefined
    const tags = threat ? [...(level ? [{ level }] : []), ...[...new Set(hotterIn(pin.id).map(part => part.level))].map(hot => ({ level: hot, inside: true }))] : []
    // In the threat view a place fades when none of its levels is switched on.
    const off = threat && !(pin.layer === 'poi' ? threatParts.some(part => part.poi === pin.id && levels.has(part.level)) : !!level && levels.has(level))
    const dim = (!!hits && !hits.has(pin.id) && !(pin.same && hits.has(pin.same))) || off
    const marker = L.marker(point(pin.at), {
      icon: L.divIcon({ html: placeMarker(pin, shown, selected, dim, tags), className: 'tm-marker', iconSize: [22, 22], iconAnchor: [11, 11] }),
      keyboard: true, riseOnHover: true, zIndexOffset: (z[pin.layer] || 0) + (selected ? 20000 : 0) + (dim ? -20000 : 0),
    })
    if (!PLACES.includes(pin.layer) || pin.same) {
      const tip = document.createElement('span')
      tip.textContent = pin.same ? `${pin.name} (fortress)` : `${pin.name} · ${pin.square} · near ${placeName(pin.near)}`
      marker.bindTooltip(tip, { direction: 'top', offset: [0, -12], className: 'tm-tip' })
    }
    const activate = () => { fromMap = true; select(pin.same || pin.id) }
    marker.on('click', activate)
    marker.addTo(markers)
    const element = marker.getElement()
    if (!element) continue
    element.dataset.pin = pin.id
    element.setAttribute('role', 'button')
    element.setAttribute('aria-label', describe(pin, shown))
    element.setAttribute('aria-pressed', String(selected))
    const onKey = (event: Event) => { if ([' ', 'Enter'].includes((event as KeyboardEvent).key)) { event.preventDefault(); L.DomEvent.stopPropagation(event); activate() } }
    L.DomEvent.on(element, 'keydown', onKey)
    marker.on('remove', () => L.DomEvent.off(element, 'keydown', onKey))
    if (focused === pin.id) element.focus({ preventScroll: true })
  }
  // A report that names no place sits in the middle of its square.
  for (const report of reports) {
    if (report.anchor || !report.squares?.length) continue
    const selected = current?.report?.id === report.id
    if ((threat || !on.has(report.type)) && !selected) continue
    const root = document.createElement('span')
    const dim = !!hits && !results.value.some(item => item.id === report.id)
    root.className = `tm-pin tm-pin--report${selected ? ' is-on' : ''}${dim ? ' is-dim' : ''}`
    root.innerHTML = `<span class="tm-glyph">${svg(report.type)}</span>`
    const marker = L.marker(point(squareCentre(report.squares[0]!) as [number, number]), { icon: L.divIcon({ html: root, className: 'tm-marker', iconSize: [22, 22], iconAnchor: [11, 11] }), keyboard: true, zIndexOffset: selected ? 2000 : 0 })
    const tip = document.createElement('span')
    tip.textContent = `${report.name} · somewhere in ${report.squares.join(', ')}`
    marker.bindTooltip(tip, { direction: 'top', offset: [0, -12], className: 'tm-tip' })
    marker.on('click', () => { fromMap = true; select(report.id) })
    marker.addTo(markers)
    const element = marker.getElement()
    element?.setAttribute('role', 'button')
    element?.setAttribute('aria-label', `${report.name}, ${reportLabel(report.type)}, somewhere in square ${report.squares.join(', ')}`)
  }
}

function frameSelection() {
  if (!map) return
  const current = selection.value
  if (!current) return
  if (current.pin) {
    const at = point(current.pin.at)
    if (fromMap) { if (!map.getBounds().pad(-0.12).contains(at)) map.panTo(at, animate()) }
    else map.setView(at, Math.max(map.getZoom(), fitZoom + 1.25), animate())
  } else if (current.report?.squares?.length) {
    map.fitBounds(squareBounds(current.report.squares[0]!), { maxZoom: fitZoom + 1.5, padding: [40, 40], ...animate() })
  }
}
function select(id: string) {
  allIntel.value = false
  router.replace({ query: { ...route.query, pin: id || undefined }, hash: route.hash })
}
function pick(item: Item) {
  fromMap = false
  if (selectedId.value === item.id) { frameSelection(); return }
  select(item.id)
  nextTick(() => headingRef.value?.focus({ preventScroll: true }))
}
function pickPart(part: ThreatPart) {
  const id = part.pin || part.poi
  pick({ kind: 'pin', id, pin: pinIndex.get(id)! })
}
function setView(next: 'map' | 'threat') {
  router.replace({ query: { ...route.query, view: next === 'threat' ? 'threat' : undefined }, hash: route.hash })
}
function toggleLevel(level: string) {
  levelsOn.value = levelsOn.value.includes(level) ? levelsOn.value.filter(on => on !== level) : threatLevels.filter(on => on === level || levelsOn.value.includes(on))
}
function selectFromCard(id: string) { fromMap = false; select(id); nextTick(() => headingRef.value?.focus({ preventScroll: true })) }
function close() {
  const id = selection.value?.pin?.id
  select('')
  if (id) nextTick(() => canvasRef.value?.querySelector<HTMLElement>(`[data-pin="${CSS.escape(id)}"]`)?.focus({ preventScroll: true }))
}
function showDetails() { panelRef.value?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' }) }

function toggleLayer(id: string) {
  enabled.value = enabled.value.includes(id) ? enabled.value.filter(layer => layer !== id) : hajinLayers.map(layer => layer.id).filter(layer => layer === id || enabled.value.includes(layer))
}
function resetLayers() { enabled.value = [...defaults] }
function sourcesOf(report: Report) {
  const seen = new Map<string, Source & { site: string }>()
  for (const id of report.sources) {
    const source = sources[id]
    if (!source) continue
    const site = intelSourceSite(source)
    if (!seen.has(site)) seen.set(site, { ...source, site })
  }
  return [...seen.values()]
}
async function copyLink() {
  const url = new URL(window.location.href)
  url.hash = 'map'
  try { await navigator.clipboard.writeText(url.href); copyMessage.value = 'Link copied.' } catch { copyMessage.value = 'Copy the address bar to share this place.' }
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copyMessage.value = '' }, 5000)
}

function save() {
  try { localStorage.setItem(PREFS, JSON.stringify({ layers: enabled.value, levels: levelsOn.value, grid: showGrid.value, wheel: wheelZoom.value })) } catch { /* The map works without storage. */ }
}
function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS) || 'null')
    if (Array.isArray(saved?.layers)) enabled.value = hajinLayers.map(layer => layer.id).filter(id => saved.layers.includes(id))
    if (Array.isArray(saved?.levels)) levelsOn.value = threatLevels.filter(level => saved.levels.includes(level))
    if (typeof saved?.grid === 'boolean') showGrid.value = saved.grid
    if (typeof saved?.wheel === 'boolean') wheelZoom.value = saved.wheel
  } catch { /* Defaults stand. */ }
}
function loadImage() {
  if (!map) return
  overlay?.off('load error')
  overlay?.remove()
  imageError.value = false
  imageLoading.value = true
  overlay = L.imageOverlay(hajinMap.image, imageBounds(), { alt: 'Hajin Tactical Map, official artwork', interactive: false })
  overlay.on('load', () => { if (!disposed) imageLoading.value = false })
  overlay.on('error', () => { if (!disposed) { imageLoading.value = false; imageError.value = true } })
  overlay.addTo(map)
  overlay.bringToBack()
}
function resize() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    if (!map || disposed || !canvasRef.value) return
    const box = canvasRef.value.getBoundingClientRect()
    if (!box.width || !box.height) return
    const first = !lastWidth
    const changed = box.width !== lastWidth || box.height !== lastHeight
    lastWidth = box.width
    lastHeight = box.height
    if (!changed) return
    // Keep a view the reader has moved; refit one that still shows the whole map.
    const untouched = Math.abs(map.getZoom() - fitZoom) < 0.05
    map.invalidateSize({ pan: false, animate: false })
    measure()
    if (first && selection.value) { fromMap = false; frameSelection() }
    else if (first || untouched) map.fitBounds(imageBounds(), { padding: [8, 8], animate: false })
    updateZoom()
  })
}
function zoomTo() { fromMap = false; frameSelection() }
function trackCursor(event: L.LeafletMouseEvent) {
  const { scale, x, y } = hajinMap.toArt
  const ox = (event.latlng.lng - x) / scale, oy = (H - event.latlng.lat - y) / scale
  const { left, top, cell, columns, rows } = hajinMap.grid
  const column = Math.floor((ox - left) / cell), row = Math.floor((oy - top) / cell) + 1
  cursor.value = column >= 0 && column < columns.length && row >= 1 && row <= rows ? `${columns[column]}${row}` : ''
}
function preserveBrowserZoom(event: WheelEvent) { if (event.ctrlKey || event.metaKey) event.stopImmediatePropagation() }
function motionChanged(event: MediaQueryListEvent) { reducedMotion = event.matches; if (map) map.options.inertia = !reducedMotion }
async function toggleExpand() { expanded.value = !expanded.value; await nextTick(); resize() }

watch(selectedId, () => {
  renderMarkers()
  renderZones()
  renderSquares()
  frameSelection()
  fromMap = false
  if (selectedId.value && !selection.value) select('')
})
watch(enabled, () => { renderMarkers(); save() })
watch(view, () => { renderZones(); renderMarkers() })
watch(levelsOn, () => { renderZones(); renderMarkers(); save() })
watch(query, () => {
  renderMarkers()
  renderSquares()
  if (squareQuery.value && map) map.fitBounds(squareBounds(squareQuery.value), { maxZoom: fitZoom + 1.25, padding: [30, 30], ...animate() })
})
watch(showGrid, () => { renderGrid(); save() })
watch(wheelZoom, on => { if (on) map?.scrollWheelZoom.enable(); else map?.scrollWheelZoom.disable(); save() })

onMounted(async () => {
  await nextTick()
  if (disposed || !canvasRef.value) return
  restore()
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionQuery.matches
  motionQuery.addEventListener('change', motionChanged)
  try {
    canvasRef.value.addEventListener('wheel', preserveBrowserZoom, { capture: true, passive: true })
    // As in InteractiveMap: no zoom animation, so a route change cannot leave
    // Leaflet's transition timer running against a removed pane.
    map = L.map(canvasRef.value, { crs: L.CRS.Simple, zoomSnap: 0.25, zoomDelta: 0.5, zoomControl: false, attributionControl: false, scrollWheelZoom: wheelZoom.value, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, inertia: !reducedMotion, maxBounds: imageBounds().pad(0.15), maxBoundsViscosity: 0.8, bounceAtZoomLimits: false })
    // Zones sit over the art and under the grid, which sits under the markers.
    map.createPane('tmZones').style.zIndex = '410'
    map.createPane('tmGrid').style.zIndex = '420'
    loadImage()
    markers = L.layerGroup().addTo(map)
    map.on('zoomend', updateZoom)
    map.on('mousemove', trackCursor)
    map.on('mouseout', () => { cursor.value = '' })
    fit()
    renderGrid()
    renderZones()
    renderMarkers()
    renderSquares()
    if (selectedId.value && !selection.value) select('')
    frameSelection()
    ready.value = true
    observer = new ResizeObserver(resize)
    observer.observe(canvasRef.value)
  } catch {
    mapError.value = true
    imageLoading.value = false
  }
})
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frame)
  clearTimeout(copyTimer)
  observer?.disconnect()
  motionQuery?.removeEventListener('change', motionChanged)
  canvasRef.value?.removeEventListener('wheel', preserveBrowserZoom, true)
  map?.stop()
  overlay?.off('load error')
  markers?.clearLayers()
  gridLayer?.clearLayers()
  squareLayer?.clearLayers()
  zoneLayer?.clearLayers()
  map?.remove()
  map = undefined
})

const reportSourceCount = new Set(reports.flatMap(report => report.sources)).size
const INTEL_PREVIEW = 6
</script>

<template>
  <div ref="rootRef" class="tm" :class="{ 'tm--expanded': expanded, 'tm--threat': view === 'threat' }">
    <div class="tm-tools">
      <div class="tm-find">
        <label class="tm-search">
          <span class="sr-only">Search the Tac-Map</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
          <input v-model="query" type="search" placeholder="Search places, keys, bosses or a square (H6)" autocomplete="off" spellcheck="false">
        </label>
        <button type="button" class="tm-layers-toggle" aria-controls="tm-layers" :aria-expanded="layersOpen" @click="layersOpen = !layersOpen">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5l-9 5l-9-5zM3 13l9 5l9-5" /></svg>{{ view === 'threat' ? 'Levels' : 'Layers' }}<span class="dmz-mono">{{ view === 'threat' ? levelsOn.length : enabled.length }}</span>
        </button>
      </div>
      <div v-if="view === 'threat'" id="tm-layers" class="tm-layers" :class="{ 'is-open': layersOpen }" role="group" aria-label="Threat levels">
        <div class="tm-group">
          <span class="tm-group-name dmz-mono">Threat</span>
          <div class="tm-chips">
            <button v-for="level in threatLevels" :key="level" type="button" class="tm-chip tm-chip--level" :data-threat="threatClass(level)" :aria-pressed="levelsOn.includes(level)" :title="`${level}: ${levelCount(level)} rated ${levelCount(level) === 1 ? 'part' : 'parts'}`" @click="toggleLevel(level)">
              <i aria-hidden="true" />{{ level }}<span class="dmz-mono">{{ levelCount(level) }}</span>
            </button>
          </div>
        </div>
        <button type="button" class="tm-reset" @click="levelsOn = [...threatLevels]">All levels</button>
      </div>
      <div v-else id="tm-layers" class="tm-layers" :class="{ 'is-open': layersOpen }" role="group" aria-label="Map layers">
        <div v-for="group in groups" :key="group.name" class="tm-group">
          <span class="tm-group-name dmz-mono">{{ group.name }}</span>
          <div class="tm-chips">
            <button v-for="layer in group.layers" :key="layer.id" type="button" class="tm-chip" :class="`tm-chip--${layer.id}`" :aria-pressed="enabled.includes(layer.id)" :title="`${layer.label}: ${layer.desc}`" @click="toggleLayer(layer.id)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[layer.id]" /></svg>{{ SHORT[layer.id] }}<span class="dmz-mono">{{ layerCount(layer.id) }}</span>
            </button>
          </div>
        </div>
        <button type="button" class="tm-reset" @click="resetLayers">Reset layers</button>
      </div>
    </div>

    <div class="tm-work">
      <div class="tm-stage">
        <div class="tm-frame">
          <div ref="canvasRef" class="tm-canvas" data-detail="far" role="region" aria-label="Hajin Tac-Map. Arrow keys pan, plus and minus zoom." :inert="imageError || mapError" />
          <div class="tm-controls" role="group" aria-label="Map controls">
            <button type="button" aria-label="Zoom in" title="Zoom in" :disabled="!ready || atMax" @click="zoomBy(0.5)">+</button>
            <button type="button" aria-label="Zoom out" title="Zoom out" :disabled="!ready || atMin" @click="zoomBy(-0.5)">−</button>
            <button type="button" aria-label="Fit the whole map" title="Fit map" :disabled="!ready" @click="fit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg></button>
            <button type="button" aria-label="Grid squares" title="Grid squares" :aria-pressed="showGrid" @click="showGrid = !showGrid"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16" /></svg></button>
            <button type="button" :aria-label="expanded ? 'Reduce the map' : 'Expand the map'" :title="expanded ? 'Reduce' : 'Expand'" :aria-pressed="expanded" @click="toggleExpand"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="expanded ? 'M9 4v5H4M15 4v5h5M20 15h-5v5M4 15h5v5' : 'M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7'" /></svg></button>
          </div>
          <div class="tm-hud">
            <div class="tm-view" role="group" aria-label="Map view">
              <button type="button" :aria-pressed="view === 'map'" @click="setView('map')">Map</button>
              <button type="button" :aria-pressed="view === 'threat'" @click="setView('threat')">Threat</button>
            </div>
            <span v-if="cursor" class="tm-cursor dmz-mono" aria-hidden="true">Square {{ cursor }}</span>
          </div>
          <div v-if="card" class="tm-bar">
            <span class="tm-bar-glyph" :data-threat="threatClass(card.pin?.threat)"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[card.layer.id]" /></svg></span>
            <span class="tm-bar-name">{{ card.name }}<small class="dmz-mono">{{ card.square }}</small></span>
            <button type="button" class="tm-bar-more" @click="showDetails">Details</button>
          </div>
          <div v-if="imageError || mapError" class="tm-error" role="status">
            <strong>{{ mapError ? 'The map viewer could not open.' : 'The map image could not load.' }}</strong>
            <span>The place list beside the map still works.</span>
            <button v-if="!mapError" type="button" class="tm-text" @click="loadImage">Try again</button>
          </div>
          <p v-else-if="imageLoading" class="tm-loading dmz-mono" role="status">Loading Tac-Map…</p>
        </div>
        <div class="tm-legend">
          <template v-if="view === 'threat'">
            <span class="tm-legend-edge"><i aria-hidden="true" />Rated higher inside, spot not mapped</span>
            <span class="tm-legend-none"><i aria-hidden="true" />No official rating</span>
          </template>
          <template v-else>
            <span class="tm-legend-threat"><span class="dmz-mono">Peak threat</span><span v-for="level in threatLevels" :key="level" :data-threat="threatClass(level)"><i aria-hidden="true" />{{ level }}</span></span>
            <span class="tm-legend-report"><i class="tm-legend-badge" aria-hidden="true">3</i>Reported sites at a place</span>
          </template>
          <label class="tm-wheel"><input v-model="wheelZoom" type="checkbox"> Scroll to zoom</label>
        </div>
        <p v-if="view === 'threat'" class="tm-legend-note">Zones are approximate. Activision rates each part of a location but draws no borders, so the ground near each rated place takes its rating, and the nearer place wins where two meet.</p>
      </div>

      <aside ref="panelRef" class="tm-panel" aria-label="Tac-Map details" @keydown.esc="card && ($event.preventDefault(), close())">
        <section v-if="card" class="tm-card" aria-label="Selected">
          <div class="tm-card-head">
            <span class="dmz-label dmz-mono">{{ card.layer.one }}</span>
            <button type="button" class="tm-text" @click="close">Close</button>
          </div>
          <h3 ref="headingRef" tabindex="-1">{{ card.name }}</h3>
          <p class="tm-meta dmz-mono">
            <span v-if="card.square">Square {{ card.square }}</span>
            <span v-if="card.pin?.threat" class="tm-threat" :data-threat="threatClass(card.pin.threat)">{{ card.pin.threat }} threat</span>
          </p>
          <p v-if="card.pin?.parent && card.pin.parent !== card.pin.id" class="tm-line">In <button type="button" class="tm-link" @click="selectFromCard(card.pin.parent)">{{ placeName(card.pin.parent) }}</button></p>
          <p v-if="card.pin?.near" class="tm-line">Near <button type="button" class="tm-link" @click="selectFromCard(card.pin.near)">{{ placeName(card.pin.near) }}</button></p>
          <p v-if="card.pin" class="tm-desc">{{ card.pin.desc || card.layer.desc }}</p>
          <p v-else class="tm-desc">This site names no place, so it is shown in the middle of its square.</p>

          <div v-if="card.parts.length" class="tm-block">
            <h4 class="dmz-mono">Threat by area</h4>
            <ul class="tm-parts">
              <li v-for="item in card.parts" :key="item.name">
                <button v-if="item.part?.pin && item.part.pin !== card.pin?.id" type="button" class="tm-link" @click="selectFromCard(item.part.pin)">{{ item.name }}</button>
                <span v-else>{{ item.name }}<small v-if="view === 'threat' && !item.part?.at" class="dmz-mono">Spot not mapped</small></span>
                <span class="tm-threat dmz-mono" :data-threat="threatClass(item.level)">{{ item.level }}</span>
              </li>
            </ul>
          </div>

          <div v-if="card.inside.length || card.services.length" class="tm-block">
            <h4 class="dmz-mono">On the map here</h4>
            <div class="tm-nearby">
              <button v-for="other in [...card.inside, ...card.services]" :key="other.id" type="button" :class="`tm-chip--${other.layer}`" @click="selectFromCard(other.id)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[other.layer]" /></svg>{{ PLACES.includes(other.layer) ? other.name : hajinLayer(other.layer)!.one }}<span class="dmz-mono">{{ other.square }}</span>
              </button>
            </div>
          </div>

          <div v-if="card.reports.length" class="tm-block">
            <h4 class="dmz-mono">Reported {{ card.pin ? 'here' : 'site' }} · {{ card.reports.length }}</h4>
            <p v-if="card.pin" class="tm-hint">Guides and players place these at {{ card.name }}. The Tac-Map gives no exact spot.</p>
            <ul class="tm-reports">
              <li v-for="report in card.reports" :key="report.id" :class="{ 'is-focus': selection?.report?.id === report.id }">
                <div class="tm-report-head">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[report.type]" /></svg>
                  <span class="dmz-mono">{{ reportLabel(report.type) }}</span>
                  <span class="tm-badge-conf dmz-mono" :class="`is-${report.confidence}`">{{ intelConfidenceLabel(report.confidence) }}</span>
                </div>
                <strong>{{ report.name }}</strong>
                <p>{{ report.where }}</p>
                <p v-if="report.squares || report.threat" class="tm-meta dmz-mono"><span v-if="report.squares">Square {{ report.squares.join(', ') }}</span><span v-if="report.threat" class="tm-threat" :data-threat="threatClass(report.threat)">{{ report.threat }} threat</span></p>
                <p v-if="report.note" class="tm-note">{{ report.note }}</p>
                <p class="tm-src"><span class="dmz-mono">Sources</span> <template v-for="(source, index) in sourcesOf(report)" :key="source.site"><template v-if="index">, </template><a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" :title="source.label">{{ source.site }}<span class="sr-only"> (opens in a new tab)</span></a><span v-else>{{ source.site }}</span></template></p>
                <DmzIntelLink v-if="report.intel" :id="report.intel" class="tm-intel-link">Intel card: {{ intelIndex.get(report.intel)?.name }} →</DmzIntelLink>
              </li>
            </ul>
          </div>

          <div v-if="card.intel.length" class="tm-block">
            <h4 class="dmz-mono">In the Intel database · {{ card.intel.length }}</h4>
            <ul class="tm-intel">
              <li v-for="entry in allIntel ? card.intel : card.intel.slice(0, INTEL_PREVIEW)" :key="entry.id"><DmzIntelLink :id="entry.id">{{ entry.name }}</DmzIntelLink><span class="dmz-mono">{{ entry.type }}</span></li>
            </ul>
            <button v-if="card.intel.length > INTEL_PREVIEW" type="button" class="tm-text" :aria-expanded="allIntel" @click="allIntel = !allIntel">{{ allIntel ? 'Show fewer' : `Show all ${card.intel.length}` }}</button>
          </div>

          <div class="tm-actions">
            <button type="button" class="tm-action" @click="zoomTo">Zoom to</button>
            <button type="button" class="tm-action" @click="copyLink">Copy link</button>
            <span v-if="copyMessage" class="tm-copied" role="status">{{ copyMessage }}</span>
          </div>
        </section>

        <template v-if="view === 'threat' && !query.trim()">
          <div class="tm-results-head">
            <h3 class="dmz-mono">Threat by part</h3>
            <span class="dmz-mono">{{ threatGroups.reduce((sum, group) => sum + group.parts.length, 0) }}</span>
          </div>
          <p v-if="!threatGroups.length" class="tm-empty">Every threat level is switched off. Pick one above the map.</p>
          <div v-for="group in threatGroups" :key="group.level" class="tm-tier" :data-threat="threatClass(group.level)">
            <h4 class="dmz-mono">{{ group.level }} · {{ group.parts.length }}</h4>
            <ul class="tm-list">
              <li v-for="part in group.parts" :key="part.id">
                <button type="button" :aria-pressed="!!part.pin && selectedId === part.pin" @click="pickPart(part)">
                  <span class="tm-list-glyph" :data-threat="threatClass(part.level)"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[part.pin ? pinIndex.get(part.pin)!.layer : 'poi']" /></svg></span>
                  <span class="tm-list-text">{{ part.name }}<small>{{ part.name === placeName(part.poi) ? 'Major location' : placeName(part.poi) }} · {{ part.pin ? pinIndex.get(part.pin)!.square : 'Spot not mapped' }}</small></span>
                </button>
              </li>
            </ul>
          </div>
        </template>
        <template v-else>
          <div class="tm-results-head">
            <h3 class="dmz-mono">{{ squareQuery ? `Square ${squareQuery}` : query.trim() ? 'Results' : 'Major locations' }}</h3>
            <span class="dmz-mono" aria-live="polite">{{ results.length }}</span>
          </div>
          <p v-if="!results.length" class="tm-empty">Nothing on the map matches. Try a place name, a key, a boss or a square such as D7.</p>
          <ul v-else class="tm-list">
            <li v-for="item in results" :key="item.kind + item.id">
              <button type="button" :aria-pressed="selectedId === item.id" @click="pick(item)">
                <span class="tm-list-glyph" :class="`tm-chip--${item.kind === 'pin' ? item.pin.layer : item.report.type}`" :data-threat="item.kind === 'pin' ? threatClass(item.pin.threat) : undefined"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[item.kind === 'pin' ? item.pin.layer : item.report.type]" /></svg></span>
                <span class="tm-list-text">
                  <template v-if="item.kind === 'pin'">{{ PLACES.includes(item.pin.layer) ? item.pin.name : hajinLayer(item.pin.layer)!.one }}<small>{{ PLACES.includes(item.pin.layer) ? hajinLayer(item.pin.layer)!.one : `Near ${placeName(item.pin.near)}` }} · {{ item.pin.square }}{{ item.pin.threat ? ` · ${item.pin.threat}` : '' }}{{ item.pin.reports?.length ? ` · ${item.pin.reports.length} reported` : '' }}</small></template>
                  <template v-else>{{ item.report.name }}<small>{{ reportLabel(item.report.type) }}{{ item.report.anchor ? ` · ${placeName(item.report.anchor)}` : '' }}{{ item.report.squares ? ` · ${item.report.squares.join(', ')}` : '' }} · {{ intelConfidenceLabel(item.report.confidence) }}</small></template>
                </span>
              </button>
            </li>
          </ul>
        </template>
      </aside>
    </div>

    <details class="tm-credits">
      <summary>Map sources and credits</summary>
      <ul>
        <li v-for="source in hajinMap.sources" :key="source.url"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }}<span class="sr-only"> (opens in a new tab)</span></a> · {{ source.note }}</li>
      </ul>
      <p>Marker positions checked {{ HAJIN_MAP_CHECKED }}. The grid was fitted to the official D7 example and to squares read in game; near a line, a square can read one off. Reported sites come from {{ reportSourceCount }} guide, video and player sources, credited on each site. Viewer by CodWiki, built with <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>.</p>
    </details>
  </div>
</template>

<style scoped>
.tm { --tm-low: #a9b39a; --tm-medium: #d8c47c; --tm-high: #e8a04f; --tm-critical: #ef7a5a; --tm-extreme: #ff5468; --tm-report: var(--dz-accent); container-type: inline-size; color: var(--dz-ink); }
.tm p, .tm li { margin: 0; max-width: none; font-size: inherit; color: inherit; }
.tm svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
/* :deep, so markers, zones and tags that Leaflet builds pick up the level colours too. */
.tm :deep([data-threat='low']) { --tm-t: var(--tm-low); }
.tm :deep([data-threat='medium']) { --tm-t: var(--tm-medium); }
.tm :deep([data-threat='high']) { --tm-t: var(--tm-high); }
.tm :deep([data-threat='critical']) { --tm-t: var(--tm-critical); }
.tm :deep([data-threat='extreme']) { --tm-t: var(--tm-extreme); }

/* Tools */
.tm-tools { display: grid; gap: 0.75rem; margin-bottom: 0.875rem; }
.tm-find { display: flex; gap: 0.5rem; }
.tm-layers-toggle { display: none; }
.tm-search { flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0 1.125rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); }
.tm-search:focus-within { border-color: var(--dz-ink); }
.tm-search svg { flex: none; width: 1.125rem; height: 1.125rem; stroke: var(--dz-muted); stroke-width: 2; }
.tm-search input { flex: 1; min-width: 0; height: 2.75rem; border: 0; background: transparent; color: var(--dz-ink); font: inherit; font-size: 1.0625rem; outline: none; }
.tm-search input::placeholder { color: #9a9b8f; }
/* Wide: every chip flows in one wrapping row, each group led by its name. */
.tm-layers { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; }
.tm-group, .tm-chips { display: contents; }
.tm-group-name { padding: 0 0.25rem 0 0.5rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tm-group:first-child .tm-group-name { padding-left: 0; }
.tm-chip { display: inline-flex; align-items: center; gap: 0.35rem; min-height: 2.25rem; padding: 0 0.625rem 0 0.5rem; border: 1px solid var(--dz-line); border-radius: 999px; background: rgba(14, 16, 15, 0.55); color: var(--dz-muted); font: inherit; font-size: 0.875rem; white-space: nowrap; cursor: pointer; }
.tm-chip svg { width: 1rem; height: 1rem; }
.tm-chip .dmz-mono { font-size: 0.7rem; opacity: 0.8; }
.tm-chip:hover { border-color: var(--dz-line-strong); color: var(--dz-ink); }
.tm-chip[aria-pressed='true'] { color: var(--dz-ink); border-color: var(--dz-line-strong); background: rgba(233, 230, 214, 0.14); }
.tm-chip[aria-pressed='true'] svg { color: var(--tm-c, var(--dz-ink)); }
.tm-chip[aria-pressed='false'] { text-decoration: line-through; text-decoration-color: rgba(184, 185, 172, 0.5); }
.tm-reset { min-height: 2.25rem; margin-left: 0.25rem; padding: 0 0.25rem; border: 0; background: none; color: var(--dz-muted); font: inherit; font-size: 0.85rem; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
.tm-chip--poi, .tm-chip--fortress, .tm-chip--area { --tm-c: var(--dz-ink); }
.tm-chip--compound { --tm-c: #b9c77e; }
.tm-chip--police { --tm-c: #93bdf0; }
.tm-chip--clinic { --tm-c: #a9d98a; }
.tm-chip--fire { --tm-c: #f08b6c; }
.tm-chip--gas { --tm-c: #d8c47c; }
.tm-chip--marine-gas { --tm-c: #8fd3e3; }
.tm-chip--ammo { --tm-c: #cdbb98; }
.tm-chip--uav { --tm-c: #9fd8cf; }
.tm-chip--lt-tower { --tm-c: #e8a04f; }
.tm-chip--level i { flex: none; width: 0.7rem; height: 0.7rem; border-radius: 2px; background: var(--tm-t); }
.tm-chip--level[aria-pressed='false'] i { background: transparent; box-shadow: inset 0 0 0 2px var(--tm-t); }
.tm-chip--key-room, .tm-chip--boss, .tm-chip--exfil, .tm-chip--sam, .tm-chip--mission-exit, .tm-chip--bounty, .tm-chip--station, .tm-chip--landmark { --tm-c: var(--tm-report); }

/* Workspace */
.tm-work { display: grid; grid-template-columns: minmax(0, 1fr) 21rem; gap: 1rem; align-items: start; }
.tm--expanded .tm-work { grid-template-columns: minmax(0, 1fr); }
.tm-stage { min-width: 0; }
.tm-frame { position: relative; isolation: isolate; overflow: hidden; border: 1px solid var(--dz-line-strong); border-radius: 18px; background: #0b0d0c; }
.tm-canvas { width: 100%; height: clamp(26rem, 72svh, 42rem); background: #0b0d0c; outline: none; }
.tm--expanded .tm-canvas { height: 86svh; }
.tm-canvas:focus-visible { box-shadow: inset 0 0 0 2px var(--dz-ink); }
.tm-controls { position: absolute; z-index: 800; top: 0.75rem; right: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.tm-controls button { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border: 1px solid var(--dz-line-strong); border-radius: 10px; background: rgba(11, 13, 12, 0.82); color: var(--dz-ink); font: inherit; font-size: 1.375rem; line-height: 1; cursor: pointer; }
.tm-controls button svg { width: 1.25rem; height: 1.25rem; }
.tm-controls button:hover:not(:disabled) { background: rgba(40, 46, 44, 0.92); }
.tm-controls button:disabled { opacity: 0.4; cursor: default; }
.tm-controls button[aria-pressed='true'] { border-color: var(--dz-teal); color: var(--dz-teal); }
.tm-hud { position: absolute; z-index: 800; top: 0.75rem; left: 0.75rem; display: flex; align-items: center; gap: 0.375rem; pointer-events: none; }
.tm-view { display: inline-flex; gap: 2px; padding: 3px; border: 1px solid var(--dz-line-strong); border-radius: 11px; background: rgba(11, 13, 12, 0.88); pointer-events: auto; }
.tm-view button { min-height: 2.5rem; padding: 0 0.875rem; border: 0; border-radius: 8px; background: none; color: var(--dz-muted); font: inherit; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.tm-view button:hover { color: var(--dz-ink); }
.tm-view button[aria-pressed='true'] { background: var(--dz-ink); color: var(--dz-bg); }
.tm-cursor { padding: 0.3rem 0.6rem; border: 1px solid var(--dz-line); background: rgba(11, 13, 12, 0.8); color: var(--dz-teal); font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; }
.tm-bar { display: none; }
.tm-loading { position: absolute; z-index: 700; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 0.5rem 0.875rem; background: rgba(11, 13, 12, 0.85); border: 1px solid var(--dz-line); font-size: 0.75rem !important; letter-spacing: 0.1em; text-transform: uppercase; }
.tm-error { position: absolute; inset: 0; z-index: 900; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.625rem; padding: 2rem; background: #111413; text-align: center; }
.tm-error span { color: var(--dz-muted); }
.tm-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1.25rem; margin-top: 0.625rem; color: var(--dz-muted); font-size: 0.85rem; }
.tm-legend-threat { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.75rem; }
.tm-legend-threat .dmz-mono { font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tm-legend-threat i { display: inline-block; width: 0.6rem; height: 0.6rem; margin-right: 0.35rem; transform: rotate(45deg); border: 2px solid var(--tm-t); }
.tm-legend-report { display: inline-flex; align-items: center; gap: 0.4rem; }
.tm-legend-badge { display: inline-grid; place-items: center; min-width: 1.25rem; height: 1.1rem; padding: 0 0.3rem; border-radius: 4px; background: var(--tm-report); color: #15120a; font: 700 0.7rem/1 system-ui, sans-serif; }
.tm-legend-edge, .tm-legend-none { display: inline-flex; align-items: center; gap: 0.45rem; }
.tm-legend-edge i, .tm-legend-none i { display: inline-block; width: 1.4rem; height: 0.8rem; border-radius: 3px; }
.tm-legend-edge i { border: 2px dashed var(--tm-extreme); }
.tm-legend-none i { border: 1px solid var(--dz-line-strong); background: repeating-linear-gradient(135deg, transparent 0 3px, rgba(233, 230, 214, 0.12) 3px 4px); }
.tm-legend-note { margin-top: 0.25rem !important; max-width: 48rem !important; font-size: 0.85rem !important; color: var(--dz-muted) !important; }
.tm-wheel { display: inline-flex; align-items: center; gap: 0.4rem; min-height: 2.5rem; margin-left: auto; cursor: pointer; }
.tm-wheel input { width: 1rem; height: 1rem; accent-color: var(--dz-teal); }

/* Panel */
.tm-panel { min-width: 0; max-height: calc(clamp(26rem, 72svh, 42rem) + 3rem); overflow: auto; border: 1px solid var(--dz-line); border-radius: 18px; background: rgba(20, 24, 23, 0.82); scrollbar-width: thin; scrollbar-color: var(--dz-line-strong) transparent; }
.tm--expanded .tm-panel { max-height: none; }
.tm-card { display: grid; gap: 0.625rem; padding: 1rem 1.125rem 1.125rem; border-bottom: 1px solid var(--dz-line-strong); background: rgba(28, 33, 31, 0.92); }
.tm-card-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.tm-card-head .dmz-label { margin: 0; }
.tm-card h3 { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; outline: none; }
.tm-card h3:focus-visible { text-decoration: underline; text-decoration-color: var(--dz-teal); text-underline-offset: 0.2em; }
.tm-meta { display: flex; flex-wrap: wrap; gap: 0.375rem; font-size: 0.75rem !important; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted) !important; }
.tm-meta > span { padding: 0.15rem 0.5rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; }
.tm-threat { color: var(--tm-t) !important; border-color: currentColor !important; }
.tm-line, .tm-desc, .tm-hint { font-size: 0.975rem !important; color: #dcd9cb !important; }
.tm-hint { font-size: 0.875rem !important; color: var(--dz-muted) !important; }
.tm-link { padding: 0; border: 0; background: none; color: var(--dz-ink); font: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
.tm-block { display: grid; gap: 0.5rem; padding-top: 0.625rem; border-top: 1px solid var(--dz-line); }
.tm-block h4 { margin: 0; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tm-parts { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.125rem; }
.tm-parts li { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; min-height: 2.25rem; padding: 0.3rem 0.5rem; background: rgba(10, 12, 11, 0.35); border-left: 2px solid var(--tm-t, var(--dz-line-strong)); font-size: 0.925rem !important; }
.tm-parts .tm-link { font-weight: 500; text-align: left; }
.tm-parts small { display: block; font-size: 0.65rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.tm-parts li:has([data-threat='low']) { --tm-t: var(--tm-low); } .tm-parts li:has([data-threat='medium']) { --tm-t: var(--tm-medium); } .tm-parts li:has([data-threat='high']) { --tm-t: var(--tm-high); } .tm-parts li:has([data-threat='critical']) { --tm-t: var(--tm-critical); } .tm-parts li:has([data-threat='extreme']) { --tm-t: var(--tm-extreme); }
.tm-parts .tm-threat { flex: none; font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; }
.tm-nearby { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.tm-nearby button { display: inline-flex; align-items: center; gap: 0.35rem; min-height: 2.25rem; padding: 0 0.6rem 0 0.45rem; border: 1px solid var(--dz-line); border-radius: 8px; background: rgba(10, 12, 11, 0.4); color: var(--dz-ink); font: inherit; font-size: 0.85rem; cursor: pointer; }
.tm-nearby button:hover { border-color: var(--dz-line-strong); }
.tm-nearby svg { width: 0.95rem; height: 0.95rem; color: var(--tm-c, var(--dz-ink)); }
.tm-nearby .dmz-mono { font-size: 0.7rem; color: var(--dz-muted); }
.tm-reports { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.tm-reports li { display: grid; gap: 0.3rem; padding: 0.625rem 0.75rem; background: rgba(10, 12, 11, 0.4); border: 1px solid var(--dz-line); border-left: 2px solid var(--tm-report); border-radius: 0 10px 10px 0; font-size: 0.925rem !important; }
.tm-reports li.is-focus { border-color: var(--tm-report); box-shadow: 0 0 0 1px var(--tm-report); }
.tm-reports strong { color: #f7f5ea; font-size: 1rem; }
.tm-report-head { display: flex; align-items: center; gap: 0.4rem; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tm-report); }
.tm-report-head svg { width: 1rem; height: 1rem; }
.tm-badge-conf { margin-left: auto; padding: 0.1rem 0.45rem; border: 1px solid currentColor; border-radius: 999px; font-weight: 700; }
.tm-badge-conf.is-official { color: var(--dz-accent); }
.tm-badge-conf.is-confirmed { color: var(--dz-green); }
.tm-badge-conf.is-reported { color: var(--dz-teal); border-style: dashed; }
.tm-note { color: #e7dcc2 !important; font-size: 0.875rem !important; }
.tm-src { font-size: 0.825rem !important; color: var(--dz-muted) !important; overflow-wrap: anywhere; }
.tm-src .dmz-mono { font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; }
.tm-src a, .tm-intel a, .tm-intel-link, .tm-credits a { color: var(--dz-ink); text-underline-offset: 0.2em; }
.tm-intel-link { justify-self: start; font-size: 0.875rem; }
.tm-intel { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
.tm-intel li { display: flex; justify-content: space-between; align-items: baseline; gap: 0.75rem; font-size: 0.925rem !important; }
.tm-intel .dmz-mono { flex: none; font-size: 0.65rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.tm-text { justify-self: start; min-height: 2.25rem; padding: 0 0.125rem; border: 0; background: none; color: var(--dz-ink); font: inherit; font-size: 0.875rem; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
.tm-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; padding-top: 0.25rem; }
.tm-action { min-height: 2.5rem; padding: 0 1rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-ink); font: inherit; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
.tm-action:hover { background: rgba(233, 230, 214, 0.1); }
.tm-copied { font-size: 0.85rem; color: var(--dz-green); }
.tm-results-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.875rem 1.125rem 0.375rem; }
.tm-results-head h3 { margin: 0; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tm-results-head span { font-size: 0.75rem; color: var(--dz-muted); }
.tm-empty { padding: 0.25rem 1.125rem 1rem; color: var(--dz-muted) !important; font-size: 0.925rem !important; }
.tm-list { list-style: none; margin: 0; padding: 0 0.5rem 0.5rem; }
.tm-list button { display: flex; align-items: center; gap: 0.625rem; width: 100%; min-height: 3.25rem; padding: 0.45rem 0.625rem; border: 1px solid transparent; border-radius: 10px; background: none; color: var(--dz-ink); font: inherit; font-size: 0.975rem; line-height: 1.25; text-align: left; cursor: pointer; }
.tm-list button:hover { background: rgba(233, 230, 214, 0.07); }
.tm-list button[aria-pressed='true'] { border-color: var(--dz-line-strong); background: rgba(233, 230, 214, 0.12); }
.tm-list small { display: block; margin-top: 0.15rem; font-size: 0.8rem; color: var(--dz-muted); }
.tm-list-text { min-width: 0; }
.tm-list-glyph { display: grid; place-items: center; flex: none; width: 2rem; height: 2rem; border: 1px solid var(--dz-line); border-radius: 8px; background: rgba(10, 12, 11, 0.5); color: var(--tm-t, var(--tm-c, var(--dz-ink))); }
.tm-list-glyph svg { width: 1.05rem; height: 1.05rem; }
.tm-tier h4 { margin: 0.5rem 1.125rem 0.125rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tm-t); }
.tm-tier .tm-list { padding-bottom: 0.25rem; }

.tm-credits { margin-top: 0.875rem; color: var(--dz-muted); font-size: 0.875rem; }
.tm-credits summary { min-height: 2.25rem; cursor: pointer; }
.tm-credits ul { margin: 0.25rem 0 0.5rem; padding-left: 1.1rem; display: grid; gap: 0.3rem; }
.tm-credits p { max-width: 46rem; font-size: 0.875rem !important; color: var(--dz-muted) !important; }
.tm :is(button, input, a, summary):focus-visible { outline: 2px solid var(--dz-ink); outline-offset: 2px; }

/* Leaflet content */
.tm :deep(.leaflet-container) { background: #0b0d0c; font: inherit; }
.tm :deep(.leaflet-image-layer) { max-width: none !important; max-height: none !important; margin: 0 !important; border-radius: 0 !important; cursor: grab; }
.tm :deep(.tm-grid-line) { stroke: rgba(159, 216, 207, 0.32); }
.tm :deep(.tm-grid-label) { display: grid; place-items: center; color: var(--dz-teal); font: 700 12px/1 ui-monospace, 'SFMono-Regular', Menlo, monospace; text-shadow: 0 1px 2px #000; pointer-events: none; }
.tm :deep(.tm-square) { stroke: var(--dz-accent); fill: var(--dz-accent); }
/* Threat view: the art steps back so the zones read. */
.tm--threat :deep(.leaflet-image-layer) { filter: saturate(0.45) brightness(0.78); }
.tm :deep(.tm-zone) { fill: var(--tm-t); fill-opacity: 0.26; stroke: var(--tm-t); stroke-opacity: 0.85; cursor: pointer; }
.tm :deep(.tm-zone[data-threat='critical']), .tm :deep(.tm-zone[data-threat='extreme']) { fill-opacity: 0.32; }
.tm :deep(.tm-zone:hover) { fill-opacity: 0.42; }
.tm :deep(.tm-zone.is-on) { fill-opacity: 0.42; stroke: #f7f5ea; stroke-opacity: 1; stroke-width: 2.5; }
.tm :deep(.tm-zone-edge) { stroke: var(--tm-t); stroke-opacity: 1; filter: drop-shadow(0 0 2px #000); }
.tm :deep(.tm-zone-tip b) { display: block; font-weight: 700; }
.tm :deep(.tm-zone-tip small) { display: block; width: max-content; max-width: 17rem; white-space: normal; font-size: 12px; color: var(--dz-muted); }
.tm :deep(.tm-level) { display: inline-block; margin-left: 5px; padding: 0 4px; border-radius: 3px; background: var(--tm-t); color: #15120a; font: normal 800 9.5px/14px system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; text-shadow: none; vertical-align: 1px; }
.tm :deep(.tm-level.is-inside) { background: rgba(11, 13, 12, 0.9); color: var(--tm-t); outline: 1.5px dashed var(--tm-t); outline-offset: -1.5px; }
.tm :deep(.tm-marker) { background: none; border: 0; outline: none; }
.tm :deep(.tm-pin) { position: relative; display: grid; place-items: center; width: 22px; height: 22px; color: var(--tm-c, var(--dz-ink)); }
.tm :deep(.tm-glyph) { display: grid; place-items: center; width: 20px; height: 20px; border: 1.5px solid currentColor; border-radius: 50%; background: rgba(11, 13, 12, 0.88); box-shadow: 0 1px 4px #000c; }
.tm :deep(.tm-glyph svg) { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.tm :deep(.tm-label) { position: absolute; left: calc(100% + 3px); top: 50%; transform: translateY(-50%); padding: 1px 5px; white-space: nowrap; background: rgba(11, 13, 12, 0.72); color: #e9e6d6; font-size: 11.5px; font-weight: 600; line-height: 1.3; text-shadow: 0 1px 2px #000; pointer-events: auto; }
.tm :deep(.tm-pin--poi) { color: var(--tm-t, var(--dz-ink)); }
.tm :deep(.tm-pin--poi .tm-glyph) { width: 13px; height: 13px; border-width: 2px; border-radius: 1px; transform: rotate(45deg); }
.tm :deep(.tm-pin--poi[data-threat='extreme'] .tm-glyph) { background: var(--tm-extreme); }
.tm :deep(.tm-pin--poi .tm-label) { left: 50%; top: calc(100% + 1px); transform: translateX(-50%); padding: 1px 6px; border-bottom: 2px solid currentColor; background: rgba(11, 13, 12, 0.8); color: #f7f5ea; font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-variation-settings: 'wdth' 75; }
.tm :deep(.tm-pin--fortress) { color: var(--tm-t, var(--dz-ink)); }
.tm :deep(.tm-pin--fortress .tm-glyph) { border-radius: 5px; }
.tm :deep(.tm-pin--fortress.is-twin .tm-glyph) { width: 17px; height: 17px; }
.tm :deep(.tm-pin--compound) { color: #b9c77e; }
.tm :deep(.tm-pin--compound .tm-glyph) { width: 18px; height: 18px; border-radius: 3px; font-size: 11px; font-weight: 800; line-height: 1; }
.tm :deep(.tm-pin--area .tm-glyph) { width: 7px; height: 7px; border: 0; background: #e9e6d6; }
.tm :deep(.tm-pin--area .tm-label) { background: rgba(11, 13, 12, 0.55); font-weight: 500; font-size: 11px; color: #d6d3c4; }
.tm :deep(.tm-pin--police) { color: #93bdf0; } .tm :deep(.tm-pin--clinic) { color: #a9d98a; } .tm :deep(.tm-pin--fire) { color: #f08b6c; } .tm :deep(.tm-pin--gas) { color: #d8c47c; }
.tm :deep(.tm-pin--marine-gas) { color: #8fd3e3; } .tm :deep(.tm-pin--ammo) { color: #cdbb98; } .tm :deep(.tm-pin--uav) { color: #9fd8cf; } .tm :deep(.tm-pin--lt-tower) { color: #e8a04f; }
.tm :deep(.tm-pin--report) { color: var(--tm-report); }
.tm :deep(.tm-pin--report .tm-glyph) { border-style: dashed; }
.tm :deep(.tm-badge) { position: absolute; left: calc(100% - 6px); bottom: calc(100% - 8px); display: inline-flex; align-items: center; gap: 1px; height: 16px; padding: 0 4px 0 3px; border-radius: 4px; background: var(--tm-report); color: #15120a; box-shadow: 0 1px 3px #000a; pointer-events: auto; }
.tm :deep(.tm-badge svg) { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.tm :deep(.tm-badge b) { margin-left: 2px; font: 800 10.5px/1 system-ui, sans-serif; }
.tm :deep(.tm-pin.is-on .tm-glyph) { box-shadow: 0 0 0 2px #0b0d0c, 0 0 0 4px #f7f5ea, 0 0 14px rgba(247, 245, 234, 0.55); }
.tm :deep(.tm-pin.is-on .tm-label) { background: #f7f5ea; color: #0b0d0c; text-shadow: none; }
.tm :deep(.tm-pin.is-dim) { opacity: 0.28; }
.tm :deep(.tm-marker:focus-visible .tm-glyph) { outline: 2px solid #fff; outline-offset: 3px; }
.tm :deep(.tm-tip) { padding: 0.3rem 0.55rem; border: 1px solid var(--dz-line-strong); border-radius: 6px; background: rgba(11, 13, 12, 0.94); box-shadow: 0 2px 6px #0007; color: var(--dz-ink); font-size: 12.5px; font-weight: 500; line-height: 1.4; white-space: nowrap; }
.tm :deep(.tm-tip::before) { display: none; }
/* Zoomed out, only major locations keep their names, services shrink to dots
   and badges to a count. A fortress that shares its location's name hides. */
.tm :deep([data-detail='far'] .tm-pin--area .tm-label), .tm :deep([data-detail='far'] .tm-pin--compound .tm-label), .tm :deep([data-detail='far'] .tm-pin--fortress .tm-label) { display: none; }
.tm :deep([data-detail='far'] .tm-pin:not(.tm-pin--poi, .tm-pin--compound, .tm-pin--area, .tm-pin--fortress, .tm-pin--report) .tm-glyph) { width: 9px; height: 9px; border: 0; background: currentColor; box-shadow: 0 0 0 1.5px #0b0d0c; }
.tm :deep([data-detail='far'] .tm-pin:not(.tm-pin--poi, .tm-pin--compound, .tm-pin--area, .tm-pin--fortress, .tm-pin--report) .tm-glyph svg) { display: none; }
.tm :deep([data-detail='far'] .tm-badge svg) { display: none; }
.tm :deep([data-detail='far'] .tm-badge) { height: 14px; padding: 0 3px; }
.tm :deep([data-detail='far'] .tm-badge b) { margin: 0; font-size: 9.5px; }
.tm :deep([data-detail='far'] .tm-pin--poi .tm-label) { font-size: 11px; padding: 0 4px; }
.tm :deep([data-detail='far'] .tm-marker:has(> .is-twin:not(.is-on))) { visibility: hidden; }
.tm :deep([data-detail='mid'] .tm-pin--area .tm-label) { display: none; }
.tm :deep([data-detail] .tm-pin.is-on .tm-label) { display: block; }

/* Narrow: the panel moves under the map and a bar names the selection. */
@container (max-width: 46rem) {
  .tm-work { grid-template-columns: minmax(0, 1fr); }
  .tm-panel { max-height: none; scroll-margin-top: 1rem; }
  .tm-list { max-height: 24rem; overflow: auto; }
  .tm-canvas { height: clamp(22rem, 62svh, 34rem); }
  .tm-layers { display: grid; gap: 0.25rem; }
  .tm-layers:not(.is-open) { display: none; }
  .tm-layers-toggle { flex: none; display: inline-flex; align-items: center; gap: 0.4rem; min-height: 3rem; padding: 0 1rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); color: var(--dz-ink); font: inherit; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
  .tm-layers-toggle svg { width: 1.1rem; height: 1.1rem; }
  .tm-layers-toggle .dmz-mono { font-size: 0.7rem; color: var(--dz-teal); }
  .tm-layers-toggle[aria-expanded='true'] { border-color: var(--dz-ink); background: rgba(233, 230, 214, 0.12); }
  .tm-search { padding: 0 0.875rem; }
  .tm-search input { font-size: 1rem; }
  .tm-group { display: grid; gap: 0.25rem; min-width: 0; }
  .tm-group-name, .tm-group:first-child .tm-group-name { padding: 0; }
  .tm-chips { display: flex; gap: 0.375rem; overflow-x: auto; padding-bottom: 0.25rem; scrollbar-width: thin; }
  .tm-reset { justify-self: start; margin: 0; }
  .tm-chip { flex: none; }
  .tm-bar { position: absolute; z-index: 800; left: 0.625rem; right: 4rem; bottom: 0.625rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.375rem 0.375rem 0.625rem; border: 1px solid var(--dz-line-strong); border-radius: 12px; background: rgba(11, 13, 12, 0.9); }
  .tm-bar-glyph { display: grid; place-items: center; color: var(--tm-t, var(--dz-ink)); }
  .tm-bar-glyph svg { width: 1.1rem; height: 1.1rem; }
  .tm-bar-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; font-variation-settings: 'wdth' 75; }
  .tm-bar-name small { margin-left: 0.5rem; color: var(--dz-teal); font-size: 0.75rem; }
  .tm-bar-more { flex: none; min-height: 2.5rem; padding: 0 0.875rem; border: 0; border-radius: 9px; background: var(--dz-ink); color: var(--dz-bg); font: inherit; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
  .tm-legend { font-size: 0.8rem; }
  /* Zoomed out on a narrow map, the zone colour carries the level; only "+ Extreme" stays. */
  .tm :deep([data-detail='far'] .tm-level:not(.is-inside)) { display: none; }
  .tm-wheel { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) { .tm :deep(*) { transition: none !important; animation: none !important; } }
</style>
