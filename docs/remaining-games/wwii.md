# WWII guide content and implementation plan

Author all eleven existing entries. The five standalone maps, three Tortured Path story chapters and three related survival maps have different guide requirements. Retain the current IDs and cross-link story and survival counterparts without combining their progress.

WWII's highest-value helpers are its radio table, wall/pillar rotation solvers, ordered observed counts, bird and rune references, and artillery observations. Weapon-upgrade routes and most enemy rituals should stay in illustrated guide branches.

## The Final Reich

**ID:** `ww2-the-final-reich`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/the-final-reich/), [detailed modern guide](https://mmmrkennedy.com/games/WW2/the_final_reich/the_final_reich_guide), and the original tutorials credited in those references.

### Common setup and casual quest

| Phase ID | Ordered action | Cue or recovery |
| --- | --- | --- |
| `setup` | Open the village, turn gas valves, activate the pilot device, power the underground route and unlock bunker/Salt Mine | Illustrate valve approach, furnace hole, generator and timed power switches |
| `pap` | Activate the Ubersprengen mechanism and use the three chute/button routes | Do not mistake the Tesla forge for Pack-a-Punch |
| `tesla` | Raise/charge the mine device, escort it through the Lab and Morgue paths, collect two pieces and craft Tesla Gun | Use its red soul-collection area and machine completion cues |
| `right-hand` | Read four power-grid colours, set the numbered boxes, defend the central then outer lightning rods | Retry a damaged rod after it resets; grid colours are observations |
| `left-hand` | Shoot Zeppelin generators, charge the dropped devices and deliver three batteries | The third generator can be recalled and requires another shot-down attempt |
| `voice-of-god` | Scan four paintings with Brenner's head and enter bird/numeral matches at the machine | Match by bird, not painting visitation order |
| `casual-hilt` | Expose and take the hilt after the correct machine response | This starts the casual boss branch; do not take it early on hardcore |
| `panzermorder` | Shoot/charge boss-arena batteries; stun the boss and attach three | Prepare before arena entry; hardcore has a shorter stun opportunity |

### Hardcore branch

Expose a Casual/Hardcore selector before the quest. Share common setup and hand-device IDs, but give the extra requirements and final hilt their own IDs. The additional requirements are all four Tesla upgrades, Red Talon sword, keepsakes/record/second voice sequence and the Rabenherz interaction. They are partly parallel, so the guide needs a dependency diagram and individual branch anchors rather than one misleading rigid sequence.

The four Tesla upgrades each need battery acquisition, correct enemy/trap charging and a machine defense. Bloodthirst uses its sparking-light trail and Pest/trap condition; Reaper uses Wustling access and Bombers in the saw trap; Hurricane uses a Bomber-opened Lab door and Wustling/electrical trap condition; Midnight uses the Courtyard statue/battery and S-Mine kills. Keep exact enemy groups and successful charge cues with the matching branch photograph.

For the record sequence: gather the three coloured keepsakes, obtain their observed machine numbers, set their clock-like displays and retrieve the record. Complete the weather-vane/button/water-wheel interaction, obtain Red Talon, play the record in the Pub and charge it with the prescribed sword kills. Record the green-flash groups using the separate second-voice reference, then perform the upgraded-Tesla chandelier/Gem action before committing to the hilt. The post-boss Klaus escort belongs only to the hardcore ending.

### Tools and assets

Ship `ww2-final-reich-grid` and `ww2-final-reich-voice`. The latter keeps paintings and gramophone counts in separate stages. Source reference images must supply the four bird identities and machine positions; do not replace them with generic bird emoji.

Useful side content: Classic PPSh unlock, Straub observation locations, ordinary music and character challenges. Keep character unlock conditions separate from main quest requirements and avoid promising drop probabilities or timer values based on unreviewed older claims.

Required images: village valves, bunker/underground power, chutes, forge paths and pieces, four box locations, lightning rods, generator/batteries, four paintings plus birds, machine dial order, all Tesla branch objects, keepsakes/number machines, Red Talon safes, record/flash order, chandelier, hilt and boss battery placement.

## Groesten Haus

**ID:** `ww2-groesten-haus`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/groesten-haus/) and [modern reference](https://mmmrkennedy.com/games/WW2/groesten_haus/groesten_haus_guide).

This is a compact survival guide with setup, box-room unlock, upgraded box weapons and challenge notes. Do not create an invented boss/quest ending.

Use `lanterns` for the ten-lantern route, divided into downstairs and upstairs. A purple reaction/raven sound is the interaction cue. Use `upgraded-box` for Jack-in-the-Box at the upstairs beam target and the piano payment; explain that the box then supplies upgraded weapons rather than displaying a normal Pack-a-Punch machine. Use `survival` for movement/camping options, random Blitz, armor and weapon access. Use `challenges` for optional character requirements, with Prologue-specific rules labelled separately.

Supply wide shots for the two exterior lanterns and the close indoor targets. The roof beam target and piano need their own images. The guide's checkboxes are sufficient; a separate lantern counter would duplicate them. An enlarged room diagram is a later map option if calibrated artwork is available.

## The Darkest Shore

**ID:** `ww2-the-darkest-shore`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/the-darkest-shore/) and [detailed modern guide](https://mmmrkennedy.com/games/WW2/the_darkest_shore/the_darkest_shore_guide).

### Required guide phases

| ID | Ordered action | Cue or recovery |
| --- | --- | --- |
| `setup` | Restore U-Boat and artillery power; explain fog and minecart routing | Fog Meuchlers are not the later friendly ritual enemy |
| `pap` | Ride the three different minecart connections and collect their batteries; fit them at Bunker 3 | The cart's routing switch controls the destination |
| `ripsaw` | Obtain blade/handle, build Ripsaw, extract a charged spine and fill its workbench for the ranged upgrade | Heavy attack plus interact extracts a spine; ordinary kills do not |
| `corpse-gate` | Shoot the hanging corpse head, attach it at the gate, charge the corpse and complete the gas-valve lockdown | Turn a valve while its floor fire is absent; retry its opportunity if missed |
| `monk` | Recover the ritual head and unlock the secret monk room | Keep island progression and secret-room ritual dependencies visible |
| `rituals` | Complete the friendly Wustling, Meuchler and Pest rituals, obtain their heads and charge the room for Pommel | Special enemies must remain alive through their required routes |
| `artillery` | Escort the friendly Bomber, charge the artillery battery, repair the radio and sink two ships | Use observed heading/elevation references; cannon ammunition comes from the charged device |
| `departure` | Hit the radio with Pommel; prepare and synchronize final radio interaction | Acquire replacement tactical equipment only after the required Pommel action |
| `meistermeuchlers` | Survive Beach, U-Boat, bunker and final Beach encounters, using cart transitions | Increasing simultaneous bosses and arena hazards need separate illustrations |

### Ritual instructions and recovery

The Meuchler hunt uses sound and fleeing-zombie direction to locate the friendly target in fog; a timeout/death needs a new spine. The Pest's five electrical charges require particular coil lines and player/enemy positioning; use the source's five paired photographs. The Wustling branch uses its perk-station route and correct lure behavior; make wrong attractions and completion cue explicit.

The three ritual heads and Monk Head go on the secret-room hooks; the blood-room completion exposes Pommel. Normal run progress, carried spine charge and friendly enemy health must not be treated as one checkbox. A single ritual's failure should point back to its spine acquisition rather than reset the whole quest in the website.

### Chosen helper

Add `ww2-darkest-artillery` as a **coordinate recorder and illustrated aiming reference**. Store the six observed RIP Saw coordinate characters with their dial positions, separately from the anti-ship heading/elevation values. Use the supplied aiming chart for conversion. It is useful because observations are scattered, but it must not claim a verified ballistic formula.

Required images: power/cart switches, three batteries, Ripsaw parts/charging, corpse head/gate and safe valve windows, monk route, ritual enemy positions, secret-room hooks, Bomber route, six coordinate dials, cannon controls/aiming chart, radio/Pommel interaction, and the four boss arenas. Optional sections cover the upgraded Ripsaw, song/Classic PPSh and useful challenge unlocks.

## The Shadowed Throne

**ID:** `ww2-the-shadowed-throne`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/the-shadowed-throne/) and [modern detailed guide](https://mmmrkennedy.com/games/WW2/the_shadowed_throne/the_shadowed_throne_guide). The radio chart, statue rules and physical references are already collected in the dataset and asset manifest.

### Required guide phases

| ID | Ordered action | Cue or recovery |
| --- | --- | --- |
| `wunderbuss` | Match church region and radio code, send the flare, obtain Geistbolt/battery and build Wunderbuss | `Contacted the Russians` confirms the radio; recharge the generator to exit the build room |
| `pap` | Expose two panels and charge them with Wunderbuss to lower the elevator | Show both panels from their approach routes |
| `smuggler` | Reveal the register code/ammo type, arm the sewer smuggler, pay and open the returned room | Follow its round/dialogue waits before the next interaction |
| `dancers-dagger` | Project the city map, charge four successive clown sites, record four counts and enter the safe | Lost counts can be recovered by cycling the clowns again |
| `nazi-axe` | Find radio-frequency markings, decode Morse, locate the map point, retrieve bowl and charge the Sizzler-head ritual | Keep the required melee/armor pickup distinct from a normal Sizzler kill |
| `refuge` | Place three melee weapons, charge their enemy requirements and enter Barbarossa's Refuge | Charging the internal anchor locks the player in for the statue puzzle |
| `raven-statues` | Face each wall's statues forward using its specific rates; collect and fit ravens, retrieve Blade and reopen exit | Four walls use distinct rate vectors; the first has only three statues |
| `anchors` | Charge the external anchors and lower the Drop Pod | Plaza charging methods should not be mixed mid-step |
| `zeppelin` | Prepare full Wunderbuss ammunition, board together and charge the cable | Entry is the point of no return |
| `power-routing` | Guide the energy ball through terminal nodes, opening gates before the final approach | Connections shown green are usable; other nearby terminals provide other paths |
| `stadtjager` | Damage glowing engine, later Geistbolt throw, then electrify its gas cloud; return to the pod | A phase's damage window changes; do not fire through every invulnerable animation |

### Tools and optional content

Ship `ww2-shadowed-radio`, `ww2-shadowed-statues`, `ww2-shadowed-safe` and `ww2-shadowed-axe`. The first has the complete ten-region numeric chart; the statue utility uses independently implemented bounded search. Safe counts preserve their visitation order and proper alternating dial directions.

Optional Hangman has seven reviewed words and rewards in the dataset. Hats and Classic PPSh mirror timing remain guide references. The smuggler's selected ammo/weapon class is an equipment dependency, not an inferred radio answer.

Required images: radio code and chart, pinned regions, battery candidates, Geistbolt, build generator, map/clowns/safe, etched frequencies/Morse map, bowl/armor stand, melee pedestals and enemy types, all four statue walls, raven placement, anchors/pod, terminal-routing display and boss damage windows.

## The Frozen Dawn

**ID:** `ww2-the-frozen-dawn`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/the-frozen-dawn/) and [modern detailed guide](https://mmmrkennedy.com/games/WW2/the_frozen_dawn/the_frozen_dawn_guide). Weapon branches must be complete before `kingfall` can claim to be an actionable main guide.

### Setup and four weapon branches

| Phase ID | Acquisition | Upgrade and important distinction |
| --- | --- | --- |
| `setup` | Charge the Crash Site plate; open Thule | The map's named areas need photographed orientation references |
| `pap` | Activate the Passage stone and use all three transport routes to raise Ubersprengen | A transport's ordinary destination and PaP detour are different states |
| `scythe` | Activate Phylactery shrine and survive its event | Spine + Crash Site wire + altar charging, round waits, then the weapon's trial |
| `hammer` | Charge battery bowl, place four stones, perform the rune kill sequence, solve four pillars and guide hammer while prone | Its base pillars and later upgrade apparatus have different rules |
| `hammer-upgrade` | Transfer electrical charge through the specified runes/enemies, solve three apparatus stages and take the invisible route | A missed timed transfer returns to the previous charged source |
| `shield` | Fill the three blood-pool requirements, kill the shield-carrying Wustling and collect its drop | It blocks only when correctly used, not as a passive back shield |
| `shield-upgrade` | Record activated pool patterns, assemble radio/speaker, reproduce patterns in order and conduct the ritual/trial | Activation order matters; the final intentional down is a quest interaction |
| `flail` | Collect two books and three gears, open Cypher Room, charge Gearworks and stop three coloured orbs | Wrong orrery placement resets its attempt after stopping the others |
| `flail-upgrade` | Charge the three Moonraven stones, connect their observed constellations and use the glowing Orrery orb | Preserve completed constellations and the current stone stage |
| `kingfall` | Place all upgraded weapons in their matching cliff pedestals and take the new transport | Shield's mount differs from the three standing weapon pedestals |

### God King encounter

Teach the common damage loop: shoot until the blood-consumption event, disable three pressure plates, then exploit the stagger. Explain the elevated wipe attack and pillar/shield cover, shielded zombies and hammer response, and the later fire-wall phase with the flail teleport route. Co-op can have an extra combined phase. After the kneeling/cutscene sequence, the final required attack must be explicit; a cutscene is not automatically a safe match completion.

### Tools and side content

Ship `ww2-frozen-hammer`, `ww2-frozen-shield` and `ww2-frozen-orrery`. The hammer calculator applies only to the four-block base pillars. Display the later three-stage apparatus plate with its reset/skull references; never reuse the pillar calculation on it.

Include Raven's Claw pistol, Classic PPSh, Vintage MG42 and useful optional perk/point interactions as separately anchored side branches. Use the asset catalogue's candidate locations for hidden items; do not infer a complete spawn set from a single picture.

Required images: all transports/stone, battery/bowl/stones and rune mapping, four pillars plus target-side view, prone hammer approach, upgrade transfer runes and apparatus stages, blood pools/patterns/radio, books/gears, Cypher Room–Orrery perspective, constellations, pedestal mounts and boss cover/pressure plates.

## The Tortured Path story chapters

Sources: [community multi-chapter guide](https://www.reddit.com/r/CODZombies/wiki/the-tortured-path/), [modern chapter route](https://mmmrkennedy.com/games/WW2/the_tortured_path/the_tortured_path_guide), and [official introduction](https://www.callofduty.com/ar/blog/archives/the-new-nazi-zombies-dlc-puts-a-three-part-spin-on-the-epic-adventure).

The story has wave deadlines and lobby continuity. Keep a common campaign overview, but three independent guide entries and resets. The player needs the chapter's ordinary objectives, supply rounds, batteries and final encounter explained in addition to its secret sword component. The shared profile records previous chapter completion, while the current run records the actual wave.

Use this complete schedule beside the chapter steps. These are source-reported quest windows; a suggested extra PaP preparation wait is labelled separately. Between chapters, select the next map from the same returned lobby. Leaving that lobby interrupts the combined secret route. Completing each chapter normally beforehand is a preparation recommendation from the modern guide, whose author explicitly does not prove it is a universal engine prerequisite.

| Chapter | Wave | Ordered secret-route action |
| --- | --- | --- |
| Into the Storm | 1 | Shoot windmill-side tree rope; collect torso, head, both arms and both legs |
| Into the Storm | 2 | Raise river branch beside Double Tap and recover its rope |
| Into the Storm | 3 | Collect the two rods by the supply pod at the cow/truck |
| Into the Storm | 5 | Make one Wustling charge into another; take club, stop long windmill blade at bottom, mount body, then stop it at top |
| Into the Storm | 5→6 / 6 | Lightning drops the body; charge it with nearby kills before finishing the challenge |
| Into the Storm | 7 | Protect its route through windmill to broken-house fireplace |
| Into the Storm | 8 | Charge carried battery until green, then permit escort death; mount battery in cellar and take Hilt |
| Across the Depths | 1 | Every player melees the Barracks battery to enter vision |
| Across the Depths | 2 | Shoot all nine vision fish; gather at lower-deck Jeep before ending wave |
| Across the Depths | 3–4 | Follow Red Herring to red-floor station; purchase/charge its battery |
| Across the Depths | 4–5 | Repeat at Barracks station |
| Across the Depths | 5–8 | Prepare PaP before charging last Cafeteria station; complete it before wave 8 ends |
| Across the Depths | 8 arena | Clear Reich, Shore and Throne islands; wrong jump downs/returns player; three correct fish-cup choices yield Pommel |
| Beneath the Ice | 1 | Melee Forge battery three times; use its every-two-wave vision opportunities |
| Beneath the Ice | 2 | Find/enter first wall code; incorrect entry resets by continuing until all runes depress and return |
| Beneath the Ice | 3 | Take Hilt from transition supply crate and mount it in Forge |
| Beneath the Ice | 4 | Light all four face-statue bowls, then ground bowl near Stamin-Up; add new rune and enter a new code |
| Beneath the Ice | 5 | Take/mount Pommel; all players stand on sacrificial stones and charge until audio cue; add pool rune and enter third code |
| Beneath the Ice | 6 | Take/mount Blade, assemble Sword and then finish ordinary chapter objectives |

The battery wallbuy in Across the Depths costs 3,000 jolts in the referenced route; a different station needs a new battery. The final charge is a teleport commitment. A wrong cup spawns extra enemies and permits another attempt; an island fall downs the player. Old runes remain visible in Beneath the Ice, so a second or third code needs fresh observations.

### Into the Storm

**ID:** `ww2-into-the-storm`. Phases: `setup`, `body`, `windmill`, `escort`, `hilt`, `extraction`.

The route prepares the zombie body at the windmill, obtains the Wustling club, raises/positions the body, charges it, escorts it to the damaged house and charges the carried battery. Place the battery at the Wine Cellar generator and take the Hilt. Use a wave schedule beside the instructions: preparation begins immediately; the Wustling interaction must occur early enough; the body charging/escort/battery stages follow through waves 6–8. A dead escort before its battery is ready can end the secret route even if ordinary chapter objectives remain playable.

Supply the body-part candidate gallery, windmill control/club position, correct top-of-rotation screenshot, escort path and cellar generator. The guide should state whether it is showing a recommended wave schedule or an absolute game gate. Do not invent an automatic restart just because the reader entered a wave number.

### Across the Depths

**ID:** `ww2-across-the-depths`. Phases: `setup`, `vision`, `fish`, `batteries`, `islands`, `cups`, `pommel`, `extraction`.

Enter the battery vision, shoot nine fish and follow the Red Herring through three battery-charge stations. Prepare equipment before the final charge teleports the team into the island sequence. Defeat each island's enemies, cross the temporary platforms and follow the fish through three cup-shuffle rounds. Take the Pommel, then complete the remaining ordinary chapter objectives.

A fish/cup memory helper could be a later experiment, but video-like movement cannot be inferred from a still website input. The baseline is a three-round observation notebook inside the guide and a clearly drawn starting-position reference. No predictive cup solver is selected.

Supply all fish locations, possible battery wallbuys, the three stations, island jumps and the actual cups. A failed jump and an incorrect cup have different consequences. Preserve the chapter's ordinary run requirements separately from the hidden Pommel route.

### Beneath the Ice

**ID:** `ww2-beneath-the-ice`. Phases: `setup`, `rune-wall`, `hilt`, `flares`, `pommel`, `sacrifices`, `blade`, `forge`, `extraction`.

Break the Forge battery and use its permitted vision windows to discover the first rune code. Enter it at the wall, collect/place Hilt, conduct the four flare-bowl interaction and recover/insert the added rune. Find a new code, place Pommel, complete the simultaneous sacrificial-stone stage, add the next rune and enter the final new code. Fit Blade and use the Forge to assemble the Sword before finishing the chapter.

Ship `ww2-tortured-runes`. Use three separate sequence records, with source location thumbnails. Old codes remain visible in game, so preserve them as history but never carry them into a new stage as defaults. Failed wall entry has its documented physical reset before retrying.

Supply all fourteen documented rune-search locations, wall overview, inserted-rune states, battery, supply-crate states, four flare bowls, extra rune opening, sacrificial stones and Forge mounts. Use the source's wave schedule, documenting early/late failures and lobby continuity.

## Tortured Path survival versions

These are full survival guides, not shortened copies of the timed story quests. Their PaP battery schedule is 1/5/10, while the story chapters use 1/4/7. Put the edition prominently above the setup instructions.

| Entry | Setup and PaP | Optional upgrade and Sword route | Source |
| --- | --- | --- | --- |
| `ww2-bodega-cervantes` | Charge batteries at windmill, Wine Cellar and ruined-house side | Duck gallery provides the PaP fuse; after the campaign unlock, fund seven rune stones and use the glowing-ring ritual | [Bodega reference](https://mmmrkennedy.com/games/WW2/the_tortured_path/survival_maps/bodega_cervantes_guide) |
| `ww2-uss-mount-olympus` | Charge lower deck, Projector Room and Barracks batteries | Six valves release the fuse; fund the seven rune stones and use the matching ritual ring | [Olympus reference](https://mmmrkennedy.com/games/WW2/the_tortured_path/survival_maps/uss_mount_olympus_guide) |
| `ww2-altar-of-blood` | Charge Speed Cola side, Stamin-Up side and PaP-side batteries | Enter the photographed wall-rune fuse sequence; fund four stones plus three forge bowls for Sword; optional Klaus-symbol route unlocks Kontrollgranates | [Altar reference](https://mmmrkennedy.com/games/WW2/the_tortured_path/survival_maps/altar_of_blood_guide) |

For each survival entry use `setup`, `pap`, `pap-upgrade`, `sword` and `survival`; add `kontrollgranates` only to Altar. Show the seven payment sites and the ring, and explain the intentional downing ritual plus its perk consequences. The campaign prerequisite belongs before the Sword instructions.

Each guide needs its own room/district artwork and batteries; do not advertise the story chapter's round-10 exit as a survival win condition. Keep the fixed fuse/rune/valve routes as illustrated guide instructions. A generic “survival setup tracker” is not a standalone tool.

## Implementation and acceptance

Use separate WWII authored guide files per large map and one Tortured Path module that deliberately distinguishes six entries. Exact IDs and branch boundaries are in `maps.json`.

Prioritize the complete radio transcription, all four statue rate vectors, all base-hammer states, ordered shield patterns, safe reset/directions and chapter/survival battery-wave differences in software checks. Gameplay acceptance covers solo and co-op, mandatory enemy survival, source-specific orientation, round/lobby gates, intentional ritual downs and boss points of no return. A passing calculation test alone cannot verify a weapon-upgrade route.
