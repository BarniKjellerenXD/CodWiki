<script setup lang="ts">
import { toolDefinitions, evaluateTool } from '~/utils/expansionTools.mjs'
import {
  dartboardNumbers, dartSectorPath, firebaseDartResult, safeRooms, mauerSafeResult,
  dieVariants, launchConsoles, outbreakLaunchResult, tvScreens, tvSequence,
  outbreakRegions, outbreakQuests, outbreakStages, outbreakLocation
} from '~/utils/coldWar.mjs'

const props = defineProps<{ tool: string }>()
const definition = computed(() => toolDefinitions[props.tool])
const { state, change, undo, reset, canUndo, saveError } = usePuzzleState(props.tool)
const uid = useId()
const confirmReset = ref(false)
const dartSlot = ref(-1)
const tvSlot = ref(-1)
const replay = ref(-1)
const value = (event: Event) => (event.target as HTMLInputElement).value
function set(field: string, next: string | boolean) { change({ ...state.value, [field]: next }); confirmReset.value = false }
const darts = computed(() => firebaseDartResult(state.value))
const dartTarget = computed(() => dartSlot.value >= 0 ? dartSlot.value : [0, 1, 2].findIndex(i => !state.value[`slot-${i}`]))
function recordDart(index: number) {
  if (dartTarget.value < 0) return
  set(`slot-${dartTarget.value}`, String(index + 1)); dartSlot.value = -1
}
function dartNumber(i: number) { return state.value[`slot-${i}`] ? dartboardNumbers[Number(state.value[`slot-${i}`]) - 1] : '—' }
const safe = computed(() => mauerSafeResult(state.value))
const variant = computed(() => dieVariants.find(v => v.id === state.value.variant))
const launch = computed(() => outbreakLaunchResult(state.value))
const legacyLaunch = computed(() => evaluateTool('cw-outbreak-launch', state.value))
const length = computed(() => Number(state.value.stage || 4))
const tvs = computed(() => tvSequence(state.value, length.value))
const tvTarget = computed(() => tvSlot.value >= 0 ? tvSlot.value : tvs.value.sequence.findIndex(v => !v))
const replayScreen = computed(() => tvScreens.find(t => t.id === tvs.value.sequence[replay.value]))
function recordTv(color: string) {
  if (tvTarget.value < 0) return
  set(`tv-${length.value}-${tvTarget.value}`, color); tvSlot.value = -1
}
function setLength(n: number) { set('stage', String(n)); tvSlot.value = -1; replay.value = -1 }
function clearStage() {
  change({ ...state.value, ...Object.fromEntries(Array.from({ length: length.value }, (_, i) => [`tv-${length.value}-${i}`, ''])) })
  tvSlot.value = -1; replay.value = -1
}
watch(state, () => { replay.value = -1 }, { deep: true })
const location = computed(() => outbreakLocation(state.value))
function setQuest(quest: string) {
  change({ ...state.value, quest, stage: outbreakStages(quest).includes(state.value.stage) ? state.value.stage : '' })
}
function undoInput() { undo(); dartSlot.value = -1; tvSlot.value = -1; replay.value = -1; confirmReset.value = false }
function clearInput() { reset(); dartSlot.value = -1; tvSlot.value = -1; replay.value = -1; confirmReset.value = false }
const source = computed(() => {
  const map = definition.value.map.replace('cw-', '').replaceAll('-', '_')
  return `https://mmmrkennedy.com/games/BO_CW/${map}/${map}${map === 'outbreak' ? '_CW' : ''}_guide`
})
const tvPhoto = '/images/cw-forsaken/vhs_four_tvs.webp'
</script>

<template>
  <div class="puzzle cw-workspace">
    <p class="cw-intro">{{ definition.help }}</p>

    <template v-if="tool === 'cw-die-variants'">
      <fieldset>
        <legend>Which Medical Bay port are you charging?</legend>
        <div class="cw-port-grid">
          <button v-for="v in dieVariants" :key="v.id" type="button" class="cw-photo-choice" :aria-pressed="state.variant === v.id" @click="set('variant', v.id)">
            <img :src="v.image.src" :alt="v.image.alt" width="640" height="360" loading="lazy" />
            <span><strong>{{ v.color }}</strong><small>{{ v.name }}</small></span>
          </button>
        </div>
      </fieldset>
      <div v-if="variant" class="cw-variant" aria-live="polite">
        <div>
          <h3>{{ variant.name }}</h3>
          <p><strong>Before you start:</strong> {{ variant.prerequisite }}</p>
          <ol class="cw-route"><li v-for="instruction in variant.route" :key="instruction">{{ instruction }}</li></ol>
          <NuxtLink :to="`/guides/cw-die-maschine#${variant.anchor}`">Open this upgrade in the map guide →</NuxtLink>
        </div>
        <GuideIllustrations :images="[variant.image, variant.crateImage]" />
      </div>
      <p v-else class="cw-hint">Select a port photograph to see the matching element and its complete upgrade route.</p>
    </template>

    <template v-else-if="tool === 'cw-firebase-darts'">
      <p class="cw-hint">Keep the board upright: 20 is at the top. Select a recorded stop to correct it.</p>
      <div class="cw-dart-layout">
        <div class="cw-dart-visual">
          <svg class="cw-dartboard" viewBox="0 0 340 340" role="group" :aria-labelledby="`${uid}-board-title`">
            <title :id="`${uid}-board-title`">Computer sectors. Top is dartboard number 20; numbers run clockwise.</title>
            <g v-for="(number, index) in dartboardNumbers" :key="number" class="cw-sector" :class="{ 'cw-sector-picked': dartTarget >= 0 && state[`slot-${dartTarget}`] === String(index + 1) }" role="button" :tabindex="dartTarget < 0 ? -1 : 0" :aria-disabled="dartTarget < 0" :aria-label="`Sector ${index + 1}, dartboard number ${number}`" @click="recordDart(index)" @keydown.enter.prevent="recordDart(index)" @keydown.space.prevent="recordDart(index)">
              <path :d="dartSectorPath(index)" :class="{ 'cw-sector-alt': index % 2 === 0 }" />
              <text :x="170 + 113 * Math.sin(index * Math.PI / 10)" :y="170 - 113 * Math.cos(index * Math.PI / 10)" text-anchor="middle" dominant-baseline="central">{{ number }}</text>
            </g>
            <circle cx="170" cy="170" r="13" class="cw-bull" />
            <text x="170" y="14" text-anchor="middle" class="cw-board-top">TOP</text>
          </svg>
          <details class="cw-details">
            <summary>Use a numbered sector list</summary>
            <div class="cw-sector-list"><button v-for="(number, index) in dartboardNumbers" :key="number" type="button" :disabled="dartTarget < 0" @click="recordDart(index)">Sector {{ index + 1 }} <strong>{{ number }}</strong></button></div>
          </details>
        </div>
        <div class="cw-dart-entry">
          <p class="cw-eyebrow">{{ dartTarget >= 0 ? `Recording stop ${dartTarget + 1} of 3` : 'All three stops recorded' }}</p>
          <div class="cw-stops">
            <button v-for="i in [0, 1, 2]" :key="i" type="button" :aria-pressed="dartTarget === i" :aria-label="`Edit stop ${i + 1}, ${state[`slot-${i}`] ? `number ${dartNumber(i)}` : 'empty'}`" @click="dartSlot = i"><small>Stop {{ i + 1 }}</small><strong>{{ dartNumber(i) }}</strong><span>{{ state[`slot-${i}`] ? `Sector ${state[`slot-${i}`]}` : 'Tap a wedge' }}</span></button>
          </div>
          <div class="cw-result" :class="`cw-${darts.status}`" role="status">
            <p>{{ darts.message }}</p>
            <div v-if="darts.status === 'ready'" class="cw-answer" aria-label="Shooting order"><span v-for="(n, i) in darts.numbers" :key="i">{{ n }}<b aria-hidden="true"> → </b></span><span class="cw-bull-label">Bullseye</span></div>
          </div>
          <p class="cw-hint">Use a precise single-shot weapon at the Village dartboard. Shoot the numbered outer sections, then the center. Repeated numbers are valid; a miss means entering the whole sequence again.</p>
          <NuxtLink to="/guides/cw-firebase-z#guide-step-setup-3">RAI K-84 build instructions →</NuxtLink>
        </div>
      </div>
      <details class="cw-details"><summary>Compare the computer sectors with the real dartboard</summary><GuideIllustrations :images="[{ src: '/images/cw-firebase-z/dartboard_ref_new_numbered.webp', alt: 'Computer display annotated with matching dartboard values: 20 is at the top' }, { src: '/images/cw-firebase-z/dartboard.webp', alt: 'Village dartboard beside the Wunderfizz: shoot the outer numbers, then the center' }]" /></details>
    </template>

    <template v-else-if="tool === 'cw-mauer-safe'">
      <p>Collect Klaus’s blacklight from the Switch Control Room locker. Read one hidden two-digit number in each room; its location can change, but the safe dial order below never changes.</p>
      <div class="cw-safe-rooms">
        <div v-for="room in safeRooms" :key="room.field" class="cw-room">
          <label :for="`${uid}-${room.field}`"><small>Dial {{ room.dial }} · {{ ['left', 'middle', 'right'][room.dial - 1] }}</small><strong>{{ room.name }}</strong></label>
          <input :id="`${uid}-${room.field}`" :value="state[room.field]" type="text" inputmode="numeric" pattern="[0-9]{2}" maxlength="2" placeholder="00" autocomplete="off" :aria-invalid="!!state[room.field] && !/^\d{2}$/.test(state[room.field])" @input="set(room.field, value($event))" />
          <details class="cw-details"><summary>Show all 3 clue locations</summary><GuideIllustrations :images="room.images" /></details>
        </div>
      </div>
      <div class="cw-result" :class="`cw-${safe.status}`" role="status"><p>{{ safe.message }}</p><div v-if="safe.status === 'ready'" class="cw-safe-code"><span v-for="(n, i) in safe.code" :key="i"><small>{{ ['Left', 'Middle', 'Right'][i] }}</small><strong>{{ n }}</strong></span></div></div>
      <p class="cw-hint">Keep leading zeros: “09” is different from an unfinished “9”. Enter all three values at the Hotel Room 305 safe, then confirm to claim the CRBR-S.</p>
      <NuxtLink to="/guides/cw-mauer-der-toten#details-safe">Back to the safe quest step →</NuxtLink>
    </template>

    <template v-else-if="tool === 'cw-outbreak-launch'">
      <p>In the Ruka bunker, look below the key switch at consoles <strong>A, B and D</strong>. Of the three small lights, the green light marks that console’s place in the sequence. Silo C has no launch console.</p>
      <div class="cw-launch-rows">
        <fieldset v-for="console in launchConsoles" :key="console">
          <legend>Silo {{ console }}</legend>
          <div class="cw-light-choices">
            <button v-for="(position, index) in ['Left · first', 'Middle · second', 'Right · third']" :key="position" type="button" :aria-pressed="state[`light-${console}`] === String(index + 1)" @click="set(`light-${console}`, state[`light-${console}`] === String(index + 1) ? '' : String(index + 1))"><span class="cw-lights" aria-hidden="true"><i v-for="n in [0, 1, 2]" :key="n" :class="{ green: n === index }" /></span><span>{{ position }}</span></button>
          </div>
        </fieldset>
      </div>
      <div class="cw-result" :class="`cw-${launch.status}`" role="status"><p>{{ launch.message }}</p><ol v-if="launch.status === 'ready'" class="cw-launch-order"><li v-for="(console, i) in launch.order" :key="console"><small>{{ i + 1 }}</small><strong>{{ console }}</strong><span>{{ launch.inferred.includes(console) ? 'Deduced' : 'Observed' }}</span></li></ol></div>
      <details class="cw-details"><summary>Where to look: three small indicator lights</summary><GuideIllustrations :images="[{ src: '/images/cw-outbreak/control_panel_three_lights.webp', alt: 'Launch console: inspect the small horizontal row of three lights below the key switch' }]" /></details>
      <details class="cw-details">
        <summary>Previous attempt notes / alternate elimination method</summary>
        <p>Your older accepted and rejected console observations are kept here. They are separate from the green-light solver above.</p>
        <div class="cw-selects">
          <label v-for="(field, index) in ['first', 'second', 'third']" :key="field">Accepted position {{ index + 1 }}<select :value="state[field]" @change="set(field, value($event))"><option value="">Unknown</option><option v-for="console in launchConsoles" :key="console">{{ console }}</option></select></label>
        </div>
        <fieldset v-for="index in [0, 1, 2]" :key="index" class="cw-rejections"><legend>Rejected at position {{ index + 1 }}</legend><label v-for="console in launchConsoles" :key="console"><input type="checkbox" :checked="state[`reject-${index}-${console}`]" @change="set(`reject-${index}-${console}`, ($event.target as HTMLInputElement).checked)" />{{ console }}</label></fieldset>
        <p role="status">{{ legacyLaunch.message }}<span v-if="legacyLaunch.lines.length">: {{ legacyLaunch.lines.join(' · ') }}</span></p>
      </details>
      <NuxtLink to="/guides/cw-outbreak-ravenov#details-launch">Launch and Legion walkthrough →</NuxtLink>
    </template>

    <template v-else-if="tool === 'cw-outbreak-regions'">
      <div class="cw-selects">
        <label :for="`${uid}-quest`">Quest<select :id="`${uid}-quest`" :value="state.quest" @change="setQuest(value($event))"><option value="">Choose quest</option><option v-for="quest in outbreakQuests" :key="quest">{{ quest }}</option></select></label>
        <label :for="`${uid}-region`">Current region<select :id="`${uid}-region`" :value="state.region" @change="set('region', value($event))"><option value="">Choose region</option><option v-for="region in outbreakRegions" :key="region">{{ region }}</option></select></label>
        <label :for="`${uid}-objective`">Objective<select :id="`${uid}-objective`" :value="state.stage" :disabled="!state.quest" @change="set('stage', value($event))"><option value="">Choose objective</option><option v-for="stage in outbreakStages(state.quest)" :key="stage">{{ stage }}</option></select></label>
      </div>
      <div class="cw-result" :class="`cw-${location.status}`" role="status"><strong v-if="location.status === 'unavailable'">This objective is not available here.</strong><p>{{ location.message }}</p></div>
      <div v-if="location.images.length" class="cw-map-results"><h3>{{ state.region }} · {{ state.stage }}</h3><p class="cw-hint">Select a map or photograph to enlarge it.</p><GuideIllustrations :images="location.images" /></div>
      <NuxtLink v-if="state.quest" :to="state.quest === 'Ravenov Implications' ? '/guides/cw-outbreak-ravenov' : '/guides/cw-outbreak-excision'">Open {{ state.quest }} walkthrough →</NuxtLink>
    </template>

    <template v-else-if="tool === 'cw-forsaken-tvs'">
      <p>Collect the VHS from behind Video Store’s shelf, then insert and play it at the TV Store VCR. Record every flash, then shoot the matching screens. Each stage keeps its own sequence.</p>
      <fieldset><legend>Sequence stage</legend><div class="cw-stage-choices"><button v-for="n in [4, 8, 12]" :key="n" type="button" :aria-pressed="length === n" @click="setLength(n)">{{ n }} flashes</button><button type="button" :disabled="!tvs.sequence.some(Boolean)" @click="clearStage">Clear {{ length }}-flash stage</button></div></fieldset>
      <div class="cw-tv-layout">
        <div>
          <p class="cw-eyebrow">{{ tvTarget >= 0 ? `Record flash ${tvTarget + 1} of ${length}` : 'Sequence recorded · select a slot to edit' }}</p>
          <div class="cw-tv-choices">
            <button v-for="screen in tvScreens" :key="screen.id" type="button" :disabled="tvTarget < 0" :aria-label="`Record ${screen.label} TV`" @click="recordTv(screen.id)">
              <svg :viewBox="screen.viewBox" aria-hidden="true"><image :href="tvPhoto" width="2560" height="1440" /></svg>
              <span :style="{ color: screen.color }">{{ screen.id }}</span><small>{{ screen.label.split(' · ')[1] }}</small>
            </button>
          </div>
          <details class="cw-details"><summary>See the full TV arrangement</summary><GuideIllustrations :images="[{ src: tvPhoto, alt: 'TV Store screens: blue left middle, green lower left, red upper right, orange right middle' }]" /></details>
        </div>
        <div>
          <ol class="cw-tv-slots"><li v-for="(color, index) in tvs.sequence" :key="index"><button type="button" :aria-pressed="tvTarget === index" :aria-label="`Edit flash ${index + 1}, ${color || 'empty'}`" @click="tvSlot = index; replay = -1"><small>{{ index + 1 }}</small><strong>{{ color || '—' }}</strong></button></li></ol>
          <div class="cw-result" :class="`cw-${tvs.status}`" role="status"><p>{{ tvs.message }}</p></div>
          <button v-if="tvs.status === 'ready' && replay < 0" class="cw-primary" type="button" @click="replay = 0">Follow shot order →</button>
          <div v-if="replayScreen" class="cw-replay" aria-live="polite">
            <p class="cw-eyebrow">Shot {{ replay + 1 }} of {{ length }}</p>
            <strong :style="{ color: replayScreen.color }">{{ replayScreen.label }}</strong>
            <svg :viewBox="replayScreen.viewBox" role="img" :aria-label="`${replayScreen.id} TV to shoot`"><image :href="tvPhoto" width="2560" height="1440" /></svg>
            <div class="cw-replay-controls"><button type="button" :disabled="replay === 0" @click="replay--">← Previous</button><button type="button" class="cw-primary" @click="replay = replay === length - 1 ? -1 : replay + 1">{{ replay === length - 1 ? 'Finish replay' : 'Next shot →' }}</button></div>
          </div>
        </div>
      </div>
      <p class="cw-hint">Replay advances only when you press Next shot. If the game resets a stage, clear that stage and record its new flashes. Other stages stay saved, and Undo restores an accidental clear. Tombstone Soda is needed for the shadow-form step after all three sequences.</p>
      <NuxtLink to="/guides/cw-forsaken#details-perkaholic">Perkaholic quest and shadow-form steps →</NuxtLink>
    </template>

    <div class="cw-actions">
      <button type="button" :disabled="!canUndo" @click="undoInput">Undo</button>
      <button v-if="!confirmReset" type="button" @click="confirmReset = true">Reset helper</button>
      <template v-else><span>Clear this helper’s saved inputs?</span><button type="button" @click="clearInput">Clear inputs</button><button type="button" @click="confirmReset = false">Keep inputs</button></template>
    </div>
    <p v-if="saveError" role="alert" class="cw-save-error">Your browser could not save these inputs. Keep this page open; they may be lost when you reload.</p>
    <p class="cw-credit">Inputs are shared with the inline guide on this device. Photos: <a :href="source" target="_blank" rel="noopener noreferrer">mmmrkennedy</a> · game imagery: Activision / Treyarch.</p>
  </div>
</template>

<style scoped>
.cw-workspace{color:var(--wp-text);font-size:.95rem;line-height:1.65;min-width:0;container-type:inline-size}.cw-workspace *{box-sizing:border-box}.cw-workspace p{margin:.75rem 0}.cw-workspace h3{margin:.25rem 0 .75rem;font-size:1.2rem;color:var(--wp-text)}.cw-intro{color:var(--wp-muted);max-width:75ch}.cw-workspace a{color:var(--wp-gold-bright);text-underline-offset:3px}.cw-workspace fieldset{border:0;padding:0;margin:1.25rem 0;min-width:0}.cw-workspace legend{font-weight:650;margin-bottom:.7rem}.cw-workspace button,.cw-workspace select,.cw-workspace input[type=text]{font:inherit;color:var(--wp-text);border:1px solid var(--wp-line-strong);background:var(--wp-surface-2);border-radius:8px;min-height:44px}.cw-workspace button{cursor:pointer;padding:.55rem .8rem;line-height:1.4}.cw-workspace button:hover:not(:disabled){background:var(--wp-surface-3);border-color:var(--wp-gold-border)}.cw-workspace button[aria-pressed=true]{border-color:var(--wp-gold);box-shadow:inset 0 0 0 1px var(--wp-gold);background:var(--wp-gold-dim)}.cw-workspace button:disabled{opacity:.48;cursor:default}.cw-workspace :is(button,select,input,summary,a):focus-visible{outline:3px solid var(--wp-gold-bright);outline-offset:3px}.cw-workspace select{display:block;width:100%;padding:.6rem 2rem .6rem .7rem;margin-top:.35rem}.cw-workspace select:disabled{opacity:.5}.cw-workspace small{font-size:.78rem}.cw-hint,.cw-credit{color:var(--wp-muted);font-size:.85rem}.cw-eyebrow{text-transform:uppercase;letter-spacing:.07em;font-weight:650;font-size:.75rem;color:var(--wp-gold)}.cw-result{border-left:3px solid var(--wp-line-strong);background:var(--wp-surface-2);padding:.85rem 1rem;margin:1.2rem 0}.cw-result p{margin:0}.cw-ready{border-color:var(--wp-gold)}.cw-invalid,.cw-unavailable{border-color:var(--wp-orange)}.cw-details{border-top:1px solid var(--wp-line);padding:.65rem 0;margin:.5rem 0}.cw-details summary{cursor:pointer;min-height:44px;align-content:center;color:var(--wp-gold-bright);font-size:.87rem;font-weight:600}.cw-details[open] summary{margin-bottom:.65rem}.cw-actions{display:flex;align-items:center;flex-wrap:wrap;gap:.6rem;border-top:1px solid var(--wp-line);padding-top:1rem;margin-top:1.7rem}.cw-credit{font-size:.75rem}.cw-save-error{color:var(--wp-orange)}.cw-workspace .cw-primary{background:var(--wp-gold);color:var(--wp-on-gold);border-color:var(--wp-gold);font-weight:700}.cw-workspace .cw-primary:hover:not(:disabled){background:var(--wp-gold-bright);color:var(--wp-on-gold)}
.cw-port-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}.cw-workspace .cw-photo-choice{padding:0;overflow:hidden;text-align:left}.cw-photo-choice img{width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;display:block}.cw-photo-choice>span{display:block;padding:.65rem}.cw-photo-choice small,.cw-photo-choice strong{display:block}.cw-photo-choice small{color:var(--wp-muted);margin-top:.15rem}.cw-variant{display:grid;grid-template-columns:1.4fr 1fr;gap:1.5rem;margin:1.25rem 0}.cw-route{list-style:decimal;padding-left:1.35rem;margin:1rem 0}.cw-route li{padding-left:.25rem;margin:.65rem 0}
.cw-dart-layout{display:grid;grid-template-columns:minmax(230px,.85fr) 1.15fr;gap:1.5rem;align-items:start}.cw-dartboard{width:100%;max-width:440px;display:block;margin:auto}.cw-sector{cursor:pointer;outline:none}.cw-sector path{fill:var(--wp-surface-2);stroke:var(--wp-line-strong);stroke-width:1.5}.cw-sector path.cw-sector-alt{fill:var(--wp-surface-3)}.cw-sector text{fill:var(--wp-text);font-size:15px;font-weight:650;pointer-events:none}.cw-sector:not([aria-disabled=true]):hover path,.cw-sector:not([aria-disabled=true]):focus path,.cw-sector-picked path{fill:var(--wp-gold-dim);stroke:var(--wp-gold-bright);stroke-width:3}.cw-sector[aria-disabled=true]{cursor:default}.cw-bull{fill:var(--wp-gold);stroke:var(--wp-bg);stroke-width:3;pointer-events:none}.cw-board-top{font-size:10px;letter-spacing:2px;fill:var(--wp-muted)}.cw-stops{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}.cw-stops button>*{display:block}.cw-stops strong{font-size:1.7rem;color:var(--wp-gold-bright);font-variant-numeric:tabular-nums}.cw-stops span{font-size:.72rem;color:var(--wp-muted)}.cw-answer{display:flex;align-items:center;flex-wrap:wrap;font-size:1.7rem;font-weight:700;margin-top:.65rem;color:var(--wp-gold-bright);font-variant-numeric:tabular-nums}.cw-answer b{font-weight:400;color:var(--wp-muted);font-size:1rem;margin:0 .35rem}.cw-bull-label{font-size:1rem}.cw-sector-list{display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem}.cw-sector-list button{font-size:.7rem;padding:.4rem}.cw-sector-list strong{display:block;font-size:1.1rem}
.cw-safe-rooms,.cw-selects{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.cw-room{min-width:0}.cw-room label>*{display:block}.cw-room label small{color:var(--wp-muted)}.cw-room input{display:block;width:100%;font-size:1.8rem!important;font-variant-numeric:tabular-nums;padding:.35rem .8rem;margin:.65rem 0}.cw-room input[aria-invalid=true]{border-color:var(--wp-orange)}.cw-safe-code{display:flex;gap:1.75rem;margin-top:.65rem}.cw-safe-code span>*{display:block}.cw-safe-code small{color:var(--wp-muted)}.cw-safe-code strong{font-size:2rem;font-variant-numeric:tabular-nums;color:var(--wp-gold-bright)}.cw-selects label{font-size:.83rem;font-weight:600}.cw-map-results :deep(.guide-illustrations){grid-template-columns:repeat(auto-fit,minmax(min(100%,350px),1fr))}.cw-map-results :deep(.guide-illustrations img){aspect-ratio:auto;max-height:660px}
.cw-launch-rows{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.cw-light-choices{display:grid;gap:.5rem}.cw-lights{display:flex;gap:.4rem;justify-content:center;margin:.3rem 0 .5rem}.cw-lights i{display:block;width:14px;height:14px;border-radius:50%;border:1px solid #a77f71;background:#603b33}.cw-lights i.green{background:#a8ce88;border-color:#d3edbd;box-shadow:0 0 0 2px #80ac7133}.cw-light-choices button>span:last-child{font-size:.83rem}.cw-launch-order{display:flex;gap:2rem;list-style:none;padding:0;margin:.8rem 0 0}.cw-launch-order li>*{display:block}.cw-launch-order strong{font-size:2rem;color:var(--wp-gold-bright)}.cw-launch-order span{font-size:.75rem;color:var(--wp-muted)}.cw-rejections{display:flex;gap:1rem}.cw-rejections label{display:inline-flex;align-items:center;gap:.4rem;min-height:44px}.cw-rejections input{accent-color:var(--wp-gold);width:18px;height:18px}
.cw-stage-choices{display:flex;gap:.6rem;flex-wrap:wrap}.cw-tv-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}.cw-tv-choices{display:grid;grid-template-columns:1fr 1fr;gap:.65rem}.cw-tv-choices svg{width:100%;height:85px;display:block;border-radius:3px;margin-bottom:.5rem}.cw-tv-choices span,.cw-tv-choices small{display:block}.cw-tv-choices span{font-weight:700}.cw-tv-choices small{color:var(--wp-muted)}.cw-tv-slots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.4rem;list-style:none;padding:0!important;margin:.75rem 0!important}.cw-tv-slots li{margin:0;padding:0;list-style:none}.cw-tv-slots button{width:100%;padding:.5rem .2rem}.cw-tv-slots small{display:block;color:var(--wp-muted)}.cw-tv-slots strong{font-size:.82rem}.cw-replay{border:1px solid var(--wp-gold-border);padding:1rem;margin:1rem 0}.cw-replay>strong{font-size:1.3rem}.cw-replay>svg{display:block;width:100%;height:110px;margin:.8rem 0}.cw-replay-controls{display:flex;justify-content:space-between;gap:.5rem}
@container (max-width:680px){.cw-dart-layout{gap:.6rem}.cw-dart-entry{display:contents}.cw-dart-entry>.cw-eyebrow{order:0}.cw-dart-entry>.cw-stops{order:1}.cw-dart-visual{order:2}.cw-dart-entry>.cw-result{order:3}.cw-dart-entry>.cw-hint{order:4}.cw-dart-entry>a{order:5}.cw-dart-layout,.cw-tv-layout,.cw-variant{grid-template-columns:1fr}.cw-port-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cw-safe-rooms,.cw-selects{grid-template-columns:1fr}.cw-room{padding-bottom:.5rem;border-bottom:1px solid var(--wp-line)}.cw-room input{max-width:150px}.cw-launch-rows{grid-template-columns:1fr;gap:0}.cw-launch-rows fieldset{margin:.5rem 0}.cw-light-choices{grid-template-columns:repeat(3,minmax(0,1fr))}.cw-light-choices button{padding:.5rem .25rem}.cw-dartboard{max-width:360px}.cw-tv-choices{grid-template-columns:repeat(4,minmax(0,1fr));gap:.4rem}.cw-tv-choices button{padding:.4rem .2rem}.cw-tv-choices svg{height:55px}.cw-tv-choices small{font-size:.67rem}.cw-tv-slots{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){.cw-workspace *{scroll-behavior:auto;transition:none}}
</style>
