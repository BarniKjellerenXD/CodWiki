<script setup lang="ts">
import { dmzOrders, dmzOrderChapters, dmzStations, dmzTaskMax, orderComplete, orderProgress, DMZ_ORDERS_CHECKED } from '#shared/dmz.mjs'
import { orderIntel } from '#shared/dmz-stations.mjs'

type Order = (typeof dmzOrders)[number]
type Task = Order['tasks'][number]
type Chapter = ReturnType<typeof dmzOrderChapters>[number]

const { state, saveError, setCount, setCollapsed, reset } = useDmzOrders()
const route = useRoute()
const icon = dmzStations.find(station => station.id === 'orders')!.icon
const chapters = dmzOrderChapters()
// Intel entries an Order's text names, such as the recipes it asks you to print.
const named = Object.fromEntries(dmzOrders.map(order => [order.id, orderIntel(order)]))
const progress = computed(() => orderProgress(state.value.counts))
const toast = ref('')
const confirmReset = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | undefined
let collapseTimer: ReturnType<typeof setTimeout> | undefined

const count = (task: Task) => state.value.counts[task.id] || 0
const done = (task: Task) => count(task) >= dmzTaskMax(task)
const isOpen = (order: Order) => !state.value.collapsed[order.id]
const doneIn = (order: Order) => order.tasks.filter(done).length
const pageId = (chapter: Chapter) => `page-${chapter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`
const ordersDone = (chapter: Chapter) => chapter.orders.filter((order: Order) => doneIn(order) === order.tasks.length).length

function change(order: Order, task: Task, value: number) {
  const wasComplete = orderComplete(order, state.value.counts)
  setCount(task.id, Math.min(Math.max(value, 0), dmzTaskMax(task)))
  if (wasComplete || !orderComplete(order, state.value.counts)) return
  toast.value = `Order complete: ${order.name}`
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 4000)
  // Let the tick land before the finished order folds away.
  clearTimeout(collapseTimer)
  collapseTimer = setTimeout(() => setCollapsed(order.id, true), 700)
}
// A finished task resets on the next tap; counters also have a minus button.
const tap = (order: Order, task: Task) => change(order, task, done(task) ? 0 : count(task) + 1)
const taskLabel = (task: Task) => !task.max ? task.text
  : done(task) ? `${task.text}, done. Reset to 0` : `${task.text}, ${count(task)} of ${task.max}. Add one`
function resetAll() {
  if (!confirmReset.value) { confirmReset.value = true; return }
  reset()
  confirmReset.value = false
}
// Links and site search open #order-<id>: unfold that Order and mark it. The
// router, or the DMZ shell on a first load, scrolls to it.
const target = ref('')
function markTarget(hash: string) {
  target.value = hash
  const order = dmzOrders.find(item => `#order-${item.id}` === hash)
  if (order && !isOpen(order)) setCollapsed(order.id, false)
}
onMounted(() => markTarget(route.hash))
watch(() => route.hash, markTarget)
onBeforeUnmount(() => { clearTimeout(toastTimer); clearTimeout(collapseTimer) })
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="DMZ Orders" :icon="icon" :checked="DMZ_ORDERS_CHECKED" :status="`Tracked · ${progress.done}/${progress.total} tasks done`" />

    <div class="ord-layout">
      <section class="ord-card" aria-label="Tracked DMZ Orders">
        <nav class="ord-jump" aria-label="Orders pages">
          <NuxtLink
            v-for="chapter in chapters" :key="chapter.title" :to="{ hash: `#${pageId(chapter)}` }" class="ord-jump-link dmz-mono"
            :class="{ 'is-complete': ordersDone(chapter) === chapter.orders.length }" :aria-label="`${chapter.title}: ${ordersDone(chapter)} of ${chapter.orders.length} Orders done`"
          >{{ chapter.title }}<span aria-hidden="true">{{ ordersDone(chapter) }}/{{ chapter.orders.length }}</span></NuxtLink>
        </nav>
        <template v-for="chapter in chapters" :key="chapter.title">
          <h2 :id="pageId(chapter)" class="ord-chapter dmz-mono"><span>{{ chapter.title }}</span><span>{{ chapter.inGame ? 'Checked in-game' : 'Task text from guides' }}</span></h2>
          <p v-if="chapter.reward" class="ord-reward"><span class="dmz-mono">Pays</span>{{ chapter.reward }}</p>
          <div v-for="(order, index) in chapter.orders" :id="`order-${order.id}`" :key="order.id" class="ord" :class="{ 'is-complete': doneIn(order) === order.tasks.length, 'is-target': target === `#order-${order.id}` }">
            <h3>
              <button type="button" class="ord-head dmz-mono" :aria-expanded="isOpen(order)" :aria-controls="`ord-${order.id}`" @click="setCollapsed(order.id, isOpen(order))">
                <span>0{{ index + 1 }}</span>
                <span class="ord-name">{{ order.name }}</span>
                <span v-if="doneIn(order) === order.tasks.length" class="ord-chip">Complete</span>
                <span v-else class="ord-progress">{{ doneIn(order) }}/{{ order.tasks.length }}</span>
                <svg class="ord-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </h3>
            <ul v-show="isOpen(order)" :id="`ord-${order.id}`" class="ord-tasks">
              <li v-for="task in order.tasks" :key="task.id" :class="{ 'is-done': done(task) }">
                <button type="button" class="ord-task" :aria-pressed="task.max ? undefined : done(task)" :aria-label="taskLabel(task)" @click="tap(order, task)">
                  <span class="ord-box" aria-hidden="true">
                    <svg v-if="done(task)" class="ord-tick" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6" /></svg>
                    <span v-else class="ord-empty" />
                  </span>
                  <span class="ord-text w-semi">{{ task.text }}</span>
                  <span v-if="task.max" class="ord-num dmz-mono" aria-hidden="true">{{ count(task) }}/{{ task.max }}</span>
                </button>
                <button v-if="task.max" type="button" class="ord-minus" :disabled="count(task) === 0" :aria-label="`${task.text}: remove one`" @click="change(order, task, count(task) - 1)">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
                </button>
              </li>
            </ul>
            <p v-if="named[order.id]!.length" v-show="isOpen(order)" class="ord-named">
              <span class="dmz-mono">Intel</span>
              <DmzIntelLink v-for="entry in named[order.id]" :id="entry.id" :key="entry.id" class="ord-named-link">{{ entry.name }}</DmzIntelLink>
            </p>
          </div>
        </template>
        <p class="ord-foot dmz-mono"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6" /></svg>Task text checked {{ DMZ_ORDERS_CHECKED }}</p>
      </section>

      <div class="ord-side">
        <section class="dmz-panel dmz-section">
          <span class="dmz-label dmz-mono">How Orders work</span>
          <p>DMZ Orders come in pages of three, picked up at the FOB. Each Order is a short list of tasks you can finish across several matches, and a page pays out once all three are done.</p>
          <p>Page 1 is the tutorial. Then you pick a chapter: Human Intel, Underground or Counterfeit. Each has two pages and ends with a story mission. Pages 4 and 7 are the same for everyone and sit between the chapters, so your page numbers depend on the order you pick.</p>
          <p>The Boss Board, which sells intel on Lieutenants, opens once you finish your second page.</p>
          <p>CodWiki adds an Order once its task text is checked in-game or matches across two independent guides. {{ dmzOrders.length }} are listed so far, and each page says which. Page 10 waits for a second guide.</p>
          <NuxtLink to="/dmz/intel/missions" class="ord-intel">Story Missions, Dynamic Ops and Side Ops in Intel<span aria-hidden="true"> →</span></NuxtLink>
        </section>
        <section class="dmz-panel dmz-section">
          <span class="dmz-label dmz-mono">Saved on this device</span>
          <p>Ticks stay in this browser between matches. They are not linked to your game account.</p>
          <p v-if="saveError" class="dmz-note" role="alert">This browser blocked saving, so ticks will reset when you leave the page.</p>
          <div class="ord-reset">
            <button type="button" class="dmz-pill dmz-pill--ghost" @click="resetAll">{{ confirmReset ? 'Confirm: clear all ticks' : 'Clear all ticks' }}</button>
            <button v-if="confirmReset" type="button" class="dmz-pill dmz-pill--ghost" @click="confirmReset = false">Keep them</button>
          </div>
        </section>
      </div>
    </div>

    <div class="ord-toast-region" role="status" aria-live="polite">
      <div v-if="toast" class="ord-toast">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6" /></svg>
        <span><strong>{{ toast }}</strong><small class="dmz-mono">Saved on this device</small></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ord-layout { display: grid; grid-template-columns: minmax(0, 40rem) minmax(16rem, 1fr); align-items: start; gap: 2rem; margin-top: 1.5rem; }
.ord-card { padding: 0.25rem 1.5rem 0.75rem; background: linear-gradient(180deg, rgba(74, 150, 142, 0.55), rgba(34, 70, 66, 0.5)); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); border: 1px solid rgba(170, 220, 210, 0.24); border-top: 2px solid rgba(200, 240, 230, 0.55); }
.ord-chapter { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.25rem 1rem; margin: 1.125rem 0 0; padding-bottom: 0.375rem; border-bottom: 1px solid rgba(233, 230, 214, 0.35); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #f0eee2; }
.ord-jump + .ord-chapter { margin-top: 0.5rem; }
.ord-chapter { scroll-margin-top: 1.5rem; }
.ord-jump { display: flex; flex-wrap: wrap; gap: 0.375rem; padding: 0.875rem 0 0.75rem; }
.ord-jump-link { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.25rem; padding: 0 0.625rem; border: 1px solid rgba(233, 230, 214, 0.3); background: rgba(10, 12, 11, 0.22); color: #f0eee2 !important; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; }
.ord-jump-link span { color: #cfe9e4; font-weight: 500; }
.ord-jump-link:hover { border-color: rgba(233, 230, 214, 0.6); }
.ord-jump-link.is-complete, .ord-jump-link.is-complete span { color: var(--dz-green-ink) !important; }
.ord-reward { display: flex; flex-wrap: wrap; gap: 0.25rem 0.625rem; margin: 0.5rem 0 0.125rem; font-size: 0.9375rem; color: #e4ece6; }
.ord-reward .dmz-mono { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #cfe9e4; padding-top: 0.2rem; }
.ord-chapter span + span { font-weight: 500; color: #cfe9e4; }
.ord { border-bottom: 1px solid rgba(233, 230, 214, 0.2); padding: 0.25rem 0 0.375rem; scroll-margin-top: 1.5rem; }
.ord.is-target { margin: 0 -0.75rem; padding-left: 0.75rem; padding-right: 0.75rem; background: rgba(221, 179, 99, 0.14); box-shadow: inset 3px 0 var(--dz-accent), 0 0 0 1px rgba(221, 179, 99, 0.55); }
.ord h3 { margin: 0; font-size: 1rem; }
.ord-head { width: 100%; min-height: 3.25rem; display: flex; align-items: center; gap: 0.875rem; padding: 0; border: 0; background: none; color: #f0eee2; font-weight: 700; font-size: 1.0625rem; letter-spacing: 0.03em; text-transform: uppercase; text-align: left; cursor: pointer; }
.ord-name { flex: 1 1 auto; }
.is-complete .ord-head { color: var(--dz-green-ink); }
.ord-chip { padding: 0.15rem 0.45rem; background: var(--dz-green); color: var(--dz-bg); font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.08em; }
.ord-progress { font-size: 0.8125rem; font-weight: 600; color: #cfe9e4; }
.ord-chev { flex: none; width: 1.125rem; height: 1.125rem; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.16s ease; }
.ord-head[aria-expanded='true'] .ord-chev { transform: rotate(180deg); }
.ord-tasks { list-style: none; margin: 0; padding: 0 0 0.25rem; }
.ord-tasks li { display: flex; align-items: center; gap: 0.5rem; }
.ord-named { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin: 0 0 0.5rem; padding-left: 2.25rem; }
.ord-named > .dmz-mono { margin-right: 0.25rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.ord-named-link { display: inline-flex; align-items: center; min-height: 2.75rem; padding: 0 0.625rem; border: 1px solid var(--dz-line-strong); border-radius: 8px; color: var(--dz-ink-2) !important; font-size: 0.875rem; text-decoration: none; }
.ord-named-link:hover { border-color: var(--dz-ink); color: #fff !important; }
.ord-task { flex: 1 1 auto; min-height: 3rem; display: flex; align-items: flex-start; gap: 0.875rem; padding: 0.5rem 0; border: 0; background: none; color: #f0eee2; font: inherit; text-align: left; cursor: pointer; }
.ord-task:hover .ord-text { color: #fff; }
.ord-box { flex: 0 0 1.375rem; height: 1.625rem; display: grid; place-items: center; }
.ord-empty { width: 0.9375rem; height: 0.9375rem; border: 1.5px solid #cfd2c4; background: rgba(233, 230, 214, 0.14); }
.ord-tick { width: 1.25rem; height: 1.25rem; fill: none; stroke: var(--dz-green); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; animation: ord-tick 0.28s steps(4, end) both; }
.ord-text { flex: 1 1 auto; font-size: 1.3125rem; line-height: 1.25; }
.is-done .ord-text, .is-done .ord-num { color: var(--dz-green-ink); }
.is-done .ord-text { text-decoration: line-through; text-decoration-color: rgba(200, 230, 176, 0.75); }
.ord-num { flex: none; padding-top: 0.25rem; font-size: 0.9375rem; color: #f0eee2; }
.ord-minus { flex: none; display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border: 1px solid rgba(233, 230, 214, 0.3); border-radius: 50%; background: rgba(10, 12, 11, 0.25); color: var(--dz-ink); cursor: pointer; }
.ord-minus svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; }
.ord-minus:disabled { opacity: 0.35; cursor: default; }
.ord-foot { display: flex; align-items: center; gap: 0.5rem; margin: 0.75rem 0 0.25rem; font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: #d5e6e1; }
.ord-foot svg { width: 0.875rem; height: 0.875rem; fill: none; stroke: var(--dz-green); stroke-width: 3; }
.ord-side { display: flex; flex-direction: column; gap: 1rem; }
.ord-side .dmz-section { margin-top: 0; }
.ord-side p { font-size: 1rem; }
.ord-intel { display: inline-flex; align-items: center; min-height: 2.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.ord-reset { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ord-reset .dmz-pill { font-size: 0.95rem; min-height: 2.75rem; }
.ord-toast-region { position: fixed; right: 1.5rem; bottom: 1.5rem; z-index: 45; }
.ord-toast { display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem 1.25rem; background: rgba(14, 16, 15, 0.9); border: 1px solid var(--dz-line); animation: ord-toast 0.3s ease-out both; }
.ord-toast svg { width: 1.375rem; height: 1.375rem; fill: none; stroke: var(--dz-green); stroke-width: 2.4; }
.ord-toast strong { display: block; font-style: italic; font-weight: 600; font-size: 1.125rem; }
.ord-toast small { display: block; font-size: 0.6875rem; letter-spacing: 0.1em; color: var(--dz-muted); }
@keyframes ord-tick { 0% { opacity: 0; transform: scale(0.4); } 60% { opacity: 1; transform: scale(1.2); } 100% { transform: scale(1); } }
@keyframes ord-toast { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: none; } }
@media (max-width: 899px) {
  .ord-layout { grid-template-columns: 1fr; gap: 1.25rem; margin-top: 1rem; }
  .ord-card { padding: 0.125rem 1rem 0.5rem; }
  .ord-head { font-size: 0.9375rem; gap: 0.625rem; }
  /* Clear the reading-settings button, which sits at the top on phones. */
  .ord { scroll-margin-top: 4.25rem; }
  .ord.is-target { margin: 0 -0.5rem; padding-left: 0.5rem; padding-right: 0.5rem; }
  .ord-text { font-size: 1.25rem; }
  .ord-toast-region { left: 1rem; right: 1rem; bottom: calc(var(--dz-dock) + 1.75rem + env(safe-area-inset-bottom)); }
}
@media (prefers-reduced-motion: reduce) {
  .ord-tick, .ord-toast { animation: none; }
  .ord-chev { transition: none; }
}
</style>
