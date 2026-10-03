<script setup>
import catalogue from '~/data/catalogue.json'
const props=defineProps({id:{type:String,required:true}})
const map=computed(()=>catalogue.maps.find(m=>m.id===props.id))
const game=computed(()=>catalogue.games.find(g=>g.id===map.value.gameId))
const siblings=computed(()=>catalogue.maps.filter(m=>m.gameId===map.value.gameId && m.id!==props.id))
</script>
<template>
  <main class="map-entry">
    <NuxtLink class="entry-back" :to="`/#game-${game.id}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m5-5-5 5 5 5" /></svg>{{ game.name }} maps</NuxtLink>
    <header><h1>{{ map.name }}</h1><p class="entry-edition">{{ game.name }} · {{ map.edition }} · {{ map.mode }}</p><p v-if="map.description" class="entry-description">{{ map.description }}</p></header>
    <section class="entry-status" aria-labelledby="entry-status-title"><h2 id="entry-status-title">Guide planned</h2><p>This is a map entry. Its walkthrough, side Easter eggs and tools have not been added yet.</p><p>Use this entry for the <strong>{{ game.name }}</strong> edition. Mechanics can differ in remasters and other games.</p><NuxtLink class="entry-browse" to="/">Browse available guides<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></NuxtLink></section>
    <section class="entry-siblings"><h2>More from {{ game.name }}</h2><div><NuxtLink v-for="other in siblings" :key="other.id" :to="other.route"><span>{{ other.name }}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></NuxtLink></div></section>
  </main>
</template>
<style scoped>
.map-entry{max-width:850px;margin:0 auto;padding:2.5rem 1.5rem 5rem;color:var(--text)}.entry-back{color:var(--muted);font-size:.85rem;text-decoration:none}.map-entry header{padding:2.5rem 0 1.5rem}.map-entry h1{font-size:clamp(2rem,6vw,3.4rem);line-height:1.15;margin:.7rem 0}.entry-edition{color:var(--muted);line-height:1.6}.entry-status{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:1.75rem 0;margin:1rem 0 2.5rem}.entry-status h2{font-size:1.2rem;margin:0 0 .7rem}.entry-status p{max-width:60ch;color:var(--muted);line-height:1.7;margin:.7rem 0}.entry-status strong{color:var(--text)}.entry-siblings h2{font-size:1rem}.entry-siblings>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 1.5rem}.entry-siblings a{display:flex;justify-content:space-between;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none}.entry-siblings a>span:last-child{color:var(--gold)}.map-entry a:hover{color:var(--gold)}.map-entry a:focus-visible{outline:2px solid var(--gold);outline-offset:4px}@media(max-width:550px){.entry-siblings>div{grid-template-columns:1fr}}
</style>

<style scoped>
.entry-description{max-width:65ch;color:var(--text);line-height:1.75;margin-top:1.25rem}
.entry-back,.entry-browse{display:inline-flex;align-items:center;gap:.5rem}
.entry-browse{margin-top:.75rem;color:var(--gold);text-underline-offset:.25em}
.map-entry svg{width:20px;height:20px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.7}
.entry-siblings svg{color:var(--gold)}
</style>
