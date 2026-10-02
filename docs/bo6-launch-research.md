# BO6 launch maps — research, decisions and verification

Reviewed 2026-10-02. Covers Liberty Falls and Terminus. This is a source-verified authored implementation; it does not claim a completed in-game verification run.

## Source set

- [Liberty Falls community map breakdown](https://www.reddit.com/r/CODZombies/wiki/liberty-falls/) and [Terminus community map breakdown](https://www.reddit.com/r/CODZombies/wiki/terminus/): map setup, main quest skeleton, major side activities, clue locations and recovery behavior.
- [Liberty Falls illustrated main quest](https://www.codzombiesguides.com/main-quests/black-ops-6/liberty-falls/) and [Terminus illustrated main quest](https://www.codzombiesguides.com/main-quests/black-ops-6/terminus/): current visual landmarks, device interactions, capture field and canister timer, Resonator retrieval, damaged trap identification, network repairs, bomb transition and boss attack telegraphs. Public pages updated July 7, 2026 were read directly as well as through search.
- [Official Liberty Falls map guide](https://www.callofduty.com/guides/blackops6/zombies/call-of-duty-guides-black-ops-6-round-based-zombies-liberty-falls) and [official Terminus map guide](https://www.callofduty.com/guides/blackops6/zombies/call-of-duty-guides-black-ops-6-round-based-zombies-terminus): route and equipment context. These are initial setup guides, not main-quest walkthroughs.
- [Detailed Liberty Falls Reddit walkthrough](https://www.reddit.com/r/CODZombies/comments/1gty41z/) and [launch-map side-quest infographic discussion](https://www.reddit.com/r/CODZombies/comments/1gz2w8w/): first-run routing, Aetherella use and reward caveats.
- [Dexerto’s Liberty Falls side guide](https://www.dexerto.com/call-of-duty/all-side-easter-eggs-liberty-falls-black-ops-6-zombies-2965267/): independent nine-figure sightline check. [MrRoflWaffles’ side-quest guide](https://www.youtube.com/watch?v=3bw0iHU8kRw) supplies an additional five-shoe location list in its description.
- [MMuton’s Terminus side guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3362284904): independent check of side sequences, fish reward count, coin curse and cooking/refund. Its creator asks permission before reusing their footage, so no footage from this source is republished.
- [PCGamesN boat race guide](https://www.pcgamesn.com/call-of-duty-black-ops-6/terminus-boat-race): three toy boats and shoreline directions. [Gameranx hidden power-ups](https://gameranx.com/features/id/516358/article/black-ops-6-zombies-how-to-get-all-free-power-ups-on-terminus/): verifies the Max Armor bucket absent from the older community wiki.
- The linked COD Zombies Guides side-quest chain was read directly for **29 separate activities**. Every retained screenshot’s manifest includes its exact originating page, not just a site-level credit. Side pages used to fill older wiki gaps include [Liberty candles](https://www.codzombiesguides.com/side-quests/black-ops-6/liberty-falls/candles-fire-trap/), [Liberty hidden power-ups](https://www.codzombiesguides.com/side-quests/black-ops-6/liberty-falls/hidden-power-ups/), [Terminus hidden power-ups](https://www.codzombiesguides.com/side-quests/black-ops-6/terminus/hidden-power-ups-terminus/), [Terminus talisman](https://www.codzombiesguides.com/side-quests/black-ops-6/terminus/cursed-talisman/), [Mega Stuffy](https://www.codzombiesguides.com/side-quests/black-ops-6/terminus/mega-stuffy-pet/), [Whack-a-Crab](https://www.codzombiesguides.com/side-quests/black-ops-6/terminus/whack-a-crab/), [fish Perkaholic](https://www.codzombiesguides.com/side-quests/black-ops-6/terminus/perkaholic/) and [gravedigging](https://www.codzombiesguides.com/side-quests/black-ops-6/liberty-falls/gravedigging/).

## Reconciliation decisions

- **Capture order:** the old Liberty wiki starts Cemetery; the current illustrated guide recommends Riverside. Both work. The implemented first-run route is Riverside/Pump & Pay, then Cemetery/Hill Street. Both the empty canister and weakened HVT must occupy the same emitter’s field. The guide explicitly supports reversing the paired route.
- **Canister timer:** explain the 90-second return after lifting the filled canister, and distinguish an LTG defense failure from an HVT killed outside the field. The first route is opened before starting the delivery.
- **Strauss readings:** Red/High maps to a Green projector; Green/Low maps to Red; Yellow/Medium stays Yellow. Observations are stored per location. The UI never treats a screenshot’s lamp as the user’s answer.
- **Nine Aetherella figures:** some older references incorrectly say eight. Four are in Comics and five outside. The nine original wiki photographs were inspected/retained, with the actual pickup sightlines documented. The ninth pickup triggers transformation immediately. Duration differs in guides, so the product does not invent a timer or guarantee a duration.
- **Terminus trap count:** four physical target positions, not the older wiki’s three: Holding Cells, Living Quarters and two Bio Lab entrances. Broken vent/card recognition is the reliable test.
- **Terminus glyphs:** six fixed values, 0/10/11/20/21/22. Original reference pixels are displayed through SVG viewports, retaining the stripe direction and rotation differences between 20/21/22. The image was visually inspected before authoring those viewports. No generated game symbols or fabricated screenshots are used.
- **Lab arithmetic:** the second expression is signed; only the third expression uses absolute value. Zero is a valid selected value. An impossible negative second entry from Y=Z=0 is flagged for observation review rather than silently converted to a positive number. The six-symbol input domain is tested exhaustively.
- **Resonator scan:** current guide gives round 9 as the earliest completion. Product instructs waiting for the actual terminal announcement and retrieving the Resonator after each island. It avoids a misleading universal “one round” promise.
- **Buoys versus bombs:** two-minute buoy sequence can be retried; the subsequent five-minute three-bomb sequence is match-ending on timeout. The gear checkpoint is before the first hack. Bombs are two lower and one upper on the Melee Macchiato side.
- **Final boss:** guidance centers on active weak points and blue-blast cover. Exact meta weapon, high-damage exploit and support-item kill-count promises were omitted because they vary with updates. Conflicting mouth/shoulder advice during tongue grabs is resolved to assisting via the currently exposed weak point while avoiding the lane.
- **Stamin-Up / unicorn room:** older wiki uses “Communications”; modern map and side guide specify Control Center above that route. Authored perk and plush locations use Control Center, while the quest laptop remains outside Communications.
- **Pirate treasure:** carry one cursed coin at a time. The watch X changes; the three skeleton landmarks do not. Sources disagree on whether the final three rounds must be spent on Crab Island. The guide sends the player there and describes advancing until the storm, avoiding a claim that elsewhere necessarily resets it.
- **Cooking ingredient:** the white item on the Living Quarters fridge is variously called salt/snowball; the guide uses its physical landmark and effect. Plain fish for Peck is separate from consuming the enhanced achievement dish.
- **Fish count:** the old wiki says “50(?) groups”; current dedicated guide and independent walkthrough agree on **50 individual fish per player**. The product uses that instruction, with the source disagreement retained here.
- **Newer hidden rewards:** both maps’ hidden Fire Sale models require shooting the other seven models first. Added those plus the church candle fire trap, which is absent from the old Liberty wiki. The fire damages players too, and the guide says so at the step.
- **Rewards:** bank/car/vending/meteor rewards are random; no guaranteed Ray Gun promise. Mega Stuffy is temporary and cannot enter Patient 13’s arena. Fixed source disagreements about exact Essence amounts for repeated teleporting do not affect the route, so only the confirmed type of reward is stated.

## UX alternatives and chosen implementation

1. A single large checklist would be quick to build but force players to memorize the lab diagrams and Strauss inversion.
2. Linking existing external calculators would lose saved observations and require leaving the guide.
3. Dedicated visual controls alongside the existing Quick Parts / Full Details structure preserve the site’s familiar reading experience and reduce actual in-match errors. **Chosen.**

The lab helper has three separately labeled symbol groups, authentic image choices, large ordered results, expandable arithmetic and full reference imagery. Selections can be cleared by clicking them again; missing inputs never show a made-up code. Zero is preserved. Its result does not auto-advance the game or infer current match state.

The Strauss helper places the three real locations beside color controls labeled with both color and energy level. It displays the target projector separately, so the input/output relationship is explicit. Confirmation is manual and changing a reading clears its confirmation.

The Aetherella helper is a photo collection checklist. It shows all nine locations, a count, and the immediate-transform consequence of the last pickup. A fake valve solver or running game timer was rejected because neither would know in-game state. The existing manual main-quest checklist handles pressure and capture progress more honestly.

Vault and Nathan clues use compact ordered code recorders; their field labels preserve source order and their patterns retain leading zeros. All helpers use the existing shared persistence/undo/reset composable and device-local storage. Color is supplemented by text, controls use native buttons and checkboxes, and symbol targets are keyboard accessible.

## Files and verification

- Authored guide/tool data: `shared/bo6-launch.mjs`.
- Pure rules and photo metadata: `app/utils/bo6Launch.mjs`.
- Custom UI: `app/components/puzzle/Bo6TerminusLab.vue`, `app/components/puzzle/Bo6LibertyFalls.vue`.
- Source manifests: `public/images/bo6-terminus/sources.json`, `public/images/bo6-liberty-falls/sources.json`.
- Unit/structure tests: `tests/bo6-launch.test.mjs` covers missing inputs, zero, absolute value, invalid second results, all 216 combinations, Strauss per-location state, nine distinct figures, unique phase/step IDs, tool references and local image existence.
- Root integration owns aggregate registration, generation, production build and final browser checks. The authored exports never edit the generator or shared aggregate modules.

The Impeccable launcher could not install its context engine within its cache permissions. The existing puzzle components and site tokens were used directly; no design-system replacement or global styling change was introduced.
