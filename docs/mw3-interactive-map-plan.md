# MW3 interactive maps

Players need to locate an object or exit quickly while a match is running. Keep
the six complete MW3 guides and add the existing Map view to Urzikstan and the
four seasonal Dark Aether destinations. The map is an optional spatial reference;
the readable guide remains the starting view.

## Choices and decision

| Code approach | Strength | Cost | Decision |
| --- | --- | --- | --- |
| External map link or iframe | Broad existing coverage | Depends on another UI/service; cannot reliably return to an exact guide step | Keep as a credited reference |
| New custom canvas or SVG viewer | Complete rendering control | Duplicates zoom, touch, keyboard, selection and persistence code | Unnecessary for this feature |
| Existing Leaflet viewer with local artwork and data | Reuses tested navigation, accessibility, mobile behavior and Electron integration | Requires careful location curation | **Chosen** |

| Content structure | Strength | Cost | Decision |
| --- | --- | --- | --- |
| One map with a seasonal selector | Central entry point | Mixes separate spaces and reintroduces a selector into MW3 | Reject |
| All available markers shown immediately | Broad coverage | Hundreds of markers obscure the geography | Available through filters |
| One map per guide, quiet overview plus searchable categories | Keeps map context clear and connects locations to instructions | Some moving/random objectives remain text guidance | **Chosen** |

## What ships

- **Urzikstan:** seasonal portal areas, twelve candidate USB consoles, four clue
  walls and four potential Red Worm arenas, eight free-perk challenges, the vault
  and three stationary chess transmitters, triangle rituals and Unstable Rift
  obelisk candidates. Include district landmarks and useful ammo, Pack-a-Punch,
  Wunderfizz, doghouse, travel, fuel, box and extraction references through filters.
- **Al Bagra / Season 1:** three contract starters, both repeat-visit exits,
  named locked rooms and key candidates, entry and support/travel locations.
- **Sa'id / Season 2:** three contract starters, four exit references,
  Countermeasures relic/obelisk locations, the stadium music area and support.
- **Zarqwa / Season 3:** three contract obelisks, the exit, the outer spores and
  central Rift Heart for Gyanxi, plus entry and support locations.
- **Al Mazrah City / Season 5:** floating contract starters, rooftop/lower exits,
  Highrise secret-quest search areas, Spec Electronics, the warehouse key and
  locked door, entry and support/travel locations. Floors and Elder-only conditions
  stay explicit; overhead art does not model the height of floating structures.

The Unstable Rift guide links to its possible Urzikstan entry obelisks. It does
not receive invented geography for its separate five-wave arena. Knight's truck,
live storms, active contracts and moving bosses are not shown as fixed live pins.

## Interaction and implementation

Extend the existing charcoal/gold map surface in Operate mode and retain Read mode
for the walkthrough. Use the same pan, pinch, zoom, expansion, keyboard navigation,
search, selection, shareable `#map:target` links and Back to step behavior. Show a
compact coordinate grid and searchable grid labels. The Key locations overview
keeps the large map readable; typing there searches the entire location index.
Category filters and All locations provide the wider reference list. Hide the
layer selector for single-layer maps.

Datasets live under `app/data/maps/`; their quickLinks also generate the inline
Show on map links in Full Details. Derive interactiveMap from available datasets
when generating the catalogue so the guide button and data registry agree.
Artwork, marker data and Leaflet remain lazy-loaded when Map is first opened.
Map UI preferences do not add puzzle/progression trackers or erase saved runs.

The Electron app uses the same website and assets. Test real Electron pointer,
keyboard, hash navigation, resizing and return-to-step behavior. Publish updated
Windows metadata/copy with v1.7.0; existing v1.6 apps also receive the live maps.

## Evidence and precision

The five [WZHUB MWZ maps](https://wzhub.gg/map/mwz) provide the overhead map
references and published coordinates. Locally assembled artwork retains their
markings and source credits. Record URLs, dimensions, hashes, review date and the
coordinate transform in `docs/mw3-map-sources.json`. Descriptions and guide links
are curated for CodWiki rather than importing a whole external UI or database.

Published points preserve their positions. Locations known only by grid or
landmark are explicit approximate areas. Random spawns, possible exfils, active
USB sites, the current Worm arena and conditional keys carry those qualifications.
Never turn the source's placeholder `[0,0]` into a real object. Ordinary and story
visits can differ. In-game markers and timers determine what is currently active.
Source/software review does not claim a full in-game playthrough.

## Verification

Validate all coordinates, artwork dimensions, source references, unique IDs,
quick bindings and visible return anchors. Keep the six existing BO7 map datasets
and all 229 pre-map MW3 anchors. Verify all five views, category/search behavior,
random-location qualifications, saved settings, map-to-guide return, direct links,
image-failure fallback, desktop/phone layout and actual Electron. Run the full
suite, production build and native checks before the existing automatic GitHub
and Vercel publication flow; verify live assets and the packaged app afterward.

Completed on 9 October 2026:

- Five 4096×4096 maps contain **445 references**: Urzikstan 338; Al Bagra 27;
  Sa'id City 29; Zarqwa 21; Al Mazrah City/Highrise 30. Urzikstan's default overview
  shows 41 key locations. The datasets define 62 targets and 52 quick/full step
  bindings; 19 cross-guide links locate portal and upgrade activities in Urzikstan.
- **281 automated tests pass**, including independent coordinate evidence,
  artwork hashes/dimensions, all dataset references, uncertainty/eligibility,
  existing BO7 maps, grid preferences and all 229 pre-map MW3 anchors.
- Six focused browser/native flow groups pass without runtime errors: five lazy
  map views, pan/zoom and keyboard input, search/grid/preferences, Quick/Full guide
  returns and focus, seasonal/direct/legacy links, image failure/retry, and real
  Electron pointer input and minimum sizing. The native integration suite also
  passes all ten groups.
- The production build, 204-page SEO check and Windows v1.7.0 installer/ZIP build
  pass. Nine desktop/phone/native feature captures were reviewed; the fresh finish
  reviewer returned **ship**, with no material fixes in the changed map interface.

The interaction checks also found and fixed an initial lazy-map scroll issue and
double encoding of map-target hashes. Map-ready layout now receives its final
entry scroll, reading covers stay outside Map view, new links let the router encode
once, and the decoder preserves the older double-encoded map bookmark format.
