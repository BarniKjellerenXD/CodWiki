<script setup lang="ts">
import { dmzStations, dmzRailBreaks, dmzBulletin, DMZ_CHECKED } from '#shared/dmz.mjs'

// The DMZ station menu. On /dmz it is the start screen; under 900px it opens
// over the page as the station sheet. Wide screens preview the selected
// station on the right; on phones the current station is expanded and one tap
// opens any station. The Zombies | DMZ pill in the header is the way out.
const props = defineProps<{ overlay?: boolean, start?: string, current?: string }>()
const emit = defineEmits<{ close: [] }>()

type Station = (typeof dmzStations)[number] & { index: string }
const stations: Station[] = dmzStations.map((station, i) => ({ ...station, index: `${String(i + 1).padStart(2, '0')}.00` }))
const known = (id?: string) => !!id && stations.some(station => station.id === id)
const active = ref(known(props.start) ? props.start! : known(props.current) ? props.current! : stations[0]!.id)
const selected = computed(() => stations.find(station => station.id === active.value)!)
const root = ref<HTMLElement>()
const list = ref<HTMLElement>()
const compact = () => window.matchMedia('(max-width: 899px)').matches
// current lights the station; only its own page hides the Open pill. Intel's
// shelves light Intel but still need a way back to its home.
const route = useRoute()
const here = (station: Station) => station.route === (route.path.replace(/\/+$/, '') || '/')
const { openSpotlight, prefetchSpotlight } = useSpotlight()
let previousOverflow = ''

// On phones hover and focus leave the rows alone, so nothing grows under a tap.
function hover(id: string) { if (!compact()) active.value = id }
function onFocus(id: string) { if (!compact()) active.value = id }
function open(station: Station) {
  if (!station.route) return
  if (props.overlay) emit('close')
  navigateTo(station.route)
}
// Search closes the sheet first, so focus is back on the dock before Spotlight opens.
function search() {
  emit('close')
  nextTick(() => openSpotlight())
}
function onItemClick(event: MouseEvent, station: Station) {
  if (!station.route) { active.value = station.id; return }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  open(station)
}
function onOpenClick(event: MouseEvent, station: Station) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  open(station)
}
function items() { return [...(list.value?.querySelectorAll<HTMLElement>('.sm-item') || [])] }
function onListKey(event: KeyboardEvent) {
  const all = items()
  const focused = all.indexOf(document.activeElement as HTMLElement)
  const index = focused >= 0 ? focused : stations.findIndex(station => station.id === active.value)
  const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: all.length - 1 }[event.key]
  if (next === undefined || !all.length) return
  event.preventDefault()
  all[(next + all.length) % all.length]?.focus()
}
// On /dmz nothing has focus yet, so the arrow keys pick up from the selected station.
function onPageKey(event: KeyboardEvent) {
  if (event.defaultPrevented || (document.activeElement && document.activeElement !== document.body)) return
  onListKey(event)
}
function onRootKey(event: KeyboardEvent) {
  if (!props.overlay) return
  if (event.key === 'Escape') { event.preventDefault(); emit('close'); return }
  if (event.key !== 'Tab' || !root.value) return
  const focusable = [...root.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(el => el.offsetParent !== null)
  const first = focusable[0], last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
watch(active, () => nextTick(() => {
  if (compact()) list.value?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' })
}))
onMounted(() => {
  if (!props.overlay) { window.addEventListener('keydown', onPageKey); return }
  previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  nextTick(() => list.value?.querySelector<HTMLElement>('.is-active .sm-item')?.focus())
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onPageKey)
  if (props.overlay) document.documentElement.style.overflow = previousOverflow
})
</script>

<template>
  <div ref="root" class="sm" :class="{ 'sm--overlay': overlay }" :role="overlay ? 'dialog' : undefined" :aria-modal="overlay ? 'true' : undefined" :aria-labelledby="overlay ? 'dmz-menu-title' : undefined" @keydown="onRootKey">
    <div class="sm-panel">
      <header class="sm-head">
        <span class="sm-emblem" aria-hidden="true">CW</span>
        <div class="sm-mode" role="group" aria-label="Game mode">
          <NuxtLink to="/" class="sm-mode-opt">Zombies</NuxtLink>
          <span class="sm-mode-opt is-on">DMZ<span class="sr-only"> (current mode)</span></span>
        </div>
        <div v-if="overlay" class="sm-tools">
          <button type="button" class="sm-close sm-search" aria-label="Search CodWiki" aria-haspopup="dialog" @click="search" @pointerenter="prefetchSpotlight" @focus="prefetchSpotlight"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 17a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13z M15.5 15.5L21 21" /></svg></button>
          <button type="button" class="sm-close" aria-label="Close menu" @click="emit('close')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12 M18 6L6 18" /></svg></button>
        </div>
      </header>
      <component :is="overlay ? 'h2' : 'h1'" id="dmz-menu-title" class="sm-heading dmz-mono">Modern Warfare 4 · DMZ<span class="sr-only"> stations</span></component>

      <nav class="sm-nav" aria-label="DMZ stations">
        <ul ref="list" @keydown="onListKey">
          <li v-for="station in stations" :key="station.id" :class="{ 'is-active': station.id === active, 'is-break': dmzRailBreaks.includes(station.id) }">
            <component
              :is="station.route ? 'a' : 'button'"
              class="sm-item"
              :href="station.route || undefined"
              :type="station.route ? undefined : 'button'"
              :aria-current="here(station) ? 'page' : station.id === current ? 'true' : undefined"
              :aria-expanded="station.route ? undefined : String(station.id === active)"
              :aria-describedby="`sm-desc-${station.id}`"
              @mouseenter="hover(station.id)"
              @focus="onFocus(station.id)"
              @click="onItemClick($event, station)"
            >
              <template v-if="station.id === active">
                <span class="sm-band" aria-hidden="true" />
                <span class="sm-flare" aria-hidden="true" />
              </template>
              <span class="sm-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="station.icon" /></svg>
                <DmzLock v-if="station.locked" class="sm-lock" />
              </span>
              <span class="sm-text">
                <span v-if="station.id === active" class="sm-index dmz-mono" aria-hidden="true">{{ station.index }}</span>
                <span class="sm-label">{{ station.label }}<template v-if="station.id === active"><span class="sm-g1" aria-hidden="true">{{ station.label }}</span><span class="sm-g2" aria-hidden="true">{{ station.label }}</span></template></span>
                <span class="sm-sub dmz-mono"><span class="sr-only">, </span>{{ station.title }}</span>
              </span>
              <span v-if="station.locked" class="sr-only">, locked</span>
            </component>
            <span :id="`sm-desc-${station.id}`" class="sr-only">{{ station.desc }}</span>
            <div v-if="station.id === active" class="sm-inline">
              <p>{{ station.desc }}</p>
              <ul class="sm-facts dmz-mono"><li v-for="fact in station.facts" :key="fact">{{ fact }}</li></ul>
              <p v-if="station.locked" class="sm-locknote dmz-mono"><DmzLock /> {{ station.lockNote }}</p>
              <a v-else-if="!here(station)" :href="station.route" class="dmz-pill" @click="onOpenClick($event, station)">Open {{ station.label }}</a>
            </div>
          </li>
        </ul>
      </nav>

      <footer class="sm-foot">
        <p class="sm-keys dmz-mono" aria-hidden="true"><span><kbd class="dmz-kbd">↑↓</kbd> Select</span><span><kbd class="dmz-kbd">↵</kbd> Open</span><span v-if="overlay"><kbd class="dmz-kbd">ESC</kbd> Close</span></p>
      </footer>
    </div>

    <section class="sm-side" aria-label="Selected station">
      <p class="sm-pills dmz-mono"><span>MW4 · DMZ</span><span class="is-hot">Early access</span><span>Checked {{ DMZ_CHECKED }}</span></p>
      <div class="sm-toast">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 10v11 M8 6.5a6 6 0 0 0 0 8 M16 6.5a6 6 0 0 1 0 8 M5 3.5a10 10 0 0 0 0 14 M19 3.5a10 10 0 0 1 0 14" /></svg>
        <span><strong>{{ dmzBulletin.title }}</strong><small class="dmz-mono">{{ dmzBulletin.detail }}</small></span>
      </div>
      <div :key="selected.id" class="sm-preview">
        <span class="sm-preview-index dmz-mono">{{ selected.index }} · {{ selected.label }}</span>
        <p class="sm-preview-title">{{ selected.title }}</p>
        <p class="sm-preview-desc">{{ selected.desc }}</p>
        <ul class="sm-facts dmz-mono"><li v-for="fact in selected.facts" :key="fact">{{ fact }}</li></ul>
        <p v-if="selected.locked" class="sm-locknote dmz-mono"><DmzLock /> {{ selected.lockNote }}</p>
        <div class="sm-actions">
          <a v-if="selected.route && !here(selected)" :href="selected.route" class="dmz-pill" @click="onOpenClick($event, selected)">Open {{ selected.label }}</a>
          <button v-if="overlay" type="button" class="dmz-pill dmz-pill--ghost" @click="emit('close')">Close menu</button>
        </div>
      </div>
      <p class="sm-disclaimer dmz-mono">Unofficial fan companion. Not affiliated with Activision or Infinity Ward.</p>
    </section>
  </div>
</template>

<style scoped>
.sm { position: relative; display: grid; grid-template-columns: minmax(28rem, 46%) minmax(0, 1fr); min-height: 100vh; min-height: 100dvh; }
.sm--overlay { position: fixed; inset: 0; z-index: 80; overflow-y: auto; background: rgba(8, 10, 9, 0.82); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }

.sm-panel { position: relative; z-index: 1; display: flex; flex-direction: column; padding: 2rem 0 1.5rem; background: var(--dz-glass); -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px); border-right: 1px solid rgba(233, 230, 214, 0.12); border-radius: 0 2.75rem 2.75rem 0; }
.sm-head { display: flex; align-items: center; gap: 1.5rem; padding: 0 1.5rem 0 3.5rem; }
.sm-emblem { flex: none; display: grid; place-items: center; width: 5.25rem; height: 5.25rem; border-radius: 50%; border: 2px solid rgba(233, 230, 214, 0.45); background: rgba(10, 12, 11, 0.5); color: var(--dz-accent); font-weight: 800; font-size: 1.6rem; font-variation-settings: 'wdth' 125; }
.sm-mode { display: flex; border: 1px solid var(--dz-line-strong); border-radius: 999px; overflow: hidden; }
.sm-mode-opt { display: inline-flex; align-items: center; min-height: 2.75rem; padding: 0 1rem; color: #c2c3b6 !important; text-decoration: none; font-weight: 500; font-size: 1.0625rem; letter-spacing: 0.06em; text-transform: uppercase; font-variation-settings: 'wdth' 75; }
a.sm-mode-opt:hover { background: rgba(233, 230, 214, 0.1); color: #fff !important; }
.sm-mode-opt.is-on { background: var(--dz-ink); color: var(--dz-bg) !important; font-weight: 700; }
.sm-tools { margin-left: auto; flex: none; display: flex; gap: 0.5rem; }
.sm-close { flex: none; display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 50%; border: 1px solid var(--dz-line-strong); background: rgba(233, 230, 214, 0.1); color: var(--dz-ink); cursor: pointer; }
.sm-close svg { width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
.sm-heading { margin: 1rem 0 0.75rem; padding: 0 1.5rem 0 3.5rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }

.sm-nav ul { list-style: none; margin: 0; padding: 0; }
.sm-nav > ul { padding: 0.25rem 0 1rem; }
/* The same dividers as the rail: field tools | FOB stations | reading. */
.sm-nav > ul > li.is-break::before { content: ''; display: block; height: 1px; margin: 0.375rem 1.5rem 0.375rem 3.5rem; background: var(--dz-line); }
.sm-item { position: relative; display: flex; align-items: center; gap: 1.5rem; width: 100%; min-height: 3.5rem; padding: 0.25rem 1.5rem 0.25rem 3.5rem; border: 0; background: none; color: var(--dz-ink-2) !important; font: inherit; text-align: left; text-decoration: none; cursor: pointer; }
.sm-icon { position: relative; flex: none; display: flex; }
.sm-icon svg { width: 2rem; height: 2rem; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.sm-icon .sm-lock { position: absolute; right: -0.6rem; top: -0.4rem; width: 0.8rem; height: 0.9rem; color: var(--dz-ink); }
.sm-text { display: flex; flex-direction: column; min-width: 0; }
.sm-label { position: relative; white-space: nowrap; font-size: 2.375rem; font-weight: 400; line-height: 1.05; letter-spacing: 0.02em; text-transform: uppercase; font-variation-settings: 'wdth' 62.5; }
.sm-sub { display: block; margin-top: 0.125rem; font-size: 0.75rem; line-height: 1.3; letter-spacing: 0.04em; color: var(--dz-muted); }
.sm-item:hover .sm-label { color: #fff; }
.sm-item:hover { background-image: repeating-linear-gradient(90deg, rgba(233, 230, 214, 0.07) 0 1px, transparent 1px 4px); }
/* The scan animation clips to the item box, so the focus ring sits inside it. */
.dmz .sm-item:focus-visible { outline-offset: -4px; }

/* The band and flare sit under the big label; the extra bottom padding keeps
   the job-name subline clear of the flare. */
.is-active .sm-item { min-height: 7.5rem; padding-bottom: 1.5rem; color: #f7f5ea !important; background: none; animation: sm-scan 0.42s steps(6, end) both; }
.is-active .sm-icon svg { width: 3rem; height: 3rem; }
.is-active .sm-icon .sm-lock { width: 1.1rem; height: 1.2rem; }
.is-active .sm-label { font-size: clamp(2.5rem, 4.2vw, 3.75rem); font-weight: 800; font-variation-settings: 'wdth' 125; text-shadow: 0 0 18px rgba(220, 240, 200, 0.45); }
.is-active .sm-sub { color: #dfe8d0; }
.sm-index { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; color: #dfe8d0; }
.sm-band { position: absolute; left: 5.75rem; right: -5rem; bottom: 3rem; height: 2.5rem; pointer-events: none; background: repeating-linear-gradient(90deg, rgba(226, 236, 206, 0.24) 0 2px, transparent 2px 5px); -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 62%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 62%, transparent); }
.sm-flare { position: absolute; left: 0; right: -16rem; bottom: 0.875rem; height: 2px; pointer-events: none; transform-origin: left center; background: linear-gradient(90deg, transparent, rgba(246, 249, 236, 0.95) 10%, rgba(246, 249, 236, 0.95) 55%, transparent); box-shadow: 0 0 16px 2px rgba(196, 232, 164, 0.45); animation: sm-flare 0.5s ease-out both; }
.sm-g1, .sm-g2 { position: absolute; left: 0; top: 0; pointer-events: none; white-space: nowrap; }
.sm-g1 { color: #bfe8ab; opacity: 0.55; clip-path: inset(18% 0 64% 0); transform: translateX(-4px); animation: sm-g1 0.5s steps(5, end) both; }
.sm-g2 { color: #93d6ce; opacity: 0.5; clip-path: inset(66% 0 12% 0); transform: translateX(5px); animation: sm-g2 0.5s steps(5, end) both; }

.sm-inline { display: none; }
.sm-facts { list-style: none; margin: 0; padding: 0; }
.sm-facts li { padding: 0.5rem 0; border-top: 1px solid var(--dz-line); font-size: 0.8125rem; color: #e3e0d0; }
.sm-locknote { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: #e3e0d0; }
.sm-locknote svg { width: 0.8rem; height: 0.9rem; flex: none; }

.sm-foot { margin-top: auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.25rem 1.5rem 0 3.5rem; }
.sm-keys { display: flex; gap: 1rem; margin: 0; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.sm-keys span { display: inline-flex; align-items: center; gap: 0.4rem; }

.sm-side { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; padding: 2rem 5rem 1.5rem 4.5rem; }
.sm-pills { align-self: flex-end; display: flex; flex-wrap: wrap; gap: 0.25rem; margin: 0; padding: 0.25rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.55); font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; }
.sm-pills span { padding: 0.4rem 0.8rem; border-radius: 999px; }
.sm-pills .is-hot { background: var(--dz-ink); color: var(--dz-bg); font-weight: 700; }
.sm-toast { align-self: flex-end; display: flex; align-items: center; gap: 0.875rem; max-width: 26rem; padding: 0.875rem 1.25rem; background: rgba(14, 16, 15, 0.7); border: 1px solid var(--dz-line); }
.sm-toast svg { flex: none; width: 1.5rem; height: 1.5rem; fill: none; stroke: var(--dz-green); stroke-width: 1.6; stroke-linecap: round; }
.sm-toast strong { display: block; font-style: italic; font-weight: 600; font-size: 1.125rem; line-height: 1.2; }
.sm-toast small { display: block; margin-top: 0.15rem; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.sm-preview { display: flex; flex-direction: column; gap: 1rem; max-width: 34rem; margin-top: auto; margin-bottom: auto; animation: sm-rise 0.35s ease-out 0.1s both; }
.sm-preview-index { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.sm-preview-title { margin: 0; font-size: clamp(2rem, 3vw, 2.75rem); font-weight: 700; line-height: 1.05; text-transform: uppercase; font-variation-settings: 'wdth' 75; }
.sm-preview-desc { margin: 0; font-size: 1.125rem; color: #d4d1c2; }
.sm-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; }
.sm-disclaimer { margin: 0; font-size: 0.6875rem; color: #a9ab9e; }

@keyframes sm-scan { 0% { clip-path: inset(0 100% 0 0); opacity: 0.3; } 40% { clip-path: inset(0 0 0 0); opacity: 1; } 55% { opacity: 0.55; } 70% { opacity: 1; } 100% { clip-path: inset(0 -100vw 0 0); opacity: 1; } }
@keyframes sm-flare { 0% { transform: scaleX(0); opacity: 0; } 35% { opacity: 1; } 100% { transform: scaleX(1); opacity: 0.9; } }
@keyframes sm-g1 { 0% { transform: translateX(-16px); clip-path: inset(6% 0 76% 0); } 40% { transform: translateX(10px); clip-path: inset(38% 0 44% 0); } 100% { transform: translateX(-4px); clip-path: inset(18% 0 64% 0); } }
@keyframes sm-g2 { 0% { transform: translateX(14px); clip-path: inset(80% 0 4% 0); } 40% { transform: translateX(-8px); clip-path: inset(52% 0 30% 0); } 100% { transform: translateX(5px); clip-path: inset(66% 0 12% 0); } }
@keyframes sm-rise { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: none; } }

@media (max-width: 899px) {
  .sm { display: block; }
  .sm-panel { min-height: 100vh; min-height: 100dvh; padding: 1rem 0 1rem; border-radius: 0; border-right: 0; overflow-x: hidden; }
  .sm-head { gap: 0.75rem; padding: 0 1rem; }
  .sm-close { width: 2.75rem; height: 2.75rem; }
  .sm-emblem { width: 3.5rem; height: 3.5rem; font-size: 1.125rem; }
  .sm-heading { margin: 0.75rem 0 0.375rem; padding: 0 1rem; font-size: 0.6875rem; }
  .sm-nav > ul > li.is-break::before { margin: 0.375rem 1rem 0.375rem 1.75rem; }
  .sm-item { gap: 1.125rem; min-height: 3.375rem; padding: 0.25rem 1rem 0.25rem 1.75rem; }
  .sm-icon svg { width: 1.75rem; height: 1.75rem; }
  .sm-label { font-size: 2rem; }
  .is-active .sm-item { min-height: 5.75rem; gap: 0.875rem; padding-left: 1.25rem; padding-bottom: 1.125rem; }
  .is-active .sm-icon svg { width: 2.375rem; height: 2.375rem; }
  .is-active .sm-label { font-size: clamp(1.75rem, 9vw, 2.5rem); font-variation-settings: 'wdth' 112.5; }
  .sm-band { left: 3.75rem; right: -2.5rem; bottom: 2.375rem; height: 1.875rem; }
  .sm-flare { right: -4rem; bottom: 0.5rem; }
  .sm-inline { display: flex; flex-direction: column; gap: 0.75rem; padding: 0.75rem 1rem 1.25rem 4.5rem; animation: sm-rise 0.35s ease-out 0.12s both; }
  .sm-inline p { margin: 0; font-size: 1rem; color: #d4d1c2; }
  .sm-inline .dmz-pill { align-self: flex-start; }
  .sm-foot { display: none; }
  .sm-side { display: none; }
}
/* The emblem is decoration; at 320px the mode pill, Search and Close need the room. */
@media (max-width: 380px) {
  .sm--overlay .sm-emblem { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .is-active .sm-item, .sm-flare, .sm-g1, .sm-g2, .sm-preview, .sm-inline { animation: none; }
}
</style>
