# Infinite Warfare guide content and implementation plan

Author the five existing map entries with ordinary quests, illustrated equipment branches and the separate Director's Cut progression. The game's strongest new tools are spatial memory, Morse decoding, word filtering, chemistry, disk ordering and the Skullbreaker chess puzzle. Keep each one attached to the exact phase that uses its result.

## Zombies in Spaceland

**ID:** `iw-zombies-in-spaceland`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/zombies-in-spaceland/), [illustrated main quest](https://codzombiesguides.com/main-quests/infinite-warfare/zombies-in-spaceland/), and [equipment and side quests](https://mmmrkennedy.com/games/IW/zombies_in_spaceland/zombies_in_spaceland_guide).

### Required guide phases

| ID | Ordered instruction | Cue or recovery |
| --- | --- | --- |
| `setup` | Enable the five regional power switches, activate/enter four gateway portals and use Cosmic Way's projector portal | Show five switches and four portals separately; the hub gateway is not a fifth regional portal |
| `equipment` | Explain souvenirs, Arcane Cores/UFOs and four Weapons of Rock with their own parts | Keep coin recipes separate from wonder-weapon station requirements |
| `seticom` | Collect calculator, boombox and umbrella; wait for the UFO event and ask Hasselhoff for the device | Three candidate locations per part need photographed location groups |
| `defences` | Locate and defend three SETI-COM placements, in successive rounds: 60, 90 and 120 seconds | Failure spawns a Brute; fetch a replacement from Hasselhoff and retry |
| `speakers` | Return the device after the required round transition; place four speakers around the projector gateway | Starting a speaker commits the player to the arena |
| `ufo-sequences` | Record each speaker's colour, then repeat three UFO colour sequences | Bad or partial entry can spawn a Brute; unknown order should remain unknown |
| `aliens` | Damage the glowing neck collar; melee the backpack fuse during the kneeling opportunities; finish the aliens | Player count affects the encounter; collar colour is a damage cue |
| `fuses` | Install the dropped fuses, then Pack-a-Punch a Weapon of Rock | Alien defeat alone does not finish the whole quest |
| `laser` | Activate ring nodes and time the last node to hit the overhead UFO | Collect the Soul Key; the Director's Cut talisman is a separate reward |

### Equipment authoring

Each Weapon of Rock branch needs three illustrated substeps: its souvenir part, its special pickup/challenge part, and the crystal from the croc-mouth device. Explain golden teeth, the Brute interaction and the matching elemental weapon as prerequisites. Use a shared Arcane Core/UFO section for the four relevant trap regions, then link to it from the weapon branches.

The Weapons of Rock are Dischord, Face Melter, Head Cutter and Shredder. Give each its own stable anchor and pickup photographs. Keep its optional early use distinct from the upgraded weapon required at the final laser stage. N31L's head/battery/floppy challenges belong in an equipment section with the correct progression gates.

Ship `iw-spaceland-speakers`; put the small souvenir lookup inside equipment. The SETI-COM placement locations belong in an illustrated atlas that the player can scan when the device reacts. A standalone “SETI-COM progress tracker” is unnecessary.

### Side content and assets

Include Ghosts 'N Skulls as an optional route, ordinary music/teddy references, N31L's repeatable assistance, Hasselhoff's lobby code, and later Wyler content under the proper unlock branch. Do not require Ghosts 'N Skulls for Sooooul Key.

Required imagery: map-region landmarks, power/portals, all nine SETI-COM candidate pickups, placement-area examples, speaker positions, alien collar/backpack, fuses and five ring nodes. The asset manifest has the individual equipment and quest references; select photographs by phase rather than using a decorative cover as an instruction.

## Rave in the Redwoods

**ID:** `iw-rave-in-the-redwoods`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/rave-in-the-redwoods/), [illustrated main quest](https://codzombiesguides.com/main-quests/infinite-warfare/rave-in-the-redwoods/), and [equipment/side references](https://mmmrkennedy.com/games/IW/rave_in_the_redwoods/rave_in_the_redwoods_guide).

### Required guide phases

| ID | Ordered instruction | Cue or recovery |
| --- | --- | --- |
| `setup` | Restore power; collect boat handle, engine and propeller | Show Rave Area, Mess Hall and lodge part locations |
| `projector` | Take the dock reel, ride to Turtle Island, obtain the cabin reel and repair the projector | Projection Room access has its own return/cooldown behavior |
| `bows` | Obtain Vlad and choose Whirlwind EF-5, Trap-o-Matic, Acid Rain or Ben Franklin | Give each statue/ritual branch its own image group and completion cue |
| `photo-arms` | Talk to Kevin, take the first photo, conduct Thunderbird's arm-removal ritual and defeat the Slasher | The photo glows when the target is met; failure loses a perk and permits another attempt |
| `photo-legs` | Return to Kevin; take the next photo and conduct the Quickies-area leg-removal ritual | Do not substitute ordinary kills for the specified body-part hits |
| `skull` | Speak to Kevin, recover the lodge-basement skull and conduct the beach headshot ritual | Defeat the ritual Slasher and collect the completed object |
| `departure` | Use the required unlit lodge buttons together, then board the boat as a team | This boat trip is the point of no return to the boss |
| `super-slasher` | Charge skulls, lure the boss into the energy circle, damage exposed symbols and shelter from the storm | Repeat the cycles; collect the Soul Key/talisman at the correct ending |

### Rave Vision and useful references

Explain pouch consumption, fairies for extending vision, and the danger of the Slasher in later rounds. Keep the ordinary vision Slasher separate from the killable ritual/boss versions. A photographer must label whether a location is shown in ordinary or Rave Vision.

Do not build a general quest tracker. The best optional helper is a charm atlas: Binoculars, Shovel, Arrowhead, Ring, Bird Mask, 8 Ball, Fish, Frog, Pacifier and Boots, with pickup candidates, challenge and resulting effect. The source's photographed groups can provide these without a new calculator.

Side route: Ghosts 'N Skulls 2 has six separate stages, including trap kills, vision-symbol matching, knife game, SKULL spelling, boat gallery and lightning-bow interaction. Keep the exact trap-count plate (1,9,9,2) with its “one activation” rule in the guide. Include Puppet Strings, the knife-wheel ammo reward, Kevin's character code and post-quest Smiley.

Required imagery: boat/reels, Kevin, photo/skull pickups and placement areas, valid arm/leg/headshot cues, lodge buttons, boss skulls/circle/shelter, each bow's statue and ritual, and all optional charm reference groups. Do not add a website countdown unless it is explicitly user-started.

## Shaolin Shuffle

**ID:** `iw-shaolin-shuffle`. Sources: [community guide and word list](https://www.reddit.com/r/CODZombies/wiki/shaolin-shuffle/), [illustrated main quest](https://codzombiesguides.com/main-quests/infinite-warfare/shaolin-shuffle/), and [modern detailed reference](https://mmmrkennedy.com/games/IW/shaolin_shuffle/shaolin_shuffle_guide).

### Required guide phases

| ID | Ordered instruction | Cue or recovery |
| --- | --- | --- |
| `setup` | Enable four power switches; explain movie-reel/projector access and obtain Chi/Shurikens | Keep individual Chi upgrade branches outside the quest route |
| `rats` | Talk to Pam, release and follow the rat through cages, complete the circle defense and collect the key | Let Pam finish her dialogue before the next interaction |
| `soulkey` | Open the subway locker and shoot the SOULKEY symbols in the displayed order | Four actual locations need the photographed glyphs |
| `eye` | Fight the Rat King, collect the eye, find and shoot six revealed orange symbols | Only one hunt symbol is active at a time |
| `phone` | Decode the ringing phone's three digits; obtain the matching Nightmare Summer poster | Let the message finish; a wrong poster causes another symbol hunt |
| `word` | Mount the poster at the roof spotlight, destroy the X window, defeat ninjas and complete the rooftop word | Word failure resets its current attempt; tools retain observations with a visible attempt boundary |
| `brain` | Fight the Rat King again and take the brain | Do not confuse the collected organ with its later arena challenge |
| `turnstile` | Collect/use the turnstile piece in the subway route and complete the required circle events | Illustrate both subway entrances and their relevant objects |
| `disco` | Complete the disco-ball zombie transfers on the dance floor | Killing it off the active floor or ending the round breaks the chain |
| `heart` | Use the next Rat King marker and recover the heart | Return to Pam before entering the sewer finale |
| `finale` | Damage Rat King between the three organ challenges; complete all three and kill him | Eye: shoot revealed glyphs; brain: preserve friendly attackers; heart: clear slime by killing zombies in it |

### Tools and state

Ship `iw-shaolin-morse` and `iw-shaolin-word`. The word dataset has 71 entries; the helper must handle repeated letters, failed guesses and multiple candidates. Show the Wyler alphabet rather than requiring the player to remember an invented glyph nickname.

Keep a thirteen-location orange-symbol atlas beside the eye phase. Checked locations, a seen symbol and a confirmed shot are separate marks. A new hunt begins with a fresh checked-location set. Make the phone/poster and rooftop-word stages separate resets so a wrong word does not erase the already decoded poster number.

Equipment and side sections: all four Chi styles and their leveling, fast-travel doors, Katana, Nunchakus, Mahjong craftables, seven radio music triggers, Skullbuster, the David Savage calling-card route and Pam's lobby unlock. These use their original fixed instruction/illustration groups, with no speculative arithmetic solver.

Required imagery: Pam, locker/initial glyphs, all orange-symbol sites, ringing phone, poster-number close-up, roof spotlight/X, rooftop letter sites and alphabet, turnstile/circle route, disco floor and final organ symbols. Preserve a safe return anchor from every tool to its exact guide phase.

## Attack of the Radioactive Thing

**ID:** `iw-attack-of-the-radioactive-thing`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/attack-of-the-radioactive-thing/), [illustrated main quest](https://codzombiesguides.com/main-quests/infinite-warfare/attack-of-the-radioactive-thing/), [detailed equipment/reference guide](https://mmmrkennedy.com/games/IW/attack_of_the_radioactive_thing/attack_of_the_radioactive_thing_guide), and [chemistry reference](https://wellslogan.com/aotrt/dist/).

### Required guide phases

| ID | Ordered instruction | Cue or recovery |
| --- | --- | --- |
| `setup` | Restore switch handle/power; give Elvira her book and complete blood-vial/portal access | Elvira assistance and her mirror have separate timing |
| `equipment` | Obtain cleaver, crowbar and Seismic Wave Generator; explain M.A.D. upgrade | Required tools precede the body-part collection |
| `body` | Assemble head, torso, both arms, both legs and three mirror items at spawn | Each body part needs its specific weapon/trap/collection route |
| `life-ray` | Obtain punch card, establish the five-digit accepted order, activate life ray, reverse that order for death ray | Retry the machine when its attempts are exhausted; key unlocks the garage |
| `nuke` | Collect three bomb pieces and three chemistry-set pieces | Keep the two part lists separate |
| `safe` | Read the desk code, set the four pressure gauges with the crowbar and obtain the market-safe bomb code | Record the four-digit bomb code as a string; it is not the life-ray code |
| `o-and-filter` | Read M, determine O from filter/equality observations, multiply and compare against the actual TV bands | Do not infer a unique answer from incomplete observations |
| `radio` | Repair/listen to the radios and identify the positively endorsed final chemical | The crude-solution/negative lines do not supply the desired compound |
| `chemistry` | Read ingredient diamonds in the chosen filter, make the required dependency chain and load the final compound into the bomb | Show each reaction's ingredients and its own calculation; damage/failure means recheck inputs |
| `departure` | Prepare, synchronize bomb charging and the next interaction | Arena entry is irreversible for that attempt |
| `crogzilla` | Escort bomb, damage exposed chest with the death rays, survive acid, cross lasers and enter the saved bomb code | Failed belly code returns the team to the laser/acid cycle rather than completing the quest |

### Tools and reference content

Ship `iw-attack-chemistry` and `iw-attack-codes`. The chemistry dataset includes all eleven intermediate recipes and five final compounds, raw ingredient pickups, board locations and two worked keypad examples. Diamond values vary with the match and filter; never ship them as constants. Explain the TV comparison using explicit bounds and colours, including the equality case.

The body reference must show the head's alternate Pack-a-Punch exit, frozen torso trap, left-arm firepit, beach-arm seismic interaction, radioactive-zombie leg, hanging leg and all three mirrors. The pressure reference must distinguish motel, gas station, Snack Shack and Power Station gauges. Use close-ups plus nearby landmarks.

Side content: Skull Hop's six stages, M.A.D. collection/upgrade, Brachyura Boogie, Elvira's lobby code, diary/calling-card interactions and craftable devices. Skull Hop's optional calculator has a resolved arithmetic contract and BENZENE fixture in the dataset. Keep it independent from chemistry: the positive offsets depend on symbol position, with remainder zero representing Z. Supply the word/alphabet plate even before the optional calculator ships.

Required assets: body/part locations, punch-card machine and life-ray state, gauges/desk/safe, M marker, four O-marker sites in filters, TV bounds, both radios, all six diamond boards, ingredient/recipe sheet and boss stages. Credit the recipe sheet to **RayPoopertonIII**, as visible on the image, with the hosting source retained.

## The Beast from Beyond

**ID:** `iw-the-beast-from-beyond`. Sources: [community guide](https://www.reddit.com/r/CODZombies/wiki/the-beast-from-beyond/), [illustrated main quest](https://codzombiesguides.com/main-quests/infinite-warfare/the-beast-from-beyond/), [equipment and Director's Cut guide](https://mmmrkennedy.com/games/IW/the_beast_from_beyond/the_beast_from_beyond_guide), and the separate finale sources below.

### Standard quest phases

| ID | Ordered instruction | Cue or recovery |
| --- | --- | --- |
| `power` | Retrieve N31L's head through the Ops Center hole and install it at Staging | This replaces a conventional power-switch instruction |
| `bridge` | Collect three scrap pieces and repair the Exterior bridge to the Projection Room | Pickup encounters and bridge access need clear photographs |
| `entangler` | Complete Skullbreaker's first two skull stages and retrieve the Entangler | Later Skullbreaker stages are optional for the main quest |
| `disks` | Recover four disks from their different routes and enter the observed symbols in the correct order | Wrong insertion can return disks with changed symbols; discard the stale selection |
| `handles` | Move the theater button with the Entangler, activate it under the forcefield-room desk and record the initial board | Modern references flip an initial horizontal set toward all vertical; preserve each pass's snapshot |
| `escort` | During the hacked window carry N31L to the Projection Room computer and install him | Doors follow his look direction; a dropped/expired escort has its own repeat route |
| `cryptids` | Synchronize arena entry; survive Rhinos, portal waves, terminal stage and the displayed 99 countdown | The displayed countdown is not a calibrated 99-second website timer |
| `mammoths` | Defeat both Mammoths while keeping their blue fire away from needed routes | Use a damage weapon and the arena ammo supply; ordinary quest ending is separate from Meph |

### Source reconciliation and chosen helpers

Ship `iw-beast-disks`, `iw-beast-handles` and `iw-beast-queens`. The disk helper uses the source's twelve symbol photographs and six row orders. The older Reddit reference reads its different sheet right-to-left; the authored dataset must retain its own orientation.

For handles, modern illustrated and detailed references agree on horizontal observations toward vertical targets; the older wiki gives the opposite convention. Choose the modern illustrated route, preserve an initial-state recorder and provide the original target/context photographs. Do not implement an unproven binary toggle matrix or guarantee that one pass solves every board.

Equipment/side sections: double Pack-a-Punch, Venom-X and upgrade puzzle references, Skullbreaker stages 3–6, eight queens, paper-input order and the hidden astronaut song. The queen solver preserves the preplaced queen. Venom's cube, maze and Morse references should remain separate from N31L's main quest state.

### Director's Cut and Mephistopheles

Sources: [detailed remastered finale guide](https://www.reddit.com/r/CODZombies/comments/l2l72v/the_ultimate_iw_easter_egg_guides_mephistopheles/), [Mephistopheles practice guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3617365373), and [written encounter reference](https://margwa.net/beast-from-beyond).

Keep this branch collapsed until selected. Track account-level Soul Keys and Director's Cut unlock separately from the current Beast run. After the five ordinary quests, use the Soul Jar in a **new match** to unlock the mode. Replay the first four map quests in Director's Cut and collect their talismans; completing Beast under the required conditions then leads into the final encounter.

The finale guide needs an arena plan, attack animation reference and these phases:

1. Charge a ritual circle while avoiding attacks; leaving can regress its charge.
2. Use the Entangler to deliver the released souls, then shoot the exposed symbol.
3. Survive the eclipse enemy set and use the walls for the meteor shower.
4. Repeat for the five rituals, explaining additions to attacks and enemy sets rather than repeating one paragraph five times.
5. After the fifth ritual, keep damaging Mephistopheles while the talismans rise and fill. Interact with all five charged talismans to fire their lasers. Return to the central boss for the final exposed damage phase, then confirm the ending and rewards.

The authored instructions should teach these observable cues. Keep weapon/card loadout choices optional and distinguish account-unlock preparation from the current fight. Boss Battles is useful practice and does not grant the live progression rewards.

| Cue | Response to teach |
| --- | --- |
| Aiming hand / fireballs | Move out of their targeted lane; avoid backing into another player |
| Raised arms / skeletons | Keep space from their bodies and clear them before the ritual circle becomes trapped |
| Pulled-back hand with a black center | Move away from the black-hole lane; the source's prone option is contextual, not universal invulnerability |
| Teleport to center / slam | Reach the pillar/edge escape lane and watch the landing |
| Raised mouth / fire breath | Leave the firing line before it sweeps the ritual position |
| Hands clapping / wall | Move clear of the forming barrier and preserve a path to cover |
| One hand pulled back / huge meteor | Leave the impact area immediately |
| Swirling hands / center tornado | Spread away from the center and avoid crossing teammates' lanes |

The early eclipse sets progress through clowns, Slasher, ninjas, then Rhinos with cryptid/phantom pressure. Supply the actual observed cover and escape photographs; these are animation cues, not frame-accurate website countdowns.

This branch needs its own source-reviewed attack plate before it claims a complete illustrated encounter. The textual sources above are sufficient to establish structure and the ritual loop; they do not provide a universally verified frame-by-frame timing table. No automatic attack predictor is selected.

Required images: N31L head/slot, bridge pieces, Entangler prerequisites, all four disks, twelve glyph plates, row reference, button/desk/handle board, escort destination, terminal/ammo/crate landmarks, queens board and finale arena/attack references. The twelve disk selector files are already downloaded and retain their source indices.

## Implementation and release checks

Use one game reference dataset, with per-map step IDs and independent helper resets. Record Director's Cut milestones as persistent profile observations; a new ordinary map run must not clear them. Preserve fixed routes and generated catalogue integration.

The critical software checks are colour-layout persistence, Morse grouping/leading zeroes, repeated-letter filtering, five complete chemical dependency routes, disk ambiguity, initial-handle snapshot isolation and all 92 unrestricted queen solutions. Gameplay checks verify each published quest, source orientation conventions, co-op activation and boss damage cues. The package supplies the references; those final gameplay checks remain honest validation work.
