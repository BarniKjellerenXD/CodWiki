# Totenreich, Kowakujō and Rex Infernus map verification

Updated 26 September 2026. These datasets connect the existing quick-step IDs and explicit Full Details buttons to the shared map viewer. Existing guide text, checkbox IDs and interactive tools are preserved.

| Map | Layers | Locations | Quick-step links | Cursed Peeks candidates |
| --- | ---: | ---: | ---: | ---: |
| Totenreich | 2 | 163 | 18 of 19 | 9 |
| Kowakujō | 1 | 94 | 18 of 19 | 5 |
| Rex Infernus | 1 | 156 | 18 of 21 | 6 |

Counts describe implemented links, not a claim that every quest object has an exact surveyed pin. `precision: area` is used for named rooms, candidate search areas and entrances to spaces that lack a floor plan. `precision: point` is reserved for service/object coordinates published by the referenced interactive maps. Coordinates are normalized from the image’s top-left corner.

## Sources and image alignment

- [Call of Duty: Zombies Guides — Totenreich interactive map](https://www.codzombiesguides.com/maps/totenreich/): named regions, eleven fishing spots, services, the separate Dravakar’s Fall arena and its three traps. The locally hosted images are the matching `totenreich-eidskallen-layer.webp` and `totenreich-boss-fight-arena-layer.webp`, each 2048 × 2048. The image contains the separate circular Tyr’s Head footprint north of Storm Bridge; the head is not placed on top of the factory.
- [Call of Duty: Zombies Guides — Kowakujō interactive map](https://www.codzombiesguides.com/maps/kowakujo/): named rooms, the Maneki-Neko and Sake Cup benches, gliders, Mystery Box candidates and the missing Vulture Aid / Wunderfizz positions. The corresponding `kowakujo-main-map.webp` is 2048 × 2048 and matches the uncropped official layout.
- [Call of Duty — Kowakujō tactical map](https://www.callofduty.com/guides/blackops7/zombies/kowakujo): official service coordinates use a 4096-unit square. Divide both coordinates by 4096. Duplicate official Ammo Cache and Elemental Pop entries at identical coordinates were removed. Other official marker coordinates are retained as published.
- [Call of Duty: Zombies Guides — Rex Infernus interactive map](https://www.codzombiesguides.com/maps/rex-infernus/): named rooms, fifteen Void Claw pedestals, eleven dig spots and services, paired with its 2048 × 2048 `rex-infernus-main-layer.webp`. The source misspelling `Nxyara` is normalized to the guide’s `Nyxara`, and `Ruina Insula` to `Ruinas Insula`.

The map artwork is Activision game imagery. Coordinate and layout sources are shown in each map’s source list. The public pages serialize their map data in the HTML; only literal objects, arrays and references were parsed, without executing downloaded JavaScript. No authentication, verification challenge or access restriction was bypassed.

The initial Totenreich image with baked icons and the coarse Rex map from Zombies Codex were replaced with the matching maps above. Their different crops and estimated labels must not be combined with the final coordinates. The official Totenreich export covers only the starting room and was not mixed into the full-map coordinate system.

## Cursed Mister Peeks reward candidates

All three matching COD:ZG maps publish a distinct `mister-peeks` marker group explicitly described as Cursed-only reward spawns. The main layers contain nine Totenreich, five Kowakujō and six Rex Infernus points. These normalized coordinates are copied directly from that group onto its matching background; no floor, boss arena or additional spawn is inferred. The published points have no individual captions or height information. Their labels therefore name the nearby mapped area for orientation, and the location description makes that limitation explicit. Some candidates are outside the playable outline; their pins locate the figure to shoot, not a walking destination.

Each new location has `category: perk`, `perkType: mister-peeks`, `precision: point`, the source URL, and `state: Cursed mode · possible spawn`. The `cursed-mister-peeks` target groups them as candidates on each map. The UI can use that explicit subtype to distinguish these rewards from perk machines. No main-quest quick step is linked to these optional spawns. The locations are separate from headphone/music collectibles, relic-trial eggs, the Rex doll/parkour quest and Mister Peeks’ Dance Off.

The supported behavior is a possible brief appearance during tiered Cursed runs: shooting Peeks awards an egg with loot that can include perks. Pins are not guaranteed appearances or guaranteed perk drops. COD:ZG describes tier-dependent eggs, a spawn chance and a time limit; the [community Mister Peeks reference](https://callofduty.fandom.com/wiki/Mister_Peeks) gives a different duration, so the UI does not promise a percentage, timer or exact loot count. A [July Totenreich guide](https://codcentral.net/blog/mr-peeks-totenreich-bo7/) lists eight spots, while the matching COD:ZG map currently publishes nine, including Lighthouse. The dataset reports its nine published candidates without claiming that every possible spawn has been independently surveyed in-game. Rex’s main map is eligible for Cursed, also corroborated by the [official Season 05 patch notes](https://www.callofduty.com/patchnotes/2026/07/call-of-duty-black-ops-7-season-05-patch-notes), which specifically cover Cursed Rex Infernus.

## Accuracy boundaries and intentionally missing links

**Totenreich:** Quick step `phase-3-ol-3` calls in the portable Glocke Drop; it has no fixed place. The other 18 quick steps link to areas, fishing candidates or the separate boss arena. Quest objects such as crates, the radio console, gnomes, deer-head viewpoints, headphones, generators and relic portals use their established room or viewpoint rather than an invented exact pin. The Genetic Lab is on Fishery Island; Core Foundry is the ARC-XD approach across the water. Uranium jars and the cell are not incorrectly placed at the vent. Tyr’s Head, its shoulder and the upper Workshop remain explicitly described as elevated or interior spaces. The distant Urzikstan / Liberty Falls relic rooms are accessible through the mapped Tyr’s Head, but have no standalone artwork or interior pins. Existing `TBD` power-up statues and the unnamed relic remain content gaps. Rune wood piles are not surveyed; the Sunstone target points to the church altar area.

**Kowakujō:** Quick step `phase-6-ol-1` follows a moving light and enters a separate purification encounter, so no fixed target is claimed. The volcano boss link identifies its fast-travel entrance in Shogun’s Sanctum; no volcano arena is fabricated. Meditation Room has no separate published room label, so its marker is explicitly “Keep — Meditation Room” and describes a broad keep approach. Lanterns are room guidance: eleven lanterns occupy ten named search areas, including two in Central Courtyard. Precise rat-toy/cat candidates for Neko Cafe, the three relic symbols and the unspecified Nyxara fight mechanics remain unsurveyed. The workbenches have separately published point coordinates; generic mentions of the surrounding room still use area guidance.

**Rex Infernus:** `phase-4-ol-2`, `phase-4-ol-3` and `phase-4-ol-4` describe moving boss enemies and a separate intermediate room; only the verified encounter-start area is linked. The forest’s charred bodies, music box and toy box use the Nyxara Inner Sanctum travel origin where the guide names it. Their positions are not drawn inside the main-map footprint. Dravakar Inner Sanctum is an explicitly approximate sanctuary approach because the source has no separate room label for it. Cube heights, temple wall targets, mask parts and Woven Sash candidates are described by the existing guide and linked to their named room/island; no point accuracy is claimed for them.

## Validation

The three datasets were checked for unique location/target IDs, finite coordinates within 0–1, valid layers, existing local images, valid quick-step IDs, existing target references and resolvable Full Details anchors. All three edited Vue templates compile with Vue’s template compiler. Full Details links are literal `<ShowOnMap target="…" />` components with stable `guide-step-map-…` IDs; there is no runtime matching of guide text to places.

The initial integration’s ancestor audit of 143 anchored targets and 395 Full Details map controls found none inside `.cheat-grid`, `.quest-grid`, legacy hidden anchors, or elements explicitly hidden by inline styles, `hidden`, or `aria-hidden="true"`. The legacy summary grids remain untouched. Collapsible cards and Rex’s selectable temple panels are real Full Details content, not permanently hidden summaries. The later icon-curation pass changes the number of controls, not the coordinate source.

The twenty Cursed additions were checked against their source marker arrays for exact coordinate equality, unique IDs, `overview` layer membership, the explicit perk subtype/state, and complete references from the three `cursed-mister-peeks` targets. No other locations or quick links were regenerated in this pass.

The component files retain their existing generated-file headers, but are now maintained directly. `scripts/convert-guides.mjs` checks every destination before any write and refuses the one-off migration if a Vue guide contains `<ShowOnMap>` bindings. Edit `app/components/guide/*.vue` directly and preserve the map targets and step anchors. The refusal was verified with SHA-256 hashes: the command exited with status 1 and all six guide components were unchanged.
