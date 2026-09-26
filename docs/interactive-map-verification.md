# Interactive maps: implementation and verification

Implemented 26 September 2026 across all six guide pages. The shared toolbar offers Quick Parts, Full Details and Map. Location-bearing instructions link to a single place, several required stops, candidate spawn areas or an approximate room. Back to step restores the reading view, expands its section and returns to its source button; a reload falls back to the stable step anchor.

## Coverage and precision

| Map | Locations | Layers | Quick links | Full Details links |
| --- | ---: | ---: | ---: | ---: |
| Ashes of the Damned | 127 | 1 | 19 / 25 | 81 |
| Astra Malorum | 75 | 3 | 21 / 25 | 63 |
| Kowakujō | 94 | 1 | 18 / 19 | 86 |
| Paradox Junction | 113 | 3 | 16 / 19 | 99 |
| Rex Infernus | 156 | 1 | 11 / 21 | 58 |
| Totenreich | 163 | 2 | 14 / 19 | 66 |
| **Total** | **728** | **11** | **99 / 128** | **453** |

The refinement replaces large per-line controls with small inline icons and groups location lists at their introduction or heading. It removes 410 repetitive Full Details links and 23 Quick links while preserving destination changes, grouped searches and existing reading anchors. Link counts are deliberately lower; they are not a target for blanket coverage of every instruction.

There are **39 Cursed-only Mister Peeks candidates** under Perks: Ashes 7, Astra 8, Paradox 4, Totenreich 9, Kowakujō 5 and Rex 6. The explicit `perkType: "mister-peeks"` distinguishes them from other Peeks quests. The Perks subfilter isolates those candidates. Published coordinates are registered to the saved artwork; the cropped north-side Paradox roof is represented by a labelled approximate area in the correct era. Nearby-place labels do not claim verified elevation or an exhaustive in-game survey.

Counts measure available guidance, not an in-game survey of every object. Published service/object coordinates are pins; named rooms, uncertain spawns and entrances to separately depicted spaces are labelled **Approximate area**. Steps involving mobile or portable actions have no button when no reliable destination is known. Some secondary quest locations remain unsurveyed.

Detailed provenance and gaps are recorded in [Paradox, Astra and Ashes verification](maps-first-verification.md) and [Totenreich, Kowakujō and Rex verification](maps-remaining-verification.md). The viewer includes source credits and location references. Artwork is locally served Activision game imagery sourced from the official tactical maps and the community maps identified in those reports. The Astra pylon diagram is an original, clearly labelled schematic, separate from its real Mars arena artwork. These records do not assert ownership of third-party imagery or a new license.

## Behaviour

- Pan, zoom, fit map, fit selection and expand controls; wheel zoom defaults **on**. The v2 display-preference migration preserves the old layer/category but replaces the old automatically saved false default. Later user opt-outs are remembered. Browser Ctrl/Command-wheel zoom remains available. Zoom transitions are disabled to avoid Leaflet 1.9.4's pending-transition teardown race; panning still supports inertia unless reduced motion is requested.
- Search across every layer, a default Quest & areas filter, individual categories and All locations. Selected locations remain visible when filters change. The location list provides keyboard access and remains available if artwork fails.
- Separate Normal/Past, Destroyed/Future and boss-overview layers in Paradox; real Mars artwork plus a pylon diagram in Astra; a separate Dravakar's Fall arena in Totenreich. Unavailable interior floor plans use explicit area/floor descriptions.
- Shareable `#map` overview and `#map:<target-id>` links, browser Back/Forward, unknown-target recovery and exact quick/full step anchors. Panning and zooming do not add history entries.
- Map selection never completes a quest part. Existing progress IDs and storage version remain intact. New-run reset clears quest completion and the active reader/map selection, while retaining unrelated maps, toys, tools and display preferences.
- Leaflet, its CSS, artwork and the active dataset load when Map is first requested. The quick reader imports only a small generated ID-to-target registry. Client-only mounting avoids server access to `window`; resize observers and listeners are released when leaving the guide.

## Editing map content

`app/data/maps/<map-id>.json` uses the types in `app/types/map.ts`:

- `layers`: stable ID, label, local image path, exact image width/height, optional note and optional normalized viewport bounds.
- `locations`: stable ID, label, layer ID, category, `x` and `y` normalized from the **top-left** of that image, `precision` (`point` or `area`), description, source and optional floor/state. Leaflet conversion is `[(1-y)*height, x*width]`.
- `targets`: named location groups with member IDs, a title, `single`/`area`/`candidates`/`sequence` kind, description and optional guide anchor. Sequence numbering explains guide order; it does not imply a traversable path.
- `quickLinks`: existing quick-step IDs mapped to target IDs. Do not rename quick IDs when changing map placement.

Full instructions use `<ShowOnMap target="…" label="Show … on map" />` inside an element with a stable ID and `data-guide-step`. The label is accessible text and a tooltip; the visible control is a map glyph. Add it at a useful destination change or a location-list introduction, not every repeated action. Preserve existing guide IDs and text. Keep approximate locations approximate until a source establishes exact placement. Changing an image's crop, rotation or coordinate system requires reviewing every location tied to it.

Run `node scripts/generate-map-links.mjs` after changing quick bindings. The normal catalogue generator also runs it before development and builds. `app/data/mapQuickLinks.json` is generated; edit the dataset instead. `scripts/convert-guides.mjs` is an old one-off migration and now refuses to overwrite guides containing map bindings; edit the Vue components directly.

## Validation

- `npm test`: **66 passed**, including all existing puzzle/progress/desktop tests. Map checks cover safe hash parsing, old-save compatibility, independent reader context, reset isolation, exact image-header dimensions, normalized bounds, source/target/layer references, all six datasets, every quick/full binding, stable visible anchors and registry consistency. Reactive viewer tests exercise filter bypass, preference migration and explicit opt-out persistence, Cursed perk filtering, candidate layers, coordinate conversion, responsive refitting, image-layer replacement and teardown order. A content contract keeps all six Cursed candidate groups complete and separate from unrelated Peeks quests. Permanently hidden legacy summaries are excluded from map destinations.
- Production client and server compile and package successfully with normal filesystem permissions. `npm run build` passed; the restricted Windows run reached packaging but could not read a parent-directory link. The latest refinement was built through the same Nuxt build API with only the output folder overridden to `.cache/map-preview-revised`, because Proton Drive repeatedly renamed `.output` during sync. Existing Pigpen-font resolution and dependency deprecation warnings are unrelated to the map feature.
- Browser checks cover all six maps loading, quick/full map links, grouped selection, text search, selection retained through filters, reload, browser history, the requested reading tab after history navigation, and the matching quick phase when leaving a full step. Direct links reopen saved collapsed evidence cards and completed hidden parts. New-run reset returns to the first quick part and clears completion while retaining display preferences. The map fits 390-pixel mobile and 1280-pixel desktop layouts without horizontal overflow; Archive and Paper themes were inspected.
- Final production regressions: repeated Totenreich boss/overview and Astra Mars/diagram/overview switches load the correct artwork without console errors; departure after zoom is clean. Paradox's note link opens the visible walkthrough and then the matching third quick part. A table-row link returns to the same visible row after reloading Map. Resizing the three-planet-page selection from 390 to 1280 pixels leaves all three pin bounds inside the map canvas, with no new console errors.
- Refinement browser checks: inline controls render at 24 × 24 pixels without visible label text; quick and grouped-header links select the expected locations and return keyboard focus to the source icon. Perks → Mister Peeks isolates Astra's eight candidates; selecting its Mars candidate switches layers. Explicit wheel opt-out, Peeks filter and layer persist after reload; wheel zoom is restored to enabled in the delivered preview. A real wheel gesture over the map increased the artwork's rendered width. All six Cursed groups load with the documented counts at 390 pixels without horizontal overflow or artwork errors. The production session produced no new browser console errors.

The desktop shell loads the same website, so the feature does not require a new Electron UI implementation. Native Electron gestures and packaged-app execution have not been separately exercised in this session. Local artwork does not provide offline support. No production deployment was performed.
