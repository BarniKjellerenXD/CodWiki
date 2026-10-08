# Advanced Warfare guide content and implementation plan

Replace the four Exo Zombies placeholders with complete map guides. Keep `aw-outbreak`, `aw-infection`, `aw-carrier` and `aw-descent`. Use Exo Zombies terminology and images; Cold War Outbreak is a different entry. All four main routes support solo play and co-op, with explicit synchronization instructions where required.

The map authoring order is setup → equipment → main quest → ending → optional challenges. Two specialist tools earn standalone pages: Descent's Simon recorder and number-panel action planner. Infection needs an illustrated search atlas, and Carrier needs a clear icon reference inside its guide.

## Outbreak

Sources: [community map guide](https://www.reddit.com/r/CODZombies/wiki/outbreak/), [modern detailed walkthrough](https://mmmrkennedy.com/games/AW/outbreak_AW/outbreak_AW_guide), [original solo walkthrough](https://www.reddit.com/r/CODZombies/comments/2u0yhn/text_guide_solo_outbreak_easter_eggachievement/), and [2015 Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=403315764). The old Steam guide contains an abbreviated solo-card instruction; use the fully described four-card route.

### Content route

| Phase ID | Action and progression cue | Recovery or branch |
| --- | --- | --- |
| `setup` | Open Morgue, Holding, Administration and Exo Testing; power equipment and collect an Exo Suit | Show power generators and the Exo station as separate landmarks |
| `black-box` | Take the Warbird's Black Box to the Morgue terminal; wait for Angie's response | Do not start card instructions before terminal acknowledgement |
| `cards` | Complete Lilith, Decker, Oz and Kahn's card puzzles, in any order | Four named cards are required even when a character is absent |
| `clearance` | Collect zombie-dropped cards until each player's badge reaches 49 | Guide progress records each player's confirmation, not inferred kill totals |
| `readers` | Use the Morgue terminal, then each character's reader to reach 50 | Wrong reader does not advance that character |
| `extraction` | Reauthorize at the terminal, synchronize the Exo station interaction, return to spawn | Standard route unlocks the experimental upgrade station; distinguish the alternate ending |

### Card instructions

- **Lilith:** obtain EM1; fire it into the 3D Printer while purchasing, then collect the card. Retain EM1 for the incinerator if useful.
- **Decker:** in solo buy a trash chute, stay out, wait for closure and immediately buy/enter again. In co-op coordinate separate chutes. Shoot the incinerator floor and collect the exposed card before being ejected.
- **Oz:** remove the bar under the Holding cells; use Exo Slam on the appropriate outer cell roof. Co-op players coordinate their slams. Repeat if the raised-cell collection window closes.
- **Kahn:** while infected, interact with the four Administration keypads, then take the checkpoint card. Cleansing before all four are used resets this attempt.

The four character readers are Lilith's upper Morgue room, Decker's Exo Testing stairs, Oz's Holding reader near Exo Health, and Kahn's Administration reader near the Morgue connection. Illustrations must show the reader, nearby wall weapon/perk and approach direction.

### Optional content and presentation

Include the alternate rescue/gold trophy as a separate branch selected before the run: no downs, and the later clearance-card farming must retain the prescribed melee-only condition. Make the HUD badge-colour cue explicit. Do not silently apply these restrictions to the normal guide. Include the three-tool music activation locations and the Mk20-to-Mk25 station reward.

No separate “collect all cards” tool: the guide already supplies completion boxes. Use a four-card branch layout so the player can open the card they are currently attempting without scrolling through unrelated instructions. For co-op, the branch can show an optional local player assignment note.

Required image groups: Black Box and terminal; each card's object/interaction; all four infection keypads; four readers; Exo station and experimental station. Source images are indexed under `outbreak_AW_guide` in the asset manifest.

## Infection

Sources: [original discovery thread](https://www.reddit.com/r/CODZombies/comments/30wwdi/infection_easter_egg_thread_spoilers/), [detailed walkthrough and locations](https://mmmrkennedy.com/games/AW/infection/infection_guide), and [quest reference](https://callofduty.fandom.com/wiki/MEAT_IS_MURDER). The community wiki index explicitly labels its Infection guide incomplete; do not use that page alone to author the quest.

### Content route

| Phase ID | Required action | Confirmation and recovery |
| --- | --- | --- |
| `setup` | Unlock Sewers, collect Exo Suit, open districts and identify decontamination | Infection management stays visible throughout the guide |
| `pan` | Exo-jump to the golden pan; turn four sewer valves; place pan on the hidden chamber altar | Steam indicates a valve interaction; hidden passage opens after all four |
| `blood` | Kill zombies in the lower altar area, retrieve the charged pan and mount it on the Burger Town stove | Upper-room kills do not substitute for the correct collection area |
| `burger` | Find one meat piece in each district; place each before collecting another; cook all four with Magnetron, then add the employee-zombie bun | Ding/patty state confirms cooking; the completed burger infects its carrier |
| `cleanse` | Decontaminate while carrying the burger; give it to Bubby | He asks for power, rather than completing the quest immediately |
| `battery` | Activate the Command Center schematic, collect its timed battery, charge it at Value Voltage, return it to Bubby | Replace a knocked-out battery; repeat the schematic interaction if its collection window is missed |
| `rocket` | Use Bubby's key in the rooftop burger; recover an Insta-Gator zombie arm, use spawn fingerprint scanner, install the red tablet | Follow the actual rocket/tablet state; rocket deployment alone is not the final action |
| `finish` | Retrieve the blue tablet and give it to Bubby | His active patrol confirms completion; the released explosives can harm players |

### Illustrated search atlas

Group meat candidates by Atlas Command, Value Voltage, Sewers and Burger Town. There is one piece per district and one held piece at a time. An illustrated search page can mark locations checked while keeping **collected** separate from **searched**. The source contains the individual photographic candidate locations; preserve their grouping and do not claim every piece spawns simultaneously.

Group valve references by corridor/pipe, with a wide landmark shot and a close valve example. Some older accounts list 30 pipe positions while the modern reference video lists 32; the UI should expose its documented candidate set and say “possible locations,” rather than use the number as a game rule. A new valve can require another pass through a previously searched section.

Keep the procedural burger route in the guide. A “cook burger tracker” duplicates it. The useful interaction is comparing a hard-to-see item with the atlas while the player searches.

Side content: the three golden-rocket song activations and ordinary map features. Give infected-round behavior, survivor escort objectives, Exo equipment and upgrade stations their own setup sections. Do not label an ordinary round objective as a mandatory MEAT IS MURDER step.

Required images: pan pickup, valve/pipe examples, opened chamber and valid kill area, four district meat galleries, assembled patty and bun, decontamination, battery screen/box/charger, Bubby, burger screen, alligator arm, scanner, red and blue tablets.

## Carrier

Sources: [original discovery thread](https://www.reddit.com/r/CODZombies/comments/3878ck/carrier_easter_egg_thread_spoilers/), [modern detailed walkthrough](https://mmmrkennedy.com/games/AW/carrier/carrier_guide), [original full tutorial](https://www.youtube.com/watch?v=Kw33B-41a_Y), and [written 2015 walkthrough](https://www.escapistmagazine.com/sink-the-carrier-in-advanced-warfare-with-our-full-easter-egg-guide/).

### Content route

| Phase ID | Action | Success or recovery |
| --- | --- | --- |
| `setup` | Open the relevant decks, Exo equipment, upgrade stations and Teleport Grenade wallbuy | Map's ordinary bomb-defusal events need a separate explanation |
| `hidden-generator` | Throw a Teleport Grenade into Chompy's open room; activate the generator | Both disposal machines become available |
| `fishing` | Use Weapon Disposal; fit reel, line and hook on the Gun Deck rod as received | Fit each held part before obtaining the next |
| `tablet-1` | Complete the three Grenade Disposal icon rows; take the tablet to the vault | Three green rows confirm; wait for Oz's line if deposit is unavailable |
| `tablet-2` | While drunk, activate the keypad; cross Cargo → Lift → Moon Pool → Hangar without touching lasers | A hit cancels the attempt; reactivate the keypad to retry |
| `tablet-3` | Collect/install 20 telefrag pieces in Bio Lab; fish a shovel, teleport to the island and dig up the tablet | Install pieces promptly; a missed island attempt can be retried after cooldown |
| `tablet-4` | Inspect Captain DJ's locker; obtain the empty-drone lever, power the shark cage, collect the eye and open the locker | Use its eye scanner; unrelated loot drones are not the objective |
| `ending` | After all tablets, obtain C4 from Weapon Disposal and plant it at the vault | This ends the match; place a clear point-of-no-return notice |

The grenade row reference is in `puzzle-data.json`: 2, 4 and 6 icon observations. The player throws the required Contact Grenade at the relevant icon moment; these icons name the machine's states, not a list of equipment the player must obtain individually. Prefer the confirmed Frag endpoint in the baseline instructions. The modern source offers a Nano Swarm alternative; treat that as an optional documented variant, rather than requiring it.

A fixed sequence belongs in a large illustrated inline reference with current-row emphasis. The reference is useful; a separate generic progress page adds another place to tick the same instruction.

Optional content: the gold trophy requires a Red Fish and the qualifying laser-maze time; label it before accepting the maze tablet. A deliberate failed attempt permits another attempt for the timing challenge. Include the three toy-shark song sites, shark-jump achievement and Mk25 unlock without mixing their conditions into the main quest.

Required images: Chompy entry, hidden power, both disposal machines and actual icon silhouettes, rod-part mounts, keypad and four maze areas, Bio Lab teleporter, island dig example, empty drone, cage lever, shark position, scanner and final C4.

## Descent

Sources: [detailed modern walkthrough](https://mmmrkennedy.com/games/AW/descent/descent_guide), the original tutorials linked there, and the map's [community wiki destination](https://www.reddit.com/r/CODZombies/wiki/descent/) as a coverage check. The wiki page is not a substitute for the modern full walkthrough. Review the player-count and challenge cues in a full run before describing them as gameplay-verified.

### Content route

| Phase ID | Action | Confirmation or hazard |
| --- | --- | --- |
| `setup` | Collect Exo Suit, open Tidal Generator/Lounge/Galleria, explain scheduled Oz encounters | Rounds 5, 12 and 20 are different encounters; the first is a preview |
| `secret-room` | Shoot the three staircase valves until all show blue; use the exposed terminal | Angie's denial acknowledges the starting interaction |
| `reroute` | Depressurize Lounge door, use a Goliath suit to reach the underwater switch | Door preparation persists while the player fetches the suit |
| `drones` | Next challenge: destroy five empty drones before they escape | A failed or prematurely ended round retries on the next round |
| `capacitor` | Absorb electrical enemy charges at Galleria until the display reaches 100% | Use the display rather than a website-assumed hit total |
| `contact-round` | Complete the restricted Contact Grenade round | Show the actual granted equipment and avoid ordinary firing instructions |
| `jumping` | Finish nine platform patterns; then complete the movement/points challenge | A platform diagram/reference is more useful than a checklist of nine identical steps |
| `simon` | Record the four monitors' physical colours and replay flashes; survive the friendly-fire challenge | AI allies can appear in solo; separate this from ordinary enemy damage |
| `number-panel` | Match the four digits with slam hits, jumps, purchases and kills; complete the MAHEM round | Re-observe after actions that affect multiple digits |
| `memories` | Use the terminal through its red/blue states and survive two Outbreak-memory waves | Reunion completes and restarts into Double Feature |

### Boss content

The earlier Oz fight has opening-window damage phases and laser, gas and electrical-floor hazards. Identify the central decontamination pad and destructible turrets. Mutated Oz's loop is four generators → bait onto the pad → decontaminate → damage until his shield returns. A spent pad needs its generators restored, including a use that missed Oz.

Write these encounters beside their round gates, with an interrupt note telling the reader to return to the current Reunion phase afterward. The boss is not a replacement for the main-quest challenge sequence.

### Tools and optional branch

Ship `aw-descent-simon` and `aw-descent-numbers` from the complete contracts in [tool-specs.md](tool-specs.md). Give both an inline placement and a full tool page. Physical layout, recorded sequence and performed actions remain distinct.

Double Feature is a separate optional branch with a pre-run selector. Explain the black-and-white/no-HUD restrictions, altered points and upgrades, and the gold trophy for defeating Mutated Oz in that mode. Include the three stingray song activations. Do not describe the normal quest restart as the player having completed the optional gold trophy.

Required images: three secret-room valves, exposed terminal, underwater door/switch, capacitor display, platform examples, Reception monitors, target/current digit rows, boss windows, generators/pad and Double Feature keypad.

## Authoring and validation

Use shared AW constructors and explicit phase/step IDs. Give unusual exits and optional endings their own branches. The asset manifest already contains exact image URLs for the detailed location galleries; only a curated subset belongs on a phone's initial render.

The first AW software acceptance cases are Simon duplicates, layout editing, leading-zero observations, number-panel coupling and cross-map reset isolation. The first gameplay acceptance cases are Outbreak card requirements and infection reset, Infection single-item carrying, Carrier disposal registration, and the complete Descent challenge transition. These checks validate the drafted route; they are not extra general research for the coder.
