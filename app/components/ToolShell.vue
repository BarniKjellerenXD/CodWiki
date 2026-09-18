<template>
  <div class="tool-page">
    <div class="wrap">
      <NuxtLink class="backlink" :to="backTo">← Back to the {{ mapName }} guide</NuxtLink>

      <div class="glass">
        <h1><span class="map">{{ mapName }}</span> <slot name="title" /></h1>
        <p class="sub"><slot name="sub" /></p>

        <div class="howto">
          <slot name="howto" />
        </div>

        <slot />

        <footer>{{ mapName }} guide tool · codguides.wolden.eu</footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mapName: string
  backTo: string
}>()
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

.wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 46rem;
}

.backlink {
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

.backlink:hover {
  color: var(--gold-bright);
}

.glass {
  position: relative;
  border-radius: 18px;
  padding: 1.8rem 1.9rem 2rem;
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.glass > * {
  position: relative;
  z-index: 1;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: .6rem;
  flex-wrap: wrap;
}

h1 .map {
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

.sub {
  margin-top: .6rem;
  font-size: .98rem;
  color: var(--muted);
  line-height: 1.6;
}

.sub strong {
  color: #f0e6d3;
  font-weight: 650;
}

.howto {
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

.howto b {
  color: var(--gold-bright);
}

.blocklabel {
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

.blocklabel .hint {
  margin-left: auto;
  font-size: .72rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  color: var(--faint);
}

.btn {
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

.btn:hover {
  background: var(--gold-bright);
}

.btn.ghost {
  border-color: var(--line);
  background: var(--surface-2);
  color: var(--text);
}

.btn.ghost:hover {
  background: var(--surface-3);
  border-color: var(--line-strong);
}

.opts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .7rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
}

.optbox {
  display: flex;
  align-items: center;
  gap: .45rem;
  font-size: .82rem;
  color: var(--muted);
}

.optbox select {
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

.optbox select:focus {
  border-color: var(--gold-border);
}

.results {
  display: none;
  margin-top: 1.4rem;
  flex-direction: column;
  gap: .85rem;
}

.results.show {
  display: flex;
}

.sol-head {
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

.sol-head .meta {
  margin-left: auto;
  font-size: .78rem;
  color: var(--muted);
  font-weight: 500;
}

.res-card {
  border-radius: 12px;
  padding: .9rem 1.05rem 1.1rem;
  border: 1px solid var(--line);
  border-left: 3px solid var(--gold);
  background: var(--surface-2);
}

.res-card h3 {
  font-size: .92rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
  margin-bottom: .65rem;
}

.res-card h3 .kanji {
  color: var(--gold);
  font-size: 1.05rem;
}

.res-card h3 .need {
  margin-left: auto;
  font-size: .78rem;
  color: var(--muted);
  font-weight: 600;
}

.res-card h3 .need b {
  color: var(--gold-bright);
  font-size: .95rem;
}

.combos {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
}

.combo {
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

.combo.best {
  border-color: var(--gold);
  background: var(--gold-dim);
  color: #f0d9a8;
}

.combo .plus {
  color: var(--faint);
  font-weight: 500;
}

.combo .flags {
  color: var(--faint);
  font-size: .72rem;
  font-weight: 500;
}

.res-empty {
  font-size: .86rem;
  color: #c5e0c1;
  font-weight: 650;
}

.res-warn {
  font-size: .82rem;
  color: #e0a99f;
  font-weight: 500;
  margin-top: .55rem;
  line-height: 1.6;
}

.unused {
  margin-top: .8rem;
  font-size: .8rem;
  color: var(--muted);
  font-weight: 500;
}

.unused b {
  color: #f0e6d3;
}

.alts {
  margin-top: .8rem;
  border-top: 1px solid var(--line);
  padding-top: .7rem;
}

.alts .alt-title {
  font-size: .72rem;
  font-weight: 700;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: .45rem;
}

.alt {
  font-size: .8rem;
  color: var(--muted);
  margin: .25rem 0;
  line-height: 1.6;
}

.alt b {
  color: var(--gold-bright);
}

footer {
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

  .glass {
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
