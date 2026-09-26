<script setup lang="ts">
import { superEggMaps } from '~/data/superEasterEgg'
const { progress, run, toggle, save, reset, visit, init } = useProgress()
const activeMap = ref('ashes')
const resetMap = ref('')
const extracted = computed(() => superEggMaps.filter(m => !m.finale && progress.value.toys[m.id]).length)
function setToy(id: string, event: Event) { progress.value.toys[id] = (event.target as HTMLInputElement).checked; save() }
function continueQuest() {
 const map = superEggMaps.find(m => !progress.value.toys[m.id]) || superEggMaps[5]!
 const index = map.stepIds.findIndex(id => !run('super-'+map.id).done.includes(id))
 document.getElementById(index < 0 ? map.id : map.id+'-'+map.stepIds[index])?.scrollIntoView({block:'start'})
}
let observer: IntersectionObserver
onMounted(() => {
 init()
 visit('bo7-super-easter-egg', 'Super Easter Egg', location.hash.slice(1))
 observer = new IntersectionObserver(entries => { for(const entry of entries) if(entry.isIntersecting) { activeMap.value=entry.target.id; visit('bo7-super-easter-egg','Super Easter Egg',entry.target.id) } }, {rootMargin:'-10% 0px -65% 0px'})
 document.querySelectorAll('.map-section').forEach(el=>observer.observe(el))
})
onBeforeUnmount(()=>observer?.disconnect())

useSeoMeta({ title: 'BO7 Super Easter Egg · Cod Wiki', description: 'All five BO7 toy box quests and the Rex Infernus Warden walkthrough, with equipment, step-by-step instructions and map guide links.' })
</script>

<template>
  <main class="egg-page">
    <NuxtLink class="back-link" to="/">← All guides</NuxtLink>
    <header class="egg-header">
      <div class="eyebrow">Black Ops 7 <span aria-hidden="true">/</span> Zombies</div>
      <p class="status">All steps found</p>
      <h1>Super Easter Egg</h1>
      <p class="intro">Five map toys. One final Warden quest.</p>
      <p class="source-note">Collect and successfully exfil with the toys from Ashes, Astra, Paradox, Kowakujō and Totenreich. Then head to Rex Infernus to complete the Warden quest. Adapted from the supplied community guide.</p>
    </header>

    <section class="toy-overview" aria-label="Your toy collection">
      <div class="toy-heading"><div><span class="companion-label">Your collection</span><h2>{{ extracted }} of 5 map toys extracted</h2></div><button class="companion-button primary" @click="continueQuest">Continue quest →</button></div>
      <div class="toy-checks"><label v-for="map in superEggMaps" :key="map.id" :class="{banked:progress.toys[map.id]}"><input type="checkbox" :checked="!!progress.toys[map.id]" @change="setToy(map.id,$event)" /><span>{{ map.short }}<small>{{ map.finale ? 'Warden placed' : 'Successfully exfilled' }}</small></span></label></div>
      <p class="companion-muted">Mark each toy only after a successful exfil. Mark the Warden after placing it in Her House. Step checkboxes are tracked separately.</p>
    </section>
    <aside class="exfil-note" aria-label="Important extraction requirement">
      <span class="notice-icon" aria-hidden="true">↗</span>
      <div><strong>Successfully exfil with each of the five map toys.</strong><p>Once all five are banked, find them on the shelf inside Her House in Rex Infernus and begin the final toy quest.</p></div>
    </aside>

    <div class="reading-layout">
      <nav class="map-nav" aria-label="Jump to a map">
        <span class="nav-label">Choose your map</span>
        <a v-for="(map, index) in superEggMaps" :key="map.id" :href="`#${map.id}`" :aria-current="activeMap === map.id ? 'location' : undefined">
          <span class="nav-number">0{{ index + 1 }}</span><span>{{ map.short }}</span><span class="nav-arrow" aria-hidden="true">↗</span>
        </a>
      </nav>

      <div class="map-sections">
        <section v-for="(map, index) in superEggMaps" :id="map.id" :key="map.id" class="map-section" :aria-labelledby="`${map.id}-title`">
          <div class="map-image"><img :src="map.image" alt="" :loading="index ? 'lazy' : 'eager'" /></div>
          <div class="map-body">
            <div class="chapter">{{ map.finale ? 'Finale' : `Map 0${index + 1}` }} <span> / {{ map.finale ? 'Warden quest' : 'Toy box quest' }}</span></div>
            <h2 :id="`${map.id}-title`">{{ map.name }}</h2>
            <p class="map-intro">{{ map.intro }}</p>
            <div class="equipment"><span>Bring / unlock</span><p>{{ map.equipment }}</p></div>
            <p v-if="map.note" class="map-note">{{ map.note }}</p>
            <ol class="steps">
              <li v-for="(step, stepIndex) in map.steps" :id="`${map.id}-${map.stepIds[stepIndex]}`" :key="map.stepIds[stepIndex]" :class="{complete:run('super-'+map.id).done.includes(map.stepIds[stepIndex])}">
                <input class="egg-check" type="checkbox" :aria-label="`Complete ${map.short}: ${step[0]}`" :checked="run('super-'+map.id).done.includes(map.stepIds[stepIndex])" @change="toggle('super-'+map.id,map.stepIds[stepIndex]!)" />
                <span class="step-number" aria-hidden="true">{{ String(stepIndex + 1).padStart(2, '0') }}</span>
                <div><h3>{{ step[0] }}</h3><p>{{ step[1] }}</p></div>
              </li>
            </ol>
            <div class="egg-reset"><button class="companion-button subtle" @click="resetMap=map.id">Reset these steps</button><div v-if="resetMap===map.id" class="companion-confirm"><p>Clear {{ map.short }} step checkboxes? Your recorded toy stays saved.</p><button class="companion-button" @click="reset('super-'+map.id); resetMap=''">Clear steps</button><button class="companion-button" @click="resetMap=''">Cancel</button></div></div>
            <footer class="references"><span>Keep handy</span><div><NuxtLink v-for="link in map.links" :key="link.to" :to="link.to">{{ link.label }} <span aria-hidden="true">↗</span></NuxtLink></div></footer>
          </div>
        </section>
        <p class="end-note">Finish the Rex minigame, collect the Warden action figure, and place it beside the five map toys in Her House.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.egg-page { max-width: 72rem; margin: auto; padding: 2.5rem 1.5rem 5rem; }
.back-link { color: var(--muted); text-decoration: none; font-size: .88rem; }
.back-link:hover { color: var(--gold-bright); }
.egg-header { position: relative; padding: 3.5rem 0 2.2rem; max-width: 55rem; }
.eyebrow, .chapter, .nav-label, .references > span, .equipment > span { font-size: .7rem; text-transform: uppercase; letter-spacing: .13em; font-weight: 650; color: var(--gold); }
.eyebrow span { color: var(--faint); margin: 0 .6rem; }
.status { display: inline-block; color: var(--muted); border: 1px solid var(--line-strong); border-radius: 99px; padding: .25rem .7rem; font-size: .73rem; margin: 1.2rem 0 .7rem; }
h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.1; letter-spacing: -.045em; font-weight: 650; margin: 0; }
.intro { font-size: 1.3rem; color: var(--text); margin: 1.1rem 0 .65rem; }
.source-note { max-width: 42rem; color: var(--muted); font-size: .95rem; line-height: 1.75; margin: 0; }
.exfil-note { display: flex; align-items: center; gap: 1.2rem; padding: 1.25rem 1.5rem; border: 1px solid var(--gold-border); border-radius: var(--radius); background: var(--gold-dim); margin-bottom: 2.75rem; }
.notice-icon { color: var(--gold); font-size: 1.8rem; }
.exfil-note strong { font-size: 1rem; font-weight: 600; }
.exfil-note p { color: var(--muted); font-size: .85rem; margin: .3rem 0 0; line-height: 1.6; }
.reading-layout { display: grid; grid-template-columns: 12rem minmax(0, 1fr); gap: 3rem; align-items: start; }
.map-nav { position: sticky; top: 2rem; }
.nav-label { color: var(--faint); display: block; margin: 0 0 1.2rem; }
.map-nav a { display: flex; gap: .85rem; align-items: center; padding: .85rem .55rem; border-bottom: 1px solid var(--line); color: var(--muted); text-decoration: none; font-size: .9rem; }
.map-nav a:hover, .map-nav a:focus-visible { color: var(--gold-bright); background: var(--gold-dim); }
.nav-number { color: var(--faint); font-size: .7rem; font-variant-numeric: tabular-nums; }
.nav-arrow { margin-left: auto; color: var(--gold); }
.nav-foot { color: var(--faint); font-size: .76rem; line-height: 1.8; margin-top: 1.5rem; }
.map-section { border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); margin-bottom: 2.5rem; scroll-margin-top: 1.5rem; }
.map-image { height: 11rem; background: var(--bg-accent); overflow: hidden; }
.map-image img { width: 100%; height: 100%; object-fit: cover; object-position: center 42%; }
.map-body { padding: 2rem 2.4rem .5rem; }
.chapter span { color: var(--faint); letter-spacing: .08em; }
h2 { font-size: clamp(1.65rem, 3vw, 2.1rem); letter-spacing: -.025em; font-weight: 600; margin: .55rem 0; }
.map-intro { color: var(--muted); line-height: 1.7; font-size: .95rem; margin: 0 0 1.4rem; }
.equipment { padding: 1rem 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.equipment > span { color: var(--faint); font-size: .65rem; }
.equipment p { margin: .35rem 0 0; color: var(--text); font-size: .88rem; line-height: 1.7; }
.map-note { border-left: 2px solid var(--gold); background: var(--gold-dim); padding: .85rem 1rem; color: var(--muted); font-size: .88rem; line-height: 1.75; margin: 1.3rem 0 .3rem; }
.steps { list-style: none; padding: 0; margin: .7rem 0 0; }
.steps li { display: flex; align-items: baseline; gap: 1.25rem; padding: 1.2rem 0; border-bottom: 1px solid var(--line); }
.steps li:last-child { border-bottom: 0; }
.step-number { flex: 0 0 1.45rem; font-size: .75rem; font-variant-numeric: tabular-nums; color: var(--gold); }
.steps h3 { margin: 0 0 .35rem; font-size: 1rem; font-weight: 600; color: var(--text); }
.steps p { margin: 0; color: var(--muted); font-size: 1rem; line-height: 1.8; }
.references { padding: 1.2rem 0 1.6rem; margin-top: .5rem; border-top: 1px solid var(--line-strong); }
.references > span { color: var(--faint); font-size: .65rem; }
.references > div { display: flex; flex-wrap: wrap; gap: .65rem 1.4rem; margin-top: .7rem; }
.references a { color: var(--gold-bright); text-decoration: none; font-size: .82rem; padding: .25rem 0; }
.references a:hover { text-decoration: underline; }
.end-note { max-width: 40rem; color: var(--faint); font-size: .82rem; line-height: 1.8; }
:global(:root[data-font="relaxed"]) .steps p { font-size: 1.14rem; line-height: 1.85; }
:global(:root[data-font="compact"]) .steps p { font-size: .94rem; line-height: 1.65; }
@media (max-width: 760px) {
  .egg-page { padding: 1.5rem 1rem 4rem; }
  .egg-header { padding-top: 2.5rem; }
  .reading-layout { display: block; }
  .map-nav { display: flex; position: sticky; top: 0; z-index: 10; background: var(--bg); padding: .6rem 0; gap: .3rem; margin-bottom: 1rem; overflow-x: auto; flex-wrap: wrap; }
  .nav-label, .nav-number, .nav-arrow, .nav-foot { display: none; }
  .map-nav a { flex: 1 0 28%; justify-content: center; padding: .75rem .65rem; font-size: .77rem; white-space: nowrap; }
  .map-body { padding: 1.4rem 1.2rem .25rem; }
  .map-image { height: 8rem; }
  .map-section { scroll-margin-top: 5rem; }
  .steps li { gap: .7rem; }
  .exfil-note { padding: 1rem; gap: .8rem; margin-bottom: 1.4rem; }
}
</style>

<style scoped>
.toy-overview { border:1px solid var(--line); border-radius:var(--radius-lg); padding:1.5rem; margin:0 0 1.5rem; background:var(--surface); }
.toy-heading { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
.toy-heading h2 { font-size:1.4rem; }
.toy-checks { display:grid; grid-template-columns:repeat(3,1fr); gap:.65rem; margin-top:1.2rem; }
.toy-checks label { display:flex; align-items:center; gap:.75rem; padding:.8rem; border:1px solid var(--line); border-radius:var(--radius-sm); cursor:pointer; }
.toy-checks label.banked { border-color:var(--gold); background:var(--gold-dim); }
.toy-checks small { display:block; font-size:.72rem; color:var(--muted); margin-top:.3rem; }
.toy-checks input, .egg-check { accent-color:var(--gold); width:1.15rem; height:1.15rem; flex:none; }
.toy-overview > p { font-size:.85rem; margin-bottom:0; }
.map-nav a[aria-current] { color:var(--gold-bright); background:var(--gold-dim); box-shadow:inset 2px 0 var(--gold); }
.steps li { scroll-margin-top:8rem; gap:.8rem; }
.steps li.complete { background:var(--gold-dim); }
.egg-reset { margin-top:1rem; }
@media(max-width:600px) { .toy-overview { padding:1rem; } .toy-checks { grid-template-columns:repeat(2,1fr); } .map-section { scroll-margin-top:8rem; } .step-number { display:none; } }
</style>
