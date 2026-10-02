# IX and Ancient Evil research and layout decisions

Researched 2026-10-02. This is a source review, not a completed in-game verification.

## Sources and evidence

- [r/CODZombies IX wiki](https://www.reddit.com/r/CODZombies/wiki/ix/): Pack-a-Punch, wonder weapon, Danu, Ra symbol chart, Zeus/Odin and bosses; screenshot references.
- [IX guide by mmmrkennedy](https://mmmrkennedy.com/games/BO4/ix/ix_guide): exact part spawns, updated Danu timing, alignment screenshots, shield upgrade corrections.
- [IX community written route](https://www.reddit.com/r/CODZombies/comments/9zou7t/complete_ix_easter_egg_written_guide_updated/): independent community quest ordering and run advice.
- [r/CODZombies Ancient Evil wiki](https://www.reddit.com/r/CODZombies/wiki/ancient-evil/): 20 Oracle hints, hand branches, tribute values, door chart and bosses.
- [Ancient Evil guide by mmmrkennedy](https://mmmrkennedy.com/games/BO4/ancient_evil/ancient_evil_guide): detailed spawn screenshots, minimal hand requirements, Exalted corrections, theater and boss behavior.
- [COD Zombies Guides Ancient Evil](https://www.codzombiesguides.com/main-quests/black-ops-4/ancient-evil/): cross-checks prerequisites, minimal hands, tribute route, Pegasus Strike, boss damage conditions.

## Layout choice, before implementation

Three possible layouts were considered: one long chronological checklist; separate encyclopedia entries for every weapon; or a short chronological main route with linked equipment branches and inline task-specific tools. Choose the third. Preserve existing phase and step IDs for saved runs. Each important step gets a short action line plus expandable details, exact locations, completion signals and recovery instructions. Equipment branches remain available without forcing side upgrades into the main-quest checklist.

IX recommended route: start challenges and shield while opening towers; obtain Orion deterministically if the box does not give it; burn wood as soon as an axe Gladiator is available; prepare Danu ingredients together; finish Danu then Ra, Zeus, Odin and the elephants. Alternative box Orion skips its acquisition quest. Ra may be prepared alongside Danu waits. Keep the original Ra and Danu tool IDs. Ra becomes an actual image picker using the community chart, with ordered targets and completion states. Danu gets an explicit three-stage wait log including the formerly omitted waiting period after planting; in-game item appearance always wins over a computed round estimate.

Ancient recommended route: gather shield and bridle while opening the map; collect Pegasus parts on first Dark Side visit; earn tribute rewards while developing Charon → Gaia → Hemera → Ouranos. Only Fallen Gaia is required for roots, but each player needs a Redeemed hand for theater. A four-player party therefore redeems Gaia too. Exalted is an optional power route, never a mandatory main-quest gate. The hand tool resolves all 20 Oracle clues to location screenshots and tracks actual upgrades. A separate tribute calculator distinguishes claimed rewards from unclaimed trial tier and computes 9 points per player. Theater gives the actionable rule: distant stands = normal shot, floor = charged shot. Door order uses an authentic image.

## Conflicts resolved explicitly

- IX older wiki says two full bowl rounds; recent detailed guide says one full non-special round. Tell readers to inspect the bowl after a full round and collect only when ready; use conservative waiting guidance instead of guaranteeing a clock-only result. Planting at Danu still has a separate two-full-round wait.
- IX older wiki describes three pods per floor; newer location guide shows three pods total, one per floor. Describe destroying the visible red growth until the ammo/drop and upward route unlock, then repeat on the other floors; this avoids inventing a target count.
- Ancient older wiki assumes all four Redeemed hands for Exalted. Recent detailed guide and community correction allow any Redeemed hand to do all four fixed trials; the four shrines still must be charged. Use the corrected route.
- Ancient theater failure/round descriptions vary. Use three successful performances, read live feedback, return home on grayscale, and retry next round if ejected rather than inventing a universally reliable failure counter.

## Image provenance

Ra symbols: https://i.imgur.com/kx47Mns.png, linked by the IX Reddit wiki. The UI displays windows of this authentic chart without drawing replacement glyphs. Door sequence: https://i.imgur.com/pyvaliT.png, linked by Ancient Evil Reddit wiki. Other location screenshots are credited to mmmrkennedy, with original asset URLs in the local asset manifest. Game imagery belongs to its respective owners; source links are displayed alongside references. No synthetic game symbols are used.

## Planned verification

Validate unique preserved IDs, local image existence, valid tool fields, accessible labels and keyboard controls; test tribute arithmetic, missing/invalid entries, and Danu stage guidance. Check the app build and parent catalogue generation after integration. UI and source checks cannot substitute for an in-game run.

## Implemented and checked

- `shared/bo4-ix-ancient.mjs` exports replacement `guides` and `tools` arrays. Both maps have complete main routes, equipment branches, setup spawn lists, boss damage windows, completion signals and recovery instructions. Existing phase IDs, step IDs and tool values are retained.
- `ChaosHands.vue` handles five IDs: `bo4-ix-ra`, `bo4-ix-danu`, `bo4-ancient-hands`, `bo4-ancient-tribute`, `bo4-ancient-theater`. It uses the shared persisted puzzle state and its undo/reset flow. No central evaluator dispatch is required.
- Ra uses a clipped window into the original 1980×1080 chart, with separate accessible names and a four-target completion sequence. Actual source pixel bounds were checked to exclude the chart's text labels. The SVG uses a unique clipPath so wide or narrow letterboxing cannot leak neighboring symbols or labels.
- All 20 Oracle hints have local screenshot results. The tribute calculator supports half-point rewards and rejects negative/fractional reward counts. Danu excludes the placement-round remainder and labels its result as an estimate, always deferring to item readiness.
- `node --test tests/chaos-tools.test.mjs`: six tests pass. Tests cover numeric boundaries, party totals, Danu full-round accounting, all Oracle assets, preserved guide IDs, valid referenced tools and local images, and saved Ra values.
- Both Vue single-file components parsed and compiled with `@vue/compiler-sfc`. Parent browser verification confirmed Ra selection works at a 395px viewport; the reported chart bleed and aria group labels were fixed.
- Image magic-byte validation confirms 73 real PNG/WebP references, recorded in `bo4-ix-ancient-assets.json`. The files are original linked references, not generated look-alikes. Root integration owns the final app build and browser checks.
