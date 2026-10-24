<script setup lang="ts">
import { dmzBriefingSections, dmzStations } from '#shared/dmz.mjs'
const icon = dmzStations.find(station => station.id === 'briefing')!.icon
const title = (id: string) => dmzBriefingSections.find(section => section.id === id)!.title
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="How DMZ works" :icon="icon" status="Early-access briefing · details may change after launch" />

    <nav class="br-contents" aria-label="On this page">
      <a v-for="section in dmzBriefingSections" :key="section.id" :href="`#${section.id}`" class="w-semi">{{ section.title }}</a>
    </nav>

    <section id="overview" class="dmz-section">
      <h2>{{ title('overview') }}</h2>
      <p>DMZ is the extraction mode included with Modern Warfare 4. It is a core mode, not a free-to-play release, a beta or part of Warzone. You deploy into the <DmzIntelLink id="hajin-exclusion-zone">Hajin Exclusion Zone</DmzIntelLink> with your squad, take on objectives and extract with what you find. Between deployments you return to your Forward Operating Base (FOB).</p>
      <p>DMZ runs on PS5, Xbox Series X|S and PC (Battle.net, Steam and the Xbox app). A Nintendo Switch 2 version is announced, but its date is unclear. There is no PS4 or Xbox One version.</p>
      <p>Once you know the basics, the Guide station says what to do next at each stage of the game: early, mid and late.</p>
    </section>

    <section id="lobbies" class="dmz-section">
      <h2>{{ title('lobbies') }}</h2>
      <p>Each match holds up to 60 players: 20 squads of up to 3. Matchmaking tries to pair squads of the same size, and solo players get a Stealth Meter. Proximity chat is on, so nearby squads can hear you.</p>
      <p>The AI enemy is North Korean forces. There are no player factions. Your stash persists between matches and no hard wipes are planned; Operators can be retired or prestiged instead.</p>
    </section>

    <section id="fob" class="dmz-section">
      <h2>{{ title('fob') }}</h2>
      <p>The FOB is the hub you walk around before and after each extraction. It is organised as stations and grows to more than a dozen as you level up.</p>
      <p>The first stations are Deploy, Operators (Active Duty), Stash and Loadout, DMZ Orders, the Firing Range and Survival Kits. Later stations unlock with your DMZ level: the 3D Printer at level 2, the Vendor at 5, the Gunsmith at 10 and the Dog Tag Case at 20. The Boss Board opens once you finish your second page of DMZ Orders.</p>
    </section>

    <section id="operators" class="dmz-section">
      <h2>{{ title('operators') }}</h2>
      <p>Each Active Duty Operator carries their own backpack and loadout. You start with 2 Active Duty slots. A 3rd unlocks through DMZ level, and the Vault Edition starts with 3.</p>
      <p>An Operator who dies goes MIA. You can recover them for DMZ Cash, but they come back without their gear.</p>
      <dl class="br-facts">
        <div><dt class="dmz-mono">Dog Tags</dt><dd>18 levels, from Steel to Onyx III. Each level gives 1 trait point.</dd></div>
        <div><dt class="dmz-mono">Trait trees</dt><dd>Warfighter, Scout and Survivalist.</dd></div>
        <div><dt class="dmz-mono">Prestige</dt><dd>Operator Prestige grants permanent Prestige Traits.</dd></div>
        <div><dt class="dmz-mono">DMZ level</dt><dd>1 to 70. The After Action Report rates each run.</dd></div>
      </dl>
    </section>

    <section id="missions" class="dmz-section">
      <h2>{{ title('missions') }}</h2>
      <p>There are no faction contracts like the 2022 DMZ. Instead, objectives come in these kinds:</p>
      <dl class="br-facts">
        <div><dt class="dmz-mono">DMZ Orders</dt><dd>Structured directives you pick up at the FOB (<DmzIntelLink id="dmz-orders">how they work</DmzIntelLink>). Tick off their tasks on the DMZ Orders station.</dd></div>
        <div><dt class="dmz-mono">Story Missions</dt><dd>Replayable missions played in shared servers.</dd></div>
        <div><dt class="dmz-mono">Dynamic Ops</dt><dd>Multi-step objectives that appear during a match. They pay $10,000–20,000 plus a supply drop.</dd></div>
        <div><dt class="dmz-mono">Side Ops · Free Roam</dt><dd>Also listed in the official how-to-play guide. Details are still thin.</dd></div>
      </dl>
    </section>

    <section id="threats" class="dmz-section">
      <h2>{{ title('threats') }}</h2>
      <p>Every area of Hajin has a threat rating from Low to Extreme, and the AI escalates as your own threat level rises. Expect Juggernauts, tanks, drone swarms, Elite Strike Teams and Deathstalker helicopters, plus convoys and aircraft crossing the map.</p>
      <p>Lieutenants and Commanders roam the map. The Boss Board sells intel on Lieutenants, while Commander intel is free. Kills raise your bounty notoriety, extracted dog tags pay out, and a weekly top-50 leaderboard ranks the bounties.</p>
    </section>

    <section id="economy" class="dmz-section">
      <h2>{{ title('economy') }}</h2>
      <p>DMZ Cash pays for Gunsmith attachments, the Vendor (its stock rotates daily), intel, bounty reduction and MIA recovery. Banked cash is capped at $100,000 at first; two Bank Upgrades raise the cap to $250,000 and then $500,000.</p>
      <p>The 3D Printer crafts gear, backpacks, killstreaks and FOB upgrades. It does not make guns: those are built at the Gunsmith after you extract with a Weapon Manual. Weapons found in the field can be damaged.</p>
    </section>

    <section id="timeline" class="dmz-section">
      <h2>{{ title('timeline') }}</h2>
      <ol class="br-timeline">
        <li><span class="dmz-mono">16 Oct 2026</span>Campaign early access.</li>
        <li><span class="dmz-mono">20 Oct 2026</span>DMZ early access for digital pre-orders of the Standard or Vault Edition.</li>
        <li><span class="dmz-mono">23 Oct 2026</span>Full launch.</li>
        <li><span class="dmz-mono">6 Nov 2026</span>Season 1 for Modern Warfare 4 and Warzone. Hajin comes to Warzone. Whether new DMZ content lands the same day is not confirmed.</li>
        <li><span class="dmz-mono">Later</span>The fogged Russian border area opens. Reports place it in Season 2; Infinity Ward has only said “later seasons”.</li>
      </ol>
    </section>

    <section id="unconfirmed" class="dmz-section">
      <h2>{{ title('unconfirmed') }}</h2>
      <p>Launch guides have filled in key rooms, Lieutenant names, 3D Printer recipes and Story Missions; Intel lists them with a confidence label on each entry. These details are still single-source or conflicting:</p>
      <ul class="br-list">
        <li>Page 10 of DMZ Orders. Only one guide lists its Orders so far.</li>
        <li>How weapon insurance works. The Weapon Insurance Contract item exists, but no official post explains it.</li>
        <li>The cash reward for a Commander's Boss Board card, given as both $25,000 and $50,000.</li>
        <li>Whether new DMZ content arrives with Season 1 on 6 Nov.</li>
        <li>XL1, a reported Season 1 DMZ location. Even its spelling differs between sources.</li>
      </ul>
    </section>

    <DmzSources />
  </div>
</template>

<style scoped>
.br-contents { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
.br-contents a { display: inline-flex; align-items: center; min-height: 2.75rem; padding: 0 1rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; background: rgba(14, 16, 15, 0.45); text-decoration: none; font-size: 1rem; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; }
.br-contents a:hover { background: rgba(233, 230, 214, 0.1); }
.dmz-section a { text-underline-offset: 0.2em; }
.br-facts { display: grid; gap: 0.5rem; max-width: 46rem; margin: 0; }
.br-facts > div { display: grid; grid-template-columns: 9.5rem 1fr; gap: 1rem; padding: 0.75rem 1rem; background: rgba(22, 26, 25, 0.5); border-left: 2px solid var(--dz-line-strong); }
.br-facts dt { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); padding-top: 0.2rem; }
.br-facts dd { margin: 0; color: #dcd9cb; font-size: 1.0625rem; }
.br-timeline { list-style: none; margin: 0; padding: 0; max-width: 46rem; border-left: 1px solid var(--dz-line-strong); }
.br-timeline li { position: relative; display: grid; grid-template-columns: 8rem 1fr; gap: 1rem; padding: 0.625rem 0 0.625rem 1.25rem; }
.br-timeline li::before { content: ''; position: absolute; left: -0.3rem; top: 1.05rem; width: 0.55rem; height: 0.55rem; transform: rotate(45deg); background: var(--dz-bg); border: 1.5px solid var(--dz-teal); }
.br-timeline span { font-size: 0.8125rem; font-weight: 600; color: var(--dz-teal); padding-top: 0.15rem; }
.br-list { margin: 0; padding-left: 1.2rem; max-width: 46rem; }
.br-list li { margin: 0.35rem 0; }
@media (max-width: 599px) {
  .br-facts > div, .br-timeline li { grid-template-columns: 1fr; gap: 0.25rem; }
}
</style>
