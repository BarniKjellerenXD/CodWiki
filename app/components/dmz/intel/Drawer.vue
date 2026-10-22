<script setup lang="ts">
import { intelEntry } from '#shared/dmz-stations.mjs'

// Opens the entry named by #intel-<id> over any DMZ page: a side panel on wide
// screens and a bottom sheet on phones. The DMZ shell mounts it while the hash
// names an entry. Each entry is its own history step, so links can be shared
// and Back steps through related entries.
const route = useRoute()
const router = useRouter()
const nuxtApp = useNuxtApp()
const entry = computed(() => {
  const id = /^#intel-(.+)$/.exec(route.hash)?.[1]
  return id ? intelEntry(decodeURIComponent(id)) : undefined
})
const panel = ref<HTMLElement>()
const closeButton = ref<HTMLButtonElement>()
const leaving = ref(false)

// Entries opened since the drawer opened, oldest first. When the history step
// before the first one is this page without the drawer, Close steps back to it,
// which also puts the page back where it was scrolled. Otherwise (a shared link,
// or a link from another page) Close drops the hash and the page stays put.
const trail = ref<string[]>([])
let fromPage = false
let step = 0
let returnFocus: HTMLElement | null = null
let previousOverflow = ''
let previousGutter = ''
let locked = false

const withoutHash = (path: string) => path.replace(/#.*$/, '')
const stepNow = () => Number(window.history.state?.position) || 0

function lock() {
  if (locked) return
  locked = true
  returnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null
  const root = document.documentElement
  previousOverflow = root.style.overflow
  previousGutter = root.style.scrollbarGutter
  // Keep the scrollbar's space so the page does not reflow and jump underneath.
  if (root.scrollHeight > root.clientHeight) root.style.scrollbarGutter = 'stable'
  root.style.overflow = 'hidden'
}
function unlock() {
  if (!locked) return
  locked = false
  document.documentElement.style.overflow = previousOverflow
  document.documentElement.style.scrollbarGutter = previousGutter
  const first = trail.value[0]
  const target = returnFocus?.isConnected ? returnFocus : first ? document.querySelector<HTMLElement>(`[data-intel="${CSS.escape(first)}"]`) : null
  target?.focus({ preventScroll: true })
}

// Someone who lands on an entry sees its row on the page once they close it.
// On the Tac-Map the entry's place is the chosen pin, so the map comes into view.
function revealRow(id: string, pageChanged: boolean) {
  let done = false
  const reveal = () => {
    if (done || entry.value?.id !== id) return
    done = true
    document.fonts.ready.then(() => {
      const row = document.querySelector(`[data-intel="${CSS.escape(id)}"]`)
      const target = row || (route.query.pin ? document.getElementById('map') : null)
      if (!target) return
      // The scroll lock also blocks scripted scrolling, so lift it for this one jump.
      const root = document.documentElement
      const lock = root.style.overflow
      root.style.overflow = previousOverflow
      target.scrollIntoView({ block: row ? 'center' : 'start', behavior: 'instant' })
      root.style.overflow = lock
    })
  }
  if (!pageChanged) return nextTick(reveal)
  nuxtApp.hooks.hookOnce('page:finish', () => nextTick(reveal))
  setTimeout(reveal, 600)
}

function sync(pageChanged: boolean) {
  const id = entry.value?.id
  if (!id) {
    unlock()
    trail.value = []
    return
  }
  const now = stepNow()
  // A link to another page that opens an entry there starts afresh.
  if (pageChanged) trail.value = []
  if (!trail.value.length) {
    const back = window.history.state?.back
    fromPage = typeof back === 'string' && !back.includes('#intel-') && withoutHash(back) === withoutHash(route.fullPath)
    trail.value = [id]
    lock()
    if (!fromPage) revealRow(id, pageChanged)
    nextTick(() => closeButton.value?.focus())
  }
  else {
    if (now > step) trail.value = [...trail.value, id]
    else trail.value = [...trail.value.slice(0, Math.max(1, trail.value.length - (step - now))).slice(0, -1), id]
    nextTick(() => {
      panel.value?.scrollTo({ top: 0 })
      if (!leaving.value) document.getElementById('intel-drawer-title')?.focus()
    })
  }
  step = now
  if (leaving.value && trail.value.length === 1) router.replace({ query: route.query, hash: '' })
}

function close() {
  if (fromPage) return router.go(-trail.value.length)
  leaving.value = true
  if (trail.value.length > 1) return router.go(1 - trail.value.length)
  router.replace({ query: route.query, hash: '' })
}

// Search open on top of the drawer handles its own Esc and Tab.
const spotlight = useSpotlight().open
function onKey(event: KeyboardEvent) {
  if (!entry.value || spotlight.value) return
  if (event.key === 'Escape') {
    // Keep the shell from opening the station menu as well.
    event.preventDefault()
    event.stopPropagation()
    close()
  }
  else if (event.key === 'Tab' && panel.value) {
    const focusable = [...panel.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
    const first = focusable[0], last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
}

watch(() => [route.path, route.hash] as const, ([path], [before]) => sync(path !== before))
onMounted(() => {
  step = stepNow()
  sync(false)
  window.addEventListener('keydown', onKey, { capture: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey, { capture: true })
  unlock()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="entry && !leaving" class="dmz di" role="dialog" aria-modal="true" aria-labelledby="intel-drawer-title">
      <div class="di-backdrop" aria-hidden="true" @click="close" />
      <div ref="panel" class="di-panel">
        <div class="di-bar">
          <button v-if="trail.length > 1" type="button" class="di-btn dmz-mono" @click="router.back()"><span aria-hidden="true">←</span> Back<span class="sr-only"> to {{ intelEntry(trail.at(-2)!)?.name }}</span></button>
          <span v-else class="di-bar-label dmz-mono">Intel</span>
          <button ref="closeButton" type="button" class="di-btn di-close" aria-label="Close" @click="close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12 M18 6L6 18" /></svg></button>
        </div>
        <DmzIntelDossier :key="entry.id" :entry="entry" title-id="intel-drawer-title" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Teleported outside the shell, so it carries the .dmz theme itself. Above the
   site's reading-settings button (z-index 60). */
.di { position: fixed; inset: 0; z-index: 70; min-height: 0; background: transparent; }
.di-backdrop { position: absolute; inset: 0; background: rgba(5, 7, 6, 0.6); animation: di-fade 0.18s ease-out both; }
.di-panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(34rem, 100%); overflow-y: auto; overscroll-behavior: contain; padding: 0 1.5rem 2rem; background: #141817; border-left: 1px solid var(--dz-line-strong); box-shadow: -24px 0 48px rgba(0, 0, 0, 0.4); animation: di-in 0.22s ease-out both; }
.di-bar { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 -1.5rem 1rem; padding: 0.625rem 1rem 0.625rem 1.5rem; background: rgba(20, 24, 23, 0.94); border-bottom: 1px solid var(--dz-line); }
.di-bar-label { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dz-teal); }
.di-btn { display: inline-flex; align-items: center; gap: 0.375rem; min-width: 2.75rem; min-height: 2.75rem; padding: 0 0.75rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: transparent; color: var(--dz-ink); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
.di-btn:hover { border-color: var(--dz-ink); }
.di-close { justify-content: center; padding: 0; }
.di-close svg { width: 1.125rem; height: 1.125rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
@keyframes di-fade { from { opacity: 0; } }
@keyframes di-in { from { transform: translateX(2rem); opacity: 0; } }
@media (max-width: 899px) {
  .di-panel { top: auto; left: 0; width: 100%; max-height: 88dvh; padding: 0 1rem 1.5rem; border-left: 0; border-top: 1px solid var(--dz-line-strong); border-radius: 1.5rem 1.5rem 0 0; box-shadow: 0 -24px 48px rgba(0, 0, 0, 0.45); animation-name: di-up; }
  .di-bar { margin: 0 -1rem 0.875rem; padding: 0.5rem 0.75rem 0.5rem 1rem; border-radius: 1.5rem 1.5rem 0 0; }
}
@keyframes di-up { from { transform: translateY(2rem); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .di-backdrop, .di-panel { animation: none; }
}
</style>
