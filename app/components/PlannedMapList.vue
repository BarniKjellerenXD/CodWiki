<script setup>
const props = defineProps({ maps: { type: Array, required: true } })
const groups = computed(() => [...new Set(props.maps.map(map => map.group || ''))])
const labels = { 'tortured-path': 'The Tortured Path · Story chapters', survival: 'The Tortured Path · Survival maps', rifts: 'Dark Aether & rifts' }
</script>

<template>
  <div class="planned-maps">
    <p class="planned-intro">These maps have a place in the library. Walkthroughs and puzzle tools are still to come.</p>
    <section v-for="group in groups" :key="group" class="planned-group" :aria-label="labels[group] || 'Maps'">
      <h3 v-if="group" class="planned-group-title">{{ labels[group] || group }}</h3>
      <div class="planned-list">
        <NuxtLink v-for="map in maps.filter(map => (map.group || '') === group)" :key="map.id" :to="map.route" class="planned-map">
          <div><h3>{{ map.name }}</h3><p>{{ map.edition }} · {{ map.mode }}</p></div>
          <span class="planned-status">Guide planned</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.planned-intro{color:var(--muted);font-size:.9rem;line-height:1.7;margin:0 0 1.25rem;max-width:65ch}
.planned-group + .planned-group{margin-top:1.75rem}
.planned-group-title{margin:0 0 .5rem;color:var(--gold);font-size:.9rem;font-weight:600}
.planned-list{border-top:1px solid var(--line)}
.planned-map{display:grid;grid-template-columns:minmax(0,1fr) auto 20px;align-items:center;gap:1rem;padding:1.1rem .5rem;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none}
.planned-map:hover{background:var(--surface);color:var(--gold)}
.planned-map:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.planned-map h3{font-size:1rem;line-height:1.45;margin:0;font-weight:600}
.planned-map p{font-size:.8rem;color:var(--muted);line-height:1.6;margin:.3rem 0 0}
.planned-map svg{color:var(--gold)}
.planned-status{color:var(--muted);font-size:.75rem;white-space:nowrap}
@media(max-width:560px){.planned-map{grid-template-columns:minmax(0,1fr) 20px;gap:.3rem .75rem;padding:1rem .25rem}.planned-map>div{grid-column:1}.planned-status{grid-column:1}.planned-map svg{grid-column:2;grid-row:1 / 3}}
</style>
