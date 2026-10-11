<template>
  <section ref="root" class="ship-cutaway" aria-label="Interactive ship cutaway">
    <div class="ship-toolbar" role="group" aria-label="Cutaway controls">
      <button type="button" :aria-pressed="!selectedLevel" @click="overview">All levels</button>
      <button type="button" :aria-pressed="showConnections" @click="showConnections = !showConnections; save()"><MapGlyph name="Signpost" /> Connections</button>
      <button type="button" :aria-pressed="showPortals" @click="showPortals = !showPortals; save()"><MapGlyph name="Orbit" /> Fast travel</button>
      <button v-if="history.length" type="button" @click="goBack">← Back to previous room</button>
    </div>
    <p class="ship-hint">Select a level or room to see its connections. Numbers on small rooms match the room buttons below.</p>
    <div class="ship-orientation"><span>Bow <small>front</small></span><span>Stern <small>rear</small></span></div>
    <div ref="board" class="ship-board" :style="{ '--ship-levels': layout.levels.length }">
      <svg class="ship-lines" :viewBox="`0 0 ${size.width} ${size.height}`" aria-hidden="true">
        <defs><marker :id="arrowId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L9 5L0 9" fill="none" stroke="context-stroke" stroke-width="2" /></marker></defs>
        <path class="ship-hull" :d="hull" />
        <path v-for="line in lines" :key="line.id" :d="line.path" class="ship-connection-line" :class="[`ship-line-${line.kind}`, { 'ship-line-regional': line.regional }]" :marker-end="line.directed ? `url(#${arrowId})` : undefined" />
      </svg>
      <div v-for="level in layout.levels" :key="level.id" class="ship-level" :class="{ 'ship-level-active': selectedLevel === level.id }" :data-level="level.id">
        <button type="button" class="ship-level-number" :aria-label="`Level ${levelLabel(level.index)}: ${level.label}`" :aria-pressed="selectedLevel === level.id" @click="chooseLevel(level.id)">{{ levelLabel(level.index) }}</button>
        <button type="button" class="ship-level-strip" :aria-label="`Explore level ${levelLabel(level.index)}: ${level.label}`" :aria-pressed="selectedLevel === level.id" @click="chooseLevel(level.id)">
          <span v-for="footprint in levelFootprints(level.id)" :key="footprint.id" :data-footprint="footprint.id" class="ship-room-shape" :class="roomClasses(footprint)" :style="footprintStyle(footprint)" :title="`${room(footprint.roomId)?.label} · level ${levelLabel(level.index)}${footprint.label ? ` · ${footprint.label}` : ''}`" @click.stop="chooseFootprint(footprint.id)">
            <span class="ship-room-name">{{ room(footprint.roomId)?.shortLabel }}</span><span class="ship-room-index" aria-hidden="true">{{ roomNumber(footprint) }}</span><b v-if="itemCount(footprint)" :aria-label="`${itemCount(footprint)} items`">{{ itemCount(footprint) }}</b>
          </span>
        </button>
      </div>
    </div>
    <div class="ship-legend"><span><i class="ship-key-selected" /> Selected room</span><span><i class="ship-key-connected" /> Connected room</span><span><i class="ship-key-highlight" /> Guide highlight</span><span>↕ Level connection</span><span class="ship-legend-route">┄ Regional route</span></div>
    <div class="ship-room-picker">
      <div class="ship-picker-heading"><h3>{{ query.trim() ? 'Matching rooms across the ship' : activeLevel ? `Level ${levelLabel(activeLevel.index)} · ${activeLevel.label}` : 'Rooms across all levels' }}</h3><button v-if="selectedRoom" type="button" class="ship-text-button" @click="selectAllRoomLevels">Show all levels of this room</button></div>
      <div class="ship-room-buttons" role="group" aria-label="Choose a room">
        <button v-for="entry in pickerRooms" :key="entry.id" type="button" :aria-pressed="selectedRoom === entry.roomId && (!selectedFootprint || selectedFootprint === entry.id)" :class="{ 'ship-room-connected': connectedIds.has(entry.id), 'ship-room-guide': highlightedIds.has(entry.id) }" @click="chooseFootprint(entry.id)"><span class="ship-picker-number" aria-hidden="true">{{ roomNumber(entry) }}</span><span>{{ room(entry.roomId)?.label }}<span v-if="entry.label" class="ship-landing-label">{{ entry.label }}</span></span><small v-if="!activeLevel || query.trim()">{{ levelLabel(level(entry.levelId)!.index) }}</small></button>
      </div>
      <p v-if="!pickerRooms.length" class="ship-empty">No room names match this search. Item matches remain in the location list.</p>
    </div>
    <section v-if="selectedRoom" class="ship-detail" aria-label="Room connections">
      <div class="ship-detail-heading"><h3 ref="detailHeading" tabindex="-1">{{ room(selectedRoom)?.label }}<small>{{ activeLevel ? `Level ${levelLabel(activeLevel.index)}` : 'All source-listed levels' }}{{ selectedLanding?.label ? ` · ${selectedLanding.label}` : '' }}</small></h3><span aria-live="polite">{{ arrivalMessage }}</span></div>
      <div v-if="roomLevels.length > 1" class="ship-room-levels" role="group" aria-label="Levels of this room">
        <span>This room spans</span>
        <button v-for="entry in roomLevels" :key="entry.id" type="button" :aria-label="`${room(entry.roomId)?.label}: level ${levelLabel(level(entry.levelId)!.index)}${entry.label ? `, ${entry.label}` : ''}`" :aria-pressed="selectedFootprint === entry.id" @click="chooseFootprint(entry.id)"><strong>{{ levelLabel(level(entry.levelId)!.index) }}</strong><span v-if="entry.label">{{ entry.label }}</span></button>
      </div>
      <div v-if="showConnections && connections.length" class="ship-destinations">
        <div v-for="connection in connections" :key="connection.id" class="ship-destination" :data-connection="connection.id">
          <button type="button" @click="travel(connection)"><MapGlyph :name="connection.kind === 'portal' ? 'Orbit' : 'Signpost'" /><span>{{ destinationName(connection) }}<small>{{ connectionLabel(connection) }}</small></span><span aria-hidden="true">{{ connection.kind === 'portal' ? '↗' : directionLabel(connection) }}</span></button>
          <details><summary>Route details</summary><p>{{ connection.note }}</p><a :href="connection.source" :target="connection.source.startsWith('https:') ? '_blank' : undefined" rel="noopener noreferrer">Route reference ↗</a></details>
        </div>
      </div>
      <p v-else class="ship-empty">{{ showConnections ? 'No documented connection from this landing. Other levels of this room may have connections.' : 'Turn on Connections to see routes from this room.' }}</p>
      <p v-if="hiddenPortalCount" class="ship-portal-hint"><button type="button" @click="showPortals = true; showConnections = true; save()">Show {{ hiddenPortalCount }} fast-travel {{ hiddenPortalCount === 1 ? 'route' : 'routes' }}</button></p>
      <div v-if="roomItems.length" class="ship-items" aria-label="Items in this room"><h4>Items matching your filters</h4><button v-for="item in roomItems" :key="item.id" type="button" @click="emit('select', item)"><MapGlyph :name="typeInfo(locationType(item)).icon" /><span>{{ item.label }}<small>{{ item.footprintIds?.length ? item.floor : 'Room area · exact level not pinned' }}</small></span></button></div>
    </section>
    <p class="ship-scale-note">Side view · not to scale. Port and starboard overlap. Height numbers follow the reference atlas. Routes can include intermediate rooms; this is not turn-by-turn navigation.</p>
  </section>
</template>

<script setup lang="ts">
import type { MapDataset, MapLocation, MapCutaway } from '~/types/map'
import { cutawayConnections, levelLabel, locationFootprints } from '~/utils/mapCutaway.mjs'
import { locationType, typeInfo } from '~/utils/mapFilters.mjs'

type Footprint = MapCutaway['footprints'][number]
type Connection = MapCutaway['connections'][number] & { destinations: string[]; origins: string[] }
const props = defineProps<{ data: MapDataset; visibleLocations: MapLocation[]; highlights: MapLocation[]; focusId: string; query: string }>()
const emit = defineEmits<{ select: [location: MapLocation] }>()
const layout = computed(() => props.data.cutaway!)
const root = ref<HTMLElement | null>(null)
const board = ref<HTMLElement | null>(null)
const detailHeading = ref<HTMLElement | null>(null)
const selectedLevel = ref('')
const selectedRoom = ref('')
const selectedFootprint = ref('')
const showConnections = ref(true)
const showPortals = ref(false)
const arrivalMessage = ref('')
const history = ref<{ level: string; room: string; footprint: string }[]>([])
const size = ref({width:800,height:540})
const anchors = ref<Record<string, {x:number;y:number;width:number}>>({})
const arrowId = `cutaway-arrow-${props.data.id}`
let observer: ResizeObserver | undefined
let frame = 0
let disposed = false
const room = (id:string) => layout.value.rooms.find(r=>r.id===id)
const level = (id:string) => layout.value.levels.find(l=>l.id===id)
const levelFootprints = (id:string) => layout.value.footprints.filter(f=>f.levelId===id)
const activeLevel = computed(()=>level(selectedLevel.value))
const selectedLanding = computed(()=>layout.value.footprints.find(f=>f.id===selectedFootprint.value))
const roomLevels = computed(()=>layout.value.footprints.filter(f=>f.roomId===selectedRoom.value))
const selectedIds = computed(()=>selectedFootprint.value ? [selectedFootprint.value] : layout.value.footprints.filter(f=>f.roomId===selectedRoom.value).map(f=>f.id))
const connections = computed<Connection[]>(()=>showConnections.value ? cutawayConnections(layout.value,selectedIds.value,showPortals.value) : [])
const connectedIds = computed(()=>new Set(connections.value.flatMap(c=>c.destinations)))
const highlightedIds = computed(()=>new Set(props.highlights.flatMap(l=>locationFootprints(layout.value,l).map(f=>f.id))))
const hiddenPortalCount = computed(()=>showPortals.value ? 0 : cutawayConnections(layout.value,selectedIds.value,true).filter(c=>c.kind==='portal').length)
const pickerRooms = computed(()=>{
  const term=props.query.trim().toLowerCase()
  return layout.value.footprints.filter(f=>(term || !selectedLevel.value || f.levelId===selectedLevel.value) && (!term || room(f.roomId)!.label.toLowerCase().includes(term)))
})
const roomItems = computed(()=>props.visibleLocations.filter(item=>locationType(item)!=='named-area' && locationFootprints(layout.value,item).some(f=>selectedIds.value.includes(f.id))))
const hull = computed(()=>`M44 2 H${size.value.width-4} Q${size.value.width+5} ${size.value.height*.5} ${size.value.width-14} ${size.value.height-2} H90 Q44 ${size.value.height-2} 44 ${size.value.height*.8} Z`)
const lines = computed(()=>connections.value.flatMap(c=>{
  // Do not draw a fabricated precise landing for a room-wide arrival.
  if(c.destinations.length!==1)return []
  const from=c.origins.find(id=>selectedIds.value.includes(id))
  const a=from && anchors.value[from], b=anchors.value[c.destinations[0]]
  if(!a||!b)return []
  const mid=(a.y+b.y)/2
  const path=Math.abs(a.y-b.y)<10 ? `M${a.x} ${a.y} Q${(a.x+b.x)/2} ${a.y-27} ${b.x} ${b.y}` : `M${a.x} ${a.y} C${a.x} ${mid} ${b.x} ${mid} ${b.x} ${b.y}`
  return [{id:c.id,path,kind:c.kind,regional:c.precision==='regional',directed:c.direction==='forward'}]
}))
function footprintStyle(f:Footprint){return {left:`${f.start*100}%`,width:`${(f.end-f.start)*100}%`,top:f.lane?'31px':'5px'}}
function roomNumber(f:Footprint){return levelFootprints(f.levelId).findIndex(item=>item.id===f.id)+1}
function roomClasses(f:Footprint){return {'ship-room-selected':selectedIds.value.includes(f.id),'ship-room-connected':connectedIds.value.has(f.id),'ship-room-highlight':highlightedIds.value.has(f.id),'ship-room-compact':(anchors.value[f.id]?.width || 0)<90,'ship-room-search':!!props.query.trim()&&room(f.roomId)!.label.toLowerCase().includes(props.query.trim().toLowerCase())}}
function itemCount(f:Footprint){return props.visibleLocations.filter(l=>locationType(l)!=='named-area'&&locationFootprints(layout.value,l).some(p=>p.id===f.id)).length}
function destinationName(c:Connection){return [...new Set(c.destinations.map(id=>room(layout.value.footprints.find(f=>f.id===id)!.roomId)!.label))].join(' / ')}
function destinationLevels(c:Connection){return [...new Set(c.destinations.map(id=>level(layout.value.footprints.find(f=>f.id===id)!.levelId)!.index))]}
function directionLabel(c:Connection){const indices=destinationLevels(c);if(indices.length!==1||!activeLevel.value)return '→';return indices[0]>activeLevel.value.index?'↑':indices[0]<activeLevel.value.index?'↓':'→'}
function connectionLabel(c:Connection){const indices=destinationLevels(c);return `${c.label}${c.cost?` · ${c.cost} points`:''} · ${indices.length===1?`Level ${levelLabel(indices[0])}`:'arrival level not pinned'}`}
function snapshot(){return {level:selectedLevel.value,room:selectedRoom.value,footprint:selectedFootprint.value}}
function save(){try{localStorage.setItem(`codwiki-cutaway-v1:${props.data.id}`,JSON.stringify({...snapshot(),showConnections:showConnections.value,showPortals:showPortals.value}))}catch{/* Browsing works without storage. */}}
function chooseLevel(id:string){selectedLevel.value=id;selectedRoom.value='';selectedFootprint.value='';arrivalMessage.value=`Level ${levelLabel(level(id)!.index)} selected`;save()}
function chooseFootprint(id:string){const f=layout.value.footprints.find(f=>f.id===id);if(!f)return;selectedLevel.value=f.levelId;selectedRoom.value=f.roomId;selectedFootprint.value=id;arrivalMessage.value=`${room(f.roomId)!.label}, level ${levelLabel(level(f.levelId)!.index)}`;save()}
function overview(){selectedLevel.value='';selectedRoom.value='';selectedFootprint.value='';arrivalMessage.value='All levels';save()}
function selectAllRoomLevels(){selectedLevel.value='';selectedFootprint.value='';arrivalMessage.value='Showing every source-listed level of this room';save()}
async function travel(c:Connection){
  history.value=[...history.value.slice(-19),snapshot()]
  if(c.destinations.length===1)chooseFootprint(c.destinations[0])
  else {selectedRoom.value=layout.value.footprints.find(f=>f.id===c.destinations[0])!.roomId;selectedFootprint.value='';selectedLevel.value='';arrivalMessage.value='Destination room highlighted; exact arrival level is not pinned.';save()}
  await nextTick(); detailHeading.value?.focus({preventScroll:true})
}
async function goBack(){const previous=history.value.pop();if(!previous)return;selectedLevel.value=previous.level;selectedRoom.value=previous.room;selectedFootprint.value=previous.footprint;arrivalMessage.value='Returned to the previous room';save();await nextTick();detailHeading.value?.focus({preventScroll:true})}
function followHighlights(){
  const focused=props.data.locations.find(l=>l.id===props.focusId)
  const locations=focused?[focused]:props.highlights
  const candidates=locations.flatMap(l=>locationFootprints(layout.value,l))
  if(!candidates.length)return
  if(candidates.some(f=>f.id===selectedFootprint.value))return
  const first=candidates[0];selectedRoom.value=first.roomId
  if(locations.length===1&&!locations[0].footprintIds?.length&&candidates.length>1){selectedFootprint.value='';selectedLevel.value='';arrivalMessage.value='Room highlighted across its source-listed levels.'}
  else{selectedFootprint.value=first.id;selectedLevel.value=first.levelId;arrivalMessage.value=`${room(first.roomId)!.label}, level ${levelLabel(level(first.levelId)!.index)}`}
}
function measure(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(disposed||!board.value)return;const bounds=board.value.getBoundingClientRect();if(!bounds.width)return;size.value={width:bounds.width,height:bounds.height};const next:Record<string,{x:number;y:number;width:number}>={};board.value.querySelectorAll<HTMLElement>('[data-footprint]').forEach(el=>{const b=el.getBoundingClientRect();next[el.dataset.footprint!]={x:b.left-bounds.left+b.width/2,y:b.top-bounds.top+b.height/2,width:b.width}});anchors.value=next})}
watch(()=>[props.focusId,props.highlights.map(l=>l.id).join(',')],followHighlights)
watch(()=>props.data.id,()=>{history.value=[];chooseFootprint(layout.value.defaultFootprint);followHighlights();nextTick(measure)})
onMounted(()=>{
  let saved:Record<string,unknown>|null=null
  try{saved=JSON.parse(localStorage.getItem(`codwiki-cutaway-v1:${props.data.id}`)||'null')}catch{/* Invalid saves use spawn. */}
  const valid=saved && typeof saved==='object' && !Array.isArray(saved)
  const stored=valid && layout.value.footprints.find(f=>f.id===saved!.footprint)
  const storedLevel=valid && level(String(saved!.level))
  if(stored){selectedFootprint.value=stored.id;selectedRoom.value=stored.roomId;selectedLevel.value=stored.levelId}
  else if(valid&&room(String(saved!.room))){selectedRoom.value=String(saved!.room);selectedLevel.value=storedLevel?storedLevel.id:''}
  else if(storedLevel){selectedLevel.value=storedLevel.id}
  else if(valid&&saved!.room===''&&saved!.level===''&&saved!.footprint===''){selectedLevel.value=''}
  else{const first=layout.value.footprints.find(f=>f.id===layout.value.defaultFootprint)!;selectedFootprint.value=first.id;selectedRoom.value=first.roomId;selectedLevel.value=first.levelId}
  if(valid&&typeof saved!.showConnections==='boolean')showConnections.value=saved!.showConnections as boolean
  if(valid&&typeof saved!.showPortals==='boolean')showPortals.value=saved!.showPortals as boolean
  followHighlights();observer=new ResizeObserver(measure);if(board.value)observer.observe(board.value);measure()
})
onBeforeUnmount(()=>{disposed=true;cancelAnimationFrame(frame);observer?.disconnect()})
</script>

<style scoped>
.ship-cutaway{min-width:0;--ship-route:light-dark(#286e69,#8dccbc);--ship-portal:light-dark(#78429a,#cfacf1)}
.ship-toolbar{display:flex;flex-wrap:wrap;gap:.4rem}.ship-toolbar button,.ship-room-buttons button{display:inline-flex;align-items:center;gap:.4rem;min-height:44px;border:1px solid var(--line);background:var(--surface-2);color:var(--text);border-radius:7px;padding:.5rem .7rem;font:inherit;font-size:.75rem;cursor:pointer}
.ship-toolbar svg,.ship-items svg,.ship-destination svg{width:18px;height:18px;flex:none}.ship-toolbar button[aria-pressed=true],.ship-room-buttons button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-dim);color:var(--gold-bright)}
.ship-hint,.ship-scale-note{font-size:.73rem;line-height:1.6;color:var(--muted);margin:.65rem 0}.ship-orientation{display:flex;justify-content:space-between;padding:.4rem 1rem .4rem 3.3rem;font-size:.75rem;color:var(--text)}.ship-orientation small{color:var(--muted);margin-left:.25rem}
.ship-board{position:relative;isolation:isolate;padding:3px 0;min-width:0}.ship-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;overflow:visible}.ship-hull{fill:var(--surface-2);stroke:var(--line-strong);stroke-width:1.5}.ship-connection-line{fill:none;stroke:var(--ship-route);stroke-width:2.5;opacity:.9}.ship-line-regional{stroke-dasharray:5 4}.ship-line-portal{stroke:var(--ship-portal);stroke-dasharray:2 5;stroke-width:3}
.ship-level{display:grid;grid-template-columns:44px minmax(0,1fr);gap:5px;position:relative;min-height:66px}.ship-level-active{background:color-mix(in srgb,var(--gold) 6%,transparent);border-radius:5px}
.ship-level-number{align-self:center;min-height:44px;background:var(--surface);border:1px solid var(--line);border-radius:6px;color:var(--muted);font:600 .8rem/1 system-ui;cursor:pointer}.ship-level-number[aria-pressed=true]{border-color:var(--gold);color:var(--gold-bright);background:var(--gold-dim)}
.ship-level-strip{position:relative;min-width:0;min-height:66px;border:0;border-bottom:1px solid var(--line);background:none;padding:0;margin-right:9px;cursor:pointer}.ship-level-strip:focus-visible{outline:2px solid var(--gold);outline-offset:-2px}
.ship-room-shape{position:absolute;display:flex;align-items:center;gap:2px;height:27px;padding:2px 4px;border:1px solid var(--line-strong);border-radius:4px;background:var(--surface-3);color:var(--text);font:500 11px/1.1 system-ui;text-align:left}.ship-room-shape>span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;flex:1}.ship-room-shape>b{font:600 10px/15px system-ui;min-width:15px;text-align:center;background:var(--surface);border-radius:3px;color:var(--gold-bright)}
.ship-room-shape>.ship-room-index{display:none}.ship-room-compact>.ship-room-name,.ship-room-compact>b{display:none}.ship-room-shape.ship-room-compact{padding:0}.ship-room-shape.ship-room-compact>.ship-room-index{display:grid;place-items:center;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);min-width:18px;height:18px;border:1px solid currentColor;border-radius:3px;background:var(--surface-3);font-size:11px;z-index:1}
.ship-picker-number{display:inline-grid;place-items:center;border:1px solid var(--line-strong);border-radius:50%;width:18px;height:18px;font-size:11px;flex:none}.ship-landing-label{display:block;font-size:.65rem;color:var(--muted);line-height:1.4;margin-top:.2rem}
.ship-room-shape.ship-room-selected{background:var(--gold-dim);border:2px solid var(--gold);color:var(--gold-bright)}.ship-room-shape.ship-room-connected{border:2px solid var(--ship-route);background:color-mix(in srgb,var(--ship-route) 18%,var(--surface));color:var(--text)}.ship-room-shape.ship-room-highlight{box-shadow:0 0 0 2px var(--gold-bright);border-style:dashed}.ship-room-search{outline:2px solid var(--gold);outline-offset:2px}
.ship-legend{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin:.6rem 0 1rem;color:var(--muted);font-size:.68rem}.ship-legend>span{display:flex;align-items:center;gap:.3rem}.ship-legend i{width:12px;height:10px;border:1px solid;border-radius:2px}.ship-key-selected{border-color:var(--gold)!important;background:var(--gold-dim)}.ship-key-connected{border-color:var(--ship-route)!important;background:color-mix(in srgb,var(--ship-route) 25%,var(--surface))}.ship-key-highlight{border-color:var(--gold-bright)!important;border-style:dashed!important}
.ship-room-picker{border-top:1px solid var(--line);padding:.8rem 0}.ship-picker-heading{display:flex;align-items:center;flex-wrap:wrap;justify-content:space-between;gap:.3rem;margin-bottom:.6rem}.ship-picker-heading h3{font:600 .85rem/1.5 var(--font-body,system-ui);margin:0}.ship-room-buttons{display:flex;flex-wrap:wrap;gap:.4rem}.ship-room-buttons button{text-align:left}.ship-room-buttons small{font-size:.66rem;color:var(--muted)}.ship-room-buttons .ship-room-connected{border-color:var(--ship-route)}.ship-room-buttons .ship-room-guide{border-style:dashed;border-color:var(--gold)}
.ship-text-button,.ship-portal-hint button{min-height:44px;border:0;background:none;color:var(--gold-bright);font:inherit;font-size:.72rem;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:.3rem 0}
.ship-detail{border:1px solid var(--line);border-radius:9px;background:var(--surface);padding:.9rem}.ship-detail-heading{display:flex;gap:.6rem;justify-content:space-between;align-items:center;flex-wrap:wrap}.ship-detail h3{font:600 1rem/1.4 var(--font-body,system-ui);margin:0}.ship-detail h3 small{display:block;color:var(--muted);font-size:.72rem;font-weight:400;margin-top:.15rem}.ship-detail-heading>span{font-size:.72rem;color:var(--muted);max-width:22rem}.ship-destinations{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:.55rem;margin-top:.85rem}
.ship-room-levels{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;margin-top:.8rem;padding-bottom:.8rem;border-bottom:1px solid var(--line)}.ship-room-levels>span{font-size:.72rem;color:var(--muted);margin-right:.25rem}.ship-room-levels button{display:flex;align-items:center;gap:.4rem;min-width:44px;min-height:44px;justify-content:center;padding:.4rem .6rem;border:1px solid var(--line);border-radius:6px;background:var(--surface-2);color:var(--text);font:inherit;cursor:pointer}.ship-room-levels strong{font-size:.8rem}.ship-room-levels button>span{font-size:.65rem;max-width:8rem;text-align:left;line-height:1.4}.ship-room-levels button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-dim);color:var(--gold-bright)}
.ship-destination{border:1px solid var(--line);border-radius:7px;background:var(--surface-2);overflow:hidden}.ship-destination>button,.ship-items button{display:flex;align-items:center;gap:.6rem;width:100%;min-height:54px;text-align:left;color:var(--text);background:none;border:0;padding:.7rem;cursor:pointer;font:inherit;font-size:.78rem}.ship-destination>button>span:nth-child(2),.ship-items button>span{flex:1;min-width:0}.ship-destination small,.ship-items small{display:block;color:var(--muted);font-size:.67rem;line-height:1.6;margin-top:.1rem}.ship-destination details{padding:0 .7rem .4rem;font-size:.68rem;color:var(--muted)}.ship-destination summary{cursor:pointer;min-height:30px;display:list-item;padding:.3rem 0}.ship-destination details p{line-height:1.6;margin:.35rem 0}.ship-destination a{color:var(--gold-bright)}
.ship-empty{font-size:.78rem;line-height:1.6;color:var(--muted)}.ship-portal-hint{margin:.2rem 0 0}.ship-items{margin-top:.7rem;border-top:1px solid var(--line);padding-top:.6rem}.ship-items h4{font-size:.76rem;margin:0 0 .2rem}.ship-items button{border-radius:5px}.ship-items button:hover,.ship-destination>button:hover{background:var(--gold-dim)}.ship-cutaway button:focus-visible,.ship-cutaway h3:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
@media(max-width:600px){.ship-room-shape{height:25px}.ship-level{min-height:60px;grid-template-columns:40px minmax(0,1fr);gap:4px}.ship-level-strip{min-height:60px;margin-right:5px}.ship-hint{font-size:.75rem}.ship-detail{padding:.7rem}.ship-destination summary{min-height:44px}.ship-room-buttons button{font-size:.76rem}.ship-room-shape>b{display:none}.ship-orientation{padding-left:3rem}}
</style>
