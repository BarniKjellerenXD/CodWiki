# Interactive map implementation

11 October 2026. The user selected Compact toggles and authorized implementation after the research and concept comparison.

## Decisions followed

| Choice | Alternatives considered | Selected approach and reason |
| --- | --- | --- |
| Filter layout | Exclusive buttons, checkbox sidebar, compact toggles, activity-first view | Compact toggles preserve the embedded map width. Up to eight common types are visible; More filters groups the additional populated types and activities. Controls wrap on mobile. |
| Filter semantics | One active category, intersected categories, combined location sets | Checked sets combine with OR and deduplicate by location ID. Layer and search narrow the union. Essentials, All locations and Hide all replace the checked set. |
| Marker identity | Existing Unicode, mixed game screenshots, one local SVG set | Local Lucide silhouettes, family tints and text labels provide a consistent vocabulary. Selection adds gold emphasis while retaining the physical icon. ISC and inherited MIT notices are included. |
| Map engine | External embeds, a new engine, extend existing Leaflet | Retain the shared Leaflet viewer, normalized coordinates, lazy dataset loading, layers and guide navigation. No provider request is needed to browse an accepted local map. |
| New artwork | Licensed vectors, creator drawings, independently authored diagrams | Use pinned DECLASSIFIED vectors for BO6/CW; retain the credited Origins image under its creator's express reuse statement. Other accepted older entries receive original source-backed region diagrams rather than copying uncertain fan artwork. |
| Coverage | Treat every image as an exact map, defer all partial content, disclose useful partial content | Display partial diagrams as Schematic, not to scale, with area rings and specific missing-region notes. Keep unsupported entries as documented gaps. |
| Saved state | Discard old settings, reuse incompatible keys, migrate explicitly | v3 stores checked filter IDs and display choices per dataset. Reviewed v2 categories/activity subfilters migrate to matching sets. Valid empty selections persist; removed/invalid IDs fall back safely. Guide progress and photo observations retain their independent storage. |

## Actual filter behavior

- Physical types distinguish Pack-a-Punch, power, generators, perks/Wunderfizz, rewards, parts, keys, clues, ammo, doors, travel, traps and areas. Existing broad categories remain compatible but have reviewed `typeId` metadata.
- More filters contains additional types and authored quest/activity sets. A selected activity can reveal locations whose physical type is off; this is intentional OR behavior. Essentials selects physical types without an overlapping hidden overview collection.
- Leaf counts reflect the selected layer and search regardless of whether the leaf is checked. The caption reports the distinct browsing locations on this layer and on other layers, plus guide locations outside the filters. Filter counts count enabled sets, not pins.
- Guide highlights are independent of browsing filters and can be hidden or cleared. A new guide target switches to its correct layer without overwriting saved filters. Changing filters or clearing a target preserves the current camera.
- Coincident locations retain their authored coordinates. A count marker opens a location chooser. Nearby locations also remain reachable through the location list.
- Approximate areas use dashed rings. Published candidate sites use a question badge; ordered guide sequences and photo references use number badges. Neither a possible site nor a source coordinate promises that an item is active in the current match.
- USB photo finder is an explicit tool. Enabling USB locations does not open it. Closing it clears its active photo target while retaining saved observations, including when entered through a photo deep link.
- Toggle buttons expose `aria-pressed`; group buttons expose true/false/mixed state. Visible text and distinct SVG silhouettes supplement tint. Buttons support native keyboard activation and wrap into at least 44px controls on narrow screens. The list remains available when artwork fails.

## Content and guide integration

There are 72 interactive maps: 61 added and 11 existing maps updated. Their 90 layers contain 3,709 locations and 2,056 guide targets with 1,407 guide bindings. Forty-eight maps use partial original schematics. Twenty-four catalog maps still need suitable verified layouts or topology. The definitive per-map counts, delivered coverage notes, assets, credits and remaining gaps are in [implementation-coverage.md](map-expansion-research/implementation-coverage.md) and its JSON companion. Catalog availability is generated from accepted dataset files. Filenames must be canonical safe map IDs; Proton sync conflict copies are excluded from the registry. Two differing conflict snapshots were preserved under `sync-conflicts/` for review.

Outbreak's Ravenov and Excision guides load the shared parent atlas. Dataset quick bindings use raw guide step IDs; targets retain real `guide-step-` anchors and explicit child-guide ownership for return navigation. Remasters use separate location/target datasets even where verified geometry is shared.

Batch source and review records:

- [Classic maps](map-expansion-research/classic-map-implementation.md): original region/transport diagrams, edition-specific targets, and credited Origins artwork.
- [BO6](map-expansion-research/bo6-implementation.md): pinned vectors and published positions, corrected safe source IDs, cautious area/candidate classification and withheld invalid points.
- [Cold War](map-expansion-research/cw-implementation.md): sixteen vector layers with the documented coordinate transform; Outbreak quest-interior limitations remain visible.
- [AW, IW, WWII and Vanguard](map-expansion-research/other-implementation.md): twelve original diagrams with cited route relationships and area precision.
- [BO4](map-expansion-research/bo4-implementation.md): seven partial diagrams with individually cited route relationships; grouped floors and omitted interiors are disclosed.

Source geometry and guide anchor checks establish alignment and internal consistency. They do not replace an in-game playthrough or claim a complete inventory of every optional object. Baked labels/icons on the Origins background remain visible independently of the overlay filters.

## Regeneration and verification

Run the appropriate batch generator only when changing its authored inputs. Then run `node scripts/generate-catalogue.mjs` and `node scripts/report-map-coverage.mjs` to rebuild guide bindings, catalog flags and the implementation manifest.

Repository checks are `npm test`, `npm run check:seo -- <running-site-origin>` and `npm run build`. Source checks include `verify-classic-maps.mjs`, `validate-cw-maps.mjs`, and `verify-other-maps.mjs`. BO4/BO6 generators validate source references and geometry before writing; the repository map tests validate their resulting datasets. The browser scripts `verify-compact-maps.cjs <running-site-origin>`, `verify-expanded-maps.cjs <running-site-origin>` and `verify-map-guide-flow.cjs <running-site-origin>` exercise the actual client viewer, filter union, saved empty state, highlights, photo workflow, local artwork, shared child guides, Quick/Full return navigation, themes and mobile layout. Their reports and screenshots live in `map-expansion-research/implementation-previews/`.

Final verification results are recorded in [map-expansion-verification.md](map-expansion-verification.md).
