<script setup lang="ts">
import catalogue from '~/data/catalogue.json'
import searchIndex from '~/data/searchIndex.json'
import quickQuests from '~/data/quickQuests.json'
import { searchCatalogue } from '~/utils/companion.mjs'
const query = ref('')
const selected = ref(0)
const toolMap = ref('all')
const { progress, run } = useProgress()
const results = computed(() => searchCatalogue(searchIndex, query.value).slice(0,30))
const last = computed(() => progress.value.last)
const continueUrl = computed(() => last.value ? last.value.route + (last.value.section ? '#'+encodeURIComponent(last.value.section) : '') : '/')
const filteredTools = computed(() => catalogue.tools.filter(t=>toolMap.value==='all'||t.map===toolMap.value))
function mapName(id:string) { return catalogue.maps.find(m=>m.id===id)?.name || 'Black Ops 7' }
function count(id:string) {
  if (id === 'bo7-super-easter-egg') return `${Object.entries(progress.value.toys).filter(([key,done])=>key!=='rex' && done).length} / 5 toys extracted${progress.value.toys.rex ? ' · Warden placed' : ''}`
  const phases=(quickQuests as Record<string,any[]>)[id] || []
  const steps=phases.flatMap(p=>p.steps)
  const done=steps.filter(s=>run(id).done.includes(s.id)).length
  return done?`${done} / ${steps.length} steps complete`:'Start a run'
}
function move(delta:number) { if(results.value.length) selected.value=(selected.value+delta+results.value.length)%results.value.length }
function openSelected() { const item=results.value[selected.value]; if(item) navigateTo(item.route) }
watch(query,()=>{selected.value=0})
useSeoMeta({title:'CodWiki · Your Zombies companion',description:'Map guides, saved quest checklists and puzzle solvers for Black Ops 7 Zombies.'})
</script>

<template>
  <main class="home">
    <header class="home-header"><span class="eyebrow">CodWiki · Call of Duty Zombies</span><h1>Ready for your next run?</h1><p class="lede">Your maps, quest progress and puzzle tools. All within reach.</p></header>
    <NuxtLink v-if="last" class="resume-card" :to="continueUrl"><div><span class="companion-label">Continue where you left off</span><h2>{{ last.title }}</h2><p>{{ count(last.route.split('/').pop()) }}</p></div><span aria-hidden="true">→</span></NuxtLink>
    <section class="search" aria-label="Search everything">
      <div class="search-row"><UiIcon name="search" class="search-icon" /><input v-model="query" type="search" placeholder="Search maps, quest steps and tools…" aria-label="Search maps, quest steps and tools" :aria-controls="query ? 'search-results' : undefined" :aria-activedescendant="query && results.length ? `result-${selected}` : undefined" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="openSelected" @keydown.esc="query=''" /><button v-if="query" class="search-clear" aria-label="Clear search" @click="query=''"><UiIcon name="close" /></button></div>
      <p class="search-hint" aria-live="polite">{{ query ? `${results.length}${results.length===30?'+':''} results` : 'Try “serum”, “boss fight” or “clock”. Use ↑ ↓ and Enter to open a result.' }}</p>
      <div v-if="query" id="search-results" class="search-results"><p v-if="!results.length" class="companion-muted">No matches for “{{ query }}”. Try a map, quest or tool name.</p><NuxtLink v-for="(item,i) in results" :id="`result-${i}`" :key="item.id" :to="item.route" :class="{selected:i===selected}" @mouseenter="selected=i"><div><strong>{{ item.name }}</strong><small>{{ mapName(item.map) }}</small></div><span>{{ item.kind }} ↗</span></NuxtLink></div>
    </section>
    <template v-if="!query">
      <div class="section-head"><div><h2>Black Ops 7</h2><span class="era-tagline">Choose a map and pick up your quest</span></div><a class="companion-button subtle" href="#tools">Browse tools ↓</a></div>
      <NuxtLink to="/guides/bo7-super-easter-egg" class="super-quest"><span class="quest-symbol" aria-hidden="true">✦</span><div class="quest-copy"><h3>Super Easter Egg</h3><p>Five map toys. One final Warden quest.</p></div><span class="quest-status">{{ Object.entries(progress.toys).filter(([id,done])=>id!=='rex' && done).length }} / 5 toys</span><span class="quest-arrow" aria-hidden="true">→</span></NuxtLink>
      <div class="guide-grid"><NuxtLink v-for="map in catalogue.maps" :key="map.id" :to="map.route" class="guide-card"><div class="guide-thumb"><img :src="map.image" alt="" loading="lazy" /></div><div class="guide-body"><h3>{{ map.name }}</h3><p>{{ count(map.id) }}</p><span class="map-card-action">Open guide →</span></div></NuxtLink></div>
      <section id="tools" class="tool-directory"><div class="section-head"><div><span class="companion-label">Solve it and get back to the game</span><h2>Puzzle tools</h2></div><label>Map <select v-model="toolMap"><option value="all">All maps</option><option v-for="map in catalogue.maps.filter(m=>catalogue.tools.some(t=>t.map===m.id))" :key="map.id" :value="map.id">{{ map.name }}</option></select></label></div><div class="tool-grid"><NuxtLink v-for="tool in filteredTools" :key="tool.id" :to="tool.route"><span>{{ mapName(tool.map) }}</span><strong>{{ tool.name }}</strong><span aria-hidden="true">↗</span></NuxtLink></div></section>
    </template>
  </main>
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

<style scoped>
.home-header { padding-top:.5rem; margin-bottom:1.5rem; }
.home-header h1 { font-size:clamp(2rem,4vw,3.1rem); }
.resume-card { display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:1.2rem 1.4rem; margin:1rem 0 1.5rem; border:1px solid var(--gold-border); background:var(--gold-dim); border-radius:var(--radius); color:var(--text); text-decoration:none; }
.resume-card h2 { font-size:1.2rem; margin:.35rem 0; }
.resume-card p { margin:0; color:var(--muted); font-size:.85rem; }
.resume-card > span { color:var(--gold); font-size:1.5rem; }
.search { max-width:none; }
.search-results { border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; }
.search-results > p { padding:1rem; }
.search-results a { display:flex; justify-content:space-between; gap:1rem; padding:1rem 1.2rem; border-bottom:1px solid var(--line); color:var(--text); text-decoration:none; }
.search-results a:last-child { border:0; }
.search-results a.selected { background:var(--gold-dim); box-shadow:inset 3px 0 var(--gold); }
.search-results small { display:block; margin-top:.3rem; color:var(--muted); }
.search-results a > span { color:var(--gold); font-size:.75rem; white-space:nowrap; align-self:center; }
.map-card-action { display:block; color:var(--gold); font-size:.8rem; margin-top:.8rem; }
.tool-directory { margin-top:3rem; scroll-margin-top:1.5rem; }
.tool-directory .section-head { flex-wrap:wrap; gap:1rem; }
.tool-directory label { color:var(--muted); font-size:.85rem; }
.tool-directory select { margin-left:.5rem; border:1px solid var(--line); border-radius:var(--radius-sm); padding:.7rem; background:var(--surface); color:var(--text); max-width:100%; }
.tool-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.8rem; }
.tool-grid a { display:grid; grid-template-columns:1fr auto; gap:.5rem; padding:1.2rem; border:1px solid var(--line); border-radius:var(--radius); color:var(--text); text-decoration:none; background:var(--surface); }
.tool-grid a:hover { border-color:var(--gold); }
.tool-grid a > span:first-child { grid-column:1 / -1; font-size:.73rem; color:var(--muted); }
.tool-grid strong { font-size:.95rem; }
.tool-grid a > span:last-child { color:var(--gold); }
@media(max-width:760px) { .tool-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:480px) { .tool-grid { grid-template-columns:1fr; } .home { padding-top:1.5rem; } .home-header { padding-right:2rem; } .search-results a { padding:.9rem; } }
</style>
