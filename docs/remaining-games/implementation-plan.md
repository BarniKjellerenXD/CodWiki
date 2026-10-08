# Implementation plan for the remaining Zombies games

Prepare all 30 existing planned destinations across Infinite Warfare, WWII, Advanced Warfare, Vanguard and Modern Warfare III (2023). Build complete map guides with contextual puzzle aids, using the site's existing Nuxt, Vue, charcoal and gold components. The research and assets in this directory are the handoff; this task does not publish content or change application behavior.

## Chosen approach

The player usually has a phone or second screen open during a match. A useful page answers four questions quickly: what am I looking at, what should I record, what do I do next, and how do I recover if it fails? Main quests, equipment and side quests should share one map entry, with independently linked phases. A puzzle helper belongs beside the step that uses its result.

| Approach considered | Benefit | Problem | Decision |
| --- | --- | --- | --- |
| Write long wiki articles for every map | Broad coverage; simple authoring | Clues and changing sequences disappear in paragraphs | Keep Full Details, add structured steps and contextual helpers |
| Publish a generic checklist for every quest | Fast to expand | Repeats guide progress and does not solve a puzzle | Use existing guide checkboxes; do not turn these into separate tools |
| Build every conceivable calculator first | Strong specialist features | Delays usable guides and encourages unsupported rules | Build verified calculations and useful memory aids with their map |
| Draw an interactive map for every destination first | Excellent location discovery | Requires calibrated artwork, layers and confirmed coordinates | Later milestone; location atlases and photographs ship first |
| Add an AI answer box or automatic screenshot recognition | Potentially quick input | Needs model services, a labelled image set and error handling | Future experiment; deterministic manual entry is the baseline |
| Extend the existing authored modules and shared widgets | Preserves search, routes and saved state; reusable across games | Needs careful data review and generator registration | **Selected** |
| Rebuild the whole site around a new backend or CMS | Easier large editorial teams | Adds infrastructure before it improves in-match use | Revisit only when contribution volume justifies it |

The selected structure combines Quick Parts, Full Details, illustrated location references and tools with a precise purpose. Everything needed to render a published guide lives locally. External sources remain credited evidence, rather than runtime dependencies.

## Exact scope and identities

Use the existing IDs and routes in `shared/planned-maps.mjs`. `maps.json` maps every one to its brief, phase plan and selected helpers. Do not rename these entries when replacing their placeholders.

| Game | Entries | Required distinctions |
| --- | ---: | --- |
| Infinite Warfare | 5 | Standard quests, Director's Cut progression and Mephistopheles are different branches |
| WWII | 11 | Casual/hardcore Final Reich; three Tortured Path story chapters and three survival versions |
| Advanced Warfare | 4 | Exo Zombies Outbreak has its own identity; optional gold trophies and Double Feature are separate |
| Vanguard | 4 | Objective maps and round-based maps; Vanguard Shi No Numa has different mechanics from earlier editions |
| Modern Warfare III (2023) | 6 | Urzikstan, four seasonal Dark Aethers and Unstable Rift; story, ordinary and Elder variants |

Do not expand this delivery into Ghosts Extinction, MW3 2011 Survival, Riot's Exo Survival bonus wave, mobile games, or another review of the 66 already authored entries. These are separate scopes, and their absence should not stop the thirty planned entries from becoming useful.

## Guide and tool experience

### Guide structure

Each authored map has an edition and mode summary, player requirements, setup, main quest, weapon branches, side quests and a boss or ending section. Survival entries explain their actual unlocks and equipment, without inventing a conventional main quest. Der Anfang explains its short story progression rather than promising a boss arena.

Every actionable step contains:

1. A stable ID, plain title and one-sentence Quick Part.
2. Prerequisites, including round gates, named equipment and co-op synchronization.
3. An exact action and landmark. Put alternative spawn locations in a labelled location group.
4. The visible or audible success cue.
5. A failure response: repeat immediately, retry next round, fetch a replacement, return to an earlier step, or restart the run.
6. An illustration or an explicit reference to the relevant locally available chart.
7. A helper link only when the input or task justifies one.

The game briefs supply the ordered content and exceptions. The asset manifest supplies the original image URL, source page and local file where downloaded. `puzzle-data.json` supplies exact deterministic facts for the calculations and selectors. The tool specifications supply the input contract and user-visible output.

### Reader modes and branch selection

Keep the current Quick Parts and Full Details views. Inside Full Details, put a short branch selector before an ambiguous quest: Final Reich Casual/Hardcore, Beast Standard/Director's Cut finale, Descent Standard/Double Feature, and MWIII Story/Ordinary/Elder. Show the branch in the heading, links and result panel. Preserve the selected branch locally.

A branch selector changes presentation; it must not silently mark steps complete. Shared setup steps can use stable common IDs. Branch-only steps need distinct IDs. Changing a branch preserves the other branch's observations and progress.

### Puzzle layout

The default helper layout is observation → result → action, with Undo and Reset adjacent to the inputs. A result should be readable without scrolling through the rest of the guide. At wide sizes use an input column and a result column. On phones stack them with the current output directly below the last required input. Avoid fixed overlays that cover gameplay references or the phone keyboard.

For spatial puzzles, preserve the geometry of the object: four physical monitors, a 4×4 handle board, a vertical hammer pillar, or an 8×8 chessboard. Each cell also has a readable coordinate. Arrange colour pads to match the player's physical panel. Do not ask the player to translate their object into a generic list first.

For a long recipe, show only the next reaction plus a collapsible complete dependency route. Keep the observed numbers and their colour/filter context beside the computed entry code. Distinguish “reaction calculated” from “reaction succeeded in game.”

Every visual selector needs a photograph or verified glyph reference, an accessible label and a way to enlarge it. A text nickname such as “fork” is a supplementary memory cue, not a substitute for the actual symbol. Instructions should reference the player's binding (“interact”, “alternate fire”) with optional platform hints.

## Tool selection

Value means reducing an actual observation, calculation, search or memory burden. Scores below are design judgments, not traffic measurements. A standalone helper has to do more than reproduce an ordered paragraph.

| Candidate | Chosen form | Reason and implementation boundary |
| --- | --- | --- |
| Spaceland speakers | Spatial sequence recorder | Variable physical colour mapping and replay order |
| Spaceland souvenir recipes | Inline lookup | Coin choices are quick inputs; fixed recipes do not need a large separate page |
| Rave main-quest tracker | Guide steps | Body-part targets and skull phases are fixed instructions |
| Rave charm search | Illustrated location atlas | Different pickup sites and requirements, with photographs; optional tool page later |
| Shaolin phone Morse | Decoder | Five short/long signals per digit, preserving leading zeroes |
| Shaolin rooftop word | Candidate filter and glyph key | Closed 71-word list; repeated-letter counts and exclusions matter |
| Shaolin rat symbols | Illustrated atlas | Hunt is random; identify the landmark and mark only observed hits |
| Attack chemistry | Calculator and recipe dependency route | Changing diamonds and O value; a real calculation |
| Attack pressure, life-ray and bomb codes | Stage-specific memory panel | Distinct code types and reversal; never mix them |
| Attack Skull Hop word puzzle | Optional arithmetic helper | Separate side quest; has its own letters and positive position offsets with cyclic A–Z arithmetic |
| Beast floppy disks | Glyph order solver | Exactly four observed symbols and a reviewed row table |
| Beast 4×4 handles | Initial-state recorder | Sources describe opposite orientation conventions; preserve evidence instead of claiming a verified influence matrix |
| Beast Skullbreaker queens | Constraint solver | A fixed initial queen, valid board completions and a selectable solution |
| Beast Venom maze and upgrades | Illustrated equipment sections first | Useful references; do not promote an incomplete maze model |
| Final Reich power grid | Four-colour recorder | Variable colours attached to fixed box locations |
| Final Reich birds and gramophone | Two-stage observation matcher | Different order rules; keep separate stage records |
| Final Reich Tesla routes | Guide branches | Upgrade prerequisites and enemy conditions are instructions |
| Darkest Shore ritual routes | Illustrated guide and location groups | Enemy lures and line-of-sight geometry need real photos; a generic checklist adds little |
| Darkest Shore artillery | Coordinate recorder and aiming plate | Six physical dial positions and two independent cannon tasks; no speculative ballistic model |
| Shadowed Throne radio | Lookup with source chart | Region plus observed letter/number gives two frequencies |
| Shadowed Throne statues | Rotation solver | Exact wall-specific neighbour/rate rules |
| Shadowed Throne clown safe | Sequence and count recorder | Four observed counts and alternating safe directions |
| Shadowed Throne axe Morse | Shared decoder plus map reference | Reuse the digit engine; display the map for the resulting code |
| Shadowed Throne Hangman | Optional candidate filter | Seven words; include known letters and rejected letters |
| Frozen Dawn hammer | Rotation solver | Four cells per pillar; different from the later upgrade apparatus |
| Frozen Dawn shield pools | Ordered glyph recorder | Three patterns must retain activation order |
| Frozen Dawn flail orrery | Spatial target recorder | Three coloured orbs and eight stop positions |
| Tortured Path round schedule | Guide deadline panel | Round constraints belong beside the current chapter's steps |
| Tortured Path rune wall | Multi-stage glyph recorder | New runes per code; earlier discoveries remain visible in game |
| AW Outbreak access cards | Guide checklist and illustrated locations | Mostly equipment gates and fixed actions |
| AW Infection valves and meat | Illustrated search atlas | A genuine location problem; one piece per district and one carried at a time |
| AW Carrier grenade sequence | Illustrated inline reference | Fixed 2/4/6 icon rows; an extra tracker would repeat the guide |
| AW Descent Simon Says | Spatial sequence recorder | Physical colour order is randomized |
| AW Descent number panel | Action calculator with live correction | Slam, jump, purchase and kill events affect digits; account for coupled actions |
| Terra Maledicta page door | Order eliminator | Four positions, retained correct prefixes and rejected attempts |
| Vanguard Shi No Numa monolith | Glyph translation and ring recorder | Three observed paper symbols mapped to the proper ring markings |
| Archon Mindfulness | Spatial rune sequence recorder | Three, four and five-symbol rounds; useful under pressure |
| MWIII rune portals | Destination lookup and glyph reference | Destination codes are fixed; nearby portal entries are a separate question |
| MWIII Red Worm photos | Photo matcher and USB notebook | Four locations change every deployment; correlate IDs and collected USBs |
| MWIII seasonal access/rewards | Contextual reference selector | Goal selects destination, variant, prerequisites and schematic set |
| MWIII Union crystals | Two-crystal glyph recorder | Ordered observations, separate completion state for each crystal |
| MWIII Unstable obelisks | Map/reference and guide progress | Ammo icon matching is useful; spawning is dynamic and must not be predicted |
| Generic boss timers | Declined as default | A website timer cannot know when an in-game event actually began |
| Live squad cloud sync | Later option | Start with local state; a backend is unnecessary for solo and second-screen use |
| Screenshot OCR | Later option | Manual correction and labelled evidence must exist before auto-reading codes |

Detailed contracts and acceptance examples are in [tool-specs.md](tool-specs.md). Optional features have a complete proposed interaction, but should not delay the core map's guide.

## Integration into the current repository

| Existing file or system | Future change |
| --- | --- |
| `shared/planned-maps.mjs` | Remove an entry only when its authored guide with the same ID is registered in the same change |
| `shared/games.mjs` | Retain names, order and aliases; no new game IDs |
| `shared/expansion-guides.mjs` | Import and aggregate the five new game guide modules |
| `shared/expansion-tools.mjs` | Aggregate tool definitions with stable IDs, game/map associations and declared input fields |
| `shared/expansion-references.mjs` | Add the game reference aggregators, or follow the existing specialized JSON generation pattern |
| `scripts/generate-expansion.mjs` | Generate maintained pages and quick summaries from authored modules; never hand-edit generated Vue pages |
| `scripts/generate-catalogue.mjs` | Refresh site catalogue, search, desktop navigation and map quick links after each authored slice |
| `app/components/PuzzleWidget.vue` | Register lazy game widgets by the existing registry convention |
| `app/utils/expansionTools.mjs` | Keep evaluation pure; add dispatch to game-specific utilities |
| `app/utils/puzzleState.mjs` and `usePuzzleState.ts` | Preserve existing migrations, hydration, sanitization, shared inline/full-page state and undo/reset |
| `GuideArticle`, `QuestSteps`, `GuideIllustrations`, `ImageLightbox`, `InlineTool` | Reuse the established reader, progress controls, image enlargement and contextual tool placement |
| `shared/seo.mjs`, sitemap and redirects | Authored pages become indexable; still-planned entries stay noindex; preserve old URLs |
| `desktop-app/renderer/nav.js` | Generated navigation; release the desktop catalogue when new destinations/tools are published |
| `public/images/` | Copy only selected, checked and credited research assets into production paths |
| `docs/home-artwork.json` | Register homepage covers separately from instructional imagery |

Suggested authored files: `shared/iw-guides.mjs`, `iw-tools.mjs`, `iw-references.mjs`, and the equivalent `ww2`, `aw`, `vanguard`, and `mw3` modules. Split the large IW and WWII guides into per-map files when this improves review. Shared constructors should mirror `shared/bo3-common.mjs`: explicit step IDs, Quick Part text, full text, phase tools, illustrations, sources and review date.

Suggested pure rule files: `app/utils/iw.mjs`, `ww2.mjs`, `aw.mjs`, `vanguard.mjs`, `mw3.mjs`. Suggested widgets use the same game families. Shared Morse, sequence and rotation components can be reused, but the surrounding help, layout, photographs and reset boundaries stay map-specific.

### Data and persistence decisions

The present `normalizeTool()` persists declared flat fields, with strings/options/checks. Do not introduce nested observation arrays and assume they survive sanitization. Declare each physical cell or bounded sequence slot, or explicitly add and test a new array field type before using it. Keep partial observations representable; an unrecorded symbol must never default to a real symbol.

Use `version: 1` for new tools and stable IDs derived from the planned map ID. Keep all existing tool and quest IDs unchanged. Undo reverses the most recent user input or completion confirmation, not a calculated prediction. Reset clears only the selected helper stage unless the control explicitly says it clears the entire helper.

Current guide progress is stored in `codwiki-progress-v1`. Preserve it. MWIII introduces a different lifecycle: story completion and permanent portal unlocks persist across deployments, while USB selections and in-match contracts do not. Store these persistent milestones in a separate, versioned local record. A “new deployment” action clears deployment observations after explicit selection, and preserves campaign unlocks and schematics.

Website and Electron profiles remain independent. A downloaded offline guide or a shared URL does not imply progress synchronization. Cloud accounts and collaboration can be added as a separate feature later.

### Evidence and ambiguous results

Give every lookup row, photographed glyph and gameplay rule a source link and review date in the authored reference manifest. Distinguish a source-reviewed rule from an in-game verified rule. The coder can implement the algorithms from this pack; the final gameplay acceptance is a separate validation activity.

Unknown values produce a clear waiting state. Contradictory observations produce a correction prompt next to the relevant input. Multiple possible results remain multiple results. Never choose the first matching disk row, the first word, a guessed O number, or an approximate map pin and label it confirmed.

## Assets and maps

Use the downloaded files and exact remote references in [assets.json](assets.json). The manifest is a research catalogue, not an instruction to ship every file. Keep uncropped originals here. Production selection should favor one contextual shot, one close detail and one success/failure image per difficult step. Glyph tools also require the reference sheet and a consistent selector plate.

Downloaded does not mean visually reviewed, accurately captioned or licensed for republication. Those are separate manifest fields. Retain the original creator's credit for community charts and the appropriate Activision/game-studio attribution. Attribution does not establish permission. Existing project attribution practice should be followed without treating it as blanket reuse permission.

Do not use AI-generated gameplay screens, chemical diamonds, cipher alphabets or map floor plans. These are evidence. A decorative homepage image has different requirements and can be considered independently.

For interactive maps, start with calibrated artwork and `app/data/maps/`'s current contract. Mark approximate points as approximate. Regions, underground areas, vision states, story/normal/Elder variants and objective/survival editions need their own layers. A borrowed location chart is a reference image until its projection and points have been checked. Do not create a Map view for a map that has no dataset.

## Build sequence and release gates

This sequence is about implementation risk, not measured player demand. All game research is available before coding begins.

1. **Contracts and data.** Add source registries, game constructors, pure rules, glyph/image inventories and state declarations. Port the data in `puzzle-data.json`, preserving its provenance and naming conventions.
2. **Three representative maps.** Complete Spaceland, Shadowed Throne and Descent. They prove spatial memory, numeric lookup, rotation arithmetic and observed-action calculations. Include setup, side content, endings and images for each map.
3. **Finish Infinite Warfare.** Rave, Shaolin, Attack and Beast, with Director's Cut and Mephistopheles under the correct branch. Chemistry and symbol matching get full error states.
4. **Finish WWII.** Final Reich, Darkest Shore, Frozen Dawn, Gröesten Haus and all six Tortured Path entries. Verify chapter-to-survival links and exact wave gates.
5. **Finish Advanced Warfare.** Outbreak, Infection and Carrier; complete Descent's optional Double Feature and gold-trophy coverage. Keep optional endings visibly separate.
6. **Finish Vanguard.** Der Anfang and Terra first, then the round-based Shi No Numa and Archon, sharing the appropriate glyph/sequence UI.
7. **Finish MWIII.** Urzikstan progression and reusable mode/reference records first; then S1, S2, S3, Unstable and S5. Verify story/ordinary/Elder distinctions and campaign persistence.
8. **Maps and optional helpers.** Calibrated maps, equipment atlases promoted to tools when useful, and the optional Skull Hop/Hangman helpers. These extend complete guides.

Each map exits its placeholder only when the complete intended guide and its essential helpers are ready. One game need not wait for all the others to publish. Do not count a written summary as a finished walkthrough.

### Map acceptance checklist

- The route and ID match `maps.json`; exactly one authored catalogue record exists.
- Quick Parts and Full Details cover the same route and branch, with stable step IDs.
- Setup, equipment prerequisites, main quest, ending, useful side content and recovery are present.
- Every input result points back to the correct guide phase and edition.
- Images load locally, enlarge, have descriptive alt text and preserve source credits.
- A helper never marks gameplay progress merely because the player entered a clue.
- Partial and contradictory observations, refresh, undo, reset, new-run isolation and old saved progress are tested.
- The map's solo/co-op variant and each timing or damage requirement are checked in an actual run before claiming gameplay verification.
- Website/mobile and desktop navigation, search aliases, source links, canonical metadata and sitemap status agree.

### Meaningful software checks

Rotation solvers should exhaust every encoded state and prove that applying each returned solution reaches its target. Word filters must respect repeated letters. Recipe routes must be acyclic, contain only the selected final compound's dependencies, and require diamond inputs from the correct observation context. Recorders should reject overflow and preserve their physical mapping on refresh. Portal references should never mix source and destination coordinates or story and Elder rewards.

Use the existing test runner and meaningful fixtures, followed by `node scripts/generate-catalogue.mjs`, `npm test`, `npm run build`, and the existing SEO checks in the future implementation task. The research-only task validates its own JSON, map coverage, source references and downloaded asset integrity; it does not run a build that rewrites generated application files.

## Handoff completion

The coder's starting point is [README.md](README.md), then the selected game brief, the relevant tool contract and the factual dataset. Use [evidence-notes.md](evidence-notes.md) for reconciled source conflicts and the exact limits of the checks. The pack does not authorize publishing unsupported shortcuts or silently converting source review into a claim that a quest was played through.
