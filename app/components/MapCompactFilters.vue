<template>
  <section class="map-filter-controls" aria-label="Map location filters">
    <div class="map-filter-presets" role="group" aria-label="Map presets">
      <button type="button" @click="emit('essentials')">Essentials</button><button type="button" @click="emit('all')">All locations</button><button type="button" @click="emit('update:modelValue', [])">Hide all</button>
      <span aria-live="polite">{{ modelValue.length }} filters enabled</span>
    </div>
    <div class="map-toggle-row" role="group" aria-label="Common location types">
      <button v-for="option in primary" :key="option.id" type="button" :aria-pressed="enabled(option.id)" :aria-label="`${option.label}, ${count(option)} on this layer`" @click="toggle(option.id)"><MapGlyph :name="option.icon" :class="`map-family-${option.family}`" /><span>{{ option.label }}</span><small>{{ count(option) }}</small></button>
    </div>
    <details v-if="extra.length" class="map-more-filters">
      <summary>More filters <span>{{ extra.filter(o => enabled(o.id)).length }} enabled</span></summary>
      <div v-for="group in groups" :key="group.label" class="map-filter-group">
        <div class="map-filter-group-heading"><h3>{{ group.label }}</h3><button type="button" :aria-pressed="groupState(group.options)" @click="toggleGroup(group.options)">{{ groupState(group.options) === true ? 'Hide group' : 'Show group' }}</button></div>
        <div class="map-toggle-row" role="group" :aria-label="group.label"><button v-for="option in group.options" :key="option.id" type="button" :aria-pressed="enabled(option.id)" @click="toggle(option.id)"><MapGlyph :name="option.icon" :class="`map-family-${option.family}`" /><span>{{ option.label }}</span><small>{{ count(option) }}</small></button></div>
        <p v-for="option in group.options.filter(o => enabled(o.id) && o.note)" :key="option.id" class="map-filter-note">{{ option.note }}</p>
      </div>
    </details>
  </section>
</template>
<script setup lang="ts">
import { matchesMapSearch } from '~/utils/mapFilters.mjs'
import type { MapDataset } from '~/types/map'
type Option = { id:string; label:string; icon:string; family:string; group:string; locationIds:string[]; note?:string; type?:string }
const props=defineProps<{data:MapDataset; options:Option[]; modelValue:string[]; layerId:string; query:string}>()
const emit=defineEmits<{ 'update:modelValue':[ids:string[]]; essentials:[]; all:[] }>()
const priority=['type:pack-a-punch','type:perk-machine','type:perk','type:buildable-part','type:quest-item','type:quest','type:ammo-cache','type:ammo','type:power-switch','type:door-buy','type:fast-travel','type:named-area','type:area']
const primary=computed(()=>[...props.options.filter(o=>!o.id.startsWith('activity:'))].sort((a,b)=>{const ai=priority.indexOf(a.id),bi=priority.indexOf(b.id);return (ai<0?100:ai)-(bi<0?100:bi)||a.label.localeCompare(b.label)}).slice(0,8))
const extra=computed(()=>props.options.filter(o=>!primary.value.some(p=>p.id===o.id)))
const groups=computed(()=>[...new Set(extra.value.map(o=>o.group))].map(label=>({label,options:extra.value.filter(o=>o.group===label)})))
function enabled(id:string){return props.modelValue.includes(id)}
function toggle(id:string){emit('update:modelValue',enabled(id)?props.modelValue.filter(value=>value!==id):[...props.modelValue,id])}
function groupState(options:Option[]):boolean|'mixed'{const count=options.filter(o=>enabled(o.id)).length;return count===options.length?true:count?'mixed':false}
function toggleGroup(options:Option[]){const ids=new Set(props.modelValue);const remove=groupState(options)===true;for(const o of options)remove?ids.delete(o.id):ids.add(o.id);emit('update:modelValue',[...ids])}
function count(option:Option){const ids=new Set(option.locationIds);return props.data.locations.filter(l=>l.layerId===props.layerId&&ids.has(l.id)&&matchesMapSearch(l,props.data,props.query.trim())).length}
</script>
<style scoped>
.map-filter-controls{margin:.8rem 0 1rem}.map-filter-presets{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap;margin-bottom:.55rem}.map-filter-presets>span{margin-left:auto;font-size:.7rem;color:var(--muted)}
.map-filter-controls button{display:inline-flex;align-items:center;gap:.4rem;min-height:40px;padding:.45rem .65rem;border:1px solid var(--line);border-radius:8px;background:var(--surface-2);color:var(--text);font:inherit;font-size:.76rem;cursor:pointer}.map-filter-presets button,.map-filter-group-heading button{background:none;color:var(--muted);font-size:.7rem}.map-filter-controls button[aria-pressed=true]{border-color:var(--gold-border);background:var(--gold-dim);color:var(--gold-bright)}.map-filter-controls button[aria-pressed=mixed]{border-style:dashed;border-color:var(--gold-border)}.map-filter-controls button:hover{border-color:var(--gold-border)}.map-filter-controls :is(button,summary):focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.map-toggle-row{display:flex;gap:.4rem;flex-wrap:wrap}.map-toggle-row svg{width:18px;height:18px;flex:none}.map-toggle-row small{font-size:.66rem;color:var(--muted);font-variant-numeric:tabular-nums}.map-more-filters{margin-top:.55rem}.map-more-filters summary{padding:.5rem .15rem;cursor:pointer;font-size:.76rem;color:var(--gold-bright);min-height:40px}.map-more-filters summary span{color:var(--muted);font-size:.68rem;margin-left:.5rem}.map-filter-group{padding:.65rem 0;border-top:1px solid var(--line)}.map-filter-group-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem}.map-filter-group-heading h3{margin:0;font-size:.74rem;color:var(--muted)}.map-filter-note{font-size:.72rem;line-height:1.6;color:var(--muted);margin:.6rem 0 0}
.map-family-green{color:light-dark(#386625,#a6da91)}.map-family-blue{color:light-dark(#17577f,#8accef)}.map-family-purple{color:light-dark(#77468a,#d3a5eb)}.map-family-orange{color:light-dark(#834e20,#efb982)}.map-family-gold{color:var(--gold)}.map-family-red{color:light-dark(#9a3731,#f29d97)}.map-family-neutral{color:var(--muted)}
@media(max-width:760px){.map-filter-controls button{min-height:44px}.map-toggle-row{gap:.35rem}.map-filter-presets>span{flex-basis:100%;margin:.2rem 0 0}.map-toggle-row button{font-size:.72rem;padding:.45rem .55rem}}
</style>
