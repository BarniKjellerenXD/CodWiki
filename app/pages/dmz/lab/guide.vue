<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { guideConcepts, guideCriteria, guideScores, guideMix } from '#shared/dmz-guide-lab.mjs'

// The guide concepts side by side, with their scores and the mix that shipped.
const icon = dmzStations.find(station => station.id === 'briefing')!.icon
const rows = [...guideConcepts.map(concept => ({ id: concept.id, tag: concept.letter, name: concept.name, path: concept.path })), { id: guideMix.id, tag: 'Mix', name: guideMix.name, path: guideMix.path }]
const score = (id: string, criterion: string) => (guideScores as Record<string, Record<string, number>>)[id]![criterion]!
const total = (id: string) => guideCriteria.reduce((sum, criterion) => sum + score(id, criterion.id), 0)
const scoreLabel = (value: number) => ['', 'weak', 'fair', 'strong'][value]
const parts = guideMix.parts.map(id => guideConcepts.find(concept => concept.id === id)!)
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Guide concepts" :icon="icon" :status="`${guideConcepts.length} concepts and the mix that shipped · drafts only`">
      <p class="lab-lede">Four ways to lay out one DMZ guide, from your first 1-plate to Ultra armor. Each draft uses the same guide content, so only the layout changes. All four were tested at 1366 px and on a 375 px phone.</p>
    </DmzPageHead>

    <section class="g-rec" aria-labelledby="g-rec">
      <div class="g-rec-main">
        <p class="g-rec-tag dmz-mono"><span>Chosen</span><span>{{ parts.map(part => part.letter).join(' + ') }}</span></p>
        <h2 id="g-rec" class="g-rec-title">{{ guideMix.name }}</h2>
        <p class="g-rec-pitch">{{ guideMix.pitch }}</p>
        <NuxtLink :to="guideMix.path" class="dmz-pill">Open the guide <span aria-hidden="true">→</span></NuxtLink>
      </div>
      <div class="g-rec-why">
        <span class="dmz-label dmz-mono">Why this one</span>
        <ul><li v-for="reason in guideMix.why" :key="reason">{{ reason }}</li></ul>
      </div>
    </section>

    <section class="g-section" aria-labelledby="g-scores">
      <h2 id="g-scores" class="lab-h2">Scores</h2>
      <div class="g-table-wrap" role="region" aria-labelledby="g-scores" tabindex="0">
        <table class="g-table">
          <thead>
            <tr>
              <th scope="col" class="dmz-mono">Concept</th>
              <th v-for="criterion in guideCriteria" :key="criterion.id" scope="col" class="dmz-mono">{{ criterion.label }}</th>
              <th scope="col" class="dmz-mono">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" :class="{ 'is-rec': row.id === guideMix.id }">
              <th scope="row"><NuxtLink :to="row.path"><span class="g-letter dmz-mono">{{ row.tag }}</span>{{ row.name }}</NuxtLink></th>
              <td v-for="criterion in guideCriteria" :key="criterion.id">
                <span class="g-dots" role="img" :aria-label="scoreLabel(score(row.id, criterion.id))"><span v-for="n in 3" :key="n" :class="{ 'is-on': n <= score(row.id, criterion.id) }" /></span>
              </td>
              <td class="g-total dmz-mono">{{ total(row.id) }}<span class="sr-only"> of 18</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="g-key dmz-mono">Three dots is best. For upkeep and build cost, more dots means less work.</p>
    </section>

    <section class="g-section" aria-labelledby="g-options">
      <h2 id="g-options" class="lab-h2">The four concepts</h2>
      <div class="g-grid">
        <article v-for="concept in guideConcepts" :key="concept.id" class="g-card">
          <header class="g-card-head">
            <span class="g-big dmz-mono" aria-hidden="true">{{ concept.letter }}</span>
            <div>
              <h3 class="lab-h3">{{ concept.name }}</h3>
              <p class="g-phone dmz-mono">Phone: {{ concept.phone }}</p>
            </div>
          </header>
          <p class="g-pitch">{{ concept.pitch }}</p>
          <p class="g-best"><span class="dmz-mono">Best for</span>{{ concept.bestFor }}</p>
          <div class="g-pc">
            <div>
              <h4 class="g-pc-h dmz-mono is-pro">Pros</h4>
              <ul><li v-for="item in concept.pros" :key="item">{{ item }}</li></ul>
            </div>
            <div>
              <h4 class="g-pc-h dmz-mono is-con">Cons</h4>
              <ul><li v-for="item in concept.cons" :key="item">{{ item }}</li></ul>
            </div>
          </div>
          <NuxtLink :to="concept.path" class="dmz-pill dmz-pill--ghost g-open">Open concept {{ concept.letter }}<span class="sr-only">: {{ concept.name }}</span> <span aria-hidden="true">→</span></NuxtLink>
        </article>
      </div>
      <p class="g-plan">The plan, the scoring rules and the image shortlist are in <code>docs/mw4-dmz-guide-plan.md</code>.</p>
    </section>
  </div>
</template>

<style scoped>
.g-rec { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 1.5rem 2rem; margin-top: 2rem; padding: 1.5rem; border: 1px solid rgba(169, 217, 138, 0.45); border-radius: 20px; background: linear-gradient(135deg, rgba(169, 217, 138, 0.12), rgba(20, 24, 23, 0.7) 60%); }
.g-rec-main { display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem; }
.g-rec-tag { display: flex; gap: 0.375rem; margin: 0; }
.g-rec-tag span { padding: 0.2rem 0.55rem; border-radius: 4px; background: var(--dz-green); color: var(--dz-bg); font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.g-rec-tag span + span { background: rgba(233, 230, 214, 0.16); color: var(--dz-ink); }
.g-rec-title { margin: 0; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; line-height: 1; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.g-rec-pitch { margin: 0; color: #e3e0d0; font-size: 1.0625rem; }
.g-rec-why ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.5rem; color: #dcd9cb; }
.g-section { margin-top: 2.5rem; }
.g-table-wrap { margin-top: 0.875rem; overflow-x: auto; border: 1px solid var(--dz-line); border-radius: 16px; background: rgba(14, 16, 15, 0.6); }
.g-table { width: 100%; min-width: 48rem; border-collapse: collapse; }
.g-table th, .g-table td { padding: 0.625rem 0.875rem; border-bottom: 1px solid var(--dz-line); text-align: left; vertical-align: middle; }
.g-table thead th { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.g-table tbody tr:last-child > * { border-bottom: 0; }
.g-table tbody th { position: sticky; left: 0; background: #151918; font-weight: 600; white-space: nowrap; }
.g-table tbody th a { display: inline-flex; align-items: center; gap: 0.625rem; min-height: 2.75rem; text-underline-offset: 0.2em; }
.g-table tr.is-rec > * { background: rgba(169, 217, 138, 0.1); }
.g-table tr.is-rec th { background: #1d2620; }
.g-letter { display: inline-grid; place-items: center; min-width: 2.25rem; height: 1.75rem; padding: 0 0.375rem; border: 1px solid var(--dz-line-strong); border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.is-rec .g-letter { background: var(--dz-green); border-color: var(--dz-green); color: var(--dz-bg); }
.g-dots { display: inline-flex; gap: 0.25rem; }
.g-dots span { width: 0.625rem; height: 0.625rem; border-radius: 50%; border: 1.5px solid var(--dz-line-strong); }
.g-dots span.is-on { background: var(--dz-ink); border-color: var(--dz-ink); }
.is-rec .g-dots span.is-on { background: var(--dz-green); border-color: var(--dz-green); }
.g-total { font-size: 0.9375rem; font-weight: 700; color: var(--dz-ink); }
.is-rec .g-total { color: var(--dz-green); }
.g-key { margin: 0.5rem 0 0; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.g-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr)); gap: 0.875rem; margin-top: 0.875rem; }
.g-card { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.125rem 1.25rem 1.25rem; background: rgba(20, 24, 23, 0.82); border: 1px solid var(--dz-line); border-radius: 18px; }
.g-card-head { display: flex; align-items: center; gap: 0.875rem; }
.g-big { flex: none; display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 12px; background: rgba(233, 230, 214, 0.12); font-size: 1.25rem; font-weight: 800; color: var(--dz-ink); }
.g-phone { margin: 0.25rem 0 0; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); }
.g-pitch { margin: 0; color: #e3e0d0; }
.g-best { margin: 0; padding: 0.5rem 0.75rem; border-left: 2px solid var(--dz-line-strong); background: rgba(10, 12, 11, 0.35); color: #dcd9cb; font-size: 0.95rem; }
.g-best .dmz-mono { display: block; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.g-pc { display: grid; gap: 0.75rem; }
.g-pc ul { margin: 0.25rem 0 0; padding-left: 1.1rem; display: grid; gap: 0.25rem; color: #d6d3c4; font-size: 0.925rem; }
.g-pc-h { margin: 0; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.g-pc-h.is-pro { color: var(--dz-green); }
.g-pc-h.is-con { color: #e39a6b; }
.g-open { align-self: flex-start; margin-top: auto; min-height: 2.75rem; font-size: 0.95rem; }
.g-plan { margin: 1.25rem 0 0; color: var(--dz-muted); font-size: 0.925rem; }
.g-plan code { font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace; font-size: 0.85rem; color: var(--dz-ink-2); }
@media (max-width: 899px) {
  .g-rec { grid-template-columns: 1fr; padding: 1.125rem; }
  .g-grid { grid-template-columns: 1fr; }
}
</style>
