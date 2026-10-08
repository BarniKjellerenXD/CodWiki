# Modern Warfare III (2023) content and implementation plan

Author the six existing destinations. MWZ needs persistent unlock and reward references alongside short, deployment-specific observations. A story portal, a permanently unlocked seasonal portal, an ordinary Sigil run and an Elder run must be clearly distinguished. Use the player's current mission selector and the portal's actual interaction prompt when describing access; release-era progression rules are not a reliable universal gate in 2026.

## Shared MWZ systems

Sources: [official mission progression](https://www.callofduty.com/guides/zombies/call-of-duty-guides-modern-warfare-zombies-missions-and-progression), [official acquisitions reference](https://www.callofduty.com/guides/zombies/call-of-duty-guides-modern-warfare-zombies-acquisitions), [official tactics](https://www.callofduty.com/guides/zombies/call-of-duty-guide-modern-warfare-zombies-tactics), and [community seasonal access explanation](https://www.reddit.com/r/MWZombies/comments/1w1j0fm/completed_all_3_acts_whats_next/).

Use three different records: permanent story/portal milestones, owned schematics, and current-deployment observations. A schematic is a persistent crafting unlock; an acquisition is an item for a deployment. Show this distinction in reward cards, search results and the seasonal helper. “New deployment” clears USB and contract observations, while retaining the first two records.

The four conventional seasonal destinations use the triangular Sigil for an ordinary 30-minute visit and the Elder Sigil for a 15-minute visit with schematic opportunities. Ordinary visits are useful for acquisitions and Elder Sigils; Elder contracts are the schematic route. Later seasons can repeat a schematic or fail to award the missing one. Do not promise the whole collection in one visit. Season 1's schematic progression differs from the later random reward sets. The September 2024 ordinary-entry waiver was an event-era rule; [September 2026 player reports](https://www.reddit.com/r/MWZombies/comments/1wmdd9u/sigil_questuons/) describe Sigils again. Explain the current prompt, without imposing a permanent “free entry” rule from an old announcement.

The permanent portal unlock is obtained by completing the relevant relic ritual; a player can also accompany a squad member who has access. Personal unlock, personal mission selection and joining someone else's run are different facts. Do not block a user's guide or erase a milestone because the website thinks they have not completed Acts I–III.

Use `mw3-dark-aether-reference` once as a shared definition, owned by Urzikstan and linked inline from every seasonal guide. Its input is the desired reward, story or destination, and its output is the correct season, portal landmark, entry variant, relic route and reward set. It does not pretend to inspect the player's account.

## Urzikstan

**ID:** `mw3-urzikstan`. Phases: `deployment`, `contracts`, `equipment`, `story`, `rune-portals`, `red-worm`, `side-quests`, `exfil`.

### Deployment and ordinary activities

The landing section explains threat tiers, rarity versus Pack-a-Punch, armor, masks, self-revives, field upgrades, ammunition caches, rucksack space, exfil and the storm. Use a compact preparation card for the next selected objective. Show the actual in-game countdown and storm boundary as the authority; a website timer started on page load is unsuitable.

The contract reference should distinguish zombie objectives from mercenary objectives. Use one card per contract: starting object, objective, common failure and completion cue. Include Bounty, Outlast, Spore Control, Escort, Deliver Cargo, Raid Weapon Stash, Aether Extractors and Defend Ground Station. Explain inhibitors for Spores, staying in the Outlast zone, ACV health for Escort, cargo/helicopter pursuit, and uninterrupted extractor interactions. This is reference content, with ordinary guide progress; it does not need eight separate checklist tools.

Equipment sections cover keys/keycards, mercenary camps and strongholds, Warlord access, Aether nests/infested strongholds, Harvester Orbs, doghouses, crafting and schematics. Pair the ammo-mod icon with its name. Separate hostile quest Hellhounds from friendly pet acquisition. Fixed “best gun”, invincible-pet and launch-era cooldown assertions should not be copied into maintained content.

### Story entry points

Provide an Act overview and three ordinary finale branches. The game already tracks small mission counters; a duplicate website mission tracker is optional and should not delay the puzzle tools. Useful help explains the action being counted: slowing a Hellhound differs from killing it; turning enemies with Brain Rot differs from personally shooting them; exfil objectives require the item still in the rucksack.

| Finale | Authored flow | Recovery and completion |
| --- | --- | --- |
| Extraction | Select the available mission, use its named starred exfil, reach Jansen, clear the area while her upload finishes, escort her to the helicopter | Show its mission name before boarding. Finish the rescue/exfil; merely entering the isolated mission is not completion |
| Shepherd | Use its named exfil, destroy the roof SAM installations, clear the neutralizer deployment zone, escort the ACV, activate/defend its final test | The ACV's destruction is a mission failure. Explain Mega Abomination pressure separately from the device interaction |
| Defeat Zakhaev | Enter the named stronghold mission, advance through mercenaries, fit the charge at the marked device, fight Orcus and finish the ending | Teach mouth weakpoints, beam/orb avoidance and the escape from a swallow. Orcus is different from Gorm'gant and Greylorm |

Supplemental walkthroughs: [Shepherd route](https://www.gameskinny.com/tips/mw3-zombies-shepherd-mission-walkthrough-how-to-deploy-to-neutralizer-test-site/), [Shepherd original solo discussion](https://www.reddit.com/r/MWZombies/comments/1876jam), and [Zakhaev objective reference](https://game8.co/games/MW3/archives/435168). The access note should show that later updates changed mission availability, as recorded in [this player report](https://www.reddit.com/r/MWZombies/comments/1fpd73g/act_missions_and_the_changes_since_the_latest/). A selectable mission is not proof its special exfil has appeared in the current deployment.

### Rune portals

Ship `mw3-rune-portals`. The local research inventory has 17 entry photographs and 24 exit references, with the three-rune destination codes photographed in order. These are [WZHUB's public Urzikstan markers](https://wzhub.gg/map/urzikstan/mwz); [Espioth's original chart](https://www.reddit.com/r/CODZombies/comments/17uvwuc/mwz_rune_portals_guide/) is independent context.

The user chooses a destination by grid/landmark, views the exact ordered code, then finds an entrance and shoots those three symbols. Show the source's 1,000-Essence interaction cost as a dated reference. Entrance locations and exit codes are different sets; multiple destinations can share one grid square. Retain each marker's unique identity. Use the observed screenshot for the code, not invented Unicode substitutes or a guessed nickname-to-code translation.

Baseline: illustrated lookup with source screenshot and destination grid. The dataset now supplies all 24 ordered triplets and an eight-glyph photographic atlas, so a three-slot reverse lookup can be built without further symbol research. Map coordinates in the imported reference use WZHUB's own projection; do not treat them as calibrated coordinates in the site's map contract.

### Greylorm / Red Worm

Sources: [full boss route](https://gameranx.com/features/id/485365/article/modern-warfare-3-zombies-secret-red-worm-boss-fight-greylorm-easter-egg-guide/) and [spaz33g's photo-location chart](https://www.reddit.com/r/CODZombies/comments/18yl0fd/my_red_worm_usb_location_cheat_sheet_in_case/). The chart is saved locally as `assets/mw3/red-worm-reference.jpeg`.

1. Inspect one of the four clue-wall areas and record its four location photographs. These describe this deployment's active USB sites; they are not a universal set of four locations.
2. Match each photo to the twelve candidate sites in the dataset and chart. Visit the console and record the **actual** Alpha/Bravo/Charlie/Delta item obtained. Do not permanently attach a USB identity to a landmark.
3. Locate this run's boss area by the paired ammunition caches and refractors. Prepare mask support, revives, armor, crowd control and damage capacity before the storm covers it.
4. Insert all four USBs into their matching refractors once the storm condition is met. Check missing items and interaction cues rather than using an assumed wall-clock spawn.
5. Fight Greylorm: use its exposed weakpoints, clear dangerous orbs/adds, replenish mask/ammunition at the available caches, and escape a swallow by firing and parachuting safely.
6. Collect the reward and use the spawned exit. Legendary Aether Tool, Flawless Aetherium Crystal and Scorcher schematic opportunities belong here, not in the four seasonal reward sets.

Ship `mw3-red-worm-usbs`: four photo slots, candidate cards, observed USB identity, collected state and a shared “all four carried” readiness result. Missing or duplicate USB identities prevent a ready result. The boss arena remains a current-run landmark observation. It does not have one permanent guaranteed spawn pin.

### Side quests and art

Include the free-perk challenges, chess-piece/vault sequence, the three Tier 3 reward triangles, Blood Burner reference, Warlord editions, music and seasonal portal overview as independently linked sections. Named challenges need their actual trigger and reward, with location photographs; approximate source grids remain references until calibrated. Avoid advertising the temporary Santa event as permanently available.

The eight free-perk actions below use [the illustrated perk reference](https://www.gamepur.com/guides/all-free-perks-in-cod-mw3-zombies), the local WZHUB photos, and [MrDalekJD's original side-quest chapters](https://www.youtube.com/watch?v=4Fpj9WowYEo). Check Mister Peeks/reward availability in the shared public match; a missing reward does not prove the action or location never exists.

| Reward | Landmark | Trigger |
| --- | --- | --- |
| Jugger-Nog | C3 campfire | Light with Molotov |
| Speed Cola | C2/D2 eagle ramp | Drive vehicle over it and land below |
| Death Perception | E2 ring sculpture, northern tower approach | Parachute through all three rings |
| Deadshot Daiquiri | I3 church | Grenade through highest opening; refill at nearby ammo cache if missed |
| PhD Flopper | H7 manor pool | Dolphin-dive from roof into water |
| Quick Revive | H5 highway signs | Wait under Peeks sign for laugh, then race vehicle north to next sign |
| Stamin-Up | D7 stairwell | Sprint from Peeks at bottom to top |
| Tombstone | G7/G8 crane view | Scope Peeks, hold breath until jumpscare |

The vault route uses four **Send Transmission to H7** devices in any order: Pawn's waterside shack around I1, Bishop's D1 railway tunnel, Rook's mined C5 Ghalia hotel, and the moving Knight truck. The Knight's pictured grid is not a fixed spawn. Defeat the named mercenaries where needed, send their transmissions, check the four lowered pieces/lights at the H7 manor basement, then open the vault and handle the King Mimic before looting. Other players can contribute. This is an illustrated hunt, not a chess-move solver. Sources: [chessboard route](https://www.gamerevolution.com/guides/954826-mw3-zombies-easter-egg-solve-chessboard-puzzle-open-vault-unlock-modern-warfare) and [original discovery](https://www.reddit.com/r/MWZombies/comments/17sgzcn).

Required artwork: mission/portal icons, each contract's starting object, mod symbols, storm/mask cues, all 17 rune entrances and 24 exits, the Red Worm chart and four clue walls, USB console/refractors, boss weakpoint and swallow exit, finale-specific objective landmarks, and one image per free-perk/chess trigger. The resource table should be filterable by “setup”, “puzzle”, “boss” and “rewards”.

## Dark Aether — Season 1 / Al Bagra Fortress

**ID:** `mw3-dark-aether-season-1`. Phases: `preparation`, `bad-signal`, `relics`, `attunement`, `portal`, `contracts`, `locked-rooms`, `exfil`.

Sources: [mission/relic route](https://gameranx.com/features/id/484752/article/modern-warfare-3-zombies-how-to-enter-the-dark-aether-rift-act-4-boss-fight-easter-egg-and-schematics-guide/), [official relic acquisition table](https://www.callofduty.com/guides/zombies/call-of-duty-guides-modern-warfare-zombies-missions-and-progression), and [locked-room key locations](https://gameranx.com/features/id/485266/article/modern-warfare-3-zombies-how-to-open-the-dark-aether-locked-doors-all-dark-aether-key-locations/).

### Story and permanent access

Bad Signal is the mission branch. Enter its marked portal; activate and charge four seals with nearby kills; then attempt the exit and defeat Gorm'gant. Teach the mouth weakpoints, orbs and swallow recovery, with mask/ammo support. Take the gold Locked Diary from the reward before leaving.

The other relics are separate Urzikstan activities:

| Relic | Purple acquisition | Upgrade |
| --- | --- | --- |
| Pill Bottle | Brain Rot a cyst until green and interact before destroying it | Carry it through an Aether Tear, take its coloured sky portal and finish the special bounty |
| Surveillance Camera | Destroy a Harvester Orb with Dead Wire | Use its coloured sky portal and special bounty |
| Dog Collar | Put one Rotten Flesh and a Molotov into a doghouse; defeat the hostile Hellhound | Use its coloured sky portal and special bounty |

Keep each purple/gold inventory state separate. Gold Diary needs no additional upgrade. At the island tornado near Bad Signal, place all four gold relics on their matching pedestals and defeat the gate Mega Abomination. Completing this ritual establishes personal access; later visits use the appropriate Sigil side. Relics can be obtained across deployments and preserved by exfil; a wipe can lose carried relics without deleting already completed permanent access.

### Ordinary and Elder visits

Separate the relic ritual from repeat contract runs. The three activities are Aether Extractors, Outlast and Escort, started from Mister Peeks contract objects. Show all three starting landmarks, the route to the objective and two exit alternatives before the user starts. Escort requires protection of its ACV; a packed V-R11 repair option is useful help rather than a required quest item.

Ordinary rewards include seasonal acquisitions and potential Elder Sigils. The Elder guide is the route for Dog Bone, Golden Armor Plate and Aether Blade schematics. Preserve Season 1's progression by contracts completed; do not generalize its behavior to Season 2's random rewards. Reward previews must say whether they describe an acquisition or a schematic.

Locked rooms are an optional equipment route with their own key/door atlas. Use the eight key candidates and corresponding rooms from the linked reference; keys can vary per visit. Do not call every locked room a guaranteed Scorcher case. Locate the roof and underground exits photographically so the short Elder timer does not become a navigation problem.

Required images: four seal sites, Gorm'gant, each relic action, coloured sky portals, all four pedestals, Sigil interaction sides, three Peeks/objectives, ACV repair cue, key/door candidates and both exits.

## Dark Aether — Season 2 / Sa'id City

**ID:** `mw3-dark-aether-season-2`. Phases: `preparation`, `countermeasures`, `relic-obelisks`, `attunement`, `portal`, `contracts`, `music`, `exfil`.

Sources: [RayPoopertonIII's original mission and unlock guide](https://www.reddit.com/r/MWZombies/comments/1b9x24h/detailed_video_text_guide_to_unlocking_the_season/), [the same author's contract and music guide](https://www.reddit.com/r/MWZombies/comments/1btflqa/text_video_guide_to_mastering_the_season_2/), and [independent unlock overview](https://www.gamespot.com/articles/call-of-duty-mw3-zombies-how-to-unlock-season-2-dark-aether-rifts-and-new-schematics/1100-6521677/).

### Countermeasures and three optional obelisks

Escort the story vehicle, defeat the interfering EMP Mimic, recover its needed part and clear the mall's cysts. Return to the vehicle, complete the stadium defense and defeat Krawvir, the EMP Mangler. Take the gold Drum and exfil. The three purple relics can be earned during this mission; put them beside the nearest story step so the reader does not finish the mission and realize they omitted all three.

| Relic | Story-map obelisk | Required kill type |
| --- | --- | --- |
| Tattered MMA Gloves | Ship deck near spawn | Fist melee; use the supplied Insta-Kill |
| Perforated Target | E3/E4 crossroads | Headshots within the ritual area |
| Pristine Mirror | Foggy river-side area, I8 reference | Match each displayed ammo-mod requirement, using the ritual boundary and provided mods |

These are three different obelisks and conditions, not three uses of one universal “kill zombies” step. The gold Drum comes from the story boss reward. Wrong or omitted relic challenges can be revisited by repeating Countermeasures; do not make the user repeat a completed gold upgrade without reason.

### Gold upgrades and portal

| Relic | Urzikstan upgrade landmark | Action and success cue |
| --- | --- | --- |
| Mirror | I3 graveyard | Offer it at the relevant grave and kill the spawned zombie with the indicated mod; nearby roof supplies the mods |
| Gloves | F8 boxing gym | Strike the three punching bags left to right, then finish the spawned zombie with melee |
| Target | H8 firing range | Offer at the target, shoot eight appearing targets, then headshot the spawned zombie |

At the hill/tower tornado above Nahr Bathhouse, fit all four gold relics into the matching pedestals. Defeat the EMP Mimic and collect the access reward. The future guide needs a close shot of the interaction point: source-era reports describe a small, finicky Sigil hitbox. Tell the player to locate the actual prompt, not to assume a failed hover means the portal is still locked.

### Repeat visits

This destination uses **Bounty, Outlast and Aether Extractors**, with its three starting objects and separate paths. It has no seasonal Escort contract. The contract route begins near the northwest ship, reaches the restaurant Outlast area, then the mall-roof extractor starter; alternative order is valid. Extractor interaction must finish while enemies are distracted; the tight alley is a distinct hazard from the open last site.

Four exits, variable PaP sites and the elevated Wunderfizz need an illustrated navigation reference. Elder rewards are Mags of Holding, Blood Burner Keys and V-R11 schematics. They can repeat and are not guaranteed as all three in one run. Optional music uses three stones around the stadium: southern opening, field east of center and northern announcer booth.

Required images: ship/three obelisks, EMP blocker and mall cysts, Krawvir, gold-upgrade interaction points, hill portal/pedestals, contract starters/objectives, mall roof access, elevated Wunderfizz, four exits and three song stones.

## Dark Aether — Season 3 / Zarqwa Hydroelectric

**ID:** `mw3-dark-aether-season-3`. Phases: `preparation`, `union`, `crystals`, `relics`, `attunement`, `portal`, `contracts`, `gyanxi`, `exfil`.

Sources: [Union route](https://gameranx.com/features/id/497551/article/modern-warfare-zombies-how-to-complete-the-union-story-mission/), [relic unlock route](https://gameranx.com/features/id/497546/article/modern-warfare-zombies-how-to-open-the-season-3-reloaded-dark-aether-rift/), [Smoke Signals boss guide](https://gameranx.com/features/id/498663/article/cod-zombies-smoke-signals-blueprint/), and [independent boss discovery](https://detonated.com/mw3-zombies-secret-dark-aether-boss-fight-free-smoke-signals-blueprint-unlock-season-3-reloaded-quest/).

### Union

Follow Ava; shoot the two floating orbs until they reach their crystal sites. At each crystal, observe its three ordered runes and find/shoot the matching surrounding signs, using the wisp/audio cues. Ship `mw3-union-runes`: separate crystal A/B records, each with three ordered slots and confirmed completion. An incorrect entry should preserve the player's observation for correction.

Then cleanse the three obelisks, fight Taoxla and take the Giraffe Toy. Taoxla's summoned elite minions protect it; eliminate them before returning to its head weakpoint. Finish Ava's escort and exfil. “Boss defeated” and “story extraction complete” are separate cues.

### Permanent portal

Purple relic sources are friendly-dog kills of a mercenary Sergeant for the Laptop With Stickers, storm-zombie kills for the Science Journal, and the I7 Zohoor Ranch bed interaction for the Imaginary Friend Drawing. The Giraffe is already gold from Union. Upgrade each purple item at its matching Tier 3 triangle/summoning ritual with the item in inventory: activate the symbols, align the viewpoint, charge the ring, offer the item and defeat the spawned HVT.

The three gold upgrades must be recorded independently. The drawings/laptop/journal are distinct from the ordinary triangle loot reward. Near the northwest island tornado in Tier 3, place all four gold relics and defeat the gate boss to establish access. Sources label the area around E3/E4 differently; ship the actual island/portal photograph rather than inventing an exact calibrated pin from those grid labels.

### Contracts and Gyanxi

Use the three contract obelisks: Escort at G6 roof reference, Outlast at I3 and Bounty at F1. The activity rewards also supply the temporary carried buffs Atomic Hunter, Numb Foot and Mind-Blowing Revelation. Explain each item's effect and that it must be carried; collecting one is not a permanent account perk.

For the optional Smoke Signals RAM-7 blueprint, complete all three contracts in this visit. Destroy the west, north and east island spores, then the central Rift Heart. Defeat Gyanxi, removing its protective elite minions whenever it becomes invulnerable. Both ordinary and Elder versions can award this blueprint; ordinary offers a longer run. This is separate from the Elder-only schematic goal.

Elder schematic set: Dead Wire Detonators, Golden Mask Filter, Sergeant's Beret. Plan the contract route and available exit before adding the optional boss. A missing blueprint and a missing schematic have different next steps.

Required images: two crystals and nearby rune signs, three cleanse sites, Taoxla/minion cue, bed/dog/storm relics, triangle viewpoints and item-offer prompts, pedestals, three contract obelisks, temporary buff icons, four spores, Gyanxi shield state and exits.

## Unstable Rift

**ID:** `mw3-unstable-rift`. Phases: `preparation`, `obelisks`, `rift-entry`, `phase-1`, `phase-2`, `phase-3`, `phase-4`, `phase-5`, `rewards`.

Sources: [official Season 4 Reloaded introduction](https://www.callofduty.com/blog/2024/06/call-of-duty-modern-warfare-iii-warzone-wzm-season-4-reloaded-maps-modes-zombies-announcement), [written unlock reference](https://primagames.com/featured/modern-warfare-zombies-mwz-unstable-rift-guide-how-to-unlock-locations-and-all-easter-eggs), [community discovery discussion](https://www.reddit.com/r/CODZombies/comments/1dpzk3c), and [independent completion guide](https://www.charlieintel.com/call-of-duty/how-to-complete-mw3-zombies-unstable-rift-easter-egg-unlock-mark-of-the-survivor-camo-330822/).

Find and complete three current Urzikstan obelisks, equipping the ammo mod shown on each and making its required kills inside the ring. Show the displayed icon/name and success cue. Locations and the spawned Rift can vary. Another squad can use a public Rift; the website must not claim ownership because its checkboxes reached three.

Before interacting, describe the combat commitment and what the run supplies. This is a five-phase arena with escalating enemies, phase-ending bosses, temporary boosts and reward rifts; it is not a conventional thirty-minute seasonal contract destination. The preparation card emphasizes crowd control, boss damage, revives and teamwork. Numeric “best weapon” claims from 2024 are not implementation facts.

Give each phase its own quick instruction, enemy/boss cue and readiness checkpoint. Show the in-game phase counter; avoid an automatic countdown or guaranteed obelisk/portal spawn prediction. Finishing the fifth phase earns the Mark of the Survivor camo and resets schematic crafting cooldowns. Inspect the actual reward/exit before marking it complete; mere entry grants neither the camo nor completed cooldown reset.

No standalone five-box checklist is selected. Guide progress and a small illustrated mod reference are enough. A later map layer can expose reviewed candidate obelisk sites, clearly labelled as candidates. It cannot represent a live server feed.

Required images: ammo symbols on actual obelisks, activation ring and successful charge, Rift map icon/entry, arena orientation and choke points, each phase boss, temporary boost/reward states, camo/completion and exit.

## Dark Aether — Season 5 / Highrise

**ID:** `mw3-dark-aether-season-5`. Phases: `preparation`, `ascension`, `echo-relics`, `attunement`, `portal`, `contracts`, `infinite-cosmos`, `exfil`.

Sources: [Ascension story route](https://gameranx.com/features/id/506621/article/modern-warfare-zombies-how-to-complete-the-final-story-mission-ascension-story-mission-walkthrough/), [relic route](https://gameranx.com/features/id/506654/article/modern-warfare-zombies-how-to-get-all-4-relics-and-enter-the-final-dark-aether-rift/), [Infinite Cosmos quest](https://detonated.com/mw3-zombies-infinite-cosmos-blueprint-easter-egg-guide-season-5-reloaded/), and [official Season 5 Reloaded announcement](https://www.callofduty.com/uk/en/blog/2024/08/call-of-duty-modern-warfare-iii-warzone-wzm-season-5-reloaded-maps-modes-zombies-announcement).

### Ascension

Use Ascension's gazebo portal beside Opal Palace. At the F6 obelisk, send Gloves, Drum, Target and Mirror from the nearby train/platform sites, then charge Ava with kills. At E5, repeat with Journal, Giraffe, Drawing and Laptop; recover them when scattered. Ride the floating trains and vehicles up the tower, break its north red crystal and use launch pads/Rifts to reach the arena.

Shoot the Entity's body orbs, avoid beams, and clear tracking orbs as it relocates. Its first defeat is a fake ending. In the second phase, charge Ava near the boss's current platform to reopen damage; destroy exposed orbs and use launch pads against the all-platform lightning. Repeat, collect gold Mr. Peeks from the true reward, and take Ava's exit. Scorcher is optional movement equipment.

### Three echo relics and gold upgrades

| Relic | Purple acquisition | Gold attunement |
| --- | --- | --- |
| Echo of Locked Diary | Use Aether Blade against clustered special enemies at the G6 triangle/Mimic activity until its reward appears | Use the D2 eagle meteor event, reach the Popov chimney through its portal, then dive to the Phoenix-marked blue container; retry the portal if the landing misses |
| Echo of Drum | Drive Blood Burner through the canal course around F4/G4, following the white-arrow route | Offer at the F7 Opera House body/meteor event and kill matching coloured zombies with their indicated elements |
| Echo of Giraffe Toy | With Sergeant's Beret disguise, execute the relevant mercenary from behind | Offer at the F4 Nahr Bathhouse van/body event and defeat the Mega → EMP Mimic → Disciple chain; remove its protective minions |

For the Drum colour task show labels and icons together: green Brain Rot, blue Dead Wire, white Cryo Freeze, red Napalm Burst. The Diary sources disagree on an exact universal kill count; use the observed reward-rift cue as the completion condition, and explain blade bounces through grouped Specials rather than guaranteeing “five kills”.

All four **gold** relics go on the Opal Palace fountain pedestals around F5. Defeat the Mega and record personal access. Echo relics belong to this portal; the earlier season's similarly named ordinary Diary/Drum/Giraffe are not interchangeable. The reference helper must display “Echo of…” and season context prominently.

### Repeat contracts

Use launch pads/Aether Tears and the floating structures to reach contract starters: Outlast near the north Highrise roof/G2, Spore Control at the floating D3 crane, Escort at the E5 billboard reference. Gold beams/Mister Peeks cues help locate them. Show the inhibitor mechanic for Spore Control and the ACV protection route for Escort.

The Elder schematic set is Disciple Bottle, Grenade Bandolier and Stash Increase. Distinguish Stash Increase's account benefit from an acquisition the player consumes during combat. Do not promise every plan from a single visit.

### Infinite Cosmos optional branch

This branch has its own point of no return. **The Infinite Cosmos STG44 blueprint requires the Elder version.** The secret route/fight in an ordinary visit must not promise that unlock.

Destroy the hidden Highrise spore with an inhibitor; collect/use the R4D detector and follow the revealed arrows to the yellow glow-stick/Damp Gold Skull. Trade it at Golden Whale for the IT Thumb Drive. Use the Spec Electronics computer around C3, defeat the marked Keyholder Mangler and collect the Maintenance Tower Key. Open the Highrise rooftop maintenance door, bring the entire squad inside the portal area, then enter and defeat Entity's Echo. Confirm the blueprint reward and ending.

Each item has its own image and acquisition cue. The first hidden spore is separate from the ordinary Spore Control contract. Give the reader a route back to the current step after a missed jump or an uncollected key. The portal is a squad commitment; finishing three contracts is not itself the blueprint trigger.

Required images: story platforms/Entity weakpoints/Mr. Peeks reward, all echo acquisition and offer points, eagle/chimney/Phoenix container, canal arrow course, four coloured zombies, gold pedestals, three floating contract starters/objectives, hidden spore/R4D arrows, skull/trade/computer, Keyholder, maintenance door/portal and Entity's Echo reward.

## Integration and acceptance

Keep the existing game ID `mw3` and its 2023 disambiguation. These six entries share systems, not identical steps. Register the four selected MWZ tools once; cross-link the seasonal reference where needed. Add a versioned local milestone record for portal/story/schematic observations; keep run state in the existing tool store.

The software checks cover unknown observations, leading-zero/symbol order, all four USB identities, ordinary/Elder/story labels, reward ownership, reset boundaries, repeated portal grids and the two independent Union sequences. Gameplay acceptance checks the current mission prompt, relic success cues, permanent access after a new deployment, normal/Elder rewards, contract/exit navigation and the two optional blueprint branches. Source-reviewed research does not claim a 2026 end-to-end playthrough.
