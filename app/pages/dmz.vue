<script setup lang="ts">
import { dmzStations, dmzDock, dmzRailBreaks, dmzIntelShelves } from '#shared/dmz.mjs'

// Shell for every /dmz route: background, the station rail on wide screens
// (it opens in place over the page), and the dock plus station sheet on
// phones. /dmz itself is the start screen.
const route = useRoute()
const path = computed(() => route.path.replace(/\/+$/, '') || '/')
const isHub = computed(() => path.value === '/dmz')
// Intel's shelves (/dmz/intel/missions …) light up the Intel station.
const current = computed(() => dmzStations.find(station => station.route === path.value)?.id || (path.value.startsWith('/dmz/intel/') ? 'intel' : ''))
// 'page' on the station's own page; 'true' on Intel while on one of its shelves.
function ariaCurrent(station: { id: string, route?: string }) {
  return station.route === path.value ? 'page' : current.value === station.id ? 'true' : undefined
}
// #intel-<id> opens that entry over any DMZ page, apart from pages that show
// every entry as a card of their own. The server never sees the hash, so it
// waits for hydration.
const hydrated = ref(false)
const intelOpen = computed(() => hydrated.value && route.hash.startsWith('#intel-') && !route.meta.intelCards)
const dock = dmzDock.map(id => id ? dmzStations.find(station => station.id === id)! : null)
const menuOpen = ref(false)
const { open: spotlightOpen, openSpotlight, prefetchSpotlight } = useSpotlight()
const menuStart = ref('')
// A ref inside v-for is a list; the dock has one CW button.
const dockMenu = ref<HTMLButtonElement[]>()
let returnFocus: HTMLElement | null = null
// The same query as the CSS that swaps the rail for the dock, so a zoomed
// window at 899.5px never gets one from CSS and the other from script.
let narrow: MediaQueryList | undefined

// Phones: the station sheet over the page. Focus goes back where it was, or
// to the CW button when nothing had it (Esc, or a tap in Safari).
function openMenu(id?: string) {
  const active = document.activeElement
  returnFocus = active instanceof HTMLElement && active !== document.body ? active : null
  menuStart.value = id || current.value
  menuOpen.value = true
}
function closeMenu() {
  menuOpen.value = false
  const back = returnFocus?.isConnected ? returnFocus : dockMenu.value?.[0]
  returnFocus = null
  nextTick(() => back?.focus({ preventScroll: true }))
}
// Wide screens: the CW disc or Esc opens the rail in place, wider and with job
// names and Intel's shelves. It is a disclosure, not a dialog: no focus trap and
// no scroll lock, and the server always renders it closed.
const railOpen = ref(false)
const railMore = ref(false)
const rail = ref<HTMLElement>()
const railList = ref<HTMLElement>()
const emblem = ref<HTMLButtonElement>()
let railReturn: HTMLElement | null = null

// The rail links that are showing: the stations, plus the shelves while open.
function railLinks() {
  return [...(railList.value?.querySelectorAll<HTMLElement>('a.dmz-rail-link') || [])].filter(link => link.offsetParent !== null)
}
function openRail() {
  const active = document.activeElement
  railReturn = active instanceof HTMLElement && active !== document.body ? active : null
  railOpen.value = true
  nextTick(() => {
    const list = railList.value
    const target = list?.querySelector<HTMLElement>('[aria-current="page"]') || list?.querySelector<HTMLElement>('[aria-current]') || railLinks()[0]
    target?.focus()
    updateRailMore()
  })
}
// restore puts focus back where it was before the rail opened, or on the disc.
// Closing hides Intel's shelves, so focus on one moves to the Intel station
// link just above them.
function closeRail(restore = true) {
  const intel = document.activeElement?.closest('.dmz-rail-shelves')?.previousElementSibling
  railOpen.value = false
  const back = railReturn?.isConnected ? railReturn : emblem.value
  railReturn = null
  if (restore) nextTick(() => back?.focus({ preventScroll: true }))
  else if (intel instanceof HTMLElement) nextTick(() => intel.focus({ preventScroll: true }))
  nextTick(updateRailMore)
}
// A plain click on a rail link closes the rail, even when it goes nowhere
// (the station or shelf you are on). Other routes also close it on arrival.
function onRailLinkClick(event: MouseEvent) {
  if (railOpen.value && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) closeRail(false)
}
// The disc keeps focus when it closes the rail.
function toggleRail() {
  if (!railOpen.value) return openRail()
  closeRail(false)
  emblem.value?.focus()
}
function onRailKey(event: KeyboardEvent) {
  const links = railLinks()
  const index = links.indexOf(document.activeElement as HTMLElement)
  const next = { ArrowDown: index + 1, ArrowUp: (index < 0 ? links.length : index) - 1, Home: 0, End: links.length - 1 }[event.key]
  if (next === undefined || !links.length) return
  event.preventDefault()
  links[(next + links.length) % links.length]?.focus()
}
// Focus moving out of the rail closes it: Tab past Exit, or the gear. A click
// on the rail's own padding moves focus nowhere, so it stays open, and so does
// a dialog opened from the rail (Search, Ctrl K), which hands focus back to it.
function onRailFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  if (!railOpen.value || !(next instanceof Element) || rail.value?.contains(next) || next.closest('[aria-modal="true"]')) return
  closeRail(false)
}
// Search does not hand focus back when it closes to a result for this page or
// to an action such as reading settings, so the rail closes then too.
watch(spotlightOpen, open => {
  if (!open) nextTick(() => { if (railOpen.value && !rail.value?.contains(document.activeElement)) closeRail(false) })
})
// Only the station list scrolls; it fades at the bottom while more is below.
function updateRailMore() {
  const list = railList.value
  railMore.value = !!list && list.scrollTop + list.clientHeight < list.scrollHeight - 2
}
watch(railList, list => { if (list) revealCurrent() }, { flush: 'post' })
// On short screens the lit station can sit below the fold, so scroll it into
// the list's view (past the fade). The page itself never scrolls.
function revealCurrent() {
  const list = railList.value
  const item = list?.querySelector<HTMLElement>('[aria-current]')
  if (!list || !item) return updateRailMore()
  const box = list.getBoundingClientRect()
  const at = item.getBoundingClientRect()
  if (at.bottom > box.bottom) list.scrollTop += at.bottom - box.bottom + 24
  else if (at.top < box.top) list.scrollTop -= box.top - at.top
  updateRailMore()
}

// Esc opens the rail on wide screens and the sheet on phones, as the pause
// menu does in the game. Typing in a field never triggers it.
function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented || isHub.value || menuOpen.value) return
  if ((event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')) return
  if (narrow?.matches) return openMenu()
  if (railOpen.value) closeRail()
  else openRail()
}
// The rail is for wide screens and the sheet for phones, so each closes when
// the window crosses 900px. A rail that has just appeared (a phone turned to
// landscape) has never shown the lit station yet.
function onNarrow(event: MediaQueryListEvent) {
  if (event.matches) railOpen.value = false
  else {
    menuOpen.value = false
    nextTick(revealCurrent)
  }
}
watch(() => route.fullPath, () => {
  menuOpen.value = false
  if (railOpen.value) closeRail(false)
  nextTick(revealCurrent)
})
onMounted(() => {
  hydrated.value = true
  narrow = window.matchMedia('(max-width: 899px)')
  narrow.addEventListener('change', onNarrow)
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', updateRailMore)
  revealCurrent()
  // Nuxt leaves the first load's #hash to the browser, which jumps before the
  // condensed webfont swaps in. Settle on the section once the fonts are ready.
  const hash = location.hash.slice(1)
  if (hash) document.fonts.ready.then(() => document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: 'instant' }))
})
onBeforeUnmount(() => {
  narrow?.removeEventListener('change', onNarrow)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', updateRailMore)
})
</script>

<template>
  <div class="dmz" :class="{ 'dmz--hub': isHub }">
    <div class="dmz-bg" aria-hidden="true">
      <span class="dmz-blob dmz-blob--teal" />
      <span class="dmz-blob dmz-blob--olive" />
      <span class="dmz-blob dmz-blob--deep" />
      <span class="dmz-blob dmz-blob--sand" />
      <span v-if="!isHub" class="dmz-grid" />
      <svg class="dmz-grain" width="100%" height="100%"><filter id="dmz-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#dmz-grain)" /></svg>
    </div>

    <template v-if="!isHub">
      <nav id="dmz-rail" ref="rail" class="dmz-rail" :class="{ 'is-open': railOpen }" aria-label="DMZ stations" @keydown="onRailKey" @focusout="onRailFocusOut" @transitionend="updateRailMore">
        <div class="dmz-rail-head">
          <button ref="emblem" type="button" class="dmz-emblem" aria-label="Station menu" :aria-expanded="railOpen ? 'true' : 'false'" aria-controls="dmz-rail" @click="toggleRail"><span aria-hidden="true">CW</span></button>
          <span class="dmz-rail-mode dmz-mono" aria-hidden="true">MODE</span>
          <span class="dmz-rail-mode-name" aria-hidden="true">DMZ</span>
        </div>
        <ul ref="railList" class="dmz-rail-list" :class="{ 'has-more': railMore }" @scroll.passive="updateRailMore">
          <li v-for="station in dmzStations" :key="station.id" :class="{ 'is-break': dmzRailBreaks.includes(station.id) }">
            <!-- The word is the name; the job name is the tooltip, and the subline once open. -->
            <NuxtLink v-if="station.route" :to="station.route" class="dmz-rail-link" :aria-current="ariaCurrent(station)" :title="railOpen ? undefined : station.title" @click="onRailLinkClick">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="station.icon" /></svg>
              <span class="dmz-rail-text"><span class="dmz-rail-name">{{ station.label }}</span><span class="dmz-rail-sub dmz-mono"><span class="sr-only">, </span>{{ station.title }}</span></span>
            </NuxtLink>
            <span v-else class="dmz-rail-link is-locked" :title="station.lockNote">
              <span class="dmz-rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="station.icon" /></svg><DmzLock class="dmz-rail-lock" /></span>
              <span class="dmz-rail-text"><span class="dmz-rail-name">{{ station.label }}</span><span class="sr-only">, locked</span></span>
            </span>
            <!-- Always in the HTML, so every station page links the shelves; shown only while open. -->
            <ul v-if="station.id === 'intel'" class="dmz-rail-shelves">
              <li v-for="shelf in dmzIntelShelves" :key="shelf.id">
                <NuxtLink :to="shelf.path" class="dmz-rail-link dmz-rail-shelf" :aria-current="path === shelf.path ? 'page' : undefined" @click="onRailLinkClick">{{ shelf.label }}</NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
        <div class="dmz-rail-foot">
          <button type="button" class="dmz-rail-link" title="Search (Ctrl K)" aria-label="Search CodWiki" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K /" @click="openSpotlight()" @pointerenter="prefetchSpotlight" @focus="prefetchSpotlight">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 17a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13z M15.5 15.5L21 21" /></svg>
            <span class="dmz-rail-text"><span class="dmz-rail-name">Search</span><span class="dmz-rail-sub dmz-mono">Ctrl K</span></span>
          </button>
          <NuxtLink to="/" class="dmz-rail-link" aria-label="Exit to Zombies" title="Exit to Zombies">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6l-6 6 6 6 M4 12h11 M15 4h5v16h-5" /></svg>
            <span class="dmz-rail-text"><span class="dmz-rail-name">Exit</span><span class="dmz-rail-sub dmz-mono">Back to Zombies</span></span>
          </NuxtLink>
        </div>
      </nav>
      <div v-if="railOpen" class="dmz-rail-scrim" aria-hidden="true" @click="closeRail()" />

      <nav class="dmz-dock" aria-label="DMZ stations">
        <template v-for="station in dock" :key="station?.id || 'menu'">
          <button v-if="!station" ref="dockMenu" type="button" class="dmz-dock-menu" aria-label="All stations" aria-haspopup="dialog" @click="openMenu()"><span class="dmz-dock-disc" aria-hidden="true">CW</span><span class="dmz-dock-word" aria-hidden="true">Stations</span></button>
          <NuxtLink v-else-if="station.route" :to="station.route" class="dmz-dock-link" :aria-current="ariaCurrent(station)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="station.icon" /></svg>
            <span>{{ station.short || station.label }}</span>
          </NuxtLink>
          <button v-else type="button" class="dmz-dock-link" @click="openMenu(station.id)">
            <span class="dmz-dock-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="station.icon" /></svg><DmzLock class="dmz-dock-lock" /></span>
            <span>{{ station.label }}<span class="sr-only">, locked</span></span>
          </button>
        </template>
      </nav>
    </template>

    <div class="dmz-main"><NuxtPage /></div>

    <!-- Teleported above the site's floating gear and search, so it carries the .dmz theme itself. -->
    <Teleport to="body">
      <LazyDmzStationMenu v-if="menuOpen" class="dmz" overlay :start="menuStart" :current="current" @close="closeMenu" />
    </Teleport>
    <LazyDmzIntelDrawer v-if="intelOpen" />
  </div>
</template>

<style>
/* MW4 DMZ theme. Scoped to .dmz so the Zombies pages keep their own system.
   Frosted panels, glow and grain are deliberate here and nowhere else. */
.dmz {
  --dz-bg: #0b0d0c;
  --dz-ink: #e9e6d6;
  --dz-ink-2: #cdc9b8;
  --dz-muted: #b8b9ac;
  --dz-line: rgba(233, 230, 214, 0.16);
  --dz-line-strong: rgba(233, 230, 214, 0.32);
  --dz-glass: rgba(22, 26, 25, 0.6);
  --dz-green: #a9d98a;
  --dz-green-ink: #c8e6b0;
  --dz-teal: #9fd8cf;
  --dz-accent: #ddb363;
  --dz-rail: 5.5rem;
  --dz-dock: 4.75rem;
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--dz-bg);
  color: var(--dz-ink);
  font-family: 'Saira', 'Bahnschrift', 'Arial Narrow', system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.55;
}
.dmz a { color: var(--dz-ink); }
.dmz a:hover { color: #fff; }
.dmz :focus-visible { outline: 2px solid var(--dz-ink); outline-offset: 3px; }
.dmz .dmz-mono, .dmz kbd { font-family: 'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace; }
.dmz .w-cond { font-variation-settings: 'wdth' 62.5; }
.dmz .w-semi { font-variation-settings: 'wdth' 75; }
.dmz .w-wide { font-variation-settings: 'wdth' 125; }

.dmz-bg { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
.dmz-blob { position: absolute; border-radius: 50%; filter: blur(90px); }
.dmz-blob--teal { left: -12%; top: -16%; width: 46vw; height: 64vh; background: #1e6a64; opacity: 0.72; }
.dmz-blob--olive { left: -6%; bottom: -14%; width: 42vw; height: 42vh; background: #5c6a2e; opacity: 0.45; }
.dmz-blob--deep { right: -12%; top: 18%; width: 38vw; height: 54vh; background: #18413d; opacity: 0.6; }
.dmz-blob--sand { right: 8%; bottom: -22%; width: 30vw; height: 40vh; background: #3b3a30; opacity: 0.55; }
.dmz-grid { position: absolute; inset: 0; background-image: repeating-linear-gradient(0deg, transparent 0 79px, rgba(233, 230, 214, 0.05) 79px 80px), repeating-linear-gradient(90deg, transparent 0 79px, rgba(233, 230, 214, 0.05) 79px 80px); }
.dmz-grain { position: absolute; inset: 0; opacity: 0.09; }

.dmz-kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 1.9rem; height: 1.75rem; padding: 0 0.4rem; border-radius: 6px; background: var(--dz-ink); color: var(--dz-bg); font-weight: 700; font-size: 0.7rem; letter-spacing: 0.04em; }
.dmz-pill { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 2.875rem; padding: 0 1.4rem; border: 1px solid var(--dz-ink); border-radius: 999px; background: var(--dz-ink); color: var(--dz-bg) !important; text-decoration: none; font-weight: 700; font-size: 1.1rem; letter-spacing: 0.08em; text-transform: uppercase; font-variation-settings: 'wdth' 75; cursor: pointer; }
.dmz-pill:hover { background: #fff; }
.dmz-pill--ghost { background: transparent; color: var(--dz-ink) !important; border-color: var(--dz-line-strong); }
.dmz-pill--ghost:hover { background: rgba(233, 230, 214, 0.1); }

/* Station rail: wide screens. An icon and the station's word per item; the
   disc, Search and Exit stay put and only the station list scrolls. */
.dmz-rail { position: fixed; left: 0; top: 0; bottom: 0; z-index: 40; width: var(--dz-rail); display: flex; flex-direction: column; align-items: center; gap: 0.375rem; padding: 1.125rem 0; overflow: hidden; background: rgba(225, 228, 215, 0.1); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); border-right: 1px solid rgba(233, 230, 214, 0.14); border-radius: 0 2.5rem 2.5rem 0; transition: width 0.18s ease; }
.dmz-rail-head, .dmz-rail-foot { flex: none; display: flex; flex-direction: column; align-items: center; }
.dmz-rail-head { gap: 0.375rem; }
.dmz-rail-foot { gap: 0.5rem; }
/* The scroll padding keeps a focused item clear of the bottom fade. */
.dmz-rail-list { list-style: none; margin: 0.5rem 0 0; padding: 0.125rem 0; scroll-padding-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.25rem; flex: 1 1 auto; min-height: 0; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: var(--dz-line-strong) transparent; }
.dmz-rail-list.has-more { -webkit-mask-image: linear-gradient(#000 calc(100% - 1.5rem), transparent); mask-image: linear-gradient(#000 calc(100% - 1.5rem), transparent); }
/* Dividers: field tools | FOB stations | reading. */
.dmz-rail-list > li.is-break { margin-top: 0.375rem; padding-top: 0.375rem; border-top: 1px solid var(--dz-line); }
.dmz-emblem, .dmz-dock-disc { display: grid; place-items: center; border-radius: 50%; border: 2px solid rgba(233, 230, 214, 0.5); background: rgba(10, 12, 11, 0.6); color: var(--dz-accent); font-family: inherit; font-weight: 800; font-variation-settings: 'wdth' 125; }
.dmz-emblem { flex: none; width: 4rem; height: 4rem; font-size: 1.25rem; cursor: pointer; }
.dmz-emblem:hover, .dmz-dock-menu:hover .dmz-dock-disc { border-color: var(--dz-ink); }
.dmz-rail-mode { margin-top: 0.25rem; font-size: 0.625rem; letter-spacing: 0.1em; color: var(--dz-muted); }
.dmz-rail-mode-name { font-weight: 700; font-size: 1.25rem; line-height: 1; letter-spacing: 0.04em; font-variation-settings: 'wdth' 75; }
.dmz-rail-link { position: relative; flex: none; width: 4.75rem; height: 3.25rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.1875rem; padding: 0; border: 0; border-radius: 12px; background: transparent; color: var(--dz-ink) !important; font: inherit; text-decoration: none; cursor: pointer; }
.dmz-rail-link svg { flex: none; width: 1.5rem; height: 1.5rem; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.dmz-rail-text { display: flex; flex-direction: column; align-items: center; min-width: 0; }
/* The width is pinned so DMZ ORDERS fits the item whatever the font loads. */
.dmz-rail-name { font-size: 0.75rem; font-weight: 600; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; white-space: nowrap; color: var(--dz-ink); }
.dmz-rail-sub, .dmz-rail-shelves { display: none; }
.dmz-rail-shelves { list-style: none; padding: 0; }
/* The teal glow sits behind the top of the rail, so the words go white on hover to keep their contrast. */
.dmz-rail-link:hover { background: rgba(233, 230, 214, 0.1); }
.dmz-rail-link:hover .dmz-rail-name { color: #fff; }
.dmz-rail-link[aria-current] { background: rgba(233, 230, 214, 0.18); box-shadow: inset 3px 0 var(--dz-ink); }
.dmz-rail-link[aria-current] .dmz-rail-name { color: #fff; font-weight: 700; }
/* The list clips what spills past it, so the focus ring sits inside the item. */
.dmz .dmz-rail-link:focus-visible { outline-offset: -3px; }
.dmz-rail-link.is-locked { cursor: default; }
.dmz-rail-link.is-locked:hover { background: transparent; }
.dmz-rail-icon { position: relative; display: flex; }
.dmz-rail-link .dmz-rail-lock { position: absolute; right: -0.5rem; top: -0.25rem; width: 0.75rem; height: 0.875rem; }

/* Open: the same rail widens over the page, so nothing beside it moves. */
.dmz-rail.is-open { width: 18rem; align-items: stretch; padding-inline: 0.75rem; background: rgba(28, 32, 30, 0.9); box-shadow: 12px 0 40px rgba(0, 0, 0, 0.45); }
.is-open .dmz-rail-head { flex-direction: row; gap: 0.75rem; }
.is-open .dmz-rail-mode { margin-top: 0; }
.is-open .dmz-rail-foot { align-items: stretch; }
.is-open .dmz-rail-link { width: 100%; min-height: 3.25rem; height: auto; flex-direction: row; justify-content: flex-start; gap: 0.875rem; padding: 0.375rem 0.75rem; text-align: left; }
/* A fixed text column, so rows keep their open height while the width animates. */
.is-open .dmz-rail-text { flex: none; width: 12rem; align-items: flex-start; }
.is-open .dmz-rail-name { font-size: 1.125rem; font-weight: 700; }
.is-open .dmz-rail-sub { display: block; font-size: 0.6875rem; line-height: 1.3; letter-spacing: 0.04em; color: var(--dz-muted); white-space: normal; }
.is-open .dmz-rail-shelves { display: block; margin: 0.125rem 0 0.375rem 2.25rem; padding-left: 0.5rem; border-left: 1px solid var(--dz-line); }
.is-open .dmz-rail-shelf { min-height: 2.75rem; font-size: 0.9375rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; white-space: nowrap; }
.dmz-rail-scrim { position: fixed; inset: 0; z-index: 39; background: rgba(5, 7, 6, 0.45); }
@media (prefers-reduced-motion: reduce) {
  .dmz-rail { transition: none; }
}

/* Short screens: a smaller disc and items. The collapsed rail needs about
   870px, 688px under 900px and 656px under 700px; below that the list scrolls. */
@media (max-height: 900px) {
  .dmz-rail { gap: 0.25rem; padding: 0.75rem 0; }
  .dmz-rail-head, .dmz-rail-foot { gap: 0.25rem; }
  .dmz-rail-mode { display: none; }
  .dmz-emblem { width: 3.25rem; height: 3.25rem; font-size: 1.0625rem; }
  .dmz-rail-list { gap: 0.125rem; }
  .dmz-rail-list > li.is-break { margin-top: 0.25rem; padding-top: 0.25rem; }
  .dmz-rail-link { height: 2.75rem; }
  .dmz-rail-link svg { width: 1.25rem; height: 1.25rem; }
  .is-open .dmz-rail-link { min-height: 2.75rem; }
}
@media (max-height: 700px) {
  .dmz-rail-mode-name { display: none; }
  .dmz-emblem { width: 2.75rem; height: 2.75rem; font-size: 0.9375rem; }
}

/* Dock: phones */
.dmz-dock { display: none; }

.dmz-main { min-width: 0; }
.dmz:not(.dmz--hub) .dmz-main { padding-left: var(--dz-rail); }

@media (max-width: 899px) {
  .dmz-rail, .dmz-rail-scrim { display: none; }
  .dmz:not(.dmz--hub) .dmz-main { padding-left: 0; padding-bottom: calc(var(--dz-dock) + 1.5rem + env(safe-area-inset-bottom)); }
  .dmz-dock { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: end; padding: 0.5rem 0.5rem calc(0.75rem + env(safe-area-inset-bottom)); background: rgba(28, 32, 30, 0.74); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); border-top: 1px solid var(--dz-line); border-radius: 1.75rem 1.75rem 0 0; }
  .dmz-dock-link { min-height: 3.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; border: 0; border-radius: 14px; background: transparent; color: #d6d3c4 !important; text-decoration: none; font-family: inherit; font-weight: 500; font-size: 0.8125rem; letter-spacing: 0.06em; text-transform: uppercase; font-variation-settings: 'wdth' 75; cursor: pointer; }
  .dmz-dock-link svg { width: 1.625rem; height: 1.625rem; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  .dmz-dock-link[aria-current] { background: rgba(233, 230, 214, 0.18); color: #fff !important; }
  .dmz-dock-icon { position: relative; display: flex; }
  .dmz-dock-link .dmz-dock-lock { position: absolute; right: -0.5rem; top: -0.25rem; width: 0.7rem; height: 0.8rem; }
  /* The raised CW disc with a word under it, so the other stations are findable. */
  .dmz-dock-menu { justify-self: center; align-self: start; margin-top: -1.875rem; display: flex; flex-direction: column; align-items: center; gap: 0.125rem; padding: 0; border: 0; border-radius: 14px; background: none; color: inherit; font: inherit; cursor: pointer; }
  .dmz-dock-disc { width: 4.25rem; height: 4.25rem; font-size: 1.25rem; background: rgba(10, 12, 11, 0.9); }
  .dmz-dock-word { font-size: 0.6875rem; font-weight: 600; line-height: 1.2; letter-spacing: 0.06em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #d6d3c4; }
  .dmz-blob { filter: blur(70px); }
  .dmz-blob--teal { width: 90vw; height: 50vh; }
  .dmz-blob--olive { width: 90vw; height: 30vh; }
  .dmz-blob--deep { width: 80vw; height: 40vh; }
}

/* Station pages */
.dmz-page { max-width: 68rem; margin: 0 auto; padding: 2rem 2rem 4rem; }
@media (max-width: 899px) { .dmz-page { padding: 1rem 1rem 2rem; } }
.dmz-section { margin-top: 2.5rem; scroll-margin-top: 1.5rem; }
.dmz-section h2 { margin: 0 0 0.875rem; font-size: 1.625rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.dmz-section p, .dmz-section li { color: #dcd9cb; font-size: 1.0625rem; }
.dmz-section p { margin: 0 0 0.875rem; max-width: 46rem; }
.dmz-label { display: block; margin-bottom: 0.375rem; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.dmz-panel { padding: 1.25rem 1.5rem; background: var(--dz-glass); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); border: 1px solid var(--dz-line); border-radius: 18px; }
.dmz-note { padding: 0.875rem 1rem; border-left: 3px solid var(--dz-accent); background: rgba(221, 179, 99, 0.08); color: #e7dcc2 !important; font-size: 0.95rem !important; }
.dmz-sources { margin: 0; padding-left: 1.1rem; }
.dmz-sources li { margin: 0.35rem 0; font-size: 0.9rem !important; }
.dmz-sources a { text-underline-offset: 0.2em; }

/* Intel parts shared by the stations, the Intel shelves and the entry drawer. */
.dmz .dz-lede { max-width: 46rem; margin: 1rem 0 0; color: #dcd9cb; font-size: 1.0625rem; }
.dmz .dz-badge { flex: none; display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; border-radius: 999px; border: 1px solid currentColor; font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.dmz .dz-badge.is-official { color: var(--dz-accent); }
.dmz .dz-badge.is-confirmed { color: var(--dz-green); }
.dmz .dz-badge.is-reported { color: var(--dz-teal); border-style: dashed; }
.dmz .dz-kind { font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.dmz .dz-h2 { margin: 0; font-size: 1.5rem; font-weight: 700; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.dmz .dz-h3 { margin: 0; font-size: 1.25rem; font-weight: 700; line-height: 1.15; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.dmz .dz-sub { margin: 0 0 0.5rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.dmz .dz-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.dmz .dz-chip { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; padding: 0 0.95rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.45); color: var(--dz-ink-2) !important; font: inherit; font-size: 0.975rem; font-weight: 500; text-decoration: none; cursor: pointer; }
.dmz .dz-chip:hover { border-color: var(--dz-ink); color: #fff !important; }
.dmz .dz-chip[aria-pressed='true'], .dmz .dz-chip[aria-current='page'] { background: var(--dz-ink); border-color: var(--dz-ink); color: var(--dz-bg) !important; }
.dmz .dz-chip .dmz-mono { font-size: 0.7rem; color: inherit; opacity: 0.75; }
/* No backdrop blur on cards: long lists of blurred cards make scrolling heavy. */
.dmz .dz-card { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem 1.125rem; background: rgba(20, 24, 23, 0.82); border: 1px solid var(--dz-line); border-radius: 16px; }
.dmz .dz-search { display: flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0 1.125rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.6); }
.dmz .dz-search:focus-within { border-color: var(--dz-ink); }
.dmz .dz-search svg { flex: none; width: 1.125rem; height: 1.125rem; fill: none; stroke: var(--dz-muted); stroke-width: 2; stroke-linecap: round; }
.dmz .dz-search input { flex: 1; min-width: 0; height: 2.75rem; border: 0; background: transparent; color: var(--dz-ink); font: inherit; font-size: 1.0625rem; outline: none; }
.dmz .dz-search input::placeholder { color: #9a9b8f; }
.dmz .dz-icon { width: 1.5rem; height: 1.5rem; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.dmz .dz-link { display: inline-flex; align-items: center; min-height: 2.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.dmz .dz-facts { display: grid; gap: 0.25rem; margin: 0; }
.dmz .dz-facts > div { display: grid; grid-template-columns: 7rem 1fr; gap: 0.75rem; padding: 0.375rem 0.625rem; background: rgba(10, 12, 11, 0.35); border-left: 2px solid var(--dz-line-strong); }
.dmz .dz-facts dt { padding-top: 0.15rem; font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.dmz .dz-facts dd { margin: 0; color: #e3e0d0; font-size: 0.95rem; white-space: pre-line; }
.dmz .dz-empty { margin: 0; padding: 1rem 1.25rem; border: 1px dashed var(--dz-line-strong); border-radius: 14px; color: var(--dz-muted); }
.dmz .dz-group { margin-top: 1.75rem; scroll-margin-top: 1.5rem; }
.dmz .dz-group-head { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--dz-line); }
.dmz .dz-group-head h2 { display: flex; align-items: baseline; gap: 0.625rem; }
.dmz .dz-group-head h2 .dmz-mono { font-size: 0.75rem; letter-spacing: 0.06em; color: var(--dz-muted); }
.dmz .dz-group-head p { margin: 0; max-width: 52rem; color: var(--dz-muted); font-size: 0.95rem; }
.dmz .dz-rows { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr)); gap: 0.375rem; }
@media (max-width: 899px) {
  .dmz .dz-facts > div { grid-template-columns: 5.5rem 1fr; }
}
@media (max-width: 599px) {
  .dmz .dz-rows { grid-template-columns: minmax(0, 1fr); }
}
</style>
