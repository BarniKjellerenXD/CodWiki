<template>
  <div class="guide-page">
    <div class="guide-grid">
      <section class="min-w-0">
        <div class="guide-surface">
          <header class="guide-header">
            <div class="guide-heading">
              <span v-if="mapName" class="guide-map">{{ mapName }}</span>
              <h1 class="guide-title">{{ title }}</h1>
            </div>
            <NuxtLink class="guide-back" to="/">← All guides</NuxtLink>
          </header>
          <NuxtLink v-if="superEggMap" class="super-egg-link" :to="`/guides/bo7-super-easter-egg#${superEggMap}`">Super Easter Egg <span>Toy box walkthrough ↗</span></NuxtLink>
          <div v-if="bannerText" class="curse-banner">
            <div class="banner-text">{{ bannerText }}</div>
            <button class="banner-btn" @click="scrollTo(bannerTarget)">{{ bannerLabel }}</button>
          </div>
          <article ref="articleRef" class="prose guide-article" @click="onArticleClick">
            <slot />
          </article>
        </div>
      </section>

      <aside class="guide-aside">
        <div class="toc">
          <div class="toc-head">
            <Icon name="mdi:format-list-bulleted" />
            <span>On this page</span>
          </div>

          <template v-if="pinnedToc.length">
            <div class="toc-group-label">Pinned</div>
            <nav class="toc-nav">
              <div v-for="p in pinnedToc" :key="p.id" class="toc-row">
                <button class="toc-link is-pinned" @click="scrollTo(p.id)">{{ p.text }}</button>
                <button class="toc-pin" @click="togglePin(p.id)" title="Unpin">Unpin</button>
              </div>
            </nav>
            <div class="divider" aria-hidden="true"></div>
          </template>

          <nav class="toc-nav toc-scroll">
            <div v-for="item in otherToc" :key="item.id" class="toc-row">
              <button
                class="toc-link"
                :class="item.level === 1 ? 'lvl-1' : item.level === 2 ? 'lvl-2' : 'lvl-3'"
                @click="scrollTo(item.id)"
              >
                {{ item.text }}
              </button>
              <button class="toc-pin" @click="togglePin(item.id)" title="Pin">Pin</button>
            </div>
          </nav>
        </div>
      </aside>
    </div>
    <ImageLightbox v-if="lightboxSrc" :src="lightboxSrc" :alt="lightboxAlt" @close="lightboxSrc = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'

export interface GuideTocItem { id: string; text: string; level: number }

const props = defineProps<{
  title: string
  mapName?: string
  storageKey: string
  defaultPins?: string[]
  bannerText?: string
  bannerTarget?: string
  bannerLabel?: string
}>()

const route = useRoute()
const superEggRoutes: Record<string, string> = { '/guides/ashes-of-the-damned': 'ashes', '/guides/astra-malorum': 'astra', '/guides/paradox-junction': 'paradox', '/guides/kowakujo': 'kowakujo' }
const superEggMap = computed(() => superEggRoutes[route.path.replace(/\/$/, '')])

const articleRef = ref<HTMLElement | null>(null)
const toc = ref<GuideTocItem[]>([])
const pins = ref<string[]>([])
const lightboxSrc = ref<string | null>(null)
const lightboxAlt = ref<string>('')

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function buildTocAndIds(root: HTMLElement) {
  toc.value = []
  const headings = Array.from(root.querySelectorAll('h1, h2, h3')) as HTMLHeadingElement[]
  headings.forEach(h => {
    const text = h.textContent?.trim() || ''
    if (!text) return
    const idFromDom = h.getAttribute('id')
    const id = idFromDom || `${h.tagName.toLowerCase()}-${slugify(text)}`
    if (!idFromDom) h.id = id
    const level = h.tagName === 'H1' ? 1 : h.tagName === 'H2' ? 2 : 3
    toc.value.push({ id, text, level })
  })
}

function loadPins() {
  try {
    const raw = localStorage.getItem(props.storageKey)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) pins.value = arr
    }
  } catch {}
  if (!pins.value.length) pins.value = [...(props.defaultPins || [])]
}
function savePins() { localStorage.setItem(props.storageKey, JSON.stringify(pins.value)) }
function isPinned(id: string) { return pins.value.includes(id) }
function togglePin(id: string) {
  if (isPinned(id)) pins.value = pins.value.filter(x => x !== id)
  else pins.value.push(id)
  savePins()
}
const pinnedToc = computed(() => pins.value.map(id => toc.value.find(t => t.id === id)).filter(Boolean) as GuideTocItem[])
const otherToc = computed(() => toc.value.filter(t => !isPinned(t.id)))

function scrollTo(id?: string) {
  if (!id) return
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function onArticleClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (!target) return
  if (target.tagName === 'IMG') {
    const img = target as HTMLImageElement
    lightboxSrc.value = img.src
    lightboxAlt.value = img.alt || ''
  }
}

onMounted(async () => {
  await nextTick()
  if (articleRef.value) buildTocAndIds(articleRef.value)
  loadPins()
})

defineExpose({ scrollTo })
</script>

<style scoped>
@font-face{font-family:PigpenCipher;src:local("PigpenCipher Regular"),local("PigpenCipher"),url(/fonts/pigpen-cipher.otf) format(opentype);font-display:swap;font-weight:400;font-style:normal}

/* ---------------------------------------------------------- Page chrome --- */

.guide-page {
  min-height: 100vh;
  padding: 2rem 1.25rem 4rem;
}

.guide-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 2rem;
  max-width: 82rem;
  margin: 0 auto;
}

.guide-surface {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 2rem 2.25rem 2.75rem;
  box-shadow: var(--shadow);
}

.guide-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-bottom: 1.1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--line);
}

.guide-heading {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.guide-map {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  padding-bottom: 0.2rem;
}

.guide-title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.guide-back {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  white-space: nowrap;
  padding-top: 0.35rem;
}

.guide-back:hover {
  color: var(--gold-bright);
}

/* ------------------------------------------------------------- Sidebar ---- */

.guide-aside {
  position: sticky;
  top: 2rem;
  align-self: start;
  height: calc(100vh - 4rem);
}

.toc {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: var(--shadow);
}

.toc-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
  padding: 0 0.35rem 0.75rem;
}

.toc-group-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--faint);
  padding: 0 0.35rem 0.4rem;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0.25rem 0;
}

.toc-scroll {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  scrollbar-width: none;
}

.toc-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.toc-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toc-link {
  flex: 1;
  min-width: 0;
  text-align: left;
  background: none;
  border: 0;
  border-left: 2px solid transparent;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.35;
  padding: 0.4rem 0.55rem;
  cursor: pointer;
  transition: color 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;
}

.toc-link:hover {
  background: var(--surface-2);
  color: var(--text);
}

.toc-link.lvl-1 {
  color: var(--text);
  font-weight: 650;
}

.toc-link.lvl-2 {
  padding-left: 1rem;
}

.toc-link.lvl-3 {
  padding-left: 1.75rem;
  font-size: 0.8rem;
}

.toc-link.is-pinned {
  border-left-color: var(--gold);
  color: var(--text);
  font-weight: 600;
}

.toc-pin {
  flex: none;
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--faint);
  font-size: 0.66rem;
  font-weight: 600;
  padding: 0.25rem 0.4rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.14s ease, color 0.14s ease, border-color 0.14s ease;
}

.toc-row:hover .toc-pin,
.toc-pin:focus-visible {
  opacity: 1;
}

.toc-pin:hover {
  color: var(--gold-bright);
  border-color: var(--gold-border);
}

.divider {
  height: 1px;
  border: 0;
  background: var(--line);
  margin: 0.65rem 0;
}

/* ------------------------------------------------------- Curse banner ----- */

.curse-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  margin: 0 0 1.5rem;
  border: 1px solid var(--gold-border);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius-sm);
  background: var(--gold-dim);
}

.banner-text {
  flex: 1;
  min-width: 12rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--text);
}

.banner-btn {
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  background: var(--gold);
  color: var(--on-gold);
  font-size: 0.82rem;
  font-weight: 650;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
}

.banner-btn:hover {
  background: var(--gold-bright);
}

/* ----------------------------------------------------- Guide components --- */

.prose :where(.g-hint) {
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.55;
  padding: 0.55rem 0.8rem;
  margin: 0 0 1.5rem;
}

/* Cards replace the old glass surfaces: flat, hairline, warm. */
.prose :where(.glass-card) {
  --glass-accent: var(--gold);
  position: relative;
  border: 1px solid var(--line);
  border-left: 3px solid var(--glass-accent);
  border-radius: var(--radius);
  background: var(--surface-2);
  padding: 1.2rem 1.35rem 1.35rem;
  margin: 1.5rem 0;
}

.prose :where(.glass-card h2) {
  border: none;
  margin: 0 0 0.75rem;
  padding: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.prose :where(.glass-card h2 .g-tag) {
  border: 1px solid var(--glass-accent);
  border-radius: 6px;
  background: var(--gold-dim);
  color: var(--gold-bright);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
  padding: 0.3rem 0.5rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.prose :where(.glass-card h3) {
  border: none;
  border-left: 2px solid var(--line-strong);
  background: none;
  border-radius: 0;
  padding: 0 0 0 0.65rem;
  margin: 1.25rem 0 0.5rem;
  color: var(--text);
}

.prose :where(.glass-card > ul) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.35rem 1.25rem;
}

.prose :where(.glass-card ul ul) {
  display: block;
}

.prose :where(.glass-card ol) {
  margin: 0.6rem 0 0.3rem;
}

.prose :where(.glass-card li) {
  margin: 0.35rem 0;
}

/* Accent variants: keep a single accent, vary only the label hue. */
.prose :where(.glass-amber) { --glass-accent: var(--gold-bright); }
.prose :where(.glass-orange) { --glass-accent: var(--orange); }
.prose :where(.glass-green) { --glass-accent: var(--green); }
.prose :where(.glass-violet) { --glass-accent: #a98bc4; }
.prose :where(.glass-red),
.prose :where(.glass-boss) { --glass-accent: var(--red); }

.prose :where(.glass-boss) {
  border-color: var(--line);
  border-left-color: var(--red);
}

.prose :where(.glass-quest) {
  padding: 1.35rem 1.45rem 1.45rem;
}

.prose :where(.glass-quest ol > li) {
  margin: 0.7rem 0;
}

/* Cheat sheet grid */
.prose :where(.cheat-grid) {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  margin: 1.25rem 0 1.75rem;
}

.prose :where(.cheat-block) {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-2);
  padding: 1rem 1.1rem 1.15rem;
}

.prose :where(.cheat-block h2) {
  border: none;
  font-size: 1rem;
  margin: 0 0 0.5rem;
  padding: 0;
}

.prose :where(.cheat-block ol) {
  margin: 0;
  padding-left: 1.2rem;
}

.prose :where(.cheat-block li) {
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0.3rem 0;
}

.prose :where(.cheat-block ul) {
  margin: 0.25rem 0 0;
  padding-left: 1rem;
}

.prose :where(.cheat-block ul li) {
  font-size: 0.82rem;
  color: var(--muted);
}

.prose :where(.cheat-note) {
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0.5rem 0 0;
}

.prose :where(.cheat-chip) {
  border: 1px solid var(--gold-border);
  border-radius: 6px;
  background: var(--gold-dim);
  color: var(--gold-bright);
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  margin-left: 0.2rem;
  padding: 0.12rem 0.4rem;
  vertical-align: middle;
}

/* Relic + effect cards */
.prose :where(.relic-grid) {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

.prose :where(.relic-heading) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 1rem;
  font-weight: 650;
  margin: 0 0 0.7rem;
  padding: 0.4rem 0.7rem;
}

.prose :where(.relic-heading.grim) { border-color: var(--gold-border); color: var(--gold-bright); }
.prose :where(.relic-heading.sinister) { border-color: rgba(251,191,36,.4); color: #e8c56a; }
.prose :where(.relic-heading.wicked) { border-color: rgba(201,118,106,.45); color: #d9887c; }

.prose :where(.relic-cards) {
  display: grid;
  gap: 1rem;
}

.prose :where(.relic-card) {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-2);
  padding: 0.9rem 1rem 1rem;
}

.prose :where(.relic-card.grim) { border-left: 3px solid var(--gold); }
.prose :where(.relic-card.sinister) { border-left: 3px solid #e8c56a; }
.prose :where(.relic-card.wicked) { border-left: 3px solid #d9887c; }

.prose :where(.relic-title) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.98rem;
  font-weight: 650;
  margin-bottom: 0.45rem;
}

.prose :where(.mini-tag) {
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  background: var(--surface-3);
  color: var(--muted);
  font-size: 0.66rem;
  font-weight: 650;
  letter-spacing: 0.05em;
  padding: 0.18rem 0.42rem;
}

.prose :where(.relic-card.grim .mini-tag) { border-color: var(--gold-border); color: var(--gold-bright); }
.prose :where(.relic-card.sinister .mini-tag) { border-color: rgba(251,191,36,.4); color: #e8c56a; }
.prose :where(.relic-card.wicked .mini-tag) { border-color: rgba(201,118,106,.45); color: #d9887c; }

.prose :where(.steps) {
  font-size: 0.86rem;
  line-height: 1.6;
  margin: 0;
  padding-left: 1.15rem;
}

.prose :where(.steps li) { margin: 0.25rem 0; }
.prose :where(.placeholder) { font-size: 0.8rem; margin: 0; color: var(--faint); }

.prose :where(.relic-chip) {
  border-radius: 6px;
  display: inline-block;
  font-size: 0.66rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  padding: 0.15rem 0.45rem;
}

.prose :where(.relic-chip.grim) { background: var(--gold-dim); border: 1px solid var(--gold-border); color: var(--gold-bright); }
.prose :where(.relic-chip.sinister) { background: rgba(251,191,36,.1); border: 1px solid rgba(251,191,36,.4); color: #e8c56a; }
.prose :where(.relic-chip.wicked) { background: rgba(201,118,106,.12); border: 1px solid rgba(201,118,106,.45); color: #d9887c; }

.prose :where(.relic-tiers) { font-size: 0.86rem; margin: 0.7rem 0 0.5rem; padding-left: 1.3rem; }
.prose :where(.relic-tiers li) { margin: 0.3rem 0; }
.prose :where(.relic-note) { font-size: 0.78rem; margin: 0.25rem 0; color: var(--faint); }

.prose :where(.relic-ok) {
  border: 1px solid rgba(127,180,122,.4);
  border-radius: var(--radius-sm);
  background: rgba(127,180,122,.1);
  color: #c5e0c1;
  font-size: 0.78rem;
  font-weight: 650;
  padding: 0.4rem 0.65rem;
  margin: 0.45rem 0 0.55rem;
}

.prose :where(.relic-warn) {
  border: 1px solid rgba(201,118,106,.5);
  border-radius: var(--radius-sm);
  background: rgba(201,118,106,.1);
  color: #e6b3aa;
  font-size: 0.8rem;
  font-weight: 650;
  line-height: 1.5;
  padding: 0.5rem 0.7rem;
  margin: 0.45rem 0 0.55rem;
}

.prose :where(.relic-meta) { font-size: 0.82rem; color: var(--muted); line-height: 1.6; margin: 0.45rem 0 0; }
.prose :where(.relic-meta b) { color: var(--gold-bright); }
.prose :where(.relic-meta.dim) { color: var(--faint); }

/* Quest cheat-sheet blocks (used by Astra / Ashes) */
.prose :where(.quest-grid) {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin: 1.25rem 0 1.75rem;
}

.prose :where(.quest-block) {
  border: 1px solid var(--line);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius);
  background: var(--surface-2);
  padding: 1rem 1.1rem 1.15rem;
}

.prose :where(.quest-block.phase1) { border-left-color: var(--gold); }
.prose :where(.quest-block.phase2) { border-left-color: var(--orange); }
.prose :where(.quest-block.phase3) { border-left-color: var(--gold-bright); }
.prose :where(.quest-block.phase4) { border-left-color: var(--red); }

.prose :where(.quest-block h2) {
  border: none;
  margin: 0 0 0.55rem;
  padding: 0;
  font-size: 1rem;
  color: var(--text);
}

.prose :where(.quest-block ol) {
  margin: 0;
  padding-left: 1.2rem;
}

.prose :where(.quest-block li) {
  font-size: 0.87rem;
  line-height: 1.55;
  margin: 0.3rem 0;
}

.prose :where(.relic-order) { display: inline-flex; gap: 0.35rem; flex-wrap: wrap; }
.prose :where(.relic-order b) {
  border: 1px solid var(--gold-border);
  border-radius: 6px;
  background: var(--gold-dim);
  color: #f0d9a8;
  font-size: 0.82rem;
  padding: 0.15rem 0.5rem;
}

.prose :where(.relic-trial) { margin: 0.45rem 0 0 1.3rem; padding: 0; }
.prose :where(.relic-trial li) { font-size: 0.8rem; margin: 0.25rem 0; color: var(--muted); }

/* Boss + perk cards */
.prose :where(.boss-phases) { display: grid; gap: 1rem; margin: 0.9rem 0 1.25rem; }
.prose :where(.boss-card) {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-2);
  padding: 0.85rem 1rem 1rem;
}

.prose :where(.boss-card.phase1) { border-left: 3px solid var(--gold); }
.prose :where(.boss-card.phase2) { border-left: 3px solid #e8c56a; }
.prose :where(.boss-card.phase3) { border-left: 3px solid var(--red); }

.prose :where(.boss-title) { font-size: 0.95rem; font-weight: 650; letter-spacing: 0.02em; margin: 0 0 0.45rem; }
.prose :where(.boss-points) { font-size: 0.82rem; line-height: 1.55; margin: 0; padding-left: 1.15rem; }
.prose :where(.boss-points li) { margin: 0.25rem 0; }
.prose :where(.boss-tip) { font-size: 0.72rem; font-weight: 650; letter-spacing: 0.04em; margin: 0.5rem 0 0; color: var(--muted); }

.prose :where(.mixologist-grid) { display: grid; gap: 1rem; margin: 0.9rem 0 1.2rem; }
.prose :where(.perk-card) {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-2);
  padding: 0.8rem 0.9rem 0.9rem;
}

.prose :where(.perk-card.quick) { border-left: 3px solid #7d9fc4; }
.prose :where(.perk-card.stamin) { border-left: 3px solid #e8c56a; }
.prose :where(.perk-card.speed) { border-left: 3px solid var(--green); }
.prose :where(.perk-card.jugger) { border-left: 3px solid var(--red); }

.prose :where(.perk-title) { display: inline-block; border-radius: 6px; font-size: 0.92rem; font-weight: 650; letter-spacing: 0.02em; margin: 0 0 0.4rem; padding: 0.3rem 0.55rem; }
.prose :where(.perk-card.quick .perk-title) { background: rgba(125,159,196,.12); border: 1px solid rgba(125,159,196,.4); color: #a9c4e0; }
.prose :where(.perk-card.stamin .perk-title) { background: var(--gold-dim); border: 1px solid var(--gold-border); color: var(--gold-bright); }
.prose :where(.perk-card.speed .perk-title) { background: rgba(127,180,122,.12); border: 1px solid rgba(127,180,122,.4); color: #b7d9b3; }
.prose :where(.perk-card.jugger .perk-title) { background: rgba(201,118,106,.12); border: 1px solid rgba(201,118,106,.45); color: #e0a99f; }

.prose :where(.perk-ingredients) { font-size: 0.8rem; line-height: 1.5; margin: 0 0 0.45rem; padding-left: 1.15rem; }
.prose :where(.perk-ingredients li) { margin: 0.2rem 0; }
.prose :where(.perk-action) { font-size: 0.76rem; font-weight: 650; letter-spacing: 0.04em; margin: 0.25rem 0 0.3rem; color: var(--muted); }
.prose :where(.perk-tip) { font-size: 0.68rem; letter-spacing: 0.04em; color: var(--faint); }

/* Evidence cards (murder mystery) */
.prose :where(.evidence-card) {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  margin: 1.25rem 0;
  padding: 0.95rem 1.1rem 1.15rem;
  background: var(--surface-2);
}

.prose :where(.evidence-card h3) {
  border: none;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1.08rem;
  margin: 0 0 0.55rem;
  padding: 0;
  flex-wrap: wrap;
}

.prose :where(.evidence-card h3)::before { content: none; }

.prose :where(.evidence-card h3 .ev-chip) {
  border-radius: 6px;
  border: 1px solid var(--line-strong);
  background: var(--surface-3);
  font-size: 0.7rem;
  font-weight: 650;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.5rem;
  white-space: nowrap;
}

.prose :where(.evidence-card.ev-suspect) { border-left: 3px solid var(--gold); }
.prose :where(.evidence-card.ev-accomplice) { border-left: 3px solid var(--orange); }
.prose :where(.evidence-card.ev-poison) { border-left: 3px solid var(--green); }
.prose :where(.evidence-card.ev-location) { border-left: 3px solid #a98bc4; }
.prose :where(.evidence-card.ev-motive) { border-left: 3px solid var(--red); }

.prose :where(.evidence-card ul, .evidence-card ol) { margin: 0.45rem 0 0.25rem; }
.prose :where(.evidence-card > p) { margin: 0.5rem 0; }
.prose :where(.evidence-sub) {
  border-left: 3px solid var(--line-strong);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin: 0.8rem 0;
  padding: 0.5rem 0.75rem 0.6rem;
  background: var(--surface-3);
}

.prose :where(.evidence-sub .ev-tag) { display: inline-block; color: var(--gold-bright); font-size: 0.88rem; font-weight: 650; letter-spacing: 0.03em; margin: 0 0 0.35rem; }
.prose :where(.evidence-sub ol) { margin: 0.2rem 0 0; }

/* Foldable sections */
.prose :where(details.glass-fold) {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-2);
  margin: 0.8rem 0 1rem;
  overflow: hidden;
}

.prose :where(details.glass-fold > summary) {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  font-weight: 650;
  color: var(--gold-bright);
  font-size: 0.9rem;
  user-select: none;
}

.prose :where(details.glass-fold > summary::-webkit-details-marker) { display: none; }
.prose :where(details.glass-fold > summary:hover) { background: var(--surface-3); }
.prose :where(details.glass-fold .fold-note) { margin-left: auto; font-size: 0.7rem; color: var(--faint); font-weight: 600; }
.prose :where(details.glass-fold .fold-arrow) { color: var(--gold); font-size: 0.8rem; transition: transform 0.2s; }
.prose :where(details.glass-fold[open] .fold-arrow) { transform: rotate(90deg); }
.prose :where(details.glass-fold ol) { margin: 0.2rem 0; padding: 0.2rem 1.4rem 1rem 2.2rem; }
.prose :where(details.glass-fold li) { margin: 0.3rem 0; }

/* Collapsible card headers */
.prose :where(.g-toggle) { display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; cursor: pointer; flex: 1; min-width: 0; width: 100%; }
.prose :where(.g-cb) { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }
.prose :where(.g-title) { display: contents; }

.prose :where(.g-chev) {
  margin-left: auto;
  color: var(--gold);
  font-size: 0.75rem;
  transition: transform 0.2s;
  flex: none;
  opacity: 0.8;
}

.prose :where(.g-chev)::after { content: "\25BE"; }
.prose :where(.g-cb:checked ~ .g-chev)::after { content: "\25B8"; }

.prose :where(.glass-card:has(> h2 .g-cb:checked) > *:not(h2),
.evidence-card:has(> h3 .g-cb:checked) > *:not(h3)) { display: none; }

/* Shared helper blocks */
.prose :where(.helper-row) { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); margin: 1.25rem 0 1.75rem; }

.prose :where(.book-helper),
.prose :where(.planet-helper) {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-2);
  padding: 1.15rem 1.25rem 1.25rem;
  margin: 1.25rem 0 1.5rem;
}

.prose :where(.book-helper h3),
.prose :where(.planet-helper h3) { color: var(--text); font-size: 1.05rem; margin: 0 0 0.4rem; }
.prose :where(.book-helper p),
.prose :where(.planet-helper p) { color: var(--muted); margin: 0 0 0.75rem; }

.prose :where(.book-grid) { display: grid; gap: 0.85rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 0.6rem; }
.prose :where(.book-grid div) { background: var(--surface-3); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 0.75rem 0.85rem; }
.prose :where(.book-header) { color: var(--text); font-weight: 650; margin-bottom: 0.4rem; }
.prose :where(.book-grid label) { display: flex; align-items: center; gap: 0.5rem; color: var(--text); font-size: 0.95rem; margin: 0.3rem 0; }

.prose :where(.bust-output, #bust-output) {
  background: var(--surface-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--gold-bright);
  padding: 0.75rem 0.85rem;
}

.prose :where(.planet-list) { display: grid; gap: 0.6rem; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
.prose :where(.planet-list button) {
  width: 100%;
  text-align: left;
  background: var(--surface-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--text);
  cursor: pointer;
  padding: 0.6rem 0.7rem;
  transition: border-color 0.14s ease, background-color 0.14s ease;
}

.prose :where(.planet-list button:hover) { border-color: var(--gold-border); background: var(--surface-2); }
.prose :where(.planet-output) { background: var(--surface-3); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text); font-weight: 650; letter-spacing: 0.08em; margin-top: 0.7rem; padding: 0.7rem 0.8rem; }
.prose :where(.planet-actions) { display: flex; gap: 0.5rem; margin-top: 0.6rem; }
.prose :where(.planet-actions button) {
  flex: 1;
  background: var(--surface-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--text);
  cursor: pointer;
  padding: 0.5rem 0.65rem;
  transition: border-color 0.14s ease, background-color 0.14s ease;
}

.prose :where(.planet-actions button:hover) { border-color: var(--gold-border); background: var(--surface-2); }

/* Pigpen helper */
.prose :where(.pigpen-helper .helper-card) {
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  margin-top: 0.9rem;
  padding: 0.9rem 1.1rem;
}

.prose :where(.pigpen-helper .helper-header) { color: var(--text); font-size: 0.98rem; font-weight: 650; margin-bottom: 0.6rem; }
.prose :where(.pigpen-helper .helper-options) { display: grid; gap: 0.55rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.prose :where(.pigpen-helper .helper-option) { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background: var(--surface-3); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text); padding: 0.55rem 0.65rem; }
.prose :where(.pigpen-helper .helper-option:hover) { border-color: var(--line-strong); }
.prose :where(.pigpen-helper .helper-option.active) { border-color: var(--gold); background: var(--gold-dim); }
.prose :where(.pigpen-helper .helper-results) { margin-top: 0.6rem; }
.prose :where(.pigpen-helper .helper-numbers) { display: none; background: var(--surface-3); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 0.45rem 0.55rem; }
.prose :where(.pigpen-helper .helper-numbers.active) { display: block; }
.prose :where(.pigpen-helper .helper-note) { color: var(--muted); font-size: 0.85rem; margin-top: 0.55rem; }
.prose :where(.pigpen-helper .helper-label) { font-weight: 650; }
.prose :where(.pigpen) { font-family: PigpenCipher, ui-sans-serif, system-ui; letter-spacing: 0.06em; }

/* Rex Infernus tabs + quote picker (flat segmented controls) */
.prose :where(.rex-tools) { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin: 1rem 0 1.25rem; border: 1px solid var(--line); border-left: 3px solid var(--gold); background: var(--surface-2); border-radius: var(--radius-sm); padding: 0.7rem 0.85rem; }
.prose :where(.rex-tools-label) { color: var(--muted); font-size: 0.85rem; }
.prose :where(.rex-tool-link) {
  display: inline-flex;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  color: var(--gold-bright) !important;
  text-decoration: none !important;
  background: var(--gold-dim);
  font-weight: 650;
  font-size: 0.82rem;
}

.prose :where(.rex-tool-link:hover) { background: rgba(212,162,74,.22); }

.prose :where(.rex-tabs) { display: flex; gap: 0.4rem; flex-wrap: wrap; margin: 0.9rem 0 0.25rem; }
.prose :where(.rex-tabs h3) { border: none !important; background: none !important; padding: 0 !important; margin: 0 !important; font-size: 1rem; }
.prose :where(.rex-tab) { display: inline-block; padding: 0.5rem 0.9rem; border: 1px solid var(--line); border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 650; color: var(--muted); cursor: pointer; background: var(--surface-2); }
.prose :where(.rex-panel) { display: none; border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 0.2rem 0.85rem 0.65rem; margin-top: 0.6rem; background: var(--surface-2); }

.prose :deep(#rextab-d:checked ~ #rexp-d),
.prose :deep(#rextab-n:checked ~ #rexp-n),
.prose :deep(#rextab-c:checked ~ #rexp-c),
.prose :deep(#rextab-v:checked ~ #rexp-v) { display: block; }

.prose :deep(#rextab-d:checked ~ .rex-tabs label[for="rextab-d"]),
.prose :deep(#rextab-n:checked ~ .rex-tabs label[for="rextab-n"]),
.prose :deep(#rextab-c:checked ~ .rex-tabs label[for="rextab-c"]),
.prose :deep(#rextab-v:checked ~ .rex-tabs label[for="rextab-v"]) { background: var(--gold); color: var(--on-gold); border-color: var(--gold); }

.prose :where(.rex-phase) { border-left: 3px solid var(--gold); background: var(--surface-3); border-radius: var(--radius-sm); padding: 0.6rem 0.85rem 0.65rem; margin: 0.8rem 0; }
.prose :where(.rex-phase-head) { color: var(--gold-bright); font-weight: 700; font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 0.4rem; }
.prose :where(.rex-phase ol) { margin: 0.2rem 0 0.1rem; }
.prose :where(.rex-ph-note) { font-size: 0.82rem; color: var(--muted); margin: 0.25rem 0 0.4rem; }

.prose :where(.rex-qsolver) { border: 1px solid var(--line); border-left: 3px solid var(--gold); background: var(--surface-2); border-radius: var(--radius-sm); padding: 0.7rem 0.85rem; margin: 0.6rem 0 0.8rem; }
.prose :where(.rex-q-tabs) { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
.prose :where(.rex-q-tabs label) { padding: 0.35rem 0.75rem; border: 1px solid var(--line); border-radius: var(--radius-sm); font-weight: 650; color: var(--muted); cursor: pointer; background: var(--surface-3); font-size: 0.84rem; }
.prose :where(.rex-q-res) { display: none; }

.prose :deep(#rexq-1:checked ~ #rexq-r1),
.prose :deep(#rexq-2:checked ~ #rexq-r2),
.prose :deep(#rexq-3:checked ~ #rexq-r3),
.prose :deep(#rexq-4:checked ~ #rexq-r4) { display: block; }

.prose :deep(#rexq-1:checked ~ .rex-q-tabs label[for="rexq-1"]),
.prose :deep(#rexq-2:checked ~ .rex-q-tabs label[for="rexq-2"]),
.prose :deep(#rexq-3:checked ~ .rex-q-tabs label[for="rexq-3"]),
.prose :deep(#rexq-4:checked ~ .rex-q-tabs label[for="rexq-4"]) { background: var(--gold); color: var(--on-gold); border-color: var(--gold); }

.prose :where(.rex-q-quote) { font-style: italic; color: var(--text); margin: 0.1rem 0 0.55rem; font-size: 0.92rem; }
.prose :where(.rex-q-chips) { display: flex; gap: 0.45rem; flex-wrap: wrap; }
.prose :where(.rex-q-chip) { padding: 0.32rem 0.6rem; border: 1px solid var(--gold-border); border-radius: var(--radius-sm); color: var(--gold-bright); background: var(--gold-dim); font-weight: 650; font-size: 0.8rem; }
.prose :where(.rex-q-chip.zero) { opacity: 0.5; border-color: var(--line); color: var(--faint); }

/* ----------------------------------------------------------- Responsive --- */

@media (max-width: 1023px) {
  .guide-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .guide-aside {
    display: none;
  }
}

@media (max-width: 640px) {
  .guide-page {
    padding: 1.1rem 0.85rem 3rem;
  }

  .guide-surface {
    padding: 1.35rem 1.15rem 2rem;
  }

  .guide-header {
    gap: 0.75rem;
  }

  .toc-link.lvl-2,
  .toc-link.lvl-3 {
    padding-left: 0.9rem;
  }
}
</style>

<style scoped>
.super-egg-link { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; padding: .9rem 1.25rem; margin: 0 0 1rem; border: 1px solid var(--gold-border); border-radius: var(--radius-sm); color: var(--gold-bright); text-decoration: none; font-size: .85rem; background: var(--gold-dim); }
.super-egg-link span { color: var(--muted); }
.super-egg-link:hover { border-color: var(--gold); }
</style>
