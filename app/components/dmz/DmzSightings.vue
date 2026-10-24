<script setup lang="ts">
import { LEGEND, SIGHTINGS_CHECKED, VIDEO_CAP, anySource, countLabel, groupRows, rowConfidence, rowTarget, sightingsStale, sourcesSummary, topRows, videoUrl } from '#shared/dmz-sightings.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { intelEntry, layerLink, placeLink } from '#shared/dmz-stations.mjs'

// Kept loose so rows written in the .mjs data fit: there kind is a plain string.
type VideoRef = { id: string, at?: string, why: string, shows?: boolean }
type Row = {
  kind?: string, report?: string, pin?: string, layer?: string, where: string, square?: string, search?: string,
  mission?: string, seen?: number, sources?: string[], claims?: { text: string, checked?: boolean }[],
  disputed?: string, note?: string, videos?: VideoRef[], rank?: string, words?: string | null, chance?: boolean,
}
type Target = { pin?: string, layer?: string } | null

// Where players met a boss or found a recipe, counted per place: story missions
// apart from free roam, ranked places, rows with no place written down, and
// places only named on lists. Under each row sit its unchecked claims, videos
// and a sources fold with the totals and confidence. compact is a card's
// plain-text top three, with no folds.
const props = withDefaults(defineProps<{ rows: Row[], unit?: 'report' | 'find', compact?: boolean }>(), { unit: 'report', compact: false })
const uid = useId()
const stale = sightingsStale()
const SHORT_LEGEND = { report: 'Report counts, not spawn rates', find: 'Find counts, not drop rates' }
const KIND_TAG: Record<string, string> = { mission: 'Story mission', scripted: 'Scripted' }
const groups = computed(() => groupRows(props.rows, props.unit))

// '2=' reads aloud as "Rank 2, joint" rather than "2 equals".
const rankText = (rank: string) => `Rank ${rank.replace('=', '')}${rank.endsWith('=') ? ', joint' : ''}`
const missionName = (row: Row) => (row.mission && intelEntry(row.mission)?.name) || ''
const site = (url: string) => new URL(url).hostname.replace(/^www\./, '')
function linkTo(row: Row) {
  const target = rowTarget(row) as Target
  return target?.pin ? placeLink(target.pin) : target?.layer ? layerLink(target.layer) : null
}
function decorate(row: Row) {
  const videos = (row.videos || [])
    .map(video => ({ ...video, label: anySource(video.id)?.label as string | undefined, href: videoUrl(video.id, video.at) as string | undefined }))
    .filter(video => video.href)
  return {
    ...row,
    to: linkTo(row),
    missionName: missionName(row),
    watch: videos.slice(0, VIDEO_CAP),
    watchMore: videos.slice(VIDEO_CAP),
    sourceList: [...new Set(row.sources || [])].map(id => ({ id, ...anySource(id) })).filter(source => source.url),
    confidence: rowConfidence(row) as string,
  }
}
const sections = computed(() => {
  const { mission, seen, unplaced, listed } = groups.value
  const list = props.compact
    ? [seen.length ? { key: 'top', label: 'Top places', rows: topRows(props.rows, 3, props.unit) } : { key: 'listed', label: 'Named on lists only', rows: listed }]
    : [
        { key: 'mission', label: 'Story missions', rows: mission },
        { key: 'seen', label: props.unit === 'find' ? 'Places' : 'Free roam', rows: seen },
        { key: 'unplaced', label: 'Place not written down', rows: unplaced },
        { key: 'listed', label: 'Named on lists only', rows: listed },
      ]
  return list.filter(section => section.rows.length).map(section => ({ ...section, rows: (section.rows as Row[]).map(decorate) }))
})
</script>

<template>
  <div class="sg" :class="{ 'sg--compact': compact }">
    <p class="sg-legend" :class="{ 'dmz-mono': compact }">{{ compact ? SHORT_LEGEND[unit] : `${LEGEND[unit]} Checked ${SIGHTINGS_CHECKED}` }}</p>
    <p v-if="stale" class="sg-stale">{{ stale }}</p>
    <p v-if="compact && groups.mission.length" class="sg-missions"><span class="sg-key dmz-mono">Story missions:</span> <template v-for="(row, index) in groups.mission" :key="`${row.mission}-${row.where}`"><template v-if="index"> · </template><DmzIntelLink v-if="missionName(row)" :id="row.mission!" class="sg-intel">{{ missionName(row).replace(/^Operation /, '') }}</DmzIntelLink><template v-else>{{ row.where }}</template></template></p>
    <div v-for="section in sections" :key="section.key" class="sg-group">
      <p :id="`${uid}-${section.key}`" class="sg-label dmz-mono" :class="{ 'sr-only': compact }">{{ section.label }}</p>
      <ul class="sg-list" :aria-labelledby="`${uid}-${section.key}`">
        <li v-for="row in section.rows" :key="`${row.kind}-${row.report || row.pin || row.layer || ''}-${row.where}`" class="sg-row" :class="`is-${row.kind || 'seen'}`">
          <p class="sg-face"><span v-if="row.rank" class="sg-rank dmz-mono"><span aria-hidden="true">{{ row.rank }}</span><span class="sr-only">{{ rankText(row.rank) }}</span></span><span v-else-if="row.kind && KIND_TAG[row.kind]" class="sg-kind dmz-mono">{{ KIND_TAG[row.kind] }}</span> <NuxtLink v-if="row.to" :to="row.to" class="sg-place">{{ row.where }}</NuxtLink><span v-else class="sg-place">{{ row.where }}</span> <span v-if="row.square" class="sg-square dmz-mono">{{ row.square }}</span> <span v-if="row.seen" class="sg-count">· {{ countLabel(row.seen, unit) }}</span> <span v-if="row.words" class="sg-words dmz-mono">{{ row.words }}</span> <span v-if="row.chance" class="sg-chance dmz-mono">Could be chance</span></p>
          <template v-if="!compact">
            <p v-if="row.missionName" class="sg-line"><span class="sg-key dmz-mono">Mission</span> <DmzIntelLink :id="row.mission!" class="sg-intel">{{ row.missionName }}</DmzIntelLink></p>
            <p v-if="row.search" class="sg-line"><span class="sg-key dmz-mono">Search</span> {{ row.search }}</p>
            <p v-for="claim in row.claims || []" :key="claim.text" class="sg-line">{{ claim.text }} <span class="sg-tag dmz-mono">Not checked</span></p>
            <p v-if="row.disputed" class="sg-line"><span class="sg-tag is-disputed dmz-mono">Disputed</span> {{ row.disputed }}</p>
          </template>
          <p v-if="row.note && (!compact || row.kind === 'listed')" class="sg-note">{{ row.note }}</p>
          <template v-if="!compact">
            <div v-if="row.watch.length" class="sg-watch">
              <span class="sg-key dmz-mono">Watch it done</span>
              <ul>
                <li v-for="video in row.watch" :key="`${video.id}-${video.at || ''}`"><a :href="video.href" target="_blank" rel="noopener noreferrer">{{ video.label }}<span class="sr-only"> (opens in a new tab)</span></a><span v-if="video.at" class="sg-at dmz-mono"> · from {{ video.at }}</span> <span class="sg-why">{{ video.why }}</span></li>
              </ul>
              <details v-if="row.watchMore.length" class="sg-fold">
                <summary class="dmz-mono">{{ row.watchMore.length }} more<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
                <ul>
                  <li v-for="video in row.watchMore" :key="`${video.id}-${video.at || ''}`"><a :href="video.href" target="_blank" rel="noopener noreferrer">{{ video.label }}<span class="sr-only"> (opens in a new tab)</span></a><span v-if="video.at" class="sg-at dmz-mono"> · from {{ video.at }}</span> <span class="sg-why">{{ video.why }}</span></li>
                </ul>
              </details>
            </div>
            <details v-if="row.sourceList.length" class="sg-fold sg-src">
              <summary class="dmz-mono"><span>Sources · {{ sourcesSummary(row.sources) }} ·</span> <span class="dz-badge" :class="`is-${row.confidence}`">{{ intelConfidenceLabel(row.confidence) }}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></summary>
              <ul>
                <li v-for="source in row.sourceList" :key="source.id"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }}<span class="sr-only"> (opens in a new tab)</span></a> <span class="dmz-mono">{{ site(source.url) }}</span></li>
              </ul>
            </details>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.sg { display: grid; gap: 0.625rem; min-width: 0; }
.sg-legend { margin: 0; color: var(--dz-muted); font-size: 0.8125rem; line-height: 1.4; }
.sg-legend.dmz-mono { font-size: 0.625rem; letter-spacing: 0.08em; text-transform: uppercase; }
.sg-stale { margin: 0; padding: 0.375rem 0.625rem; border-left: 2px solid var(--dz-accent); background: rgba(221, 179, 99, 0.08); color: #e7dcc2; font-size: 0.8125rem; }
.sg-missions { margin: 0; color: #dcd9cb; font-size: 0.9375rem; overflow-wrap: anywhere; }
.sg-group { display: grid; gap: 0.25rem; min-width: 0; }
.sg-label { margin: 0; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.sg-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.sg-row { --sg-c: var(--dz-teal); display: grid; gap: 0.125rem; min-width: 0; padding: 0.125rem 0.75rem 0.375rem; border-left: 2px solid var(--sg-c); background: rgba(11, 13, 12, 0.5); color: #dcd9cb; font-size: 0.9375rem; }
.sg-row.is-mission, .sg-row.is-scripted { --sg-c: var(--dz-accent); }
.sg-row.is-unplaced { --sg-c: var(--dz-line-strong); }
.sg-row.is-listed { --sg-c: var(--dz-line-strong); border-left-style: dashed; }
.sg--compact .sg-row { padding-bottom: 0.125rem; }
.sg-face { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 0 0.5rem; min-width: 0; font-size: 0.9375rem; line-height: 1.35; }
.sg-rank { min-width: 1.5rem; font-size: 0.75rem; font-weight: 700; color: var(--sg-c); }
.sg-place { display: inline-flex; align-items: center; min-height: 2.75rem; min-width: 0; overflow-wrap: anywhere; font-weight: 700; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.sg-square { font-size: 0.6875rem; color: var(--dz-muted); }
.sg-count { white-space: nowrap; font-weight: 600; color: var(--dz-ink); }
.sg-kind, .sg-words, .sg-chance, .sg-tag { display: inline-flex; align-items: center; padding: 0.1rem 0.45rem; border: 1px solid currentColor; border-radius: 4px; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; vertical-align: 0.1em; }
.sg-kind { color: var(--dz-accent); }
.sg-words { border-radius: 999px; color: var(--dz-green); }
.sg-chance, .sg-tag { border-style: dashed; font-weight: 600; color: var(--dz-muted); }
.sg-tag.is-disputed { border-style: solid; color: #ef7a5a; }
.sg-line, .sg-note { margin: 0; font-size: 0.875rem; line-height: 1.45; overflow-wrap: anywhere; }
.sg-line { color: #dcd9cb; }
.sg-note { color: var(--dz-muted); }
.sg-key { margin-right: 0.25rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.sg-intel { display: inline-flex; align-items: center; min-height: 2.75rem; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.sg-watch ul, .sg-fold ul { margin: 0; padding-left: 1.1rem; }
.sg-watch li, .sg-fold li { margin: 0; color: #dcd9cb; font-size: 0.875rem; line-height: 1.4; overflow-wrap: anywhere; }
.sg-watch a, .sg-fold a { display: inline-flex; align-items: center; min-height: 2.75rem; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.sg-at { font-size: 0.6875rem; color: var(--dz-muted); }
.sg-why { display: block; padding-bottom: 0.25rem; color: var(--dz-muted); font-size: 0.8125rem; }
.sg-fold summary { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.5rem; min-height: 2.75rem; cursor: pointer; list-style: none; font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.sg-fold summary::-webkit-details-marker { display: none; }
.sg-fold summary:hover { color: var(--dz-ink); }
.sg-fold summary svg { flex: none; width: 0.875rem; height: 0.875rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.15s; }
.sg-fold[open] > summary svg { transform: rotate(180deg); }
.sg-src li .dmz-mono { font-size: 0.6875rem; color: var(--dz-muted); }
@media (prefers-reduced-motion: reduce) { .sg-fold summary svg { transition: none; } }
</style>
