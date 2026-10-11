# Cold War map implementation

Implemented five datasets with sixteen source layouts, 1,047 published locations, 94 curated targets and 116 guide-step links (including the two child Outbreak guides). This is location-map coverage, not a complete Intel checklist or an in-game playthrough certification.

| Dataset | Layers | Locations | Targets | Guide links |
| --- | ---: | ---: | ---: | ---: |
| `cw-die-maschine` | 2 | 106 | 19 | 22 |
| `cw-firebase-z` | 2 | 112 | 17 | 20 |
| `cw-mauer-der-toten` | 2 | 131 | 18 | 26 |
| `cw-forsaken` | 2 | 124 | 20 | 23 |
| `cw-outbreak` | 8 | 574 | 20 | 25 |

## Sources and registration

The assets and POIs come from [DECLASSIFIED](https://declassified.app/) at pinned [commit e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0](https://github.com/Miss-placed/DECLASSIFIED/tree/e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0). The repository's MIT license credits Odinn H and Ben Ashley. Its complete notice is embedded in each delivered SVG and copied into each map directory as `LICENSE.txt`.

`cw-source/` retains the source marker definitions, marker classes, renderer and a constrained-parser export. No upstream JavaScript is executed. The parser accepts literal coordinate arrays and quoted strings only. Every delivered location links to the exact source-file line. Upstream short marker IDs survive in `sourceId`; public IDs use `dc-` plus the lowercase UTF-8 hexadecimal encoding of that ID so deep links are safe and reversible. No names are used to guess coordinates.

The source renderer uses `L.CRS.Simple`. `ImageBounds` is `[[0,0],[512,512]]`; SVG overlays use `viewBox="0 0 512 512"`. Therefore normalized top-left coordinates are `x = longitude / 512` and `y = 1 − latitude / 512`.

The validation script compares every geometry primitive, including its coordinates, between each legacy SVG and the current TSX overlay: **all 3,099 primitives match in all sixteen layers**. This proves the artwork shares the source POI coordinate registration. It does not independently prove the gameplay correctness of every upstream marker.

All sixteen SVGs rendered successfully at 1024×1024 and were visually inspected in four annotated contact sheets under `cw-previews/`. Representative plotted facilities and quest locations align with the source plans. Out-of-bounds environmental sightlines and distant props are retained where published; they do not imply walkable routes. Individual source renders and contact-sheet number legends are saved beside the contact sheets.

## Editorial decisions

- Three mobile/random drops have no fixed pins: Klaus's battery, the Tempered Crystal Heart and the Energetic Geode. Their relevant targets explain the gap.
- Four approximate underground silo pins from the upstream surface Ruka map are excluded. Ruka includes only the surface elevator and Legion arena. The layer, coverage note and elevator target explicitly say the interior is missing.
- Mauer's three code-room markers are areas, not three alleged exact number positions. The guide's nine reference photographs remain the authority for searching them. The transistor room and dish fields are also areas.
- Forsaken's four teleporter-part rooms are areas, reflecting variable surfaces within each room. Firebase Z's moving crystal is a search area, and its Open Lot target does not claim which duplicate container is correct.
- Boss arenas, mobile-enemy encounter spaces and broad finale destinations are areas. The Excision finale marker does not pretend to provide an escort path through gas.
- Outbreak shopping-station candidates, quest monkeys, red orbs, bunnies, mystery-box positions and other variable spawns carry candidate/conditional metadata. Inversiya radios/amplifiers are separate activity sets from ordinary music radios/amplifiers. Sanatorium has no red-rift start; Ruka has no projector.
- Existing guide prose overrides two misleading upstream descriptions: Klaus's repair/upgrade prerequisites and Ronald Raygun's four pizza deliveries. Original source snapshots remain intact for comparison.
- Cold War Intel, some finer side quests, moving world objectives, airborne rift chains, the Excision moving rover path and the Ruka silo interior remain unmapped. A guide step without a defensible target receives no invented pin.

## Integration handoff

Each JSON is in `app/data/maps/<dataset-id>.json`; each asset is `/maps/<dataset-id>/<layer-id>.svg`. Dataset IDs equal their guide IDs. Parent guide/catalogue/loader integration is intentionally owned by the main implementation.

`quickLinks` maps raw guide step IDs (without the `guide-step-` DOM prefix) to targets; `target.guideAnchor` retains that prefix. `cw-outbreak.guideQuickLinks` additionally supplies:

- `cw-outbreak-ravenov`: radio preparation/activation/return, monkey search, projectors, silo entrance, and Legion surface fight.
- `cw-outbreak-excision`: ground red rifts, helicopter, red-orb and bunny candidates, and broad finale area.

Targets belonging to child guides carry `guideId` so their return links resolve against that child's anchors.

The full machine-readable binding table is `cw-source/guide-bindings.json`. The base Outbreak `guide-step-setup-1` also maps to `facilities` directly in the dataset. Do not bind keys, launch-console order or other silo steps to surface locations.

Physical types are independent of activity membership. Activities are authored `filterGroups` leaves, so a POI can participate in several tasks without being duplicated. Defaults use a quiet overview of power, reactors, Pack-a-Punch, Arsenal and Wunderfizz. Physical types include radio, amplifier, orb, NPC, weapon crate, arcade machine, reactor, collection unit, robot and teddy bear, alongside the shared standard types.

## Reproduction and verification

Run from the repository root:

```text
node scripts/build-cw-datasets.mjs
node scripts/validate-cw-maps.mjs
```

To refresh previews, set `CW_NODE_MODULES` to a directory containing `sharp` (or install it in the local runtime), then run `node scripts/validate-cw-maps.mjs --render`.

Checks cover exact source geometry, retained MIT notices, self-contained SVG content, unique IDs, valid layers, bounds, original-coordinate transformation, physical categories, all target/filter references and every guide anchor. Results are saved in `cw-source/validation.json`. Seven editorial exclusions are recorded separately in `cw-source/editorial-exclusions.json`. No application-wide build or browser checks are claimed by this scoped dataset validation; the parent integration owns those checks.
