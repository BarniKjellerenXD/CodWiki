<template>
  <div class="tool-page">
    <div class="wrap">
      <div class="tool-nav"><NuxtLink class="backlink" :to="returnTo">← Back to the {{ mapName }} guide</NuxtLink><NuxtLink class="backlink" to="/#tools">All tools</NuxtLink></div>

      <div class="glass">
        <h1><span class="map">{{ mapName }}</span> <slot name="title" /></h1>
        <p class="sub"><slot name="sub" /></p>

        <details class="howto"><summary>How to use this tool</summary><slot name="howto" /></details>

        <slot />

        <footer>Selections are saved on this device · {{ mapName }}</footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import catalogue from '~/data/catalogue.json'
const props = defineProps<{
  mapName: string
  backTo: string
}>()
const { run } = useProgress()
const route = useRoute()
const toolTitle = catalogue.tools.find(tool => tool.route === route.path.replace(/\/$/, ''))?.name || 'Puzzle tool'
useSeoMeta({ title: `${toolTitle} · ${props.mapName} · CodWiki` })
const returnTo = computed(() => {
  const id = props.backTo.split('/').pop()!
  const section = run(id).section
  return props.backTo + (section ? '#' + encodeURIComponent(section) : '')
})
</script>

<style>
/* Unscoped: slot content belongs to page scope, so shared tool styles
   must not carry ToolShell's scope attribute. Everything is namespaced
   under .tool-page to avoid leaking into guides. */
.tool-page {
  --bg: var(--wp-bg);
  --surface: var(--wp-surface);
  --surface-2: var(--wp-surface-2);
  --surface-3: var(--wp-surface-3);
  --line: var(--wp-line);
  --line-strong: var(--wp-line-strong);
  --gold: var(--wp-gold);
  --gold-bright: var(--wp-gold-bright);
  --gold-dim: var(--wp-gold-dim);
  --gold-border: var(--wp-gold-border);
  --on-gold: var(--wp-on-gold);
  --amber: var(--wp-gold-bright);
  --orange: var(--wp-orange);
  --text: var(--wp-text);
  --muted: var(--wp-muted);
  --faint: var(--wp-faint);

  box-sizing: border-box;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.25rem 4rem;
}

/* Soft top glow retained, but flat and subtle instead of a blurred blob. */
.tool-page::before {
  content: "";
  position: fixed;
  inset: 0 0 auto 0;
  height: 420px;
  pointer-events: none;
  background: radial-gradient(900px 420px at 50% -260px, var(--bg-accent), transparent 70%);
}

.tool-page *,
.tool-page *::before,
.tool-page *::after {
  box-sizing: border-box;
}

.tool-page > * {
  margin: 0;
  padding: 0;
}

.tool-page .wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 46rem;
}

.tool-page .backlink {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  color: var(--muted);
  text-decoration: none;
  font-size: .85rem;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: color .2s;
}

.tool-page .backlink:hover {
  color: var(--gold-bright);
}

.tool-page .glass {
  position: relative;
  border-radius: 18px;
  padding: 1.8rem 1.9rem 2rem;
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.tool-page .glass > * {
  position: relative;
  z-index: 1;
}

.tool-page h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: .6rem;
  flex-wrap: wrap;
}

.tool-page h1 .map {
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--gold);
  border: 1px solid var(--gold-border);
  border-radius: 7px;
  background: var(--gold-dim);
  padding: .32rem .6rem;
}

.tool-page .sub {
  margin-top: .6rem;
  font-size: .98rem;
  color: var(--muted);
  line-height: 1.6;
}

.tool-page .sub strong {
  color: #f0e6d3;
  font-weight: 650;
}

.tool-page .howto {
  margin: 1.25rem 0 .5rem;
  border-radius: 10px;
  padding: .95rem 1.15rem;
  border: 1px solid var(--line);
  border-left: 3px solid var(--gold);
  background: var(--surface-2);
  font-size: .86rem;
  color: var(--muted);
  line-height: 1.65;
}

.tool-page .howto b {
  color: var(--gold-bright);
}

.tool-page .blocklabel {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin: 1.35rem 0 .6rem;
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--muted);
}

.tool-page .blocklabel .hint {
  margin-left: auto;
  font-size: .72rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  color: var(--faint);
}

.tool-page .btn {
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  font-size: .86rem;
  font-weight: 650;
  letter-spacing: .01em;
  padding: .6rem 1.15rem;
  background: var(--gold);
  color: var(--on-gold);
  transition: background-color .15s ease, border-color .15s ease, color .15s ease;
}

.tool-page .btn:hover {
  background: var(--gold-bright);
}

.tool-page .btn.ghost {
  border-color: var(--line);
  background: var(--surface-2);
  color: var(--text);
}

.tool-page .btn.ghost:hover {
  background: var(--surface-3);
  border-color: var(--line-strong);
}

.tool-page .opts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .7rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
}

.tool-page .optbox {
  display: flex;
  align-items: center;
  gap: .45rem;
  font-size: .82rem;
  color: var(--muted);
}

.tool-page .optbox select {
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--bg);
  color: var(--text);
  font-size: .84rem;
  font-weight: 600;
  padding: .45rem .55rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.tool-page .optbox select:focus {
  border-color: var(--gold-border);
}

.tool-page .results {
  display: none;
  margin-top: 1.4rem;
  flex-direction: column;
  gap: .85rem;
}

.tool-page .results.show {
  display: flex;
}

.tool-page .sol-head {
  border-radius: 10px;
  padding: .85rem 1.05rem;
  border: 1px solid rgba(127, 180, 122, .4);
  border-left: 3px solid #7fb47a;
  background: rgba(127, 180, 122, .1);
  font-size: .92rem;
  font-weight: 650;
  color: #c5e0c1;
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
}

.tool-page .sol-head .meta {
  margin-left: auto;
  font-size: .78rem;
  color: var(--muted);
  font-weight: 500;
}

.tool-page .res-card {
  border-radius: 12px;
  padding: .9rem 1.05rem 1.1rem;
  border: 1px solid var(--line);
  border-left: 3px solid var(--gold);
  background: var(--surface-2);
}

.tool-page .res-card h3 {
  font-size: .92rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
  margin-bottom: .65rem;
}

.tool-page .res-card h3 .kanji {
  color: var(--gold);
  font-size: 1.05rem;
}

.tool-page .res-card h3 .need {
  margin-left: auto;
  font-size: .78rem;
  color: var(--muted);
  font-weight: 600;
}

.tool-page .res-card h3 .need b {
  color: var(--gold-bright);
  font-size: .95rem;
}

.tool-page .combos {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
}

.tool-page .combo {
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  background: var(--surface-3);
  color: var(--text);
  font-size: .84rem;
  font-weight: 600;
  padding: .35rem .6rem;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
}

.tool-page .combo.best {
  border-color: var(--gold);
  background: var(--gold-dim);
  color: #f0d9a8;
}

.tool-page .combo .plus {
  color: var(--faint);
  font-weight: 500;
}

.tool-page .combo .flags {
  color: var(--faint);
  font-size: .72rem;
  font-weight: 500;
}

.tool-page .res-empty {
  font-size: .86rem;
  color: #c5e0c1;
  font-weight: 650;
}

.tool-page .res-warn {
  font-size: .82rem;
  color: #e0a99f;
  font-weight: 500;
  margin-top: .55rem;
  line-height: 1.6;
}

.tool-page .unused {
  margin-top: .8rem;
  font-size: .8rem;
  color: var(--muted);
  font-weight: 500;
}

.tool-page .unused b {
  color: #f0e6d3;
}

.tool-page .alts {
  margin-top: .8rem;
  border-top: 1px solid var(--line);
  padding-top: .7rem;
}

.tool-page .alts .alt-title {
  font-size: .72rem;
  font-weight: 700;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: .45rem;
}

.tool-page .alt {
  font-size: .8rem;
  color: var(--muted);
  margin: .25rem 0;
  line-height: 1.6;
}

.tool-page .alt b {
  color: var(--gold-bright);
}

.tool-page footer {
  margin-top: 1.6rem;
  font-size: .74rem;
  color: var(--faint);
  text-align: center;
  line-height: 1.6;
}

@media (max-width: 560px) {
  .tool-page {
    padding: 1.5rem .9rem 3rem;
  }

  .tool-page .glass {
    padding: 1.3rem 1.15rem 1.5rem;
  }
}
</style>

<style>
/* Enter-key friendly number inputs shared across tools */
.tool-page input[type="number"] {
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  outline: none;
  transition: border-color .15s ease;
}

.tool-page input[type="number"]:focus {
  border-color: var(--gold-border);
}
</style>
