<template>
  <div class="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-600/10">
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <section class="min-w-0">
        <div class="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl shadow-cyan-500/10 p-4 sm:p-6">
          <header class="flex items-center justify-between gap-4 mb-4 border-b border-white/10 pb-3">
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300">{{ title }}</h1>
            <NuxtLink class="text-sm text-white/70 hover:text-white underline underline-offset-4" to="/">Back to index</NuxtLink>
          </header>
          <div v-if="bannerText" class="curse-banner">
            <div class="banner-text">{{ bannerText }}</div>
            <button class="banner-btn" @click="scrollTo(bannerTarget)">{{ bannerLabel }}</button>
          </div>
          <article ref="articleRef" class="prose prose-invert max-w-none guide-article" @click="onArticleClick">
            <slot />
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

export interface GuideTocItem { id: string; text: string; level: number }

const props = defineProps<{
  title: string
  storageKey: string
  defaultPins?: string[]
  bannerText?: string
  bannerTarget?: string
  bannerLabel?: string
}>()

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
.prose :where(.boss-phases){display:grid;gap:1rem;margin:.75rem 0 1rem}
.prose :where(.boss-card){background:#ffffff0d;border:1px solid hsla(0,0%,100%,.12);border-radius:.9rem;box-shadow:0 8px 22px -6px #0006;padding:.7rem .8rem .75rem;position:relative}
.prose :where(.boss-card.phase1){border-color:#f59e0b59}
.prose :where(.boss-card.phase2){border-color:#fbbf2473}
.prose :where(.boss-card.phase3){border-color:#ef444480}
.prose :where(.boss-title){font-size:.9rem;font-weight:600;letter-spacing:.02em;margin:0 0 .4rem}
.prose :where(.boss-points){font-size:.75rem;line-height:1.05rem;margin:0;padding-left:1.05rem}
.prose :where(.boss-points li){margin:.2rem 0}
.prose :where(.boss-tip){font-size:.65rem;font-weight:600;letter-spacing:.04em;margin:.45rem 0 0;opacity:.85}
.prose :where(.mixologist-grid){display:grid;gap:1rem;margin:.75rem 0 1.1rem}
.prose :where(.perk-card){background:#ffffff0d;border:1px solid hsla(0,0%,100%,.12);border-radius:.85rem;box-shadow:0 6px 18px -4px #00000059;padding:.65rem .75rem .7rem}
.prose :where(.perk-card.quick){border-color:#3b82f68c;box-shadow:inset 0 0 0 1px #3b82f659}
.prose :where(.perk-card.stamin){border-color:#fbbf248c;box-shadow:inset 0 0 0 1px #fbbf2452}
.prose :where(.perk-card.speed){border-color:#10b98199;box-shadow:inset 0 0 0 1px #10b98159}
.prose :where(.perk-card.jugger){border-color:#ef444499;box-shadow:inset 0 0 0 1px #ef444461}
.prose :where(.perk-title){border-radius:.55rem;display:inline-block;font-size:.9rem;font-weight:600;letter-spacing:.02em;margin:0 0 .35rem;padding:.3rem .55rem}
.prose :where(.perk-card.quick .perk-title){background:#3b82f626;border:1px solid rgba(59,130,246,.35);color:#3b82f6}
.prose :where(.perk-card.stamin .perk-title){background:#fbbf242e;border:1px solid rgba(251,191,36,.4);color:#fbbf24}
.prose :where(.perk-card.speed .perk-title){background:#10b9812e;border:1px solid rgba(16,185,129,.45);color:#10b981}
.prose :where(.perk-card.jugger .perk-title){background:#ef44442e;border:1px solid rgba(239,68,68,.45);color:#ef4444}
.prose :where(.perk-ingredients){font-size:.75rem;line-height:1.05rem;margin:0 0 .4rem;padding-left:1.05rem}
.prose :where(.perk-ingredients li){margin:.18rem 0}
.prose :where(.perk-action){font-size:.7rem;font-weight:600;letter-spacing:.04em;margin:.2rem 0 .25rem;opacity:.9}
.prose :where(.perk-tip){font-size:.62rem;letter-spacing:.04em;opacity:.75}

/* Liquid Glass System (guide content) */
.prose :where(.glass-card){position:relative;overflow:hidden;border-radius:1.05rem;padding:1.05rem 1.2rem 1.15rem;margin:1.15rem 0;border:1px solid rgba(255,255,255,.14);background:linear-gradient(155deg,rgba(255,255,255,.075),rgba(255,255,255,.02) 45%,rgba(0,0,0,.16));backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);box-shadow:0 16px 44px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.10),inset 0 -1px 0 rgba(0,0,0,.28)}
.prose :where(.glass-card)::before{content:"";position:absolute;pointer-events:none;border-radius:50%;filter:blur(28px);opacity:.5;width:240px;height:240px;top:-90px;left:-70px;background:radial-gradient(circle,var(--glass-glow,rgba(245,158,11,.30)),transparent 65%)}
.prose :where(.glass-card)::after{content:"";position:absolute;pointer-events:none;top:0;left:8%;right:8%;height:1px;border-radius:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)}
.prose :where(.glass-card h2){border:none!important;margin:.05rem 0 .6rem;padding-left:0!important;font-size:1.22rem;display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.prose :where(.glass-card h2 .g-tag){border:1px solid var(--glass-accent,#f59e0b);border-radius:.45rem;background:linear-gradient(135deg,var(--glass-accent,#f59e0b)26,transparent);color:var(--glass-accent,#f59e0b);font-size:.68rem;font-weight:800;letter-spacing:.05em;line-height:1;padding:.28rem .5rem;text-transform:uppercase;white-space:nowrap}
.prose :where(.glass-card h3){border-left:3px solid var(--glass-accent,#f59e0b);background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.015));border-radius:.65rem;padding:.55rem .75rem;margin:1rem 0 .5rem}
.prose :where(.glass-card>ul){display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.35rem 1rem}
.prose :where(.glass-card ul ul){display:block}
.prose :where(.glass-card ol){margin:.5rem 0 .25rem}
.prose :where(.glass-card li){margin:.3rem 0}
.prose :where(.glass-gold){--glass-accent:#f59e0b;--glass-glow:rgba(245,158,11,.30)}
.prose :where(.glass-amber){--glass-accent:#fbbf24;--glass-glow:rgba(251,191,36,.26)}
.prose :where(.glass-orange){--glass-accent:#f97316;--glass-glow:rgba(249,115,22,.28)}
.prose :where(.glass-green){--glass-accent:#22c55e;--glass-glow:rgba(34,197,94,.22)}
.prose :where(.glass-violet){--glass-accent:#a855f7;--glass-glow:rgba(168,85,247,.24)}
.prose :where(.glass-red){--glass-accent:#ef4444;--glass-glow:rgba(239,68,68,.26)}
.prose :where(.glass-boss){border-color:rgba(239,68,68,.38);box-shadow:0 16px 44px rgba(0,0,0,.5),0 0 26px rgba(239,68,68,.14),inset 0 1px 0 rgba(255,255,255,.10)}
.prose :where(.glass-quest){padding:1.2rem 1.3rem 1.3rem}
.prose :where(.glass-quest ol>li){margin:.65rem 0}
.prose :where(.evidence-card,.cheat-block){backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%)}
.prose :where(details.glass-fold){border:1px solid rgba(245,158,11,.4);border-radius:.75rem;background:linear-gradient(135deg,rgba(245,158,11,.14),rgba(255,255,255,.03));margin:.6rem 0 .8rem;overflow:hidden}
.prose :where(details.glass-fold>summary){list-style:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;padding:.55rem .8rem;font-weight:800;color:#fcd34d;font-size:.88rem;user-select:none;-webkit-user-select:none}
.prose :where(details.glass-fold>summary::-webkit-details-marker){display:none}
.prose :where(details.glass-fold>summary:hover){background:rgba(245,158,11,.08)}
.prose :where(details.glass-fold .fold-note){margin-left:auto;font-size:.66rem;color:#ffffff99;font-weight:600}
.prose :where(details.glass-fold .fold-arrow){color:#f59e0b;font-size:.8rem;transition:transform .2s}
.prose :where(details.glass-fold[open] .fold-arrow){transform:rotate(90deg)}
.prose :where(details.glass-fold ol){margin:.2rem 0;padding:.2rem 1.3rem .9rem 2.1rem}
.prose :where(details.glass-fold li){margin:.28rem 0}
.prose :where(.evidence-card){box-shadow:0 14px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.08)}

/* Collapsible sections */
.prose :where(.g-toggle){display:flex;align-items:center;gap:.55rem;flex-wrap:wrap;cursor:pointer;flex:1;min-width:0;width:100%}
.prose :where(.g-toggle:hover){filter:brightness(1.1)}
.prose :where(.g-cb){position:absolute;opacity:0;pointer-events:none;width:0;height:0}
.prose :where(.g-title){display:contents}
.prose :where(.g-chev){margin-left:auto;color:var(--glass-accent,#f59e0b);font-size:.75rem;transition:transform .22s;flex:none;opacity:.85}
.prose :where(.g-chev)::after{content:"\25BE"}
.prose :where(.g-cb:checked ~ .g-chev)::after{content:"\25B8"}
.prose :where(.glass-card:has(> h2 .g-cb:checked) > *:not(h2),.evidence-card:has(> h3 .g-cb:checked) > *:not(h3)){display:none}
.prose :where(.g-hint){font-size:.78rem;color:#fcd34d99;border:1px dashed rgba(245,158,11,.35);border-radius:.6rem;padding:.45rem .7rem;margin:.6rem 0 .2rem;background:rgba(245,158,11,.06)}

/* Cheat sheet grid */
.prose :where(.cheat-grid){display:grid;gap:.65rem;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));margin:.75rem 0 1.25rem}
.prose :where(.cheat-block){border:1px solid hsla(0,0%,100%,.12);border-radius:.8rem;box-shadow:0 8px 24px #00000040;padding:.7rem .8rem}
.prose :where(.cheat-block h2){border:none;font-size:1rem;margin:0 0 .3rem;padding-left:0}
.prose :where(.cheat-block.phase1){background:linear-gradient(135deg,#f59e0b2e,#24242b73)}
.prose :where(.cheat-block.phase2){background:linear-gradient(135deg,#fbbf2433,#24242b73)}
.prose :where(.cheat-block.phase3){background:linear-gradient(135deg,#f9731633,#24242b73)}
.prose :where(.cheat-block.phase4){background:linear-gradient(135deg,#ef44442b,#24242b73)}
.prose :where(.cheat-block ol){margin:0;padding-left:1.1rem}
.prose :where(.cheat-block li){font-size:.82rem;line-height:1.3;margin:.2rem 0}
.prose :where(.cheat-block li::marker){color:#fde68a}
.prose :where(.cheat-block ul){margin:0;padding-left:1rem}
.prose :where(.cheat-block ul li){font-size:.78rem;opacity:.85}
.prose :where(.cheat-note){font-size:.75rem;color:#ffffffb3;margin:.35rem 0 0}
.prose :where(.cheat-chip){border:1px solid var(--cc,#f59e0b);border-radius:.4rem;color:var(--cc,#f59e0b);display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.04em;margin-left:.15rem;padding:.12rem .4rem;vertical-align:middle}
</style>
