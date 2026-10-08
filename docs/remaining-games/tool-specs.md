# Puzzle tool specifications

These contracts describe future tools. They do not add live tool pages. Use the factual tables in [puzzle-data.json](puzzle-data.json), images in [assets.json](assets.json), and guide destinations in [maps.json](maps.json). The existing `Expansion.vue` / `usePuzzleState()` pattern supplies persistence, undo and shared inline/full-page state.

## Common contract

Inputs begin unrecorded. Results use `waiting`, `invalid`, `ambiguous`, `ready` and `confirmed` states. “Ready” means the inputs support a calculation or recorded instruction; only the player's explicit confirmation means the action succeeded in the match. A source-reviewed tool must not claim the game accepted a code.

Every tool definition declares its fields. Keep flat fields until array sanitization is deliberately supported. Physical cells have stable coordinates. Bounded sequences declare individual slots plus a length field. Use strings for codes, retaining leading zeroes. Distinguish editing an observation from marking an action complete.

All tools need keyboard operation, visible focus, targets of at least 44px, labels independent of colour, Undo, a scoped reset, a source reference, edition context and a link back to the step. Storage failure leaves the current input usable and explains that it could not be saved.

## Shared engines

| Engine | Required behavior |
| --- | --- |
| Sequence recorder | Ordered append, undo, replace a slot, new sequence, optional physical-pad arrangement; preserve duplicate flashes |
| Digit Morse | Exactly five dot/dash signals per group; group separator explicit; invalid or incomplete groups retain their position |
| Word filter | Match a positional mask, rejected letters and letter multiplicity; return every valid candidate |
| Rotation search | Enumerate 0–3 actions per physical control; apply the supplied influence matrix modulo 4; minimize total actions, then break ties by coordinate order |
| Permutation filter | Apply accepted prefixes and rejected next choices to every permutation; never treat an untested choice as accepted |
| Illustrated location lookup | Match an observed clue/photo to reviewed locations; show landmark, original image and collection/action cue |

Implement these engines independently from the reference websites' software. Their published mechanics and tables are evidence; their source code is not application code to copy.

## Infinite Warfare

### Spaceland speakers

**ID:** `iw-spaceland-speakers`. **Owner:** `iw-zombies-in-spaceland`, phase `speakers`.

Input: four physical speaker positions, each with the observed colour; the ordered flashes for the current sequence. Use location names around the Pack-a-Punch portal, a photograph of the arrangement and explicit 1–4 labels. Do not assign a universal colour-to-location mapping. Colours can be replaced individually, but all four must be unique before a route is calculated.

Output: each observed colour translated to its physical speaker, in the recorded order. Allow repetitions. “Next sequence” clears flashes only; “New speaker layout” clears layout and flashes. Example: a layout of red/green/blue/yellow with flashes blue, blue, red produces speaker 3, speaker 3, speaker 1. An incomplete layout does not produce a confident route.

### Shaolin Morse

**ID:** `iw-shaolin-morse`. **Owner:** `iw-shaolin-shuffle`, phase `phone`.

Provide large Short and Long buttons, Undo signal, Finish digit and New message. Optional pasted text accepts `.`, `-`, spaces and `/`, normalizing whitespace into group separators. A completed digit requires five signals. The output is a **string** for the Nightmare Summer poster number, with its original signal groups below it. Do not use the general letter decoder for this step.

Acceptance: `----- .---- ..---` returns `012`. `...` waits for two signals. Six signals in one group identify that group as invalid. A bad middle digit cannot vanish and merge its neighbours into a plausible number.

### Shaolin rooftop word

**ID:** `iw-shaolin-word`. **Owner:** `iw-shaolin-shuffle`, phase `word`.

Input: word length, observed positional letters or glyph-to-letter selections, and confirmed rejected letters. Use the 71-word dictionary in the dataset and the photographed Wyler alphabet. A guessed glyph and a confirmed letter are different states. Present all candidates until only one remains.

Output: candidate words and the next letter position to check; the exact glyph reference for a letter is shown beside the candidate. Do not autocomplete a word by selecting the first candidate. Count repeated letters when accepting an unordered inventory of letters, if that optional mode is offered. Acceptance: `RAT____` with length 7 retains `RATKING`; a query with no candidates explains which mask/exclusion caused the mismatch and preserves the entries.

### Attack chemistry

**ID:** `iw-attack-chemistry`. **Owner:** `iw-attack-of-the-radioactive-thing`, phase `chemistry`.

The first screen records M, the four O-marker observations in red/green/blue, and the actual TV comparison bands. An O candidate is excluded if its marker shows `≠` in a checked filter. If more than one remains, show them and ask for the missing observation. Multiply the confirmed O and M, then apply the **observed** TV intervals. Do not infer the entire match from M and the TV number as the baseline implementation.

The second screen selects the positively confirmed final chemical from the radio. Show the five in-game names with useful aliases; keep the source spellings in provenance. A negative “crude solution” line must not be offered as affirmative evidence. Walk the recipe DAG to emit an ordered list of needed intermediate reactions, deduplicating dependencies and excluding unrelated recipes.

For reaction ingredients `i`, the keypad value is:

`sum(observedTop[i] + observedLeft[i]) - confirmedO`

Subtract O once per reaction. Intermediate chemicals require their own observed board values; do not substitute the value used to manufacture them. Tag each observation with the selected filter. A changed filter invalidates the context for earlier values rather than silently reusing them. Permit a locked set of observations after the player has read all boards in the correct filter.

Show ingredient pickup photographs, the dependency route, missing diamonds, the arithmetic and the keypad result. “Made successfully” advances the reaction; “Calculated” does not. Example from the community guide: top/left pairs 6+2 and 3+4, with O=4, produce 11. Reject non-integer, missing and physically impossible keypad results; ask the player to recheck the observation rather than silently taking an absolute value or modulus.

### Attack code memory

**ID:** `iw-attack-codes`. **Owner:** `iw-attack-of-the-radioactive-thing`, phases `life-ray`, `safe`, `boss`.

Keep three named stages: life-ray input, four pressure-gauge observations, and the four-digit bomb code. The life-ray stage records the accepted order of 3,4,5,6,8 and displays its reversal for the death ray. The pressure stage shows the exact four physical gauge locations. The bomb stage displays the original four-digit string in a large, readable panel.

A rejected digit at position k is evidence only after earlier positions were accepted in that attempt. A prefix eliminator may enumerate the 120 life-ray permutations. Never apply a prefix rejection globally to all positions. A bomb code `0048` remains `0048`; do not reverse it just because the earlier life-ray code is reversed. The tool does not automatically start an in-game countdown.

### Beast disks

**ID:** `iw-beast-disks`. **Owner:** `iw-the-beast-from-beyond`, phase `disks`.

Use the twelve photographed symbol files, keeping source selector indices 0–11 stable. Input requires four distinct selected symbols. Compare that set to every row in the dataset, then filter each matching row to the selected set in row order. If the possible output sequences disagree, show an ambiguous result. Do not pick the first row.

The dataset's row direction follows its accompanying modern reference image. The older Reddit sheet describes reading right-to-left; those conventions must not be mixed. Explain the displayed result as positions 1–4 at N31L and show the correct reference image.

Acceptance: `[1,2,3,4]` maps to `[1,2,3,4]`; `[6,5,8,9]` maps to `[6,5,8,9]`; a repeated symbol is invalid. Exhaust all four-symbol subsets of the twelve symbols and flag zero or conflicting matches. More than one row is acceptable only when the returned order agrees.

### Beast handles

**ID:** `iw-beast-handles`. **Owner:** `iw-the-beast-from-beyond`, phase `handles`.

Record the **initial** 4×4 board with photographed horizontal/vertical examples. Each cell has `unknown`, `horizontal` or `vertical`, a separate checked-action field, and an optional current re-observation. Freeze the initial snapshot before producing a list. Further clicks edit the performed-action list, not the original snapshot.

This is a recorder, not a mathematically verified board solver. Sources use opposite starting/target orientation conventions. The UI's guide must display the actual target photograph and the chosen instruction convention from the game brief. It should permit the player to label the convention in use and re-observe a failed attempt. Do not represent an unverified neighbour-toggle rule as an exact solution. A full GF(2) solver is a rejected implementation option for this release.

Acceptance: flipping a marked action does not alter the initial board. A failed attempt can preserve the original snapshot while starting a new observed board. Undo restores both records correctly.

### Beast eight queens

**ID:** `iw-beast-queens`. **Owner:** `iw-the-beast-from-beyond`, side phase `skullbreaker`.

Input the position of the game's existing queen on an 8×8 board, with A–H columns and 1–8 rows displayed in the same orientation as the original board photograph. Optional extra confirmed placements become constraints. Generate solutions by row-by-row backtracking, rejecting occupied columns and both diagonals. Keep the original queen locked. Offer a selected valid solution with an explicit list of the seven added positions.

There are 92 unrestricted eight-queen solutions. Filtering for the observed queen is part of the calculation, not a random choice. Example of a valid zero-based row-to-column arrangement: `[0,4,7,5,2,6,1,3]`. Duplicate columns or diagonally attacking forced queens are invalid. Do not imply which way the in-game board faces without its orientation photograph.

## WWII

### Final Reich power grid

**ID:** `ww2-final-reich-grid`. **Owner:** `ww2-the-final-reich`, phase `right-hand`.

Record four colours in the observed machine's left-to-right order. Output the fixed box route with each colour: Command Room, first Sewers box, second Sewers box, Pub. Show `Rot = red`, `Grün = green`, `Blau = blue`, plus photographs that distinguish the two sewer boxes. A missed colour stays unknown. A timed route is explained in the guide; a website stopwatch is optional and manually started.

### Final Reich voices

**ID:** `ww2-final-reich-voice`. **Owner:** `ww2-the-final-reich`, phases `voice-of-god`, `second-voices`.

Stage 1 records four photographed bird symbols and their observed Roman numerals at the paintings. The machine's bird positions map these observations to the correct dial, rather than using painting visitation order.

Stage 2 records four green-flash counts from the gramophone after the red-talon charging stage. Use a separate machine-position reference image and slot schema. Do not reuse stage 1's bird dictionary as if it establishes gramophone input order. Accept a zero only if the chosen game's input convention allows it; otherwise leave the field unrecorded. A new flash attempt clears counts while preserving painting observations.

### Darkest Shore artillery

**ID:** `ww2-darkest-artillery`. **Owner:** `ww2-the-darkest-shore`, phases `ripsaw`, `artillery`.

Use two independent stages. For the R.I.P. Saw fuse, assign each observed character to its physical dial position, 1–6. Positions 1 and 4 are `+`/`-`; the other four are digits. Display two signed two-digit coordinate strings without removing zeroes. The six location cards are Beach Passage stairs, Bluffs wood pile, U-Boat cell near power, Bunker 1 beside the AA gun, Artillery bunk locker and the cart outside its BAR-side window. Visiting these in a different order does not change their dial positions.

For the two destroyer ships, use `asset-0403`, the NinjaNationGaming aiming chart. Selecting the actual ship's pictured position reveals that chart's signed pair. Left cannon panel controls elevation, right controls angle; the middle control fires. Record ship 1/2 and success independently from the fuse. The chart is a visual aiming reference, not a fitted ballistic formula or a prediction of the moving ship's next position.

Acceptance: `-`, `0`, `2`, `+`, `4`, `0` displays `-02 / +40`; an unknown sign waits. A fuse coordinate must never populate the ship-stage answer by default. The photo source shows eleven aiming examples and retains its own orientation.

### Shadowed Throne radio

**ID:** `ww2-shadowed-radio`. **Owner:** `ww2-the-shadowed-throne`, phase `wunderbuss`.

Input the pinned church region, the letter pair and the number on the Main Street radio. Return the left and right frequencies from the original chart. The locally downloaded frequency sheet is the visual authority. The dataset contains the transcribed chart and one independently documented example: Barnim + TX-3 gives 26.5 and 50.1.

Keep a visible “read the chart” fallback when an input is missing. An absent transcription row must never become zero. The on-screen `Contacted the Russians` cue confirms success. This tool must not use the second set of smuggler or axe Morse frequencies; those are separate observations.

### Shadowed Throne statues

**ID:** `ww2-shadowed-statues`. **Owner:** `ww2-the-shadowed-throne`, phase `raven-statues`.

Use `up=0`, `right=1`, `down=2`, `left=3`; down means facing the player/front. Target is every statue at 2. Wall 1 has three statues; other walls have four. A shot affects its own statue and immediately adjacent statues, with **each affected statue's** wall-specific rotation rate. The rate vectors are `[1,1,1]`, `[1,2,1,1]`, `[2,1,1,2]`, `[1,3,1,2]` for walls 1–4.

For shot counts `x` and current state `s`, calculate `(s + A*x) mod 4`, where `A[row][column]` equals the affected statue's rate if `abs(row-column)<=1`, otherwise zero. Enumerate every 0–3 count combination, keep target-reaching combinations, minimize total shots, then break ties A/B/C/D. Do not run an unbounded correction loop.

Show a photograph naming each wall, its state inputs and the actual shot sequence. Separate “record this direction” from “shoot this statue.” An impossible orientation in a rate-2 statue or any unsolvable state produces a correction message; preserve the entered state.

Acceptance: all-down is already solved. With a 3-statue wall `[up,down,down]`, the minimal independent result is shoot B twice and C twice. Exhaust all encoded states and verify returned routes; unsolvable states must be explicitly identified.

### Shadowed Throne safe

**ID:** `ww2-shadowed-safe`. **Owner:** `ww2-the-shadowed-throne`, phase `dancers-dagger`.

Input the four successive clown locations and confirmed kills required for each; each count is 1–9. Keep a increment/decrement action while observing, then a separate Confirm count action. Output the safe reset and four recorded counts with clockwise/counterclockwise directions. Reset via three complete clockwise rotations, stop on the first count, then alternate counterclockwise/clockwise/counterclockwise.

A missed count is not estimated from total kills. The guide explains replaying the four clowns if a number was lost. Keep the locations with their counts, even when two locations repeat.

### Shadowed Throne axe

**ID:** `ww2-shadowed-axe`. **Owner:** `ww2-the-shadowed-throne`, phase `nazi-axe`.

Share the digit Morse engine. Store the two decoded numbers in order, then show the corresponding church map reference, region labels and magnifying-glass instruction. This tool is a decoder and illustrated reference. Numeric chart coordinates must come from the locally supplied map; do not invent a latitude/longitude translation from the source image.

### Frozen Dawn hammer

**ID:** `ww2-frozen-hammer`. **Owner:** `ww2-the-frozen-dawn`, phase `hammer`.

The **base-weapon pillar** has four blocks A–D, top to bottom. Use `front/down=0`, `right=1`, `back/up=2`, `left=3`. Shooting a block rotates itself by 2 quarter-turns and its immediate neighbours by 1. Target is all zero. The matrix is:

```
2 1 0 0
1 2 1 0
0 1 2 1
0 0 1 2
```

Enumerate all 256 shot-count combinations, evaluate the four outputs modulo 4 and choose the minimum action count. Keep observations for all four pillars under distinct fields. The later hammer **upgrade apparatus** is a different three-stage puzzle; present its own supplied instruction plate and do not apply the pillar matrix to it.

Acceptance: `[0,0,0,0]` is solved; `[2,1,0,0]` is corrected by one shot on A. Exhaust all 256 current states. Each has a solution, and every returned solution reaches `[0,0,0,0]`.

### Frozen Dawn shield

**ID:** `ww2-frozen-shield`. **Owner:** `ww2-the-frozen-dawn`, phase `shield-upgrade`.

Store a pool name, photographed pattern selection and activation position for each of three pools. Confirming a pool appends it to the ordered history. Output the patterns in **activation order**, followed by the radio-and-blood-pool instruction. A duplicate pattern is permitted; a duplicate pool is not. Do not reorder by geographical convenience. The guide explicitly distinguishes the later intentional downing ritual from a normal failed run.

### Frozen Dawn orrery

**ID:** `ww2-frozen-orrery`. **Owner:** `ww2-the-frozen-dawn`, phase `flail`.

Display the eight physical stop positions from the source apparatus photograph. Input targets for the red, green and purple orbs and the observation's wall perspective. Output a labelled target diagram and an instruction to stop each orb at its target. Red is the useful first action because it moves fastest; the tool cannot measure the live orb's timing. A wrong stop resets the apparatus via the remaining orbs, as the guide explains.

### Tortured Path runes

**ID:** `ww2-tortured-runes`. **Owner:** `ww2-beneath-the-ice`, phase `rune-wall`.

Store separate sequences for the initial code and the codes after the extra runes are inserted. Each observed rune links to its exact photographed source location. Keep earlier codes available, but show the selected stage prominently. A new stage starts with unknown slots. The page warns that old rune clues remain visible and must not be reused as the new answer.

Keep the chapter's round/deadline banner in the guide, outside this helper's progress state. The helper cannot infer which wave the player is currently in. A wrong wall input has its own documented reset action.

## Advanced Warfare

### Descent Simon Says

**ID:** `aw-descent-simon`. **Owner:** `aw-descent`, phase `simon`.

Use the shared spatial sequence recorder with four Reception monitor positions. First arrange colours to match the current game, then append each flash. Keep recording separate from replay and from the next friendly-fire round. Preserve repeated flashes and allow correction of the physical layout. Reset sequence must not erase a correct monitor arrangement.

### Descent number panel

**ID:** `aw-descent-numbers`. **Owner:** `aw-descent`, phase `number-panel`.

Input target and current values for the four digits, left to right. The event types are zombies hit by Exo Slam, jumps, wall purchases excluding ammunition, and zombie kills. For a one-unit event use `(target-current+10)%10` to obtain the remaining events. **Do not** describe the first count as a number of slams: one slam can hit several zombies.

Slam/jump/kill effects can overlap. The output should lead with the slam requirement, then ask the player to reread the HUD. Plan purchases and ordinary kills next, then adjust jumps last. After any action that changes more than one digit, require current-state correction rather than retaining the initial arithmetic as a guaranteed route. The action planner is a proposal based on observations, not a prediction of live combat.

Acceptance: current 8, target 1 produces 3 events under decimal wraparound. A slam hitting two zombies contributes two to the first digit; if it kills either, the fourth digit changes too. An unknown current digit blocks only that digit's result. Wall-ammo purchases must not be suggested as valid progress.

## Vanguard

### Terra page door

**ID:** `vanguard-terra-pages`. **Owner:** `vanguard-terra-maledicta`, side phase `lost-pages`.

The positions are Top, Bottom, Left and Right, identified against the door photograph. Input the accepted prefix of positions and a rejected next position after that prefix. Enumerate the 24 permutations and retain compatible candidates. Once a page remains attached, the player explicitly confirms that position. A wrong placement resets the game's physical attempt, but preserves already learned constraints in the helper.

If the prefix is Top, Left and Right fails next, the remaining route is Top, Left, Bottom, Right. A rejection at position three cannot exclude Right from all other positions. New game clears the learned constraints. Do not add another free-page reward rule unless supported by the guide.

### Shi No Numa cipher

**ID:** `vanguard-shi-no-numa-cipher`. **Owner:** `vanguard-shi-no-numa`, phase `monolith`.

Record all three paper symbols with their locations, then use the supplied translation sheet to select the corresponding wheel markings. Output the three ring targets using real glyphs and an enlarged monolith reference. Paper locations: Excavation Room, Comms Room, Dig Site. Wheel parts have a different location list and do not supply the answer.

The safe baseline uses the full translation plate, with explicit paired glyph selections and the ring notebook; it does not require pretending a text nickname is a cipher alphabet. If implementing automatic paper-glyph matching, transcribe the supplied plate into paired glyph IDs and review every pair before enabling results. The wheel selection must remain unknown when a pair is unreviewed.

### Archon Mindfulness

**ID:** `vanguard-archon-runes`. **Owner:** `vanguard-the-archon`, phase `mindfulness`.

Record exactly 3, 4 or 5 observations for the selected preparation stage. Each slot accepts a short player-assigned symbol name and a ground landmark note. Return these in order; an absent location stays absent. Lock the observation before the timed traversal. The optional photographed selector uses a complete captured glyph atlas and a checked ground overview; the linked community chart's pixels were unavailable, so no fixed glyph count or static location assignment is assumed. “New stage” clears sequence only; “New attempt” preserves ground notes. The formal no-kill capture trial belongs in the guide.

## Modern Warfare III

### Rune portals

**ID:** `mw3-rune-portals`. **Owner:** `mw3-urzikstan`, phase `rune-portals`.

Choose a destination from the supplied portal reference; output its three glyphs in firing order and its landmark. Keep the source portal entry and the destination separate. The A–Z-like glyph nicknames are only memory labels; display their photographic/code plate. A code does not imply there is a portal at the arrival location. Label the entry cost and reference date; never choose a destination from a partial three-glyph observation.

The dataset indexes all 17 entrances and 24 destination markers, each with its own local photographs. Destination frame 1 is its ordered three-glyph plate; frame 2 gives location context. All 24 triplets have been visually transcribed into eight photographic glyph identities. Use these plates in the baseline destination lookup; the supplied atlas also permits a three-slot reverse lookup. Repeated grids are legitimate separate destinations. Unknown slots wait, an unknown full triplet reports no documented match, and duplicate results would all remain visible. Acceptance: glyphs 01/02/03 return marker m2112 in I6. Interactive routing is a later calibrated-map feature.

### Red Worm USBs

**ID:** `mw3-red-worm-usbs`. **Owner:** `mw3-urzikstan`, phase `red-worm`.

Input the four photographs on the current deployment's clue wall by matching them to the twelve-location atlas. Output the named landmarks and reviewed grid cells. Store the actual collected drive identity—Alpha, Bravo, Charlie or Delta—beside its observed location. The drive identity is not permanently attached to a map location.

Show the four fixed clue-wall locations and boss-site identification by the paired ammunition caches. Do not predict the boss site from the USB set. Do not label every candidate UAV tower as active; only four are selected per deployment. A stale observation banner must appear when the player starts a new deployment. The timer is a user-started reminder; the website cannot know when the storm reaches the refractors.

### Seasonal rift reference

**ID:** `mw3-dark-aether-reference`. **Owner:** `mw3-urzikstan`, linked from all four seasonal guides.

Input goal (story, permanent unlock, consumable acquisition, schematic, optional blueprint), season and intended variant. Output the correct map/guide phase, story mission, four unlock relics, entry item, reward set and main distinction between ordinary and Elder. These are versioned reference records, not automatic account detection.

Ordinary runs use a triangular Sigil; Elder runs use an Elder Sigil. The Season 6 free-entry event is historical. Persistent portal unlock is distinct from having an entry item, and following a squad into a rift does not prove the user's own portal is unlocked. Confirm permanent milestones explicitly and keep them across deployments.

Story rewards must not be substituted for Elder schematic rewards. S1's diary, S2's drum, S3's giraffe and S5's Mr. Peeks are different quest relics. The S5 echoes are separate items from their earlier originals.

### Union crystals

**ID:** `mw3-union-runes`. **Owner:** `mw3-dark-aether-season-3`, phase `crystals`.

Use two independent three-slot glyph sequences, one for each marked crystal. Record the crystal's displayed glyphs left to right and its corresponding rune landmarks. Tapping a found rune records its location; it does not prove the rune has been shot. Preserve both crystal records on refresh and allow a new attempt on one without clearing the other. Explain the audio clue for locating runes and the red crystal cue for completion.

## Optional tools ready for a later slice

| ID | Contract |
| --- | --- |
| `iw-spaceland-souvenirs` | Input a multiset of three coin colours; return the reviewed souvenir recipes, independent of insertion order. Explain station-specific wonder-weapon parts separately. |
| `ww2-shadowed-hangman` | Use the seven-word reward dictionary, a positional mask and confirmed rejected letters. Show all candidates and each reward; never infer a wrong letter from an untested letter. |
| `iw-attack-skull-hop` | Use one of fourteen target words and four observed swingset letters, left to right from Slappy Taffy toward the Ice Cream Parlour. Enumerate all 340 ordered sequences of length 1–4, with repeated choices allowed. For choice `p` in sequence position `j` (p=1–4, j=0–3), add `alphabetValue[p] + 3*p*j`. Wrap the total to A=1…Z=26, mapping remainder zero to Z. Select shortest sequences, then physical-position lexicographic order; show the glyphs and the lock-in shot after each target letter. |

The Skull Hop arithmetic is now resolved against the [original public reference](https://www.zombieslayamr.com/pages/aotrt/aotrt_spelling_bee.html). Its offsets are positive and depend on physical symbol position and sequence position. They do not alternate sign. With symbols A/B/C/D, BENZENE yields `2 · 11 · 23 · 113 · 11 · 23 · 11`; `113` sums to 26 and therefore produces Z. A modern reference implementation fails to map remainder zero to 26, and the original has a `solvoysis` spelling error; preserve the live target spelling `solvolysis` and fix the zero/Z rule in the independent implementation. A missing combination is an explicit error, never an empty skipped letter. Shooting the lock-in symbol confirms a letter; filling four slots then adding a fifth clears the old four before starting again.
