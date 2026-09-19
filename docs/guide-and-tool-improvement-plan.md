# Guide and puzzle tool improvement plan

Research date: 19 September 2026. Status: implemented. See [verification and evidence](puzzle-verification.md) for changes, tests and remaining gameplay evidence limits.

## Scope and evidence

Reviewed all 13 standalone tool pages, the three inline helpers, quick quest data for all six maps, guide navigation, saved-state code, catalogue generation and existing tests. Findings below distinguish code defects from game mechanics that need further confirmation. This was a source audit and web research pass, not an in-game playtest or browser reproduction of the scrolling issue.

The existing visual theme should stay. The goal is less scrolling, fewer progress controls, and tools that accept the clues players actually see and return the action they need to perform.

## 1. Make every contents entry reachable

Files: `app/components/GuideArticle.vue`, `GuideContents.vue`; inspect `WikiViewer.vue` for the equivalent case.

The desktop aside has a viewport-based height and its `.toc` container clips overflow. The old `.toc-scroll` rule provides a shrinking flex child, but the current template renders `GuideContents` without that class. The new `.contents` has `overflow:auto` but lacks an explicit flex sizing contract. This is a likely layout cause; confirm with actual computed sizes before implementing.

Implementation:

- Give the navigation an explicit `flex:1 1 auto`, `min-height:0` and vertical scrolling within the bounded contents panel. Keep its title and saved-progress footer outside the scrolling region.
- Size the panel against the available viewport, accounting for the actual page header and bottom spacing. Use dynamic viewport units with a fallback.
- Keep a visible scrollbar and ensure keyboard focus scrolls offscreen entries into view.
- Check the mobile contents drawer separately so it has one usable scrolling region and its last entry remains reachable.
- Preserve group expansion, pins, active section and deep links. Navigating to a hidden/collapsed part must open it before scrolling.

Acceptance: the final contents link can be reached by wheel, trackpad and keyboard on a short desktop window, at 200% zoom, and in mobile portrait/landscape. Verify Quick Parts and Full Details with every group expanded and several pins.

## 2. Replace per-action quicksteps with compact quest parts

Files: `QuestSteps.vue`, `GuideArticle.vue`, `app/data/quickQuests.json`, `useProgress.ts`, `app/utils/companion.mjs`, catalogue search labels and affected links.

Use **Quick Parts** and **Full Details** as the two reading views. Each part gets a small numbered heading, one optional completion checkbox, a Full details link, and a short list of actions. Remove individual action checkboxes and oversized row separators. Keep prerequisites, failure conditions and required map versions visible.

Current grouping is a starting point, not a reason to keep a wall of text:

| Map | Current action checkboxes | Existing parts |
| --- | ---: | ---: |
| Ashes of the Damned | 25 | 8 |
| Astra Malorum | 25 | 4 |
| Paradox Junction | 19 | 6 |
| Totenreich | 19 | 5 |
| Kowakujō | 19 | 6 |
| Rex Infernus | 18 | 4 |

- Reduce part gaps, heading padding and bullet spacing; retain comfortable text size and touch targets.
- Aim for 2–5 short bullets per part. Where current parts are too broad, divide at a meaningful objective rather than making text smaller.
- Keep parts expanded initially. Add a saved “Hide completed parts” preference and manual expansion; checking a part must not unexpectedly move keyboard focus or jump the page.
- Keep the next unfinished part easy to reach without requiring progress tracking.
- Tools appear at the relevant bullet as compact expandable helpers. Their full-page routes remain useful on a second monitor or desktop shortcut.
- Target at least a 30% reduction in representative quick-view page height at the same viewport and font setting; measure against a captured baseline. Do not achieve this by hiding essential instructions.

Progress compatibility: initially reuse stable child step IDs. A part is complete when all its child IDs are complete; toggling the part updates those IDs in one save. Preserve partial legacy progress without showing dozens of controls (an indeterminate part checkbox can represent it). Keep phase anchors and legacy aliases stable. Resetting one map must continue to preserve other maps, pins, preferences and extracted toys. Do not change the separate Super Easter Egg completion model accidentally.

## 3. Fix and improve every existing tool

### Ashes — Serum Ingredient Order: rebuild the input and instructions

**Confirmed:** the current page asks for collection order and says to drink ingredients. The local full guide and the [illustrated Ashes walkthrough](https://mmmrkennedy.com/games/BO7/ashes_of_the_damned/ashes_of_the_damned_guide) instead describe matching the chalkboard from top to bottom.

Create three editable slots labelled Top, Middle, Bottom. Offer Pigpen word images/symbols alongside decoded words and actual ingredient names. The verified mapping is FUNGI → Widow’s Lantern; LIMBS → Mysterious Limb; OCULI → Ravager Eyes; CONCH → Hoard Hunk Chunks; TALUS → Human Bones.

Output the three ingredients in interaction order, with the item image and optional collection hint. Add undo, per-slot replacement and reset. Correct the quick summary that currently resembles a fixed five-ingredient order. Do not interpret existing saved pickup order as a verified chalkboard solution; version/reset that tool’s incompatible input only.

### Ashes — Rocket Launch Codes: share the better Pigpen selector

The numeric conversion agrees with the inline helper; the standalone input and wording are worse. Extract one shared helper for both contexts. Show four selectable Pigpen words, readable labels, and six two-digit outputs aligned left to right. Explain that the numbers are values to lock on the six monitors using their red buttons, not numbered targets to shoot. Retain the leading zero in values such as `00` and `04`.

Keep the code and input visible together. Include compact retry guidance with the detailed explanation collapsed. Verify all four outputs against the [same illustrated walkthrough](https://mmmrkennedy.com/games/BO7/ashes_of_the_damned/ashes_of_the_damned_guide).

### Astra — Harmonic Organ Order: preserve the static slot

**Confirmed:** code appends the missing pillar to the end, although the local full guide says to insert it at the distorted position. The [community walkthrough](https://steamcommunity.com/sharedfiles/filedetails/?id=3624863442) also describes a five-position sequence with one obscured slot.

Use five editable slots. Select four distinct symbols and mark the actual static/noise position; infer the unused symbol into that position. Display the symbol-to-pillar reference and complete interaction sequence. Use keyboard-accessible buttons. Fix the misplaced organ link currently attached to a six-wave relic instruction and add links at the actual organ step in both views.

### Astra — Mars Console Code: correct formatting and purpose

The page generates three padded pairs, while the local guide and inline helper expect a three-digit terminal code. Render three single digits, preserve the observed order and offer undo/slot replacement. Name the destination clearly so it is not confused with the separate Mars declination code. Reuse this logic in `AstraPlanetCodeHelper.vue`; avoid duplicate implementations with different behaviour. The [existing Astra solver](https://codzombiessolver.com/astra-malorum) separates these two codes as well.

### Astra — Planet Sheets: input by planet

Current direction-first storage allows only one planet in a compass cell and silently overwrites earlier input. Replace it with one direction selector for each of Mars, Saturn and Neptune; derive the compass display from those values. Do not impose unique directions without game evidence. Use full planet names, a visible orientation reference and the three sheet-location hints. Allow several labels on one direction. The [Astra solver](https://codzombiessolver.com/astra-malorum) provides independent planet-direction inputs.

### Kowakujō — Pestle Scroll Solver: one verified rule

**Confirmed code defects:** automatic fallback can solve under one rule while `applyPress` uses another; changing the rule retains the old solution; an initially solved board gets awkward empty-result handling.

Verify the standard self-plus-orthogonal-neighbours rule against observed boards. The [independent solver source](https://github.com/MySw33tPareidolia/Kowakujo-solvers/blob/main/solver.cpp) implements that rule. Remove silent rule switching. Keep a clear input board and a compact highlighted solution; distinguish editing the observed board from following moves. Recompute/invalidate after edits, provide undo, and mark success only when the simulated board actually reaches all-IN. Do not require a click for every in-game press.

### Kowakujō — Clock & Flags: enforce the actual capacity

**Confirmed:** blank inputs currently become zero, 3–4 flags per location are permitted, and editing inputs leaves old results displayed. The [illustrated quest guide](https://codzombiesguides.com/main-quests/black-ops-7/kowakujo/) describes two flag holders per area.

Require four valid targets, constrain allocations to two flags per area, verify the real flag-value range, and use group symbols plus verified area names. Preserve global inventory constraints. Recompute or visibly invalidate results when inputs change. Show one compact placement table and optional alternatives; render alternatives as structured UI instead of literal HTML strings. Review the early 200-solution cutoff before claiming globally minimal flag use.

### Kowakujō — Murder Mystery: rebuild around the real clues

**Confirmed:** Reset has no handler; instructions invent a D.I.E. remote step; time of death is attributed to the fourth painting; symptom options are disabled based on an unsupported suspect relationship.

Use distinct inputs for witness identity, Death Records wording, toxin evidence/delay, and fourth-painting background. Keep the five-item result and zodiac answer together. The fourth painting is a location clue; the Death Records and Poison Compendium supply the clock information. Remove unsupported suspect-based poison restrictions and show known fixed items immediately.

**Research gate:** published sources differ on how much symptom text alone establishes the poison. The [illustrated guide](https://codzombiesguides.com/main-quests/black-ops-7/kowakujo/) allows ambiguity for some symptoms; the [independent solver](https://github.com/MySw33tPareidolia/Kowakujo-solvers/blob/main/solver.cpp) uses simpler mappings. Verify complete in-game note wording before finalizing automatic selection. Until evidence resolves it, offer an explicit poison choice from the player's compendium and do not fabricate certainty.

### Rex — Temple Ring Solver: fix playback and make input obvious

**Confirmed:** `stepCapHtml` calls a pure `move()` function without assigning its returned state, so the displayed alignment can remain the starting alignment. The diagram also always uses the starting state. Initial temple visitation can be duplicated in checkpoint output.

Verify movement coupling and orientation against the [existing Rex solver](https://codzombiessolver.com/rex-infernus). Add accessible inner/middle/outer position selectors alongside the diagram. Show a compact crank summary first, with optional Prev/Next playback that actually updates the diagram. Make tour mode optional and distinguish reaching a temple from completing its quest. Permit excluding already completed temples if tour mode is retained.

### Rex — Pillars & Levers: preserve the lookup, clarify the controls

Keep riddle matching, but use exact verified text, distinctive keywords, physical lever landmarks and an annotated orientation reference. Existing sources label controls differently; resolve left/back/right versus left/right/bottom before relying on array order. The [Rex solver](https://codzombiessolver.com/rex-infernus) uses physical landmarks. Confirm all four count triples and the initial-position prerequisite; explain how to recover after earlier pulls using a verified reset method. Add reset/undo for tool input.

### Rex — House Symbols: replace arbitrary image clicks

The current tracker accepts any image coordinate and only outputs “1 → 2 → 3 → 4”. Add verified clickable hotspots with location names and an ordered thumbnail strip, plus keyboard selection, undo and replacement. Verify the actual spawn cadence before retaining the present “one every round from round 5” claim. Preserve valid saved markers or migrate them explicitly; do not silently snap them to the wrong hotspot.

### Totenreich — Uranium Pincers: correct the model before polishing it

**Confirmed mismatch:** the local guide lists 6+3, 7+2 and 7+1+1. The solver accepts 6+1+1+1, 7+2 and 7+1+1 instead. Moreover, treating every occupied connected component as activated may be incomplete.

The [experimental model author's later analysis](https://www.reddit.com/r/CODZombies/comments/1t6u85o/totenreich_claw_machine_can_actually_be/) describes additional activated-node patterns. Treat this as community reverse engineering, not an official game specification. Verify which groups receive uranium activation and collect confirmed success/failure boards before replacing the scoring model. Check relevant game updates during implementation.

Keep the 4×4 entry grid, using buttons with row/column labels. Clearly distinguish existing tubes from the three additions without relying only on colour. Provide alternative layouts when valid and a useful no-solution explanation. Avoid “any layout works” or mathematical certainty until the model is validated.

### Totenreich — Wunderbarrage: fix map context and simplify recording

**Confirmed:** `ToolShell` identifies Ashes and returns to its guide. Correct it to Totenreich. Show two compact rows with Left/Amplitude and Right/Frequency, direct number entry/selection, clear unset states and reset. Retain the two sequences separately. The [Totenreich solver](https://codzombiessolver.com/totenreich) matches this input/output pattern. Verify limits and timing instructions before making them hard constraints.

### Remaining inline helper — Astra busts/books

Audit all nine titles and statue orientation against game references. Keep selection tiles rather than a task checklist, show all three bust counts including zero, add reset and shared persistence, and place the helper at the relevant quick part and full-detail step. Pigpen and planet-code inline helpers are covered by the shared replacements above.

## 4. Paradox Junction tools

The [existing Paradox solver](https://codzombiessolver.com/paradox-junction) has a music helper, location map and staff-to-piano conversion. Use it as a comparison, not a new dependency. Its generic notation entry is more work than the default CodWiki flow needs.

### First priority: Note Order & Piano helper

Core interaction: select a location, record its observed blink count, and get an ordered pickup list. No music knowledge or note-by-note completion checklist is required.

The [illustrated Paradox quest guide](https://codzombiesguides.com/main-quests/black-ops-7/paradox-junction/) identifies eight fixed locations in Destroyed Nuketown:

1. Green backyard bunker, left side.
2. Yellow backyard garden fence.
3. Cul-de-Sac bus.
4. Cul-de-Sac fence near teleporter.
5. Trinity garage door near alley.
6. Trinity brick wall near M8A1.
7. Trinity rock near Pack-a-Punch/tree.
8. Trinity broken fence near Exfil.

Build location cards first; add an original schematic after checking spatial placement against screenshots. Do not guess coordinates. Each card has a short label, optional reference image and a count selector from 1–8. Sort the output by count. Show missing counts and duplicate conflicts; never silently overwrite another location or call incomplete data solved. A single unresolved count may be suggested by elimination, clearly identified as inferred.

Keep inputs and ordered results visible together on desktop and in a compact stacked layout on phones. Optional “Next location”/“Back” controls aid traversal without eight checkboxes. Save assignments, support correction/undo, and offer a fresh puzzle reset.

The piano reference is a separate compact panel: `8 6 7 5 6 5 3 5`, with a labelled keyboard useful to controller players. [Player reports and reference discussion](https://www.reddit.com/r/CODZombies/comments/1rtva4z/paradox_junction_piano_keys_step/) distinguish the fixed tune from randomized collection order. Do not apply the tune to the outdoor pickup route. Generic staff decoding can remain an optional future feature if verified variants justify it.

### Second priority: era-aware quest reference

Put explicit **Normal** and **Destroyed** labels beside actions in the compact guide. Add a small reference for each of the three quest branches, showing its prerequisite, current era/location and reward. Reuse the same part completion state. Avoid a second competing quest checklist or an unverified “optimal” teleport route.

### Small location helpers

Add expandable, illustrated location references for the RC-XD controller, headset and red ball inside their respective parts. These do not need three separate tool pages. A clock hand/timing illustration is also more useful than a calculator for that step. Prioritize these after the note-order tool and confirmed existing-tool fixes.

## 5. Shared implementation rules

- One puzzle component and rule module per mechanic, reused inline and in the standalone page. No separate answer tables that can drift.
- Inputs match in-game clues; outputs name the exact action and destination. Keep explanations available without placing long introductions above inputs.
- Provide consistent undo, replacement and reset. Require no progress clicks just to read an answer.
- Use real buttons, labelled fields, focus states, readable image fallbacks and live result announcements. Do not infer state solely from colour.
- Validate saved enums, array lengths, uniqueness and ranges. Current `useToolState` only does shallow type checks.
- Persist validated inputs and intentional traversal state; recalculate derived answers. Version incompatible formats so obsolete solutions cannot reappear after logic fixes.
- Make inline and standalone instances reactively share state within the session. Keep resets scoped to the specific tool unless the user deliberately starts a fresh puzzle set.
- Add source URLs and verification notes to puzzle data/developer documentation. Keep uncertainty visible where the mechanics remain unverified.
- Register new routes in `shared/catalogue.json`, add links to the correct guide parts, and regenerate search and desktop navigation through the existing script. Resolve any additional keyboard shortcut assignments without collisions.

## 6. Delivery order and checks

1. Capture layout baseline and reproduce the contents clipping. Implement and check the navigation fix.
2. Convert Quick Parts and progress compatibility. Measure height reduction on all six guides.
3. Correct serum, rockets, organ, Mars code, murder clue sources/Reset, flags capacity and Wunderbarrage map context. Validate uncertain mechanics before replacing their tables.
4. Fix scroll/ring state handling; complete uranium model verification and remaining tool usability work.
5. Add the Paradox note-order tool and compact piano reference, then era/location helpers.
6. Integrate shared inline components, catalogue entries, search links and documentation. Complete targeted regression checks and production build.

Test puzzle logic with meaningful independent fixtures: all four rocket codes; all five possible organ gap positions; scroll solutions across all 512 board states under the verified rule; ring moves across 216 states with replay reaching the requested target; flags allocations respecting inventory and two slots; confirmed uranium success/failure layouts; poison clue fixtures and zodiac wraparound; randomized note-order permutations plus duplicates and incomplete input.

Test state behaviour: old partial progress, completed parts, refresh, invalid saved input, tool-specific reset, map reset isolation, inline/full-page handoff and stale-result invalidation. Test visual behaviour at 360–390px widths and short desktop/desktop-app windows, with keyboard and zoom. Confirm no missing symbol assets, cropped result strips or wrong-map returns.

Run `npm test` and `npm run build` after implementation. Existing tests mainly cover navigation/progress/catalogue behaviour; passing them alone will not establish puzzle correctness. Gameplay fixture validation remains a separate requirement for the uncertain rules above.
