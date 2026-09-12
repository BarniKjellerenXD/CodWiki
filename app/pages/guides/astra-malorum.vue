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
@font-face{font-family:PigpenCipher;src:local("PigpenCipher Regular"),local("PigpenCipher"),url(../fonts/pigpen-cipher.otf) format(opentype);font-display:swap;font-weight:400;font-style:normal}
.prose{--accent:#f59e0b;--accent2:#f97316}
.prose :where(table){border-collapse:collapse;width:100%}
.prose :where(th,td){border:1px solid hsla(0,0%,100%,.15);padding:.5rem}
.prose :where(thead th){background:linear-gradient(90deg,#f59e0b26,#f9731626);font-weight:600}
.prose :where(tr:nth-child(odd)){background-color:#ffffff0a}
.prose :where(img){border-radius:.5rem;box-shadow:0 10px 30px #00000040;cursor:zoom-in}
.prose :where(h1){border-bottom:1px solid hsla(0,0%,100%,.1);font-size:1.85rem;line-height:1.2;padding-bottom:.25rem}
.prose :where(h2){border-left:3px solid var(--accent);font-size:1.35rem;margin-top:1.5rem;padding-left:.5rem}
.prose :where(h3){color:#ffffffe6;font-size:1.1rem;margin-top:1rem}
.prose :where(hr){background:linear-gradient(90deg,#fff0,#fff3,#fff0);border:none;height:1px}
.prose :where(a){color:var(--accent);text-decoration-thickness:2px;text-underline-offset:2px}
.prose :where(a:hover){color:#fcd34d}
.prose :where(code){background-color:#ffffff14;border:1px solid hsla(0,0%,100%,.1);border-radius:.375rem;padding:.15rem .35rem}
.prose :where(pre){background-color:#00000059;border:1px solid hsla(0,0%,100%,.1);border-radius:.75rem;padding:.75rem 1rem}
.prose :where(ul){list-style:disc;margin-left:.25rem;padding-left:1.25rem}
.prose :where(ol){list-style:decimal;margin-left:.25rem;padding-left:1.25rem}
.prose :where(li){margin:.25rem 0}
.prose :where(li::marker){color:var(--accent)}
.no-scrollbar{scrollbar-width:none}
.no-scrollbar::-webkit-scrollbar{height:0;width:0}
.divider{background:linear-gradient(90deg,#fff0,#ffffff26,#fff0);border:0;height:1px}
.curse-banner{align-items:center;background:linear-gradient(120deg,#f59e0b1f,#f9731614);border:1px solid hsla(0,0%,100%,.15);border-radius:.75rem;box-shadow:0 6px 20px -6px #00000073;display:flex;flex-wrap:wrap;gap:.6rem;margin:-.25rem 0 1rem;padding:.6rem .75rem}
.banner-text{color:#e2e8f0;flex:1;font-size:.85rem}
.banner-btn{background:linear-gradient(135deg,#f59e0b,#f97316);border:none;border-radius:.6rem;color:#0a0a0c;cursor:pointer;font-weight:700;letter-spacing:.04em;padding:.45rem .7rem}
.banner-btn:hover{filter:brightness(1.08)}
.prose :where(.pigpen-helper .helper-card){background-color:#ffffff0f;border:1px solid hsla(0,0%,100%,.15);border-radius:.75rem;box-shadow:0 12px 32px #00000040;margin-top:.75rem;padding:.75rem 1rem}
.prose :where(.pigpen-helper .helper-header){color:#fffffff2;font-size:.95rem;font-weight:700;margin-bottom:.5rem}
.prose :where(.pigpen-helper .helper-options){display:grid;gap:.5rem;grid-template-columns:repeat(2,minmax(0,1fr))}
.prose :where(.pigpen-helper .helper-option){align-items:center;background-color:#ffffff0a;border:1px solid hsla(0,0%,100%,.12);border-radius:.5rem;color:#ffffffe6;display:flex;gap:.5rem;justify-content:space-between;padding:.5rem .6rem}
.prose :where(.pigpen-helper .helper-option:hover){background-color:#ffffff14}
.prose :where(.pigpen-helper .helper-option.active){border-color:var(--accent);box-shadow:inset 0 0 0 2px #f59e0b40}
.prose :where(.pigpen-helper .helper-results){margin-top:.5rem}
.prose :where(.pigpen-helper .helper-numbers){background-color:#ffffff0a;border:1px solid hsla(0,0%,100%,.12);border-radius:.5rem;display:none;padding:.4rem .5rem}
.prose :where(.pigpen-helper .helper-numbers.active){display:block}
.prose :where(.pigpen-helper .helper-note){color:#ffffffb3;font-size:.85rem;margin-top:.5rem}
.prose :where(.pigpen-helper .helper-label){font-weight:600}
.prose :where(.pigpen){font-family:PigpenCipher,ui-sans-serif,system-ui;letter-spacing:.06em}
.prose :where(.helper-row){display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin:1rem 0 1.5rem}
.prose :where(.book-helper){background:linear-gradient(135deg,#0a0a0ca6,#f59e0b1f);border:1px solid hsla(0,0%,100%,.14);border-radius:1rem;box-shadow:0 20px 50px #00000059;margin:1rem 0 1.5rem;padding:1rem 1.1rem}
.prose :where(.book-helper h3){color:#fef3c7;font-size:1.05rem;margin:0 0 .35rem}
.prose :where(.book-helper p){color:#ffffffd9;margin:0 0 .65rem}
.prose :where(.book-grid){display:grid;gap:.75rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-bottom:.5rem}
.prose :where(.book-grid div){background:#ffffff0a;border:1px solid hsla(0,0%,100%,.12);border-radius:.75rem;box-shadow:inset 0 1px #ffffff0d;padding:.65rem .75rem}
.prose :where(.book-header){color:#fde68a;font-weight:700;margin-bottom:.35rem}
.prose :where(.book-grid label){align-items:center;color:#ffffffe6;display:flex;font-size:.95rem;gap:.5rem;margin:.25rem 0}
.prose :where(.book-grid input[type=checkbox]){accent-color:#f59e0b;height:16px;width:16px}
.prose :where(#bust-output){background:#ffffff0a;border:1px solid hsla(0,0%,100%,.1);border-radius:.75rem;box-shadow:inset 0 1px #ffffff0d;color:#fef3c7;padding:.65rem .75rem}
.prose :where(.planet-helper){background:linear-gradient(135deg,#0a0a0ca6,#f973161f);border:1px solid hsla(0,0%,100%,.14);border-radius:1rem;box-shadow:0 20px 50px #00000059;margin:1rem 0 1.5rem;padding:1rem 1.05rem}
.prose :where(.planet-helper h3){color:#fde68a;font-size:1.05rem;margin:0 0 .35rem}
.prose :where(.planet-helper p){color:#ffffffd9;margin:0 0 .6rem}
.prose :where(.planet-list){display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}
.prose :where(.planet-list button){background:#ffffff0d;border:1px solid hsla(0,0%,100%,.16);border-radius:.65rem;color:#fef3c7;cursor:pointer;padding:.55rem .65rem;text-align:left;transition:border-color .12s ease,background .12s ease,transform .12s ease;width:100%}
.prose :where(.planet-list button:hover){background:#f59e0b14;border-color:#f59e0b80;transform:translateY(-1px)}
.prose :where(.planet-output){background:#ffffff0d;border:1px solid hsla(0,0%,100%,.12);border-radius:.75rem;color:#f8fafc;font-weight:700;letter-spacing:.08em;margin-top:.65rem;padding:.65rem .75rem}
.prose :where(.planet-actions){display:flex;gap:.5rem;margin-top:.5rem}
.prose :where(.planet-actions button){background:#ffffff12;border:1px solid hsla(0,0%,100%,.16);border-radius:.65rem;color:#fef3c7;cursor:pointer;flex:1;padding:.45rem .6rem;transition:filter .12s ease,transform .12s ease}
.prose :where(.planet-actions button:hover){filter:brightness(1.05);transform:translateY(-1px)}
.prose :where(.quest-grid){display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin:1rem 0}
.prose :where(.quest-block){border:1px solid hsla(0,0%,100%,.12);border-radius:.9rem;box-shadow:0 10px 30px #00000040;padding:1rem 1.1rem}
.prose :where(.quest-block h2){border:none;font-size:1.15rem;margin-bottom:.35rem;margin-top:0;padding-left:0}
.prose :where(.quest-block.phase1){background:linear-gradient(135deg,#f59e0b2e,#24242b73)}
.prose :where(.quest-block.phase2){background:linear-gradient(135deg,#fbbf2433,#24242b73)}
.prose :where(.quest-block.phase3){background:linear-gradient(135deg,#f9731633,#24242b73)}
.prose :where(.quest-block ol){margin:.35rem 0 0}
.prose :where(.quest-block li::marker){color:#fde68a}
.prose :where(.boss-phases){display:grid;gap:.85rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin:.75rem 0 1.5rem}
.prose :where(.boss-card){background:linear-gradient(135deg,#0a0a0cb3,#9ca3af1a);border:1px solid hsla(0,0%,100%,.12);border-radius:.9rem;box-shadow:0 12px 32px #00000040;padding:.85rem 1rem}
.prose :where(.boss-card .boss-title){color:#fef3c7;font-weight:700;margin-bottom:.35rem}
.prose :where(.boss-card.phase1){border-color:#f59e0b59}
.prose :where(.boss-card.phase2){border-color:#fbbf2459}
.prose :where(.boss-card.phase3){border-color:#f9731659}
.prose :where(.boss-card.phase4){border-color:#ef444459}
.prose :where(.relic-grid){display:grid;gap:1.5rem;margin-top:1.25rem}
.prose :where(.relic-heading){align-items:center;border-radius:.6rem;display:inline-flex;font-size:1.05rem;font-weight:700;gap:.5rem;letter-spacing:.02em;margin:0 0 .65rem;padding:.4rem .65rem;position:relative}
.prose :where(.relic-heading.grim){background:linear-gradient(90deg,#f59e0b2e,#f59e0b0d);border:1px solid rgba(245,158,11,.35);box-shadow:inset 0 0 0 1px #f59e0b40}
.prose :where(.relic-heading.sinister){background:linear-gradient(90deg,#fbbf2438,#fbbf240f);border:1px solid rgba(251,191,36,.4);box-shadow:inset 0 0 0 1px #fbbf2447}
.prose :where(.relic-heading.wicked){background:linear-gradient(90deg,#ef444447,#ef444414);border:1px solid rgba(239,68,68,.45);box-shadow:inset 0 0 0 1px #ef444452}
.prose :where(.relic-cards){display:grid;gap:1rem}
.prose :where(.relic-card){background:#ffffff0d;border:1px solid hsla(0,0%,100%,.12);border-radius:.9rem;box-shadow:0 8px 20px -4px #00000059;padding:.75rem .85rem .8rem;position:relative}
.prose :where(.relic-card.grim){border-color:#f59e0b59}
.prose :where(.relic-card.sinister){border-color:#fbbf2473}
.prose :where(.relic-card.wicked){border-color:#ef444480}
.prose :where(.relic-title){align-items:center;display:flex;flex-wrap:wrap;font-size:.92rem;font-weight:600;gap:.5rem;margin-bottom:.4rem}
.prose :where(.mini-tag){background:#ffffff14;border:1px solid hsla(0,0%,100%,.12);border-radius:.4rem;font-size:.65rem;font-weight:600;letter-spacing:.05em;padding:.18rem .4rem}
.prose :where(.relic-card.grim .mini-tag){border-color:#f59e0b66;color:#f59e0b}
.prose :where(.relic-card.sinister .mini-tag){border-color:#fbbf2480;color:#fbbf24}
.prose :where(.relic-card.wicked .mini-tag){border-color:#ef44448c;color:#ef4444}
.prose :where(.steps){font-size:.8rem;line-height:1.15rem;margin:0;padding-left:1rem}
.prose :where(.steps li){margin:.2rem 0}
.prose :where(.placeholder){font-size:.75rem;margin:0;opacity:.75}
.prose :where(.relic-chip){border-radius:.5rem;display:inline-block;font-size:.65rem;font-weight:600;letter-spacing:.04em;padding:.15rem .45rem;vertical-align:baseline}
.prose :where(.relic-chip.grim){background:#f59e0b2e;border:1px solid rgba(245,158,11,.4);color:#f59e0b}
.prose :where(.relic-chip.sinister){background:#fbbf2438;border:1px solid rgba(251,191,36,.5);color:#fbbf24}
.prose :where(.relic-chip.wicked){background:#ef444447;border:1px solid rgba(239,68,68,.55);color:#ef4444}
.prose :where(.relic-tiers){font-size:.8rem;margin:.6rem 0 .4rem;padding-left:1.2rem}
.prose :where(.relic-tiers li){margin:.25rem 0}
.prose :where(.relic-note){font-size:.7rem;margin:.2rem 0;opacity:.7}
</style>
