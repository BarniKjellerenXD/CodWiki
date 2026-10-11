# Schematic map usability audit

Planning only, 11 October 2026. No product files changed in this audit.

## Recommendation

Use **aligned, ship-shaped 2D deck plans with a small side-elevation deck navigator**, plus explicit paired stair/ladder endpoints. Make one deck the main working view. Provide an optional compact all-decks overview for orientation, then let a room or connector open the relevant deck. Keep the approved compact item filters. Do not make a perspective drawing the default navigation surface.

This combines a recognizable boat silhouette, a stable bow-to-stern direction, and clear vertical movement without hiding rooms behind other decks. It also fits the existing layered image viewer. The accompanying spatial audit has now inspected the creator atlas and transcribed its nine slices, +3 through -5, including room membership and broad placement. Those are creator height indices, not official deck names. The current product dataset cannot establish them by itself; individual movement mechanisms, directions and arrival landings still need gameplay corroboration.

## Why Voyage currently feels confusing

The saved implementation screenshot was visually inspected: `docs/map-expansion-research/implementation-previews/bo4-voyage-of-despair.png`. Its nine cards form a three-by-three grid. Marker symbols sit over small floor subtitles, and the repeating card shape provides no ship or architectural context.

| Finding | Local evidence | Consequence |
| --- | --- | --- |
| One `overview` layer contains every level. | `app/data/maps/bo4-voyage-of-despair.json:4`, `:28`; `scripts/build-bo4-maps.mjs:127` | A player cannot isolate the deck they are on. |
| Nine regions combine distinct rooms: Bridge / upper decks; Provisions / 3rd Class; Engine / Boiler. | `scripts/build-bo4-maps.mjs:23` | A named room in a guide may map to a broad card that includes rooms on different levels. |
| Bridge, State Rooms and 1st Class Lounge share the same region matcher. | `scripts/build-bo4-maps.mjs:23` | Multiple guide destinations appear at the same broad place even when their actual rooms differ. |
| There are only five regional connections. Grand Staircase has no drawn edge. | `scripts/build-bo4-maps.mjs:24`; `docs/map-expansion-research/bo4-implementation.json:10` | The feature most useful for explaining vertical travel visually appears disconnected. An absent line currently means undocumented, not necessarily inaccessible. |
| Floor strings mix position, height and state: Forward deck, Upper ship, Upper + lower levels, Flooded / drained. | `scripts/build-bo4-maps.mjs:23`; `app/data/maps/bo4-voyage-of-despair.json:55` | The labels do not form an ordered floor system. Flooding is a condition, not a level. |
| Every card uses identical geometry; all routes are straight card-center lines. | `scripts/lib/map-schematic.mjs:20`, `:30` | Neither hull form nor room footprints communicate fore/aft, port/starboard or above/below. |
| Route types are only path, teleport and drop, drawn into static artwork. | `scripts/lib/map-schematic.mjs:2`, `:23`; `scripts/build-bo4-maps.mjs:18` | Stairs are merely a text label on an ordinary line. Elevator and teleporter are also currently conflated in the generic type. The viewer cannot follow a route endpoint. |
| Service pins have illustrative offsets within a region card. | `scripts/build-bo4-maps.mjs:107` | These are area references, not surveyed coordinates. Moving them onto room plans requires new evidence, not a direct coordinate transform. |
| The static SVG contains title text, metadata and a footer legend inside the zoomable artwork. | `scripts/lib/map-schematic.mjs:35` | On a narrow screen those consume space while room labels become smaller. Information needed for controls belongs outside the pan/zoom image. |

The coverage warning is accurate, but repeating it above the map, in layer notes and inside every area description cannot substitute for spatial structure. Short visible status plus detailed source notes would be easier to use once the structure improves.

## Alternatives

These scores are design judgments for this repository, not user-study results. Five is best.

| Approach | Orientation | Vertical clarity | Mobile | Source uncertainty handling | Build/maintenance simplicity | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| A. Hull backdrop behind the current room graph | 3 | 2 | 4 | 5 | 5 | Useful low-effort fallback for areas with only route evidence; does not solve floor confusion. |
| B. Aligned top-down deck plans + side elevation + connector pairs | 5 | 5 | 4 | 4 | 4 | **Recommended.** Strong spatial model, clear transitions, reuses existing layers. |
| C. Exploded isometric stack of all decks | 5 | 4 | 2 | 2 | 2 | Attractive orientation illustration; too dense for routine item finding, easy to imply unsupported geometry. Optional later overview only. |
| D. Vertical transit diagram with deck rows and room nodes | 2 | 5 | 4 | 5 | 5 | Good accessible route companion and interim view, but does not answer the user's request for a boat-shaped layout by itself. |

B should include D's plain-language connection list. C should not be required to operate the map. A remains available for maps where evidence supports routes but not floor plans.

## Recommended Voyage interaction

1. **Establish orientation.** The silhouette always points the same way. Label Bow / Forecastle and Stern / Poop Deck, and label Port / Starboard where verified for the selected view. Do not rotate decks independently. A simplified side profile highlights the current deck band.
2. **Choose a deck.** Use visibly ordered compact deck buttons; retain a native select as a narrow-screen fallback if necessary. Use the nine inspected creator slices with descriptive room labels and clearly identified relative numbers. Do not invent historical Titanic deck assignments or treat all above/below locations as only three floors for visual convenience.
3. **Show one level clearly.** Named room shapes are the base layer, independent of item filters. Walls and openings appear only at the precision supported by evidence. A room polygon can be approximate while still reflecting its verified relative position. Labels stay readable and are not covered by marker anchors.
4. **Make vertical travel explicit.** Each stair/ladder/door/elevator/teleporter has an endpoint on its source deck and a matching endpoint on its destination deck. Use a connector icon, stable short ID and words such as `Down to Cargo Hold` together. A matching ID helps recognition but is not enough alone.
5. **Inspect before switching.** Selecting a connector shows its destination and conditions, with a clear `Go to …` button. Activating that button changes deck, focuses the matching exit and announces the destination. This prevents an unexpected layer jump while inspecting a marker. Multi-stop stairs offer each verified destination separately.
6. **Preserve context.** Normal manual deck changes retain the comparable fore/aft view where layers share coordinates. Connector traversal deliberately centers on the destination. Keep filters and guide highlights. Provide a short `Back to previous deck/entrance` action for the last connector transition.
7. **Find rooms across decks.** Search results include deck and sector. Selecting a room on another deck opens that deck and highlights the room area. Show a count on each deck button so a filter with zero current-deck results does not look broken.
8. **Explain conditions at the point of use.** Distinguish stairs, ladder, one-way drop, same-level doorway, elevator and teleporter by icon/line style plus text. Flooding, opened doors or other prerequisites are explicit conditions. Default to showing conditional connections with their condition, not guessing the player's current match state.

No complete turn-by-turn route finder should be promised until the room/connection graph is verified as sufficiently complete. A missing connector means `not documented`, not `impossible to travel`.

## Data model needed before production work

The present `MapLayer` has only image/dimensions/label/note/focusBounds (`app/types/map.ts:7`). A location has one `layerId`, normalized coordinates and an optional free-text `floor` (`:18`, `:43`). `MapDataset` has no rooms, connections or level order (`:80`). The first implementation should add optional fields so current image maps remain valid.

| Entity | Minimum information | Why |
| --- | --- | --- |
| Map orientation | Shared artwork coordinate space; named axes/ends; diagram kind; precision statement | Aligned decks must mean the same direction and scale convention. |
| Layer/deck | Stable ID; readable label; sort order; relative height; common coordinate system or explicit transform; optional side-profile highlight | Gives above/below a machine-readable meaning. Voyage starts from the nine inspected creator slices; other maps need their own source-backed floor divisions. |
| Room | Stable ID; official in-game name and searchable aliases; layer ID; verified relative sector; outline or bounds; label anchor; evidence and precision | Separates room selection and navigation from collectible pins. Multi-level rooms have per-layer footprints sharing a room identity. |
| Location | Existing ID and guide links; room ID; actual layer; revised pin/area geometry; evidence | Preserves deep links while moving away from region-card offsets. Grouped legacy room IDs need an alias/migration plan. |
| Connector | Stable ID; typed mechanism; source endpoint; destination endpoint(s); direction; conditions; source evidence; completeness/verification status | Makes `go upstairs` an explicit relationship instead of a line baked into artwork. |
| Endpoint | Room/layer ID; normalized position or area; visible label; destination label | Supports paired stair symbols and precise layer changes without treating stairs as collectible items. |
| Evidence | Source URL; game/version; timestamp or page region; confidence/precision; what the source establishes | A room label source does not establish geometry. A visual doorway does not establish every destination of a staircase. |

Recommended connector kinds: `doorway`, `stairs`, `ladder`, `drop`, `elevator`, `teleporter`, with `direction` independently `both` or `one-way`. A gap in evidence must remain absent or explicitly uncertain; do not silently convert a multi-room route into direct adjacency.

Base room labels and navigation connectors should have their own visibility controls. Keep the compact physical-item toggles exactly as approved. `Hide all` for item filters should not erase the boat silhouette, deck names or necessary connector labels.

## Existing viewer behavior to preserve or adapt

| Existing behavior | Evidence | Planned treatment |
| --- | --- | --- |
| Layer select already appears when there is more than one image. | `app/components/InteractiveMap.client.vue:10` | Reuse data loading and switch behavior, enrich the visible deck control. |
| Guide selection can span layers and has layer buttons/counts. | `app/components/InteractiveMap.client.vue:51` | Preserve and reuse for deck counts/highlights. |
| Location selection already switches layers and frames that location. | `app/components/InteractiveMap.client.vue:264` | Reuse for room search and connector arrival, with a distinct connector action. |
| Manual layer changes redraw then fit selected locations. | `app/components/InteractiveMap.client.vue:274` | Add explicit transition modes: preserve viewport for aligned manual changes; focus destination for connector travel; fit selection for guide navigation. |
| SVG art is a noninteractive Leaflet image overlay. | `app/components/InteractiveMap.client.vue:379` | Keep artwork static; render room hit areas and connectors from structured data, rather than trying to wire events inside an image. |
| Accessible fallback location list is usable when artwork fails. | `app/components/InteractiveMap.client.vue:32`, `:65` | Add room/deck/connection text to that fallback. |
| Reduced motion is already honored. | `app/components/InteractiveMap.client.vue:216`, `:478`, `:495` | Preserve; deck changes must work without an animated explosion, rotation or pan. |
| Search currently spans all locations; the count distinguishes current and other layers. | `app/components/InteractiveMap.client.vue:14`, `:132` | Retain cross-deck search, improve destination/deck names. |

## Mobile and accessibility acceptance criteria

- At 390px wide, the active deck name, above/below controls and selected connector destination remain visible without horizontal page scrolling. A long hull can pan within the map; the page itself must not overflow.
- Deck buttons and connector buttons have at least 44px hit areas on touch screens. The side elevation cannot be the only way to select a deck.
- Keyboard users can choose a deck, select a room, inspect a connector, follow it and return without dragging. Focus lands on the destination heading or endpoint control after a transition.
- Announce a transition as `Lower deck, Cargo Hold entrance` or equivalent verified names. Do not rely only on changing a picture.
- Up/down arrows are accompanied by text, a connector symbol and destination. Color is supplementary, not the sole distinction for levels, directions, open/locked state or transport type.
- Matching connector IDs remain stable across layers. A staircase with more than two stops lists every verified stop rather than implying a single jump.
- Room boundaries have adequate contrast against the hull. Labels and item markers do not overlap at the default useful zoom; labels can simplify at overview zoom, but room search remains available.
- Reduced-motion mode has immediate deck changes. Any optional exploded overview has an equivalent ordered textual deck list.
- Current filters, saved preferences, guide links, selected-target visibility and `Back to step` continue to work. A missing or invalid saved layer falls back safely to a verified default.
- No connection is generated from text co-occurrence alone. Each paired endpoint resolves, one-way links cannot be traversed backward in the UI, and conditions survive layer changes.

## Reuse across the other schematic maps

Current local inventory: **48 schematic datasets, all with one layer**. Do not mechanically redraw all of them as identical building plans. Choose the spatial form per map and evidence.

| Family | Examples present in this repository | Best starting form |
| --- | --- | --- |
| Ships / elongated structures | Voyage of Despair; AW Carrier; ship region of Call of the Dead | Stable long axis, silhouette, aligned levels and vertical connectors. Confirm actual geometry independently for each game. |
| Vertically stacked buildings | Five / Classified; Die Rise; Mob / Blood / Cell Block; IX towers; Alpha Omega bunker; Verrückt | Per-floor plans; building/tower identity plus floor order; paired stairs/elevators/drops. |
| Grounds with buildings | Kino; Der Riese / Giant; Dead of the Night; Nuketown; Farm; Town | Recognizable outdoor/site outline with building interiors as inset or separate floors. |
| Disconnected or transported regions | Moon; Revelations; Ancient Evil; Vanguard hub maps | Distinct region panels plus explicit transit endpoints; never place teleporter destinations as touching rooms. |
| Broad travel loops | Tranzit; Spaceland; Rave; Shadows of Evil | Geographic district plan or loop with major landmarks; interior floors only where they aid navigation and can be verified. |

Pilot Voyage first. Then apply the same room/connector infrastructure to one building map (Classified is a useful small floor/elevator case) and one multi-region map. That proves the abstraction before a broad artwork migration.

## Completed spatial research and remaining verification

The current authored guide establishes several useful broad facts: Forecastle-to-Poop-Deck travel, Cargo Hold below Mail Rooms, lower Grand Staircase pedestal, rear Turbine/Engine relationship (`shared/bo4-voyage.mjs:12`); stairs from the Provisions/Berths area toward Poop Deck (`:13`); drainable Cargo and Boiler sections (`:14`); and a Forecastle → Promenade Port Deck → Aft Decks → Poop Deck route (`:36`). These are evidence leads, not a complete floor plan.

The [completed creator-atlas inspection](voyage-geometry-research.md) now supplies slice membership, broad fore/aft order, Grand Staircase in the forward third, and disconnected lower-floor islands. Its structured inventory records four explicit downward level pairs and eight directed portal routes. This research is sufficient to choose the atlas architecture and source-backed broad room placement.

Remaining work is gameplay corroboration of HUD naming inconsistencies, each connector's two endpoints and traversal mechanism, access restrictions, reverse/one-way behavior, exact portal arrival slices, and the object positions of current guide-linked pins. Verify those details against gameplay/minimap evidence from Voyage, not historical Titanic plans. Historical ship references can inform a decorative hull but cannot establish playable routes. Obtain sufficient usage rights for any reused external art; create original simplified geometry from factual relationships without assuming that credit alone permits copying the creator's expressive drawing.

Concept drawings can use the inspected slice inventory while labelling their schematic room dimensions and example connector landings as illustrative. Do not publish unresolved connector routes as verified gameplay guidance.
