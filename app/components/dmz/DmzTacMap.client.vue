<script setup lang="ts">
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { hajinMap, hajinLayers, hajinLayer, hajinPins, hajinReports, hajinRoutes, hajinThreatParts, hajinThreatSeeds, threatLevels, toArt, squareOf, squareCentre, HAJIN_MAP_CHECKED, MAP_SECTIONS, QUICK_FINDS, resolvePinId } from '#shared/dmz-map.mjs'
import { siteLabel, reportArea, tierCounts, pxPerUnit, groupSites, fanOffsets, searchMap, listGroups, readPrefs, prefsToSave, TACMAP_PREFS } from '#shared/dmz-map-view.mjs'
import { keyOfReport } from '#shared/dmz-keys.mjs'
import { zoneField, traceRegions } from '#shared/dmz-zones.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { GLYPHS, svg, layerColor } from './tacmap/glyphs'

// The Hajin Tac-Map. Official markers sit where Activision's map puts them.
// Every reported site is drawn at its own derived spot as a tag: solid when it
// is in a building the official map marks, dashed when the spot is rough or
// stands for a whole place. Sites that would overlap join a gold chip that
// spreads into a fan. ?pin= selects a place, service, report or route;
// ?layer= shows one layer for the visit; ?view=threat swaps the markers for
// approximate threat zones; #full is the full-screen map.
interface Pin { id: string, layer: string, name: string, at: [number, number], square: string, threat?: string, parts?: [string, string][], parent?: string, desc?: string, same?: string, near?: string, reports?: string[], intel?: string[] }
interface Report { id: string, type: string, name: string, anchor: string | null, where: string, squares?: string[], threat?: string, note?: string, confidence: string, sources: string[], intel?: string, at: [number, number], precision: string, tier: string, from?: string, top: string, square: string, moves?: boolean, squaresDisagree?: boolean }
interface RouteStop { n: number, at: [number, number], square: string, place: string, dir?: string }
interface MapRoute { id: string, name: string, summary: string, confidence: string, sources: string[], stops: RouteStop[], path: [number, number][], squares: string[] }
interface ThreatPart { id: string, name: string, level: string, poi: string, pin: string | null, at: [number, number] | null, hotter?: boolean }
interface Seed { at: [number, number], reach: number, part: string | null, poi: string | null, level: string | null }
interface Zone { poi: string, level: string, rings: [number, number][][], parts: ThreatPart[] }
interface Group { key: string, top: string, anchor: [number, number], anchorPin?: string, members: string[] }
type Row = { kind: 'pin', id: string, pin: Pin } | { kind: 'report', id: string, report: Report } | { kind: 'route', id: string, route: MapRoute }

const pins = hajinPins as Pin[]
const reports = hajinReports as Report[]
const routes = hajinRoutes as MapRoute[]
const pinIndex = new Map(pins.map(pin => [pin.id, pin]))
const reportIndex = new Map(reports.map(report => [report.id, report]))
const routeIndex = new Map(routes.map(item => [item.id, item]))
const PLACES = ['poi', 'fortress', 'area', 'compound']
const W = hajinMap.width, H = hajinMap.height
const threatParts = hajinThreatParts as ThreatPart[]
const threatSeeds = hajinThreatSeeds as Seed[]
const threatPlaces = new Set([...pins.filter(pin => pin.layer === 'poi').map(pin => pin.id), ...threatParts.flatMap(part => part.pin ? [part.pin] : [])])
const levelOf = (id: string) => threatParts.find(part => part.pin === id)?.level
const hotterIn = (poi: string) => threatParts.filter(part => part.poi === poi && part.hotter)
const allLayerIds = hajinLayers.map(layer => layer.id)
const isReportedLayer = (id: string) => hajinLayer(id)?.group === 'Reported'
const threatClass = (level?: string) => level ? level.toLowerCase() : undefined
const placeName = (id?: string) => (id && pinIndex.get(id)?.name) || ''
const reportLabel = (type: string) => hajinLayer(type)?.one || type
const tiers = tierCounts()
const majors = pins.filter(pin => pin.layer === 'poi')

const route = useRoute()
const router = useRouter()
const { state: keyState } = useDmzKeys()
const marks = computed(() => keyState.value.marks)
const markOf = (report: Report) => { const key = keyOfReport(report.id); return key ? marks.value[key.id] : undefined }

// Layers: the reader's saved choice, plus layers a link showed for this visit only.
const defaults = hajinLayers.filter(layer => layer.on).map(layer => layer.id)
const enabled = ref<string[]>([...defaults])
const visitLayers = ref<string[]>([])
const visit = computed(() => visitLayers.value.filter(id => !enabled.value.includes(id)))
const shown = computed(() => allLayerIds.filter(id => enabled.value.includes(id) || visit.value.includes(id)))
const levelsOn = ref<string[]>([...threatLevels])
const collapsed = ref<string[]>(MAP_SECTIONS.filter(section => !section.open).map(section => section.id))
const hideUsed = ref(false)
const showGrid = ref(true)
const wheelZoom = ref(true)
const view = computed(() => route.query.view === 'threat' ? 'threat' : 'map')
const linkedLayer = computed(() => hajinLayer(String(route.query.layer || '')) ? String(route.query.layer) : '')

// Kept in memory only: the quick find, a layer listed from the panel, the
// group listed from a chip, the open fan, the search and the list order.
const focus = ref('')
const listLayer = ref('')
const panelGroup = ref<Group | null>(null)
const fanMember = ref('')
const query = ref('')
const listBy = ref<'place' | 'square'>('place')
const hot = ref('')
const layersOpen = ref(false)
const full = ref(false)
const sheet = ref<'peek' | 'full'>('peek')
const narrow = ref(false)
const touch = ref(false)
const inSheet = computed(() => full.value && narrow.value)
const inlineTouch = computed(() => touch.value && narrow.value && !full.value)

const ready = ref(false)
const imageLoading = ref(true)
const imageError = ref(false)
const mapError = ref(false)
const atMin = ref(false)
const atMax = ref(false)
const cursor = ref('')
const copyMessage = ref('')
const announcement = ref('')
const activeStop = ref(0)
const rootRef = ref<HTMLElement>()
const canvasRef = ref<HTMLElement>()
const panelRef = ref<HTMLElement>()
const cardRef = ref<{ focus: () => void }>()
const layersRef = ref<{ focus: () => void }>()
const layersButtonRef = ref<HTMLButtonElement>()
const fullButtonRef = ref<HTMLButtonElement>()
const closeFullRef = ref<HTMLButtonElement>()
const searchRef = ref<HTMLInputElement>()
const hudLayersRef = ref<HTMLButtonElement>()
const { open: spotlightOpen } = useSpotlight()

// Selection: a pin, report or route id. Old ids from renamed reports still resolve.
const selectedId = computed(() => resolvePinId(String(route.query.pin || '')))
const selectedPin = computed(() => { const pin = pinIndex.get(selectedId.value); return pin?.same ? pinIndex.get(pin.same) : pin })
const selectedReport = computed(() => reportIndex.get(selectedId.value))
const selectedRoute = computed(() => routeIndex.get(selectedId.value))
const selected = computed(() => selectedReport.value?.id || selectedPin.value?.id || selectedRoute.value?.id || '')

// Quick finds show only their reported layers for the moment; saved layers stay as they are.
const heldCount = computed(() => Object.values(marks.value).filter(mark => mark === 'held').length)
const quickFinds = computed(() => QUICK_FINDS.filter(find => !find.held || heldCount.value).map(find => ({ ...find, count: reports.filter(report => find.layers.includes(report.type) && (!find.held || markOf(report) === 'held') && !(hideUsed.value && markOf(report) === 'used')).length })))
const focusFind = computed(() => QUICK_FINDS.find(find => find.id === focus.value))
const inFocus = (report: Report) => { const find = focusFind.value; return !find || (find.layers.includes(report.type) && (!find.held || markOf(report) === 'held')) }
const reportShown = (report: Report) => (focusFind.value ? inFocus(report) : shown.value.includes(report.type)) && !(hideUsed.value && markOf(report) === 'used')
const visibleReports = computed(() => view.value === 'threat' ? reports.filter(report => report.id === selected.value) : reports.filter(report => reportShown(report) || report.id === selected.value))

// Search: a square lists what sources put there and the places in it; words match in any order.
const search = computed(() => searchMap(query.value, { held: marks.value }) as any)
const searching = computed(() => !!query.value.trim())
const matchIds = computed(() => {
  if (!searching.value) return null
  const found = search.value
  return new Set<string>(found.square ? [...found.sourced, ...found.placeIn, ...found.pins, ...found.routes].map((item: { id: string }) => item.id) : found.items.map((item: { id: string }) => item.id))
})
const layerCount = (id: string) => id === 'route' ? routes.length : isReportedLayer(id) ? reports.filter(report => report.type === id).length : pins.filter(pin => pin.layer === id).length
const counts = Object.fromEntries(allLayerIds.map(id => [id, layerCount(id)]))
const levelCounts = Object.fromEntries(threatLevels.map(level => [level, threatParts.filter(part => part.level === level).length]))

// The panel lists one of: a chip's group, search results, a quick find, a layer, or the default list.
const listedLayer = computed(() => listLayer.value || linkedLayer.value)
const listMode = computed(() => panelGroup.value ? 'group' : searching.value ? 'search' : focus.value ? 'focus' : listedLayer.value ? 'layer' : 'default')
const listItems = computed<(Report | Pin)[]>(() => {
  if (listMode.value === 'group') return panelGroup.value!.members.map(id => reportIndex.get(id)!).filter(Boolean)
  if (listMode.value === 'focus') return reports.filter(report => inFocus(report) && !(hideUsed.value && markOf(report) === 'used'))
  if (listMode.value === 'layer') {
    const id = listedLayer.value
    return isReportedLayer(id) ? reports.filter(report => report.type === id && !(hideUsed.value && markOf(report) === 'used')) : pins.filter(pin => pin.layer === id && !pin.same)
  }
  return []
})
const listGroupsShown = computed(() => listGroups(listItems.value, listBy.value) as { id: string, pin?: string, name: string, square?: string, threat?: string, items: (Report | Pin)[] }[])
const listTitle = computed(() => {
  if (listMode.value === 'group') return `At ${placeName(panelGroup.value!.anchorPin) || placeName(panelGroup.value!.top) || 'this spot'}`
  if (listMode.value === 'focus') return focusFind.value!.id === 'mine' ? 'My keys' : focusFind.value!.label
  if (listMode.value === 'layer') return hajinLayer(listedLayer.value)!.label
  return ''
})
const showsKeys = computed(() => (listMode.value === 'focus' && ['keys', 'mine'].includes(focus.value)) || (listMode.value === 'layer' && listedLayer.value === 'key-room'))
const searchRows = computed<Row[]>(() => {
  const found = search.value
  if (found.square) return []
  return found.items.slice(0, 80).map((item: any) => item.kind === 'pin' ? { kind: 'pin', id: item.id, pin: item.item } : item.kind === 'route' ? { kind: 'route', id: item.id, route: item.item } : { kind: 'report', id: item.id, report: item.item })
})
const squareBlocks = computed(() => {
  const found = search.value
  return found.square ? [{ title: `Sources say ${found.square}`, items: found.sourced as Report[] }, { title: `Place is in ${found.square}`, items: found.placeIn as Report[] }].filter(block => block.items.length) : []
})
const threatGroups = computed(() => [...threatLevels].reverse().filter(level => levelsOn.value.includes(level))
  .map(level => ({ level, parts: threatParts.filter(part => part.level === level) })).filter(group => group.parts.length))
const isReport = (item: Report | Pin): item is Report => 'tier' in item
const rowSub = (report: Report) => [siteLabel(report), report.squares?.length ? report.squares.join(' / ') : '', intelConfidenceLabel(report.confidence)].filter(Boolean).join(' · ')
const pinSub = (pin: Pin) => PLACES.includes(pin.layer) ? `${hajinLayer(pin.layer)!.one} · ${pin.square}${pin.threat ? ` · ${pin.threat}` : ''}` : `Near ${placeName(pin.near)} · ${pin.square}`
const pinTitle = (pin: Pin) => PLACES.includes(pin.layer) ? pin.name : hajinLayer(pin.layer)!.one
const inPlace = (pin: Pin) => reports.filter(report => report.top === pin.id).length

// Leaflet
let map: L.Map | undefined
let overlay: L.ImageOverlay | undefined
let placeLayer: L.LayerGroup | undefined
let siteLayer: L.LayerGroup | undefined
let gridLayer: L.LayerGroup | undefined
let squareLayer: L.LayerGroup | undefined
let areaLayer: L.LayerGroup | undefined
let zoneLayer: L.LayerGroup | undefined
let routeLayer: L.LayerGroup | undefined
let zones: { areas: Zone[], edges: Zone[] } | undefined
let observer: ResizeObserver | undefined
let sizeObserver: ResizeObserver | undefined
let sheetObserver: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
let pointerQuery: MediaQueryList | undefined
let reducedMotion = false
let fitZoom = 0
let frame = 0
let copyTimer: ReturnType<typeof setTimeout> | undefined
let queryTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false
let fromMap = false
let lastWidth = 0
let lastHeight = 0
let groups: Group[] = []
let groupIndex = new Map<string, Group>()
let groupOf = new Map<string, string>()
let groupSignature = ''
// Marker elements by pin, report or group key, for hover highlights without a rebuild.
const elements = new Map<string, HTMLElement>()

const point = (at: [number, number]) => { const [u, v] = toArt(at); return L.latLng(H - v, u) }
const imageBounds = () => L.latLngBounds([0, 0], [H, W])
function squareBounds(square: string) {
  const { cell } = hajinMap.grid
  const [x, y] = squareCentre(square)
  return L.latLngBounds(point([x - cell / 2, y + cell / 2]), point([x + cell / 2, y - cell / 2]))
}
const animate = () => ({ animate: !reducedMotion })
const detail = () => !map ? 'far' : map.getZoom() - fitZoom < 0.6 ? 'far' : map.getZoom() - fitZoom < 1.35 ? 'mid' : 'near'
const radius = () => touch.value ? 42 : 34
// On a full-screen phone map the HUD covers the top and the sheet the bottom;
// framing uses the clear strip between them. A sheet docked at the side covers nothing.
function clearStrip() {
  const box = canvasRef.value!.getBoundingClientRect()
  const top = Math.max(0, ...[...rootRef.value!.querySelectorAll('.tm-hud, .tm-only')].map(element => element.getBoundingClientRect().bottom - box.top))
  const sheetTop = panelRef.value ? panelRef.value.getBoundingClientRect().top - box.top : box.height
  return { box, top, bottom: sheetTop > top + 40 ? Math.min(box.height, sheetTop) : box.height }
}
function framePad(): L.FitBoundsOptions {
  if (!inSheet.value || !canvasRef.value) return { padding: L.point(30, 30) }
  const { box, top, bottom } = clearStrip()
  return { paddingTopLeft: L.point(24, top + 12), paddingBottomRight: L.point(24, Math.max(24, box.height - bottom + 12)) }
}
// setView that centres the spot in the clear strip.
function showAt(at: [number, number], zoom: number) {
  if (!map) return
  if (!inSheet.value || !canvasRef.value) { map.setView(point(at), zoom, animate()); return }
  const { box, top, bottom } = clearStrip()
  map.setView(point(at), zoom, { animate: false })
  map.panBy([0, box.height / 2 - (top + bottom) / 2], animate())
}

function updateZoom() {
  if (!map) return
  atMin.value = map.getZoom() <= map.getMinZoom()
  atMax.value = map.getZoom() >= map.getMaxZoom()
  canvasRef.value?.setAttribute('data-detail', detail())
}
function measure() {
  if (!map) return
  // getBoundsZoom clamps to the current limits, so open them first.
  map.setMinZoom(-8)
  map.setMaxZoom(8)
  fitZoom = map.getBoundsZoom(imageBounds(), false, L.point(16, 16))
  map.setMinZoom(fitZoom - 0.25)
  map.setMaxZoom(fitZoom + 2.75)
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

// The squares a search names or a selected site's sources give, outlined, and
// the ground a rough or somewhere-in site could be on.
function renderAreas() {
  squareLayer?.clearLayers()
  areaLayer?.clearLayers()
  if (!map) return
  squareLayer ||= L.layerGroup().addTo(map)
  areaLayer ||= L.layerGroup().addTo(map)
  const squares = new Map<string, string>()
  if (search.value.square) squares.set(search.value.square, '')
  const report = selectedReport.value
  if (report) {
    const area = reportArea(report)
    if (area?.circle) L.circle(point(area.circle.at), { radius: area.circle.radius * hajinMap.toArt.scale, pane: 'tmArea', className: 'tm-area', weight: 2, dashArray: '6 6', interactive: false }).addTo(areaLayer)
    const given = report.squares?.length ? report.squares : report.precision === 'square' ? [report.square] : []
    const tag = report.squaresDisagree && given.length > 1 ? `Sources disagree: ${given.join(' / ')}` : report.type === 'key-room' ? `Key card ${given[0]}` : `Sources: ${given[0]}`
    given.forEach((item, index) => squares.set(item, index ? '' : tag))
  }
  for (const [item, tag] of squares) {
    L.rectangle(squareBounds(item), { className: 'tm-square', pane: 'tmGrid', weight: 2, dashArray: '6 5', fillOpacity: 0.1, interactive: false }).addTo(squareLayer)
    if (!tag) continue
    const label = document.createElement('span')
    label.textContent = tag
    const [x, y] = squareCentre(item)
    L.marker(point([x - hajinMap.grid.cell / 2, y - hajinMap.grid.cell / 2]), { interactive: false, keyboard: false, icon: L.divIcon({ html: label, className: 'tm-square-tag', iconSize: [0, 0], iconAnchor: [-4, -4] }) }).addTo(squareLayer)
  }
}
function areaBounds(report: Report) {
  const area = reportArea(report)
  const latlngs: L.LatLng[] = [point(report.at)]
  if (area?.circle) {
    const r = area.circle.radius
    latlngs.push(point([area.circle.at[0] - r, area.circle.at[1] - r]), point([area.circle.at[0] + r, area.circle.at[1] + r]))
  }
  let bounds = L.latLngBounds(latlngs)
  for (const square of area?.squares || []) bounds = bounds.extend(squareBounds(square))
  return bounds
}

// Threat zones, traced the first time the view opens.
function traceZones() {
  const field = zoneField(threatSeeds, 4)
  const areas = [...traceRegions(field, (k: number) => threatSeeds[k]!.level ? `${threatSeeds[k]!.poi}|${threatSeeds[k]!.level}` : null)].map(([key, rings]) => {
    const [poi, level] = (key as string).split('|') as [string, string]
    return { poi, level, rings, parts: threatParts.filter(part => part.poi === poi && part.level === level) }
  })
  const hotPois = new Set(threatParts.filter(part => part.hotter).map(part => part.poi))
  const edges = [...traceRegions(field, (k: number) => hotPois.has(threatSeeds[k]!.poi || '') ? threatSeeds[k]!.poi : null)].flatMap(([poi, rings]) =>
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
  const current = selectedPin.value
  const focusPoi = current ? (current.layer === 'poi' ? current.id : current.parent) : undefined
  const latLngs = (zone: Zone) => zone.rings.map(ring => ring.map(at => point(at)))
  for (const zone of zones.areas) {
    if (!on.has(zone.level)) continue
    const shape = L.polygon(latLngs(zone), { pane: 'tmZones', className: `tm-zone${zone.poi === focusPoi ? ' is-on' : ''}`, weight: 1.5, smoothFactor: 0.5 })
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

// Markers are buttons: Enter and Space pick them, as a click does.
function asButton(marker: L.Marker, id: string, label: string, pressed: boolean | null, activate: () => void) {
  const element = marker.getElement()
  if (!element) return
  element.dataset.pin = id
  element.setAttribute('role', 'button')
  element.setAttribute('aria-label', label)
  if (pressed !== null) element.setAttribute('aria-pressed', String(pressed))
  const onKey = (event: Event) => { if ([' ', 'Enter'].includes((event as KeyboardEvent).key)) { event.preventDefault(); L.DomEvent.stopPropagation(event); activate() } }
  L.DomEvent.on(element, 'keydown', onKey)
  marker.on('remove', () => L.DomEvent.off(element, 'keydown', onKey))
  elements.set(id, element)
}

// Places and services. Place names follow the zoom; in the threat view a place
// carries the level of the part it stands for.
function placeIcon(pin: Pin, selectedHere: boolean, dim: boolean, levels: { level: string, inside?: boolean }[]) {
  const root = document.createElement('span')
  root.className = `tm-pin tm-pin--${pin.layer}${selectedHere ? ' is-on' : ''}${dim ? ' is-dim' : ''}${pin.same ? ' is-twin' : ''}`
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
  return root
}
function renderPlaces() {
  if (!map || !placeLayer) return
  const focused = (document.activeElement as HTMLElement | null)?.dataset?.pin
  placeLayer.clearLayers()
  for (const id of [...elements.keys()]) if (pinIndex.has(id)) elements.delete(id)
  const on = new Set(shown.value)
  const threat = view.value === 'threat'
  const levels = new Set(levelsOn.value)
  const current = selectedPin.value?.id
  const hits = matchIds.value
  const z = { poi: 10000, fortress: 8000, compound: 6000, area: 4000 } as Record<string, number>
  for (const pin of pins) {
    const isSelected = pin.id === current || (!!pin.same && pin.same === current)
    // A quick find hides services; places stay as saved so their names remain.
    const visible = threat ? threatPlaces.has(pin.id) : on.has(pin.layer) && (!focusFind.value || PLACES.includes(pin.layer))
    if (!visible && !isSelected) continue
    const level = threat ? levelOf(pin.id) : undefined
    const tags = threat ? [...(level ? [{ level }] : []), ...[...new Set(hotterIn(pin.id).map(part => part.level))].map(item => ({ level: item, inside: true }))] : []
    const off = threat && !(pin.layer === 'poi' ? threatParts.some(part => part.poi === pin.id && levels.has(part.level)) : !!level && levels.has(level))
    const dim = (!!hits && !hits.has(pin.id) && !(pin.same && hits.has(pin.same))) || off
    const marker = L.marker(point(pin.at), {
      icon: L.divIcon({ html: placeIcon(pin, isSelected, dim, tags), className: 'tm-marker', iconSize: [22, 22], iconAnchor: [11, 11] }),
      keyboard: true, riseOnHover: true, zIndexOffset: (z[pin.layer] || 0) + (isSelected ? 20000 : 0) + (dim ? -20000 : 0),
    })
    if (!PLACES.includes(pin.layer) || pin.same) {
      const tip = document.createElement('span')
      tip.textContent = pin.same ? `${pin.name} (fortress)` : `${pin.name} · ${pin.square} · near ${placeName(pin.near)}`
      marker.bindTooltip(tip, { direction: 'top', offset: [0, -12], className: 'tm-tip' })
    }
    const activate = () => { fromMap = true; select(pin.same || pin.id) }
    marker.on('click', activate)
    marker.addTo(placeLayer)
    const own = reports.filter(report => report.from === pin.id || report.anchor === pin.id).length
    const label = [pin.same ? `${pin.name} fortress` : pinTitle(pin), PLACES.includes(pin.layer) ? hajinLayer(pin.layer)!.one : '', `square ${pin.square}`, pin.threat ? `${pin.threat} threat` : '', pin.near ? `near ${placeName(pin.near)}` : '', own ? `${own} reported ${own === 1 ? 'site' : 'sites'}` : ''].filter(Boolean).join(', ')
    asButton(marker, pin.id, label, isSelected, activate)
    if (focused === pin.id) elements.get(pin.id)?.focus({ preventScroll: true })
  }
}

// Reported sites. Groups are worked out for the current zoom; one member is
// its own tag, more make a chip, and the open chip spreads into a fan.
function regroup() {
  if (!map) return false
  const sites = visibleReports.value.map(report => ({ id: report.id, at: report.at, top: report.top, tier: report.tier, type: report.type, name: report.name }))
  groups = groupSites(sites, pxPerUnit(map.getZoom()), radius()) as Group[]
  groupIndex = new Map(groups.map(group => [group.key, group]))
  groupOf = new Map(groups.flatMap(group => group.members.map(id => [id, group.key] as [string, string])))
  const signature = groups.map(group => `${group.key}:${group.members.join(',')}`).join('|')
  const changed = signature !== groupSignature
  groupSignature = signature
  return changed
}
const fanKey = () => { const key = groupOf.get(fanMember.value); return key && (groupIndex.get(key)?.members.length || 0) > 1 ? key : '' }
function tagLabel(report: Report) {
  const mark = markOf(report)
  return [report.name, reportLabel(report.type), siteLabel(report), intelConfidenceLabel(report.confidence), mark === 'held' ? 'key held' : mark === 'used' ? 'key used' : ''].filter(Boolean).join(', ')
}
function tagIcon(report: Report, state: { selected: boolean, dim: boolean }) {
  const mark = markOf(report)
  const root = document.createElement('span')
  root.className = `tm-tag is-${report.tier}${state.selected ? ' is-on' : ''}${state.dim ? ' is-dim' : ''}${mark ? ` is-${mark}` : ''}${hot.value === report.id ? ' is-hot' : ''}`
  root.style.setProperty('--tm-c', layerColor(report.type))
  root.innerHTML = `<span class="tm-tag-box">${svg(report.type)}</span>`
  if (state.selected) {
    const label = document.createElement('span')
    label.className = 'tm-label'
    label.textContent = report.name
    root.append(label)
  }
  return root
}
function chipCounts(members: Report[]) {
  const byType = new Map<string, number>()
  for (const report of members) byType.set(report.type, (byType.get(report.type) || 0) + 1)
  return [...byType].map(([type, count]) => `${count} ${count === 1 ? reportLabel(type).toLowerCase() : hajinLayer(type)!.label.toLowerCase()}`).join(', ')
}
const groupName = (group: Group) => placeName(group.anchorPin) || placeName(group.top) || `square ${reportIndex.get(group.members[0]!)?.square}`
function renderSites() {
  if (!map || !siteLayer) return
  const focused = (document.activeElement as HTMLElement | null)?.dataset?.pin
  siteLayer.clearLayers()
  for (const id of [...elements.keys()]) if (!pinIndex.has(id)) elements.delete(id)
  const hits = matchIds.value
  const open = fanKey()
  const order = MAP_SECTIONS.flatMap(section => section.layers)
  const focusLayers = focusFind.value?.layers || []
  for (const group of groups) {
    const members = group.members.map(id => reportIndex.get(id)!)
    if (members.length === 1) {
      const report = members[0]!
      const isSelected = report.id === selected.value
      const dim = !!hits && !hits.has(report.id)
      const marker = L.marker(point(report.at), { icon: L.divIcon({ html: tagIcon(report, { selected: isSelected, dim }), className: 'tm-marker', iconSize: [22, 22], iconAnchor: [11, 11] }), keyboard: true, zIndexOffset: 12000 + (isSelected ? 20000 : 0) + (dim ? -20000 : 0) })
      if (!isSelected) {
        const tip = document.createElement('span')
        tip.textContent = `${report.name} · ${siteLabel(report)}`
        marker.bindTooltip(tip, { direction: 'top', offset: [0, -12], className: 'tm-tip' })
      }
      const activate = () => { fromMap = true; select(report.id) }
      marker.on('click', activate)
      marker.addTo(siteLayer)
      asButton(marker, report.id, tagLabel(report), isSelected, activate)
      continue
    }
    // A chip sits up and right of its place's diamond so the name stays readable, or on the spot itself.
    const isOpen = group.key === open
    const beside = !!group.anchorPin
    const types = [...new Set(members.map(report => report.type))].sort((a, b) => Number(focusLayers.includes(b)) - Number(focusLayers.includes(a)) || order.indexOf(a) - order.indexOf(b))
    const pinned = members.every(report => report.tier === 'pinned')
    const dim = !!hits && !members.some(report => hits.has(report.id))
    const holds = members.some(report => report.id === selected.value || report.id === hot.value)
    const chip = document.createElement('span')
    chip.className = `tm-chip-m${beside ? ' is-beside' : ''}${pinned ? ' is-pinned' : ''}${isOpen ? ' is-open' : ''}${dim ? ' is-dim' : ''}${holds ? ' is-hot' : ''}`
    chip.innerHTML = `<span class="tm-chip-in">${isOpen ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' : `${types.slice(0, 3).map(svg).join('')}<b>${members.length}</b>`}</span>`
    const marker = L.marker(point(group.anchor), { icon: L.divIcon({ html: chip, className: 'tm-marker tm-marker--chip', iconSize: [0, 0], iconAnchor: [0, 0] }), keyboard: true, zIndexOffset: 14000 + (isOpen ? 30000 : 0) + (dim ? -20000 : 0) })
    const name = groupName(group)
    const tip = document.createElement('span')
    tip.textContent = isOpen ? 'Close the fan' : `${members.length} sites at ${name}: ${chipCounts(members)}`
    marker.bindTooltip(tip, { direction: 'top', offset: [beside ? 24 : 0, beside ? -28 : -14], className: 'tm-tip' })
    const activate = () => { fromMap = true; if (isOpen) closeFan(true); else activateGroup(group.key) }
    marker.on('click', activate)
    marker.addTo(siteLayer)
    asButton(marker, group.key, `${name}, ${pinIndex.get(group.anchorPin || '')?.square || squareOf(group.anchor)}: ${members.length} reported sites, ${chipCounts(members)}; ${pinned ? 'all in marked buildings' : 'spots inside not pinned'}. ${isOpen ? 'Press to close the fan.' : 'Press to spread them.'}`, null, activate)
    elements.get(group.key)?.setAttribute('aria-expanded', String(isOpen))
    if (isOpen) renderFan(group, members)
  }
  fadeAround(open ? groupIndex.get(open)!.anchor : null)
  if (focused && !pinIndex.has(focused)) elements.get(focused)?.focus({ preventScroll: true })
}
// The fan: members on rings around the group's spot, each with a leg to its own spot.
function renderFan(group: Group, members: Report[]) {
  if (!map || !siteLayer) return
  const anchor = map.latLngToLayerPoint(point(group.anchor))
  const place = group.anchorPin ? pinIndex.get(group.anchorPin) : undefined
  const gap = place?.layer === 'poi' ? 180 : place ? 90 : 180
  const slots = fanOffsets(members.length, { touch: touch.value, gap })
  if (!place || !shown.value.includes(place.layer)) L.circleMarker(point(group.anchor), { radius: 3, className: 'tm-fan-dot', interactive: false }).addTo(siteLayer)
  slots.forEach((slot, index) => {
    const more = slot.more
    const report = members[index]!
    const root = document.createElement('span')
    root.className = 'tm-fan-slot'
    root.style.transform = `translate(${slot.dx}px, ${slot.dy}px)`
    if (more) root.innerHTML = `<span class="tm-tag tm-tag--more"><span class="tm-tag-box"><b>+${more}</b></span></span>`
    else {
      const hub = map!.latLngToLayerPoint(point(report.at))
      const vx = hub.x - anchor.x - slot.dx, vy = hub.y - anchor.y - slot.dy
      const leg = document.createElement('i')
      leg.className = `tm-leg is-${report.tier}`
      leg.style.width = `${Math.hypot(vx, vy)}px`
      leg.style.transform = `rotate(${Math.atan2(vy, vx)}rad)`
      root.append(leg, tagIcon(report, { selected: report.id === selected.value, dim: !!matchIds.value && !matchIds.value.has(report.id) }))
    }
    const marker = L.marker(point(group.anchor), { icon: L.divIcon({ html: root, className: 'tm-marker tm-marker--fan', iconSize: [0, 0], iconAnchor: [0, 0] }), keyboard: true, zIndexOffset: 40000 + index })
    const activate = more ? () => { panelGroup.value = { ...group }; showDetails() } : () => { fromMap = true; select(report.id) }
    if (!more) {
      const tip = document.createElement('span')
      tip.textContent = `${report.name} · ${siteLabel(report)}`
      marker.bindTooltip(tip, { direction: 'top', offset: [slot.dx, slot.dy - 14], className: 'tm-tip' })
    }
    marker.on('click', activate)
    marker.addTo(siteLayer!)
    asButton(marker, more ? `${group.key}+more` : report.id, more ? `${more} more sites here. Show them in the list.` : tagLabel(report), more ? null : report.id === selected.value, activate)
  })
}
// While a fan is open, markers close to it step back so its members read.
function fadeAround(anchor: [number, number] | null) {
  if (!map) return
  const open = fanKey()
  const centre = anchor ? map.latLngToContainerPoint(point(anchor)) : null
  for (const [id, element] of elements) {
    const at = pinIndex.get(id)?.at || groupIndex.get(id)?.anchor || reportIndex.get(id)?.at
    const inFan = !!open && (id === open || id.startsWith(`${open}+`) || groupOf.get(id) === open)
    const near = !!centre && !!at && !inFan && map.latLngToContainerPoint(point(at)).distanceTo(centre) < 100
    element.classList.toggle('is-faded', near)
  }
}
function setHot(id: string) {
  const before = hot.value
  hot.value = id
  for (const value of [before, id]) {
    if (!value) continue
    const target = elements.get(value) || elements.get(groupOf.get(value) || '')
    target?.querySelector('.tm-tag, .tm-chip-m')?.classList.toggle('is-hot', value === id)
  }
}

// A chip zooms in when its members would split apart closer in; otherwise it opens its fan.
function activateGroup(key: string) {
  const group = groupIndex.get(key)
  if (!group || !map) return
  const viaKeyboard = !fromMap || (document.activeElement as HTMLElement | null)?.dataset?.pin === key
  panelGroup.value = { ...group }
  const members = group.members.map(id => reportIndex.get(id)!)
  const sites = members.map(report => ({ id: report.id, at: report.at, top: report.top, tier: report.tier, type: report.type, name: report.name }))
  const splits = groupSites(sites, pxPerUnit(map.getMaxZoom()), radius()).length > 1
  announce(`Showing ${members.length} sites at ${groupName(group)}`)
  if (splits && map.getZoom() < map.getMaxZoom() - 0.01) {
    fanMember.value = ''
    map.fitBounds(L.latLngBounds(members.map(report => point(report.at))), { ...framePad(), padding: L.point(64, 64), maxZoom: map.getMaxZoom(), ...animate() })
    return
  }
  fanMember.value = group.members[0]!
  if (detail() === 'far') showAt(group.anchor, fitZoom + 0.75)
  else renderSites()
  if (viaKeyboard) nextTick(() => elements.get(group.members[0]!)?.focus({ preventScroll: true }))
}
function closeFan(refocus = false) {
  const key = fanKey()
  fanMember.value = ''
  renderSites()
  if (refocus && key) nextTick(() => elements.get(key)?.focus({ preventScroll: true }))
}

// Routes draw as a line over the art, under the markers.
function renderRoutes() {
  routeLayer?.clearLayers()
  if (!map) return
  routeLayer ||= L.layerGroup().addTo(map)
  const threat = view.value === 'threat'
  const on = shown.value.includes('route') && !focusFind.value
  const chosen = selectedRoute.value?.id
  const hits = searching.value ? new Set(searchRows.value.filter(item => item.kind === 'route').map(item => item.id)) : null
  for (const item of routes) {
    const isSelected = item.id === chosen
    if ((threat || !on) && !isSelected) continue
    const dim = !!hits && !hits.has(item.id)
    const line = item.path.map(at => point(at))
    const state = `${isSelected ? ' is-on' : ''}${dim ? ' is-dim' : ''}`
    L.polyline(line, { pane: 'tmRoutes', className: `tm-route-casing${state}`, weight: isSelected ? 8 : 6, interactive: false }).addTo(routeLayer)
    L.polyline(line, { pane: 'tmRoutes', className: `tm-route${state}`, weight: isSelected ? 4 : 2.5, interactive: false }).addTo(routeLayer)
    const hit = L.polyline(line, { pane: 'tmRoutes', className: 'tm-route-hit', weight: 18, opacity: 0 })
    const tip = document.createElement('span')
    tip.textContent = isSelected ? `${item.name} · ${item.stops.length} stops` : `Route: ${item.name} · tap for its stops`
    hit.bindTooltip(tip, { sticky: true, direction: 'top', offset: [0, -10], className: 'tm-tip' })
    hit.on('click', () => { fromMap = true; select(item.id) })
    hit.addTo(routeLayer)
    for (const stop of item.stops) {
      const end = stop.n === 1 || stop.n === item.stops.length
      if (!isSelected) {
        L.circleMarker(point(stop.at), { pane: 'tmRoutes', className: `tm-route-stop${end ? ' is-end' : ''}${dim ? ' is-dim' : ''}`, radius: end ? 5 : 3, weight: 2, interactive: false }).addTo(routeLayer)
        continue
      }
      const badge = document.createElement('span')
      badge.className = `tm-stop${end ? ' is-end' : ''}${stop.n === activeStop.value ? ' is-on' : ''}`
      badge.textContent = String(stop.n)
      L.marker(point(stop.at), { icon: L.divIcon({ html: badge, className: 'tm-marker', iconSize: [20, 20], iconAnchor: [10, 10] }), interactive: false, keyboard: false, zIndexOffset: 15000 }).addTo(routeLayer)
    }
  }
}
function focusStop(stop: RouteStop) {
  activeStop.value = stop.n
  renderRoutes()
  if (!map) return
  if (inSheet.value) sheet.value = 'peek'
  nextTick(() => showAt(stop.at, Math.max(map!.getZoom(), fitZoom + 1.5)))
  const box = canvasRef.value?.getBoundingClientRect()
  if (box && !full.value && (box.bottom < 80 || box.top > window.innerHeight - 80)) canvasRef.value!.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth' })
}
function renderAll() {
  regroup()
  renderPlaces()
  renderSites()
  renderAreas()
  renderZones()
  renderRoutes()
}

function frameSelection() {
  if (!map) return
  const item = selectedRoute.value
  if (item) {
    if (!fromMap) map.fitBounds(L.latLngBounds(item.path.map(at => point(at))), { ...framePad(), maxZoom: fitZoom + 1.5, ...animate() })
    return
  }
  const at = selectedReport.value?.at || selectedPin.value?.at
  if (!at) return
  if (fromMap) { if (!map.getBounds().pad(-0.12).contains(point(at))) map.panTo(point(at), animate()); return }
  showAt(at, Math.max(map.getZoom(), fitZoom + 1.25))
}
function showArea() {
  const report = selectedReport.value
  if (!map || !report) return
  if (inSheet.value) sheet.value = 'peek'
  nextTick(() => map!.fitBounds(areaBounds(report), { ...framePad(), maxZoom: fitZoom + 1.5, ...animate() }))
}
function zoomTo() {
  fromMap = false
  if (inSheet.value) sheet.value = 'peek'
  nextTick(frameSelection)
}

// The last selection the map made itself, so only a link reveals a hidden layer.
let ownPick: string | null = null
function select(id: string) {
  ownPick = id
  return router.replace({ query: { ...route.query, pin: id || undefined }, hash: route.hash })
}
// Focus moves to the card once it has rendered, so it never falls out of the panel.
async function pick(id: string) {
  fromMap = false
  if (inSheet.value) sheet.value = 'peek'
  if (selected.value !== id) await select(id)
  else nextTick(frameSelection)
  await nextTick()
  cardRef.value?.focus()
}
function showMore() {
  sheet.value = 'full'
  nextTick(() => cardRef.value?.focus())
}
function pickPart(part: ThreatPart) { pick(part.pin || part.poi) }
function setView(next: 'map' | 'threat') {
  layersOpen.value = false
  router.replace({ query: { ...route.query, view: next === 'threat' ? 'threat' : undefined }, hash: route.hash })
}
function toggleLevel(level: string) {
  levelsOn.value = levelsOn.value.includes(level) ? levelsOn.value.filter(on => on !== level) : threatLevels.filter(on => on === level || levelsOn.value.includes(on))
}
function close() {
  const id = selected.value
  select('')
  nextTick(() => (elements.get(id) || elements.get(groupOf.get(id) || ''))?.focus({ preventScroll: true }))
}
function showDetails() {
  if (inSheet.value) { sheet.value = 'full'; return }
  panelRef.value?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' })
}

function toggleFocus(id: string) {
  focus.value = focus.value === id ? '' : id
  panelGroup.value = null
  listLayer.value = ''
  fanMember.value = ''
  announce(focus.value ? `Showing only ${focusFind.value!.label.toLowerCase()}: ${quickFinds.value.find(find => find.id === id)?.count} on the map` : 'Showing your layers again')
}
// The Only pill goes away when pressed, so focus moves to the quick find it stood for.
function clearFocusFromPill(id: string) {
  toggleFocus(id)
  nextTick(() => rootRef.value?.querySelector<HTMLElement>(`[data-find="${id}"]`)?.focus({ preventScroll: true }))
}
function toggleLayer(id: string) {
  if (visit.value.includes(id)) { hideVisit(id); return }
  visitLayers.value = visitLayers.value.filter(layer => layer !== id)
  enabled.value = enabled.value.includes(id) ? enabled.value.filter(layer => layer !== id) : allLayerIds.filter(layer => layer === id || enabled.value.includes(layer))
  if (id === linkedLayer.value && !enabled.value.includes(id)) router.replace({ query: { ...route.query, layer: undefined }, hash: route.hash })
}
function setSection(id: string, on: boolean) {
  const layers = MAP_SECTIONS.find(section => section.id === id)!.layers
  enabled.value = on ? allLayerIds.filter(layer => layers.includes(layer) || enabled.value.includes(layer)) : enabled.value.filter(layer => !layers.includes(layer))
  if (!on) visitLayers.value = visitLayers.value.filter(layer => !layers.includes(layer))
}
function fold(id: string) { collapsed.value = collapsed.value.includes(id) ? collapsed.value.filter(item => item !== id) : [...collapsed.value, id] }
function listFromPanel(id: string) {
  listLayer.value = id
  focus.value = ''
  panelGroup.value = null
  query.value = ''
  layersOpen.value = false
  showDetails()
}
function resetLayers() {
  if (linkedLayer.value) hideVisit(linkedLayer.value)
  visitLayers.value = []
  enabled.value = [...defaults]
}
function showForVisit(id: string) {
  if (id && !enabled.value.includes(id) && !visitLayers.value.includes(id)) visitLayers.value = [...visitLayers.value, id]
}
function hideVisit(id: string) {
  visitLayers.value = visitLayers.value.filter(layer => layer !== id)
  if (linkedLayer.value === id) router.replace({ query: { ...route.query, layer: undefined }, hash: route.hash })
}
function revealSelection() {
  const report = selectedReport.value
  if (report && focusFind.value && !inFocus(report)) focus.value = ''
  showForVisit(selectedRoute.value ? 'route' : report ? report.type : selectedPin.value?.layer || '')
}
function openLinkedLayer() {
  if (!linkedLayer.value) return
  showForVisit(linkedLayer.value)
  if (!full.value) nextTick(() => document.getElementById('map')?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' }))
}
let layersOpener: HTMLElement | null = null
function toggleLayers(event?: Event) {
  layersOpener = (event?.currentTarget as HTMLElement | null) || null
  layersOpen.value = !layersOpen.value
  if (layersOpen.value) nextTick(() => layersRef.value?.focus())
}
function closeLayers() {
  layersOpen.value = false
  nextTick(() => [layersOpener, hudLayersRef.value, layersButtonRef.value].find(button => button?.isConnected && button.getClientRects().length)?.focus({ preventScroll: true }))
}
// Leaving a group, a quick find or a panel-picked layer falls back to a linked
// layer's list; only closing that list itself drops ?layer=.
function clearList() {
  const mode = listMode.value
  if (mode === 'focus') focus.value = ''
  const dropLink = mode === 'layer' && !!linkedLayer.value && (!listLayer.value || listLayer.value === linkedLayer.value)
  panelGroup.value = null
  listLayer.value = ''
  if (dropLink) router.replace({ query: { ...route.query, layer: undefined }, hash: route.hash })
}
function announce(text: string) {
  announcement.value = ''
  nextTick(() => { announcement.value = text })
}
async function copyLink() {
  const url = new URL(window.location.href)
  url.hash = 'map'
  try { await navigator.clipboard.writeText(url.href); copyMessage.value = 'Link copied.' } catch { copyMessage.value = 'Copy the address bar to share this.' }
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copyMessage.value = '' }, 5000)
}

// Full screen: a dialog over the DMZ shell. Opening pushes #full, so Back closes it.
let pushedFull = false
let keepQuery: Record<string, unknown> | null = null
function applyGestures() {
  if (!map) return
  const free = full.value || !touch.value || !narrow.value
  for (const handler of [map.dragging, map.touchZoom, map.doubleClickZoom]) free ? handler.enable() : handler.disable()
  if (wheelZoom.value && (full.value || !touch.value)) map.scrollWheelZoom.enable()
  else map.scrollWheelZoom.disable()
}
// A phone held sideways is wide but short; full screen still docks the sheet there.
const shortLandscape = () => window.matchMedia('(max-height: 30rem) and (orientation: landscape)').matches
const sheetWidth = (width: number) => width > 0 && (width < 736 || (full.value && touch.value && shortLandscape()))
let reframe = false
const placeholder = ref(0)
function openFull() {
  if (full.value) return
  // The page keeps the map's room while it is lifted out, so nothing below it jumps.
  placeholder.value = rootRef.value?.offsetHeight || 0
  full.value = true
  sheet.value = 'peek'
  layersOpen.value = false
  reframe = true
  document.documentElement.classList.add('tm-locked')
  if (route.hash !== '#full') { pushedFull = true; router.push({ query: route.query, hash: '#full' }) }
  nextTick(() => { narrow.value = sheetWidth(window.innerWidth); applyGestures(); resize(); closeFullRef.value?.focus({ preventScroll: true }) })
}
// While the dialog is open, focus that drops out of it (a control that went away) comes back to the card or Close.
// Inline, only focus whose control was removed is caught; a click elsewhere on the page is left alone.
function onFocusOut(event: FocusEvent) {
  const left = event.target as Element | null
  setTimeout(() => {
    if (disposed) return
    const active = document.activeElement
    if (active && active !== document.body && rootRef.value?.contains(active)) return
    if (full.value) { if (cardRef.value) cardRef.value.focus(); else closeFullRef.value?.focus({ preventScroll: true }) }
    else if ((!active || active === document.body) && left && !left.isConnected) panelRef.value?.focus({ preventScroll: true })
  }, 0)
}
function closeFull() {
  if (!full.value) return
  keepQuery = { ...route.query }
  if (pushedFull && route.hash === '#full') { pushedFull = false; router.back(); return }
  finishFull()
}
function finishFull() {
  full.value = false
  layersOpen.value = false
  document.documentElement.classList.remove('tm-locked')
  const query = keepQuery
  keepQuery = null
  // Back restores the address from before full screen; keep the selection made inside it,
  // as the map's own pick (no layer revealed, no reframe) and on the page's own hash, so it does not scroll.
  if (query && JSON.stringify(query) !== JSON.stringify(route.query)) {
    if (String(query.pin || '') !== String(route.query.pin || '')) { ownPick = resolvePinId(String(query.pin || '')); fromMap = true }
    router.replace({ query: query as any, hash: route.hash === '#full' ? '#map' : route.hash })
  }
  nextTick(() => { narrow.value = sheetWidth(rootRef.value?.getBoundingClientRect().width || 1000); applyGestures(); resize(); placeholder.value = 0; fullButtonRef.value?.focus({ preventScroll: true }) })
}
function toggleSheet() { sheet.value = sheet.value === 'full' ? 'peek' : 'full' }

// Esc steps back one thing at a time: the Layers panel, an open fan, the card, a list, full screen.
function onRootKey(event: KeyboardEvent) {
  if (event.key === 'Tab' && full.value) { trapTab(event); return }
  if (event.key !== 'Escape' || event.defaultPrevented) return
  if (event.target === searchRef.value && query.value) query.value = ''
  else if (layersOpen.value) closeLayers()
  else if (fanKey()) closeFan(true)
  else if (selected.value) close()
  else if (panelGroup.value || listLayer.value) clearList()
  else if (full.value) closeFull()
  else return
  event.preventDefault()
}
function trapTab(event: KeyboardEvent) {
  const items = [...rootRef.value!.querySelectorAll<HTMLElement>('button, [href], input, [tabindex="0"]')].filter(item => !item.hasAttribute('disabled') && item.getClientRects().length)
  if (!items.length) return
  const first = items[0]!, last = items.at(-1)!
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
// Runs in the capture phase, ahead of the site-wide search's own '/' shortcut.
function onSlash(event: KeyboardEvent) {
  if (event.defaultPrevented || event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || touch.value) return
  if (spotlightOpen.value || (!full.value && document.querySelector('[aria-modal="true"]'))) return
  if ((event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')) return
  const box = rootRef.value?.getBoundingClientRect()
  if (!full.value && (!box || box.bottom < 0 || box.top > window.innerHeight)) return
  event.preventDefault()
  searchRef.value?.focus()
}
function skipToList() { panelRef.value?.querySelector<HTMLElement>('.tm-panel-body button, .tm-panel-body a')?.focus() }

function save() {
  try { localStorage.setItem(TACMAP_PREFS, JSON.stringify(prefsToSave({ layers: enabled.value, levels: levelsOn.value, grid: showGrid.value, wheel: wheelZoom.value, collapsed: collapsed.value, hideUsed: hideUsed.value }))) } catch { /* The map works without storage. */ }
}
function restore() {
  try {
    const saved = readPrefs(localStorage.getItem(TACMAP_PREFS) || 'null')
    enabled.value = saved.layers
    levelsOn.value = saved.levels
    showGrid.value = saved.grid
    wheelZoom.value = saved.wheel
    collapsed.value = saved.collapsed
    hideUsed.value = saved.hideUsed
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
    const untouched = Math.abs(map.getZoom() - fitZoom) < 0.05
    map.invalidateSize({ pan: false, animate: false })
    measure()
    // Opening full screen frames the selection again once the new size has applied.
    if ((first || reframe) && selected.value) { fromMap = false; frameSelection() }
    else if (first || untouched) map.fitBounds(imageBounds(), { padding: [8, 8], animate: false })
    reframe = false
    updateZoom()
    if (regroup() || fanKey()) renderSites()
  })
}
function trackCursor(event: L.LeafletMouseEvent) {
  const { scale, x, y } = hajinMap.toArt
  const ox = (event.latlng.lng - x) / scale, oy = (H - event.latlng.lat - y) / scale
  const { left, top, cell, columns, rows } = hajinMap.grid
  const column = Math.floor((ox - left) / cell), row = Math.floor((oy - top) / cell) + 1
  cursor.value = column >= 0 && column < columns.length && row >= 1 && row <= rows ? `${columns[column]}${row}` : ''
}
function onZoomEnd() {
  updateZoom()
  // Groups change with the zoom; an open fan's legs do too.
  if (regroup() || fanKey()) renderSites()
}
function onMapClick() {
  if (inlineTouch.value) { openFull(); return }
  if (layersOpen.value) { layersOpen.value = false; return }
  if (fanKey()) closeFan()
}
function preserveBrowserZoom(event: WheelEvent) { if (event.ctrlKey || event.metaKey) event.stopImmediatePropagation() }
function motionChanged(event: MediaQueryListEvent) { reducedMotion = event.matches; if (map) map.options.inertia = !reducedMotion }
function pointerChanged(event: MediaQueryListEvent) { touch.value = event.matches; applyGestures(); renderAll() }
function measureNarrow() {
  const width = full.value ? window.innerWidth : rootRef.value?.getBoundingClientRect().width || 0
  const next = sheetWidth(width)
  if (next !== narrow.value) { narrow.value = next; nextTick(applyGestures) }
}

watch(selectedId, () => {
  if (selectedId.value !== ownPick) revealSelection()
  ownPick = null
  activeStop.value = 0
  // Picking a site opens its group's fan; picking anything else closes it.
  const report = selectedReport.value
  fanMember.value = report ? report.id : ''
  if (report && panelGroup.value && !panelGroup.value.members.includes(report.id)) panelGroup.value = null
  // The card opens at the top of the panel, so bring the panel back up to it.
  if (selected.value && panelRef.value) panelRef.value.scrollTop = 0
  renderAll()
  // Frame once the sheet has settled to its new height, so the spot stays clear of it.
  const viaMap = fromMap
  fromMap = false
  if (inSheet.value) nextTick(() => requestAnimationFrame(() => { fromMap = viaMap; frameSelection(); fromMap = false }))
  else { fromMap = viaMap; frameSelection(); fromMap = false }
  if (selectedId.value && !selected.value) select('')
  // An old link to a renamed site moves to its current id.
  else if (selected.value && selected.value !== String(route.query.pin || '') && reportIndex.has(selected.value)) router.replace({ query: { ...route.query, pin: selected.value }, hash: route.hash })
})
watch(linkedLayer, (now, before) => {
  if (before && !now) hideVisit(before)
  openLinkedLayer()
})
watch([enabled, collapsed, hideUsed], save, { deep: true })
watch([shown, focus, hideUsed, marks], () => renderAll(), { deep: true })
watch(view, () => { layersOpen.value = false; renderAll() })
watch(levelsOn, () => { renderZones(); renderPlaces(); save() })
watch(query, () => {
  clearTimeout(queryTimer)
  queryTimer = setTimeout(() => {
    renderPlaces()
    renderSites()
    renderAreas()
    renderRoutes()
    if (search.value.square && map) map.fitBounds(squareBounds(search.value.square), { ...framePad(), maxZoom: fitZoom + 1.25, ...animate() })
  }, 120)
  if (query.value.trim()) { panelGroup.value = null; listLayer.value = '' }
})
watch(showGrid, () => { renderGrid(); save() })
watch(wheelZoom, () => { applyGestures(); save() })
// Back (or any navigation) off #full closes full screen and keeps what was picked inside it.
watch(() => [route.hash, route.query] as const, ([hash], [oldHash, oldQuery]) => {
  if (!full.value || hash === '#full') return
  pushedFull = false
  if (!keepQuery && oldHash === '#full') keepQuery = { ...oldQuery }
  finishFull()
})
watch([sheet, full], () => nextTick(resize))

onMounted(async () => {
  await nextTick()
  if (disposed || !canvasRef.value) return
  restore()
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionQuery.matches
  motionQuery.addEventListener('change', motionChanged)
  pointerQuery = window.matchMedia('(pointer: coarse)')
  touch.value = pointerQuery.matches
  pointerQuery.addEventListener('change', pointerChanged)
  // A page opened at #full does not open the full-screen map by itself.
  if (route.hash === '#full') router.replace({ query: route.query, hash: '#map' })
  revealSelection()
  showForVisit(linkedLayer.value)
  // A link to a site opens its group's fan, as picking it does.
  fanMember.value = selectedReport.value?.id || ''
  measureNarrow()
  sizeObserver = new ResizeObserver(measureNarrow)
  sizeObserver.observe(rootRef.value!)
  window.addEventListener('keydown', onSlash, { capture: true })
  sheetObserver = new ResizeObserver(() => rootRef.value?.style.setProperty('--tm-sheet-h', `${panelRef.value?.offsetHeight || 0}px`))
  if (panelRef.value) sheetObserver.observe(panelRef.value)
  try {
    canvasRef.value.addEventListener('wheel', preserveBrowserZoom, { capture: true, passive: true })
    // As in InteractiveMap: no zoom animation, so a route change cannot leave
    // Leaflet's transition timer running against a removed pane.
    map = L.map(canvasRef.value, { crs: L.CRS.Simple, zoomSnap: 0.25, zoomDelta: 0.5, zoomControl: false, attributionControl: false, scrollWheelZoom: wheelZoom.value, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, inertia: !reducedMotion, maxBounds: imageBounds().pad(0.15), maxBoundsViscosity: 0.8, bounceAtZoomLimits: false })
    // Zones over the art, then the grid, areas, routes and markers.
    map.createPane('tmZones').style.zIndex = '410'
    map.createPane('tmGrid').style.zIndex = '420'
    map.createPane('tmArea').style.zIndex = '425'
    map.createPane('tmRoutes').style.zIndex = '430'
    loadImage()
    placeLayer = L.layerGroup().addTo(map)
    siteLayer = L.layerGroup().addTo(map)
    map.on('zoomend', onZoomEnd)
    map.on('mousemove', trackCursor)
    map.on('mouseout', () => { cursor.value = '' })
    map.on('click', onMapClick)
    fit()
    applyGestures()
    renderGrid()
    renderAll()
    if (selectedId.value && !selected.value) select('')
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
  clearTimeout(queryTimer)
  observer?.disconnect()
  sizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', motionChanged)
  pointerQuery?.removeEventListener('change', pointerChanged)
  window.removeEventListener('keydown', onSlash, { capture: true })
  sheetObserver?.disconnect()
  document.documentElement.classList.remove('tm-locked')
  canvasRef.value?.removeEventListener('wheel', preserveBrowserZoom, true)
  map?.stop()
  overlay?.off('load error')
  for (const layer of [placeLayer, siteLayer, gridLayer, squareLayer, areaLayer, zoneLayer, routeLayer]) layer?.clearLayers()
  map?.remove()
  map = undefined
})

const reportSourceCount = new Set(reports.flatMap(report => report.sources)).size
const PRECISION_HELP = [
  { tier: 'pinned', text: 'In a building the official map marks' },
  { tier: 'approx', text: 'Rough spot: pick it to see where it could be' },
  { tier: 'area', text: 'Somewhere in a place or square' },
]
</script>

<template>
  <div v-if="full && placeholder" class="tm-placeholder" :style="{ height: `${placeholder}px` }" aria-hidden="true" />
  <div
    ref="rootRef" class="tm"
    :class="{ 'tm--full': full, 'tm--threat': view === 'threat', 'tm--sheet': inSheet, [`tm--sheet-${sheet}`]: inSheet, 'tm--touch': touch, 'tm--narrow': narrow, 'has-pick': !!selected }"
    :role="full ? 'dialog' : undefined" :aria-modal="full ? 'true' : undefined" :aria-label="full ? 'Hajin Tac-Map, full screen' : undefined"
    @keydown="onRootKey" @focusout="onFocusOut"
  >
    <Teleport defer to="#tm-sheet-tools" :disabled="!inSheet">
      <div class="tm-tools">
        <label class="tm-search">
          <span class="sr-only">Search the Tac-Map</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5" /></svg>
          <input ref="searchRef" v-model="query" type="search" placeholder="Search keys, bosses, exfils, places or a square (H6)" autocomplete="off" spellcheck="false" aria-keyshortcuts="/" @focus="inSheet && (sheet = 'full')">
        </label>
        <div class="tm-quick" role="group" aria-label="Quick finds">
          <button v-for="find in quickFinds" :key="find.id" type="button" class="tm-q" :data-find="find.id" :disabled="view === 'threat'" :style="{ '--tm-c': layerColor(find.layers[0]!) }" :aria-pressed="focus === find.id" :title="find.id === 'mine' ? 'Rooms for the keys you marked held' : `Show only ${find.label.toLowerCase()} for now`" @click="toggleFocus(find.id)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[find.id === 'mine' ? 'held' : find.layers[0]!]" /></svg>{{ find.label }}<span class="dmz-mono">{{ find.count }}</span>
          </button>
          <button ref="layersButtonRef" type="button" class="tm-q tm-q--layers" aria-controls="tm-layers" :aria-expanded="layersOpen" @click="toggleLayers">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5l-9 5l-9-5zM3 13l9 5l9-5" /></svg>{{ view === 'threat' ? 'Levels' : 'Layers' }}<span class="dmz-mono">{{ view === 'threat' ? levelsOn.length : shown.length }}</span>
          </button>
        </div>
        <div v-if="view === 'map' && visit.length" class="tm-visit">
          <button v-for="id in visit" :key="id" type="button" :style="{ '--tm-c': layerColor(id) }" :title="`On for this visit only; your saved layers stay as they were. Tap to hide ${hajinLayer(id)!.label.toLowerCase()}.`" @click="hideVisit(id)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[id]" /></svg>
            <span>Showing: {{ hajinLayer(id)!.label }}</span>
            <span class="sr-only">. Hide them</span>
            <svg class="tm-visit-x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>
    </Teleport>

    <div class="tm-work">
      <div class="tm-stage">
        <a class="tm-skip" href="#tm-panel" @click.prevent="skipToList">Skip to the list</a>
        <div class="tm-frame">
          <div ref="canvasRef" class="tm-canvas" data-detail="far" role="region" :aria-label="inlineTouch ? 'Hajin Tac-Map. Open the full map to pan and zoom.' : 'Hajin Tac-Map. Arrow keys pan, plus and minus zoom.'" :inert="imageError || mapError" />
          <div class="tm-hud">
            <button v-if="full" ref="closeFullRef" type="button" class="tm-hud-btn" aria-label="Close the full-screen map" @click="closeFull"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg><span>Close</span></button>
            <div class="tm-view" role="group" aria-label="Map view">
              <button type="button" :aria-pressed="view === 'map'" @click="setView('map')">Map</button>
              <button type="button" :aria-pressed="view === 'threat'" @click="setView('threat')">Threat</button>
            </div>
            <button v-if="inSheet" ref="hudLayersRef" type="button" class="tm-hud-btn" aria-controls="tm-layers" :aria-expanded="layersOpen" @click="toggleLayers"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5l-9 5l-9-5zM3 13l9 5l9-5" /></svg><span>Layers</span></button>
            <span v-if="cursor && !touch" class="tm-cursor dmz-mono" aria-hidden="true">Square {{ cursor }}</span>
          </div>
          <div v-if="focusFind && view === 'map'" class="tm-only">
            <span>Only: {{ focusFind.id === 'mine' ? 'My keys' : focusFind.label }}</span>
            <button type="button" :aria-label="`Stop showing only ${focusFind.label.toLowerCase()}`" @click="clearFocusFromPill(focusFind.id)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
          </div>
          <div class="tm-controls" role="group" aria-label="Map controls">
            <button type="button" aria-label="Zoom in" title="Zoom in" :disabled="!ready || atMax" @click="zoomBy(0.5)">+</button>
            <button type="button" aria-label="Zoom out" title="Zoom out" :disabled="!ready || atMin" @click="zoomBy(-0.5)">−</button>
            <button type="button" aria-label="Fit the whole map" title="Fit map" :disabled="!ready" @click="fit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg></button>
            <button type="button" aria-label="Grid squares" title="Grid squares" :aria-pressed="showGrid" @click="showGrid = !showGrid"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16" /></svg></button>
            <button v-if="!full" ref="fullButtonRef" type="button" aria-label="Full screen" title="Full screen" @click="openFull"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></svg></button>
          </div>
          <button v-if="inlineTouch" type="button" class="tm-open-full" @click="openFull"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></svg>Open full map</button>
          <div v-if="layersOpen" id="tm-layers" class="tm-layers-panel" @keydown.esc.stop.prevent="closeLayers">
            <DmzTacmapLayers
              ref="layersRef" :view="view" :shown="shown" :collapsed="collapsed" :levels="levelsOn" :counts="counts" :level-counts="levelCounts" :grid="showGrid" :wheel="wheelZoom" :touch="touch"
              @toggle="toggleLayer" @section="setSection" @fold="fold" @list="listFromPanel" @defaults="resetLayers" @level="toggleLevel" @all-levels="levelsOn = [...threatLevels]" @grid="showGrid = $event" @wheel="wheelZoom = $event" @close="closeLayers"
            />
          </div>
          <div v-if="imageError || mapError" class="tm-error" role="status">
            <strong>{{ mapError ? 'The map viewer could not open.' : 'The map image could not load.' }}</strong>
            <span>The list beside the map still works.</span>
            <button v-if="!mapError" type="button" class="tm-text" @click="loadImage">Try again</button>
          </div>
          <p v-else-if="imageLoading" class="tm-loading dmz-mono" role="status">Loading Tac-Map…</p>
        </div>
        <div v-if="!full" class="tm-legend">
          <template v-if="view === 'threat'">
            <span class="tm-legend-edge"><i aria-hidden="true" />Rated higher inside, spot not mapped</span>
            <span class="tm-legend-none"><i aria-hidden="true" />No official rating</span>
          </template>
          <template v-else>
            <span v-for="item in PRECISION_HELP" :key="item.tier" class="tm-legend-tier"><i :class="`is-${item.tier}`" aria-hidden="true" />{{ item.text }}</span>
            <span class="tm-legend-tier"><i class="tm-legend-chip" aria-hidden="true">3</i>Several sites: tap to spread them</span>
            <span v-if="shown.includes('route')" class="tm-legend-route"><i aria-hidden="true" />Route from a video</span>
          </template>
        </div>
        <p v-if="view === 'threat' && !full" class="tm-legend-note">Zones are approximate. Activision rates each part of a location but draws no borders, so the ground near each rated place takes its rating, and the nearer place wins where two meet.</p>
      </div>

      <aside id="tm-panel" ref="panelRef" class="tm-panel" aria-label="Tac-Map list and details" tabindex="-1">
        <div v-show="inSheet" class="tm-sheet-top">
          <button type="button" class="tm-handle" :aria-expanded="sheet === 'full'" aria-controls="tm-panel" @click="toggleSheet"><i aria-hidden="true" />{{ sheet === 'full' ? 'Show less' : 'Show more' }}</button>
          <div id="tm-sheet-tools" />
        </div>
        <div class="tm-panel-body">
          <DmzTacmapCard
            v-if="selected" :id="selected" ref="cardRef" :view="view" :compact="inSheet && sheet === 'peek'" :copied="copyMessage" :active-stop="activeStop"
            @close="close" @select="pick" @zoom="zoomTo" @area="showArea" @copy="copyLink" @more="showMore" @stop="focusStop"
          />
          <template v-if="!(inSheet && sheet === 'peek' && selected)">
            <template v-if="view === 'threat' && !searching">
              <div class="tm-results-head"><h3 class="dmz-mono">Threat by part</h3><span class="dmz-mono">{{ threatGroups.reduce((sum, group) => sum + group.parts.length, 0) }}</span></div>
              <p v-if="!threatGroups.length" class="tm-empty">Every threat level is switched off. Turn one on under Levels.</p>
              <div v-for="group in threatGroups" :key="group.level" class="tm-tier" :data-threat="threatClass(group.level)">
                <h4 class="dmz-mono">{{ group.level }} · {{ group.parts.length }}</h4>
                <ul class="tm-list">
                  <li v-for="part in group.parts" :key="part.id">
                    <button type="button" :aria-pressed="!!part.pin && selected === part.pin" @click="pickPart(part)">
                      <span class="tm-list-glyph is-place" :data-threat="threatClass(part.level)"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[part.pin ? pinIndex.get(part.pin)!.layer : 'poi']" /></svg></span>
                      <span class="tm-list-text">{{ part.name }}<small>{{ part.name === placeName(part.poi) ? 'Major location' : placeName(part.poi) }} · {{ part.pin ? pinIndex.get(part.pin)!.square : 'Spot not mapped' }}</small></span>
                    </button>
                  </li>
                </ul>
              </div>
            </template>

            <template v-else-if="listMode === 'search' && search.square">
              <div class="tm-results-head"><h3 class="dmz-mono">Square {{ search.square }}</h3><span class="dmz-mono" aria-live="polite">{{ search.sourced.length + search.placeIn.length + search.pins.length }}</span></div>
              <template v-for="block in squareBlocks" :key="block.title">
                <h4 class="tm-sub dmz-mono">{{ block.title }} · {{ block.items.length }}</h4>
                <ul class="tm-list">
                  <li v-for="report in block.items" :key="report.id">
                    <button type="button" :aria-pressed="selected === report.id" :style="{ '--tm-c': layerColor(report.type) }" @click="pick(report.id)" @mouseenter="setHot(report.id)" @mouseleave="setHot('')" @focus="setHot(report.id)" @blur="setHot('')">
                      <span class="tm-list-glyph" :class="`is-${report.tier}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[report.type]" /></svg></span>
                      <span class="tm-list-text">{{ report.name }}<small>{{ reportLabel(report.type) }} · {{ rowSub(report) }}</small></span>
                      <span v-if="markOf(report)" class="tm-mark dmz-mono" :class="`is-${markOf(report)}`">{{ markOf(report) }}</span>
                    </button>
                  </li>
                </ul>
              </template>
              <template v-if="search.pins.length">
                <h4 class="tm-sub dmz-mono">On the official map · {{ search.pins.length }}</h4>
                <ul class="tm-list">
                  <li v-for="pin in search.pins" :key="pin.id">
                    <button type="button" :aria-pressed="selected === pin.id" :style="{ '--tm-c': layerColor(pin.layer) }" @click="pick(pin.id)">
                      <span class="tm-list-glyph is-place" :data-threat="threatClass(pin.threat)"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[pin.layer]" /></svg></span>
                      <span class="tm-list-text">{{ pinTitle(pin) }}<small>{{ pinSub(pin) }}</small></span>
                    </button>
                  </li>
                </ul>
              </template>
            </template>

            <template v-else-if="listMode === 'search'">
              <div class="tm-results-head"><h3 class="dmz-mono">Results</h3><span class="dmz-mono" aria-live="polite">{{ searchRows.length }}</span></div>
              <p v-if="!searchRows.length" class="tm-empty">Nothing matches. Try a key name, a boss, an exfil or a square such as D7.</p>
              <ul v-else class="tm-list">
                <li v-for="row in searchRows" :key="row.kind + row.id">
                  <button v-if="row.kind === 'report'" type="button" :aria-pressed="selected === row.id" :style="{ '--tm-c': layerColor(row.report.type) }" @click="pick(row.id)" @mouseenter="setHot(row.id)" @mouseleave="setHot('')" @focus="setHot(row.id)" @blur="setHot('')">
                    <span class="tm-list-glyph" :class="`is-${row.report.tier}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[row.report.type]" /></svg></span>
                    <span class="tm-list-text">{{ row.report.name }}<small>{{ reportLabel(row.report.type) }} · {{ rowSub(row.report) }}</small></span>
                    <span v-if="markOf(row.report)" class="tm-mark dmz-mono" :class="`is-${markOf(row.report)}`">{{ markOf(row.report) }}</span>
                  </button>
                  <button v-else-if="row.kind === 'pin'" type="button" :aria-pressed="selected === row.id" :style="{ '--tm-c': layerColor(row.pin.layer) }" @click="pick(row.id)">
                    <span class="tm-list-glyph is-place" :data-threat="threatClass(row.pin.threat)"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[row.pin.layer]" /></svg></span>
                    <span class="tm-list-text">{{ pinTitle(row.pin) }}<small>{{ pinSub(row.pin) }}</small></span>
                  </button>
                  <button v-else type="button" :aria-pressed="selected === row.id" :style="{ '--tm-c': layerColor('route') }" @click="pick(row.id)">
                    <span class="tm-list-glyph is-pinned"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS.route" /></svg></span>
                    <span class="tm-list-text">{{ row.route.name }}<small>Route · {{ row.route.stops.length }} stops · {{ row.route.squares.join(', ') }}</small></span>
                  </button>
                </li>
              </ul>
            </template>

            <template v-else-if="listMode !== 'default'">
              <div class="tm-results-head">
                <h3 class="dmz-mono">{{ listTitle }}</h3>
                <span class="dmz-mono" aria-live="polite">{{ listItems.length }}</span>
              </div>
              <div class="tm-list-tools">
                <div v-if="listMode !== 'group'" class="tm-seg" role="group" aria-label="Group the list">
                  <button type="button" :aria-pressed="listBy === 'place'" @click="listBy = 'place'">By place</button>
                  <button type="button" :aria-pressed="listBy === 'square'" @click="listBy = 'square'">By square</button>
                </div>
                <button v-if="listMode === 'group' && panelGroup?.anchorPin" type="button" class="tm-text" @click="pick(panelGroup.anchorPin)">Place card</button>
                <label v-if="showsKeys" class="tm-check"><input v-model="hideUsed" type="checkbox"> Hide used</label>
                <button type="button" class="tm-text" @click="clearList">{{ listMode === 'focus' ? 'Show all layers' : 'Back to the list' }}</button>
              </div>
              <p v-if="listMode === 'focus' && focus === 'exfils'" class="tm-hint">{{ hajinLayer('exfil')!.desc }}</p>
              <p v-if="!listItems.length" class="tm-empty">{{ focus === 'mine' ? 'Mark a key held on its room’s card or in the key tracker, and its room shows here.' : 'Nothing to list here.' }}</p>
              <div v-for="group in listGroupsShown" :key="group.id" class="tm-group">
                <h4 class="tm-group-head">
                  <button v-if="group.pin" type="button" class="tm-group-btn" :data-threat="threatClass(group.threat)" @click="pick(group.pin)">{{ group.name }}<span class="dmz-mono">{{ [group.square, group.threat, group.items.length].filter(Boolean).join(' · ') }}</span></button>
                  <span v-else class="tm-group-btn">{{ group.name }}<span class="dmz-mono">{{ group.items.length }}</span></span>
                </h4>
                <ul class="tm-list">
                  <li v-for="item in group.items" :key="item.id">
                    <button v-if="isReport(item)" type="button" :aria-pressed="selected === item.id" :style="{ '--tm-c': layerColor(item.type) }" @click="pick(item.id)" @mouseenter="setHot(item.id)" @mouseleave="setHot('')" @focus="setHot(item.id)" @blur="setHot('')">
                      <span class="tm-list-glyph" :class="`is-${item.tier}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[item.type]" /></svg></span>
                      <span class="tm-list-text">{{ item.name }}<small>{{ rowSub(item) }}</small></span>
                      <span v-if="markOf(item)" class="tm-mark dmz-mono" :class="`is-${markOf(item)}`">{{ markOf(item) }}</span>
                    </button>
                    <button v-else type="button" :aria-pressed="selected === item.id" :style="{ '--tm-c': layerColor(item.layer) }" @click="pick(item.id)">
                      <span class="tm-list-glyph is-place" :data-threat="threatClass(item.threat)"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[item.layer]" /></svg></span>
                      <span class="tm-list-text">{{ pinTitle(item) }}<small>{{ pinSub(item) }}</small></span>
                    </button>
                  </li>
                </ul>
              </div>
            </template>

            <template v-else>
              <template v-if="routes.length">
                <div class="tm-results-head"><h3 class="dmz-mono">Routes</h3><span class="dmz-mono">{{ routes.length }}</span></div>
                <ul class="tm-list">
                  <li v-for="item in routes" :key="item.id">
                    <button type="button" :aria-pressed="selected === item.id" :style="{ '--tm-c': layerColor('route') }" @click="pick(item.id)">
                      <span class="tm-list-glyph is-pinned"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS.route" /></svg></span>
                      <span class="tm-list-text">{{ item.name }}<small>{{ item.stops.length }} stops · {{ item.stops[0]!.square }} to {{ item.stops.at(-1)!.square }}</small></span>
                    </button>
                  </li>
                </ul>
              </template>
              <div class="tm-results-head"><h3 class="dmz-mono">Major locations</h3><span class="dmz-mono">{{ majors.length }}</span></div>
              <ul class="tm-list">
                <li v-for="pin in majors" :key="pin.id">
                  <button type="button" :aria-pressed="selected === pin.id" @click="pick(pin.id)">
                    <span class="tm-list-glyph is-place" :data-threat="threatClass(pin.threat)"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS.poi" /></svg></span>
                    <span class="tm-list-text">{{ pin.name }}<small>{{ pin.square }} · {{ pin.threat }} · {{ inPlace(pin) }} reported</small></span>
                  </button>
                </li>
              </ul>
            </template>
          </template>
        </div>
      </aside>
    </div>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>

    <details v-if="!full" class="tm-credits">
      <summary>Map sources and credits</summary>
      <ul>
        <li v-for="source in hajinMap.sources" :key="source.url"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }}<span class="sr-only"> (opens in a new tab)</span></a> · {{ source.note }}</li>
      </ul>
      <p>Official marker positions checked {{ HAJIN_MAP_CHECKED }}. The grid was fitted to the official D7 example and to squares read in game; near a line, a square can read one off. Reported sites come from {{ reportSourceCount }} guide, video and player sources, credited on each site. Their spots are worked out from what those sources say: {{ tiers.pinned }} sit in a marked building, {{ tiers.approx }} are rough spots and {{ tiers.area }} stand for a whole place or square. Viewer by CodWiki, built with <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>.</p>
    </details>
  </div>
</template>

<style scoped>
.tm { --tm-route: #ff7ac6; --tm-low: #a9b39a; --tm-medium: #d8c47c; --tm-high: #e8a04f; --tm-critical: #ef7a5a; --tm-extreme: #ff5468; --tm-report: var(--dz-accent); --tm-loot: #d79cff; container-type: inline-size; color: var(--dz-ink); }
.tm p, .tm li { margin: 0; max-width: none; font-size: inherit; color: inherit; }
.tm svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.tm :deep([data-threat='low']) { --tm-t: var(--tm-low); }
.tm :deep([data-threat='medium']) { --tm-t: var(--tm-medium); }
.tm :deep([data-threat='high']) { --tm-t: var(--tm-high); }
.tm :deep([data-threat='critical']) { --tm-t: var(--tm-critical); }
.tm :deep([data-threat='extreme']) { --tm-t: var(--tm-extreme); }

/* Tools: search, then one row of quick finds ending in Layers. */
.tm-tools { display: grid; gap: 0.625rem; margin-bottom: 0.75rem; }
.tm-search { min-width: 0; display: flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0 1.125rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); }
.tm-search:focus-within { border-color: var(--dz-ink); }
.tm-search svg { flex: none; width: 1.125rem; height: 1.125rem; stroke: var(--dz-muted); stroke-width: 2; }
.tm-search input { flex: 1; min-width: 0; height: 2.75rem; border: 0; background: transparent; color: var(--dz-ink); font: inherit; font-size: 1.0625rem; outline: none; }
.tm-search input::placeholder { color: #9a9b8f; }
.tm-quick { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.tm-q { flex: none; display: inline-flex; align-items: center; gap: 0.4rem; min-height: 2.75rem; padding: 0 0.875rem 0 0.7rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); color: var(--dz-ink); font: inherit; font-size: 0.925rem; font-weight: 600; white-space: nowrap; cursor: pointer; }
.tm-q svg { width: 1.05rem; height: 1.05rem; color: var(--tm-c, var(--dz-ink)); }
.tm-q .dmz-mono { font-size: 0.72rem; font-weight: 500; color: var(--dz-muted); }
.tm-q:hover { background: rgba(233, 230, 214, 0.1); }
.tm-q[aria-pressed='true'] { border-color: var(--tm-c); background: color-mix(in srgb, var(--tm-c) 22%, rgba(14, 16, 15, 0.8)); }
.tm-q[aria-pressed='true'] .dmz-mono { color: var(--dz-ink); }
.tm-q:disabled { opacity: 0.45; cursor: default; }
.tm-q--layers { margin-left: auto; }
.tm-q--layers[aria-expanded='true'] { border-color: var(--dz-ink); background: rgba(233, 230, 214, 0.14); }
.tm-q--layers .dmz-mono { color: var(--dz-teal); }
.tm-visit { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.tm-visit button { display: inline-flex; align-items: center; gap: 0.45rem; max-width: 100%; min-height: 2.75rem; padding: 0 0.75rem 0 0.625rem; border: 1px solid var(--tm-c, var(--tm-report)); border-radius: 999px; background: color-mix(in srgb, var(--tm-c, var(--tm-report)) 12%, transparent); color: var(--dz-ink); font: inherit; font-size: 0.9rem; font-weight: 600; text-align: left; cursor: pointer; }
.tm-visit svg { flex: none; width: 1rem; height: 1rem; color: var(--tm-c, var(--dz-ink)); }
.tm-visit .tm-visit-x { color: var(--dz-muted); }

/* Workspace */
.tm-work { display: grid; grid-template-columns: minmax(0, 1fr) 21rem; gap: 1rem; align-items: start; }
.tm-stage { position: relative; min-width: 0; }
.tm-skip { position: absolute; z-index: 900; top: 0.5rem; left: 50%; transform: translateX(-50%); padding: 0.5rem 1rem; border-radius: 999px; background: var(--dz-ink); color: var(--dz-bg); font-weight: 700; text-decoration: none; }
.tm-skip:not(:focus) { width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.tm-frame { position: relative; isolation: isolate; overflow: hidden; border: 1px solid var(--dz-line-strong); border-radius: 18px; background: #0b0d0c; }
.tm-canvas { width: 100%; height: clamp(26rem, 72svh, 44rem); background: #0b0d0c; outline: none; }
.tm-canvas:focus-visible { box-shadow: inset 0 0 0 2px var(--dz-ink); }
.tm-controls { position: absolute; z-index: 800; top: 0.75rem; right: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.tm-controls button { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border: 1px solid var(--dz-line-strong); border-radius: 10px; background: rgba(11, 13, 12, 0.82); color: var(--dz-ink); font: inherit; font-size: 1.375rem; line-height: 1; cursor: pointer; }
.tm-controls button svg { width: 1.25rem; height: 1.25rem; }
.tm-controls button:hover:not(:disabled) { background: rgba(40, 46, 44, 0.92); }
.tm-controls button:disabled { opacity: 0.4; cursor: default; }
.tm-controls button[aria-pressed='true'] { border-color: var(--dz-teal); color: var(--dz-teal); }
.tm-hud { position: absolute; z-index: 800; top: 0.75rem; left: 0.75rem; right: 4.25rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; pointer-events: none; }
.tm-hud > * { pointer-events: auto; }
.tm-hud-btn { display: inline-flex; align-items: center; gap: 0.35rem; min-height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--dz-line-strong); border-radius: 11px; background: rgba(11, 13, 12, 0.88); color: var(--dz-ink); font: inherit; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.tm-hud-btn svg { width: 1.1rem; height: 1.1rem; }
.tm-hud-btn[aria-expanded='true'] { border-color: var(--dz-ink); background: rgba(40, 46, 44, 0.95); }
.tm-view { display: inline-flex; gap: 2px; padding: 3px; border: 1px solid var(--dz-line-strong); border-radius: 11px; background: rgba(11, 13, 12, 0.88); }
.tm-view button { min-height: 2.5rem; padding: 0 0.875rem; border: 0; border-radius: 8px; background: none; color: var(--dz-muted); font: inherit; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.tm-view button:hover { color: var(--dz-ink); }
.tm-view button[aria-pressed='true'] { background: var(--dz-ink); color: var(--dz-bg); }
.tm-cursor { padding: 0.3rem 0.6rem; border: 1px solid var(--dz-line); background: rgba(11, 13, 12, 0.8); color: var(--dz-teal); font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; pointer-events: none !important; }
.tm-only { position: absolute; z-index: 810; left: 50%; bottom: 0.75rem; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.25rem 0.25rem 0.875rem; border: 1px solid var(--dz-accent); border-radius: 999px; background: rgba(11, 13, 12, 0.92); color: var(--dz-ink); font-size: 0.875rem; font-weight: 700; white-space: nowrap; }
.tm-only button { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border: 0; border-radius: 50%; background: none; color: var(--dz-ink); cursor: pointer; }
.tm-only button:hover { background: rgba(233, 230, 214, 0.12); }
.tm-only svg { width: 1rem; height: 1rem; }
.tm-open-full { position: absolute; z-index: 810; left: 0.75rem; bottom: 0.75rem; display: inline-flex; align-items: center; gap: 0.5rem; min-height: 3rem; padding: 0 1.125rem; border: 0; border-radius: 999px; background: var(--dz-ink); color: var(--dz-bg); font: inherit; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; box-shadow: 0 2px 10px #000a; cursor: pointer; }
.tm-open-full svg { width: 1.1rem; height: 1.1rem; }
.tm--touch.tm--narrow:not(.tm--full) .tm-only { bottom: 4.5rem; }
.tm-layers-panel { position: absolute; z-index: 850; top: 0.5rem; right: 4rem; width: min(23rem, calc(100% - 4.75rem)); max-height: calc(100% - 1rem); overflow: auto; border: 1px solid var(--dz-line-strong); border-radius: 14px; background: rgba(20, 24, 23, 0.98); box-shadow: 0 8px 28px #000b; scrollbar-width: thin; }
.tm-loading { position: absolute; z-index: 700; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 0.5rem 0.875rem; background: rgba(11, 13, 12, 0.85); border: 1px solid var(--dz-line); font-size: 0.75rem !important; letter-spacing: 0.1em; text-transform: uppercase; }
.tm-error { position: absolute; inset: 0; z-index: 900; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.625rem; padding: 2rem; background: #111413; text-align: center; }
.tm-error span { color: var(--dz-muted); }
.tm-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1.25rem; margin-top: 0.625rem; color: var(--dz-muted); font-size: 0.85rem; }
.tm-legend-tier { display: inline-flex; align-items: center; gap: 0.45rem; }
.tm-legend-tier i { display: inline-grid; place-items: center; width: 1rem; height: 1rem; border: 2px solid var(--tm-report); border-radius: 4px; background: rgba(11, 13, 12, 0.9); }
.tm-legend-tier i.is-approx, .tm-legend-tier i.is-area { border-style: dashed; }
.tm-legend-tier i.is-area { border-color: color-mix(in srgb, var(--tm-report) 70%, transparent); }
.tm-legend-tier .tm-legend-chip { width: auto; min-width: 1.4rem; height: 1.1rem; padding: 0 0.3rem; border: 0; background: var(--tm-report); color: #15120a; font: 800 0.7rem/1 system-ui, sans-serif; }
.tm-legend-route { display: inline-flex; align-items: center; gap: 0.4rem; }
.tm-legend-route i { width: 1.4rem; height: 4px; border-radius: 2px; background: var(--tm-route); box-shadow: 0 0 0 1.5px #0b0d0c; }
.tm-legend-edge, .tm-legend-none { display: inline-flex; align-items: center; gap: 0.45rem; }
.tm-legend-edge i, .tm-legend-none i { display: inline-block; width: 1.4rem; height: 0.8rem; border-radius: 3px; }
.tm-legend-edge i { border: 2px dashed var(--tm-extreme); }
.tm-legend-none i { border: 1px solid var(--dz-line-strong); background: repeating-linear-gradient(135deg, transparent 0 3px, rgba(233, 230, 214, 0.12) 3px 4px); }
.tm-legend-note { margin-top: 0.25rem !important; max-width: 48rem !important; font-size: 0.85rem !important; color: var(--dz-muted) !important; }

/* Panel: the card on top, then the list. */
.tm-panel { min-width: 0; max-height: calc(clamp(26rem, 72svh, 44rem) + 0.5rem); overflow: auto; border: 1px solid var(--dz-line); border-radius: 18px; background: rgba(20, 24, 23, 0.82); outline: none; scrollbar-width: thin; scrollbar-color: var(--dz-line-strong) transparent; }
.tm-sheet-top { display: none; }
.tm-results-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.875rem 1.125rem 0.375rem; }
.tm-results-head h3 { margin: 0; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tm-results-head span { font-size: 0.75rem; color: var(--dz-muted); }
.tm-sub { margin: 0.5rem 1.125rem 0.125rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.tm-list-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.75rem; padding: 0 1.125rem 0.375rem; }
.tm-seg { display: inline-flex; gap: 2px; padding: 2px; border: 1px solid var(--dz-line-strong); border-radius: 9px; }
.tm-seg button { min-height: 2.25rem; padding: 0 0.625rem; border: 0; border-radius: 7px; background: none; color: var(--dz-muted); font: inherit; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.tm-seg button[aria-pressed='true'] { background: rgba(233, 230, 214, 0.16); color: var(--dz-ink); }
.tm-check { display: inline-flex; align-items: center; gap: 0.4rem; min-height: 2.5rem; font-size: 0.875rem; cursor: pointer; }
.tm-check input { width: 1rem; height: 1rem; accent-color: var(--dz-teal); }
.tm-hint { padding: 0 1.125rem 0.375rem; font-size: 0.85rem !important; color: var(--dz-muted) !important; }
.tm-empty { padding: 0.25rem 1.125rem 1rem; color: var(--dz-muted) !important; font-size: 0.925rem !important; }
.tm-group-head { margin: 0.375rem 0.5rem 0; }
.tm-group-btn { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; width: 100%; min-height: 2.25rem; padding: 0.25rem 0.625rem; border: 0; border-left: 2px solid var(--tm-t, var(--dz-line-strong)); background: none; color: var(--dz-ink); font: inherit; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-align: left; cursor: pointer; }
.tm-group-btn .dmz-mono { font-size: 0.68rem; font-weight: 500; color: var(--dz-muted); }
span.tm-group-btn { cursor: default; }
.tm-list { list-style: none; margin: 0; padding: 0 0.5rem 0.5rem; }
.tm-list button { display: flex; align-items: center; gap: 0.625rem; width: 100%; min-height: 3.25rem; padding: 0.45rem 0.625rem; border: 1px solid transparent; border-radius: 10px; background: none; color: var(--dz-ink); font: inherit; font-size: 0.975rem; line-height: 1.25; text-align: left; cursor: pointer; }
.tm-list button:hover { background: rgba(233, 230, 214, 0.07); }
.tm-list button[aria-pressed='true'] { border-color: var(--dz-line-strong); background: rgba(233, 230, 214, 0.12); }
.tm-list small { display: block; margin-top: 0.15rem; font-size: 0.8rem; color: var(--dz-muted); }
.tm-list-text { flex: 1; min-width: 0; }
.tm-list-glyph { display: grid; place-items: center; flex: none; width: 2rem; height: 2rem; border: 2px solid var(--tm-c, var(--dz-line)); border-radius: 7px; background: rgba(10, 12, 11, 0.5); color: var(--tm-c, var(--dz-ink)); }
.tm-list-glyph.is-approx, .tm-list-glyph.is-area { border-style: dashed; }
.tm-list-glyph.is-place { border: 1px solid var(--dz-line); border-radius: 50%; color: var(--tm-t, var(--tm-c, var(--dz-ink))); }
.tm-list-glyph svg { width: 1.05rem; height: 1.05rem; }
.tm-mark { flex: none; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; }
.tm-mark.is-held { background: var(--dz-green); color: #0b0d0c; }
.tm-mark.is-used { border: 1px solid var(--dz-line-strong); color: var(--dz-muted); }
.tm-tier h4 { margin: 0.5rem 1.125rem 0.125rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tm-t); }
.tm-text { min-height: 2.25rem; padding: 0 0.125rem; border: 0; background: none; color: var(--dz-ink); font: inherit; font-size: 0.875rem; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }

.tm-credits { margin-top: 0.875rem; color: var(--dz-muted); font-size: 0.875rem; }
.tm-credits summary { min-height: 2.25rem; cursor: pointer; }
.tm-credits ul { margin: 0.25rem 0 0.5rem; padding-left: 1.1rem; display: grid; gap: 0.3rem; }
.tm-credits p { max-width: 46rem; font-size: 0.875rem !important; color: var(--dz-muted) !important; }
.tm-credits a { color: var(--dz-ink); text-underline-offset: 0.2em; }
.tm :is(button, input, a, summary):focus-visible { outline: 2px solid var(--dz-ink); outline-offset: 2px; }

/* Full screen: the map fills the window, the panel on the right. */
.tm--full { position: fixed; inset: 0; z-index: 1000; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 0.5rem; padding: max(0.5rem, env(safe-area-inset-top)) max(0.5rem, env(safe-area-inset-right)) max(0.5rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left)); background: var(--dz-bg); overscroll-behavior: contain; }
.tm--full .tm-tools { margin: 0; }
.tm--full .tm-work { min-height: 0; grid-template-columns: minmax(0, 1fr) 22rem; align-items: stretch; }
.tm--full .tm-stage, .tm--full .tm-frame { height: 100%; }
.tm--full .tm-canvas { height: 100%; }
.tm--full .tm-panel { max-height: none; height: 100%; }

/* Leaflet content */
.tm :deep(.leaflet-container) { background: #0b0d0c; font: inherit; }
.tm :deep(.leaflet-image-layer) { max-width: none !important; max-height: none !important; margin: 0 !important; border-radius: 0 !important; cursor: grab; }
.tm :deep(.tm-grid-line) { stroke: rgba(159, 216, 207, 0.32); }
.tm :deep(.tm-grid-label) { display: grid; place-items: center; color: var(--dz-teal); font: 700 12px/1 ui-monospace, 'SFMono-Regular', Menlo, monospace; text-shadow: 0 1px 2px #000; pointer-events: none; }
.tm :deep(.tm-square) { stroke: var(--dz-accent); fill: var(--dz-accent); }
.tm :deep(.tm-square-tag) { pointer-events: none; }
.tm :deep(.tm-square-tag span) { display: inline-block; padding: 1px 6px; border-radius: 4px; background: var(--dz-accent); color: #15120a; font: 700 11px/1.5 system-ui, sans-serif; white-space: nowrap; }
.tm :deep(.tm-area) { stroke: var(--dz-accent); stroke-opacity: 0.95; fill: var(--dz-accent); fill-opacity: 0.1; }
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
.tm :deep(.tm-route) { stroke: var(--tm-route); stroke-linecap: round; stroke-linejoin: round; }
.tm :deep(.tm-route.is-on) { filter: drop-shadow(0 0 4px rgba(255, 122, 198, 0.6)); }
.tm :deep(.tm-route-casing) { stroke: #0b0d0c; stroke-opacity: 0.75; stroke-linecap: round; stroke-linejoin: round; }
.tm :deep(.tm-route-hit) { stroke: #000; cursor: pointer; }
.tm :deep(.tm-route-stop) { stroke: #0b0d0c; fill: var(--tm-route); fill-opacity: 1; }
.tm :deep(.tm-route-stop.is-end) { fill: #0b0d0c; stroke: var(--tm-route); stroke-width: 2.5; }
.tm :deep(:is(.tm-route, .tm-route-casing, .tm-route-stop).is-dim) { opacity: 0.3; }
.tm :deep(.tm-stop) { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: var(--tm-route); color: #1a0b14; font: 800 11px/1 system-ui, sans-serif; box-shadow: 0 0 0 1.5px #0b0d0c, 0 1px 4px #000c; }
.tm :deep(.tm-stop.is-end) { background: #0b0d0c; color: var(--tm-route); box-shadow: 0 0 0 2px var(--tm-route), 0 1px 4px #000c; }
.tm :deep(.tm-stop.is-on) { box-shadow: 0 0 0 2px #0b0d0c, 0 0 0 4px #f7f5ea, 0 0 14px rgba(247, 245, 234, 0.55); }
.tm :deep(.tm-marker) { background: none; border: 0; outline: none; }
.tm :deep(.tm-marker.is-faded) { opacity: 0.35; }
/* Official places and services: circles and diamonds. */
.tm :deep(.tm-pin) { position: relative; display: grid; place-items: center; width: 22px; height: 22px; color: var(--tm-c, var(--dz-ink)); }
.tm :deep(.tm-glyph) { display: grid; place-items: center; width: 20px; height: 20px; border: 1.5px solid currentColor; border-radius: 50%; background: rgba(11, 13, 12, 0.88); box-shadow: 0 1px 4px #000c; }
.tm :deep(.tm-glyph svg), .tm :deep(.tm-tag-box svg), .tm :deep(.tm-chip-in svg) { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
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
.tm :deep(.tm-pin.is-on .tm-glyph) { box-shadow: 0 0 0 2px #0b0d0c, 0 0 0 4px #f7f5ea, 0 0 14px rgba(247, 245, 234, 0.55); }
.tm :deep(.tm-pin.is-on .tm-label) { background: #f7f5ea; color: #0b0d0c; text-shadow: none; }
.tm :deep(.tm-pin.is-dim) { opacity: 0.28; }
.tm :deep(.tm-marker:focus-visible .tm-glyph) { outline: 2px solid #fff; outline-offset: 3px; }
/* Reported sites: rounded-square tags, solid when pinned, dashed when rough or somewhere-in. */
.tm :deep(.tm-tag) { position: relative; display: grid; place-items: center; width: 22px; height: 22px; color: var(--tm-c, var(--tm-report)); }
.tm :deep(.tm-tag::after) { content: ''; position: absolute; inset: -7px; }
.tm--touch :deep(.tm-tag::after) { inset: -11px; }
.tm :deep(.tm-tag-box) { display: grid; place-items: center; width: 22px; height: 22px; border: 2px solid currentColor; border-radius: 6px; background: rgba(11, 13, 12, 0.92); box-shadow: 0 1px 4px #000d; }
.tm :deep(.tm-tag.is-approx .tm-tag-box), .tm :deep(.tm-tag.is-area .tm-tag-box) { border-style: dashed; }
.tm :deep(.tm-tag.is-area .tm-tag-box) { background: rgba(11, 13, 12, 0.78); }
.tm :deep(.tm-tag.is-on .tm-tag-box) { box-shadow: 0 0 0 2px #0b0d0c, 0 0 0 4px #f7f5ea, 0 0 14px rgba(247, 245, 234, 0.55); }
.tm :deep(.tm-tag.is-on .tm-label) { left: calc(100% + 6px); background: #f7f5ea; color: #0b0d0c; text-shadow: none; }
.tm :deep(.tm-tag.is-hot .tm-tag-box) { background: color-mix(in srgb, currentColor 30%, #0b0d0c); box-shadow: 0 0 0 2px #f7f5ea; }
.tm :deep(.tm-tag.is-dim) { opacity: 0.28; }
.tm :deep(.tm-tag.is-used) { opacity: 0.45; }
.tm :deep(.tm-tag.is-used::before) { content: '✓'; position: absolute; z-index: 1; right: -6px; top: -6px; display: grid; place-items: center; width: 13px; height: 13px; border-radius: 50%; background: #e9e6d6; color: #0b0d0c; font: 900 9px/1 system-ui, sans-serif; }
.tm :deep(.tm-tag.is-held::before) { content: ''; position: absolute; z-index: 1; right: -4px; top: -4px; width: 10px; height: 10px; border-radius: 50%; background: var(--dz-green); box-shadow: 0 0 0 2px #0b0d0c; }
.tm :deep(.tm-tag--more .tm-tag-box) { width: auto; min-width: 26px; padding: 0 4px; border-color: var(--dz-ink); color: var(--dz-ink); font: 800 11px/1 system-ui, sans-serif; }
.tm :deep(.tm-marker:focus-visible .tm-tag-box), .tm :deep(.tm-marker:focus-visible .tm-chip-in) { outline: 2px solid #fff; outline-offset: 3px; }
/* Chips hold several sites; they sit up and right of a place's diamond. */
.tm :deep(.tm-marker--chip), .tm :deep(.tm-marker--fan) { overflow: visible; }
.tm :deep(.tm-chip-m) { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); }
.tm :deep(.tm-chip-m.is-beside) { transform: translate(5px, calc(-100% - 5px)); }
.tm :deep(.tm-chip-in) { position: relative; display: inline-flex; align-items: center; gap: 1px; height: 20px; padding: 0 5px 0 4px; border: 2px dashed #15120a; border-radius: 6px; background: var(--tm-report); color: #15120a; box-shadow: 0 1px 4px #000b; white-space: nowrap; cursor: pointer; }
.tm :deep(.tm-chip-in::after) { content: ''; position: absolute; inset: -8px; }
.tm--touch :deep(.tm-chip-in::after) { inset: -12px; }
.tm :deep(.tm-chip-m.is-pinned .tm-chip-in) { border-style: solid; border-color: var(--tm-report); }
.tm :deep(.tm-chip-in b) { margin-left: 2px; font: 800 11px/1 system-ui, sans-serif; }
.tm :deep(.tm-chip-m.is-open .tm-chip-in) { padding: 0 3px; background: #f7f5ea; border: 2px solid #0b0d0c; }
.tm :deep(.tm-chip-m.is-open .tm-chip-in svg) { width: 13px; height: 13px; }
.tm :deep(.tm-chip-m.is-hot .tm-chip-in) { box-shadow: 0 0 0 2px #f7f5ea, 0 1px 4px #000b; }
.tm :deep(.tm-chip-m.is-dim) { opacity: 0.3; }
/* The fan: members on rings, each with a leg to its own spot. */
.tm :deep(.tm-fan-slot) { position: absolute; left: 0; top: 0; width: 0; height: 0; }
.tm :deep(.tm-fan-slot > .tm-tag) { position: absolute; left: -11px; top: -11px; }
.tm :deep(.tm-leg) { position: absolute; left: 0; top: -1px; height: 0; border-top: 2px solid rgba(247, 245, 234, 0.85); transform-origin: 0 50%; pointer-events: none; filter: drop-shadow(0 0 1px #000); }
.tm :deep(.tm-leg.is-approx), .tm :deep(.tm-leg.is-area) { border-top-style: dotted; }
.tm :deep(.tm-fan-dot) { stroke: #0b0d0c; fill: #e9e6d6; fill-opacity: 1; }
.tm :deep(.tm-tip) { padding: 0.3rem 0.55rem; border: 1px solid var(--dz-line-strong); border-radius: 6px; background: rgba(11, 13, 12, 0.94); box-shadow: 0 2px 6px #0007; color: var(--dz-ink); font-size: 12.5px; font-weight: 500; line-height: 1.4; white-space: nowrap; }
.tm :deep(.tm-tip::before) { display: none; }
/* Zoomed out, only major locations keep their names and services shrink to dots. */
.tm :deep([data-detail='far'] .tm-pin--area .tm-label), .tm :deep([data-detail='far'] .tm-pin--compound .tm-label), .tm :deep([data-detail='far'] .tm-pin--fortress .tm-label) { display: none; }
.tm :deep([data-detail='far'] .tm-pin:not(.tm-pin--poi, .tm-pin--compound, .tm-pin--area, .tm-pin--fortress) .tm-glyph) { width: 9px; height: 9px; border: 0; background: currentColor; box-shadow: 0 0 0 1.5px #0b0d0c; }
.tm :deep([data-detail='far'] .tm-pin:not(.tm-pin--poi, .tm-pin--compound, .tm-pin--area, .tm-pin--fortress) .tm-glyph svg) { display: none; }
.tm :deep([data-detail='far'] .tm-chip-in svg ~ svg) { display: none; }
.tm :deep([data-detail='far'] .tm-chip-in) { height: 17px; }
.tm :deep([data-detail='far'] .tm-tag), .tm :deep([data-detail='far'] .tm-tag-box) { width: 18px; height: 18px; }
.tm :deep([data-detail='far'] .tm-stop) { width: 16px; height: 16px; font-size: 9.5px; }
.tm :deep([data-detail='far'] .tm-pin--poi .tm-label) { font-size: 11px; padding: 0 4px; }
.tm :deep([data-detail='far'] .tm-marker:has(> .is-twin:not(.is-on))) { visibility: hidden; }
.tm :deep([data-detail='mid'] .tm-pin--area .tm-label) { display: none; }
.tm :deep([data-detail] .tm-pin.is-on .tm-label) { display: block; }

/* Narrow: the panel moves under the map. */
@container (max-width: 46rem) {
  .tm-work { grid-template-columns: minmax(0, 1fr); }
  .tm-panel { max-height: none; scroll-margin-top: 1rem; }
  .tm-list { max-height: 26rem; overflow: auto; }
  .tm-canvas { height: min(60svh, 34rem); }
  .tm-quick { flex-wrap: nowrap; overflow-x: auto; padding: 0 0.25rem 0.25rem; margin: 0 -0.25rem; scrollbar-width: none; }
  .tm-q--layers { margin-left: 0; }
  .tm-search { padding: 0 0.875rem; }
  .tm-search input { font-size: 1rem; }
  .tm-layers-panel { inset: 0; width: auto; max-height: none; border-radius: 0; border: 0; }
  .tm-legend { font-size: 0.8rem; gap: 0.375rem 1rem; }
  .tm :deep([data-detail='far'] .tm-level:not(.is-inside)) { display: none; }
}
/* Inline on a phone the map does not take drags, so the page scrolls past it. */
.tm--touch.tm--narrow:not(.tm--full) .tm-canvas { touch-action: pan-y; }

/* Full screen on a phone: the map fills the window and the panel is a sheet. */
.tm--sheet { display: block; padding: 0; }
.tm--sheet .tm-work { display: block; height: 100%; }
.tm--sheet .tm-stage { position: absolute; inset: 0; }
.tm--sheet .tm-frame { height: 100%; border: 0; border-radius: 0; }
.tm--sheet .tm-hud { top: max(0.5rem, env(safe-area-inset-top)); left: 0.5rem; right: 0.5rem; }
.tm--sheet .tm-controls { top: auto; bottom: calc(var(--tm-sheet-h, 11rem) + 0.75rem); right: max(0.5rem, env(safe-area-inset-right)); }
.tm--sheet-peek.has-pick .tm-controls { flex-direction: row; }
.tm--sheet-full .tm-controls { display: none; }
.tm--sheet .tm-controls button { width: 3rem; height: 3rem; }
.tm--sheet .tm-hud-btn, .tm--sheet .tm-view button { min-height: 3rem; }
.tm--sheet .tm-only { top: calc(max(0.5rem, env(safe-area-inset-top)) + 3.75rem); bottom: auto; }
.tm--sheet .tm-layers-panel { z-index: 1100; }
.tm--sheet .tm-panel { position: absolute; z-index: 1050; left: 0; right: 0; bottom: 0; height: calc(11rem + env(safe-area-inset-bottom)); max-height: none; padding-bottom: env(safe-area-inset-bottom); border: 1px solid var(--dz-line-strong); border-bottom: 0; border-radius: 18px 18px 0 0; background: rgba(20, 24, 23, 0.97); box-shadow: 0 -6px 24px #0009; }
.tm--sheet-full .tm-panel { height: calc(100dvh - 4.5rem); }
.tm--sheet-peek.has-pick .tm-panel { height: auto; max-height: min(34rem, calc(100dvh - 4.5rem)); }
.tm--sheet-peek.has-pick .tm-quick, .tm--sheet-peek.has-pick .tm-visit { display: none; }
.tm--sheet .tm-sheet-top { position: sticky; top: 0; z-index: 2; display: grid; gap: 0.375rem; padding: 0 0.75rem 0.5rem; background: rgba(20, 24, 23, 0.98); }
.tm--sheet .tm-tools { margin: 0; gap: 0.5rem; }
.tm--sheet .tm-search { min-height: 2.75rem; }
.tm-handle { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; min-height: 2.75rem; border: 0; background: none; color: var(--dz-muted); font: inherit; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.tm-handle i { display: block; width: 2.5rem; height: 4px; border-radius: 2px; background: var(--dz-line-strong); }
@media (max-height: 30rem) and (orientation: landscape) {
  .tm--sheet .tm-stage { right: 20rem; }
  .tm--sheet .tm-panel, .tm--sheet-full .tm-panel { top: 0; left: auto; width: 20rem; height: 100%; border-radius: 0; border-left: 1px solid var(--dz-line-strong); }
  .tm--sheet .tm-handle { display: none; }
  .tm--sheet .tm-controls, .tm--sheet-peek.has-pick .tm-controls { top: 0.75rem; bottom: auto; flex-direction: column; }
  .tm--sheet-full .tm-controls { display: flex; }
}
/* Touch: every control is at least 44px tall. */
@media (pointer: coarse) {
  .tm-text, .tm-seg button, .tm-group-btn, .tm-check { min-height: 2.75rem; }
  .tm-only button { width: 2.75rem; height: 2.75rem; }
}
@media (prefers-reduced-motion: reduce) { .tm :deep(*) { transition: none !important; animation: none !important; } }
</style>

<style>
/* Full screen keeps the page behind it still. */
html.tm-locked, html.tm-locked body { overflow: hidden; overscroll-behavior: none; }
/* The site's floating buttons would sit over the map, so they step aside until it closes. */
html.tm-locked :is(.back-to-top, .settings-trigger, .sp-trigger, .dmz-dock, .dmz-rail) { visibility: hidden; }
</style>
