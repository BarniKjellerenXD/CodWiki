<template>
  <div class="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-600/10">
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <section class="min-w-0">
        <div class="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl shadow-cyan-500/10 p-4 sm:p-6">
          <header class="flex items-center justify-between gap-4 mb-4 border-b border-white/10 pb-3">
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300">Astra Malorum</h1>
            <NuxtLink class="text-sm text-white/70 hover:text-white underline underline-offset-4" to="/">Back to index</NuxtLink>
          </header>
          <div class="curse-banner">
            <div class="banner-text">Already finished the Main Quest once and unlocked Relics? Jump straight to the modifiers.</div>
            <button class="banner-btn" @click="scrollTo('wiki_relics')">Go to Relics</button>
          </div>
          <article ref="articleRef" class="prose prose-invert max-w-none" @click="onArticleClick">
            <div v-if="html" v-html="html"></div>
            <div v-else class="text-white/70">Loading guide…</div>
          </article>
        </div>
      </section>
      <aside class="hidden lg:block sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto">
        <div class="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl shadow-cyan-500/10 p-3">
          <h2 class="text-base font-semibold mb-2 text-cyan-200 tracking-wide">Chapters</h2>
          <div class="mb-2">
            <div class="text-[11px] font-semibold text-white/70 mb-1">Pinned</div>
            <nav class="space-y-1.5">
              <div v-for="p in pinnedToc" :key="p.id" class="flex items-center gap-1.5">
                <button @click="scrollTo(p.id)" class="flex-1 text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-white/10 text-white border-l-2 border-cyan-400">
                  {{ p.text }}
                </button>
                <button class="text-[11px] px-2 py-1 rounded-md bg-slate-800/60 border border-white/10 text-white/80" @click="togglePin(p.id)" title="Unpin">Unpin</button>
              </div>
            </nav>
          </div>
          <div class="divider" aria-hidden="true"></div>
          <nav class="space-y-1.5 no-scrollbar max-h-[46vh] overflow-y-auto mt-2">
            <div v-for="item in otherToc" :key="item.id" class="flex items-center gap-1.5">
              <button
                @click="scrollTo(item.id)"
                class="flex-1 text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-white/10 text-white/90 border-l-2 border-transparent hover:border-cyan-300"
                :class="item.level === 1 ? 'font-semibold text-white' : item.level === 2 ? 'pl-5' : 'pl-8'"
              >
                {{ item.text }}
              </button>
              <button class="text-[11px] px-2 py-1 rounded-md bg-slate-800/60 border border-white/10 text-white/80" @click="togglePin(item.id)" title="Pin">Pin</button>
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

// Static wiki renderer for Astra Malorum
const html = ref<string>('')
const articleRef = ref<HTMLElement | null>(null)
const toc = ref<Array<{ id: string; text: string; level: number }>>([])
const pinnedOrderDefault = [
  'wiki_relics',
  'wiki_lgm.2D1',
  'wiki_main_quest'
]
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
    const raw = localStorage.getItem('guide-pins-astra')
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) pins.value = arr
    }
  } catch {}
  if (!pins.value.length) pins.value = [...pinnedOrderDefault]
}
function savePins() { localStorage.setItem('guide-pins-astra', JSON.stringify(pins.value)) }
function isPinned(id: string) { return pins.value.includes(id) }
function togglePin(id: string) {
  if (isPinned(id)) pins.value = pins.value.filter(x => x !== id)
  else pins.value.push(id)
  savePins()
}
const pinnedToc = computed(() => pins.value.map(id => toc.value.find(t => t.id === id)).filter(Boolean) as {id:string;text:string;level:number}[])
const otherToc = computed(() => toc.value.filter(t => !isPinned(t.id)))

function scrollTo(id: string) {
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
  const option = target.closest('.helper-option') as HTMLElement | null
  if (option) {
    const word = option.getAttribute('data-word') || ''
    selectPigpenWord(word)
  }
}

function selectPigpenWord(word: string) {
  const container = articleRef.value?.querySelector('.pigpen-helper') as HTMLElement | null
  if (!container || !word) return
  const options = Array.from(container.querySelectorAll('.helper-option')) as HTMLElement[]
  const panels = Array.from(container.querySelectorAll('.helper-numbers')) as HTMLElement[]
  options.forEach(btn => {
    const isActive = btn.getAttribute('data-word') === word
    btn.classList.toggle('active', isActive)
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false')
  })
  panels.forEach(p => {
    const isActive = p.getAttribute('data-word') === word
    p.classList.toggle('active', isActive)
    p.setAttribute('aria-hidden', isActive ? 'false' : 'true')
  })
}

function initPigpenHelper() {
  const container = articleRef.value?.querySelector('.pigpen-helper') as HTMLElement | null
  if (!container) return
}

function initBustHelper() {
  const container = articleRef.value?.querySelector('#wiki_bust_book_helper') as HTMLElement | null
  if (!container || container.getAttribute('data-initialized') === 'true') return
  const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[]
  const output = container.querySelector('#bust-output') as HTMLElement | null
  if (!checkboxes.length || !output) return

  const update = () => {
    const counts: [number, number, number] = [0, 0, 0]
    checkboxes.forEach(cb => {
      if (cb.checked) {
        const bust = Number(cb.dataset.bust || '0')
        if (bust >= 1 && bust <= 3) counts[bust - 1] += 1
      }
    })
    const parts = counts
      .map((c, i) => (c ? `Bust ${i + 1}: interact ${c} ${c === 1 ? 'time' : 'times'}` : ''))
      .filter(Boolean)
    output.textContent = parts.length
      ? parts.join(' • ')
      : 'Select the book titles shown in-game to see how many times to interact with each bust.'
  }

  checkboxes.forEach(cb => cb.addEventListener('change', update))
  update()
  container.setAttribute('data-initialized', 'true')
}

function initPlanetHelper() {
  const container = articleRef.value?.querySelector('#wiki_planet_code_helper') as HTMLElement | null
  if (!container || container.getAttribute('data-initialized') === 'true') return

  const buttons = Array.from(container.querySelectorAll('[data-digit]')) as HTMLElement[]
  const out = container.querySelector('#planet-output') as HTMLElement | null
  const undo = container.querySelector('#planet-undo') as HTMLElement | null
  const resetBtn = container.querySelector('#planet-reset') as HTMLElement | null
  if (!buttons.length || !out || !undo || !resetBtn) return

  const digits: string[] = []

  const render = () => {
    out.textContent = digits.length ? `Code: ${digits.join('')}` : 'Click planets to build the code…'
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.getAttribute('data-digit') || ''
      if (!d) return
      if (digits.length >= 3) digits.shift()
      digits.push(d)
      render()
    })
  })

  undo.addEventListener('click', () => {
    digits.pop()
    render()
  })

  resetBtn.addEventListener('click', () => {
    digits.length = 0
    render()
  })

  render()
  container.setAttribute('data-initialized', 'true')
}

onMounted(async () => {
  try {
    const res = await fetch('/guides/astra-malorum.html', { cache: 'no-store' })
    const raw = await res.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(raw, 'text/html')
    const blocks = Array.from(doc.querySelectorAll('.md.wiki'))
    const combined = blocks.map(b => b.innerHTML).join('\n')
    html.value = combined || raw
    await nextTick()
    if (articleRef.value) buildTocAndIds(articleRef.value)
    loadPins()
    initPigpenHelper()
    initBustHelper()
    initPlanetHelper()
  } catch (e) {
    html.value = '<p>Failed to load guide.</p>'
  }
})
</script>

<style scoped>
.prose {
  --accent: #22d3ee;
  --accent2: #d946ef;
}
.prose :where(table) {
  width: 100%;
  border-collapse: collapse;
}
.prose :where(th, td) {
  border: 1px solid rgba(255,255,255,0.15);
  padding: 0.5rem;
}
.prose :where(thead th) {
  background: linear-gradient(90deg, rgba(34,211,238,0.15), rgba(217,70,239,0.15));
  font-weight: 600;
}
.prose :where(tr:nth-child(odd)) {
  background-color: rgba(255,255,255,0.04);
}
.prose :where(img) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  cursor: zoom-in;
}
.prose :where(h1) {
  font-size: 1.85rem;
  line-height: 1.2;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.prose :where(h2) {
  font-size: 1.35rem;
  margin-top: 1.5rem;
  padding-left: 0.5rem;
  border-left: 3px solid var(--accent);
}
.prose :where(h3) {
  font-size: 1.1rem;
  margin-top: 1rem;
  color: rgba(255,255,255,0.9);
}
.prose :where(hr) {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0));
}
.prose :where(a) {
  color: var(--accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}
.prose :where(a:hover) {
  color: #67e8f9;
}
.prose :where(code) {
  background-color: rgba(255,255,255,0.08);
  padding: 0.15rem 0.35rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(255,255,255,0.1);
}
.prose :where(pre) {
  background-color: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
}
.prose :where(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin-left: 0.25rem;
}
.prose :where(ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin-left: 0.25rem;
}
.prose :where(li) {
  margin: 0.25rem 0;
}
.prose :where(li::marker) {
  color: var(--accent);
}
.no-scrollbar { scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { width: 0; height: 0; }
.divider { height: 1px; background: linear-gradient(90deg, rgba(255,255,255,.0), rgba(255,255,255,.15), rgba(255,255,255,.0)); border: 0; }
/* Cursed mode banner */
.curse-banner { display:flex; flex-wrap:wrap; align-items:center; gap:.6rem; margin:-.25rem 0 1rem; padding:.6rem .75rem; border:1px solid rgba(255,255,255,.15); border-radius:.75rem; background:linear-gradient(120deg, rgba(34,211,238,.12), rgba(217,70,239,.08)); box-shadow:0 6px 20px -6px rgba(0,0,0,.45); }
.banner-text { flex:1; font-size:.85rem; color:#e2e8f0; }
.banner-btn { background:linear-gradient(135deg,#22d3ee,#d946ef); color:#0f172a; font-weight:700; letter-spacing:.04em; border:none; border-radius:.6rem; padding:.45rem .7rem; cursor:pointer; }
.banner-btn:hover { filter:brightness(1.08); }
.prose :where(.pigpen-helper .helper-card) {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background-color: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
}
.prose :where(.pigpen-helper .helper-header) {
  font-weight: 700;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.95);
  margin-bottom: 0.5rem;
}
.prose :where(.pigpen-helper .helper-options) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}
.prose :where(.pigpen-helper .helper-option) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  background-color: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.9);
}
.prose :where(.pigpen-helper .helper-option:hover) {
  background-color: rgba(255,255,255,0.08);
}
.prose :where(.pigpen-helper .helper-option.active) {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(34,211,238,0.25) inset;
}
.prose :where(.pigpen-helper .helper-results) {
  margin-top: 0.5rem;
}
.prose :where(.pigpen-helper .helper-numbers) {
  display: none;
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
}
.prose :where(.pigpen-helper .helper-numbers.active) {
  display: block;
}
.prose :where(.pigpen-helper .helper-note) {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
}
.prose :where(.pigpen-helper .helper-label) {
  font-weight: 600;
}
.prose :where(.pigpen) {
  font-family: 'PigpenCipher', ui-sans-serif, system-ui;
  letter-spacing: 0.06em;
}
.prose :where(.helper-row) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1rem 0 1.5rem;
}
.prose :where(.book-helper) {
  margin: 1rem 0 1.5rem;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.14);
  background: linear-gradient(135deg, rgba(15,23,42,0.65), rgba(34,211,238,0.12));
  box-shadow: 0 20px 50px rgba(0,0,0,0.35);
}
.prose :where(.book-helper h3) {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  color: #e0f2fe;
}
.prose :where(.book-helper p) {
  margin: 0 0 0.65rem;
  color: rgba(255,255,255,0.85);
}
.prose :where(.book-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.prose :where(.book-grid div) {
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
.prose :where(.book-header) {
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: #c7d2fe;
}
.prose :where(.book-grid label) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  margin: 0.25rem 0;
  color: rgba(255,255,255,0.9);
}
.prose :where(.book-grid input[type="checkbox"]) {
  accent-color: #22d3ee;
  width: 16px;
  height: 16px;
}
.prose :where(#bust-output) {
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: #e0f2fe;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
.prose :where(.planet-helper) {
  margin: 1rem 0 1.5rem;
  padding: 1rem 1.05rem;
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.14);
  background: linear-gradient(135deg, rgba(15,23,42,0.65), rgba(217,70,239,0.12));
  box-shadow: 0 20px 50px rgba(0,0,0,0.35);
}
.prose :where(.planet-helper h3) {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  color: #fce7f3;
}
.prose :where(.planet-helper p) {
  margin: 0 0 0.6rem;
  color: rgba(255,255,255,0.85);
}
.prose :where(.planet-list) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
}
.prose :where(.planet-list button) {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.05);
  color: #e0f2fe;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
}
.prose :where(.planet-list button:hover) {
  border-color: rgba(34,211,238,0.5);
  background: rgba(34,211,238,0.08);
  transform: translateY(-1px);
}
.prose :where(.planet-output) {
  margin-top: 0.65rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: #f8fafc;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.prose :where(.planet-actions) {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}
.prose :where(.planet-actions button) {
  flex: 1;
  padding: 0.45rem 0.6rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.07);
  color: #e0f2fe;
  cursor: pointer;
  transition: filter 120ms ease, transform 120ms ease;
}
.prose :where(.planet-actions button:hover) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
.prose :where(.quest-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}
.prose :where(.quest-block) {
  padding: 1rem 1.1rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}
.prose :where(.quest-block h2) {
  border: none;
  padding-left: 0;
  margin-top: 0;
  margin-bottom: 0.35rem;
  font-size: 1.15rem;
}
.prose :where(.quest-block.phase1) { background: linear-gradient(135deg, rgba(14,165,233,0.18), rgba(30,41,59,0.45)); }
.prose :where(.quest-block.phase2) { background: linear-gradient(135deg, rgba(129,140,248,0.2), rgba(30,41,59,0.45)); }
.prose :where(.quest-block.phase3) { background: linear-gradient(135deg, rgba(236,72,153,0.2), rgba(30,41,59,0.45)); }
.prose :where(.quest-block ol) { margin: 0.35rem 0 0; }
.prose :where(.quest-block li::marker) { color: #a5f3fc; }
.prose :where(.boss-phases) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
  margin: 0.75rem 0 1.5rem;
}
.prose :where(.boss-card) {
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
  background: linear-gradient(135deg, rgba(15,23,42,0.7), rgba(148,163,184,0.1));
}
.prose :where(.boss-card .boss-title) {
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: #e0f2fe;
}
.prose :where(.boss-card.phase1) { border-color: rgba(34,211,238,0.35); }
.prose :where(.boss-card.phase2) { border-color: rgba(56,189,248,0.35); }
.prose :where(.boss-card.phase3) { border-color: rgba(236,72,153,0.35); }
.prose :where(.boss-card.phase4) { border-color: rgba(244,114,182,0.35); }
/* Relics styling */
.prose :where(.relic-grid) {
  display: grid;
  gap: 1.5rem;
  margin-top: 1.25rem;
}
.prose :where(.relic-heading) {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: .02em;
  margin: 0 0 .65rem;
  padding: .4rem .65rem;
  border-radius: .6rem;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  position: relative;
}
.prose :where(.relic-heading.grim) {background: linear-gradient(90deg, rgba(34,211,238,.18), rgba(34,211,238,.05)); border:1px solid rgba(34,211,238,.35); box-shadow:0 0 0 1px rgba(34,211,238,.25) inset;}
.prose :where(.relic-heading.sinister) {background: linear-gradient(90deg, rgba(251,191,36,.22), rgba(251,191,36,.06)); border:1px solid rgba(251,191,36,.40); box-shadow:0 0 0 1px rgba(251,191,36,.28) inset;}
.prose :where(.relic-heading.wicked) {background: linear-gradient(90deg, rgba(239,68,68,.28), rgba(239,68,68,.08)); border:1px solid rgba(239,68,68,.45); box-shadow:0 0 0 1px rgba(239,68,68,.32) inset;}
.prose :where(.relic-cards) {
  display: grid;
  gap: 1rem;
}
.prose :where(.relic-card) {
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  border-radius: .9rem;
  padding: .75rem .85rem .8rem;
  position: relative;
  box-shadow: 0 8px 20px -4px rgba(0,0,0,.35);
}
.prose :where(.relic-card.grim) {border-color: rgba(34,211,238,.35);}
.prose :where(.relic-card.sinister) {border-color: rgba(251,191,36,.45);}
.prose :where(.relic-card.wicked) {border-color: rgba(239,68,68,.5);}
.prose :where(.relic-title) {font-weight:600; margin-bottom:.4rem; font-size:.92rem; display:flex; flex-wrap:wrap; gap:.5rem; align-items:center;}
.prose :where(.mini-tag) {font-size:.65rem; font-weight:600; letter-spacing:.05em; padding:.18rem .4rem; border-radius:.4rem; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);}
.prose :where(.relic-card.grim .mini-tag){color:#22d3ee; border-color:rgba(34,211,238,.4);}
.prose :where(.relic-card.sinister .mini-tag){color:#fbbf24; border-color:rgba(251,191,36,.5);}
.prose :where(.relic-card.wicked .mini-tag){color:#ef4444; border-color:rgba(239,68,68,.55);}
.prose :where(.steps){margin:0; padding-left:1rem; font-size:.8rem; line-height:1.15rem;}
.prose :where(.steps li){margin:.2rem 0;}
.prose :where(.placeholder){font-size:.75rem; opacity:.75; margin:0;}
.prose :where(.relic-chip){display:inline-block; padding:.15rem .45rem; border-radius:.5rem; font-size:.65rem; font-weight:600; letter-spacing:.04em; vertical-align:baseline;}
.prose :where(.relic-chip.grim){background:rgba(34,211,238,.18); color:#22d3ee; border:1px solid rgba(34,211,238,.4);}
.prose :where(.relic-chip.sinister){background:rgba(251,191,36,.22); color:#fbbf24; border:1px solid rgba(251,191,36,.5);}
.prose :where(.relic-chip.wicked){background:rgba(239,68,68,.28); color:#ef4444; border:1px solid rgba(239,68,68,.55);}
.prose :where(.relic-tiers){margin:.6rem 0 .4rem; padding-left:1.2rem; font-size:.8rem;}
.prose :where(.relic-tiers li){margin:.25rem 0;}
.prose :where(.relic-note){font-size:.7rem; opacity:.7; margin:.2rem 0 .2rem;}
</style>
