# Puzzle and guide verification

Implemented 19 September 2026. The implementation follows `guide-and-tool-improvement-plan.md`.

## What changed

- Fixed the actual desktop contents bug: the `contents` class collided with Tailwind's `display:contents` utility, so the navigation did not have a scrollable box. Renamed it and added bounded flex sizing. The mobile drawer now uses that same scrolling child; two nested scrolling containers previously trapped wheel gestures.
- Quick Parts has one optional checkbox per objective, compact bullets, manual collapse and a saved hide-completed preference. Existing child IDs still store progress, including indeterminate legacy progress. Rex also gains a prerequisites part for the Blight/Talon tools.
- All 13 original standalone tools use the same puzzle components as their guide helpers. Added Paradox Note Order & Piano, search entry and desktop shortcut `Ctrl+Alt+1`.
- Fixed serum chalkboard input, rocket formatting, organ static position, three-digit Mars formatting, planet direction collisions, scroll rule consistency, flag capacity, murder clue separation, ring playback, lever landmarks, house-symbol recording, uranium activation groups and Wunderbarrage's map context.
- Paradox has explicit era labels, note location photos, compact RC-XD/headset/ball references and a clock timing diagram. Photo references remain optional; no guessed map coordinates or external solver dependency.
- Replaced the separate Rex inline riddle table with the shared helper. Moved Astra books/organ helpers to the actual full-walkthrough actions and gave the three main parts precise detail anchors.

## Mechanic evidence

These are source comparisons and automated/browser checks, not an in-game playtest.

| Tool | Evidence and decisions |
| --- | --- |
| Ashes serum / rockets | [Illustrated walkthrough](https://mmmrkennedy.com/games/BO7/ashes_of_the_damned/ashes_of_the_damned_guide), compared with existing full guide. Serum rows are top-to-bottom, independent of collection order. The four rocket words retain six two-digit A=00 values. |
| Astra organ | [Community walkthrough](https://steamcommunity.com/sharedfiles/filedetails/?id=3624863442) and local full guide. Preserve the static slot, infer the unused symbol there. The five symbol assets already exist locally. |
| Astra Mars / directions / books | [Astra solver](https://codzombiessolver.com/astra-malorum) and existing walkthrough/book reference. Distinguish O.S.C.A.R.'s three digits from telescope DEC's four digits. Direction is stored per planet. Book groups remain the established three shelf groups; show all three counts, including zero. |
| Kowakujō scrolls / flags | [Independent scroll solver source](https://github.com/MySw33tPareidolia/Kowakujo-solvers/blob/main/solver.cpp), [illustrated quest](https://codzombiesguides.com/main-quests/black-ops-7/kowakujo/) and [existing solver](https://codzombiessolver.com/kowakujo). Self plus orthogonal toggles; two holders per area; flag values 1–6. Blank targets are not zero. |
| Kowakujō murder | Same quest/source comparison. Published symptom mappings differ. The UI exposes ambiguity and requests the actual poison evidence; it does not derive poison from the accomplice. Death Records supplies death time, Poison Compendium supplies delay, fourth painting supplies location. |
| Rex rings | [Reference solver](https://codzombiessolver.com/rex-infernus), exercised in the browser. Independent fixture: inner Caltheris / middle Empty / outer Dravakar → Veytharion with clockwise counts inner 3 / middle 1 / outer 2. Also checked House/House/House → Veytharion (4 per ring). Replayed under the one/two/two coupling. Tour visits represent alignment, not quest completion. |
| Rex pillars | All four reference-solver outputs exercised. Columns are **left beside Armor / right opposite Armor / bottom lower crank**: `(0,3,2)`, `(3,1,2)`, `(1,2,2)`, `(2,2,0)`. This resolves the old middle/right ambiguity. Short distinctive opening phrases avoid an oversized quote picker. Counts assume the initial positions; no unverified in-game reset method is suggested. |
| Rex house | [Quest instructions](https://codzombiesguides.com/main-quests/black-ops-7/rex-infernus/) and its [four-symbol screenshot](https://codzombiesguides.com/content/rex-infernus/rex-infernus-house-symbols.webp), visually compared with the existing local house photograph. Four named regions replace arbitrary clicks; keyboard buttons duplicate the markers. Symbols follow the basketball trigger and round changes. The hotspot centers identify facade regions, not pixel-perfect aiming points. |
| Totenreich uranium | [Model author's original explanation](https://www.reddit.com/r/CODZombies/comments/1t3q1i1/experimental_totenreich_claw_machine_solver/) and [later exhaustive analysis](https://www.reddit.com/r/CODZombies/comments/1t6u85o/totenreich_claw_machine_can_actually_be/). Only orthogonal groups containing inserted Uranium activate. Accepted activated-size patterns: 7, 8, 7+1, 7+2, 6+3, 7+1+1. [Official patch notes](https://www.callofduty.com/patchnotes/2026/04/call-of-duty-black-ops-7-season-03-patch-notes) mention configuration fixes: the historical census is a regression fixture for this model, not a claim that current matches necessarily contain unwinnable boards. The UI labels the model and asks players to confirm the gauge. |
| Wunderbarrage | [Totenreich solver](https://codzombiessolver.com/totenreich) and local quest instructions. Two separate amplitude/frequency pairs; left range 1–7, right 1–8. Correct Totenreich return navigation. |
| Paradox notes / locations | [Illustrated quest with eight locations](https://codzombiesguides.com/main-quests/black-ops-7/paradox-junction/), [existing solver](https://codzombiessolver.com/paradox-junction), [piano discussion](https://www.reddit.com/r/CODZombies/comments/1rtva4z/paradox_junction_piano_keys_step/). Outdoor count assignments randomize; piano reference is 8 6 7 5 6 5 3 5. Missing/duplicate counts cannot become a completed route. Optional final count is explicitly inferred. Location photos are linked to the illustrated source, with text fallback. |

## Persistence

New state keys are `codwiki-puzzle-{id}-v2`. Inputs are sanitized; answers are derived rather than persisted. Nuxt state shares inputs between inline and standalone instances. Undo is scoped per puzzle and retained during in-app navigation.

Compatible legacy inputs migrate for rockets, Mars, planet sheets, uranium's original tubes, Wunderbarrage, rings and pillars. Old saved answers/playback are never imported. Serum collection order, organ sequences without a gap and other incompatible formats are retained under their original keys; the UI explains why clues must be entered again. House's old `cw-rex-house-symbols` markers remain visible in a separate reference image without snapping coordinates. Reset affects only the selected puzzle. Map progress reset continues to preserve other maps, toys, pins and reading preferences.

## Checks performed

- Production build passed (`npm run build`). The first sandboxed attempt hit Windows `readlink` permissions in Nitro dependency tracing; the authorized build completed outside that restriction.
- 24 Node tests: original nine regressions plus mechanic, state, migration and desktop upgrade/shortcut tests.
- Desktop 1.4.0: Windows NSIS installer and portable ZIP built successfully. Inspected the packaged ASAR to confirm the version and Paradox route. Tested older sidebar layouts, new shortcut insertion, custom/cleared shortcut preservation, collision handling and shifted digit shortcuts. JavaScript syntax checks passed. The native Electron window was not manually exercised in this follow-up.
- All 512 scroll boards solve and replay to all-IN under an independent mask fixture.
- All 216 ring starts × four destinations replay to their target; tour visits and already-complete tour also checked.
- All 8,008 six-tube uranium layouts reproduce the author's historical model census: 7,934 with a solution, 74 without. Includes fixtures proving that untouched groups are inactive.
- Four rocket codes, five possible organ gap positions, flag inventory/capacity, note order/duplicates/missing counts, zodiac wraparound and partial part progress tested.
- Browser: all 14 standalone pages render with no horizontal overflow at 1280px and 390px. No broken local images observed. Tested serum inline → standalone shared inputs and scoped reset, Paradox correction/undo and refresh persistence, organ middle-gap output, and ring diagram playback/reset after edits.
- Contents: desktop wheel reaches the final Tools entry (562px visible region, 2,072px content); mobile drawer reaches its final item (437px visible region, 1,974px content) and closes correctly on navigation. Pins remain accessible. At 640×360, keyboard focus scrolls the last entries into view and the drawer stays within the viewport.
- Built-app check: checking a part updates the part total, hiding completed parts collapses it, and navigating to that part reopens it. No production browser errors observed in this flow.
- Ashes representative height comparison at 1280×720 with parts expanded: **2,863px before → 1,763px after (38.4% shorter)**, including two collapsed helper disclosures. Quest checkboxes: **25 → 8**. This measurement does not claim the same percentage for every map.

## Remaining evidence limits

- No live-game playtest was available. Uranium remains a labeled community model and ambiguous poison clues require player confirmation.
- The original schematic map and generic music-staff decoder were optional ideas, not shipped: verified location cards/photos and the fixed piano reference cover the observed quest without guessed geometry.
- Existing long imported full guides retain their original heading structure; Nuxt Hints reports pre-existing multiple-H1 warnings. These do not affect the new puzzle outputs.
