# Map viewer audit and recommended filter standard

Research date: 11 October 2026. Scope: planning and local-source inspection only; no product implementation. Counts describe this checkout, not a claim that the catalogue includes every historical Zombies mode. External documentation was read for the icon license and accessibility recommendations.

The focused decision specification is [filter-standard.md](filter-standard.md). Its leaf vocabulary and interaction rules take precedence over illustrative examples in this audit.

## Current coverage

`shared/catalogue.json` contains 96 map entries in 13 games, plus two child guides for Cold War Outbreak. Eleven map entries have `interactiveMap: true`, and exactly eleven corresponding JSON datasets exist. Therefore 85 entries currently lack an interactive dataset. Catalogue entries do not equal distinct geographic layouts: remasters, mode variants, region collections, and story/survival variants need separate content review even when artwork might be shared.

| Game | Catalogue map entries | Interactive datasets | Without dataset |
| --- | ---: | ---: | ---: |
| BO7 | 6 | 6 | 0 |
| BO6 | 6 | 0 | 6 |
| Cold War | 5 | 0 | 5 |
| BO4 | 8 | 0 | 8 |
| BO3 | 14 | 0 | 14 |
| BO2 | 12 | 0 | 12 |
| BO1 | 11 | 0 | 11 |
| World at War | 4 | 0 | 4 |
| Infinite Warfare | 5 | 0 | 5 |
| WWII | 11 | 0 | 11 |
| Advanced Warfare | 4 | 0 | 4 |
| Vanguard | 4 | 0 | 4 |
| MW3 | 6 | 5 | 1 |
| Total | 96 | 11 | 85 |

The existing viewer already supports five MW3 datasets: Urzikstan plus Dark Aether Seasons 1, 2, 3 and 5. `mw3-unstable-rift` has no arena dataset; its access-obelisk candidates belong to Urzikstan. Do not count these 54 access sites as a surveyed arena map.

| Dataset ID | Locations | Targets | Quick links | Layers | Current filtering |
| --- | ---: | ---: | ---: | ---: | --- |
| ashes-of-the-damned | 127 | 212 | 19 | 1 | Exclusive category |
| astra-malorum | 75 | 154 | 21 | 3 | Exclusive category |
| paradox-junction | 113 | 212 | 16 | 3 | Exclusive category |
| totenreich | 163 | 61 | 14 | 2 | Exclusive category |
| kowakujo | 94 | 70 | 18 | 1 | Exclusive category |
| rex-infernus | 156 | 51 | 11 | 1 | Exclusive category |
| mw3-urzikstan | 338 | 32 | 21 | 1 | Exclusive activity + subfilter |
| mw3-dark-aether-season-1 | 27 | 9 | 9 | 1 | Exclusive activity + subfilter |
| mw3-dark-aether-season-2 | 29 | 8 | 8 | 1 | Exclusive activity + subfilter |
| mw3-dark-aether-season-3 | 21 | 5 | 5 | 1 | Exclusive activity + subfilter |
| mw3-dark-aether-season-5 | 30 | 8 | 9 | 1 | Exclusive activity + subfilter |
| Total | 1,173 | 822 | 151 | 16 | |

There are 970 point records and 203 approximate-area records. Six BO7 maps account for 728 locations, five MW3 maps for 445. Fourteen distinct local artwork files total 12,791,405 bytes (about 12.2 MiB). Paradox's three layers reuse the same atlas with different focus bounds; Astra includes a clearly described pylon-order schematic. This distinction must survive migration.

## What makes the current controls hard to read

The root issue is information structure as well as icon appearance. `app/components/InteractiveMap.client.vue` contains both the entire filter state and Leaflet rendering.

| Code reference | Observed behavior | Consequence |
| --- | --- | --- |
| Lines 14–29, 116–150 | One `category` ref; MW3 adds one `subfilterId` | Cannot show perks, Pack-a-Punch and a quest together |
| Lines 145–157 | BO7 broad categories are inferred from data; selected targets are unioned back into visible pins | Unchecked/excluded-looking content can remain, without a dedicated visibility control |
| Lines 185–200 | MW3 activity/subfilter changes clear selection; BO7 category changes do not | Same viewer behaves differently between games |
| Lines 180–182, 230–233 | Nine category names and Unicode glyphs (`◇`, `!`, `✚`, `↑`, `↗`, `▪`, `⚒`, `×`, `ϟ`) | Shape depends on font; meanings are vague; several look alike at map scale |
| Lines 304–329, 640–646 | Every unselected marker has the same gold square, background and text color | Color adds no category distinction; broad category glyph is the only distinction |
| Lines 202–205, 319 | Multi-location selection replaces category icon with an index | Useful guide numbering removes the remaining type cue |
| Lines 598–600 | Legend explains point versus approximate area only | No on-map explanation of the nine glyphs |
| Lines 562–570, 650 | Filter buttons wrap on desktop and horizontally scroll on phones | Many types are offscreen; multiple rows compete with the map |
| Lines 145–157 | List covers all layers, map covers active layer | A single count can imply every listed result is on the current image |
| Lines 145–150 | Searching from MW3 overview silently includes non-overview entries | Search scope changes depending on active category |

Concrete examples from the datasets:

- `travel` combines purchased doors, exfil sites, fast travel, portals and other movement. Totenreich has 50 such entries.
- `equipment` combines armor, crafting, GobbleGum, dig spots and quest pedestals. Rex Infernus has 42 equipment entries, but zero entries categorised as `quest` despite 51 guide targets.
- `upgrade` combines Arsenal and Pack-a-Punch. A player looking for Pack-a-Punch cannot isolate it on BO7.
- `perk` mixes ordinary machines and Cursed Mister Peeks candidates. The special switch helps one subtype only; Der Wunderfizz and different machine types still use the same plus symbol.
- `quest` is not equivalent to "all main quest items". Many BO7 targets intentionally point to room-area guidance, and exact object coordinates are unverified.

Existing `docs/mw3-map-filter-plan.md` records an October 9 decision against a checkbox tree, based on a previous task preference. The current user explicitly asks to reconsider multiple selection and a sidebar; that old decision is historical context, not a binding constraint on this plan. Preserve the useful authored MW3 memberships and photo workflow while changing the interaction standard.

## Options and decision

| Option | Benefit | Limitation | Recommendation |
| --- | --- | --- | --- |
| A. Replace glyphs with SVGs; retain exclusive pills | Small migration; improves recognition | Still cannot combine types; broad categories remain ambiguous | Insufficient alone |
| B. Make existing horizontal pills independent toggles | Fast access; moderate work | Weak hierarchy; mobile scrolling becomes worse as subtypes grow | Useful only as a compact preset/active-filter strip |
| C. Two-level checkbox sidebar, shared subtype icons, activity presets | Arbitrary combinations; visible legend; scalable; preserves simple task entry points | Requires deliberate taxonomy, migration and responsive layout | **Recommended** |
| D. Full advanced faceted query builder (types AND quests AND conditions) | Powerful for specialists | Surprising empty sets; too much state to manage during a match | Defer; not needed for first expansion |
| E. Entirely branded game-item imagery | Familiar perks/items where authentic art exists | Tiny busy images; inconsistent era styles; rights and missing-image maintenance | Optional enrichment for detail panels, not the core filter grammar |

Use C with a deliberately shallow structure. Every leaf checkbox is an independent set of locations; checked leaves combine with OR across all groups. Display organisation is not an implicit AND operation. A player checking "Ammo caches" and "Red Worm USBs" sees both. Regions/layers and the search term narrow that union explicitly. Use presets to make common setups one action, not to force one task at a time.

## Proposed shared control behavior

1. Desktop: a collapsible left rail about 270–300px wide, a dominant map canvas, and an on-demand location detail panel. Do not permanently squeeze the embedded guide into three columns. The rail has Filters and Locations views; location details can replace the rail body with an obvious Back control. Wide expanded mode may show details on the right after actual layout review.
2. Phone/tablet: a persistent `Filters (n)` button opens a bottom sheet or side drawer with the same grouped checkboxes. Show a result count and Done button, preserve map position, support Escape and focus return. Let changes apply immediately; Done dismisses rather than committing a separate hidden draft.
3. Native `<input type="checkbox">` and visible labels. Each group has a separate disclosure button and an optional tri-state select-all checkbox. A partial group is indeterminate. Clicking a partly selected group selects all its available children; clicking a fully selected group clears them. Disclosure never changes membership. This follows the W3C's [checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).
4. Fixed group ordering and shared language across maps. Omit unsupported groups; do not show dozens of disabled global options. Map-specific quest names appear within Quests & activities. Label unknown source types explicitly rather than silently classifying them.
5. Quick presets: Essentials, Main quest (if authored), All locations, Hide all, plus named map activities where useful. Presets replace the checked leaf set and remain visibly editable. After a manual change, show Custom. `Hide all` empties browsing filters; it does not erase guide progress, board observations or saved game notes.
6. Each row contains its marker icon, label and a location count. Compute parent/preset counts from the union of IDs, never by summing overlapping leaves. Show current-layer matching counts, and make other-layer matches discoverable (`3 on this layer · 5 elsewhere`). Map caption distinguishes filtered pins from extra highlighted pins.
7. Search defaults to the checked filters; it never silently enables unrelated types. An explicit Search all locations action temporarily searches the full dataset without destroying the saved checkbox set. Changing checkboxes does not erase the query. No-results state provides Clear search, Search all, and Reset to essentials as appropriate.
8. Checking a filter updates markers without auto-panning, auto-zooming, clearing the query or moving keyboard focus. Fit visible is an explicit action. Changing geography may fit that geography; ordinary filter changes preserve the user's orientation.
9. Guide highlight is separate from browse filters. An incoming `#map:target` always reveals/focuses its locations, with a persistent `Guide locations (n)` control and a clear action. Explain pins that are outside the selected filters. Checkbox/preset changes never silently erase an active guide link. Clear highlight removes only the extra overlay. A selected icon retains its subtype silhouette and gains a gold halo; sequence/photo numbers are small badges rather than replacing the icon.
10. Keep the accessible location list as a first-class alternative to spatial pins. It must remain usable when artwork, Leaflet or storage fails.

## Shared taxonomy and icon semantics

Keep **what a place is**, **what quest it belongs to**, **whether it can spawn**, and **how accurate its position is** separate. These axes cannot be encoded reliably in the existing single string `category`.

The following is a proposed stable vocabulary; render only leaves that have verified members on a map. Exact glyph selection should be checked in a visual prototype before freezing the registry.

| Group | Example stable leaf IDs | Proposed icon semantics |
| --- | --- | --- |
| Essentials & upgrades | `power-switch`, `pack-a-punch`, `arsenal`, `armor-station`, `buildable-workbench` | Power switch, upgrade machine, tools, shield, workbench |
| Perks | `perk-machine`, `wunderfizz`, `perk-reward`, `cursed-peeks` | Bottle, multi-bottle/dispenser, reward sparkle, bunny; distinct labels |
| Weapons & supplies | `wall-buy`, `mystery-box`, `ammo-cache`, `crafting-table`, `gobblegum`, `fuel-station` | Wall weapon, question-mark box, ammunition crate, hammer, gumball dispenser, fuel pump |
| Travel & exits | `door-buy`, `fast-travel`, `teleporter`, `portal`, `zipline`, `launch-pad`, `exfil`, `entry-point` | Door, directional arrows, portal rings, cable, launch arrow, exit/helicopter, landing flag |
| Quests & activities | Per-map memberships such as `main-quest`, `music`, `wonder-weapon`, `red-worm-usbs`, `red-worm-clue-boards`, `unstable-obelisks`, `keys`, `locked-rooms` | Physical subtype where known; quest token/book, music note, key, lock, USB, clue board |
| Traps & interactables | `trap`, `turret`, `dig-site`, `fishing-site`, `ritual-site`, map-specific special mechanisms | Hazard bolt, turret, shovel, fish, ritual shape |
| Areas & landmarks | `spawn-area`, `named-area`, `boss-arena`, `reference-landmark` | Flag, area outline, arena symbol, landmark pin |

Keep perk identity as optional `itemId` (for example `juggernog`), not a new global category for every machine. Offer a small second-level subtype/identity section only when useful. Unknown Paradox `Perk-A-Cola` pins must stay unspecified; do not infer a specific perk image. Classic perk machines, BO4 perk slots, WWII perk equivalents and Exo upgrades need their actual game terminology with shared functional grouping only where valid.

Prefer a small local SVG icon registry using a single stroke language and an attribution file. [Lucide's published license](https://lucide.dev/license) permits use and modification with copyright/license notices; some inherited Feather icons have MIT notices. Local bundled SVGs avoid runtime icon-CDN dependencies and fit the Electron context. New game-specific silhouettes can be authored in the same style. This is a recommendation, not an installation performed in this planning pass.

Authentic item/perk artwork is optional where the correct edition and permitted reuse are documented; display it in list rows/details or as an enhanced marker with a reliable SVG fallback. Do not extract every copyrighted icon merely because a source viewer exposes it. Preserve credits and a rights status per asset. No AI-generated gameplay geography or reconstructed item icon should be treated as factual source material.

Suggested category tint families: cyan for upgrades, green/teal for perks, blue for supplies, violet for travel, amber for quests, coral for hazards and neutral for landmarks. These are provisional styling choices, not approved contrast values. Use icon silhouette + readable text + tint, with gold reserved for selection; do not rely on color alone, consistent with [WCAG use-of-color guidance](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html). Actual tokens require contrast checks against each theme and map background.

- Precision: exact point uses a solid outline; approximate area retains the dashed boundary and labelled area extent. Precision is independent of whether the object is a random candidate.
- Availability: a possible spawn gets a small question badge and the phrase Possible spawn. A fixed position is not a claim that the machine/item is active this match. Mode/quest conditions are text badges in the detail panel.
- Sequence: add a numbered badge only for an ordered target; candidate numbering must not imply a route or preferred spawn. Photo numbers retain their fixed reference-photo meanings.
- Touch: retain approximately 44px interaction boxes and aim for 44px filter rows. W3C's AA target-size guidance is 24px subject to exceptions, including spatial maps; the larger target is a product design goal, not a misstatement of the minimum. Keep the alternative list for dense/overlapping positions. See [target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Overlap: retain factual coordinates; never shift an item to improve appearance. At coincident positions, use an explicit stack indicator that opens a selectable list. Do not introduce automatic clustering until the 338-pin Urzikstan case is profiled; careless clustering hides useful subtype icons.

## Data model and migration plan

Retain Leaflet and top-left normalized coordinates. Existing `coordinate()` maps `(x,y)` to Leaflet `[height * (1-y), width * x]`; changing this projection is unnecessary. Reuse the existing lazy JSON/image loading and guide-target framework.

Proposed additions are design intent, not final code:

```ts
// Logical shape; final fields should be refined during the implementation review.
type MapLocationV2 = {
  id: string; layerId: string; x: number; y: number;
  typeId: string; itemId?: string;
  activityIds?: string[];
  availability?: 'fixed-reference' | 'candidate' | 'conditional' | 'moving';
  modeIds?: string[];
  precision: 'point' | 'area';
  // Existing descriptions, sources, floor, grid, state and areaRadius retained.
}
type MapFilterLeaf = {
  id: string; label: string; iconId: string;
  locationIds: string[];
}
type MapFilterGroupV2 = {
  id: string; label: string; filters: MapFilterLeaf[];
}
type MapPreset = { id: string; label: string; filterIds: string[] }
```

Prefer globally scoped filter IDs (for example `type:ammo-cache`, `activity:red-worm-usbs`) or a validated group/leaf compound key. Existing MW3 leaf names repeat across datasets and sometimes across conceptual groups; a map preference always belongs to a dataset ID. Group IDs must not masquerade as location `typeId`s. Keep authored memberships as stable IDs, never label-matching at runtime.

Keep a migration adapter from legacy category records during rollout, but the final authored data should be explicit. A one-time migration script may propose mappings based on known source IDs and labels for manual review. `Rex Infernus → equipment → Void Claw pedestal` must not become generic crafting because of its old category. Give every migrated location a reviewed type; preserve all 1,173 IDs, coordinates, descriptions, source notes and guide references unless independent factual review changes them.

Presets can compile to leaf sets, while a single location can belong to multiple activity leaves. Visible browse locations are:

```text
unique(union(checkedLeaf.locationIds))
  intersect active geography/layer
  intersect search results (unless explicit Search all scope)
  union separately declared guide-highlight locations on that layer
```

No selected leaf means no browse locations. It must not mean all. Do not derive candidate status from area precision: existing exact candidate positions and approximate fixed landmarks demonstrate why that is wrong.

Separate `regionId`, `floor/layerId` and scenario/mode if new datasets need them; the current `layerId` conflates geography, time state, boss arenas and diagrams. Outbreak should have a region chooser followed by appropriate floors/layers. A flat dropdown mixing all regions and floors would repeat the current scalability problem. Declare schematics as `kind: 'schematic'` and exclude them from geographic distance or route features.

Add explicit dataset ownership (`mapDatasetId` or equivalent resolved registry) for guide entries. `GuideArticle.vue:49–50` resolves a child's parent for `hasMap`, but line 59 calls `useGuideMap(mapId)` with the child guide ID. Enabling `cw-outbreak` alone would therefore advertise Map on its two child guides while trying to load missing child JSON. Resolve ownership consistently for loading, quick links, preferences and return-to-guide routes; keep progress keyed by the actual guide ID.

Per-map preferences should move to a versioned v3 structure (`codwiki-map-ui-v3:<dataset-id>`): checked leaf IDs, layer/region, wheel zoom, grid and optional collapsed sections. Do not persist search text as a surprise filter or mix this state with completion. Restore precedence: explicit incoming target and layer, valid v3, mapped v2, mapped v1, new Essentials default. Migrate legacy BO7 category to all corresponding leaves; legacy Peeks maps to its exact leaf; MW3 group/subfilter maps to its reviewed leaf. Ignore deleted IDs, retain valid settings, and fall back when none remain. An explicitly saved empty selection is valid and must remain empty. Keep v1/v2 records for fallback during the transition.

`codwiki-map-ui-v2` currently contains layer/category/perkFilter/wheelZoom, optional grid and subfilter, with special v1 wheel behavior (`InteractiveMap.client.vue:441–473`). Preserve that old explicit-opt-out rule when mapping preferences. Corrupt/unavailable storage must remain nonfatal.

The Red Worm photo board stores observations separately and synthesizes stable `red-worm-photos-*` targets. Today it activates by checking the exact exclusive category/subfilter pair (`InteractiveMap.client.vue:127`). Decouple it from the new checkbox set: make it an explicit activity/tool state that renders its observation UI and selected locations. Never open/close the photo board merely because someone checks USBs together with ammo. Preserve all twelve photo bindings, the four-photo limit, 495 possible sets, share hashes and dedicated tool route.

## Integration surfaces to plan for

| Surface | Current source | Work needed when implementing |
| --- | --- | --- |
| Shared renderer/filtering | `app/components/InteractiveMap.client.vue` | Extract pure filter state/normalization and icon registry; introduce shared rail/drawer |
| Types | `app/types/map.ts` | Explicit location types, versioned filter/preset shape, source/region semantics |
| Lazy datasets | `app/composables/useGuideMap.ts` | Preserve dynamic loading; resolve dataset owner; support region chunks only if profiling warrants it |
| Full/quick guide links | `GuideArticle.vue`, `ShowOnMap.vue`, `QuestSteps.vue` | Retain return focus/scroll, target IDs and completion; add only verified locations |
| Generated quick index | `scripts/generate-map-links.mjs` | Extend guide ownership/registry without hand-editing generated JSON |
| Catalogue/desktop/search | `scripts/generate-catalogue.mjs`, `shared/catalogue.json` | Set capability only when a dataset passes gates; regenerate website and native catalogue |
| Content generation | `scripts/generate-expansion.mjs` and game-specific shared sources | Add map references to authored sources so regeneration does not erase guide edits |
| MW3 photo tool | `app/components/puzzle/Mw3Photos.client.vue`, photo-board helpers | Preserve separate observations and tool flow |
| Evidence ledgers | Existing MW3 source JSON and research docs | Extend provenance to new images and markers with dimensions, hashes, transforms and review status |

All catalogue maps presently report available guides (no planned entries in this snapshot), but `MapEntry.vue` remains an older planned-guide component. Expansion should use existing GuideArticle surfaces, not route new atlases through that placeholder accidentally.

## Verification plan and risks

No tests or browser review were run for this audit; its findings come from source inspection and computed JSON inventories. Current tests were inspected to identify existing guarantees to preserve.

Automated acceptance:

- Dataset/catalogue parity; stable unique IDs; normalized coordinates; real local image dimensions; artwork hashes; valid attribution; all source references resolve; no false `interactiveMap` flag.
- Every location belongs to a discoverable leaf. Every leaf refers only to existing IDs. Preset and group unions deduplicate. Exact sets, not counts alone, should be asserted for known activities.
- Checkbox OR semantics: perk + Pack-a-Punch + named quest can appear together; zero selection stays zero; selected guide overlay has separate count/control; all/none/group partial states work.
- Query and layer behavior is consistent across BO7 and MW3. Checking another leaf preserves query, viewport and keyboard focus. Counts distinguish active layer and other layers.
- Migration from v1/v2, corrupt JSON, unavailable storage, removed subtype/region, explicit empty v3 selection, and reload persistence.
- Preserve all existing target/quick links, malformed/legacy `map%3A` decoding, Back to step reading position and focus, browser back/forward, progress reset and sibling guide isolation.
- Outbreak child-guide ownership resolves one atlas while retaining separate reader progress and correct return anchors.
- Photo finder retains 12 factual bindings and all 495 four-photo combinations; generic USB visibility never modifies observations or drive-letter meanings.
- Leaflet teardown/resizing/image-error tests stay intact; marker re-render restores focus and does not leak listeners.

Current tests of particular relevance: `tests/maps.test.mjs` covers navigation, sources/artwork, targets, quick links, filtering, preferences, coordinate conversion and lifecycle. `tests/mw3-maps.test.mjs` freezes the 445 source-backed positions and their game-specific semantics. `tests/mw3-photo-board.test.mjs` checks activities and photo combinations. Tests currently assert exclusive MW3 filtering; replace those expectations deliberately when implementing, not by deleting coverage.

Manual acceptance scenarios:

1. BO7 mixed selection: show Pack-a-Punch, perk machines and one quest group; distinguish all three without hovering; then isolate Cursed Peeks and see clear candidate/mode labels.
2. Busy map: Totenreich travel doors versus exfils, Rex equipment versus quest pedestals, and all 338 Urzikstan records; test collision handling and list access.
3. Multi-layer: Paradox past/future/boss and Astra Mars/schematic; target spans layers; user can see which layer has remaining matches.
4. MW3: Red Worm USBs plus ammo, current photo board, Unstable obelisks and seasonal keys/exits; no stale photo or guide selection hides the meaning of the result count.
5. Small phone at 360px, portrait/landscape, tablet, normal desktop embedded guide, expanded map, Electron window and app zoom. The map remains useful with the filter UI open or collapsed.
6. Keyboard only: checkbox Space, group disclosure, Escape drawer, focus restoration, marker Enter/Space, detail/list flow; inspect screen-reader labels and mixed state.
7. Color-vision/grayscale and every supported theme; icon meaning survives without tint. Verify text/UI contrast with actual rendered colors rather than assuming palette names are sufficient.
8. Broken artwork, offline/missing chunk, storage failure and malformed shared link; usable list and clear retry/return state.

Risk priority: wrong-edition artwork or reused coordinates is the largest content risk; conflating candidates with certainty is next. For the UI migration, the major risks are silent selection leakage, incompatible saved filters, photo-finder coupling and child-guide dataset ownership. Stabilize the shared standard on existing BO7 + MW3 and one multi-floor legacy pilot before authoring dozens of new datasets.
