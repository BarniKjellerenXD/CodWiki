# Voyage of Despair layout research

Research date: 11 October 2026. The initial planning research below informed the implemented side-cutaway pilot. The user-supplied reference correction records the subsequent geometry review.

## User-supplied reference correction

Inspected the user's 1500 × 16231 annotated PNG in three full-height panels and compared its room geometry with the original aligned creator atlas. Its SHA-256 is `D6B73171C671A525A8316A21CE89823ABC7EC24700475BCA1D3286E168A38025`. It is from the same annotated map family credited in the source table below.

The upper panel explicitly shows the spawn star on Forecastle +1, the Sentinel Artifact on a narrow Poop Deck platform at +2, and the Poop Deck PaP site on +1. The earlier inventory missed the +2 stern platform. The current dataset includes that footprint and separates these service levels. Paired Forecastle and stern stair runs provide adjacent room-level connections; their exact coordinates and door states remain schematic.

Longitudinal spans now approximately follow the aligned drawing: the lowest Turbine region ends near 71% of ship length, not at the stern; Provisions extends aft of Engine on −3. Lower Grand Staircase and Millionaire Suites overlap in this side projection. Cargo is at the bow with no intervening lower corridor to machinery. Narrow footprints use readable numbered annotations rather than widened room geometry.

The accepted implementation is the [interactive side cutaway](../map-layout-redesign-plan.md), preserving all nine levels and adding direct room-level buttons. The detailed drawings remain reference material; the production renderer draws simplified original regions.

The replacement should show an elongated ship, consistent bow and stern orientation, individual named rooms, and distinct vertical connections. A ship overview plus selectable floor slices is the strongest direction. It can retain a simple overview without presenting three broad bands as three actual game floors.

## Why the current diagram confuses navigation

`app/data/maps/bo4-voyage-of-despair.json` currently has one layer, nine region nodes, and nine service markers. Bridge, State Rooms and Lounge share one node; Provisions and 3rd Class share another; Engine and Boiler share another. Grand Staircase has one coordinate for several elevations. The current note correctly discloses these omissions, but those omissions prevent the diagram from answering which floor a room occupies or which stairs reach it. The rows should not be reinterpreted as measured levels.

## Source references

| Reference | What it contributes | Use constraint |
| --- | --- | --- |
| [Official Call of Duty introduction](https://www.callofduty.com/blog/2018-10/voyage-of-despair.html) | Confirms paid doors and debris ramps as important ways through the ship. | Gameplay-specific geometry must include these; historical Titanic plans cannot establish traversable routes. |
| [TRPG original complete map](https://www.reddit.com/r/CODZombies/comments/9ztkzk/voyage_of_despair_complete_map_with_location/) | Original cartography source. The creator's [vector PDF ZIP](https://www.dropbox.com/s/p2kr5m8iidfkuk7/vod_fullmap.zip?dl=0) was inspected visually and its text extracted; it uses nine aligned slices, +3 through -5. A [full PNG](https://www.dropbox.com/s/vte5m2kodbfmbdr/vod_fullmap.png?dl=0) is also linked. | These are the creator's floor indices, not official in-game deck names. Public access is not a reuse license. |
| [RayPoopertonIII updated BO4 collection](https://www.reddit.com/r/CODZombies/comments/cxfzzg/detailed_maps_for_all_black_ops_4_zombies_maps/) | Creator links an [updated Voyage reference image](https://i.lensdump.com/i/iT7LT2.jpg). The [earlier post](https://www.reddit.com/r/CODZombies/comments/cl07e4/voyage_of_despair_detailed_map_layout_guide/) credits TRPG for underlying cartography. | Prefer the updated reference; early version comments identify a clock-label correction. No redistribution permission found in the inspected posts. |
| [Community map breakdown](https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/) | Eight directed fast-travel routes, draining, named item areas and game screenshots. | Use HUD room names; do not infer floor numbers from a room name. |
| [GamesRadar route walkthrough](https://www.gamesradar.com/call-of-duty-black-ops-4-zombies-voyage-of-despair-easter-eggs/) | Explicit forward and rear descent descriptions, pedestal behavior and water changes. | Route sequence establishes adjacency and above/below, not exact wall polygons or dimensions. |
| [Carizma Sentinel walkthrough](https://games-guides.com/all-guide-list/cod-black-ops-4-voyage-of-despair-sentinel-artifact-location-guide/) | An opening route goes upward, through the captain area, down one floor, through the lounge and along an exterior debris climb. | Intermediate HUD names are not consistently stated. Keep unresolved segments out of a turn-by-turn router. |
| [PowerPyx in-game overview reference](https://www.powerpyx.com/call-of-duty-black-ops-4-voyage-of-despair-map/) | Names 21 coarse ship areas and points readers to the in-game Forecastle map. | Useful orientation reference; its mystery-box dot is session-dependent. |

The creator PDF and rendered atlas have now been inspected. Room-level slice membership is recorded below. Individual passage directions, movement mechanics and exact arrival landings still need gameplay corroboration before they support turn-by-turn routes.

## Confirmed spatial relationships

The forward descent is Forecastle → Mail Rooms → Cargo Hold. Mail Rooms sit below the Forecastle, and entry into Cargo Hold uses a door. The rear descent starts below the Poop Deck, passes through Provisions, enters Engine Room, then descends to Turbine Room. Grand Staircase connects upper and lower parts of the ship; its pedestal sits at the lowest landing. These are route relationships, not measured distances. [GamesRadar](https://www.gamesradar.com/call-of-duty-black-ops-4-zombies-voyage-of-despair-easter-eggs/)

The inspected creator atlas places the Grand Staircase in the forward third, not the geometric center of the hull. Cargo occupies only the bow end. Boiler, Engine and Turbine occupy the middle-to-aft lower hull; they do not fill its whole width or connect to Cargo through a continuous lower corridor. [Creator atlas](https://www.reddit.com/r/CODZombies/comments/9ztkzk/voyage_of_despair_complete_map_with_location/)

The opening captain-area route changes elevation twice and includes an exterior rubble climb. This means a line drawn between broad upper-deck nodes loses useful navigation information. Use individual connector endpoints with “up”, “down”, or “climb” labels once their HUD-room destinations are verified. [Carizma](https://games-guides.com/all-guide-list/cod-black-ops-4-voyage-of-despair-sentinel-artifact-location-guide/)

## Proposed room inventory

Split the present merged labels. Room names below are the inventory to reconcile, not final floor assignments. The overview bands are design groups only.

| Proposed overview group | Separate areas to preserve |
| --- | --- |
| Exterior orientation | Forecastle, Bridge, Boat Deck, Sun Deck, Mid Deck, Aft Decks, Poop Deck |
| Passenger spaces | State Rooms, Millionaire Suites, Upper Grand Staircase, Lower Grand Staircase, 1st Class Lounge, Dining Hall, Galley, Promenade Port Deck, Promenade Starboard Deck |
| Forward interior | Mail Rooms, Cargo Hold |
| Rear interior and machinery | 3rd Class Berths, Provisions, Engine Room, Turbine Room, Boiler Room |
| Names needing HUD reconciliation | Officer’s Cabin, Palm Court, 2nd Class; these occur on the coarse ship reference and must not silently become duplicate navigable rooms |

The area inventory combines the [in-game overview names](https://www.powerpyx.com/call-of-duty-black-ops-4-voyage-of-despair-map/) with finer names used in the [community guide](https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/). Multi-level areas need a separate landing instance on each floor, rather than one floating marker.

## Inspected creator level inventory

The following transcription follows the atlas region brackets and aligned geometry. “Forward”, “middle” and “aft” describe broad hull position. They do not establish measured distances or a real Titanic deck-letter mapping. All slices have the bow on the left. [TRPG atlas](https://www.reddit.com/r/CODZombies/comments/9ztkzk/voyage_of_despair_complete_map_with_location/)

| Creator index | Named regions and broad extents |
| --- | --- |
| +3 | Forward: Bridge, Upper Grand Staircase. Middle: Boat Deck, Mid Deck. Middle/aft: Sun Deck, Aft Decks. |
| +2 | Forward: small Forecastle stair landings, Upper Grand Staircase. Forward/middle: 1st Class Lounge. Middle/aft: Promenade Starboard Deck and Promenade Port Deck, then Aft Decks. Stern: the narrow Poop Deck Sentinel platform, confirmed by the supplied annotated image. |
| +1 | Bow: Forecastle. Forward/middle: Lower Grand Staircase, Dining Hall, Galley. Aft: Aft Decks and Poop Deck. |
| 0 | Bow/forward: Forecastle, State Rooms. Forward: Lower Grand Staircase and Millionaire Suites. Stern: Poop Deck, 3rd Class Berths. |
| -1 | Bow: Mail Rooms. Forward: lowest Lower Grand Staircase landing. Stern: 3rd Class Berths. These are three separate islands. |
| -2 | Bow: Mail Rooms. Stern: 3rd Class Berths. The intervening hull is not a route. |
| -3 | Bow: Cargo Hold. Middle/aft: Boiler Room, Engine Room, Provisions. No drawn connection between Cargo and the machinery island. |
| -4 | Middle/aft machinery: Boiler Room, Engine Room, Turbine Room. |
| -5 | Middle/aft machinery: Boiler Room, Engine Room, Turbine Room. |

Use in-game names as the visible labels and treat the numbers as an atlas elevation aid. Do not merge all occurrences of Grand Staircase, Boiler, Engine, Aft Decks or 3rd Class into a single floor. The atlas includes a few naming inconsistencies: its workbench legend says Aft Decks (0), whereas the nearby region bracket says Poop Deck; a clock legend says 3rd Class Lounge rather than Berths. Reconcile these against the HUD instead of creating new duplicate rooms.

## What the inspected drawing verifies

- Room membership in the nine slices, broad fore/aft order and disconnected floor islands are source-backed.
- Forecastle on index 0 has an explicit downward connector labeled -1; Mail Rooms on -1 has one labeled -2. 3rd Class on -1 points to -2, and on -2 points to -3. These establish descending level pairs. Whether each can be reversed, or is a drop rather than stairs, remains a gameplay check.
- Stair symbols occur at aligned landings throughout the atlas. Alignment is useful evidence, but a precise edge still needs its two landings and any door/debris requirement recorded. Do not connect every staircase to the nearest symbol automatically.
- Portal labels source-back Mid Deck +3 → Engine Room, Forecastle +1 → Poop Deck, Cargo -3 → Boiler Room, Boiler -3 → Boat Deck, and Boiler -5 → Lower Grand Staircase. Where the destination spans several slices, its arrival index remains unresolved. The complete eight-route table below comes from the community guide.
- The lower Boiler portal destination is explicitly **Lower Grand Staircase**, correcting the community table's less precise “Grand Staircase”. Its exact arrival landing still needs gameplay corroboration.

These points are transcription of [TRPG's drawing](https://www.reddit.com/r/CODZombies/comments/9ztkzk/voyage_of_despair_complete_map_with_location/), not a claim that its geometry has been independently walked in game.

## Fast travel inventory

These are directed portals, not ordinary passageways. The community guide lists all eight at 500 points per trip. The reverse direction must only be drawn where a separate route is listed. [Community guide](https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/)

| From | To |
| --- | --- |
| Forecastle | Poop Deck |
| Poop Deck | Forecastle |
| Millionaire Suites | Provisions |
| Turbine Room | Cargo Hold |
| Cargo Hold | Boiler Room |
| Boiler Room upper | Boat Deck |
| Boiler Room lower | Lower Grand Staircase |
| Mid Deck | Engine Room |

The lower Boiler destination uses the inspected creator PDF's more specific label, Lower Grand Staircase; its exact arrival landing remains unresolved. A 2018 Twinfinite article lists seven routes and a conflicting Forecastle destination; it is not suitable as the source of truth for this connection table.

## State and marker rules

- Sentinel activation and destination access affect travel availability. Keep a “requirements” field on connectors; do not draw a sealed door as an always-open corridor. The [Sentinel walkthrough](https://games-guides.com/all-guide-list/cod-black-ops-4-voyage-of-despair-sentinel-artifact-location-guide/) establishes the artifact gate; exact portal destination gating should be checked alongside the endpoints.
- Cargo Hold and the rear machinery water can be drained. Later quest activity changes rear flooding again. Mark water state on areas and connector notes, without moving room geometry. [Community guide](https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/)
- PaP has four pedestal sites: Cargo Hold, Turbine Room, Poop Deck and Lower Grand Staircase. Distinguish a candidate pedestal from the active machine. [Community guide](https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/)
- Put ship direction labels on every layer. A proposed left-facing bow is a UI orientation choice, not a compass bearing; all slices and the side profile must use that same orientation.
- Do not claim a shortest route before every edge has a verified direction, landing, door condition and traversal type. A first release can highlight documented connections without calculating routes.

## Geometry acceptance checklist

1. Use the inspected nine-level inventory as the initial assignment; corroborate gameplay connectors and naming discrepancies with visible HUD labels.
2. Preserve one longitudinal coordinate system across deck slices. Forecastle/Cargo belong at the bow end; Poop Deck/rear machinery at the stern end.
3. Record every connection as `fromArea`, `fromLevel`, `toArea`, `toLevel`, `kind`, `direction`, `requirements`, `evidence`. Kinds include walk, stairs, climb, drop and portal.
4. Split Boiler upper/lower and every Grand Staircase landing. Do not infer a walkable lower corridor between forward and rear compartments.
5. Walk the spawn-to-Sentinel route, both flooded-compartment descents, all PaP sites and all eight portal departures in the proposed atlas.
6. Compare flood states and quest arenas with the ordinary navigation layer. Keep temporary boss travel separate from permanent routes.
7. Reconcile service and quest markers to their room/floor instance, then retain area precision until object placement has independent evidence.

## Initial design alternative

The initial alternative was an original ship-shaped overview, a small side profile and one active floor slice. The user subsequently chose the side cutaway as the main view. The implemented direction and reference corrections are recorded above and in the linked plan. The compact object filters remain independent from the connection controls.

This approach works for Voyage without pretending that an attractive ship outline alone resolves the missing floor and stair information.
