<script setup>
import { toolDefinitions, evaluateTool } from '~/utils/expansionTools.mjs'
import { observedSequence, terminalPosition } from '~/utils/bo3.mjs'
import { rooms, roomSlug, bombLocations, shadowGlyphs, voidNames, voidGlyphs, terminalGlyphs, revelationLocations, collectionActions } from '~/utils/bo3.mjs'
import Bo3Glyph from './Bo3Glyph.vue'
import ZetsubouPlants from './ZetsubouPlants.vue'
const props = defineProps({tool:{type:String,required:true}})
const definition = computed(()=>toolDefinitions[props.tool])
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState(props.tool)
const uid=useId()
const confirmReset=ref(false), editSlot=ref(-1), terminalTab=ref('safe'), requested=ref(''), defused=ref(0)
const isShadows=computed(()=>props.tool==='bo3-shadows-glyphs')
const isBombs=computed(()=>props.tool==='bo3-gorod-bombs')
const isRunes=computed(()=>props.tool==='bo3-revelations-runes')
const prefix=computed(()=>isShadows.value?'glyph':isRunes.value?'rune':'slot')
const size=computed(()=>isShadows.value?3:isRunes.value?4:6)
const allowed=computed(()=>isShadows.value?shadowGlyphs.map(g=>g.id):isRunes.value?['1','2','3','4']:rooms)
const sequence=computed(()=>observedSequence(state.value,prefix.value,size.value,allowed.value,{unique:true}))
const target=computed(()=>editSlot.value>=0?editSlot.value:sequence.value.values.findIndex(v=>!v))
function set(key,value){change({...state.value,[key]:value});confirmReset.value=false;defused.value=0}
function record(value){if(target.value<0)return;set(`${prefix.value}-${target.value}`,value);editSlot.value=-1}
const legacyNotes=computed(()=>definition.value.fields.filter(f=> /^(slot|glyph|station)-/.test(f.id) && !f.options && typeof state.value[f.id]==='string' && state.value[f.id]).map(f=>({label:f.label,text:state.value[f.id]})))
const voidResult=computed(()=>{
  const names=observedSequence(state.value,'name',3,voidNames,{unique:true})
  const glyphs=observedSequence(state.value,'symbol',3,voidGlyphs.map(g=>g.id),{unique:true})
  return names.status==='invalid'?names:glyphs.status==='invalid'?glyphs:names.status==='ready'&&glyphs.status==='ready'?{status:'ready',message:'Shoot the revealed wall symbols in this spoken-name order.'}:{status:'waiting',message:'Record all three names and the symbol revealed by each matching knight.'}
})
const terminalPrefix=computed(()=>terminalTab.value==='safe'?'safe':`board-${terminalTab.value}`)
const terminalCount=computed(()=>terminalTab.value==='safe'?3:4)
const terminalSequence=computed(()=>observedSequence(state.value,terminalPrefix.value,terminalCount.value,terminalGlyphs.map(g=>g.id),{unique:terminalTab.value!=='safe'}))
const terminalTarget=computed(()=>editSlot.value>=0?editSlot.value:terminalSequence.value.values.findIndex(v=>!v))
const terminalAnswer=computed(()=>terminalPosition(state.value,terminalTab.value,requested.value))
function switchTerminal(tab){terminalTab.value=tab;editSlot.value=-1;requested.value=''}
function recordTerminal(symbol){if(terminalTarget.value<0)return;set(`${terminalPrefix.value}-${terminalTarget.value}`,symbol);editSlot.value=-1;requested.value=''}
const valves=computed(()=>evaluateTool('bo3-gorod-valves',state.value))
const collection=computed(()=>state.value.collection||'egg')
const locations=computed(()=>revelationLocations[collection.value].filter(l=>!state.value.region||state.value.region==='All regions'||state.value.region===l.region))
const photo=(room,kind)=>`/images/bo3-gorod-krovi/gk-${roomSlug(room)}-${kind}.webp`
const photoSource=computed(()=>['bo3-shadows-of-evil','bo3-der-eisendrache'].includes(definition.value.map)?{label:'mmmrkennedy',href:`https://mmmrkennedy.com/games/BO3/${definition.value.map.replace('bo3-','').replaceAll('-','_')}/${definition.value.map.replace('bo3-','').replaceAll('-','_')}_guide`}:{label:'COD Zombies Guides',href:`https://www.codzombiesguides.com/main-quests/black-ops-3/${definition.value.map.replace('bo3-','')}/`})
function undoInput(){undo();editSlot.value=-1;requested.value='';defused.value=0;confirmReset.value=false}
function clearInput(){reset();editSlot.value=-1;requested.value='';defused.value=0;confirmReset.value=false}
</script>

<template>
  <div class="puzzle bo3-workspace">
    <p class="bo3-help">{{ definition.help }}</p>

    <template v-if="isShadows || isBombs || isRunes">
      <p v-if="isBombs" class="bo3-warning">Wrong bomb = failed run. Read the in-game timer and wait for the previous defusal to confirm.</p>
      <p v-if="isRunes">Open your scoreboard. Number the rune row <strong>1, 2, 3, 4 from left to right</strong>. For each book page, select the position with the same shape.</p>
      <fieldset>
        <legend>{{ isShadows ? 'Your three train observations' : isRunes ? 'Book pages, in the order shown' : 'SOPHIA’s six flashes, in order' }}</legend>
        <div class="bo3-slots" :class="{'bo3-three':isShadows, 'bo3-bombs':isBombs}">
          <button v-for="(entry,i) in sequence.values" :key="i" type="button" :aria-pressed="target===i" :aria-label="`Edit observation ${i+1}: ${entry || 'empty'}`" @click="editSlot=i">
            <span class="bo3-kicker">{{ isShadows ? 'Window' : isRunes ? 'Page' : 'Bomb' }} {{ i+1 }}</span>
            <Bo3Glyph v-if="isShadows" kind="shadows" :symbol="entry" />
            <strong v-else>{{ entry ? isRunes ? `Scoreboard ${entry}` : entry : 'Choose below' }}</strong>
          </button>
        </div>
      </fieldset>
      <p class="bo3-prompt">{{ target>=0 ? `Choose for ${isShadows?'window':isRunes?'page':'bomb'} ${target+1}.` : 'Sequence filled. Select a recorded slot to correct it.' }}</p>
      <div v-if="isShadows" class="bo3-palette bo3-nine">
        <button v-for="g in shadowGlyphs" :key="g.id" type="button" :disabled="target<0 || (sequence.values.includes(g.id) && sequence.values[target]!==g.id)" :aria-label="`Record ${g.label}`" @click="record(g.id)"><Bo3Glyph kind="shadows" :symbol="g.id" /><small>{{ g.label }}</small></button>
      </div>
      <div v-else-if="isRunes" class="bo3-slots">
        <button v-for="n in ['1','2','3','4']" :key="n" type="button" :disabled="target<0 || (sequence.values.includes(n) && sequence.values[target]!==n)" @click="record(n)"><strong class="bo3-number">{{ n }}</strong><span>Scoreboard position</span></button>
      </div>
      <div v-else-if="target>=0" class="bo3-photo-grid">
        <button v-for="room in rooms" :key="room" type="button" :disabled="target<0 || (sequence.values.includes(room) && sequence.values[target]!==room)" @click="record(room)"><img :src="photo(room,'bomb')" :alt="`${room} bomb location`" loading="lazy" width="480" height="270" /><strong>{{ room }}</strong><small>{{ bombLocations[room] }}</small></button>
      </div>
      <p role="status" class="bo3-result" :class="sequence.status">{{ sequence.status==='ready' && isShadows ? 'Zap these three matching symbols at the sword wall in Beast mode. Their order does not matter.' : sequence.message }}</p>
      <div v-if="isBombs && sequence.status==='ready'" class="bo3-defuse">
        <p class="bo3-kicker">{{ defused<6 ? `Next · bomb ${defused+1} of 6` : 'Six marked defused' }}</p>
        <template v-if="defused<6"><h3>{{ sequence.values[defused] }}</h3><GuideIllustrations :images="[{src:photo(sequence.values[defused],'bomb'),alt:bombLocations[sequence.values[defused]]}]" /><button type="button" @click="defused++">I defused {{ sequence.values[defused] }} →</button></template>
        <button v-else type="button" @click="defused=0">Review order again</button>
        <button v-if="defused>0 && defused<6" type="button" @click="defused--">← Previous bomb</button>
        <p class="bo3-muted">Manual callout only. Editing the order restarts this review; the game is the authority on successful defusals.</p>
      </div>
      <details v-if="isBombs && sequence.status==='ready'"><summary>All six bomb locations</summary><GuideIllustrations :images="rooms.map(room=>({src:photo(room,'bomb'),alt:`${room} · ${bombLocations[room]}`}))" /></details>
      <GuideIllustrations v-if="isShadows" :images="[{src:'/images/bo3-shadows-of-evil/apothicon_sword/wall_with_symbols.webp',alt:'The sword wall: match your three train symbols to these nine marks.'}]" />
      <GuideIllustrations v-if="isRunes" :images="[{src:'/images/bo3-revelations/revelations-kronorium-symbol.webp',alt:'Example book page. Compare its shape to your own scoreboard, then record that position.'}]" />
    </template>

    <template v-else-if="tool==='bo3-de-void'">
      <div class="bo3-void-rows">
        <fieldset v-for="i in [0,1,2]" :key="i">
          <legend>Spoken name {{ i+1 }}</legend>
          <label :for="`${uid}-name-${i}`">Name you heard</label>
          <select :id="`${uid}-name-${i}`" :value="state[`name-${i}`]" @change="set(`name-${i}`,$event.target.value)"><option value="">Choose name…</option><option v-for="name in voidNames" :key="name" :value="name">{{ name==='Griffon'?'Griffin':name }}</option></select>
          <p class="bo3-muted">Interact with that knight. Which symbol appears?</p>
          <div class="bo3-palette bo3-six"><button v-for="g in voidGlyphs" :key="g.id" type="button" :aria-pressed="state[`symbol-${i}`]===g.id" :aria-label="`Name ${i+1}: ${g.label}`" @click="set(`symbol-${i}`,g.id)"><Bo3Glyph kind="void" :symbol="g.id" /><small>{{ g.label }}</small></button></div>
        </fieldset>
      </div>
      <p class="bo3-result" :class="voidResult.status" role="status">{{ voidResult.message }}</p>
      <div v-if="voidResult.status==='ready'" class="bo3-slots bo3-three"><div v-for="i in [0,1,2]" :key="i" class="bo3-output"><span>{{ i+1 }} · {{ state[`name-${i}`] }}</span><Bo3Glyph kind="void" :symbol="state[`symbol-${i}`]" /></div></div>
      <details><summary>View the full name and symbol reference</summary><p>Use the left-hand emblems to identify the knights. The rows in this chart are not fixed name-to-glyph pairings.</p><GuideIllustrations :images="[{src:'/images/bo3-der-eisendrache/wrath_of_the_ancients/void_bow/symbol_cheat_sheet.webp',alt:'Knight emblems and the six possible glyphs. Chart credited to MrRoflWaffles in the source.'}]" /></details>
    </template>

    <template v-else-if="tool==='bo3-de-terminals'">
      <div class="bo3-tabs" aria-label="Code or station"><button v-for="entry in [{id:'safe',name:'Safe code'},{id:'0',name:'Clock Tower'},{id:'1',name:'Rocket Pad'}]" :key="entry.id" type="button" :aria-pressed="terminalTab===entry.id" @click="switchTerminal(entry.id)">{{ entry.name }}</button></div>
      <p>{{ terminalTab==='safe'?'Read the safe in the past from top to bottom. Enter this code at Clock Tower with the Death Ray on Protect.':'Record this station’s four small screens from left to right before they go blank.' }}</p>
      <div class="bo3-slots" :class="{'bo3-three':terminalTab==='safe'}"><button v-for="(entry,i) in terminalSequence.values" :key="i" type="button" :aria-pressed="terminalTarget===i" :aria-label="`Edit ${terminalTab==='safe'?'code entry':'screen'} ${i+1}: ${terminalGlyphs.find(g=>g.id===entry)?.label || 'empty'}`" @click="editSlot=i"><span>{{ terminalTab==='safe'?['Top','Middle','Bottom'][i]:`Screen ${i+1}` }}</span><Bo3Glyph kind="terminal" :symbol="entry" /></button></div>
      <p class="bo3-prompt">{{ terminalTarget>=0?`Choose the symbol for position ${terminalTarget+1}.`:'Board recorded. Select a slot above to correct it.' }}</p>
      <div class="bo3-palette"><button v-for="g in terminalGlyphs" :key="g.id" type="button" :disabled="terminalTarget<0" @click="recordTerminal(g.id)"><Bo3Glyph kind="terminal" :symbol="g.id" /><span>{{ g.label }}</span></button></div>
      <p class="bo3-result" :class="terminalSequence.status" role="status">{{ terminalSequence.message }}</p>
      <fieldset v-if="terminalTab!=='safe' && terminalSequence.status==='ready'"><legend>What does the large screen request?</legend><div class="bo3-palette"><button v-for="g in terminalGlyphs" :key="g.id" type="button" :aria-pressed="requested===g.id" :aria-label="`Requested: ${g.label}`" @click="requested=g.id"><Bo3Glyph kind="terminal" :symbol="g.id" /><span>{{ g.label }}</span></button></div><p v-if="terminalAnswer.position" class="bo3-result ready" role="status">Press screen <strong>{{ terminalAnswer.position }}</strong> from the left at {{ terminalTab==='0'?'Clock Tower':'Rocket Pad' }}.</p></fieldset>
      <p class="bo3-muted">Record both boards again after a failed terminal attempt. The photograph’s layout is an example, never a prefilled answer.</p>
    </template>

    <ZetsubouPlants v-else-if="tool==='bo3-zetsubou-plants'" :state="state" @change="set" />

    <template v-else-if="tool==='bo3-gorod-valves'">
      <div class="bo3-fields"><label v-for="[field,label] in [['start','Green light room'],['end','Pink cylinder room']]" :key="field" :for="`${uid}-${field}`">{{ label }}<select :id="`${uid}-${field}`" :value="state[field]" @change="set(field,$event.target.value)"><option value="">Choose observed room…</option><option v-for="room in rooms" :key="room">{{ room }}</option></select></label></div>
      <div class="bo3-result" :class="valves.status" role="status"><strong>{{ valves.message }}</strong><ol v-if="valves.status==='ready'"><li v-for="line in valves.lines" :key="line">{{ line }}</li></ol></div>
      <details><summary>Locate all six valve stations</summary><GuideIllustrations :images="rooms.map(room=>({src:photo(room,'valve'),alt:`${room} valve station. Check its light, cylinder and numbered pointer.`}))" /></details>
      <p class="bo3-muted">Numbers are valve positions, not turns to make. This route is not the bomb-defusal sequence.</p>
    </template>

    <template v-else-if="tool==='bo3-revelations-collections'">
      <div class="bo3-fields"><label :for="`${uid}-collection`">Find<select :id="`${uid}-collection`" :value="collection" @change="set('collection',$event.target.value)"><option value="egg">Eggs · 16 possible sites</option><option value="rune">Buried runes · 12 sites</option><option value="bone">Bones · 6 sightlines</option><option value="relic">Summoning Key relics · 7 targets</option></select></label><label :for="`${uid}-region`">Region<select :id="`${uid}-region`" :value="state.region || 'All regions'" @change="set('region',$event.target.value)"><option>All regions</option><option v-for="r in ['Spawn / Shangri-La','Kino / Der Eisendrache','Origins / Mob','Verrückt','Nacht']" :key="r">{{ r }}</option></select></label></div>
      <p class="bo3-result">{{ collectionActions[collection] }}</p><p role="status">{{ locations.length ? `${locations.length} reference locations` : 'No locations for this collection in this region. Choose another region.' }}</p>
      <GuideIllustrations :images="locations.map(l=>({src:l.src,alt:`${l.region} · ${l.text}`}))" />
    </template>

    <details v-if="legacyNotes.length" class="bo3-legacy"><summary>Earlier saved text notes ({{ legacyNotes.length }})</summary><p>Kept for reference. Select the visual observations above before using a new result.</p><ul><li v-for="(note,i) in legacyNotes" :key="i"><strong>{{ note.label }}:</strong> {{ note.text }}</li></ul></details>
    <div class="bo3-actions"><button type="button" :disabled="!canUndo" @click="undoInput">Undo</button><button v-if="!confirmReset" type="button" @click="confirmReset=true">Clear observations</button><template v-else><span>Clear this helper’s saved inputs?</span><button type="button" @click="clearInput">Clear now</button><button type="button" @click="confirmReset=false">Cancel</button></template></div>
    <p class="bo3-muted" role="status">{{ saveError?'Saving is unavailable in this browser. Keep the page open to retain your observations.':'Observations save on this device and are shared with the helper inside the guide.' }}</p>
    <p class="bo3-credit">Gameplay photos: <a :href="photoSource.href" target="_blank" rel="noopener noreferrer">{{ photoSource.label }}</a><span v-if="tool==='bo3-de-void'"> · chart: MrRoflWaffles</span><span v-if="tool==='bo3-zetsubou-plants'"> · <a href="https://www.callofdutyzombies.com/zombie-library/zombies-library/black-ops-iii/zetsubou-no-shima/seeds-waters-and-fruits-of-labor-r424/" target="_blank" rel="noopener noreferrer">CoDZ Library / credited Steam creators</a></span> · game: Activision / Treyarch.</p>
  </div>
</template>

<style scoped>
.bo3-slots.bo3-bombs{grid-template-columns:repeat(3,minmax(0,1fr))}.bo3-palette button:disabled{opacity:.75}.bo3-defuse>button{margin-right:.5rem;margin-top:.5rem}@media(max-width:620px){.bo3-slots.bo3-bombs{grid-template-columns:repeat(2,minmax(0,1fr))}}
.bo3-workspace{--bo3-accent:var(--gold,#d8b66f);color:var(--text);font-size:.92rem;line-height:1.6;min-width:0}.bo3-workspace p{margin:.7rem 0 1rem}.bo3-workspace fieldset{border:1px solid var(--line);border-radius:8px;padding:1rem;min-width:0;margin:1rem 0}.bo3-workspace legend{font-weight:650;padding:0 .4rem;color:var(--text)}.bo3-workspace label{display:block}.bo3-workspace select,.bo3-workspace input[type=text]{display:block;width:100%;padding:.7rem;margin-top:.35rem;background:var(--surface);color:var(--text);border:1px solid var(--line-strong,var(--line));border-radius:6px;min-height:44px;font:inherit}.bo3-workspace button{font:inherit;min-height:44px;border:1px solid var(--line);border-radius:6px;padding:.55rem .7rem;background:var(--surface);color:var(--text);cursor:pointer;white-space:normal}.bo3-workspace button:hover:not(:disabled){border-color:var(--bo3-accent);background:var(--surface-2)}.bo3-workspace button[aria-pressed=true]{border-color:var(--bo3-accent);box-shadow:inset 0 0 0 1px var(--bo3-accent);background:var(--gold-dim)}.bo3-workspace :is(button,input,select,summary,a):focus-visible{outline:2px solid var(--bo3-accent);outline-offset:3px}.bo3-workspace button:disabled{opacity:.45;cursor:default}.bo3-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.bo3-slots,.bo3-palette{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.55rem}.bo3-slots button{display:flex;flex-direction:column;justify-content:center;gap:.4rem;min-width:0}.bo3-three{grid-template-columns:repeat(3,minmax(0,1fr))}.bo3-nine{grid-template-columns:repeat(3,minmax(0,1fr))}.bo3-six{grid-template-columns:repeat(6,minmax(0,1fr))}.bo3-palette button{padding:.4rem;min-width:0}.bo3-palette small{display:block;font-size:.72rem;line-height:1.4;margin-top:.35rem}.bo3-kicker{text-transform:uppercase;letter-spacing:.07em;font-size:.68rem;color:var(--muted)}.bo3-prompt{font-size:.85rem;color:var(--bo3-accent)}.bo3-photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}.bo3-photo-grid button{text-align:left;padding:0;overflow:hidden;display:flex;flex-direction:column}.bo3-photo-grid img{width:100%;height:auto;aspect-ratio:16/9;object-fit:cover}.bo3-photo-grid strong,.bo3-photo-grid small{display:block;padding:.45rem .65rem}.bo3-photo-grid small{padding-top:0;color:var(--muted);font-size:.76rem}.bo3-result{border-left:3px solid var(--line-strong,var(--line));padding:.8rem 1rem;background:var(--surface-2);overflow-wrap:anywhere}.bo3-result.ready{border-color:var(--bo3-accent)}.bo3-result.invalid,.bo3-warning{border-left:3px solid #db9868;background:var(--surface-2);padding:.8rem 1rem}.bo3-result ol{padding-left:1.2rem;margin:.5rem 0 0}.bo3-result li{padding:.2rem 0}.bo3-muted,.bo3-credit{font-size:.78rem;color:var(--muted)}.bo3-credit a{color:inherit;text-decoration:underline}.bo3-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0}.bo3-actions{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:1rem;margin-top:1.5rem}.bo3-actions span{font-size:.8rem}.bo3-output{padding:.6rem;border:1px solid var(--line);border-radius:6px}.bo3-output span{display:block;margin-bottom:.5rem}.bo3-number{font-size:1.8rem;color:var(--bo3-accent)}.bo3-defuse{padding:1rem;border:1px solid var(--gold-border,var(--line));border-radius:8px}.bo3-defuse h3{font-size:1.5rem;margin:.4rem 0}.bo3-workspace details{margin:1rem 0}.bo3-workspace summary{cursor:pointer;min-height:44px;display:list-item;padding:.5rem 0;color:var(--bo3-accent)}
@media(max-width:620px){.bo3-six{grid-template-columns:repeat(3,minmax(0,1fr))}.bo3-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bo3-fields{grid-template-columns:1fr}.bo3-slots{grid-template-columns:repeat(2,minmax(0,1fr))}.bo3-slots.bo3-three{grid-template-columns:repeat(3,minmax(0,1fr))}.bo3-workspace fieldset{padding:.65rem}.bo3-palette:not(.bo3-nine):not(.bo3-six){grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
