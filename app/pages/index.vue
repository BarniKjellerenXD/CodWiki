<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')

interface Guide {
  title: string
  to: string
  desc: string
  img: string
}

interface Era {
  id: string
  label: string
  tagline: string
  guides: Guide[]
}

/*
 * Guides are grouped by game era so Black Ops 3 / 4 can be added later
 * without reshuffling anything. Current release order inside BO7:
 * Ashes -> Astra -> Paradox -> Totenreich -> Kowakujō -> Rex Infernus.
 */
const eras: Era[] = [
  {
    id: 'bo7',
    label: 'Call of Duty: Black Ops 7',
    tagline: 'Zombies · current season',
    guides: [
      {
        title: 'Ashes of the Damned',
        to: '/guides/ashes-of-the-damned',
        desc: 'Complete map breakdown, quests, relics, and more.',
        img: '/images/ashes-thumb.jpg'
      },
      {
        title: 'Astra Malorum',
        to: '/guides/astra-malorum',
        desc: 'Space observatory guide: main quest, LGM-1, and secrets.',
        img: '/images/astra-thumb.jpg'
      },
      {
        title: 'Paradox Junction',
        to: '/guides/paradox-junction',
        desc: 'Multi-dimensional map guide: main quest and features.',
        img: '/images/paradox-thumb.jpg'
      },
      {
        title: 'Totenreich',
        to: '/guides/totenreich',
        desc: 'Undead realm guide: main quest, traps, and secrets.',
        img: '/images/totenreich-thumb.jpg'
      },
      {
        title: 'Kowakujō',
        to: '/guides/kowakujo',
        desc: 'Japanese castle map guide: main quest, wonder weapon, and more.',
        img: '/images/kowakujo-thumb.jpg'
      },
      {
        title: 'Rex Infernus',
        to: '/guides/rex-infernus',
        desc: 'Complete map breakdown: main quest, wonder tools, and the Warden boss fight.',
        img: '/images/rex-infernus-thumb.jpg'
      }
    ]
  }
]

const lowerQuery = computed(() => query.value.trim().toLowerCase())
const superEggMatches = computed(() => !lowerQuery.value || 'bo7 super easter egg super ee toy box'.includes(lowerQuery.value))

const filteredEras = computed(() => {
  const q = lowerQuery.value
  if (!q) return eras
  return eras
    .map(era => ({
      ...era,
      guides: era.guides.filter(g =>
        g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q)
      )
    }))
    .filter(era => era.guides.length > 0 || (era.id === 'bo7' && superEggMatches.value))
})

const matchCount = computed(() =>
  filteredEras.value.reduce((n, era) => n + era.guides.length, 0) + (superEggMatches.value ? 1 : 0)
)

function submitSearch() {
  const q = lowerQuery.value
  if (!q) return
  const flat = eras.flatMap(era => era.guides)
  const exact = flat.find(g => g.title.toLowerCase() === q)
  const partial = flat.find(g => g.title.toLowerCase().includes(q))
  const hit = exact || partial
  if (hit) router.push(hit.to)
  else if (superEggMatches.value) router.push('/guides/bo7-super-easter-egg')
  else if (filteredEras.value[0]?.guides[0]) router.push(filteredEras.value[0].guides[0].to)
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <span class="eyebrow">Call of Duty · Zombies</span>
      <h1>Cod Wiki</h1>
      <p class="lede">
        Map breakdowns, quest walkthroughs and solver tools — written to be read
        mid-game without squinting.
      </p>
    </header>

    <section class="search" aria-label="Search guides">
      <div class="search-row">
        <Icon name="mdi:magnify" class="search-icon" />
        <input
          v-model="query"
          type="search"
          placeholder="Search maps and guides…"
          aria-label="Search maps and guides"
          @keydown.enter="submitSearch"
        />
        <button
          v-if="query"
          class="search-clear"
          type="button"
          aria-label="Clear search"
          @click="query = ''"
        >
          <Icon name="mdi:close" />
        </button>
      </div>
      <p class="search-hint">
        <template v-if="lowerQuery">{{ matchCount }} result{{ matchCount === 1 ? '' : 's' }}</template>
        <template v-else>Press Enter to open the top match.</template>
      </p>
    </section>

    <div v-if="!filteredEras.length && !superEggMatches" class="empty">
      No guides match “{{ query }}”.
    </div>

    <section v-for="era in filteredEras" :key="era.id" class="era">
      <div class="section-head">
        <div>
          <h2>{{ era.label }}</h2>
          <span class="era-tagline">{{ era.tagline }}</span>
        </div>
      </div>

      <NuxtLink v-if="era.id === 'bo7' && superEggMatches" to="/guides/bo7-super-easter-egg" class="super-quest">
        <span class="quest-symbol" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m12 3 9 9-9 9-9-9 9-9Z"/><path d="M12 7v10M7 12h10"/></svg>
        </span>
        <div class="quest-copy">
          <h3>Super Easter Egg</h3>
          <p>The toy box quest across four maps</p>
        </div>
        <span class="quest-status">In progress</span>
        <span class="quest-arrow" aria-hidden="true">→</span>
      </NuxtLink>

      <div v-if="era.guides.length" class="guide-grid">
        <NuxtLink v-for="g in era.guides" :key="g.to" :to="g.to" class="guide-card">
          <div class="guide-thumb">
            <img :src="g.img" :alt="g.title" loading="lazy" />
          </div>
          <div class="guide-body">
            <h3>{{ g.title }}</h3>
            <p>{{ g.desc }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.super-quest {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  border: 1px solid var(--line);
  border-left: 2px solid var(--gold);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  transition: background-color .16s ease, border-color .16s ease;
}
.super-quest:hover { background: var(--surface-2); border-color: var(--gold-border); }
.super-quest:focus-visible { outline: 2px solid var(--gold); outline-offset: 4px; }
.quest-symbol { display: grid; place-items: center; flex: 0 0 2.5rem; height: 2.5rem; border-radius: 9px; color: var(--gold); background: var(--gold-dim); }
.quest-symbol svg { width: 1.4rem; height: 1.4rem; }
.quest-copy { flex: 1; min-width: 0; }
.quest-copy h3 { margin: 0; font-size: 1rem; font-weight: 600; }
.quest-copy p { margin: .25rem 0 0; font-size: .82rem; color: var(--muted); line-height: 1.5; }
.quest-status { color: var(--muted); font-size: .72rem; white-space: nowrap; }
.quest-arrow { color: var(--gold); margin-left: .6rem; }
@media (max-width: 560px) {
  .super-quest { gap: .75rem; padding: .9rem; }
  .quest-symbol { flex-basis: 2rem; height: 2rem; }
  .quest-status { display: none; }
  .quest-arrow { margin-left: 0; }
}

.home {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

.home-header {
  max-width: 40rem;
  margin-bottom: 1.75rem;
}

.eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.9rem;
}

.home-header h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 2.9rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.lede {
  margin: 1rem 0 0;
  font-size: 1.1rem;
  line-height: 1.65;
  color: var(--muted);
  max-width: 34rem;
}

.search {
  max-width: 42rem;
  margin-bottom: 2.25rem;
}

.search-row {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.95rem;
  font-size: 1.1rem;
  color: var(--faint);
  pointer-events: none;
}

.search-row input {
  width: 100%;
  padding: 0.85rem 2.75rem 0.85rem 2.75rem;
  font-size: 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--text);
  box-shadow: var(--shadow);
}

.search-row input:focus {
  border-color: var(--gold-border);
}

.search-clear {
  position: absolute;
  right: 0.7rem;
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--muted);
  cursor: pointer;
}

.search-clear:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.search-hint {
  margin: 0.7rem 0 0 0.2rem;
  font-size: 0.82rem;
  color: var(--faint);
}

.empty {
  padding: 2rem 0;
  font-size: 1rem;
  color: var(--muted);
}

.era + .era {
  margin-top: 3.5rem;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--line);
}

.section-head h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 650;
  color: var(--text);
}

.era-tagline {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.82rem;
  color: var(--faint);
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.guide-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.16s ease, transform 0.16s ease, background-color 0.16s ease;
}

.guide-card:hover {
  border-color: var(--line-strong);
  background: var(--surface-2);
  transform: translateY(-2px);
}

.guide-thumb {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-accent);
  border-bottom: 1px solid var(--line);
}

.guide-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.guide-card:hover .guide-thumb img {
  transform: scale(1.03);
}

.guide-body {
  padding: 1rem 1.15rem 1.25rem;
}

.guide-body h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  font-weight: 650;
  color: var(--text);
}

.guide-body p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--muted);
}

@media (max-width: 900px) {
  .guide-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .guide-grid { grid-template-columns: 1fr; }
  .home {
    padding: 2.75rem 1.1rem 4rem;
  }
}
</style>
