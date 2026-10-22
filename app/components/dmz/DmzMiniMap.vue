<script setup lang="ts">
import { NuxtLink } from '#components'
import { hajinMap, hajinPin, toArt, squareCentre } from '#shared/dmz-map.mjs'

// A small picture of Hajin cut from the Tac-Map art, centred on the places or
// squares it marks. Clicking it opens the full Tac-Map on the first place.
const props = withDefaults(defineProps<{ pins?: string[], squares?: string[], label: string, names?: boolean, link?: boolean }>(), { pins: () => [], squares: () => [], names: true, link: true })

const { width: W, height: H, grid } = hajinMap
const cellArt = grid.cell * hajinMap.toArt.scale
const places = computed(() => props.pins.map(id => hajinPin(id)).filter(Boolean).map(pin => ({ id: pin.id, name: pin.name, threat: pin.threat?.toLowerCase(), at: toArt(pin.at) as [number, number] })))
const boxes = computed(() => props.squares.map(square => {
  const [x, y] = toArt(squareCentre(square)) as [number, number]
  return { square, x: x - cellArt / 2, y: y - cellArt / 2 }
}))

// Fit every mark with some ground around it, at 4:3, inside the art.
const view = computed(() => {
  const points = [...places.value.map(place => place.at), ...boxes.value.flatMap(box => [[box.x, box.y], [box.x + cellArt, box.y + cellArt]])]
  if (!points.length) return { x: 0, y: 0, w: W, h: H }
  const xs = points.map(([x]) => x), ys = points.map(([, y]) => y)
  let x0 = Math.min(...xs) - 70, x1 = Math.max(...xs) + 70, y0 = Math.min(...ys) - 60, y1 = Math.max(...ys) + 60
  let w = Math.max(x1 - x0, 260), h = Math.max(y1 - y0, 195)
  if (w / h > 4 / 3) h = w * 3 / 4
  else w = h * 4 / 3
  w = Math.min(w, W); h = Math.min(h, H)
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  return { x: Math.min(Math.max(cx - w / 2, 0), W - w), y: Math.min(Math.max(cy - h / 2, 0), H - h), w, h }
})
const unit = computed(() => view.value.w / 300)
// Names near an edge hang inward so they stay inside the picture, and a name
// that would run into one already placed drops below its marker instead.
const labels = computed(() => {
  const { x: vx, y: vy, w } = view.value, u = unit.value
  const placed: { x0: number, x1: number, y: number }[] = []
  return Object.fromEntries(places.value.map(({ id, name, at: [x, y] }) => {
    const side = (x - vx) / w
    const anchor = side < 0.3 ? 'start' : side > 0.7 ? 'end' : 'middle'
    const lx = anchor === 'start' ? x - u * 12 : anchor === 'end' ? x + u * 12 : x
    const width = name.length * u * 7
    const x0 = anchor === 'start' ? lx : anchor === 'end' ? lx - width : lx - width / 2
    const clash = (ly: number) => placed.some(box => Math.abs(box.y - ly) < u * 12 && x0 < box.x1 && x0 + width > box.x0)
    let ly = y - vy < u * 34 ? y + u * 28 : y - u * 18
    if (clash(ly)) ly = ly < y ? y + u * 28 : y - u * 18
    placed.push({ x0, x1: x0 + width, y: ly })
    return [id, { 'x': lx, 'y': ly, 'text-anchor': anchor }]
  }))
})
const to = computed(() => places.value[0] ? { path: '/dmz/hajin', query: { pin: places.value[0].id }, hash: '#map' } : { path: '/dmz/hajin', hash: '#map' })
</script>

<template>
  <figure class="mm">
    <component :is="link ? NuxtLink : 'div'" :to="link ? to : undefined" class="mm-frame" :aria-label="link ? `${label}. Open the Tac-Map` : undefined">
      <svg :viewBox="`${view.x} ${view.y} ${view.w} ${view.h}`" role="img" :aria-label="label" preserveAspectRatio="xMidYMid slice">
        <image :href="hajinMap.image" :width="W" :height="H" class="mm-art" />
        <rect v-for="box in boxes" :key="box.square" class="mm-square" :x="box.x" :y="box.y" :width="cellArt" :height="cellArt" :stroke-width="unit * 1.5" />
        <text v-for="box in boxes" :key="`${box.square}-t`" class="mm-square-tag dmz-mono" :x="box.x + unit * 4" :y="box.y + unit * 13" :font-size="unit * 11">{{ box.square }}</text>
        <g v-for="place in places" :key="place.id" :data-threat="place.threat">
          <circle class="mm-ring" :cx="place.at[0]" :cy="place.at[1]" :r="unit * 13" :stroke-width="unit * 2" />
          <rect class="mm-dot" :x="place.at[0] - unit * 3.5" :y="place.at[1] - unit * 3.5" :width="unit * 7" :height="unit * 7" :transform="`rotate(45 ${place.at[0]} ${place.at[1]})`" />
          <text v-if="names" class="mm-name" v-bind="labels[place.id]" :font-size="unit * 11" :stroke-width="unit * 3">{{ place.name }}</text>
        </g>
      </svg>
    </component>
    <figcaption class="dmz-mono">{{ label }}</figcaption>
  </figure>
</template>

<style scoped>
.mm { margin: 0; display: grid; gap: 0.375rem; }
.mm-frame { display: block; overflow: hidden; aspect-ratio: 4 / 3; border: 1px solid var(--dz-line-strong); border-radius: 12px; background: #0b0d0c; }
a.mm-frame:hover { border-color: var(--dz-ink); }
.mm svg { display: block; width: 100%; height: 100%; }
.mm-art { filter: saturate(0.7) brightness(0.82); }
.mm [data-threat='low'] { --mm-t: #a9b39a; }
.mm [data-threat='medium'] { --mm-t: #d8c47c; }
.mm [data-threat='high'] { --mm-t: #e8a04f; }
.mm [data-threat='critical'] { --mm-t: #ef7a5a; }
.mm [data-threat='extreme'] { --mm-t: #ff5468; }
.mm-ring { fill: rgba(11, 13, 12, 0.25); stroke: var(--mm-t, var(--dz-accent)); }
.mm-dot { fill: var(--mm-t, var(--dz-accent)); }
.mm-name { fill: var(--dz-ink); stroke: rgba(11, 13, 12, 0.85); paint-order: stroke; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.mm-square { fill: rgba(221, 179, 99, 0.12); stroke: var(--dz-accent); stroke-dasharray: 4 3; }
.mm-square-tag { fill: var(--dz-accent); font-weight: 700; }
.mm figcaption { font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
</style>
