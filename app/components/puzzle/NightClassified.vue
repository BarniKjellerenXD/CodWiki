<script setup lang="ts">
import { zodiacSigns, follyColors, follyShapes, stakeShapes, stakeLocations, skadiPictures, solveZodiac, solveStake, skadiResult, updateSkadiCode } from '~/utils/nightClassified.mjs'
const props=defineProps<{tool:string}>()
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState(props.tool)
const kind=props.tool.endsWith('-zodiac')?'zodiac':props.tool.endsWith('-alistair')?'folly':props.tool.endsWith('-stake')?'stake':'skadi'
const active=ref(0)
const stakeSide=ref('tree')
const resetConfirm=ref(false)
const uid=useId()
const result=computed(()=>kind==='zodiac'?solveZodiac(state.value):kind==='stake'?solveStake(state.value):kind==='skadi'?skadiResult(state.value):null)
function set(key:string,value:string|boolean){change({...state.value,[key]:value})}
function input(event:Event,key:string){set(key,(event.target as HTMLInputElement).value)}
function choose(shape:string){set(kind==='folly'?`shape-${follyColors[active.value].toLowerCase()}`:kind==='zodiac'?`sign-${active.value}`:`${stakeSide.value}-${active.value}`,shape)}
function codeInput(event:Event,index:number){change(updateSkadiCode(state.value,index,(event.target as HTMLInputElement).value))}
const selection=computed(()=>kind==='folly'?state.value[`shape-${follyColors[active.value].toLowerCase()}`]:kind==='zodiac'?state.value[`sign-${active.value}`]:state.value[`${stakeSide.value}-${active.value}`])
const choices=computed(()=>kind==='folly'?follyShapes:kind==='zodiac'?zodiacSigns:stakeShapes)
const allFolly=computed(()=>follyColors.every(color=>follyShapes.includes(state.value[`shape-${color.toLowerCase()}`])))
const creditLink=kind==='skadi'?'https://mmmrkennedy.com/games/BO4/classified/classified_guide':kind==='stake'?'https://mmmrkennedy.com/games/BO4/dead_of_the_night/dead_of_the_night_guide':'https://www.codzombiesguides.com/main-quests/black-ops-4/dead-of-the-night/'
</script>
<template>
  <div class="puzzle night-tool">
    <template v-if="kind==='folly'">
      <p>Select a color slot, then click the shape you see in your match. The reference shapes are enlarged from the Library lock and a community screenshot. You do not need to translate them into letters.</p>
      <div class="slots colors">
        <button v-for="(color,i) in follyColors" :key="color" type="button" :class="{selected:active===i}" :aria-pressed="active===i" @click="active=i"><span class="color-name" :class="color.toLowerCase()">{{ color }}</span><PuzzleNightGlyph kind="folly" :value="state[`shape-${color.toLowerCase()}`]" /></button>
      </div>
      <p class="active-label">Choose the {{ follyColors[active] }} shape</p>
      <div class="choices"><button v-for="shape in choices" :key="shape" type="button" :class="{selected:selection===shape}" :aria-pressed="selection===shape" :aria-label="`${follyColors[active]}: shape ${shape.slice(-1)}`" @click="choose(shape)"><PuzzleNightGlyph kind="folly" :value="shape" /></button><button type="button" @click="choose('')">Clear slot</button></div>
      <p class="answer" role="status">{{ allFolly?'Set the four Library dials to the shapes above, matching their colors. Interact with the case above the dials to submit.':'Record all four colors, or use three known shapes and try the remaining dial’s four possibilities.' }}</p>
      <details v-if="follyColors.some(color=>state[color.toLowerCase()])"><summary>Previous saved text notes</summary><p v-for="color in follyColors" :key="color">{{ color }}: {{ state[color.toLowerCase()] || '—' }}</p></details>
    </template>
    <template v-else-if="kind==='zodiac'">
      <p>Choose each observed shape and count its three scratch groups. An empty field is unread; 0 means you checked that location and found no marks.</p>
      <div class="zodiac-rows">
        <section v-for="i in [0,1,2]" :key="i" :class="{active:active===i}">
          <button type="button" class="sign-slot" :aria-label="`Choose zodiac for clue ${i+1}`" :aria-pressed="active===i" @click="active=i"><PuzzleNightGlyph kind="zodiac" :value="state[`sign-${i}`]" /><span>{{ state[`sign-${i}`] || `Choose shape ${i+1}` }}</span></button>
          <label>Room<select :value="state[`room-${i}`]" @change="input($event,`room-${i}`)"><option value="">Choose room (optional)</option><option v-for="room in ['Entrance Hall','Billiards Room','Library','Main Hall','Wine Cellar','Dining Room','Trophy / Bedroom']" :key="room">{{ room }}</option></select></label>
          <div class="counts"><label v-for="j in [0,1,2]" :key="j">Marks {{ j+1 }}<select :aria-label="`Clue ${i+1} scratch group ${j+1}`" :value="state[`count-${i}-${j}`]" @change="input($event,`count-${i}-${j}`)"><option value="">?</option><option v-for="n in 10" :key="n" :value="String(n-1)">{{ n-1 }}</option></select></label><span class="sum">Σ {{ [0,1,2].every(j=>state[`count-${i}-${j}`]!==''&&state[`count-${i}-${j}`]!==undefined)?[0,1,2].reduce((sum,j)=>sum+Number(state[`count-${i}-${j}`]),0):'?' }}</span></div>
        </section>
      </div>
      <p class="active-label">Choose shape for clue {{ active+1 }}</p>
      <div class="choices zodiac-choices"><button v-for="sign in zodiacSigns" :key="sign" type="button" :aria-pressed="selection===sign" :class="{selected:selection===sign}" @click="choose(sign)"><PuzzleNightGlyph kind="zodiac" :value="sign" /><span>{{ sign }}</span></button></div>
      <p class="small">Capricorn uses the actual blue dial marking because its in-game form differs from common zodiac charts. Match the visible shape; names are optional callouts.</p>
      <div class="answer" role="status" aria-live="polite"><p>{{ result?.message }}</p><ol v-if="result?.status==='ready'" class="output"><li v-for="entry in result.entries" :key="entry.sign"><PuzzleNightGlyph kind="zodiac" :value="entry.sign" /><strong>{{ entry.total }} scratches</strong><span>{{ entry.room }}</span></li></ol></div>
      <button type="button" @click="resetConfirm=true">Failed dial input — clear rerolled clues</button>
    </template>
    <template v-else-if="kind==='stake'">
      <p>Face the lantern tree and record the four tree shapes from left to right. Then visit the Gardens and record the symbol at each stone. Both sets change between matches.</p>
      <GuideIllustrations :images="[{src:'/images/bo4-dead-of-the-night/trees_edited.webp',alt:'Viewpoint for the four Forest tree symbols; shown order is an example only'}]" />
      <p class="active-label">1. Forest trees, left to right</p>
      <div class="slots"><button v-for="i in [0,1,2,3]" :key="i" type="button" :class="{selected:stakeSide==='tree'&&active===i}" :aria-pressed="stakeSide==='tree'&&active===i" @click="stakeSide='tree';active=i"><span>Tree {{ i+1 }}</span><PuzzleNightGlyph kind="stake" :value="state[`tree-${i}`]" /></button></div>
      <p class="active-label">2. Shape at each Gardens stone</p>
      <div class="slots"><button v-for="(location,i) in stakeLocations" :key="location" type="button" :class="{selected:stakeSide==='stone'&&active===i}" :aria-pressed="stakeSide==='stone'&&active===i" @click="stakeSide='stone';active=i"><span>{{ location }}</span><PuzzleNightGlyph kind="stake" :value="state[`stone-${i}`]" /></button></div>
      <p class="active-label">Choose for {{ stakeSide==='tree'?`Tree ${active+1}`:stakeLocations[active] }}</p>
      <div class="choices"><button v-for="shape in stakeShapes" :key="shape" type="button" :aria-pressed="selection===shape" :class="{selected:selection===shape}" @click="choose(shape)"><PuzzleNightGlyph kind="stake" :value="shape" /></button><button type="button" @click="choose('')">Clear slot</button></div>
      <div class="answer" role="status" aria-live="polite"><p>{{ result?.message }}</p><ol v-if="result?.status==='ready'"><li v-for="entry in result.entries" :key="entry.shape" class="route-entry"><PuzzleNightGlyph kind="stake" :value="entry.shape" /><strong>{{ entry.location }}</strong></li></ol></div>
      <p>Confirm the complete route before shooting. A wrong stone shot requires a new match to retry this optional weapon.</p>
    </template>
    <template v-else>
      <p>The pictures below identify each clue. Their printed numbers belong to reference matches: enter the four digits from your own game.</p>
      <div class="skadi-grid"><section v-for="(picture,i) in skadiPictures" :key="picture.name"><h4>{{ i+1 }}. {{ picture.name }}</h4><GuideIllustrations :images="[{src:`/images/bo4-classified/${picture.image}.webp`,alt:`${picture.name} clue photograph at ${picture.location}; example digits only`}]" /><strong>{{ picture.location }}</strong><p>{{ picture.action }}</p><label :for="`${uid}-code-${i}`">Your four-digit code</label><input :id="`${uid}-code-${i}`" :value="state[`slot-${i}`]" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="e.g. 0042" autocomplete="off" @input="codeInput($event,i)" /></section></div>
      <div class="answer" role="status" aria-live="polite"><p>{{ result?.message }}</p><div class="code-strip"><span v-for="(picture,i) in skadiPictures" :key="picture.name"><small>{{ i+1 }}. {{ picture.name }}</small><strong>{{ state[`slot-${i}`] || '????' }}</strong></span></div></div>
    </template>
    <p class="credit">Visual references: <a :href="creditLink" target="_blank" rel="noreferrer">{{ ['skadi','stake'].includes(kind)?'mmmrkennedy':'COD Zombies Guides' }}</a><template v-if="kind==='folly'"> and <a href="https://www.reddit.com/r/CODZombies/wiki/dead-of-the-night/" target="_blank" rel="noreferrer">r/CODZombies</a></template>. Gameplay © Activision/Treyarch.</p>
    <PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="resetConfirm=true" />
    <div v-if="resetConfirm" class="reset-box" role="alert"><p>Clear this helper’s observations? You can undo the reset.</p><button type="button" @click="reset();resetConfirm=false">Clear observations</button><button type="button" @click="resetConfirm=false">Keep them</button></div>
  </div>
</template>
<style scoped>
.night-tool{display:grid;gap:.8rem}.night-tool p{margin:0;line-height:1.6}.night-tool button{border:1px solid var(--wp-line);border-radius:.45rem;background:var(--wp-surface);color:var(--wp-text);padding:.6rem;cursor:pointer;min-height:44px}.night-tool button:disabled{opacity:.45;cursor:not-allowed}.night-tool button:focus-visible,.night-tool input:focus-visible,.night-tool select:focus-visible{outline:2px solid var(--wp-gold);outline-offset:3px}.night-tool button.selected{border-color:var(--wp-gold);box-shadow:inset 0 0 0 1px var(--wp-gold)}.slots,.choices{display:flex;flex-wrap:wrap;gap:.5rem}.slots>button{flex:1;min-width:100px;display:grid;justify-items:center;gap:.45rem}.slots span{font-size:.8rem}.choices>button{display:grid;justify-items:center;align-content:center;gap:.35rem;min-width:72px}.active-label{font-weight:700}.color-name.blue{color:#72bfff}.color-name.green{color:#8ddaa3}.color-name.yellow{color:#ffe294}.color-name.red{color:#ffa2a2}.zodiac-choices{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}.zodiac-choices span{font-size:.68rem}.zodiac-choices>button{min-width:0}.zodiac-rows{display:grid;gap:.7rem}.zodiac-rows section{border:1px solid var(--wp-line);border-radius:.5rem;padding:.7rem;display:grid;gap:.6rem;grid-template-columns:auto 1fr}.zodiac-rows section.active{border-color:var(--wp-gold)}.sign-slot{display:flex;align-items:center;gap:.4rem;grid-row:span 2}.sign-slot span{max-width:5rem;font-size:.8rem}.counts{display:flex;gap:.5rem;align-items:end}.counts label{min-width:0;flex:1}.sum{padding:.55rem;font-weight:700}.night-tool label{display:grid;gap:.3rem;font-size:.78rem;color:var(--wp-muted)}.night-tool input:not([type=checkbox]),.night-tool select{background:var(--wp-bg);color:var(--wp-text);border:1px solid var(--wp-line);border-radius:.35rem;padding:.55rem;min-width:0;max-width:100%;width:100%}.answer{padding:.9rem;border:1px solid var(--wp-line);border-left:3px solid var(--wp-gold);border-radius:.4rem;background:var(--wp-bg)}.output{display:flex;flex-wrap:wrap;gap:1.5rem;padding-left:1.5rem}.output li{min-width:100px}.output strong,.output span{display:block;font-size:.8rem;margin-top:.3rem}.route-entry{margin:.5rem;display:flex;gap:.6rem;align-items:center}.skadi-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}.skadi-grid section,.survival{border:1px solid var(--wp-line);border-radius:.45rem;padding:.8rem;display:grid;gap:.5rem}.skadi-grid h4,.survival h4{margin:0}.skadi-grid strong{font-size:.85rem}.skadi-grid p{font-size:.8rem}.skadi-grid input:not([type=checkbox]){font:1.7rem monospace;letter-spacing:.2rem}.check{display:flex!important;align-items:center;gap:.5rem}.check input{width:18px;height:18px}.code-strip{display:flex;flex-wrap:wrap;gap:1rem;margin-top:.6rem}.code-strip span{display:grid;gap:.3rem}.code-strip strong{font:1.4rem monospace;letter-spacing:.15rem}.code-strip small{color:var(--wp-muted)}.counter{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem}.small,.credit{font-size:.72rem;color:var(--wp-muted)}.credit a{color:var(--wp-gold)}.reset-box{border:1px solid var(--wp-gold);padding:.75rem;border-radius:.4rem}.reset-box button{margin:.5rem .5rem 0 0}@media(max-width:540px){.skadi-grid{grid-template-columns:1fr}.zodiac-rows section{grid-template-columns:1fr}.sign-slot{grid-row:auto;justify-content:center}.slots>button{min-width:70px;padding:.4rem}.slots span{font-size:.7rem}}
</style>
