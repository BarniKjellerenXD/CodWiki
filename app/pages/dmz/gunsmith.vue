<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzWeapons, weaponClasses, weaponWays, siteTierLists, siteConsensus, weaponById, redditMeta, weaponTips, REDDIT_META, WEAPONS_CHECKED } from '#shared/dmz-weapons.mjs'

// Gunsmith station: what players on r/DMZ call meta, four guide-site tier
// lists for comparison, and how to get guns in DMZ.
const icon = dmzStations.find(station => station.id === 'gunsmith')!.icon
const most = Math.max(1, ...redditMeta.map(row => row.players))
const consensus = siteConsensus()
const shortList = consensus.filter(row => row.average! <= 1)
const showAll = ref(false)
const rows = computed(() => (showAll.value ? consensus : shortList))
const tierName = (list: typeof siteTierLists[number], rank: number | null) => (rank === null ? '' : list.tiers[rank]!.label)
const siteName = (list: typeof siteTierLists[number]) => `${list.site}${list.mode.includes('PvE') ? ' PvE' : ''}`
const siteSources = siteTierLists.map(list => list.source)
const cls = ref('all')
const listed = computed(() => weaponClasses.map(name => ({ name, weapons: dmzWeapons.filter(weapon => weapon.class === name) }))
  .filter(group => group.weapons.length && (cls.value === 'all' || cls.value === group.name)))
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Meta weapons" :icon="icon" :checked="WEAPONS_CHECKED" :status="`${dmzWeapons.length} launch weapons · ${siteTierLists.length} site lists · ${REDDIT_META.threadsRead} Reddit threads read`">
      <p class="dz-lede">What players on r/DMZ recommend, read from threads since early access opened on 20 Oct. Guide-site tier lists sit beside them for comparison. DMZ has its own damage tuning, so Multiplayer lists do not carry over.</p>
    </DmzPageHead>

    <section id="reddit" class="dz-group" aria-labelledby="reddit-title">
      <header class="dz-group-head">
        <h2 id="reddit-title" class="dz-h2">What players use <span class="dmz-mono">r/DMZ</span></h2>
        <p v-if="redditMeta.length">We read {{ REDDIT_META.threadsRead }} threads, about {{ REDDIT_META.comments.toLocaleString('en-GB') }} posts and comments, from {{ Number(REDDIT_META.from.slice(8)) }} to {{ Number(REDDIT_META.to.slice(8)) }} Oct. No meta has formed yet: players mostly asked how to unlock guns, and only these guns got a recommendation. The number is how many separate comments recommend it.</p>
      </header>
      <ol v-if="redditMeta.length" class="gs-meta">
        <li v-for="row in redditMeta" :key="row.weapon">
          <div class="gs-meta-head">
            <span class="gs-meta-name">{{ weaponById(row.weapon)!.name }}</span>
            <span class="gs-meta-class dmz-mono">{{ weaponById(row.weapon)!.class }}</span>
            <span class="gs-meta-n dmz-mono">{{ row.players }} {{ row.players === 1 ? 'comment' : 'comments' }}</span>
          </div>
          <span v-if="most > 1" class="gs-bar" :style="{ width: `${(row.players / most) * 100}%` }" aria-hidden="true" />
          <ul v-if="row.why.length" class="gs-why"><li v-for="why in row.why" :key="why">{{ why }}</li></ul>
        </li>
      </ol>
      <h3 v-if="weaponTips.length" class="gs-sub dmz-mono">Loadout tips from the same threads</h3>
      <ul v-if="weaponTips.length" class="gs-tips">
        <li v-for="tip in weaponTips" :key="tip.say">{{ tip.say }} <span v-if="tip.players > 1" class="gs-tip-n dmz-mono">{{ tip.players }} players</span></li>
      </ul>
      <p v-if="!redditMeta.length" class="gs-pending">Reddit picks are still being gathered. Nothing is shown here until real player comments have been read; the site lists below are not a stand-in for them.</p>
      <DmzGuideSources v-if="redditMeta.length" :ids="[...redditMeta, ...weaponTips].flatMap(row => row.threads)" label="Threads" />
    </section>

    <section id="sites" class="dz-group" aria-labelledby="sites-title">
      <header class="dz-group-head">
        <h2 id="sites-title" class="dz-h2">Guide-site tier lists</h2>
        <p>How four sites ranked DMZ guns on 22 Oct. These are site opinions, not player counts; the first column is each site’s top tier.</p>
      </header>
      <div class="gs-table-wrap" role="region" aria-labelledby="sites-title" tabindex="0">
        <table class="gs-table">
          <thead>
            <tr>
              <th scope="col" class="dmz-mono">Weapon</th>
              <th v-for="list in siteTierLists" :key="list.source + list.mode" scope="col" class="dmz-mono">{{ siteName(list) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.weapon.id">
              <th scope="row"><span>{{ row.weapon.name }}</span><span class="gs-class dmz-mono">{{ row.weapon.class }}</span></th>
              <td v-for="(list, index) in siteTierLists" :key="list.source + list.mode">
                <span v-if="row.ranks[index] !== null" class="gs-tier" :class="`is-${Math.min(row.ranks[index]!, 3)}`">{{ tierName(list, row.ranks[index]!) }}</span>
                <span v-else class="gs-none" aria-label="Not listed">–</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" class="dz-chip gs-more" @click="showAll = !showAll">{{ showAll ? `Show the top ${shortList.length}` : `Show all ${consensus.length} ranked guns` }}</button>
      <DmzGuideSources :ids="siteSources" />
    </section>

    <section id="get" class="dz-group" aria-labelledby="get-title">
      <header class="dz-group-head">
        <h2 id="get-title" class="dz-h2">How to get guns in DMZ</h2>
      </header>
      <ul class="gs-ways">
        <li v-for="way in weaponWays" :key="way.name">
          <h3>{{ way.name }}</h3>
          <p>{{ way.how }}</p>
          <p v-if="way.price" class="gs-price dmz-mono">{{ way.price }}</p>
          <DmzGuideSources :ids="way.sources" />
        </li>
      </ul>
    </section>

    <section id="weapons" class="dz-group" aria-labelledby="weapons-title">
      <header class="dz-group-head">
        <h2 id="weapons-title" class="dz-h2">Launch weapons <span class="dmz-mono">{{ dmzWeapons.length }}</span></h2>
        <p>Gunsmith prices as guides read them from the menu, and the extra ways to get each gun. Every base gun needs its Weapon Manual extracted first.</p>
      </header>
      <div class="dz-chips gs-filter" role="group" aria-label="Weapon class">
        <button type="button" class="dz-chip" :aria-pressed="cls === 'all'" @click="cls = 'all'">All</button>
        <button v-for="name in weaponClasses" :key="name" type="button" class="dz-chip" :aria-pressed="cls === name" @click="cls = name">{{ name }}</button>
      </div>
      <div v-for="group in listed" :key="group.name" class="gs-class-group">
        <h3 class="gs-class-h dmz-mono">{{ group.name }} · {{ group.weapons.length }}</h3>
        <ul class="gs-list">
          <li v-for="weapon in group.weapons" :key="weapon.id">
            <span class="gs-wname">{{ weapon.name }}</span>
            <span v-if="weapon.price" class="gs-price dmz-mono">{{ weapon.price }}</span>
            <p v-if="weapon.get">{{ weapon.get }}</p>
          </li>
        </ul>
      </div>
      <DmzGuideSources :ids="dmzWeapons.flatMap(weapon => weapon.sources)" />
    </section>
  </div>
</template>

<style scoped>
.gs-meta { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.gs-meta > li { padding: 0.75rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 12px; background: rgba(20, 24, 23, 0.8); }
.gs-meta-head { display: flex; align-items: baseline; gap: 0.625rem; }
.gs-meta-name { font-size: 1.125rem; font-weight: 700; color: #f3f1e5; }
.gs-meta-class { font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.gs-meta-n { margin-left: auto; font-size: 0.875rem; white-space: nowrap; font-weight: 700; color: var(--dz-accent); }
.gs-bar { display: block; height: 4px; margin: 0.375rem 0; border-radius: 2px; background: var(--dz-accent); }
.gs-why { margin: 0.375rem 0 0; padding-left: 1.1rem; display: grid; gap: 0.2rem; color: #dcd9cb; font-size: 0.95rem; }
.gs-sub { margin: 1.25rem 0 0.5rem; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.gs-tips { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.375rem; color: #dcd9cb; }
.gs-tip-n { margin-left: 0.25rem; padding: 0.05rem 0.4rem; border-radius: 4px; background: rgba(233, 230, 214, 0.1); font-size: 0.6875rem; color: var(--dz-ink-2); white-space: nowrap; }
.gs-pending { margin: 0; padding: 1rem; border: 1px dashed var(--dz-line-strong); border-radius: 12px; color: var(--dz-muted); }
.gs-table-wrap { overflow-x: auto; border: 1px solid var(--dz-line); border-radius: 14px; background: rgba(14, 16, 15, 0.6); }
.gs-table { width: 100%; min-width: 36rem; border-collapse: collapse; }
.gs-table th, .gs-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--dz-line); text-align: left; }
.gs-table thead th { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.gs-table tbody tr:last-child > * { border-bottom: 0; }
.gs-table tbody th { position: sticky; left: 0; display: flex; flex-direction: column; background: #151918; color: #f3f1e5; font-weight: 600; }
.gs-class { font-size: 0.625rem; font-weight: 400; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.gs-tier { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.8125rem; font-weight: 600; white-space: nowrap; }
.gs-tier.is-0 { background: var(--dz-accent); color: var(--dz-bg); }
.gs-tier.is-1 { background: rgba(221, 179, 99, 0.25); color: #f1dcae; }
.gs-tier.is-2 { background: rgba(233, 230, 214, 0.1); color: var(--dz-ink-2); }
.gs-tier.is-3 { color: var(--dz-muted); }
.gs-none { color: var(--dz-muted); }
.gs-more { margin-top: 0.625rem; }
.gs-ways { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); gap: 0.625rem; }
.gs-ways > li { padding: 0.875rem 1rem 0.25rem; border: 1px solid var(--dz-line); border-radius: 14px; background: rgba(20, 24, 23, 0.8); }
.gs-ways h3 { margin: 0 0 0.25rem; color: #f3f1e5; font-size: 1.05rem; }
.gs-ways p { margin: 0 0 0.375rem; color: #dcd9cb; font-size: 0.95rem; }
.gs-ways .gs-price, .gs-list .gs-price { font-size: 0.75rem; line-height: 1.4; color: var(--dz-accent); }
.gs-filter { margin-bottom: 0.75rem; }
.gs-class-group { margin-bottom: 1rem; }
.gs-class-h { margin: 0 0 0.375rem; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.gs-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 0.375rem; }
.gs-list > li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem 0.625rem; padding: 0.5rem 0.75rem; border: 1px solid var(--dz-line); border-radius: 10px; background: rgba(20, 24, 23, 0.7); }
.gs-wname { font-weight: 600; color: #f3f1e5; }
.gs-list p { flex-basis: 100%; margin: 0; color: #cfccbd; font-size: 0.875rem; }
</style>
