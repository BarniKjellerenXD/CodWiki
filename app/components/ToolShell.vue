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
  --bg: #0a0a0c;
  --gold: #f59e0b;
  --amber: #fbbf24;
  --orange: #f97316;
  --line: rgba(255, 255, 255, .14);
  --card-bg: rgba(20, 19, 24, .55);

  box-sizing: border-box;
  background: var(--bg);
  color: #f5f0e6;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 3rem;
  position: relative;
  overflow-x: hidden;
}

.tool-page::before,
.tool-page::after {
  content: "";
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}

.tool-page::before {
  width: 560px;
  height: 560px;
  top: -220px;
  left: -160px;
  background: radial-gradient(circle, rgba(245, 158, 11, .16), transparent 65%);
}

.tool-page::after {
  width: 640px;
  height: 640px;
  bottom: -260px;
  right: -200px;
  background: radial-gradient(circle, rgba(249, 115, 22, .13), transparent 65%);
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
  max-width: 700px;
}

.backlink {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  color: #fcd34d;
  text-decoration: none;
  font-size: .85rem;
  font-weight: 600;
  opacity: .85;
  margin-bottom: 1rem;
  transition: opacity .2s;
}

.backlink:hover {
  opacity: 1;
}

.glass {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  padding: 1.6rem 1.6rem 1.7rem;
  border: 1px solid var(--line);
  background: linear-gradient(155deg, rgba(255, 255, 255, .075), rgba(255, 255, 255, .02) 45%, rgba(0, 0, 0, .18));
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  box-shadow: 0 24px 60px rgba(0, 0, 0, .55), inset 0 1px 0 rgba(255, 255, 255, .10), inset 0 -1px 0 rgba(0, 0, 0, .28);
}

.glass::before {
  content: "";
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(34px);
  opacity: .55;
  width: 300px;
  height: 300px;
  top: -120px;
  left: -100px;
  background: radial-gradient(circle, rgba(245, 158, 11, .28), transparent 65%);
}

.glass::after {
  content: "";
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  border-radius: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .28), transparent);
}

.glass > * {
  position: relative;
  z-index: 1;
}

h1 {
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: .01em;
  display: flex;
  align-items: center;
  gap: .55rem;
  flex-wrap: wrap;
}

h1 .map {
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--gold);
  border: 1px solid rgba(245, 158, 11, .45);
  border-radius: .5rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, .22), transparent);
  padding: .3rem .55rem;
}

.sub {
  margin-top: .5rem;
  font-size: .92rem;
  color: #ffffffb0;
  line-height: 1.55;
}

.sub strong {
  color: #ffe8bf;
}

.howto {
  margin: 1.1rem 0 .4rem;
  border-radius: 1rem;
  padding: .9rem 1.05rem;
  border: 1px solid rgba(255, 255, 255, .12);
  background: rgba(255, 255, 255, .03);
  font-size: .8rem;
  color: #ffffffb3;
  line-height: 1.6;
}

.howto b {
  color: var(--gold);
}

.blocklabel {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin: 1.1rem 0 .45rem;
  font-size: .8rem;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: #ffffffb0;
}

.blocklabel .hint {
  margin-left: auto;
  font-size: .68rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  color: #ffffff77;
}

.btn {
  border: 1px solid rgba(245, 158, 11, .55);
  border-radius: .7rem;
  cursor: pointer;
  font-family: inherit;
  font-size: .85rem;
  font-weight: 800;
  letter-spacing: .02em;
  padding: .55rem 1.1rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, .28), rgba(249, 115, 22, .16));
  color: #ffe8bf;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .35), inset 0 1px 0 rgba(255, 255, 255, .12);
  transition: all .18s;
}

.btn:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, .42), rgba(249, 115, 22, .26));
  transform: translateY(-1px);
}

.btn.ghost {
  border-color: rgba(255, 255, 255, .18);
  background: rgba(255, 255, 255, .05);
  color: #ffffffb0;
}

.btn.ghost:hover {
  background: rgba(255, 255, 255, .10);
  color: #fff;
}

.opts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .7rem;
  flex-wrap: wrap;
  margin-top: 1.1rem;
}

.optbox {
  display: flex;
  align-items: center;
  gap: .45rem;
  font-size: .78rem;
  color: #ffffffb0;
}

.optbox select {
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: .6rem;
  background: rgba(10, 10, 12, .55);
  color: #ffe8bf;
  font-size: .8rem;
  font-weight: 700;
  padding: .4rem .5rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.optbox select:focus {
  border-color: var(--gold);
}

.results {
  display: none;
  margin-top: 1.2rem;
  flex-direction: column;
  gap: .75rem;
}

.results.show {
  display: flex;
}

.sol-head {
  border-radius: 1rem;
  padding: .8rem 1rem;
  border: 1px solid rgba(34, 197, 94, .35);
  background: linear-gradient(135deg, rgba(34, 197, 94, .12), rgba(255, 255, 255, .02));
  font-size: .9rem;
  font-weight: 800;
  color: #bbf7d0;
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
}

.sol-head .meta {
  margin-left: auto;
  font-size: .74rem;
  color: #ffffff99;
  font-weight: 600;
}

.res-card {
  border-radius: 1rem;
  padding: .85rem 1rem 1rem;
  border: 1px solid rgba(245, 158, 11, .28);
  background: linear-gradient(135deg, rgba(245, 158, 11, .09), rgba(255, 255, 255, .02));
}

.res-card h3 {
  font-size: .88rem;
  color: #ffe8bf;
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
  margin-bottom: .55rem;
}

.res-card h3 .kanji {
  color: var(--gold);
  font-size: 1.05rem;
}

.res-card h3 .need {
  margin-left: auto;
  font-size: .74rem;
  color: #ffffff99;
  font-weight: 700;
}

.res-card h3 .need b {
  color: var(--amber);
  font-size: .95rem;
}

.combos {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}

.combo {
  border: 1px solid rgba(245, 158, 11, .4);
  border-radius: .55rem;
  background: rgba(245, 158, 11, .12);
  color: #ffe8bf;
  font-size: .8rem;
  font-weight: 700;
  padding: .3rem .55rem;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
}

.combo.best {
  border-color: var(--gold);
  background: linear-gradient(135deg, rgba(245, 158, 11, .32), rgba(249, 115, 22, .18));
  box-shadow: 0 0 14px rgba(245, 158, 11, .25);
}

.combo .plus {
  color: #ffffff77;
  font-weight: 600;
}

.combo .flags {
  color: #ffffff88;
  font-size: .68rem;
  font-weight: 600;
}

.res-empty {
  font-size: .82rem;
  color: #86efac;
  font-weight: 700;
}

.res-warn {
  font-size: .78rem;
  color: #fca5a5;
  font-weight: 600;
  margin-top: .5rem;
  line-height: 1.5;
}

.unused {
  margin-top: .7rem;
  font-size: .76rem;
  color: #ffffff99;
  font-weight: 600;
}

.unused b {
  color: #ffe8bf;
}

.alts {
  margin-top: .7rem;
  border-top: 1px dashed rgba(255, 255, 255, .14);
  padding-top: .6rem;
}

.alts .alt-title {
  font-size: .72rem;
  font-weight: 800;
  color: #ffffff99;
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: .4rem;
}

.alt {
  font-size: .76rem;
  color: #ffffffb3;
  margin: .2rem 0;
  line-height: 1.5;
}

.alt b {
  color: var(--gold);
}

footer {
  margin-top: 1.4rem;
  font-size: .72rem;
  color: #ffffff66;
  text-align: center;
  line-height: 1.5;
}
</style>

<style>
/* Enter-key friendly number inputs shared across tools */
.tool-page input[type="number"] {
  border: 1px solid rgba(245, 158, 11, .35);
  border-radius: .55rem;
  background: rgba(10, 10, 12, .55);
  color: #ffe8bf;
  font-family: inherit;
  outline: none;
  transition: border-color .18s;
}

.tool-page input[type="number"]:focus {
  border-color: var(--gold);
}
</style>
