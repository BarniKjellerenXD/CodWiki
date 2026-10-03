<script setup>
import {locationAtlases} from '~/utils/chronicles.mjs'
const props=defineProps({tool:String,state:Object,atlasOverride:Object});const emit=defineEmits(['change']);const uid=useId();const query=ref('')
const atlas=computed(()=>props.atlasOverride||locationAtlases[props.tool]);const group=computed(()=>atlas.value.groups.find(g=>g.id===props.state.collection)||atlas.value.groups[0])
const regions=computed(()=>[...new Set(group.value.locations.map(p=>p.region))])
const region=computed(()=>regions.value.includes(props.state.region)?props.state.region:'')
const locations=computed(()=>group.value.locations.filter(p=>(!region.value||p.region===region.value)&&`${p.alt} ${p.region}`.toLowerCase().includes(query.value.trim().toLowerCase())))
function setGroup(value){query.value='';emit('change',{...props.state,collection:value,region:''})}
</script>
<template>
 <div class="chr-filters">
  <label v-if="atlas.groups.length>1" :for="`${uid}-collection`">I’m looking for<select :id="`${uid}-collection`" :value="group.id" @change="setGroup($event.target.value)"><option v-for="g in atlas.groups" :key="g.id" :value="g.id">{{g.name}}</option></select></label>
  <label v-if="regions.length>1" :for="`${uid}-region`">Area<select :id="`${uid}-region`" :value="region" @change="emit('change',{...state,region:$event.target.value})"><option value="">All areas</option><option v-for="r in regions" :key="r" :value="r">{{r}}</option></select></label>
  <label :for="`${uid}-search`">Find a landmark<input :id="`${uid}-search`" v-model="query" type="search" placeholder="Search these locations…" /></label>
 </div>
 <p class="chr-context">{{group.description}}</p>
 <p role="status" class="chr-muted">{{locations.length}} {{locations.length===1?'reference':'references'}}{{region?` · ${region}`:''}}</p>
 <div v-if="locations.length" class="chr-photo-grid">
  <div v-for="p in locations" :key="p.id" class="chr-location">
   <h3 v-if="group.id==='shoot'">Target {{group.locations.findIndex(l=>l.id===p.id)+1}}</h3>
   <GuideIllustrations :images="[{src:p.src,alt:p.alt}]"/>
  </div>
 </div>
 <div v-else class="chr-status"><p>No locations match those filters.</p><button type="button" @click="query='';emit('change',{...state,region:''})">Show all locations in this step</button></div>
</template>
