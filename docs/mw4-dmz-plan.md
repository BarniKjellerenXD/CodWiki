# MW4 DMZ expansion plan

Status: first build in place (2026-10-20); see [Implementation](#implementation-2026-10-20). DMZ early access opened 2026-10-20; full launch 2026-10-23; Season 1 on 2026-11-06.

## Scope decision

CodWiki adds a second top-level **mode**: Zombies and DMZ. This is a deliberate change from the "standalone Zombies" scope in [the game library plan](game-library-plan.md). Zombies remains the default experience; existing routes, IDs, saved progress, bookmarks and shortcuts stay unchanged.

The first DMZ content is Modern Warfare 4's Hajin Exclusion Zone. Map artwork comes from official Activision reveal/press imagery with source credits; pin precision is labelled `area` wherever the artwork cannot support an exact point.

## Mode model

- New `shared/modes.mjs` registry: `{ id, name, shortName, tagline }` for `zombies` and `dmz`, in display order.
- Map and tool entries gain `modeType` (default `zombies`). The existing free-text `mode` field ("Dark Aether", "Open-world deployment") keeps its meaning.
- A game belongs to every mode it has entries in, so MW4 can later hold a Zombies entry beside DMZ without a new game ID.
- The catalogue generator emits `modeType`, adds mode-specific search keywords (replacing the unconditional "zombies" keyword) and exposes `modes` to the website and desktop catalogue.

## UI

The [implementation](#implementation-2026-10-20) replaced the charcoal-and-gold DMZ home below with an MW4-style section. The mode model and desktop notes still apply.

- **Switch:** a Zombies | DMZ segmented control above the game rail (wide screens) and above the game selector (phones), using the existing charcoal-and-gold components and visible focus.
- **Routes:** `/` stays the Zombies home so existing search visibility is preserved; `/dmz` is the DMZ home with its own title and description. The switch navigates between them and remembers the last choice locally.
- **Filtering:** the rail, selector, game sections, artwork and tools directory show the selected mode. Global search crosses modes and labels each result with its mode.
- **Wording:** shared mode-aware labels replace hard-coded "Zombies" text (homepage eyebrow, "Puzzle tools" heading, site title, manifest, SEO home copy). The site tagline becomes "Zombies & DMZ companion"; the domain is unchanged.
- **DMZ home:** map first. Hajin opens on the interactive map with Basics, Keys, Missions and Bosses panels beside it.
- **Guide pages:** DMZ entries show a mode badge and hide "Start new run"; DMZ progress persists between matches (see Trackers).
- **Desktop:** the sidebar gets the same switch and filters its game list by mode. Generalize the MW3-specific info text and subgroup handling in `desktop-app/renderer/app.js`. This change needs a desktop release; catalogue content alone does not.

## Implementation (2026-10-20)

Options considered for bringing the MW4 menu concepts (canvas boards E–H) into the site:

1. **Reskin the whole site in the MW4 style.** Rejected: it breaks the Zombies identity and PRODUCT.md rules (no backdrop blur, no glow) for every page.
2. **Add DMZ to the existing guide catalogue with the charcoal-and-gold theme.** Rejected: loses the in-game feel the concepts were for, and the run, step and reset machinery is built for Zombies Easter eggs.
3. **Chosen: a self-contained `/dmz` section with its own shell and scoped theme.** Zombies pages are untouched; DMZ gets the station menu, rail and dock.

What exists:

- **Routes:** `app/pages/dmz.vue` is the shell (background, desktop rail, phone dock, menu overlay). `/dmz` is the station menu as a page; `/dmz/hajin`, `/dmz/orders` and `/dmz/briefing` are the first stations. Esc or the CW emblem opens the menu over any station; phones tap once to preview a station and again to open it.
- **Data:** `shared/dmz.mjs` holds stations, dock order, page SEO, briefing sections, Hajin POIs, Orders and sources. SEO pages, the sitemap and search entries are generated from it.
- **Locked stations:** Stash/keys, Boss Board and 3D Printer stay visible but locked, each with a note on what is missing. Operators and Intel open briefing sections for now.
- **Orders tracker:** `useDmzOrders` stores ticks and counters under `codwiki-dmz-orders-v1`, separate from Zombies progress, keyed by task ID (never rename one). Orders are grouped by page with each page's reward and jump links. Pages 1–9 are listed (27 Orders, updated 2026-10-22): Underground 1/2 was checked in-game, the rest come from task text that matches across independent guides, and each page header says which. Pages 1, 4 and 7 are fixed; the chapters fill the pages between them in the order a player picks, so the tracker shows one possible order. Page 10 waits for a second guide.
- **Theme:** every DMZ style sits under the `.dmz` root with `--dz-*` tokens. Saira (variable width axis) and JetBrains Mono load through `@nuxt/fonts`; widths use `font-variation-settings` because the font provider does not parse `font-stretch`. Frosted glass, glow and grain appear only inside DMZ, and `tests/dmz.test.mjs` checks that `main.css` stays free of them.
- **Homepage:** a Zombies | DMZ switch above the hero links to `/dmz`. The fuller mode model (`modeType`, filtered rail, desktop sidebar) is not built yet.

Still open: keys, Boss Board and 3D Printer content, and the desktop app, which needs a release. The Hajin map shipped on 2026-10-22 (see below).

## Intel database (2026-10-20, updated 2026-10-22)

Options considered for collecting launch-week knowledge from Reddit, guides and official posts:

1. **Extend the Briefing page.** Rejected: hundreds of facts do not fit a reading page, and nothing would say how sure each one is.
2. **Chosen: a searchable database at `/dmz/intel`.** One card per thing (key, boss, trait, recipe, bug…), with category, facts, sources and a confidence label.
3. **A wiki page per entry.** Deferred: worth it once entries stop changing daily.
4. **A live Reddit feed.** Rejected: unfiltered, unsourced and full of leaks.

How it works:

- **Data:** `shared/dmz-intel-data.mjs` holds the entries and their sources; `shared/dmz-intel.mjs` adds categories, the tracked Orders from `dmz.mjs`, and the filter helpers. The data file is the baseline: edit it by hand.
- **Confidence:** Official needs an Activision or platform source. Confirmed needs two independent sources (player threads and videos count per URL, press and guide sites per site) or an in-game check. Everything else is Reported. Tips and known issues need two sources or they are left out. `tests/dmz-intel.test.mjs` enforces this.
- **Left out:** leaks, datamines, rumours, step-by-step exploits, usernames. Sources are paraphrased, never copied.
- **Research rounds:** each round is gathered by parallel researchers into JSON (official/news, Reddit and community, map and keys, systems and Orders), then applied on top of the baseline by a script that matches entries by name, adds new facts and sources, and stamps `added` or `updated` with the round's date. Hand decisions (aliases, merges, corrections) are kept in a separate edits file. The page flags the latest round's entries as New or Updated and offers a `?c=latest` filter.
- **Page weight:** the unfiltered view previews six cards per category and renders the rest on demand; long fact tables fold away. The homepage search index carries only 18 summary words per entry.
- **Orders:** an Order joins the tracker only when its task text is checked in-game or matches across two independent guides; other Orders stay in Intel.

## Hajin Tac-Map (2026-10-22)

Options considered for an interactive Hajin map:

1. **Add Hajin to the Zombies map viewer (`InteractiveMap`).** Rejected: its filters, guide targets and charcoal-and-gold styling are built for Easter-egg steps, and DMZ needs threat ratings, report badges and Intel links instead.
2. **Chosen: a DMZ Tac-Map component (`DmzTacMap.client.vue`) on Leaflet, styled like the in-game Tac-Map.** It reuses the viewer's tested Leaflet setup (simple CRS, no zoom animation, ResizeObserver, Ctrl+wheel left to the browser, keyboard-activated markers) inside the DMZ theme.
3. **Embed or copy a community map.** Rejected: their artwork and pin data are not ours to reuse.
4. **A static annotated image.** Rejected: no search, no layers, and 240 markers do not fit one picture.

How it works:

- **Art:** the official Tactical Map from DMZ Deep Dive Part 1, cropped to the map (`public/maps/mw4-hajin/tac-map.webp`, credit and hashes in `docs/mw4-dmz-assets.json`). Downloading it was approved; no other images or tiles are used.
- **Official markers:** 137 names and positions from Activision's interactive Hajin Tac Map (13 major locations, 7 fortresses, 22 named areas, 6 compounds, police, clinics, fire and gas stations, marine gas, ammo caches, UAV and Lieutenant towers), kept in `shared/dmz-map.mjs`. Official units (4096 square) map onto the art with a fitted scale and offset, within about 10 px of the fortress icons drawn in the art.
- **Grid:** ten columns (A–J) and nine rows of 276 official units from (668, 976). It matches the official D7 = Imjin Farmland example and 14 of 17 squares read in game; the misses sit on grid lines. The art is cropped partway through row 9.
- **Threat:** each major location shows the highest rating the Deep Dive gives any of its parts; the card lists every part.
- **Reported sites:** key rooms, bosses, exfils, SAM sites, loot, mission objectives, ops, supply drops, the X01 entrance, bounty and train stations, Story Mission exits and landmarks from guides and player reports (`shared/dmz-map-reports.mjs`). None has an exact official position. Until 8 Nov 2026 each rode on the official place it belongs to as a gold count badge; since then each is drawn at a spot worked out from what its sources say (see [Reported spots and quick finds](#reported-spots-and-quick-finds-2026-11-08)), and its card lists squares, sources and confidence (same rules as Intel).
- **Links:** `?pin=<id>` selects a place, service or report (ids share one namespace). Cards link to matching Intel entries. The router keeps the scroll position when only a DMZ page's query changes.
- **Search:** names, layers, parts and report text; a square such as `H6` outlines it and lists everything inside.
- **Tests:** `tests/dmz-map.test.mjs` checks marker counts, squares read in game, threat peaks, anchors, sources, confidence and the art's hash.

### Threat view (2026-10-22)

A Map / Threat switch on the Tac-Map, in the spirit of the MWZ map's coloured threat tiers. The Deep Dive rates 34 parts of the 13 locations but publishes no borders, so the options differ in how they fill that gap:

1. **Tint the existing markers.** Cheapest, but it shows points, not ground, and the map already colours each location's diamond by its peak.
2. **Colour whole grid squares by the worst part inside.** Easy to read against key cards, but squares cut across locations and would paint most of a square Extreme for one building.
3. **A circle per part.** Overlapping circles blend into muddy colours, and it is unclear which rating wins.
4. **Chosen: nearest-label zones.** Each rated part with a label on the official map (the location's own label for its main part, a fortress or named area for the part it names) colours the ground within a fixed reach: 200 official units for a location, 140 for an area, 90 for a building. Where reaches meet, the nearer label wins. Named places the Deep Dive does not rate, compounds included, claim their own ground and stay uncoloured, so nothing unrated gets a colour. Parts of one location at one level share an outline.
5. **Hand-traced borders.** Would look the most like MWZ, but they would be invented.

How it works:

- `shared/dmz-map.mjs` builds `hajinThreatParts` (all 34 parts, with the place each is drawn at) and `hajinThreatSeeds` (positions, reach and level). `shared/dmz-zones.mjs` samples the zones on a 4-unit grid, traces the outlines and smooths them; it takes about 50 ms the first time the view opens.
- Eight parts have no label of their own and are listed as "spot not mapped". Two of them, Air Base Bunker and Nenshin Tech Complex (both Extreme), are rated above everything drawn for their location, so their location gets a dashed Extreme edge and a "+ Extreme" tag instead of an invented spot.
- `?view=threat` opens the view, so it can be linked; the page's Threat ratings section links to it. Level chips filter zones, labels and the list, and the choice is saved with the other map preferences. The panel lists parts by level, most dangerous first, and the art is dimmed so the zones read.
- The view says the zones are approximate. Zones also spill over water; masking that would need the art's land outline, which is a possible follow-up.

### Routes (2026-11-04)

A player asked for the Hajin run in a YouTube video (`vL3C8nRziCg`) to be drawn on the Tac-Map, and sent four Tac-Map screenshots with the route marked in red from memory. The video page could not be reached from the build environment, so the line comes from those screenshots, not from the video.

1. **A reported site on one place.** Rejected: a route crosses most of the map, and a badge on one place says nothing about the path.
2. **One gold badge per stop.** Rejected: it hides the order and the line between stops.
3. **Chosen: a Routes layer that draws the line, with numbered stops.** The route is its own kind of item beside places and reports. It shares the `?pin=` link, search, and the card panel, and it shows in the threat view only while open, so a reader can see which zones it crosses.

How it works:

- `shared/dmz-routes.mjs` holds each route's path and stops in official units, its sources and a note on how it was traced. `shared/dmz-map.mjs` adds the square of each stop and names the nearest place, adding a compass side ("South of Wolves Stadium") when the stop is more than 100 units from it.
- Tracing: each screenshot was registered on the art by edge correlation (all four at the same scale, 1.684 screen px per art px, match scores 0.81 to 0.90). The red line was followed pixel by pixel between the circled stops, then simplified. The screenshots' shared stops agree within about 6 art px, and every stop is a point on the path.
- On the map the line sits over the art and under the markers, with a dot per stop. Opening the route numbers the stops above the places. The card lists the stops in order, and picking one zooms to it. The card also links the video and says the line is traced from memory.
- Tests in `tests/dmz-map.test.mjs` check that each path stays on the art, passes its stops in order, names real places and cites a source that resolves.
- Follow-up: once someone has watched the video, record what the run does at each stop and its title, and check the line against it.

### Reported spots and quick finds (2026-11-08)

The owner asked for the map to be "much more usable" about where things are, like the big community DMZ map sites, and named dmzhub.gg as the source to use. dmzhub.gg's robots.txt disallows Claude and other AI agents by name, reserves AI training, and its Cloudflare check refuses automated visitors; its pins are its own contributors' work. So nothing was taken from it. The data came from a fresh research round instead (below), and the map was rebuilt so every site is drawn where it is.

Options considered for showing where reported sites are:

1. **Keep count badges on places.** Rejected: you have to click and read to learn where a key room is, which is the complaint.
2. **Jitter each site somewhere inside its place.** Rejected: it invents positions.
3. **Leaflet.markercluster.** Rejected: a dependency, clusters sit at average points, and it merges sites across places.
4. **Always-on footprints for rough sites.** Rejected: they blur together, as threat option 3 did.
5. **A static poster in place of the inline phone map.** Deferred: two render paths, and `?pin=` arrivals would behave differently.
6. **Chosen:** precision tiers, place-aware groups that spread into a fan, the ground a rough site could be on shown when it is picked, quick finds, a Layers panel with sections, and a full-screen phone map. Three designs (a phone companion, a desktop planner and a precision-first one) were scored by a judge; the precision-first one won, with the phone shell, quick finds and layer sections grafted from the others.

How it works:

- **Spots.** A report names the official service building it is in (`service`, such as the police station near Pyonghwa Village), a side and rough distance when sources give one (`side`, `dist`), and the squares sources give. `siteOf` in `shared/dmz-map.mjs` turns that into a drawn spot and a precision: exact (a marked service building), building (a fortress or compound), near (a side and distance off a marker), place (somewhere in a named place, moved into the square sources give when that square touches the place's own) or square. Precision falls in three tiers drawn by shape, not colour: pinned (solid), approx (dashed, with the circle it could be in) and area (dashed, standing for the place). Bosses that roam are flagged `moves` and are only ever approx.
- **Words.** `shared/dmz-map-view.mjs` says each spot in a sentence ("Inside the police station near Pyonghwa Village", "Somewhere in Cheongun Village") and a square line ("Key card square F5", "Sources disagree: F7 / F6"). Tests check the words back each claimed building and side.
- **Groups and fans.** At each zoom, sites that would overlap within 34 px (42 on touch) join a group, never across major locations, and the group sits on a member's own spot, preferring its major location's label. One member is a tag; more make a gold chip beside the place. A chip zooms in when its members would split apart closer in; otherwise it spreads into a fan of up to 16 on two rings, leaving the label's side clear, with a leg from each member back to its own spot. Picking a site from anywhere opens its group's fan.
- **Quick finds** (Keys, Bosses, Exfils, SAM, Loot, My keys) show only those sites for now and hide services; the saved layers stay as they were. **Layers** is a panel of folding sections with All and None, counts, each layer's description and a List button.
- **Lists** group by major location in map order or by square in reading order. Search matches every word in any order and ranks names, then key and Intel names, then places and types. A square lists what sources put in it and the places in it.
- **Key tracker.** A key room's card marks its key held or used (`codwiki-dmz-keys-v1`, unchanged); held rooms get a green dot, used ones fade with a tick, and My keys lists the rooms for held keys. A room research found before any Intel card covers its key is tracked from its report.
- **Phone.** Inline, the map does not take drags or pinches, so the page scrolls past it; Open full map gives a full-screen dialog (`#full`, so Back closes it) with a bottom sheet holding search, quick finds, the list and the card. A landscape phone docks the sheet on the right.
- **Links and preferences.** `?pin=` now opens a report's own card. `tests/fixtures/hajin-ids.json` holds every id from before this change, and `REPORT_MOVED`/`resolvePinId` keep old links working. Saved preferences (`codwiki-dmz-tacmap-v1`) gain `known`, `collapsed` and `hideUsed`; layers added after a save take their default instead of being switched off.

Research round (8 Nov 2026, after Season 1 on 6 Nov): one researcher per category (keys in the north and west, keys in the south and east, bosses, exfils and services, loot and landmarks, Season 1 changes, missions and ops), each using web search only, with dmzhub.gg blocked from results. Every finding was then re-checked by an adversarial verifier told to refute it, check its official ids and downgrade its confidence when the evidence was thinner than claimed. The merge keeps report ids so links and saved key marks hold, recomputes confidence from the sources, and records `added` or `checked` dates. A shared limit of 200 searches per turn cut the first loot, Season 1 and activities passes short; they were rerun with per-agent caps. Positions are still derived from words, not traced from the game, so an in-game check of the busiest places (Chang-san Air Base, The Grid, NuriGO Mall) is the next step.

## Content phases

0. **Groundwork:** restore git history; add the mode model and switch; generalize wording; update count-based tests; add mode tests. No DMZ content yet.
1. **Skeleton:** add `mw4` to `shared/games.mjs` and a Hajin DMZ entry with a DMZ basics guide limited to confirmed facts (FOB, Active Duty Operators and MIA recovery, Orders, Story Missions, Dynamic Ops, extraction, threat levels). A review note states that it reflects early-access information.
2. **Hajin interactive map (done 2026-10-22, see Hajin Tac-Map):** artwork from official imagery under `public/maps/mw4-hajin/`, sources and hashes in `docs/mw4-map-sources.json`. Overview pins for the 13 major POIs, threat levels as area overlays, then exfils, Lieutenant spawns, key-locked rooms, fallout zones, vehicles/fuel and train/tram stops. Register new types in `app/utils/mapFilters.mjs` and icons in `scripts/generate-map-icons.cjs`.
3. **Trackers:** persistent storage separate from `codwiki-progress-v1`, following the `useMwzMilestones` pattern.
   - Key tracker: keys held/used, each linked to its locked room on the map.
   - Story Mission tracker: step progress kept across matches.
   - 3D Printer materials calculator once recipes are stable.
   - Bosses and Lieutenants stay in the guide and map rather than becoming a separate tool.
4. **Seasons:** XL1 (Season 1) and the Russia expansion (Season 2) as new locations and map layers.

## Evidence rules

Pre-launch counts (keys, bosses, traits, recipes, bank cap) are single-source or conflicting. Add them only after launch-week confirmation from multiple community sources or official posts, and record sources per entry. Website checks and source review are not an in-game playthrough.

## Validation

`npm test`, `npm run build`, `npm run check:seo` against the production server, a phone-width check of the switch and DMZ home, and the desktop sidebar switch in the packaged app.
