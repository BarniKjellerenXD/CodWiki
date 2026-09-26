<script setup lang="ts">
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState('house')
const slot=ref<number|null>(0)
const cursor=ref({x:50,y:50})
const keyboard=ref(false)
const helpId=useId()
watch(()=>state.value.points.length, length=>{slot.value=length<4?length:null})
function place(x:number,y:number) {
  if(slot.value===null) return
  const points=state.value.points.slice()
  points[Math.min(slot.value,points.length)]={x:Math.max(0,Math.min(100,x)),y:Math.max(0,Math.min(100,y))}
  change({points})
  slot.value=points.length<4?points.length:null
}
function clickImage(event:MouseEvent) {
  if(event.detail===0) {place(cursor.value.x,cursor.value.y);return}
  keyboard.value=false
  const rect=(event.currentTarget as HTMLElement).getBoundingClientRect()
  place((event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100)
}
function moveCursor(event:KeyboardEvent) {
  const movement:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}
  const delta=movement[event.key]
  if(!delta) return
  event.preventDefault()
  keyboard.value=true
  const step=event.shiftKey?5:1
  cursor.value={x:Math.max(0,Math.min(100,cursor.value.x+delta[0]*step)),y:Math.max(0,Math.min(100,cursor.value.y+delta[1]*step))}
}
function select(n:number) {slot.value=n;cursor.value=state.value.points[n]||{x:50,y:50}}
</script>

<template>
  <div class="puzzle house-tracker">
    <p>After obtaining Warden’s Blight, shoot the basketball in the broken roof from Nexus Forge. Advance a round for the first symbol, then three more rounds for the others.</p>
    <p>Click or tap each symbol on the photo as it appears. The numbered circles record your shooting order.</p>
    <div class="p-row house-slots" aria-label="Symbol appearance order">
      <button v-for="n in 4" :key="n" type="button" :aria-label="`Symbol ${n} · ${state.points[n-1]?'marked':'place'}`" :aria-pressed="slot===n-1" :disabled="n-1>state.points.length" @click="select(n-1)"><strong>{{ n }}</strong><small>{{ state.points[n-1]?'Marked':'Place' }}</small></button>
    </div>
    <p :id="helpId" class="p-muted" aria-live="polite">{{ slot===null?'All four marked. Select a numbered circle to move it.':state.points[slot]?`Tap a new position for symbol ${slot+1}.`:`Tap the photo to place symbol ${slot+1}.` }}</p>
    <div class="house-image">
      <img src="/tools/rex-infernus-house-symbols.jpg" alt="Spawn house viewed from Nexus Forge" draggable="false">
      <button class="house-canvas" type="button" :aria-label="slot===null?'House photo — select a numbered symbol to reposition it':`Place symbol ${slot+1} on the house photo`" :aria-describedby="helpId" @click="clickImage" @keydown="moveCursor" @blur="keyboard=false">
        <span v-if="keyboard && slot!==null" class="house-cursor" :style="{left:cursor.x+'%',top:cursor.y+'%'}" aria-hidden="true">+</span>
      </button>
      <button v-for="(point,i) in state.points" :key="i" type="button" class="house-marker" :style="{left:point.x+'%',top:point.y+'%'}" :aria-label="`Move symbol ${Number(i)+1}`" :aria-pressed="slot===i" @click="select(Number(i))"><span>{{ Number(i)+1 }}</span></button>
    </div>
    <div class="p-result" aria-live="polite"><strong>{{ state.points.length===4?'Shoot the marked symbols in order: 1 → 2 → 3 → 4':'Appearance order · '+state.points.length+'/4 marked' }}</strong></div>
    <p class="p-muted">Then activate Exfil, kill the HVT and take the portal into the house. Select a number and tap the photo to correct its position.</p>
    <details><summary>Keyboard controls</summary><p class="p-muted">Focus the photo and use the arrow keys to aim. Hold Shift to move faster. Press Enter or Space to place the circle.</p></details>
    <PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="reset();slot=0;cursor={x:50,y:50}" />
  </div>
</template>

<style scoped>
.house-slots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.4rem}.house-slots button{display:flex;align-items:center;justify-content:center;gap:.4rem;font-size:.83rem}.house-slots small{font-size:.75rem}
.house-image{position:relative;margin:.8rem 0;isolation:isolate;overflow:hidden;border-radius:10px}
.house-image img{display:block;width:100%;height:auto;margin:0;border-radius:10px;user-select:none}
.house-tracker .house-canvas{position:absolute;inset:0;width:100%;height:100%;min-height:0;padding:0;border:0;background:transparent;cursor:crosshair;border-radius:10px;touch-action:manipulation}
.house-canvas:focus-visible{outline:3px solid var(--gold);outline-offset:-3px}
.house-tracker .house-marker{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:transparent;z-index:1;touch-action:manipulation}
.house-marker span{display:grid;place-items:center;width:30px;height:30px;border:2px solid #fff;border-radius:50%;background:#171717b3;color:#fff;font-size:16px;font-weight:800;box-shadow:0 1px 5px #000}
.house-marker[aria-pressed=true] span{border-color:#f5cd74;background:#6b4818e6}
.house-marker:focus-visible{outline:2px solid var(--gold);outline-offset:1px}
.house-cursor{position:absolute;transform:translate(-50%,-50%);color:#fff;font-size:32px;text-shadow:0 1px 3px #000;line-height:1;pointer-events:none}
</style>
