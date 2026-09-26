# Interactive maps for CodWiki

## Follow-up: quieter guide links and Cursed perks

The requested refinement was planned and implemented on 26 September 2026:

| Option | Benefit | Tradeoff | Decision |
| --- | --- | --- | --- |
| Replace every large button with an icon | Compact and keeps all existing links | Still repeats controls on consecutive actions in the same room | Too repetitive |
| One map link for each whole section | Very little visual clutter | Long quests lose useful links at destination changes | Too coarse |
| Contextual inline icons plus grouped location lists | Keeps navigation where a player needs directions; one icon covers a set of candidate spawns | Requires editorial review of the bindings | **Selected** |

Use a 16-pixel map glyph inside a 24-pixel link (32 pixels with coarse pointers), with keyboard focus, an accessible name and a hover title. Quick links sit inline with the instruction. Group location inventories at their introduction or heading; remove repeated puzzle/combat/result links while preserving travel and return destinations and every existing reading anchor.

Put the published Cursed-only Mister Peeks candidates in **Perks**, with an explicit `perkType: "mister-peeks"` and an **All perks / Mister Peeks** filter. Keep unrelated headphones, relic objectives and other Peeks quests separate. The 39 candidate markers have source references; one cropped Paradox exterior spawn is an explicitly approximate area. Eggs can contain perks; neither a spawn nor a perk reward is guaranteed.

Enable wheel zoom by default. Migrate old map display preferences to v2 while preserving layer/category; the old automatically stored `false` cannot distinguish an intentional opt-out from the previous default. Subsequent explicit opt-outs remain saved. Completion data is unchanged.

Verification covers data and guide references, preference migration, perk filtering, inline and grouped navigation, desktop/mobile layout, wheel input and a production build. See [current verification](interactive-map-verification.md) for results.

## Original proposal

Historical planning proposal · 26 September 2026. The six-map implementation is now in the workspace; see [implementation and verification](interactive-map-verification.md). The proposal below records the options considered before implementation.

**Recommendation:** add a third **Map** view to each of the six map guides, using one shared Leaflet viewer with locally hosted map artwork and curated location data. Add **Show on map** beside location-bearing steps in both Quick Parts and Full Details. Prove the complete interaction on Paradox Junction first, then extend it to the other five maps.

This is feasible in the existing Nuxt/Vue application. The largest uncertainty is the availability and accuracy of the map artwork and location coordinates. The repository does not yet contain a game-map atlas or structured marker coordinates; usable layouts for all six maps have not been sourced or verified during this planning pass.

**What the current code supports**

- All six map pages use [GuideArticle.vue](<C:/Users/MainLocalUser/Proton Drive/barnikjelleren/My files/vsCode/CodWiki/app/components/GuideArticle.vue>). Its shared toolbar is the natural place for `Quick Parts | Full Details | Map`.
- [QuestSteps.vue](<C:/Users/MainLocalUser/Proton Drive/barnikjelleren/My files/vsCode/CodWiki/app/components/QuestSteps.vue>) renders 128 quick steps across 34 parts. Each step already has a stable ID. The fields in [quickQuests.json](<C:/Users/MainLocalUser/Proton Drive/barnikjelleren/My files/vsCode/CodWiki/app/data/quickQuests.json>) currently describe text and tools, with no location references.
- Full walkthroughs are Vue templates under `app/components/guide/`. Many have section anchors, but individual list items generally need explicit IDs for returning to an exact step. A quick step can summarize several full steps, so their location links need an explicit mapping.
- [companion.mjs](<C:/Users/MainLocalUser/Proton Drive/barnikjelleren/My files/vsCode/CodWiki/app/utils/companion.mjs>) currently accepts only `quick` and `full` when loading saved views. Guide navigation and scroll tracking also assume two views. Adding a button alone would leave refresh and navigation incorrect.
- [ParadoxLocations.vue](<C:/Users/MainLocalUser/Proton Drive/barnikjelleren/My files/vsCode/CodWiki/app/components/ParadoxLocations.vue>) already lists RC-XD, headset and ball spawn candidates, with reference-photo links. This makes Paradox a useful pilot, including its Normal/Destroyed distinction. Those references still need coordinate verification.
- The [desktop app](<C:/Users/MainLocalUser/Proton Drive/barnikjelleren/My files/vsCode/CodWiki/desktop-app/README.md>) loads the website in an Electron webview. A guide-integrated map should reach both products through the website; desktop input and sizing still need checking. Locally hosted assets do not by themselves make the desktop app work offline.

**Approaches considered**

| Approach | What it provides | Main tradeoff | Decision |
| --- | --- | --- | --- |
| Clickable overview image | A layout with fixed pins and basic highlighting | Lowest initial effort, but small rooms and crowded locations become difficult on phones; richer navigation needs more work | Suitable for a small prototype |
| Leaflet over our own image or SVG | Pan, zoom, selectable markers, areas, separate floors/states, and direct guide integration | A new dependency plus curated artwork and coordinates | **Best fit** |
| Custom Vue/SVG viewer | Complete control over appearance and room shapes | We own gesture handling, coordinate transforms, zoom behavior and interaction maintenance | Useful if a later visual requirement exceeds the shared viewer |
| External map link or embedded service | Potentially reuses an existing map | Coverage and embedding support are unverified; step targeting requires a supported integration; appearance and availability depend on the provider | Reference material or fallback link |

Leaflet explicitly supports non-geographical game maps using `CRS.Simple` and an image overlay. That fits this project without a geographic tile service or map API key. See its [game-map tutorial](https://leafletjs.com/examples/crs-simple/crs-simple.html). Use the npm package bundled with CodWiki; the [download page](https://leafletjs.com/download.html) currently identifies 1.9.4 as stable and 2.0 as a prerelease. Recheck the stable release when implementing.

SVG artwork is compatible with the recommended approach; choosing Leaflet does not require photographic artwork. A custom SVG viewer would instead own the interaction system. SVG's coordinate viewport is described in the [viewBox documentation](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox). An external iframe would need a documented communication mechanism for commands such as selecting a marker; [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) is one possible mechanism, but no provider support has been verified.

**How it should feel to use**

The toolbar becomes `Quick Parts | Full Details | Map`. Opening Map directly shows the overview, quest locations and landmarks. Other categories can be enabled through filters.

1. A step with mapped locations has a compact **Show on map** button. A multi-location step can say **Show 3 locations**.
2. Clicking it saves the reading position, opens Map, chooses the relevant floor/state and highlights the target. A group of targets is framed together when they share a layer.
3. A selected-location panel shows the place, a short landmark description, floor/state, and relevant guide links. A photo is optional when a usable reference exists.
4. **Back to step** restores the original view, expanded part/section, position and keyboard focus. Clicking a guide reference while browsing the map opens that reference instead.
5. The location stays visible even if the user's normal filters would hide its category. Leaving the step-focused view restores their browsing filters.

The map uses the full available guide width. Its filter/location panel replaces the normal contents sidebar while Map is active, avoiding two competing sidebars. On smaller screens, controls sit above the map and the selected location appears below it. An expand control can give the map more room. The existing gold/orange emphasis, theme tokens and readable button styles carry through.

The following is a layout sketch, not a proposed game layout:

```text
Quick Parts       Full Details       [ Map ]

Search locations...      State / region      Floor

+-----------------------------------+-------------------------+
|                                   | Selected location       |
|         Pan / zoom map            | Landmark description    |
|         Highlighted targets       | State and floor         |
|                                   | Related steps           |
|  +  -  Fit map  Expand             | Back to step            |
+-----------------------------------+-------------------------+
```

Important location behavior:

| Situation | Behavior |
| --- | --- |
| One fixed object | Select its verified pin |
| Several possible spawns | Show all known candidates, labelled as possible spawns |
| Several required stops | Number the stops in guide order, without implying a walkable route between them |
| Targets on multiple floors or in different states | Group the results by layer; open the first relevant layer and show clear choices for the others |
| Only a room or area is known | Highlight that room/area and identify it as approximate |
| Moving enemy or task without a fixed location | Keep the instruction in text; use an area only if the area is established |
| Missing or conflicting reference information | Track it as unresolved; do not invent a precise pin |

For example, a Paradox headset link should expose the listed possible spawns and the Destroyed state. An Astra planet-sheet link should expose the three named rooms. Both examples come from the repository; their actual pin positions remain to be verified.

**Artwork and content work**

First inventory references for every map: layouts, named rooms, upstairs/downstairs spaces, alternate states and separate arenas. Use artwork that can be hosted with the project, with its source and usage basis recorded. Prefer a clear overhead layout. Where suitable artwork is unavailable, create an original schematic from verified room relationships and label it as a schematic. An approximate layout can support area guidance; it cannot justify exact object placement.

Keep the artwork, location descriptions, coordinates and guide references separate. Record the evidence and review status of each location. A small development-only coordinate picker would make it practical to place and correct markers across six maps; it can export proposed data for review without adding a public editing feature.

Audit all 128 quick steps and the location-bearing full-guide steps, including setup, side quests and relic instructions. Classify each as exact, area, candidate group, multiple stops, non-spatial or unresolved. The full guides contain more location detail than the quick checklist, so the quick-step count is not the total mapping workload.

| Map | Quick parts / steps | Special considerations visible in current content |
| --- | --- | --- |
| Paradox Junction | 6 / 19 | Normal/Destroyed states, upstairs rooms and alternate spawns; recommended pilot |
| Astra Malorum | 4 / 25 | Observatory rooms, upper floors and the separate Mars arena |
| Ashes of the Damned | 8 / 25 | Multiple named regions and steps involving travel between locations |
| Totenreich | 5 / 19 | Candidate crate/item locations, fishing areas and vertical landmarks |
| Kowakujō | 6 / 19 | Quest locations and references connected to its puzzle tools; layer structure needs auditing |
| Rex Infernus | 5 / 21 | Temple interiors, passages, Nexus spaces and separate quest destinations |

**Proposed implementation structure**

| File or area | Planned responsibility |
| --- | --- |
| Existing `GuideArticle.vue` | Third view, navigation dispatch, reader return context and alternate sidebar layout |
| Existing `QuestSteps.vue` and `quickQuests.json` | Optional map-target IDs and buttons outside the step's HTML string; preserve existing progress IDs |
| Existing `app/components/guide/*.vue` | Explicit map-link components and stable full-step anchors where needed |
| New `app/components/InteractiveMap.client.vue` | Leaflet canvas, artwork, markers, areas, viewport and resize lifecycle |
| New `app/components/MapLocationPanel.vue` | Location list, selected-location details and accessible guide links |
| New `app/components/ShowOnMap.vue` | Reusable full-guide button using the parent guide's map navigation context |
| New `app/data/maps/<map-id>.json` | Layer definitions, locations, named target groups and guide bindings |
| New `public/maps/<map-id>/` | Versioned layout artwork and any permitted location photos |
| New map utility/composable | Coordinate conversion, target resolution, filter state and navigation parsing |
| Existing progress utilities and tests | Safe loading of the third view and preserved reading/progress behavior |

Each map dataset should describe layers (region/state/floor plus artwork dimensions), locations (stable ID, layer, point or area, label, category and evidence), target groups (ordered stops or candidate sets), and references back to the guide. One location can serve multiple steps; one step can reference several targets. Store guide bindings explicitly, with quick-step IDs distinct from full-guide anchors.

Author coordinates as normalized `x,y` from the artwork's top-left corner. Convert to the viewer's coordinate system in one utility and test the corners and center. Preserve artwork aspect ratio and record its revision; changing image crops requires reviewing the associated coordinates. Avoid deriving locations from text matches or list-item numbers at runtime.

**Navigation, saved state and rendering**

- Reserve `#map` for the overview and `#map:<target-id>` for a single place or named group. Preserve existing `#wiki_*`, `#quick-*` and legacy links. The map's dataset resolves the target to the correct layer(s).
- Dispatch map hashes before the current article-anchor logic. A direct link must take precedence over saved preferences; an unknown target should open the overview with a helpful message.
- Keep the last guide reading anchor separate from the selected map target. In memory, also keep the return element and scroll position; after a reload, fall back to the stable guide anchor.
- Extend saved-view validation to accept `map` with safe defaults for existing data. Preserve the current storage version where the additions are backward compatible, and retain all checkbox IDs. Store validated per-map layer/filter/target preferences separately from completion state.
- Stop article scroll tracking while the map is active. Explicit view/target navigation should support browser Back/Forward; panning and zooming should not create history entries.
- Load the viewer code and active map dataset when Map is first opened. Start with a fixed-size loading panel and a usable text location list. Mount Leaflet only in the browser, release listeners on page departure, and resize after tab activation or desktop-sidebar changes. Leaflet documents this dynamic resize behavior through [invalidateSize](https://leafletjs.com/reference.html#map-invalidatesize).
- Keep the map canvas in its own stacking context so markers cannot cover the sticky toolbar or photo lightbox. Opening Map must not make its background artwork trigger the article image lightbox.
- Use accessible controls, visible keyboard focus, sufficiently large touch targets, and labels/shapes in addition to color. Support reduced motion and a text list for finding every mapped place without panning. Check wheel/pinch behavior against page scrolling and Electron's app zoom shortcuts.

Opening or selecting locations must not mark quest parts complete. Preserve the existing meaning of **Start new run**: clear that map's quest checks and resume state, retain unrelated maps, tools, pins and display preferences. A map-specific found-item tracker can be considered later with its own explicit reset rules.

**Work packages and completion criteria**

1. **Prepare the content foundation.** Inventory artwork and location coverage across all six maps; define the dataset and coordinate conventions; prepare verified Paradox layers and representative fixed, candidate and multi-layer targets. Deliver a coverage sheet and usable pilot assets. Artwork availability may change which map is ready first.
2. **Build the shared viewer.** Add Map to the guide shell, responsive layout, pan/zoom, search, filters, layer selection, marker/area selection and text fallback. Complete when the pilot works on desktop and a narrow screen, including tab switching and resizing.
3. **Complete the pilot's guide workflow.** Link eligible Paradox steps in both reading views, implement return-to-step and shareable links, and handle saved-state restoration. Complete when all of its location-bearing steps have verified point/area/group guidance or an explicitly recorded content gap. Do not call a map fully covered while those gaps remain.
4. **Expand coverage to the remaining five maps.** Reuse the viewer and populate datasets/assets; add exact full-step anchors and resolve documented gaps. A useful sequence is Astra, Ashes, then the remaining maps ordered by reference readiness. Complete the six-map feature only when the agreed location-bearing step coverage is delivered across all six.
5. **Verify the integrated feature.** Validate all target IDs, layers, coordinate bounds, asset files and guide anchors. Run the existing tests and production build, then exercise quick/full/map navigation, direct links, refresh, browser history, hidden/completed parts, both themes, mobile input and the Electron webview. Review marker placement against its references; passing code checks does not verify game geography.

The viewer is a moderate implementation task shared by every map. Artwork preparation and location validation are the largest variable workloads. A dependable overall time estimate should follow the first content audit; the current source does not justify a fixed estimate for completing all six maps.

**Extensions worth considering after the core feature**

| Addition | Benefit | Priority |
| --- | --- | --- |
| More optional map categories: all perks, wall buys, traps and crafting tables | Useful general reference between quest steps | High, after required step coverage |
| Location photos and map targets in site-wide search | Helps identify the exact object and find it from the homepage | High |
| Optional “found this spawn” state | Helps track candidate searches during a run | Medium; needs separate progress/reset design |
| Guide beside map on wide screens | Allows reading while inspecting nearby locations | Medium; build on the same viewer |
| Suggested travel routes | Could reduce backtracking | Later; requires verified connections, stairs, doors and transitions |
| Offline map packs or 3D presentation | Specialized convenience or richer visuals | Later; substantially expands scope |

The recommended first delivery is the shared Map view with a complete Paradox pilot, including quick and full step links. The intended final scope remains all six map guides. This planning pass changed only this proposal; it installed no dependency and changed no feature code.
