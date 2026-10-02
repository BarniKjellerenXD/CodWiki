<script setup lang="ts">
import { voyageSymbols, clockLocations, outletLocations, outletOrder, voyagePlanets, voyageImage, clockTargets } from '~/utils/voyage.mjs'
import { evaluateTool } from '~/utils/expansionTools.mjs'
const props=defineProps<{tool:string}>()
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState(props.tool)
const active=ref('fire')
const location=ref('Mail Rooms')
const confirmReset=ref(false)
const targets=computed(()=>clockTargets(state.value))
const result=computed(()=>evaluateTool(props.tool,state.value))
const clockLocation=computed(()=>clockLocations.find(r=>r.name===location.value)!)
const legacy=computed(()=>[0,1,2,3].some(i=>state.value[`hour-${i}`]||state.value[`minute-${i}`]))
const selectedSymbol=computed(()=>voyageSymbols.find(s=>s.id===active.value)!)
const skyOrder=computed(()=>Array.from({length:8},(_,i)=>state.value[`slot-${i}`]).filter(Boolean))
const skyRoute=computed(()=>[...skyOrder.value,'Sun'].map(name=>voyagePlanets.find(p=>p.name===name)!))
const routePosition=computed(()=>Number(state.value['route-position']||'0'))
const shownPlanet=computed(()=>skyRoute.value[routePosition.value])
function update(key:string,value:string|boolean){change({...state.value,[key]:value})}
function input(event:Event,key:string){update(key,(event.target as HTMLSelectElement).value)}
function choosePlanet(name:string){const next=Array.from({length:8},(_,i)=>i).find(i=>!state.value[`slot-${i}`]); if(next!==undefined) change({...state.value,[`slot-${next}`]:name,'slot-8':'Sun','route-position':'0'})}
function clearSequence(){change({...state.value,...Object.fromEntries(Array.from({length:9},(_,i)=>[`slot-${i}`,i===8?'Sun':''])),'route-position':'0'})}
function changeOutlet(i:number,event:Event){update(`outlet-${i}`,(event.target as HTMLSelectElement).value)}
</script>
<template>
  <div class="puzzle voyage-tool">
    <template v-if="tool==='bo4-voyage-clocks'">
      <p class="eyebrow">Clocks · match the shape → set the controls</p>
      <p>Find a clock with a symbol beside it. Select that exact triangle, then record its two hands. The four symbols belong to this clock puzzle; the Catalyst outlets have their own helper.</p>
      <div class="symbol-picker" role="group" aria-label="Clock symbols"><button v-for="s in voyageSymbols" :key="s.id" :aria-pressed="active===s.id" :aria-label="s.shape" @click="active=s.id"><PuzzleVoyageSymbol :symbol="s.id"/><strong>{{s.shape}}</strong><small>{{s.name}} <span v-if="targets.find(t=>t.id===s.id)?.valid">· recorded ✓</span></small></button></div>
      <section class="entry-card">
        <h3>{{selectedSymbol.shape}} · record the clock</h3>
        <div class="entry-grid">
          <label>Hour · short hand<select :value="state[`${active}-hour`]" @change="input($event,`${active}-hour`)"><option value="">Unread</option><option v-for="n in 12" :key="n" :value="String(n)">{{n}}</option></select></label>
          <label>Minute · long hand<select :value="state[`${active}-minute`]" @change="input($event,`${active}-minute`)"><option value="">Unread</option><option v-for="n in 12" :key="n" :value="String((n-1)*5).padStart(2,'0')">{{String((n-1)*5).padStart(2,'0')}} · hand at {{n===1?12:n-1}}</option></select></label>
          <label>Clock room · optional<select :value="state[`${active}-room`]" @change="input($event,`${active}-room`)"><option value="">Not recorded</option><option v-for="r in clockLocations" :key="r.name">{{r.name}}</option></select></label>
        </div>
      </section>
      <details class="reference"><summary>Where are the six clocks and their symbols?</summary><label>Location<select v-model="location"><option v-for="r in clockLocations" :key="r.name">{{r.name}}</option></select></label><p>{{clockLocation.hint}}</p><GuideIllustrations :images="[{src:voyageImage(`${clockLocation.image}-clock`),alt:`${location}: clock`},{src:voyageImage(`${clockLocation.image}-symbol`),alt:`${location}: symbol position (your symbol varies)`}]"/></details>
      <div class="result" :class="{invalid:result.status==='invalid'}" role="status">{{result.message}}</div>
      <template v-if="result.status!=='invalid' && targets.some(t=>t.valid)">
        <p class="movement-note"><strong>Movement counts start at untouched 12.</strong> Aim at the left or right side of the dial and press interact to move it that way. If you already moved a lever, use the target pointer. Every click equals one mark; Bridge marks are five minutes.</p>
        <section class="route-block"><h3>① Bridge · set the minutes</h3><div class="target-grid"><article v-for="t in targets.filter(t=>t.valid)" :key="t.id" class="target"><PuzzleVoyageSymbol :symbol="t.id"/><PuzzleVoyageDial :mark="t.minute/5" :label="`${t.name} minute target ${t.minute}`"/><strong>{{String(t.minute).padStart(2,'0')}} minutes</strong><span>{{t.minuteMove}}</span></article></div></section>
        <section class="route-block"><h3>② Engine Room & Poop Deck · set the hours</h3><div class="target-grid"><article v-for="t in targets.filter(t=>t.valid)" :key="t.id" class="target"><PuzzleVoyageSymbol :symbol="t.id"/><strong>{{t.hourControl}}</strong><PuzzleVoyageDial :mark="t.hour" :label="`${t.name} hour target ${t.hour}`"/><span>{{t.hourMove}}</span></article></div></section>
        <p>Done in game when the controls lock and the completion sound plays.</p>
      </template>
      <details v-if="legacy" class="reference"><summary>Previous clock notes · please recheck the symbols</summary><p>The previous helper incorrectly used Electric and Poison labels. These notes are preserved for reference and are not treated as new observations.</p><p v-for="(name,i) in ['Fire','Water','Electric','Poison']" :key="name">Old {{name}}: {{state[`hour-${i}`]||'?'}}:{{state[`minute-${i}`]||'??'}}</p></details>
    </template>
    <template v-else-if="tool==='bo4-voyage-outlets'">
      <p>Match each elemental effect to the outlet where you saw it. The numbered photos become your trial route: Poison → Water → Electric → Fire. Each match randomizes these locations.</p>
      <div class="outlet-grid"><section v-for="(element,i) in outletOrder" :key="element" class="entry-card">
        <h3><span class="step-badge">{{i+1}}</span> {{element}}</h3>
        <label>{{element}} outlet<select :value="state[`outlet-${i}`]" @change="changeOutlet(i,$event)"><option value="">Not found yet</option><option v-for="r in outletLocations" :key="r.name">{{r.name}}</option></select></label>
        <GuideIllustrations v-if="state[`outlet-${i}`]" :images="[{src:voyageImage(`${outletLocations.find(r=>r.name===state[`outlet-${i}`])!.image}-outlet`),alt:outletLocations.find(r=>r.name===state[`outlet-${i}`])!.hint}]"/>
      </section></div>
      <div class="result" :class="{invalid:result.status==='invalid'}" role="status"><strong>{{result.message}}</strong><p v-for="line in result.lines" :key="line">{{line}}</p></div>
      <details class="reference"><summary>All six outlet locations · photo reference</summary><GuideIllustrations :images="outletLocations.map(r=>({src:voyageImage(`${r.image}-outlet`),alt:`${r.name} — ${r.hint}`}))"/></details>
    </template>
    <template v-else>
        <p>Tap the eight bodies as the Cargo Hold model flashes. Sun is fixed last. The body descriptions below help distinguish similar colors; Neptune is in the water.</p>
        <div class="planet-picker"><button v-for="planet in voyagePlanets.slice(0,8)" :key="planet.name" :disabled="skyOrder.includes(planet.name)||skyOrder.length===8" :aria-label="`Record ${planet.name}`" @click="choosePlanet(planet.name)"><span class="planet-name">{{planet.name}}</span><small>{{planet.sky}}</small></button></div>
        <ol class="sequence-strip" aria-label="Recorded planet sequence"><li v-for="n in 9" :key="n"><button :disabled="result.status!=='ready'" :aria-pressed="result.status==='ready' && routePosition===n-1" :aria-label="`Show body ${n}: ${n===9?'Sun':state[`slot-${n-1}`]||'unrecorded'}`" @click="update('route-position',String(n-1))"><b>{{n}}</b><span>{{n===9?'Sun':state[`slot-${n-1}`]||'—'}}</span></button></li></ol>
        <button @click="clearSequence">Clear recorded order</button>
        <div class="result" :class="{invalid:result.status==='invalid'}" role="status">{{result.message}}</div>
        <section v-if="result.status==='ready' && shownPlanet" class="sky-destination" aria-live="polite">
          <h3>{{routePosition+1}} of 9 · {{shownPlanet.name}}</h3>
          <p><strong>Shoot:</strong> {{shownPlanet.sky}}</p>
          <p><strong>Collect: {{shownPlanet.room}}</strong> — {{shownPlanet.hint}}</p>
          <GuideIllustrations :images="[{src:voyageImage(`${shownPlanet.image}-planet-symbol`),alt:`${shownPlanet.name} symbol / orb destination`}]"/>
          <p v-if="routePosition===8">All players must interact with the Sun orb.</p>
          <div class="route-controls"><button :disabled="routePosition===0" @click="update('route-position',String(routePosition-1))">Previous body</button><button :disabled="routePosition===8" @click="update('route-position',String(routePosition+1))">Next body</button></div>
          <p class="movement-note">Shoot and collect one orb before moving to the next body. These controls select a destination; the game confirms collection.</p>
        </section>
        <p class="movement-note"><NuxtLink to="/guides/bo4-voyage-of-despair#details-planets">Open the planet puzzle instructions →</NuxtLink></p>
    </template>
    <PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="confirmReset=true"/>
    <div v-if="confirmReset" class="reset-check"><p>Clear this helper’s observations for a new attempt?</p><button @click="reset();confirmReset=false">Clear this helper</button><button @click="confirmReset=false">Keep observations</button></div>
  </div>
</template>
<style scoped>
.voyage-tool{font-size:.9rem;line-height:1.6}.voyage-tool h3{font-size:1rem;margin:.1rem 0 .8rem}.eyebrow{font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--wp-gold)}.symbol-picker{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem;margin:1rem 0}.symbol-picker button{display:flex;align-items:center;flex-direction:column;gap:.3rem;padding:.6rem .3rem}.symbol-picker strong{font-size:.8rem}.symbol-picker small{color:var(--wp-muted)}button[aria-pressed=true]{border-color:var(--wp-gold);background:var(--wp-gold-dim)}.entry-card{border:1px solid var(--wp-line);background:var(--wp-surface);border-radius:10px;padding:1rem;min-width:0}.entry-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}.entry-grid label,.entry-card>label,.reference>label{display:flex;flex-direction:column;gap:.35rem;font-size:.8rem}.entry-card select{width:100%;min-width:0}.entry-card .check{flex-direction:row;align-items:center;margin-top:.8rem;gap:.6rem}.check input{width:18px;height:18px;flex-shrink:0}.target-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.6rem}.target{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.5rem;padding:.8rem;border:1px solid var(--wp-line);border-radius:10px;min-width:0}.target>strong{font-size:.82rem}.target>span{font-size:.8rem;color:var(--wp-gold)}.route-block{margin:1.3rem 0}.result{padding:.8rem 1rem;margin:1rem 0;border-left:3px solid var(--wp-gold);background:var(--wp-surface-2)}.result p{margin:.3rem 0}.result.invalid{border-color:var(--wp-orange)}.movement-note,.reference{font-size:.82rem}.reference{margin:1rem 0;padding:.7rem;border:1px solid var(--wp-line);border-radius:8px}.reference summary{cursor:pointer;min-height:30px}.reference>label{margin-top:1rem}.outlet-grid,.planet-locations,.sky-route{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1rem 0}.step-badge{display:inline-grid;place-items:center;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--wp-gold-dim);color:var(--wp-gold);margin-right:.3rem}.view-switch{display:flex;gap:.5rem;margin:.5rem 0 1rem}.planet-picker{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem}.planet-picker button{display:flex;flex-direction:column;text-align:left;padding:.7rem;gap:.3rem}.planet-picker small{font-size:.73rem;font-weight:400}.planet-name{color:var(--wp-gold);font-weight:700}.sequence-strip{list-style:none;display:flex;flex-wrap:wrap;gap:.5rem;padding:0;margin:1rem 0}.sequence-strip li{min-width:65px;font-size:.8rem}.sequence-strip button{display:flex;flex-direction:column;align-items:center;width:100%;min-height:48px;padding:.4rem}.sky-destination{margin:1.25rem 0;padding:1rem;border:1px solid var(--wp-line);border-radius:10px}.sky-destination :deep(.guide-illustrations){display:block;max-width:760px}.route-controls{display:flex;gap:.6rem;flex-wrap:wrap;margin:1rem 0}.sequence-strip b{color:var(--wp-muted);font-size:.7rem}.current{border-color:var(--wp-gold)}.finished{opacity:.65}.reset-check{padding:.8rem;border:1px solid var(--wp-line)}.reset-check button{margin-right:.5rem}.sky-route p{font-size:.82rem}@media(max-width:650px){.planet-picker{grid-template-columns:repeat(2,minmax(0,1fr))}.symbol-picker{grid-template-columns:repeat(2,minmax(0,1fr))}.entry-grid{grid-template-columns:1fr 1fr}.entry-grid label:last-child{grid-column:1/-1}.outlet-grid,.planet-locations,.sky-route{grid-template-columns:1fr}.target-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.target{padding:.5rem}.view-switch{flex-wrap:wrap}}
</style>
