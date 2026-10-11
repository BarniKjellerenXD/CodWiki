# Spatial layouts for schematic maps

Implementation revision, 11 October 2026. This plan reflects the user's side-cutaway choice and the implemented Voyage pilot.

## Supplied floor-plan reference revision

The user's annotated Voyage image was inspected at full resolution in three readable panels, alongside the original aligned TRPG atlas. Keep the accepted side cutaway; the image supplies layout evidence, not a replacement static viewer.

- Align room spans to their approximate fore/aft extent in the reference. Grand Staircase stays in the forward third; the machinery rooms move forward beneath the middle/aft decks. Cargo remains an isolated bow compartment.
- Add the small Poop Deck footprint on +2 for the Sentinel platform. Keep the Pack-a-Punch deck on +1 and the shield-bench approach on 0. Start at the reference's Forecastle spawn star on +1.
- Show the Forecastle and stern stairs as adjacent room-level connections. Remove broad shortcuts that skipped the berths on the way to Provisions or machinery levels on the way to Turbine. Unresolved portal arrivals still remain room-wide.
- Keep narrow regions at their reference position. Use readable numbered badges tied to full-name room buttons instead of stretching the geography to fit text. Each multi-level room also has direct level buttons, with labels such as “Sentinel platform”.

Options considered for the supplied artwork: embed the entire tall image, split it into a new floor-plan viewer, or refine the selected cutaway from its geometry. Choose the cutaway refinement: it preserves the requested interaction and makes above/below relationships visible at once. Detailed room walls remain outside this pilot; the uploaded artwork is research material, not a shipped asset.

## Accepted side cutaway revision

Use the side cutaway as Voyage's main map. Keep all nine height slices visible, with clickable level labels and room regions. Replace the dropdown with direct selection and a full-name room button list for the selected level. On narrow screens the ship keeps its spatial overview while the buttons provide readable, touch-sized targets.

Three interaction options were considered: level buttons around a static drawing, a zoom-only diagram with all labels, and direct selection with a readable room list. Choose direct selection: it supports quick room discovery on desktop and phones while preserving the whole ship's above/below context.

Show the selected room's connections, rather than every connection at once. Differentiate regional passages, stairwell links, explicitly documented descents and directed fast travel. Fast travel is optional, with fares and conditions in its details. Connections with an unpinned arrival highlight the destination room across its documented levels instead of inventing a landing. A Back action restores the previous room. Guide highlights and compact item filters remain independent.

The implementation keeps source-backed regional links at regional precision, including links read from contiguous named regions in the inspected atlas. It does not claim a complete doorway graph or shortest-route navigation. Room shapes are original longitudinal regions; they do not reproduce the creator's floor plans. Voyage is the pilot; other schematic maps retain their current views until they have suitable spatial data.

Implementation files: `MapShipCutaway.vue`, optional `MapDataset.cutaway` data, shared selection helpers, and `scripts/lib/voyage-cutaway.mjs`. The existing BO4 generator builds the cutaway reproducibly and expands legacy grouped links into individual rooms.

## Decision

Use an **interactive side cutaway** on Voyage of Despair. Show every height level in the same ship, preserve bow-to-stern orientation, and provide direct level and room selection. Show connections for the selected room. Keep the approved compact item toggles.

The important improvement is spatial structure: room position, height and usable connections. A boat outline behind the existing nine cards would improve recognition but leave most of the confusion intact.

Use the same room and connection system for other schematics, with artwork suited to their geography. Ships use hulls and decks; buildings use floors; transported areas use separate regions and explicit transit links.

## Alternatives and tradeoffs

| Option | What it does well | Main limitation | Choice |
| --- | --- | --- | --- |
| Ship outline behind room cards | Recognizable setting; small change; tolerates incomplete geometry | Retains merged rooms and ambiguous height; decorative shape does not explain travel | Keep only as a fallback where spatial evidence is sparse |
| Deck atlas with side profile | Shows room relationships within one level | Hides the other levels and adds a switching step | Retained as a future option if detailed port/starboard geometry is needed |
| Exploded deck overview | Shows the stacked structure of the whole ship at once | Many thin layers; labels and pins compete; perspective makes tapping harder on phones | Not selected |
| Side cutaway with floor rows | Makes height and vertical travel easy to understand; all levels stay visible | Collapses port and starboard; exact doorway geometry remains out of scope | **Selected and implemented**, with clickable rooms, regional links and destination buttons |

The conversation comparison illustrates the last three options with selectable levels and an example paired stair interaction. Its room shapes, distances and S1 landing positions are illustrative. It is a design study, not a replacement gameplay map.

## What the research establishes

The previous Voyage dataset had nine merged regions and five regional lines. Bridge, State Rooms and Lounge shared a region; Engine and Boiler shared another. Grand Staircase had no drawn connection. The cutaway replaces those cards with 23 named rooms across nine height slices. See the [local usability audit](map-layout-redesign-research/schematic-ux-audit.md).

The [TRPG original map](https://www.reddit.com/r/CODZombies/comments/9ztkzk/voyage_of_despair_complete_map_with_location/) includes a downloadable vector atlas. It was downloaded, rendered and inspected for this plan. Its nine slices run from +3 to -5. These are the cartographer's relative height indices, not official deck names or historical Titanic deck letters. A [later annotated collection](https://www.reddit.com/r/CODZombies/comments/cxfzzg/detailed_maps_for_all_black_ops_4_zombies_maps/) was also located and downloaded for reference.

The atlas places Grand Staircase in the forward third, Cargo Hold at the bow, and the machinery areas farther aft. Several lower slices contain separate islands of playable space. Do not fill the empty hull with an invented corridor or represent a portal as an ordinary connecting doorway.

The official [Call of Duty introduction](https://www.callofduty.com/blog/2018-10/voyage-of-despair.html) describes paid doors and debris ramps between areas. A map based solely on historical ship plans would miss gameplay changes. The [community guide](https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/) documents directed fast travel and changing water conditions.

### Voyage level inventory

Source slice membership is transcribed below; individual entrances and HUD names still need gameplay corroboration. Keep the relative numbers visible beside a descriptive room label, for example `−3 · Cargo / machinery`, rather than giving players unexplained numbers alone.

| Relative level | Rooms and areas present in the creator atlas |
| --- | --- |
| +3 | Bridge, Upper Grand Staircase, Boat Deck, Mid Deck, Sun Deck, Aft Decks |
| +2 | Forecastle stair landings, Upper Grand Staircase, 1st Class Lounge, both Promenades, Aft Decks |
| +1 | Forecastle, Lower Grand Staircase, Dining Hall, Galley, Aft Decks, Poop Deck |
| 0 | Forecastle, State Rooms, Lower Grand Staircase, Millionaire Suites, Poop Deck, 3rd Class Berths |
| -1 | Mail Rooms, lowest Grand Staircase landing, 3rd Class Berths; separate islands |
| -2 | Mail Rooms and 3rd Class Berths; separate forward and rear areas |
| -3 | Cargo Hold at the bow; Boiler Room, Engine Room and Provisions farther aft |
| -4 | Boiler Room, Engine Room, Turbine Room |
| -5 | Boiler Room, Engine Room, Turbine Room |

Multi-level rooms retain one identity with a footprint on each applicable slice. They must not become unrelated search results or a single pin floating between floors.

### Travel and changing conditions

The source inventory contains eight directed portal departures: Forecastle → Poop Deck, Poop Deck → Forecastle, Millionaire Suites → Provisions, Turbine → Cargo, Cargo → Boiler, upper Boiler → Boat Deck, lower Boiler → Lower Grand Staircase, and Mid Deck → Engine Room. The community guide lists a 500-point fare. Exact arrival landings remain unresolved for several routes. A reverse route exists only when separately documented.

The atlas explicitly marks four downward level changes, but an arrow alone does not establish whether it is stairs, a ladder or a one-way drop. The [structured research inventory](map-layout-redesign-research/voyage-geometry-research.json) keeps mechanism and reverse travel unresolved rather than guessing.

Separate physical layout from match state. Cargo and rear machinery flooding, Sentinel activation, paid doors and temporary quest travel become conditions on areas or connections. Four possible Pack-a-Punch pedestal sites remain candidates; the map must not imply four active machines.

## Recommended interface

### Orientation and level selection

- Keep the bow on the left and stern on the right. Label both ends in ordinary language. Explicitly state that port and starboard overlap in this projection.
- Render the hull as quiet context. Give traversable rooms a clearer fill and boundary; inaccessible or undocumented space remains subdued. Hull fill never implies that a player can walk through it.
- Keep all nine rows visible. Click a level number, its band, or a room shape; full room-name buttons provide keyboard and touch alternatives. No level dropdown.
- Show item counts where room shapes have enough space. Small regions use numbered badges with matching full-name buttons at every screen width. Search spans all levels and includes height labels on the results.
- Default to the spawn's reference level unless a guide link or saved valid browsing position selects another. `All levels` clears the room focus without hiding the ship. The cutaway reflows without pan/zoom; existing image maps keep Leaflet controls.

### Rooms and connections

- Separate room geometry from item pins. Room labels and the hull remain when item filters are cleared.
- Use separate room names and searchable room entries. Show the full selected room name and height even when the small diagram uses an abbreviation or number.
- Highlight the selected room and its connected destination rooms. Show regional routes with dashed lines; use arrows for documented directed links. A destination with several possible levels is highlighted across those levels without a fabricated precise line.
- Each destination button states its room, height or unpinned arrival, connection type and portal fare when applicable. `Route details` exposes conditions and source evidence without moving the selection.
- Staircases with several stops expose the verified adjacent stops. A line spanning multiple floors is not a single automatic jump.
- Direct buttons list the selected room's levels and distinguish named landings. These are inspection controls; route cards separately describe how to travel between them.
- `Back to previous room` restores the prior browsing position. The whole cutaway stays aligned during level and room changes; guide selections highlight their room footprints independently.
- Keep normal passageways, changes of height and fast travel visually distinct through symbols, line styles and words. Show portal direction and cost in its detail. Avoid color-only encoding.
- Provide a plain room and connection list so the same navigation works with a keyboard or when artwork cannot load.

### Compact filter standard

Retain the existing compact multi-select item toggles, icons, saved preferences and independent guide highlighting. Add a separate compact navigation control for `Connections`, with type refinement only where the map needs it. Do not mix stairs with perk or collectible categories.

Room labels and the level control are foundational orientation. `Hide all` for items must not remove them. When a guide highlights a room or a location on another level, show that level and preserve the user's filter selection.

Do not add a permanent filter sidebar, a second icon language, a live-match state dashboard or a shortest-route calculator in the pilot. These would expand the interface without first resolving its spatial foundation.

## Artwork and evidence standard

Create one original longitudinal cutaway with nine aligned rows. Its room spans approximate the reference's longitudinal extents; its hull is context, not a traversable area. The live view draws simplified room regions and connections from structured data; a generated SVG provides the same broad layout with a numbered key for each level. Do not invent walls and openings. Use the current CodWiki colors, typography and glyph system.

Gathered assets include the original vector atlas, a later annotated image, guide references, the nine-slice membership table, 23 room names, eight directed portals and four explicit downward links. Their source URLs and evidence limits are recorded in [Voyage research](map-layout-redesign-research/voyage-geometry-research.md). Downloaded third-party artwork stays in the research workspace and is not a public app asset. Shipping the creator's artwork directly is a separate reuse choice; the recommended plan creates CodWiki's own simplified drawings and credits the references.

Record evidence at the field it supports: a room-name source does not establish a polygon, and a floor-plan arrow does not establish bidirectionality. Use three clear geometry states: `verified object position`, `approximate room area`, and `unverified`. Unverified routes do not enter the usable connection graph.

Before publishing exact connections, resolve these finite checks:

1. Confirm each stair/ladder/ramp/drop endpoint, HUD room name, direction and any door condition in gameplay. Record the video timestamp or screenshot pair.
2. Confirm portal arrivals, especially which Lower Grand Staircase landing the lower Boiler portal reaches.
3. Reconcile the source's Aft Decks/Poop Deck workbench label and its 3rd Class Lounge/Berths naming inconsistency.
4. Check the spawn-to-Sentinel path, both flooded descents, the four pedestal locations and all portal departures against the authored layers.
5. Re-anchor existing service and guide targets to the correct room and slice. Retain area precision until the object itself is verified.

These checks remain prerequisites for adding exact doorway or landing navigation. The implemented cutaway uses broad room placement and explicitly regional links; it does not claim a complete turn-by-turn route graph.

## Implementation design

Add optional cutaway data and use a dedicated responsive renderer; existing image-map datasets continue to use their current viewer.

| Data | Minimum addition |
| --- | --- |
| Spatial layout | Ship kind, default room footprint, ordered levels, rooms, footprints and connections |
| Level | Stable ID, relative height index and descriptive label |
| Room | Stable ID, full name and short diagram label |
| Footprint | Stable ID, room, level, longitudinal bounds, overlap lane and optional landing label |
| Connection | Source/destination footprint sets, mechanism, direction, precision, arrival certainty, condition note, evidence and optional fare |
| Location | Room references and explicit footprint references only where the source pins the level; preserve service IDs and guide bindings |

Use one shared room identity for multi-level rooms and separate footprint IDs for their levels. Represent direction independently of the mechanism. The pilot distinguishes regional routes, stairwells, documented downward connections and portals. A downward arrow with an unknown mechanism is not relabelled as a ladder or one-way drop.

Use native buttons for level and full-name room selection, styled room regions for direct pointer selection, and a measured SVG overlay for connection lines. Keep selection, route direction and location-to-room resolution independent from rendering so data checks can validate them. No 3D library is required.

### File responsibilities

| Existing area | Planned work |
| --- | --- |
| `app/types/map.ts` | Optional cutaway layout and location-to-room references |
| `app/components/InteractiveMap.client.vue` | Choose the cutaway renderer and retain the shared filters, guide highlights and location panel |
| `app/components/MapShipCutaway.vue` | Direct level/room navigation, connection detail, local position persistence and accessible destination controls |
| `app/components/MapCompactFilters.vue` | Preserve established item filtering; avoid introducing room connectivity into its category taxonomy |
| `scripts/build-bo4-maps.mjs` and `scripts/lib/voyage-cutaway.mjs` | Generate Voyage cutaway data and static SVG; retain other maps' generic regional schematics |
| Voyage map assets and dataset | Nine height rows, room footprints, regional connection records and preserved service/guide targets |
| Map validation and guide-flow checks | Validate references, directionality, footprint bounds and existing guide links |

Do not transfer the old card-relative coordinates to the new drawings. Preserve IDs where they refer to the same target, and remap their room/level/position from evidence. Grouped legacy area targets should resolve to an explicit set of relevant room footprints rather than an arbitrary single point.

## Delivery sequence

1. **Research and choose interaction.** Completed: inspected height slices, distinguished regional evidence from exact landings, and selected direct cutaway interaction.
2. **Generate spatial data.** Completed: 23 rooms, nine height rows, regional links and eight directed portals. Unknown arrivals remain footprint sets.
3. **Implement navigation.** Completed: direct selection, readable room list, selected-room connections, return history and saved browsing position.
4. **Preserve existing content.** Completed: compact filters, independent guide highlights, legacy grouped links and service IDs.
5. **Verify the player flow.** Automated data checks and browser checks cover room/level navigation, portal uncertainty, filter independence, guide return and mobile behavior. Detailed results accompany the implementation.
6. **Future rollout.** Reuse the data/interaction approach for suitable maps after their source audits. Detailed floor plans, elevators on other maps and full turn-by-turn routing are separate extensions.

## Verification and acceptance

- Every level stays visible in one orientation. Selecting a floor does not shift the hull or other rows. Positions remain explicitly regional rather than claiming exact stair geometry.
- All visible room names resolve to the correct level footprints. Cross-level search and guide links open the correct destination.
- Each published connection has valid footprint sets, direction, evidence and an honest mechanism or regional classification. Directed links cannot be followed backward unless a separate route exists. Unknown arrival floors remain visibly uncertain.
- Empty space does not become a corridor. Flooding or an unopened door is described as a condition on unchanged geometry.
- At phone widths, full-name room controls and level buttons offer 44px touch targets. Small diagram shapes use matching room numbers; the page does not overflow.
- Keyboard users can select levels and rooms, inspect and follow a connection, and return. Destination changes are announced; reduced-motion settings are respected.
- Item filters, saved preferences, guide highlights, deep links and return-to-step behavior continue to work. Other existing maps remain compatible with the optional schema additions.
- Validate the data graph, then browser-check the spawn/Sentinel route, four pedestal destinations, example stairs and all verified portals. Run existing map/guide checks and the production build when implementation occurs.

The implementation is checked with the full test suite, production build and `scripts/verify-voyage-cutaway.cjs`. Browser evidence is saved under `docs/map-layout-redesign-research/previews/`. The earlier comparison remains a design study and is not the production navigation dataset.

The supplied-image revision passed 253 affected data, map and Voyage tests and a fresh production build. Its browser check passed on the final local preview at port 3001: Sentinel and spawn levels, stepwise rear descent, direct room-level controls, guide return, filter independence, saved state, five themes, and 390px/320px layouts including direct selection of the small Sentinel badge. There were no browser runtime errors. The generated static SVG was also rendered and inspected. The dataset now has 40 footprints for 23 rooms across nine heights, with 53 documented connections including eight directed portals.
