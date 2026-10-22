<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { hajinPins, hajinReports, HAJIN_MAP_CHECKED } from '#shared/dmz-map.mjs'
const route = useRoute()
const icon = dmzStations.find(station => station.id === 'deploy')!.icon
const pad = (n: number) => String(n).padStart(2, '0')
const pois = hajinPins.filter(pin => pin.layer === 'poi')
const count = (layers: string[]) => hajinPins.filter(pin => layers.includes(pin.layer)).length
const status = `${pois.length} major locations · ${hajinPins.length} official markers · ${hajinReports.length} reported sites`

// A pin link on this page keeps the #map hash, so the router does not scroll; do it here.
function revealMap() {
  nextTick(() => document.getElementById('map')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }))
}
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Hajin Exclusion Zone" :icon="icon" :status="status" :checked="HAJIN_MAP_CHECKED" />

    <section class="dmz-section">
      <p class="hz-lede">Hajin is the only DMZ map at launch. It spans former North and South Korean territory and is set after the campaign story. The Russian border area is fogged off for now and opens in a later season.</p>
    </section>

    <section id="map" class="dmz-section" aria-labelledby="map-title">
      <h2 id="map-title">Tac-Map</h2>
      <p>Official markers sit where Activision's own interactive map puts them. Gold badges count the key rooms, bosses, exfils and other sites that guides and players report at each place. Search a key card's square, such as H6, to see everything in it. Switch to Threat to see how dangerous each part of a location is.</p>
      <ClientOnly>
        <DmzTacMap />
        <template #fallback><div class="hz-map-wait dmz-mono">Loading the Tac-Map…</div></template>
      </ClientOnly>
    </section>

    <section id="pois" class="dmz-section" aria-labelledby="pois-title">
      <h2 id="pois-title">Points of interest</h2>
      <ol class="hz-pois">
        <li v-for="(poi, index) in pois" :key="poi.id">
          <NuxtLink :to="{ query: { ...route.query, pin: poi.id }, hash: '#map' }" :data-threat="poi.threat?.toLowerCase()" @click="revealMap">
            <span class="hz-diamond" aria-hidden="true" />
            <span class="hz-index dmz-mono" aria-hidden="true">{{ pad(index + 1) }}</span>
            <span class="hz-name w-semi">{{ poi.name }}</span>
            <span class="hz-where dmz-mono">{{ poi.square }}<template v-if="poi.threat"> · {{ poi.threat }}</template></span>
          </NuxtLink>
        </li>
      </ol>
      <p class="hz-small">Cheongun Village is the casino district. The Tac-Map also names {{ count(['area']) }} smaller places, {{ count(['compound']) }} compounds and {{ count(['fortress']) }} fortresses. Threat is the highest rating the Deep Dive gives any part of the location.</p>
    </section>

    <section id="threat" class="dmz-section" aria-labelledby="threat-title">
      <h2 id="threat-title">Threat ratings</h2>
      <div class="hz-threat" aria-hidden="true"><span class="dmz-mono">Low</span><span class="hz-threat-bar" /><span class="dmz-mono">Extreme</span></div>
      <p>Every area is rated from Low to Extreme. The AI also escalates as your own threat level rises, bringing in heavier units such as Juggernauts, tanks, drone swarms, Elite Strike Teams and Deathstalker drones.</p>
      <p><NuxtLink class="hz-threat-link" :to="{ query: { ...route.query, view: 'threat' }, hash: '#map' }" @click="revealMap">See the ratings as zones on the Tac-Map →</NuxtLink></p>
    </section>

    <section id="ground" class="dmz-section" aria-labelledby="ground-title">
      <h2 id="ground-title">On the ground</h2>
      <ul class="hz-facts">
        <li><strong>Weather.</strong> Rain and fog roll through the map.</li>
        <li><strong>Fallout zones.</strong> You need a gas mask to cross them.</li>
        <li><strong>Vehicles.</strong> They run on fuel. Gas stations refuel and repair them.</li>
        <li><strong>Train and tram.</strong> An automated train and tram run across Hajin.</li>
        <li><strong>Traffic.</strong> Enemy convoys and aircraft move around the map, and Lieutenants and Commanders roam it.</li>
      </ul>
      <p class="hz-small">Hajin also comes to Warzone in Season 1.</p>
    </section>

    <DmzSources />
  </div>
</template>

<style scoped>
.hz-lede { font-size: 1.1875rem !important; color: var(--dz-ink) !important; }
.hz-map-wait { display: grid; place-items: center; height: clamp(26rem, 72svh, 42rem); border: 1px solid var(--dz-line-strong); border-radius: 18px; background: #0b0d0c; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.hz-pois { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem; }
.hz-pois a { display: flex; align-items: center; gap: 0.75rem; min-height: 3.25rem; height: 100%; padding: 0.5rem 1rem; background: rgba(22, 26, 25, 0.55); border: 1px solid var(--dz-line); color: inherit; text-decoration: none; }
.hz-pois a:hover { border-color: var(--dz-line-strong); background: rgba(233, 230, 214, 0.08); }
.hz-pois a:focus-visible { outline: 2px solid var(--dz-ink); outline-offset: 2px; }
.hz-pois [data-threat='low'] { --hz-t: #a9b39a; }
.hz-pois [data-threat='medium'] { --hz-t: #d8c47c; }
.hz-pois [data-threat='high'] { --hz-t: #e8a04f; }
.hz-pois [data-threat='critical'] { --hz-t: #ef7a5a; }
.hz-pois [data-threat='extreme'] { --hz-t: #ff5468; }
.hz-diamond { flex: none; width: 0.625rem; height: 0.625rem; transform: rotate(45deg); border: 1.5px solid var(--hz-t, var(--dz-teal)); }
.hz-index { flex: none; font-size: 0.75rem; color: var(--dz-muted); }
.hz-name { flex: 1; font-size: 1.1875rem !important; font-weight: 600; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.03em; color: var(--dz-ink) !important; }
.hz-where { flex: none; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--hz-t, var(--dz-muted)); }
.hz-small { margin-top: 0.875rem !important; font-size: 0.95rem !important; color: var(--dz-muted) !important; }
.hz-threat { display: flex; align-items: center; gap: 0.875rem; max-width: 34rem; margin-bottom: 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--dz-muted); }
.hz-threat-link { color: var(--dz-ink); font-weight: 600; text-underline-offset: 0.2em; }
.hz-threat-bar { flex: 1; height: 0.5rem; background: linear-gradient(90deg, #a9b39a, #d8c47c 30%, #e8a04f 55%, #ef7a5a 78%, #ff5468); }
.hz-facts { margin: 0; padding: 0; list-style: none; display: grid; gap: 0.5rem; max-width: 46rem; }
.hz-facts li { padding: 0.75rem 1rem; border-left: 2px solid var(--dz-line-strong); background: rgba(22, 26, 25, 0.4); }
.hz-facts strong { color: var(--dz-ink); }
</style>
