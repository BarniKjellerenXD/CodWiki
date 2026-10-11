# Interactive maps across CodWiki

Implementation plan and research record · 11 October 2026 · **Compact toggles selected and implemented**

## Selected implementation

The user selected **Compact toggles** after comparing the interactive alternatives. Common physical types are implemented as multi-select buttons above the map, with grouped additional types and activities under More filters. Essentials/All/Hide all replace the checked set. Compact controls supersede the proposed checkbox sidebar and mobile drawer. The recommendation table below records the initial research decision, not the final user choice.

Implementation uses the shared viewer, local SVG icons, v3 preferences, explicit dataset ownership for child guides, and sourced data batches. There are **72 interactive maps: 61 added and 11 updated**, comprising 90 layers, 3,709 locations and 2,056 guide targets. **48 maps use partial original schematics**, visibly labeled with area precision. **24 catalog entries remain source/geometry gaps**. BO6 and Cold War use sourced vectors; Origins uses credited creator artwork. Unresolved geographic gaps stay recorded.

The delivered scope and remaining gaps are recorded in [implementation coverage](map-expansion-research/implementation-coverage.md). The original proposal below is retained as a research record; the selected compact controls supersede its sidebar/drawer recommendation. The current behavior is documented in [implementation notes](map-expansion-implementation.md).

## Initial recommendation (superseded by Compact toggles)

Extend the existing Leaflet viewer to every catalog entry for which a suitable layout can be verified. First replace exclusive category buttons with a **grouped checkbox sidebar, activity presets and a consistent SVG marker system**. Then add content in batches ordered by asset readiness. Keep game editions, floors and map states explicit.

Do both improvements the user suggested: better icons **and** better filters. Icons solve recognition; checkboxes solve combining useful information. Neither alone solves the current problem.

Start the interface migration on **Paradox Junction and Urzikstan**, using their existing data. Use **Liberty Falls** as the first newly mapped guide, **Terminus** to validate vertical/layered geography, and **Origins** as the first older-map source pilot. This exercises the important differences before authoring dozens of datasets.

This proposal supersedes the earlier single-choice filter recommendation in `mw3-map-filter-plan.md`. It preserves the existing guide/map navigation contract and all saved quest progress.

## Baseline before implementation

The checked-out catalog contains **96 map entries across 13 games**, plus two Outbreak child quest guides. There are **11 interactive datasets**, with **1,173 locations, 822 targets, 151 quick links and 16 layers**. These are reference records, not a claim of exhaustive in-game coverage.

| Game | Catalog entries | Existing interactive maps | Entries to assess/add |
| --- | ---: | ---: | ---: |
| World at War | 4 | 0 | 4 |
| Black Ops | 11 | 0 | 11 |
| Black Ops II | 12 | 0 | 12 |
| Black Ops III, including Chronicles | 14 | 0 | 14 |
| Black Ops 4 | 8 | 0 | 8 |
| Cold War | 5 | 0 | 5 |
| Black Ops 6 | 6 | 0 | 6 |
| Black Ops 7 | 6 | 6 | 0 |
| Advanced Warfare | 4 | 0 | 4 |
| Infinite Warfare | 5 | 0 | 5 |
| WWII | 11 | 0 | 11 |
| Vanguard | 4 | 0 | 4 |
| MWIII Zombies | 6 | 5 | 1 |
| **Total** | **96** | **11** | **85** |

MWIII already includes Urzikstan **and four Dark Aether maps**. Unstable Rift is the remaining MWIII entry. Map count is not asset count: Outbreak alone needs eight regional layouts plus any verified quest interiors; a multi-floor guide can need several images. Remasters are separate guide entries even when some geometry is shared.

The existing BO7 markers use small Unicode symbols on essentially the same gold square. The schema mixes physical objects, activities and areas in one category. For example, `travel` covers doors, exfil and fast travel; `equipment` covers crafting, armor, dig spots and quest mechanisms. Rex Infernus has no `quest` category locations despite 51 guide targets, so categories cannot be mechanically interpreted as quest coverage.

The viewer stores one category and one subfilter. BO7 retains selected targets when filters change; MWIII activity changes can clear them. The new standard resolves this inconsistency explicitly.

Detailed evidence: [viewer audit](map-expansion-research/viewer-audit.md) and [existing dataset inventory](map-expansion-research/existing-datasets.json).

## Interface alternatives

| Option | Advantages | Costs and limits | Decision |
| --- | --- | --- | --- |
| Keep single-choice filters; improve icons | Smallest change; stronger object recognition | Still cannot show perks, PaP and selected quest objects together | Insufficient for the request |
| Multi-select chips above the map | Compact with a few categories; familiar | Large subtype lists wrap into a wall of controls, particularly on phones | Use only for active selections and presets |
| **Checkbox sidebar + presets + typed icons** | Arbitrary combinations; a visible legend; room for useful subtypes; scales across games | Requires taxonomy review, saved-state migration and a mobile drawer | **Recommended** |
| Activity-first browsing | Fast for one goal such as Red Worm | Hides unrelated but useful items and makes mixed browsing awkward | Keep its convenience through named presets |

The accompanying interactive concept compares Checkbox sidebar, Compact toggles and Activity first with sample pins. It is a behavior sketch, not a geographic model, app implementation, or final responsive specification. The icon-only change is documented above rather than presented as another nearly identical screen.

Desktop: a collapsible **270–300px left rail** containing search, presets, expandable filter groups and location-list access. Keep the map dominant. Location details can replace the rail content with a Back control, avoiding permanent panels on both sides of an embedded map. Expanded wide mode may show details beside it.

Mobile: **Filters (n)** opens a drawer/bottom sheet using the same groups. Checkboxes apply immediately; Done closes the sheet. Show how many locations are visible, preserve search and scroll, restore keyboard focus, and keep the map's location list usable without panning. Layer/region controls remain separate from object filters.

## One filter and marker language

Use shallow group → leaf checkboxes, displaying only populated types. Initial groups:

1. Power & upgrades: power, generators, Pack-a-Punch, Arsenal and upgrade/armor stations.
2. Perks: individual machines, Wunderfizz, reward locations and Cursed Mister Peeks candidates as distinct types.
3. Weapons & supplies: wall buys, Mystery Box, ammunition, armor purchases, crafting, GobbleGum and applicable helpers.
4. Parts & collectibles: buildable parts, quest items, keys, symbols/clues, music items and dig sites.
5. Travel & exits: doors, teleporters, fast travel, portals, ziplines and exfil.
6. Traps & mechanisms: traps, turrets, quest workbenches, ritual sites and challenge starters.
7. Quests & activities: authored sets such as a main quest, wonder weapon or Red Worm.
8. Areas & landmarks: spawn areas, named rooms, boss arenas and reference landmarks.

Every location has a physical type, separate activity memberships, availability/conditions, and placement precision. An exact possible-spawn point is different from an approximate area. A part remains a part even when it appears in Main quest. Several checked leaves combine with **OR**; layer, mode/state and search narrow that union. Deduplicate overlapping results.

Specific interaction decisions:

- Group checkboxes support checked, unchecked and mixed state. The disclosure arrow is a separate control.
- Essentials/Main quest/named activity presets **replace** the checked set. Any manual edits become Custom; no hidden additional activity filter remains active.
- Hide all means zero browsing pins. Explicit guide highlights are a separately labeled overlay, with their additional count visible.
- Counts reflect current layer/search/state, with other-layer results reported separately. Overlapping activity/type totals are not added together.
- Changing a checkbox keeps search and camera position. Fit visible/selected/map are explicit commands.
- Opening a guide target reveals it without rewriting saved checkboxes. Clear highlight and Back to step have distinct purposes.
- The Red Worm photo finder remains an explicit tool. Checking USB locations must not open it automatically or change saved photo observations.

Use a consistent set of local SVG silhouettes: bottle/cup for perks, distinct upgrade machine for PaP, tools for Arsenal, puzzle piece for parts, key for keys, musical note for music, door for doors, portal for portals, and exit/helicopter for exfil. Gold emphasizes selection; object identity remains visible. Pair limited family colors with icons and text. Candidate badges, dashed approximate-area extents, and sequence/photo number badges have separate meanings.

**Icon source choice:** use [Lucide's licensed SVG set](https://lucide.dev/license) as the neutral baseline, preserving its ISC/inherited MIT notices as applicable. Review a small number of matching custom symbols for PaP, Wunderfizz and Cursed Peeks. Authentic game icons can enhance recognizable items later, where edition and provenance are established; they must have a neutral fallback. Avoid a mixture of emoji, screenshots and differently styled icon packs on the canvas. Put larger object photographs in the detail panel.

Dense pins: use a count/stack chooser for overlapping locations; retain factual coordinates. Never permanently nudge a pin to a different room to separate it visually. Aim for 28–32px visible symbols with approximately 44px activation areas where practical; maintain list alternatives for dense locations.

The complete interaction, count, accessibility and migration contract is in [filter-standard.md](map-expansion-research/filter-standard.md). That document is authoritative for details abbreviated here.

## Artwork research and what is actually gathered

The research folder contains source evidence for all catalog entries, including explicit gaps. **Candidate does not mean cleared, geographically verified, or ready to publish.** The inventory distinguishes directly opened sources, creator-linked sources, partial layouts, search leads and gaps.

| Family | Best evidence found | Practical consequence |
| --- | --- | --- |
| BO6, six maps | [DECLASSIFIED repository](https://github.com/Miss-placed/DECLASSIFIED) contains eight named vector overlays in its BO6 source, including Terminus prison/Bio Lab and Reckoning boss arena. [WZHUB's BO6 directory](https://wzhub.gg/map/bo6-zombies) independently lists all six maps. | Strong first batch. JSX/vector source needs conversion/sanitization and visual QA; one overlay does not prove all floors are covered. |
| Cold War | [DECLASSIFIED legacy atlas](https://declassified.app/legacy/) has two layout layers for each of the four round-based maps and eight Outbreak regional vectors. Some pairs separate floors; Firebase Z separates its main base and spawn village. | Strong batch after the BO6 pilot. Ruka silo interiors remain a separate gap; distinguish map regions from quest guides. |
| BO4 | Creator layouts located for seven maps, including [PvtLoganator's Alpha Omega collection links](https://www.reddit.com/r/CODZombies/comments/chax94/) and [TRPG_'s Voyage of Despair](https://www.reddit.com/r/CODZombies/comments/9ztkzk/voyage_of_despair_complete_map_with_location/). | Annotated drawings need permission/provenance review and calibration. Tag der Toten has no adequate spatial layout verified in this pass. |
| WaW / BO1 / BO2 / BO3 | COD Zombified room/floor series, creator drawings, and the [BradyGames/Pearson TranZit supplement](https://ptgmedia.pearsoncmg.com/imprint_downloads/brady/colin/black_ops_2_zombies_supplement_11-12.pdf). [ZedzDEMIZie's Origins post](https://www.reddit.com/r/CODZombies/comments/6wh7nx/hq_map_i_made_to_celebrate_originss_4th_birthday/) includes an express reuse-with-credit statement. | Large potential coverage, but quality, edition and floor completeness vary. Origins is a useful early pilot; legacy POIs cannot be copied into Chronicles unchanged. |
| AW / IW / WWII / Vanguard | Original room-map series and creator guides provide uneven coverage; the per-entry research identifies specific map images and where only partial references exist. | Batch by evidence readiness, not by promising every game at once. Several WWII chapters and other special destinations need further layout work. |
| MWIII Unstable Rift | Existing obelisk entry locations are not a layout of the rift arena. | Retain current Urzikstan entry guidance; add the separate arena only after an adequate source is verified. |

**24 research files have been downloaded** from a pinned DECLASSIFIED commit: **16 standalone Cold War SVG layouts**, the BO6/CW vector source files and supporting layer/style declarations, README, and two license notices. Their exact source URLs, hashes, byte sizes and commit are in [downloaded-assets.json](map-expansion-research/downloaded-assets.json). These files are under `docs/`, not the app's public assets. BO6 includes eight overlays in source form; they have not been converted into production images or imported into the viewer.

The repository license is MIT (current copyright Odinn H & Ben Ashley; legacy copyright Odinn H). Preserve those notices. That establishes the repository's declared terms; it does not establish ownership of all underlying game imagery. WZHUB and fan-art candidates have separate reuse/provenance statuses. Credits alone must not be recorded as permission.

Other source images are gathered as exact page/asset references, not all downloaded. Some original pages fail retrieval while a creator link or credited mirror remains accessible; those rows retain the lower evidence level. This package is sufficient to select batches and start the pilot, not a claim that 85 maps have publication-ready assets.

**Rejected substitutions:** atmospheric homepage covers are not layouts; quest screenshots and Morse/orrery puzzle charts are not basemaps; a route diagram is not a scaled overhead; an old-edition drawing is not proof of remaster POIs. Do not use AI-generated map artwork to invent geography.

The reconciled inventory has **44 new layout candidates, 18 partial references, 9 unverified leads and 14 unresolved gaps**, alongside the 11 existing datasets. These are guide-entry counts; several editions refer to the same geometry source. None of the 85 new entries is labeled production-ready by this pass.

### Artwork options

| Approach | Strength | Limitation | Selection |
| --- | --- | --- | --- |
| Clean supplied vector layouts | Sharp zoom, low visual clutter, controllable palette | May omit labels/interiors; source and geometry still need review | Preferred for the new BO6/CW batches where accepted |
| Game tactical imagery | Recognizable terrain and familiar presentation | Dense texture can reduce marker contrast; floors may be combined | Keep existing BO7/MWIII artwork and use accepted new tactical images where clearer |
| Annotated creator drawings | Often the best available older-map geometry and room names | Baked-in markers cannot be hidden; some drawings are not to scale | Use with permission and calibration; obtain a clean version where possible, otherwise identify reference-only limitations |
| Independently authored schematics | Can fill a real gap and show connections clearly | Largest authoring/review burden; cannot imply measured distances | Optional later work for unresolved entries, not a shortcut to claiming complete coverage |

Choose the clearest verified background per map and standardize the **controls, marker language and evidence**, rather than forcing every game into a single artwork style. Use photographs in the details panel when an overhead cannot show the exact shelf, ledge or object.

## Asset acquisition and location authoring standard

For each guide, maintain a manifest with: guide/game/edition, geography family, candidate sources and original creator, exact image URL or pinned file, reviewed date, usage basis and notice, file hash/dimensions, orientation/crop, floors/regions/states, missing areas, geometry status and marker-review status. Preserve original source markings; request an unannotated original where baked-in pins would collide with our own. If that is unavailable, choose a clearly labeled reference-only image or independently author a verified schematic; do not erase attribution or imply an annotated image has filterable contents.

Use separate readiness gates:

| Gate | Required evidence |
| --- | --- |
| Source identified | Specific image/layout provider or original creator page; evidence level recorded |
| Artwork accepted | Correct edition/area, readable full-size file, usage basis, all claimed floors/states accounted for |
| Geometry calibrated | Frozen crop/orientation/revision, verified room boundaries and at least three non-collinear landmarks per spatial layer where applicable |
| Essentials authored | Named areas, power/PaP/perks/travel appropriate to that game, each with evidence and known gaps |
| Guide targets reviewed | Spatial Quick/Full steps linked; candidates/sequences/areas and exclusions classified; stable target IDs and anchors |
| Release verified | Content review plus browser/mobile/navigation/accessibility checks; coverage label matches delivered content |

Coordinates remain normalized top-left `x/y`, already supported by the app. Record the transform when adapting a source coordinate system. Resizing without changing framing keeps normalized positions; recropping, rotating, splitting floors or changing schematic geometry requires recalibration. Use `precision: area` when evidence only establishes a room. Sources should identify a location/photo/timestamp where possible, not merely the homepage of a guide site.

Reuse a verified geometry asset across editions only when the layout truly matches. Keep **separate location datasets, activity bindings and source review** for WaW/BO1/Chronicles, BO2/BO3 Origins, The Giant/Der Riese, and objective/survival variants. BO4 remakes and Vanguard Shi No Numa have meaningful changes. Shared names do not imply identical maps.

Author one explicit coverage row per spatial guide target: fixed point, candidate set, ordered sequence, room/area, dynamic/nonspatial, unresolved, or intentionally excluded with reason. Bind meaningful destination changes instead of attaching a map button to every sentence. Nonspatial boss mechanics do not need false coordinates.

A map can first release as **Overview + essentials** if that scope is visible. Call it **Guide-linked coverage** only when its spatial guide steps have been reviewed and remaining gaps are disclosed. Neither label promises every optional wall buy/intel collectible unless that inventory was explicitly completed. Do not mark all 85 as delivered by adding images alone.

## Implementation design, when authorized

Keep Leaflet and the shared viewer. It already supports image overlays, normalized points/areas, guide targets, layers and lazy loading. Replacing it with a new 3D engine or separate per-game viewer would add work without solving the current issues. An external embedded atlas offers less control over filters, navigation and saved guide context; use provider links as sources/fallback references instead.

| Area | Planned change |
| --- | --- |
| `app/types/map.ts` | Add versioned type/activity/availability metadata; layer provenance/geometry revision; typed filter/preset definitions. Keep existing IDs and target kinds. |
| Shared filter utility/registry | Pure checked-set union, scope intersection, deduplication, counts and migration; no ad hoc category branching in individual maps. |
| `InteractiveMap.client.vue` | Separate browse state, guide highlight and selected details; reuse map lifecycle/camera; render filter rail/drawer and typed SVG markers. |
| Filter/legend/detail components | Extract independent controls from the large viewer for predictable keyboard/focus behavior and mobile layout. |
| `useGuideMap.ts` / guide registry | Resolve dataset ownership explicitly. Outbreak child guides currently expose `parentMap` for availability but may still load by child ID. |
| Guide navigation and photo finder | Preserve all target hashes, Quick/Full return positions and Red Worm photo bindings. Decouple the photo workflow from category/subfilter state. |
| `app/data/maps/` and `public/maps/` | Add only accepted edition-specific content and versioned local layouts; lazy-load active map/layer assets. |
| Development authoring helper | Coordinate placement, layer preview and target validation; exports reviewed data and is not a public editor. |
| Existing catalogue generator | Derive availability from accepted datasets; never advertise a missing viewer or source-only draft. |

Proposed additional location fields are `typeId`, optional `itemId`, `activityIds`, `availability`, `conditions` and richer evidence metadata. Exact TypeScript design should follow the pilot, not a blanket data rewrite. The registry can compile each visible leaf to a set of location IDs; UI groups are presentation and do not alter OR semantics.

Use v3 map display preferences. Migrate reviewed old categories and MWIII subfilters to the corresponding checked leaf sets, retain valid layer/wheel/grid choices, and preserve explicitly empty v3 selections. Invalid persisted IDs fall back safely. Quest completion and Red Worm observations remain under their existing independent storage contracts. A direct map link wins over saved browsing state without overwriting it.

## Work order and exit criteria

| Batch | Work | Exit criterion |
| --- | --- | --- |
| 1. Shared standard | Type audit, icon sheet, checkbox UX on existing Paradox + Urzikstan | Mixed filters readable and predictable; old links/progress/photo tool intact; desktop/mobile checks pass |
| 2. First new maps | Liberty Falls, then Terminus, then an accepted Origins edition | Complete essentials and representative guide links; single-layer, multi-layer and older annotated source workflows proven |
| 3. Modern expansion | Remaining BO6; four CW round-based maps; Outbreak's eight regions and child-guide links | Claimed layer coverage verified; Outbreak silo gap explicitly resolved or labeled; no global eager asset load |
| 4. Legacy families | Origins counterpart, accepted WaW/BO1/Chronicles families, BO2 and BO3 original maps | Edition-specific markers and floor/state differences reviewed; candidate maps enter only when their evidence gate passes |
| 5. Other accepted layouts | BO4 creator layouts; AW, IW, WWII and Vanguard candidates in readiness order | Rights/source and geometry gates satisfied for each map; partial room maps not advertised as full coverage |
| 6. Remaining gaps | Tag der Toten, Unstable Rift arena and entries without adequate layouts | Locate/obtain an acceptable layout, author an independently verified schematic if chosen, or retain a visible research gap |

Content-source clearance can run in parallel with shared-viewer work. After the first pilots, separate contributors can author datasets under the same schema, with one shared reviewer for placement and taxonomy. Avoid parallel edits to the viewer/schema while it is still changing.

Measure actual pilot time separately for source preparation, geography calibration, location authoring and verification. Use that to forecast remaining work by layer/target complexity. A reliable estimate cannot be derived from 85 guide names alone; map content validation is likely to dominate the shared UI work. The proposal does not assume a single short implementation pass.

## Verification plan

Extend existing map, navigation and MWIII/photo tests for meaningful behavior: mixed sets, union counts, all/none/mixed group state, intentional empty preferences, migration, guide overrides, cross-layer selection and photo-tool independence. Validate every new data file for bounds, IDs, local assets, evidence links, edition ownership, target references and guide anchors.

Review rendering at 360px mobile, tablet, embedded desktop, expanded mode and Electron zoom; all five supported themes (Archive, Midnight, Forest, Ember and Paper); keyboard focus/Space checkbox actions; drawer closure/return focus; color-independent recognition; coincident pins; no results and asset/storage failures. Check back/forward/refresh, old hashes, Quick/Full/Map return-to-step and new-run reset. Run the repository's required tests and production build when implementation occurs.

For geography, compare calibration landmarks and representative pins from each type/floor against source images and independent guide evidence. Audit every claimed guide target and all uncertain placements. Website tests are not an in-game playthrough; record who reviewed what and the remaining limits.

Load only the active dataset and current layer. Use SVG when it remains manageable, WebP for accepted raster overviews, and consider local tiles only when a large image needs them. Avoid introducing provider network calls into ordinary map use. Set actual byte/interaction budgets after measuring the first pilots rather than promising performance from file counts.

## Original planning deliverables

The initial proposal recommended a checkbox sidebar. After comparing the concepts, the user selected **Compact toggles + typed SVG icons + presets** and authorized implementation. The shared viewer and source-readiness gates were retained; compact controls replaced the rail and drawer. See the implementation record for the final decisions and verification.

Read the supporting [research index](map-expansion-research/README.md), [complete coverage inventory](map-expansion-research/coverage.md), [filter standard](map-expansion-research/filter-standard.md), [viewer audit](map-expansion-research/viewer-audit.md), and [download manifest](map-expansion-research/downloaded-assets.json). The source inventories retain unresolved permissions, missing floors and absent layouts rather than treating them as completed work.
