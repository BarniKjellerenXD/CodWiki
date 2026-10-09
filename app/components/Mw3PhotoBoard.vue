<script setup lang="ts">
import { redWormPhotoAtlas } from '~/utils/mw3PhotoBoard.mjs'
const props = defineProps<{ selected: number[]; saveError?: boolean }>()
const emit = defineEmits<{ change: [numbers: number[]]; locate: [] }>()
const preview = ref<number | null>(null)
const imageError = ref(false)
const imageRevision = ref(0)
const imageSrc = computed(() => redWormPhotoAtlas.image + (imageRevision.value ? `?retry=${imageRevision.value}` : ''))
const previewPhoto = computed(() => preview.value ? redWormPhotoAtlas.photos.find(photo => photo.number === preview.value) : null)
function toggle(number: number) {
  if (props.selected.includes(number)) emit('change', props.selected.filter(value => value !== number))
  else if (props.selected.length < 4) emit('change', [...props.selected, number])
}
function retry() { imageError.value = false; imageRevision.value++ }
</script>

<template>
  <section class="photo-board" aria-label="Red Worm board photo selector">
    <div class="photo-board-heading"><h3>Match your board photos</h3><button type="button" class="atlas-text-button" :disabled="!selected.length" @click="emit('change', [])">New board</button></div>
    <p>Choose the four pictures on your clue board. Their USB consoles appear on the map.</p>
    <p class="photo-board-status" role="status">{{ selected.length }} / 4 selected<template v-if="selected.length === 4"> · Unselect a photo to replace it.</template><template v-else-if="selected.length"> · Choose {{ 4 - selected.length }} more.</template></p>
    <p v-if="saveError" class="photo-board-warning" role="status">Your photos could not be saved. Keep this page open or copy the map link.</p>
    <div v-if="imageError" class="photo-board-warning" role="status">The clue photos could not load. You can still select named locations. <button type="button" class="atlas-text-button" @click="retry">Retry images</button></div>
    <img :src="imageSrc" alt="" class="photo-board-preload" @error="imageError = true" />
    <div class="photo-board-grid" role="group" aria-label="Twelve possible board photos">
      <div v-for="photo in redWormPhotoAtlas.photos" :key="photo.number" class="photo-choice" :class="{ 'photo-choice-selected': selected.includes(photo.number) }">
        <button type="button" class="photo-select" :aria-pressed="selected.includes(photo.number)" :aria-label="`Photo ${photo.number}: ${photo.shape}, ${photo.landmark}, grid ${photo.grid}`" :disabled="!selected.includes(photo.number) && selected.length === 4" @click="toggle(photo.number)">
          <ReferenceCrop v-if="!imageError" :src="imageSrc" :crop="photo.crop" />
          <span v-else class="photo-fallback">{{ photo.landmark }}</span>
          <span class="photo-caption"><strong>{{ photo.number }}</strong><span>{{ photo.grid }}</span><svg v-if="selected.includes(photo.number)" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" /></svg></span>
        </button>
        <button type="button" class="photo-enlarge" :aria-label="`Enlarge photo ${photo.number}: ${photo.landmark}`" :disabled="imageError" @click="preview = photo.number"><svg aria-hidden="true" viewBox="0 0 20 20" width="15" height="15"><circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.5" /><path d="m12 12 5 5 M5 8h6 M8 5v6" fill="none" stroke="currentColor" stroke-width="1.5" /></svg></button>
      </div>
    </div>
    <button type="button" class="companion-button primary photo-board-locate" :disabled="!selected.length" @click="emit('locate')">View {{ selected.length || '' }} matching {{ selected.length === 1 ? 'USB' : 'USBs' }} on map</button>
    <p class="photo-board-note">Numbers identify these reference photos. Read the USB letters in your rucksack.</p>
    <p class="photo-board-credit">Photos: <a :href="redWormPhotoAtlas.source" target="_blank" rel="noopener noreferrer">spaz33g</a> · <button type="button" class="atlas-text-button" @click="preview = 0">Full reference chart</button></p>
    <ImageLightbox v-if="preview !== null" :src="imageSrc" :crop="previewPhoto?.crop" :alt="previewPhoto ? `Board photo ${previewPhoto.number}: ${previewPhoto.shape} — ${previewPhoto.landmark}, grid ${previewPhoto.grid}. Photo reference: spaz33g.` : 'spaz33g’s original twelve-photo Red Worm reference chart'" @close="preview = null" />
  </section>
</template>

<style scoped>
.photo-board { min-width:0; padding:1rem; background:var(--surface-2); border:1px solid var(--line); border-radius:var(--radius); }
.photo-board-heading { display:flex; justify-content:space-between; align-items:center; gap:.5rem; }
.photo-board h3 { margin:0; font-size:1rem; letter-spacing:-.018em; }
.photo-board p { margin:.45rem 0 .7rem; color:var(--muted); font-size:.76rem; line-height:1.55; }
.photo-board .photo-board-status { color:var(--gold-bright); font-size:.73rem; min-height:2.3em; font-variant-numeric:tabular-nums; }
.photo-board .photo-board-warning { color:var(--text); padding:.65rem; background:var(--surface-3); border-radius:6px; }
.photo-board-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.5rem; }
.photo-choice { position:relative; min-width:0; border:1px solid var(--line-strong); border-radius:6px; overflow:hidden; }
.photo-choice-selected { border-color:var(--gold); }
.photo-select { display:block; width:100%; border:0; background:var(--surface); color:var(--text); padding:0; text-align:left; font:inherit; cursor:pointer; }
.photo-select:not(:disabled):hover { background:var(--surface-3); }
.photo-select:disabled { cursor:default; }
.photo-select:disabled :deep(svg.reference-crop) { opacity:.5; }
.photo-caption { display:flex; align-items:center; gap:.35rem; min-height:35px; padding:.25rem .35rem; padding-right:29px; font-size:.69rem; font-variant-numeric:tabular-nums; }
.photo-caption strong { font-size:.75rem; }.photo-caption>svg { position:absolute; top:.25rem; right:.25rem; color:var(--on-gold); background:var(--gold-bright); border-radius:3px; padding:2px; width:21px; height:21px; }
.photo-choice-selected .photo-caption { color:var(--gold-bright); background:var(--gold-dim); }
.photo-enlarge { position:absolute; bottom:0; right:0; display:grid; place-items:center; min-width:32px; min-height:35px; border:0; background:none; color:var(--muted); cursor:pointer; }
.photo-enlarge:hover { color:var(--gold-bright); background:var(--gold-dim); }.photo-enlarge:disabled { opacity:.4; cursor:default; }
.photo-fallback { display:grid; place-items:center; aspect-ratio:300/262; padding:.25rem; font-size:.67rem; text-align:center; }
.photo-board .photo-board-locate { width:100%; justify-content:center; margin-top:.8rem; min-height:44px; font-size:.76rem; }
.photo-board-locate:disabled { opacity:.45; cursor:default; }
.photo-board .photo-board-note,.photo-board .photo-board-credit { font-size:.68rem; margin:.65rem 0 0; }
.photo-board-credit a { color:var(--gold-bright); text-decoration:underline; text-underline-offset:3px; }
.photo-board .atlas-text-button { min-height:32px; padding:0 .2rem; border:0; background:none; color:var(--gold-bright); font:inherit; font-size:.7rem; text-decoration:underline; text-underline-offset:3px; cursor:pointer; }
.photo-board .atlas-text-button:disabled { opacity:.4; cursor:default; }
.photo-board :is(button,a):focus-visible { outline:2px solid var(--gold); outline-offset:-2px; }
.photo-board-preload { display:none; }
@media (pointer:coarse) { .photo-caption,.photo-enlarge { min-height:44px; }.photo-enlarge { min-width:40px; }.photo-caption { padding-right:38px; } }
</style>
