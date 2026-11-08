<script setup lang="ts">
import { hajinLayers, MAP_SECTIONS, threatLevels } from '#shared/dmz-map.mjs'
import { GLYPHS, layerColor } from './glyphs'

// The Tac-Map's Layers panel: layers in folding sections with All and None,
// counts and what each layer shows, or the threat levels in the threat view.
const props = defineProps<{
  view: 'map' | 'threat'
  shown: string[]
  collapsed: string[]
  levels: string[]
  counts: Record<string, number>
  levelCounts: Record<string, number>
  grid: boolean
  wheel: boolean
  touch: boolean
}>()
const emit = defineEmits<{
  toggle: [id: string]
  section: [id: string, on: boolean]
  fold: [id: string]
  list: [id: string]
  defaults: []
  level: [level: string]
  allLevels: []
  grid: [on: boolean]
  wheel: [on: boolean]
  close: []
}>()

const byId = new Map(hajinLayers.map(layer => [layer.id, layer]))
const sections = MAP_SECTIONS.map(section => ({ ...section, rows: section.layers.map(id => byId.get(id)!).filter(Boolean) }))
const onCount = (section: typeof sections[number]) => section.rows.filter(row => props.shown.includes(row.id)).length
const threatClass = (level: string) => level.toLowerCase()
const headRef = ref<HTMLElement>()
defineExpose({ focus: () => headRef.value?.focus() })
</script>

<template>
  <div class="tl" role="group" :aria-label="view === 'threat' ? 'Threat levels' : 'Map layers'">
    <div class="tl-head">
      <h3 ref="headRef" tabindex="-1" class="dmz-mono">{{ view === 'threat' ? 'Threat levels' : 'Layers' }}</h3>
      <button type="button" class="tl-done" @click="emit('close')">Done</button>
    </div>

    <template v-if="view === 'threat'">
      <ul class="tl-rows">
        <li v-for="level in threatLevels" :key="level">
          <button type="button" class="tl-row" :data-threat="threatClass(level)" :aria-pressed="levels.includes(level)" @click="emit('level', level)">
            <i class="tl-swatch" aria-hidden="true" />
            <span class="tl-text">{{ level }}<small>{{ levelCounts[level] }} rated {{ levelCounts[level] === 1 ? 'part' : 'parts' }}</small></span>
            <span class="tl-state dmz-mono" aria-hidden="true">{{ levels.includes(level) ? 'On' : 'Off' }}</span>
          </button>
        </li>
      </ul>
      <div class="tl-foot"><button type="button" class="tl-text-btn" @click="emit('allLevels')">All levels</button></div>
    </template>

    <template v-else>
      <section v-for="section in sections" :key="section.id" class="tl-section">
        <div class="tl-section-head">
          <button type="button" class="tl-fold" :aria-expanded="!collapsed.includes(section.id)" :aria-controls="`tl-${section.id}`" @click="emit('fold', section.id)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10l4 4l4-4" /></svg>
            <span>{{ section.label }}</span>
            <small class="dmz-mono">{{ onCount(section) }} of {{ section.rows.length }} on</small>
          </button>
          <button type="button" class="tl-text-btn" :aria-label="`Show all in ${section.label}`" @click="emit('section', section.id, true)">All</button>
          <button type="button" class="tl-text-btn" :aria-label="`Hide all in ${section.label}`" @click="emit('section', section.id, false)">None</button>
        </div>
        <ul v-show="!collapsed.includes(section.id)" :id="`tl-${section.id}`" class="tl-rows">
          <li v-for="row in section.rows" :key="row.id" :style="{ '--tm-c': layerColor(row.id) }">
            <button type="button" class="tl-row" :aria-pressed="shown.includes(row.id)" @click="emit('toggle', row.id)">
              <span class="tl-glyph" :class="{ 'is-reported': row.group === 'Reported' }"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="GLYPHS[row.id]" /></svg></span>
              <span class="tl-text">{{ row.label }}<template v-if="row.group === 'Reported'"><span class="tl-tag dmz-mono">reported</span></template><small>{{ row.desc }}</small></span>
              <span class="tl-count dmz-mono">{{ counts[row.id] ?? 0 }}</span>
            </button>
            <button type="button" class="tl-list" :aria-label="`List ${row.label.toLowerCase()}`" title="List them" @click="emit('list', row.id)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
            </button>
          </li>
        </ul>
      </section>
      <div class="tl-foot">
        <label class="tl-check"><input type="checkbox" :checked="grid" @change="emit('grid', ($event.target as HTMLInputElement).checked)"> Grid squares</label>
        <label v-if="!touch" class="tl-check"><input type="checkbox" :checked="wheel" @change="emit('wheel', ($event.target as HTMLInputElement).checked)"> Scroll to zoom</label>
        <button type="button" class="tl-text-btn" @click="emit('defaults')">Default layers</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tl { display: grid; gap: 0.25rem; color: var(--dz-ink); }
.tl svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.tl-head { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.75rem 0.875rem 0.5rem; background: rgba(20, 24, 23, 0.98); }
.tl-head h3 { margin: 0; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); outline: none; }
.tl-done { min-height: 2.5rem; padding: 0 1rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: none; color: var(--dz-ink); font: inherit; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
.tl-section { padding: 0 0.5rem; border-top: 1px solid var(--dz-line); }
.tl-section-head { display: flex; align-items: center; gap: 0.25rem; }
.tl-fold { flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.4rem; min-height: 2.75rem; padding: 0 0.375rem; border: 0; background: none; color: var(--dz-ink); font: inherit; font-size: 0.95rem; font-weight: 700; text-align: left; cursor: pointer; }
.tl-fold svg { flex: none; width: 1rem; height: 1rem; transition: transform 0.15s; }
.tl-fold[aria-expanded='false'] svg { transform: rotate(-90deg); }
.tl-fold small { margin-left: auto; padding-right: 0.25rem; font-size: 0.65rem; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); white-space: nowrap; }
.tl-text-btn { flex: none; min-height: 2.5rem; padding: 0 0.4rem; border: 0; background: none; color: var(--dz-muted); font: inherit; font-size: 0.85rem; text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
.tl-text-btn:hover { color: var(--dz-ink); }
.tl-rows { list-style: none; margin: 0 0 0.375rem; padding: 0; display: grid; gap: 0.125rem; }
.tl-rows li { display: flex; align-items: stretch; gap: 0.125rem; }
.tl-row { flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.625rem; min-height: 3rem; padding: 0.375rem 0.5rem; border: 1px solid transparent; border-radius: 10px; background: none; color: var(--dz-muted); font: inherit; font-size: 0.95rem; text-align: left; cursor: pointer; }
.tl-row:hover { background: rgba(233, 230, 214, 0.07); color: var(--dz-ink); }
.tl-row[aria-pressed='true'] { color: var(--dz-ink); background: rgba(233, 230, 214, 0.1); }
.tl-row[aria-pressed='false'] .tl-glyph { opacity: 0.45; }
.tl-glyph { display: grid; place-items: center; flex: none; width: 2rem; height: 2rem; border: 1.5px solid var(--tm-c, var(--dz-ink)); border-radius: 50%; color: var(--tm-c, var(--dz-ink)); background: rgba(10, 12, 11, 0.5); }
.tl-glyph.is-reported { border-radius: 7px; border-style: dashed; }
.tl-glyph svg { width: 1rem; height: 1rem; }
.tl-text { flex: 1; min-width: 0; line-height: 1.25; }
.tl-text small { display: block; margin-top: 0.1rem; font-size: 0.78rem; color: var(--dz-muted); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.tl-tag { margin-left: 0.4rem; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-accent); }
.tl-count { flex: none; min-width: 1.75rem; text-align: right; font-size: 0.75rem; color: var(--dz-muted); }
.tl-row[aria-pressed='true'] .tl-count { color: var(--dz-ink); }
.tl-list { flex: none; display: grid; place-items: center; width: 2.75rem; border: 1px solid transparent; border-radius: 10px; background: none; color: var(--dz-muted); cursor: pointer; }
.tl-list:hover { color: var(--dz-ink); border-color: var(--dz-line); }
.tl-list svg { width: 1.1rem; height: 1.1rem; }
.tl-swatch { flex: none; width: 1rem; height: 1rem; border-radius: 3px; background: var(--tm-t); }
.tl-row[aria-pressed='false'] .tl-swatch { background: transparent; box-shadow: inset 0 0 0 2px var(--tm-t); }
.tl-state { flex: none; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; }
.tl [data-threat='low'] { --tm-t: #a9b39a; } .tl [data-threat='medium'] { --tm-t: #d8c47c; } .tl [data-threat='high'] { --tm-t: #e8a04f; } .tl [data-threat='critical'] { --tm-t: #ef7a5a; } .tl [data-threat='extreme'] { --tm-t: #ff5468; }
.tl-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 1rem; padding: 0.5rem 0.875rem 0.875rem; border-top: 1px solid var(--dz-line); }
.tl-check { display: inline-flex; align-items: center; gap: 0.45rem; min-height: 2.75rem; font-size: 0.9rem; cursor: pointer; }
.tl-check input { width: 1.05rem; height: 1.05rem; accent-color: var(--dz-teal); }
.tl :is(button, input):focus-visible { outline: 2px solid var(--dz-ink); outline-offset: 2px; }
@media (pointer: coarse) { .tl-row { min-height: 3.25rem; } .tl-list { width: 3rem; } }
</style>
