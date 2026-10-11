# AW, IW, WWII and Vanguard implementation

Twelve original regional schematics are implemented with 192 area markers, 271 guide targets and 76 documented route/transport relationships. They are explicitly marked **schematic, not to scale**. They do not claim to be the previously researched fan-made overhead images or complete floor plans.

| Dataset | Regions | Markers | Guide links |
| --- | ---: | ---: | ---: |
| `aw-outbreak` | 8 | 15 | 15 |
| `aw-infection` | 7 | 17 | 20 |
| `aw-carrier` | 8 | 16 | 19 |
| `aw-descent` | 9 | 17 | 19 |
| `iw-zombies-in-spaceland` | 8 | 16 | 33 |
| `iw-rave-in-the-redwoods` | 9 | 16 | 28 |
| `iw-shaolin-shuffle` | 10 | 19 | 34 |
| `ww2-the-shadowed-throne` | 8 | 17 | 28 |
| `vanguard-der-anfang` | 7 | 13 | 14 |
| `vanguard-terra-maledicta` | 7 | 14 | 16 |
| `vanguard-shi-no-numa` | 7 | 16 | 21 |
| `vanguard-the-archon` | 8 | 16 | 24 |

## Evidence and representation

The existing edition-specific guide modules supply the object directions, prerequisites and guide anchors. The topology review additionally read 48 pages: the 44 COD Zombified regional pages recorded during planning, three Steam guides, and the Shadowed Throne page. Their source index is `other-topology/sources.json`. Source hashes and original factual relationship summaries are retained; the full article texts are not redistributed.

The machine-readable per-edge evidence lives in `other-topology/implementation.json`; the authored definitions are in `scripts/other-map-layouts.mjs`. An edge either refers to a specific guide step or to an indexed creator page. Missing paths are left undrawn. Diagram coordinates are chosen for readability and are never treated as measured game coordinates. Every delivered marker uses `precision: "area"`.

No external fan artwork was copied, traced or redistributed. The previous image candidates remain a separate rights/geometry research backlog. COD Zombified's text helped establish factual connections, including [Morgue → Exo Testing](https://codzombified.blogspot.com/2015/01/morgue-area-map-layout-call-of-duty.html), [Carrier's Lift connections](https://codzombified.blogspot.com/2015/06/lift-area-map-layout-carrier-exo.html), [Descent's one-way spawn drop](https://codzombified.blogspot.com/2015/08/reception-and-promenade-area-map-layout.html), and [Vanguard's Dig Site entrances](https://codzombified.blogspot.com/2022/06/shi-no-numa-dig-site-map-layout-call-of.html).

The [Archon Temple description](https://codzombified.blogspot.com/2022/09/archon-map-layout-temple-area-call-of.html) explicitly identifies closed shortcuts and changed Pack-a-Punch setup. Archon therefore has a separate graph from Terra Maledicta; it does not inherit Terra's direct Temple–Merchant Road route. Vanguard Shi No Numa similarly includes the new Dig Site through Comms/Storage exteriors and does not reuse the older-edition map unmodified.

## Deliberate limits

- These are partial regional/transport diagrams. Grouped floors are stated on the diagram and marker cards. Missing connectors are not an assertion that travel is impossible.
- Unverified joins are omitted, notably some Holding/district paths, IW street/tunnel joins and the full Archon Derailment route. The guide and in-game landmarks remain necessary for exact movement.
- Mobile drops, variable valves, meat pieces, symbols, papers and other randomized spawns receive search-region context, never invented exact pins.
- Portal/boat/boss destinations are separate context regions where useful. Oz's detailed arena and Outbreak memory, Shadowed Throne's Zeppelin network, and detailed Vanguard Dark Aether interiors are not supplied as overheads. The Zeppelin pod is a departure marker only.
- Der Anfang's limited Void destination is explicitly distinct from the complete Vanguard Shi No Numa round-based map. Rave Vision and AW contamination/laser states do not become duplicate physical maps.

## Integration and validation

All datasets use their guide ID, live in `app/data/maps/`, and reference `/maps/<guide-id>/overview.svg`. `quickLinks` keys are raw `step.id` values, while `target.guideAnchor` retains `guide-step-`. The main agent owns catalogue/loader/generated-guide integration.

Run `node scripts/build-other-maps.mjs`, then `node scripts/verify-other-maps.mjs`. Both ran successfully. Validation checks source/guide evidence identifiers, safe unique IDs, coordinate bounds, area precision, target references, self-contained SVGs and all 271 actual guide anchors. Set `CW_NODE_MODULES` to a runtime directory containing `sharp` and add `--render` to refresh previews.

All twelve SVGs were rendered and visually inspected under `other-previews/`. Seven route-label/line arrangements were adjusted in the scoped `scripts/lib/other-map-schematic.mjs` adapter to prevent a connection from appearing to join an intervening room and to keep travel labels legible. Changed diagrams were rendered and inspected again. The shared renderer and application components were not edited by this task.

The remaining IW/WWII entries without suitable verified coverage remain absent; this batch does not turn research gaps into fictional overheads. Application-wide build/browser verification belongs to the parent integration.
