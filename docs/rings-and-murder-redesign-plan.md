# Temple rings and murder mystery redesign

Approved plan, implemented 19 September 2026. See `puzzle-verification.md` for the follow-up validation record.

## Findings

- The ring solver already searches ring positions plus the set of temples reached. It can find a minimum-press tour, but that option is buried in a destination dropdown. The visualiser is hidden in a disclosure, its markers are all the same colour, and the route is a long list of individual presses.
- The previous ring UI had direct visual position entry and explicit alignment/tour modes. Restore those useful interactions while keeping correct playback and shared saved inputs.
- The murder rewrite introduced a functional regression: it infers candidates from the symptom alone and asks the player to supply the poison. The reference resolves the poison from the accomplice AND symptom. The existing automatic plant-to-plum-pit rule is wrong for the Courtier case.
- The earlier murder UI had useful image choices, painting thumbnails and a zodiac wheel. Its old logic and instructions must not simply be restored: its Gardener mappings differed from the current reference, and it incorrectly described the fourth painting as the death-time source.
- Existing local assets include every placement item, three painting thumbnails and twelve zodiac SVGs. Reuse these with better sizing, spacing and labels.

## Reference research

Primary reference: [Margwa Kowakujō guide](https://margwa.net/kowakujo.html) and its linked [Murder Case Solver](https://margwa.net/kowakujo-murder-solver.html).

All nine accomplice/symptom combinations were exercised through the reference's visible form on 19 September. These are observed reference results, not claims of an in-game playtest:

| Accomplice | Emesis / vomiting | Noxious plant | Paralysis |
| --- | --- | --- | --- |
| Merchant | Unknown combination | Plum Pit | Pufferfish |
| Courtier / Noble | Pufferfish | Monkshood | Unknown combination |
| Gardener | Plum Pit | Unknown combination | Monkshood |

The reference uses the death-time animal from the Doctor's Record and a separately entered Toxin Note delay of 1–5 positions. Rat minus five positions was checked and returned Goat. All three background mappings were checked: Fish returned Tea Whisk, Mountains returned Horse Statuette, and Bird returned Calligraphy Brush. Its unknown combinations must stay unresolved; do not invent an answer or label them proven impossible.

The [Rex reference solver](https://codzombiessolver.com/rex-infernus) provides an independent single-destination comparison and confirms the stop order. Existing verified movement fixtures are retained.

## Shared visual direction

- Keep CodWiki's theme-aware surfaces, warm gold emphasis and readable typography. Give these two tools purpose-built layouts instead of laying every control out as a generic form.
- Desktop standalone pages can use a wider, opt-in tool shell (approximately 1040–1120 px). Diagram/clues occupy the main area; the route or solution occupies the adjacent area. Do not widen every other tool.
- Use available container width to choose columns: inline guides and the desktop application's sidebar reduce the usable space even on a large screen.
- On phones, stack the same panels. Avoid an internal scrolling region, oversized sticky panels or hidden core controls.
- Separate selectable cards from output cards visually. Use clear borders, restrained selected-state fills, readable labels and consistent image wells. Keep images at their natural aspect ratio with `object-fit: contain`.
- Keyboard-operable buttons, visible focus and at least 44 px touch targets. Meaning must be carried by labels/shapes as well as colour. Respect reduced motion and test both dark and Paper themes.
- Optional help stays collapsed. Position entry, route generation, clue choices and the answer stay visible.

## 1. Temple Ring Solver

### Main layout

Desktop arrangement:

```text
Temple Ring Solver             [All four temples | One temple]
--------------------------------------------------------------
Interactive ring diagram       Find shortest route
                               Current positions: I / M / O
Inner / Middle / Outer picker   Optional: temples already done
Six named position buttons     [Find shortest route through all 4]

Current or preview indicator   Temple A -> B -> C -> D
Preview controls               Next temple: clear grouped turns
                               Later temple legs collapsed
```

- Default to the four-temple route on a new run, with one-temple alignment as a visible secondary mode.
- Always show a large concentric-ring diagram. Mark all six stops, distinguish the four temples from House/Empty and identify each pillar with I/M/O plus a distinct marker treatment.
- Select Inner, Middle or Outer, then click a labelled stop to record its position. Provide equivalent named controls for touch/keyboard; avoid overlapping invisible SVG hit areas.
- Keep all three recorded positions visible next to the diagram. On a fresh/reset run, require entry rather than treating three default Empty values as an observed position. Preserve valid existing saved positions.
- Show a direction indicator and animate the one/two/two coupled motion when previewing a turn. The selected ring advances one stop; each other ring advances two in the chosen direction.

### Route calculation

- A prominent explicit button calculates the complete route from the three recorded current positions. Label it “Find shortest route through all 4”; if temples were already completed, use “Find shortest remaining route”.
- “Shortest” means the fewest ring-button presses. Among equally short routes, prefer fewer lever direction changes. Do not claim a fastest completion time in seconds, since temple quest durations and player movement are not modelled.
- Track positions, reached-temple mask and previous direction in the search, using a lexicographic cost of `(presses, direction changes)`. The first chosen direction has no switch cost unless an actual starting lever direction is supplied.
- Optimise the entire tour jointly, not the nearest next temple followed by repeated one-temple solving. Include intermediate alignments encountered during a route.
- An unfinished temple already aligned at the start becomes a zero-press first stop: explicitly say to finish it before moving. A temple marked completed is skipped as an objective. Alignment and quest completion remain separate concepts.
- If all four temples are marked done, show “All temples marked complete”; if one-temple mode starts aligned, show “Already aligned — 0 presses”.

### Following the route

- Show temple visit order, total presses and direction changes at the top.
- Divide instructions into one leg per temple. Expand the next leg; show the others as compact summaries. Each leg names the ring, direction and number of presses, followed by an explicit stop to complete that temple's quest.
- Group consecutive identical actions for readability, but never merge across a temple arrival or reorder a tour's instructions. Aggregate ring totals alone are unsafe for a tour because intermediate alignments matter.
- Previous/next press and jump-to-temple controls update the visualiser. Previewing must never overwrite recorded current positions or mark a temple completed.
- A deliberate “Temple completed — continue” action can adopt that checkpoint's positions and mark its quest complete. No checkbox is required for every press. “Use shown positions” can adopt an intermediate preview after the player confirms that is where the rings actually are.
- Allow correcting any position and recalculating from there. Clear or visibly invalidate an old route when relevant inputs change; never display stale directions as current.
- Undo reverses a recorded change. Reset affects this tool only. Save confirmed positions/completed temples, not an obsolete calculated route.

## 2. Murder Mystery Solver

### Input layout

Desktop arrangement:

```text
Murder Mystery Solver
--------------------------------------------------------------
Clues                              Placement solution
Accomplice: three image cards       1   2   3   4   5
Symptom: three readable choices     Large item images and names
                                   Unresolved slots name the
Doctor's Record: animal selector    specific missing clue
Toxin Note: [1] [2] [3] [4] [5]
                                   Zodiac dial visual
Fourth painting: image cards        “Set dial to [animal]”
```

- Accomplice cards use the existing Abacus, Noble's Hat and Shears pictures, with Merchant / Courtier (Noble) / Gardener labels. Cards select with one click and retain a clear selected state.
- Three symptom choices use short titles with the matching phrase from the note beneath them. The source label must say Doctor's Record. Do not infer symptom from the accomplice.
- Derive the poison automatically from the verified combination table. Remove the mandatory manual poison picker from the ordinary flow.
- Unknown combinations show “Recheck accomplice and symptom — this combination is not documented”, leaving the poison slot unresolved. Do not silently alter the selected clue or block a combination as impossible without evidence.
- Death-time selection uses the existing animal icons, with Hare/Rabbit and Boar/Pig aliases. A visible wheel can show the chosen animal and computed result; a compact labelled picker provides an equally usable keyboard/mobile input.
- The poison delay is five clear buttons, labelled as positions from the Toxin Note. Keep it independent of the poison item and accomplice.
- Fourth-painting selection uses the existing Fish, Mountains and Bird thumbnails. This determines the placement item, never the death-time animal.

### Output layout

- Keep the existing item pictures, enlarged to roughly 72–96 px on desktop within consistent display wells. Number the five painting positions prominently and show full item names below.
- The placement result stays ordered: Comb; accomplice item; derived poison; painting-background item; Crest Medallion.
- Fish maps to Tea Whisk, Mountains to Horse Statuette, Bird to Calligraphy Brush. Verify all three against the reference before implementation is accepted.
- Empty variable slots say exactly what is missing, e.g. “Choose accomplice” or “Choose accomplice + symptom”. Known fixed items may remain visible immediately.
- The zodiac answer is a separate, prominent instruction with its animal icon and a short explanation of the backward movement. Do not suggest that the dial animal belongs beneath a painting.
- On narrow screens, render the five placements as a compact numbered list with image/name on each row; preserve the same order without tiny cards or sideways scrolling.
- Updating a clue refreshes only the affected outputs. Keep Undo and Reset in a quiet footer; no per-item completion checkboxes are necessary.

## Implementation and saved-state plan

1. Record reference fixtures and implement pure murder deduction separately from the UI. Add explicit known/unknown/incomplete outcomes and delay bounds.
2. Extend ring tour selection to break minimum-press ties by lever changes and return temple checkpoints plus route legs. Keep the validated movement model.
3. Build reusable ring-diagram and evidence-card pieces where that reduces duplication. Apply the redesigned components to both inline and standalone tools through the existing PuzzleWidget mapping.
4. Add an opt-in wide layout to ToolShell/PuzzlePage and styles scoped to these tools. Keep unrelated tools and page layouts unchanged.
5. Migrate existing saved clues/positions carefully. Retain compatible clues; map Courtier/Noble aliases consistently; stop trusting previously saved manual poison as the derived answer. Delays outside 1–5 require re-entry. Preserve original data when conversion is uncertain. Any revised schema/version applies only to these tools.
6. Update the tools' brief guide instructions and research record so the accomplice/symptom relationship and correct note sources are consistent everywhere.
7. Validate function and visual layout before presenting the implementation. Keep the existing desktop routes so the desktop app uses the redesigned tools when the website is deployed.

## Acceptance checks

### Rings

- Check all 216 position combinations and all 16 completed-temple masks against an independently implemented shortest-path/distance oracle. Assert minimum press count and the direction-change tiebreaker.
- Replay every returned action; verify the exact diagram positions, all required temple arrivals and the checkpoint list. Include arrival at press zero, intermediate alignments and all-temples-complete cases.
- Ensure instruction grouping never skips a temple stop. One-temple fixtures must still match the established reference cases.
- Exercise correction/replan, preview without mutation, adopting current positions, completion, undo, reset and refresh.

### Murder

- Test all nine accomplice/symptom pairs against the observed table: six resolved, three explicitly unknown. Include missing clues and changes after a previous valid answer.
- Test all twelve death-time animals against all five delays, including wraparound. Compare representative results through Margwa's live interface.
- Verify all three painting choices and the exact five-item order, with image/name correspondence.
- Test saved-state migration, invalid values, clue changes, inline-to-standalone handoff, undo/reset and refresh.

### Visual review

- Review actual screenshots at desktop width, a narrow Electron content area, 390 px mobile and short landscape height. Include partially filled, completed and unknown-combination states.
- Confirm all core controls are immediately discoverable, no horizontal overflow, no oversized empty space, no clipped temple names, and no tiny placement images.
- Check keyboard-only use, touch targets, focus visibility, dark/Paper themes and reduced motion. Test both full pages and inline guide instances.
- Run the regression tests and production build after implementation. Do not equate source comparison with a live-game playtest.
