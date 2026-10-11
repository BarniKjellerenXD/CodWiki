# MW3 rune portal finder

Build a dedicated Urzikstan portal tool. Show all 17 published entrances and 24 destinations on the existing overhead map. Selecting a destination immediately displays its three actual rune images in shooting order. Entrance selection is optional because the destination determines the code.

## Options and decision

| Option | Benefit | Tradeoff | Decision |
| --- | --- | --- | --- |
| Searchable code table | Fast keyboard lookup and simple phone layout | Does not answer where the entrances are | Keep a searchable list as the map alternative |
| Add codes only to the general map | Reuses the entire map interface | Other marker categories and guide controls distract from choosing a trip | Add a link into the dedicated tool |
| Dedicated portal finder with map and code panel | Entrances, destination and shooting order stay together | Needs a small purpose-built view | Chosen |

Use the installed Leaflet viewer library and the existing local Urzikstan artwork. Keep the portal interaction independent of the general map's saved filters, photo finder and guide selection. Reuse the existing screenshot-crop component, theme tokens, tool shell and generated tool catalogue.

## Player flow

1. See every entrance as a square letter marker and every destination as a round numbered marker. Shapes, labels and words distinguish them without relying on color alone.
2. Click a destination or its searchable list entry. Display its grid, nearby named area, and three numbered rune images. The same grid can contain several destinations; stable destination IDs keep those choices distinct.
3. Optionally select an entrance to inspect its doorway photo. Changing entrances preserves the chosen destination and its code.
4. Shoot the three symbols in order at the entrance, then interact and pay the displayed cost. The reference fare is 1,000 Essence. Exits need not contain an entrance for the return trip.
5. Save the last selection locally and allow sharing a link with explicit destination and entrance IDs. Invalid links must not silently substitute a different saved destination.

Compact multi-select toggles control entrance and destination visibility. Search accepts grid, marker label and nearby area. The selected code remains visible when filters change. Full-size list buttons provide keyboard and touch alternatives to map pins. The answer appears above the map on phones, with a direct “View code” action after map selection.

At overview zoom, nearby markers spread apart just enough to remain clickable. Short leader lines and small dots retain their exact source positions. The spacing is recalculated as you zoom or filter; it never changes the stored map coordinates. Both Enter and Space activate focused pins.

## Sources and data

- [WZHUB Urzikstan map](https://wzhub.gg/map/urzikstan/mwz): the public page was checked on 11 October 2026; it still lists the same 17 entrance and 24 destination IDs already in CodWiki. Use its published coordinates and individually linked reference images.
- `docs/remaining-games/puzzle-data.json` contains all 24 ordered triplets and eight glyph identities. The original ordered code plates, destination context images and entrance photos already exist under `public/images/remaining/`, with source URLs, dimensions and hashes in the asset manifest.
- [Espioth's portal research](https://www.reddit.com/r/CODZombies/comments/17uvwuc/mwz_rune_portals_guide/) independently describes shooting the destination's runes in order. Do not substitute the release-era graphic's smaller inventory for the current complete source list.

Generate a compact tool dataset by joining source marker IDs to existing calibrated map points and asset records. Display original screenshot pixels through SVG viewports; do not fabricate or approximate the rune shapes. Nearby area labels are orientation aids derived from the existing named map landmarks, not claims about an entrance's interior room name. Keep grid labels and reference photos visible.

## Integration and verification

Restore `/tools/mw3-rune-portals` as an active tool, remove only its retired redirect, and register it in the website and desktop catalogue. Link it from the rune-doorway guide section and the Urzikstan map, preserving existing guide anchors and the other retired helper redirects.

Validate complete source coverage, unique destinations, glyph order, asset hashes, coordinate calibration and query/state restoration. Browser-check map and list selection, distinct destinations sharing a grid, entrance changes preserving codes, filters, sharing, keyboard controls, image failures, mobile sizing, and navigation back into the guide. Run the affected tests, catalogue generation and production build, then inspect the final local preview.

## Implemented and verified — 11 October 2026

The dedicated finder is active at `/tools/mw3-rune-portals`, with links from the guide, general map and generated web/desktop navigation. Destination selection displays actual rune crops immediately. Entrance photos, arrival photos, the original complete code plate, compact filters, search, local selection storage and explicit trip URLs are implemented.

- Production build passed. All 288 affected tests passed, covering maps, MW3 guides, references, portal state, desktop catalogue and SEO.
- `scripts/verify-mw3-portals.mjs` passed its full browser flow, including every destination's image and ordered glyph identities, map/list/keyboard selection, same-grid destinations, filters, sharing, invalid links, clear/restore, missing images and blocked storage/clipboard.
- Inspected desktop, Paper theme, 390px and 320px phone layouts. No horizontal overflow or uncaught browser errors occurred. On phones the code appears above the map, with a “View code” button when it scrolls out of view.
- Browser testing caught and resolved Nuxt's client-only canvas mount timing, keyboard Enter activation, and crowded overview markers.

Positions and codes were checked against the published references and existing research, not an in-game playthrough. The tool does not track live match conditions.
