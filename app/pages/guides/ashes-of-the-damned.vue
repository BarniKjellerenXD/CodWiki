<template>
  <div class="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-600/10">
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <section class="min-w-0">
        <div class="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl shadow-cyan-500/10 p-4 sm:p-6">
          <header class="flex items-center justify-between gap-4 mb-4 border-b border-white/10 pb-3">
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300">Ashes of the Damned</h1>
            <NuxtLink class="text-sm text-white/70 hover:text-white underline underline-offset-4" to="/">Back to index</NuxtLink>
          </header>
          <article ref="articleRef" class="prose prose-invert max-w-none" @click="onArticleClick">
            <div v-if="html" v-html="html"></div>
            <div v-else class="text-white/70">Loading guide…</div>
          </article>
        </div>
      </section>
      <aside class="hidden lg:block sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto">
        <div class="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl shadow-cyan-500/10 p-4">
          <h2 class="text-lg font-semibold mb-3 text-cyan-200">Chapters</h2>
          <nav class="space-y-1">
            <button
              v-for="item in toc"
              :key="item.id"
              @click="scrollTo(item.id)"
              class="block w-full text-left text-sm px-3 py-2 rounded-md hover:bg-white/10 text-white/90 border-l-2 border-transparent hover:border-cyan-300"
              :class="item.level === 1 ? 'font-semibold text-white' : item.level === 2 ? 'pl-6' : 'pl-10'"
            >
              {{ item.text }}
            </button>
          </nav>
        </div>
      </aside>
    </div>
    <!-- Lightbox overlay -->
    <ImageLightbox v-if="lightboxSrc" :src="lightboxSrc" :alt="lightboxAlt" @close="lightboxSrc = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const html = ref<string>('')
const articleRef = ref<HTMLElement | null>(null)
const toc = ref<Array<{ id: string; text: string; level: number }>>([])
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
  // Pigpen helper interaction
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
  // No selection by default; optionally preselect first
  // const first = container.querySelector('.helper-option') as HTMLElement | null
  // if (first) selectPigpenWord(first.getAttribute('data-word') || '')
}

onMounted(async () => {
  try {
    const res = await fetch('/guides/ashes-of-the-damned.html', { cache: 'no-store' })
    const raw = await res.text()
    // Extract only the Reddit wiki content blocks
    const parser = new DOMParser()
    const doc = parser.parseFromString(raw, 'text/html')
    const blocks = Array.from(doc.querySelectorAll('.md.wiki'))
    const combined = blocks.map(b => b.innerHTML).join('\n')
    html.value = combined || raw
    await nextTick()
    if (articleRef.value) buildTocAndIds(articleRef.value)
    // Initialize pigpen helper (no selection by default)
    initPigpenHelper()
  } catch (e) {
    html.value = '<p>Failed to load guide.</p>'
  }
})
</script>

<style scoped>
.prose {
  --accent: #22d3ee; /* cyan-400 */
  --accent2: #d946ef; /* fuchsia-500 */
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
  color: #67e8f9; /* cyan-300 */
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

/* Pigpen legend styling */
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
/* Boss phases styling */
.prose :where(.boss-phases){display:grid; gap:1rem; margin:.75rem 0 1rem;}
.prose :where(.boss-card){border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); border-radius:.9rem; padding:.7rem .8rem .75rem; box-shadow:0 8px 22px -6px rgba(0,0,0,.4); position:relative;}
.prose :where(.boss-card.phase1){border-color:rgba(34,211,238,.35);} /* cyan */
.prose :where(.boss-card.phase2){border-color:rgba(251,191,36,.45);} /* amber */
.prose :where(.boss-card.phase3){border-color:rgba(239,68,68,.5);} /* red */
.prose :where(.boss-title){font-weight:600; font-size:.9rem; margin:0 0 .4rem; letter-spacing:.02em;}
.prose :where(.boss-points){margin:0; padding-left:1.05rem; font-size:.75rem; line-height:1.05rem;}
.prose :where(.boss-points li){margin:.2rem 0;}
.prose :where(.boss-tip){margin:.45rem 0 0; font-size:.65rem; font-weight:600; letter-spacing:.04em; opacity:.85;}
/* Mixologist perk cards */
.prose :where(.mixologist-grid){display:grid; gap:1rem; margin:.75rem 0 1.1rem;}
.prose :where(.perk-card){border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); border-radius:.85rem; padding:.65rem .75rem .7rem; box-shadow:0 6px 18px -4px rgba(0,0,0,.35);}
.prose :where(.perk-card.quick){border-color:rgba(59,130,246,.55); box-shadow:0 0 0 1px rgba(59,130,246,.35) inset;}
.prose :where(.perk-card.stamin){border-color:rgba(251,191,36,.55); box-shadow:0 0 0 1px rgba(251,191,36,.32) inset;}
.prose :where(.perk-card.speed){border-color:rgba(16,185,129,.6); box-shadow:0 0 0 1px rgba(16,185,129,.35) inset;}
.prose :where(.perk-card.jugger){border-color:rgba(239,68,68,.6); box-shadow:0 0 0 1px rgba(239,68,68,.38) inset;}
.prose :where(.perk-title){font-weight:600; font-size:.9rem; margin:0 0 .35rem; letter-spacing:.02em; padding:.3rem .55rem; border-radius:.55rem; display:inline-block;}
.prose :where(.perk-card.quick .perk-title){background:rgba(59,130,246,.15); color:#3b82f6; border:1px solid rgba(59,130,246,.35);}
.prose :where(.perk-card.stamin .perk-title){background:rgba(251,191,36,.18); color:#fbbf24; border:1px solid rgba(251,191,36,.4);}
.prose :where(.perk-card.speed .perk-title){background:rgba(16,185,129,.18); color:#10b981; border:1px solid rgba(16,185,129,.45);}
.prose :where(.perk-card.jugger .perk-title){background:rgba(239,68,68,.18); color:#ef4444; border:1px solid rgba(239,68,68,.45);}
.prose :where(.perk-ingredients){margin:0 0 .4rem; padding-left:1.05rem; font-size:.75rem; line-height:1.05rem;}
.prose :where(.perk-ingredients li){margin:.18rem 0;}
.prose :where(.perk-action){font-size:.7rem; font-weight:600; letter-spacing:.04em; margin:.2rem 0 .25rem; opacity:.9;}
.prose :where(.perk-tip){font-size:.62rem; opacity:.75; letter-spacing:.04em;}
</style>

<!-- Lightbox overlay -->
<ImageLightbox v-if="lightboxSrc" :src="lightboxSrc" :alt="lightboxAlt" @close="lightboxSrc = null" />
