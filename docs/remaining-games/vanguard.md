# Vanguard guide content and implementation plan

Author all four existing entries, keeping the objective-based maps separate from the two round-based maps. Vanguard's useful puzzle aids are a four-position order eliminator, the Shi No Numa translation reference, and Archon's spatial sequence recorder. Setup progression and shield cooldowns remain guide instructions.

## Der Anfang

**ID:** `vanguard-der-anfang`. Source: [illustrated map and story guide](https://www.codzombieguides.com/der-anfang). This is a hub/objective experience and a short narrative progression, rather than a full conventional boss quest.

| Phase ID | Required instruction | Completion or recovery |
| --- | --- | --- |
| `systems` | Explain objectives, Sacrificial Hearts, Covenants, Tome of Rituals, crafting and perk fountains | Separate permanent game progression from the current match's purchases |
| `command-post` | Open Panzer Column East, then complete the Store portal objective to reach Command Post/Von List's Office | Unopened areas require their portal objectives |
| `void` | Enter the Office's Void portal, survive three rounds and return through the Flinger-side exit | Void permits continued round survival; returning is part of this story sequence |
| `kraft` | Interact with the marked door near the Command Post stairs and let the dialogue proceed | Dialogue completion matters before subsequent cues |
| `apartments` | Open Apartments, interact with its upper-floor rune stone and return to the new Command Post portal event | The final portal/dialogue is the narrative endpoint; do not invent a boss arena |
| `exfil` | Explain the ordinary objective-map exfil option separately | Finishing the short story is not the same as choosing to exfil |

The setup section needs real comparisons of artifacts, Covenant effects and perk tiers, framed as help selecting a setup rather than a “best build” claim. Show the hub Pack-a-Punch, perk first-tier/free behavior and the distinct cost structure, with a date on any numeric price table.

No standalone main-quest checklist tool is selected. The map's fixed progression works with existing guide checkboxes. Include radio/tablet references and the actual Office/door/apartment photographs. Use proper location names so a player can find the next portal without reading several paragraphs.

## Terra Maledicta

**ID:** `vanguard-terra-maledicta`. Sources: [illustrated guide](https://www.codzombieguides.com/terra-maledicta) and [detailed modern route](https://mmmrkennedy.com/games/VG/terra_maledicta/terra_maledicta_guide).

### Shield and story route

| Phase ID | Ordered action | Cue or recovery |
| --- | --- | --- |
| `setup` | Explain Eastern Desert hub objectives, portals, perk areas, shovels and dig sites | Objective-map progression differs from Archon's round-based version of this setting |
| `decimator` | Open Merchant Road and speak to the shield; open East Spring and use the Tents rune stone/portal | Wait for the dialogue and portal cue |
| `augmentor` | Finish the portal challenge and shoot the four returned crystals in the hub | Photograph East/West Spring and both Temple crystals |
| `sacrifice` | Return to shield, open West Spring, use Bazaar rune/portal and complete Sacrifice | Return and wait for the released shield to be collectible |
| `tome-page` | Open Debris Field, use its rune stone and enter the required Void route | Identify this portal separately from the earlier shield portals |
| `arms` | Use Decimator's charged attack on four sealing arms, following their energy links | Wait for the real shield-ready cue; no inferred website cooldown |
| `ending` | Take the released Tome Page and leave via the matching exit | Quest reward and ordinary continuing match remain distinct |

### Useful side routes

Ship `vanguard-terra-pages`. Collect four dug-up pages and place them at the Outpost Courtyard door's Top/Bottom/Left/Right positions. Correct placements remain; a wrong placement resets the current physical attempt. The 24-permutation helper retains accepted prefixes and conditionally rejected choices. It should not ask the player to identify page pictures that the game does not distinguish.

The baseline reward is the Death Machine. If including the additional Ray Gun behavior described by the modern guide, label the needed separate dig/collection condition rather than promising both weapons from every completed door.

Other illustrated side sections: antenna/radio chain, corrupted-heart burial, red-orb points, shovel candidates and general dig rewards. The radio-chain sources disagree on the middle ordering; the guide should follow the actual interactable/current radio cue, record the two intermediate location alternatives and show a source note. This does not require a speculative radio-order solver.

Required images: shield barrier, both prerequisite rune portals, four crystals, Sacrifice defense, Debris Field portal, four arms/beam origins, released Tome Page, page door and its physical positions, shovel/dig examples, radios and heart interaction. Keep ordinary map landmarks separate from the Dark Aether regions used for the arm stage.

## Shi No Numa

**ID:** `vanguard-shi-no-numa`. Sources: [illustrated Vanguard guide](https://www.codzombieguides.com/shi-no-numa) and [detailed Vanguard reference](https://mmmrkennedy.com/games/VG/shi_no_numa_reborn/shi_no_numa_reborn_guide). Use its own images and rule set; do not import BO1/Chronicles equipment or quest steps.

### Wunderwaffe equipment branch

The weapon requires the Fishing Hut part/radio-tower defense, the Comms Room pieces and Storage trap repair/charging, and the Tesla coil charged by Zaballa. Keep the round-15 enemy gate beside the last part. Show the actual three bulbs/parts and their charged states, then the Storage crafting table. A box-acquired weapon is an alternative acquisition route, not evidence that the free-build steps were completed.

### Main quest route

| Phase ID | Ordered action | Cue or recovery |
| --- | --- | --- |
| `setup` | Open Doctor's Quarters, Dig Site and needed huts; prepare Wunderwaffe access | Show water/zipline approaches and district labels |
| `monolith` | Remove branches with three nearby Boom-Schreier explosions; collect wheel pieces and three paper clues | The clue symbols vary; pieces and answer papers are different objects |
| `cipher` | Translate paper glyphs, align the three required wheel glyphs at the top and lock | Red wheel lighting confirms the code |
| `souls` | Activate the glowing pillars together; kill marked enemies with Wunderwaffe during the lockdown | Failed collection requires another round/attempt |
| `blood` | Use Flogger kills to fill the blood fountain, then drink to enter the clue vision | The vision does not make the player invulnerable |
| `mirror-parts` | Follow the red orb for one part; read War Room's X and recover the indicated elevated part for the other | Refill vision through the fountain if necessary |
| `orbs` | Place parts at Dig Site, follow the relevant blue orbs and shoot each three times | An expired orb attempt can be restarted at its pillar |
| `echo` | Synchronize boss entry; kill marked enemies with Wunderwaffe and damage Echo while inside the large blue field | Three phases change the marked enemy type; invulnerable cue ends a damage window |
| `mirror` | Take the completed mirror and rewards after the story events | Do not mark completion at the first boss damage cycle |

### Tool, side content and imagery

Ship `vanguard-shi-no-numa-cipher`. The dataset transcribes all fifteen **paper glyph → wheel-reference cell** pairs from the supplied 640×426 plate. It preserves the wheel shapes photographically. Display three observations with their paper locations and explicit ring-target selections; do not infer ring order from the order the player visited the huts.

Side sections: black-telephone music, Samantha's plates/dolls, Rampage Inducer, bunny/body-part reward and radios. Bunny vision has prerequisites from the main route and should not be listed as available immediately at spawn.

Required images: wheel parts, three paper positions including the covered Excavation paper, translation sheet, actual wheel target pose, monolith pillars, marked zombies, blood fountain, War Room map/mirror location chart, orb shots and Echo damage field. The translation and mirror-location plates are already indexed; only exact source-edition assets should be selected.

## The Archon

**ID:** `vanguard-the-archon`. Sources: [detailed route](https://mmmrkennedy.com/games/VG/the_archon/the_archon_guide), [independent written walkthrough](https://www.charlieintel.com/call-of-duty-vanguard/how-to-complete-vanguard-zombies-the-archon-easter-egg-main-quest-guide-194570/), and [original full tutorial with chapter timestamps](https://www.youtube.com/watch?v=JA7Ihp-GtxU).

### Main quest route

| Phase ID | Action | Cue or recovery |
| --- | --- | --- |
| `setup` | Recover the two ghostly PaP parts at Derailment and Spike, assemble/charge Temple PaP | This is the round-based map; do not reuse Terra's objective portals |
| `relic` | Place relic, enter the new portal and survive the introductory Dark Aether event | Its forced return/downing is scripted progression |
| `shovel` | Obtain a shovel and open the trial areas | Keep the four candidate pickup landmarks in a location group |
| `mindfulness` | Dig the red orb; complete 3/4/5-symbol sequence rounds and their challenges, then capture runes without kills | Failed trials can require the next round; damaging enemies is distinct from moving through the runes |
| `resilience` | Release orb from the external crystals, carry three cursed items back and take Decimator; destroy three Syphoncores and deliver Demon Blood | Sprint restrictions and item-specific challenges matter |
| `sacrifice` | Light three torches, sacrifice a packed weapon, defeat the elite, switch to Ring of Fire and charge the trial obelisks | The surrendered weapon is lost; plan a spare packed weapon |
| `departure` | Prepare, then use the Temple portal after all trials | A source-based no-return notice belongs before the interaction |
| `kortifex` | Damage the first eye; convert red crystal shards in purple pods to blue and use sky pillars to break the later shields | Repeat for the remaining eyes and disrupt the later healing state |

The three trials can be completed in different orders; guide progress must support that. They are not three mutually exclusive paths. Ring of Fire is a real Sacrifice requirement. The helper should not claim that selecting this artifact in a website equips it in the game.

Ship `vanguard-archon-runes`. Its baseline records 3/4/5 player-assigned symbol names and observed ground landmarks, preserving the order under pressure. The local wall/ground screenshots establish the interaction; the [Myst3ryo preparation chart](https://www.reddit.com/r/CODZombies/comments/wwu3e9/cheat_sheet_image_for_the_trial_of_mindfulness/) is linked by the independent guide, but its original pixels were not retrievable during this research. Do not invent a fixed glyph count or ground mapping. A photographed selector is an artwork enhancement with a defined capture task. An unread sequence remains unrecorded, and a new attempt should not overwrite the previous locked observation.

The Decimator attack is useful for the shielded objects and for defense. For Kortifex, teach the distinction between ordinary shards and converted blue shards, the pod waiting cue, the sky pillars and the exposed eyes. A generic “boss damage calculator” cannot know live health or invulnerability and is not selected.

Side sections: Rampage Inducer's five-skull order, Mister Peeks digging after its screams, Vanishing Shore instrument and story references. No invented drop-rate optimizer.

Required images: ghostly PaP parts/assembly, trial-area overview, orb and rune positions, all three cursed pickups/carry return, Syphoncores/fountain, torches, sacrifice orb/artifact stone, shard/pod colour distinction, floating pillars and boss eyes. Tutorial timestamps are useful supplemental references, but images should be local for the maintained guide.

## Integration and checks

Use separate objective and round-based mode labels in catalogue/search. Sources use “Shi No Numa Reborn”; retain this as an alias while the existing map ID remains unchanged. There is one authored guide per current placeholder.

Software checks: 24 page-order permutations with prefix-aware rejection, unknown glyph states and all fifteen paired reference cells, 3/4/5 sequence lengths, shared inline/tool state and reset isolation. Gameplay acceptance checks the exact vision/round gates, co-op pillars, source radio-order differences, shard conversion and damage windows. Source review should never be labelled an end-to-end playthrough.
