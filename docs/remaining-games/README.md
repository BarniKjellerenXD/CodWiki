# CodZmWiki remaining-games handoff

Research and implementation for Infinite Warfare, WWII, Advanced Warfare, Vanguard and Modern Warfare III (2023). All **30 destinations** now have authored guides, including survival variants, story chapters, Director's Cut/Mephistopheles and seasonal rifts. Research reviewed 7 October 2026; local implementation completed 8 October 2026. See the [implementation handoff](implementation.md) for architecture, saved-state behavior and validation limits. The website has not been deployed.

The selected approach extends the current Nuxt/Vue guide system with illustrated Full Details, useful Quick Parts and contextual puzzle tools. Seven architecture options and more than forty feature candidates were considered. The plan selects **28 core tools**, plus **three optional tools**, based on actual memory, calculation, symbol-matching and location-search burdens.

## Read the game briefs

| Game | Destinations | Core tools | Brief |
| --- | ---: | ---: | --- |
| Infinite Warfare | 5 | 8 | [Map routes, chemistry, symbols, Director's Cut and Mephistopheles](infinite-warfare.md) |
| WWII | 11 | 11 | [Casual/hardcore, weapon branches, chapter wave gates and survival editions](wwii.md) |
| Advanced Warfare | 4 | 2 | [Exo Zombies routes, search atlases, challenge sequences and optional endings](advanced-warfare.md) |
| Vanguard | 4 | 3 | [Objective maps, round-based quests, translation and sequence memory](vanguard.md) |
| Modern Warfare III (2023) | 6 | 4 | [Urzikstan, four seasonal rifts, Unstable, relics and reward variants](modern-warfare-iii.md) |

Each brief supplies ordered phases, prerequisites, success/failure cues, branch distinctions, useful side content, helper placement and required image groups. The registry records **238 planned phases**, with stable destination identities from `shared/planned-maps.mjs`.

## Implementation files

| File | Purpose |
| --- | --- |
| [Implementation handoff](implementation.md) | Completed architecture, interactions, state and maintenance workflow |
| [Implementation verification](implementation-verification.json) | Actual content totals, automated/browser/build/SEO checks and review scope |
| [Implementation plan](implementation-plan.md) | Chosen architecture, UX, repository integration, state lifecycle, build sequence and release gates |
| [Tool contracts](tool-specs.md) | Inputs, outputs, algorithms, ambiguity/error states, reset behavior and acceptance examples |
| [Puzzle data](puzzle-data.json) | Recipes, 71-word dictionary, radio table, rotation matrices, disk rows, glyph pairs, portal codes, relics and rewards |
| [Map registry](maps.json) | All thirty IDs/routes, phase plans, branches, tool ownership, sources and asset references |
| [Tool registry](tools.json) | Core/optional decisions, owning map, guide phases and dataset dependencies |
| [Implementation backlog](backlog.json) | Foundation, thirty map tasks and the later maps/optional milestone |
| [Source registry](sources.json) | 113 source entries with exact URLs and review scope |
| [Image catalogue](assets.json) | 2,114 references; 1,408 local image files with provenance, dimensions and hashes |
| [Image selection plan](asset-guide.md) | Key puzzle plates, every map's required views, production formatting and capture tasks |
| [Map image groups](asset-groups.json) | Reference asset IDs associated with each destination |
| [MWZ seasonal atlas](mw-aether-atlas.json) | Four seasonal map references with contracts, exits, keys, doors, relics and local pictures |
| [Evidence decisions](evidence-notes.md) | Source disagreements, selected rules, known reference defects and verification limits |
| [Verification report](verification.json) | Actual integrity, coverage, reference and mathematical checks |
| [Data validator](verify-data.mjs) | Repeatable research-pack checks; does not build or modify the application |

The original local image collection is approximately **521 MiB**. Selected instructional references have lightweight reading previews in the site, with original plates available for enlargement. Creator attribution, visual inspection and publication permission remain separate fields.

## Maintaining the implementation

1. Edit the game-specific authored guide/tool modules and factual tables; preserve existing route and progress IDs.
2. Regenerate catalogue, guide pages, Quick Parts, search and desktop navigation together.
3. Run the puzzle tests, production build and browser flow checks described in the implementation handoff.
4. Add calibrated maps or replacement artwork when accurate coordinates and publication-ready captures are available.

Keep existing IDs and generated-file conventions. Remove the corresponding placeholder in the same change that registers its authored guide. Use the game brief, tool contract, dataset and image group together; the general content/tool research is already assembled here.

## Verification and publication status

The pack's checks pass. They cover all thirty destination records, tool ownership/phase references, local links, image hashes, 832 statue states, 256 base-hammer states, 495 disk selections, 340 Skull Hop combinations, the chemical dependency graph and all 92 eight-queen solutions. All 1,408 local image files decoded successfully. Important puzzle plates were visually inspected; most location screenshots still need fine-detail caption review.

To rerun the durable consistency checks from the repository root:

```sh
node docs/remaining-games/verify-data.mjs
```

This is a source-reviewed implementation handoff, not a claim that thirty live playthroughs were completed. Production work still includes selected artwork clearance/capture, in-game solo/co-op acceptance, and any optional map calibration. Archon's baseline sequence recorder is specified without relying on its unavailable community chart; a photographed selector has an explicit capture plan.
