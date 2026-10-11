# Classic map image and layout source research

Reviewed **11 October 2026** against `shared/catalogue.json`. Planning research only; no application files or map image assets were changed.

This scope contains **41 entries: 4 WaW, 11 BO1, 12 BO2 and 14 BO3**, including eight Zombies Chronicles editions. All currently have `interactiveMap: false`. They represent **22 candidate geometry families**, including Dead Ops Arcade, rather than 41 unrelated base drawings.

The [structured manifest](classic-sources.json) contains one record per catalogue entry, 26 source records and **42 exact image links** observed in source HTML/posts. Edition and mode remain separate. A geometry family is a reuse candidate that requires comparison, not permission to share POIs.

## Findings

**Origins is the strongest pilot candidate.** An original creator posted an annotated overview and explicitly permitted reuse with credit. Image resolution, baked labels, interior coverage and calibration still need inspection.

**TranZit has a strong primary reference:** the BradyGames/Pearson supplement includes a regional overview and local plans for Bus Terminal, Diner, Farm, Power Station and Town. They can inform mode-map subsets after playable bounds and POIs are validated. No reuse license was found in the inspected PDF material.

**Verrückt has identifiable original 2009 two-floor drawings** by Sir Cool Whip, but Flickr marks them All rights reserved. **Henry / Hazzman's COD Zombified** provides substantial annotated room-plan series for BO2/BO3. These are valuable topology references; permission, image inspection and consistent-scale assembly remain work.

**Nacht, Shi No Numa and Ascension have unresolved source gaps. Dead Ops Arcade needs an arena-index approach**, not one continuous tactical map. No source was invented to fill a gap.

## Evidence standard

- Observed source page/image link means the page or HTML contained the exact URL. It does not establish decoded dimensions, pixels, complete coverage or accuracy.
- Search lead means indexed results named a likely image but original attribution/access is unresolved. It is not an acquired base.
- Permission pending means no affirmative image-use grant was observed. Public availability, free PDF download and wiki text licensing were not treated as image reuse permission.
- Image kinds distinguish annotated schematics, room plans, publisher PDF diagrams and text references. Logos, cover images and ordinary game photographs were excluded from overhead-map coverage.
- No remote map image assets were downloaded or installed. Remote pixel-level inspection and calibration remain pending. HTML dimensions are labelled as such.
- Existing local Origins red-dig imagery is supporting media, not a clean tactical base.

## Per-entry coverage

| Guide ID | Edition / variant | Status | Sources | Floors, regions and states |
|---|---|---|---|---|
| `waw-nacht-der-untoten` | World at War | source-gap-floor-plan-leads-only | [nacht-fandom-lead](#nacht-fandom-lead), [nacht-guide](#nacht-guide) | Ground floor and upstairs; two alternative routes upstairs and door costs. Doors and blockers; no continuous world movement. |
| `waw-verruckt` | World at War | two-floor-candidate-rights-pending | [sir-cool-whip-verruckt](#sir-cool-whip-verruckt) | Ground and first floor, left/right starting wings and power-room join. Split spawn and doors/power connections. |
| `waw-shi-no-numa` | World at War | source-gap-legacy-link-unverified | [shi-no-numa-legacy](#shi-no-numa-legacy) | Two-floor main hut, four surrounding huts and swamp paths. Randomized perk hut assignment; trap/zipline paths and candidate spawn groups. |
| `waw-der-riese` | World at War | annotated-candidate-rights-pending | [cz-der-riese](#cz-der-riese) | Factory yards, upper catwalks/rooms, teleporter bays and furnace area. Power, linked teleporters, barriers and Pack-a-Punch access. |
| `bo1-nacht-der-untoten` | Black Ops | source-gap-floor-plan-leads-only | [nacht-fandom-lead](#nacht-fandom-lead), [nacht-guide](#nacht-guide) | Ground floor and upstairs; two alternative routes upstairs and door costs. Doors and blockers; no continuous world movement. |
| `bo1-verruckt` | Black Ops | two-floor-candidate-rights-pending | [sir-cool-whip-verruckt](#sir-cool-whip-verruckt) | Ground and first floor, left/right starting wings and power-room join. Split spawn and doors/power connections. |
| `bo1-shi-no-numa` | Black Ops | source-gap-legacy-link-unverified | [shi-no-numa-legacy](#shi-no-numa-legacy) | Two-floor main hut, four surrounding huts and swamp paths. Randomized perk hut assignment; trap/zipline paths and candidate spawn groups. |
| `bo1-der-riese` | Black Ops | annotated-candidate-rights-pending | [cz-der-riese](#cz-der-riese) | Factory yards, upper catwalks/rooms, teleporter bays and furnace area. Power, linked teleporters, barriers and Pack-a-Punch access. |
| `bo1-kino-der-toten` | Black Ops | annotated-candidate-rights-pending | [cz-kino](#cz-kino) | Lobby/balcony, theater/backstage, rooms/alley, disconnected projection room. Doors, teleporter link and return path. |
| `bo1-five` | Black Ops | annotated-candidate-rights-pending | [cz-five](#cz-five) | Offices, War Room and labs; Pack-a-Punch panic-room inset. Elevators, teleporters and DEFCON state. |
| `bo1-ascension` | Black Ops | source-gap-image-type-and-provenance-unresolved | [ascension-fandom-lead](#ascension-fandom-lead), [ascension-gameranx](#ascension-gameranx), [ascension-guide](#ascension-guide) | Centrifuge lower/upper floor, outside yards, lander platforms and rocket/Pack-a-Punch area. Lander route links and rocket-launch access. |
| `bo1-shangri-la` | Black Ops | annotated-candidate-rights-pending | [cz-shangri-la](#cz-shangri-la) | Surface and underground tunnels/cave; waterslide and minecart connections. Eclipse quest state, traversal direction and variable perk assignments. |
| `bo1-moon` | Black Ops | annotated-candidate-rights-pending | [cz-moon](#cz-moon) | Separate Earth/No Man's Land inset plus Moon spawn/tunnels/labs/biodome. Excavator affected zones, airlock connections and spawn-alternating Earth perks. |
| `bo1-call-of-the-dead` | Black Ops | annotated-candidate-rights-pending | [cz-call-of-dead](#cz-call-of-dead) | Beach, ship decks, multi-floor lighthouse and connecting routes. Pack-a-Punch possible sites, moving George, ziplines and flinger paths. |
| `bo1-dead-ops-arcade` | Black Ops | no-single-base-map-found | [dead-ops-guide](#dead-ops-guide) | Sequence of distinct arcade arenas, not a single connected round-based location. Arena/round progression. |
| `bo2-tranzit` | Black Ops II | publisher-pdf-candidate-rights-pending | [pearson-tranzit](#pearson-tranzit) | Regional bus loop plus local terminal, diner, farm, power station and town floor detail. Bus route, fog connections, buildables, doors and per-run candidates. |
| `bo2-bus-depot` | Black Ops II / bus-depot | publisher-pdf-candidate-rights-pending | [pearson-tranzit](#pearson-tranzit) | Terminal area only; PDF page 2, printed 276–277. Survival bounds and blockers; no automatic TranZit power/perk/buildable layer. |
| `bo2-town` | Black Ops II / town | publisher-pdf-candidate-rights-pending | [pearson-tranzit](#pearson-tranzit) | Town Center only; PDF page 4, printed 280–281. Separate supported Survival/Grief mode overlays; validate doors, weapons and perks. |
| `bo2-farm` | Black Ops II / farm | publisher-pdf-candidate-rights-pending | [pearson-tranzit](#pearson-tranzit) | Farm, house and barn levels only; PDF page 3, printed 278–279. Separate supported Survival/Grief mode overlays; validate bounds and doors. |
| `bo2-diner` | Black Ops II / diner | publisher-pdf-candidate-rights-pending | [pearson-tranzit](#pearson-tranzit) | Diner/garage area only; PDF page 3, printed 278–279. Turned mode bounds/spawns; do not label this as normal round-based Survival despite catalogue grouping. |
| `bo2-nuketown-zombies` | Black Ops II | annotated-candidate-rights-pending | [cz-nuketown](#cz-nuketown) | Street/courtyard and two house floors/backyards. Random perk and Pack-a-Punch landing sites; house blockers. |
| `bo2-die-rise` | Black Ops II | partial-room-series-rights-pending | [cz-die-rise](#cz-die-rise) | Two distinct high-rise buildings, many floors and upside-down rooms. Elevators change level; one-way drops and jumps need directed links. |
| `bo2-mob-of-the-dead` | Black Ops II | partial-room-series-rights-pending | [cz-mob](#cz-mob) | Cell floors, cafeteria, showers, citadel tunnels, docks, infirmary, roof and detached bridge. Afterlife-specific routes/switches, gondola and plane travel. |
| `bo2-cell-block` | Black Ops II / Cell Block | partial-room-series-rights-pending | [cz-mob](#cz-mob) | Restricted prison Grief subset; source series is the larger Mob of the Dead. Dedicated Grief bounds/rules/POIs; no automatic Afterlife, plane or bridge layers. |
| `bo2-buried` | Black Ops II | overview-and-room-series-rights-pending | [cz-buried](#cz-buried) | Surface start, underground town, building interiors/upper levels, manor and maze/Pack-a-Punch. One-way entry, breakable barriers and changeable maze arrangement. |
| `bo2-borough` | Black Ops II / Borough | overview-and-room-series-rights-pending | [cz-buried](#cz-buried) | Restricted Buried Grief subset and accessible interiors. Dedicated Grief bounds/rules/POIs; don't inherit inaccessible manor/maze content. |
| `bo2-origins` | Black Ops II | creator-permission-candidate-technical-review-pending | [zedz-origins](#zedz-origins), [glitching-queen-origins](#glitching-queen-origins) | Surface trenches/tank route, bunker/staff tunnels, excavation levels, church and Crazy Place inset. Snow-dependent digs, candidate part spawns, robot paths and realm access. |
| `bo3-shadows-of-evil` | Black Ops III | partial-room-series-rights-pending | [cz-shadows](#cz-shadows) | Easy Street/Junction and three districts with high streets, ritual rooms and Rift. Beast-mode traversal/interaction, train routes and portal connections. |
| `bo3-the-giant` | Black Ops III / The Giant | annotated-candidate-rights-pending | [cz-der-riese](#cz-der-riese) | Factory yards, upper catwalks/rooms, teleporter bays and furnace area. Power, linked teleporters, barriers and Pack-a-Punch access. |
| `bo3-der-eisendrache` | Black Ops III | partial-room-series-rights-pending | [cz-der-eisendrache](#cz-der-eisendrache) | Courtyards, rooms, undercroft/crypt, teleporter room and detached rocket platform. Rocket-test hazard, teleporter links and quest-dependent access. |
| `bo3-zetsubou-no-shima` | Black Ops III | partial-room-series-rights-pending | [cz-zetsubou](#cz-zetsubou) | Island paths, Lab A/B platforms, bunker, underwater paths, spider area and boss access. Temporary lab power, permanent bunker power, water types and underwater traversal. |
| `bo3-gorod-krovi` | Black Ops III | multi-room-series-rights-pending | [cz-gorod](#cz-gorod) | Multi-storey buildings, operations bunker, streets, Dragon Command and separate hatchery. Dragon travel, fire hazards and hatchery lockdown state. |
| `bo3-revelations` | Black Ops III | annotated-candidate-rights-pending | [cz-revelations](#cz-revelations) | Connected fragments/islands, Nacht hub and separate Apothicon interior. Portal links, jump pads and quest-dependent interactions. |
| `bo3-nacht-der-untoten` | Black Ops III: Zombies Chronicles | source-gap-floor-plan-leads-only | [nacht-fandom-lead](#nacht-fandom-lead), [nacht-guide](#nacht-guide) | Ground floor and upstairs; two alternative routes upstairs and door costs. Doors and blockers; no continuous world movement. |
| `bo3-verruckt` | Black Ops III: Zombies Chronicles | two-floor-candidate-rights-pending | [sir-cool-whip-verruckt](#sir-cool-whip-verruckt) | Ground and first floor, left/right starting wings and power-room join. Split spawn and doors/power connections. |
| `bo3-shi-no-numa` | Black Ops III: Zombies Chronicles | source-gap-legacy-link-unverified | [shi-no-numa-legacy](#shi-no-numa-legacy) | Two-floor main hut, four surrounding huts and swamp paths. Randomized perk hut assignment; trap/zipline paths and candidate spawn groups. |
| `bo3-kino-der-toten` | Black Ops III: Zombies Chronicles | annotated-candidate-rights-pending | [cz-kino](#cz-kino) | Lobby/balcony, theater/backstage, rooms/alley, disconnected projection room. Doors, teleporter link and return path. |
| `bo3-ascension` | Black Ops III: Zombies Chronicles | source-gap-image-type-and-provenance-unresolved | [ascension-fandom-lead](#ascension-fandom-lead), [ascension-gameranx](#ascension-gameranx), [ascension-guide](#ascension-guide) | Centrifuge lower/upper floor, outside yards, lander platforms and rocket/Pack-a-Punch area. Lander route links and rocket-launch access. |
| `bo3-shangri-la` | Black Ops III: Zombies Chronicles | annotated-candidate-rights-pending | [cz-shangri-la](#cz-shangri-la) | Surface and underground tunnels/cave; waterslide and minecart connections. Eclipse quest state, traversal direction and variable perk assignments. |
| `bo3-moon` | Black Ops III: Zombies Chronicles | annotated-candidate-rights-pending | [cz-moon](#cz-moon) | Separate Earth/No Man's Land inset plus Moon spawn/tunnels/labs/biodome. Excavator affected zones, airlock connections and spawn-alternating Earth perks. |
| `bo3-origins` | Black Ops III: Zombies Chronicles | creator-permission-candidate-technical-review-pending | [zedz-origins](#zedz-origins), [glitching-queen-origins](#glitching-queen-origins) | Surface trenches/tank route, bunker/staff tunnels, excavation levels, church and Crazy Place inset. Snow-dependent digs, candidate part spawns, robot paths and realm access. |

## Geometry reuse and next actions

Keep separate marker manifests for every game edition and mode. Compare landmarks, room footprints and exits before sharing a calibrated base. The Giant/Der Riese, original/Chronicles maps and the TranZit/Grief subsets cannot be collapsed based solely on a shared setting.

| Geometry family | Edition caveat | Concrete next action |
|---|---|---|
| nacht-der-untoten | Do not add WaW perks or Pack-a-Punch. BO1 and Chronicles each need their own weapon/perk/GobbleGum treatment. | Resolve two floor-plan image files and author permission, or draw an original two-floor plan using independently verified gameplay. |
| verruckt | Original drawing is WaW 2009. Recheck room dimensions and all perk/weapon positions for BO1 and Chronicles. | Request Sir Cool Whip reuse/adaptation permission, obtain both original-resolution floor files, then compare three editions. |
| shi-no-numa | Only WaW/BO1/Chronicles geometry is in scope. Vanguard's additional dig site and Mobile Raid must not be substituted. | Resolve the original/current Zombie_3 image and creator, or author a new schematic with upper/lower main-hut insets. |
| der-riese | WaW and BO1 use separate weapon/perk/quest overlays; The Giant is only a geometry-reuse candidate. | Identify the underlying image author or create an original floor-separated diagram; calibrate shared geometry before reusing it. |
| kino-der-toten | Chronicles wall buys, perks, GobbleGum and quest collectibles require a BO3 overlay. | Inspect the four exact plan images, assign floors/insets, establish provenance, then build edition-specific markers. |
| five | Do not use BO4 Classified's changed spaces as Five geometry. | Inspect the linked multi-floor schematic and establish image provenance before deriving a base. |
| ascension | Chronicles title on an article does not validate its BO3 POIs; the Gameranx page lists original BO1 wall weapons. | Resolve the named gallery drawings and original creators; visually inspect BO_Ascension.jpg, accepting it only if actually a useful plan. |
| shangri-la | Chronicles geometry may be comparable but interaction and equipment overlays remain separate. | Inspect linked layout image and PDF provenance; split underground/above-ground paths so overlapping POIs remain unambiguous. |
| moon | BO1 and Chronicles need distinct POIs; don't flatten Earth and Moon into one physical scale. | Resolve original image author behind repost and inspect floors; design location selector plus hazard zones. |
| call-of-the-dead | BO4 Tag der Toten changes the layout and content; it is not interchangeable. | Verify full floor coverage and image creator; represent George as a mechanic/zone explanation, not a falsely fixed POI. |
| dead-ops-arcade | Dead Ops 1 must not inherit Dead Ops 2/3 arenas. | Defer the map button until an arena-index product with actual arena images and useful data is planned. |
| tranzit | Regional overview and local stop plans need different zoom/coordinate scopes. | Review PDF pixels, confirm reuse rights or author an original base, then calibrate regional and stop-level layouts. |
| nuketown-zombies | Do not borrow BO4 Alpha Omega underground expansion or multiplayer Nuketown unchanged. | Inspect image, establish provenance, and model landing positions as possible locations rather than fixed active machines. |
| die-rise | Floor 1 in a source title is ambiguous without building identity and explicit vertical order. | Collect all linked floor images, build tower-aware level IDs, validate edge connectivity, then author a consistent-scale base. |
| mob-of-the-dead | BO4 Blood of the Dead changes topology and content; it is not the same base. | Collect remaining room plans, fill bridge coverage, and assemble floor-specific navigation with Afterlife-state metadata. |
| buried | A static overview must not imply one permanently valid maze route. | Inspect overview and room plans; build towns/buildings first and model maze state separately. |
| origins | BO2 and Chronicles need separate POIs even when a common structural base passes comparison. | Use the credited Zedz candidate for first technical review; check pixel dimensions, legibility, baked labels and missing interiors before import. |
| shadows-of-evil | Room plans are annotated, not a calibrated seamless map. | Collect all creator district plans and author connected, consistently scaled floor diagrams with Beast/Human visibility rules. |
| der-eisendrache | Two spawn image parts alone are not a full castle plan. | Review the twelve named area layouts, establish creator permission, and map interiors and rocket platform as distinct levels/regions. |
| zetsubou-no-shima | Water/lab tags are independent of floor filters and item categories. | Collect linked lab/bunker/dock/AA plans, inspect completeness, and separately represent underwater and normal routes. |
| gorod-krovi | Fourteen plans cover a large subset but do not by themselves prove complete-map coverage. | Add Belsinki/department store/armory and hatchery coverage; unify scale and floors after permission and visual review. |
| revelations | Fragments of older maps do not justify reusing those complete original maps. | Inspect the three overview diagrams and distinguish abstract connection graph from geometric floor base; fill Apothicon detail. |

## TranZit publisher supplement crop inventory

[Primary Pearson PDF](https://ptgmedia.pearsoncmg.com/imprint_downloads/brady/colin/black_ops_2_zombies_supplement_11-12.pdf) has five PDF pages. Record both PDF and printed page numbers because the map pages are spreads.

| PDF page (1-based) | Printed pages | Coverage | Candidate relationship |
|---|---|---|---|
| 1 | 274–275 | Bus loop, five stops, key | TranZit regional overview |
| 2 | 276–277 | Bus Terminal, tunnel | TranZit detail; Bus Depot mode geometry |
| 3 | 278–279 | Diner, Farm, house/barn floors, Nacht landmark | TranZit detail; Diner Turned and Farm modes |
| 4 | 280–281 | Power Station, Town Center, cabin | TranZit detail; Town modes |
| 5 | — | Playing primer | Text reference, not base map |

Text/layout references were inspected; this research did not receive pixel-level PDF previews. Render the chosen pages, review actual resolution and labels, resolve usage, and recheck POIs. Cropped parent geometry does not establish mode equivalence.

## Source register

Long exact raster URLs and observed related-room page URLs are preserved in [classic-sources.json](classic-sources.json). Source pages below supply attribution context. Pending candidates are not ready for publication as complete interactive maps.

### cz-der-riese

[Der Riese layout](https://codzombified.blogspot.com/p/der-riese.html) — COD Zombified page by Henry / Hazzman; original image author not established. Type: **shared-family-schematic**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Classic repost; original diagram author unconfirmed. Candidate geometry for WaW, BO1 and The Giant, subject to comparison.

1 exact image link(s) recorded in JSON.

### cz-kino

[Kino der Toten room diagrams](https://codzombified.blogspot.com/p/kino-der-toten.html) — COD Zombified page by Henry / Hazzman; original image author not established. Type: **annotated-floor-plans**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Four linked plan images; need determine level and inset boundaries before choosing a base.

4 exact image link(s) recorded in JSON.

### cz-call-of-dead

[Call of the Dead layout](https://codzombified.blogspot.com/p/call-of-dead.html) — COD Zombified page by Henry / Hazzman; original image author not established. Type: **annotated-schematic**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Overview candidate; full lighthouse and ship floor detail still needs inspection.

1 exact image link(s) recorded in JSON.

### cz-shangri-la

[Shangri-La layout](https://codzombified.blogspot.com/2015/03/shangri-la-free-pdf-download-guide-from.html) — COD Zombified page by Henry / Hazzman; original image author not established. Type: **annotated-schematic**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Map-layout image linked by a classic guide/PDF post; original image authorship not established.

1 exact image link(s) recorded in JSON.

### cz-nuketown

[Nuketown Zombies layout](https://codzombified.blogspot.com/2015/03/nuketown-zombies-free-pdf-download.html) — COD Zombified page by Henry / Hazzman; original image author not established. Type: **annotated-schematic**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Whole arena candidate; perks and Pack-a-Punch are variable landing sites.

1 exact image link(s) recorded in JSON.

### cz-die-rise

[Die Rise floor-plan series](https://codzombified.blogspot.com/2013/01/die-rise-map-layout-call-of-duty-black.html) — Henry / Hazzman, COD Zombified (map-plan series author). Type: **annotated-room-plan-series**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Two main-post floor-one image variants; additional linked floors required.

2 exact image link(s) recorded in JSON.

### cz-mob

[Mob of the Dead room-plan series](https://codzombified.blogspot.com/2013/04/mob-dead-map-layout-call-of-duty-black.html) — Henry / Hazzman, COD Zombified (map-plan series author). Type: **annotated-room-plan-series**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Main post is spawn/cell block only; associated floors, docks and bridge must be assembled.

1 exact image link(s) recorded in JSON.

### cz-buried

[Buried overview and room-plan series](https://codzombified.blogspot.com/2013/07/general-map-layout-for-buried-zombie.html) — Henry / Hazzman, COD Zombified (map-plan series author). Type: **annotated-schematic**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Whole-level overview plus linked building interiors; elevation and maze state need separate treatment.

1 exact image link(s) recorded in JSON.

### cz-shadows

[Shadows of Evil room-plan series](https://codzombified.blogspot.com/2015/11/shadows-of-evil-map-layout-call-of-duty.html) — Henry / Hazzman, COD Zombified (map-plan series author). Type: **annotated-room-plan-series**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Exact base candidate captured for Easy Street spawn; linked district plans cover the remaining topology.

1 exact image link(s) recorded in JSON.

### cz-der-eisendrache

[Der Eisendrache room-plan series](https://codzombified.blogspot.com/2016/03/main-spawn-area-map-layout-der.html) — Henry / Hazzman, COD Zombified (map-plan series author). Type: **annotated-room-plan-series**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Two spawn-area parts captured; twelve named area pages form the wider source set.

2 exact image link(s) recorded in JSON.

### cz-zetsubou

[Zetsubou No Shima room-plan series](https://codzombified.blogspot.com/2016/06/zetsubou-no-shima-map-layout-main-spawn.html) — Henry / Hazzman, COD Zombified (map-plan series author). Type: **annotated-room-plan-series**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Main spawn image captured; labs, bunker and underwater routes need their linked plans.

1 exact image link(s) recorded in JSON.

### cz-gorod

[Gorod Krovi fourteen room plans](https://codzombified.blogspot.com/2016/09/gorod-krovi-14-map-layouts-for-tank.html) — Henry / Hazzman, COD Zombified (map-plan series author). Type: **annotated-room-plan-series**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Fourteen plan images for tank factory, supply depot, infirmary, operations bunker and Dragon Command; additional Belsinki/department store/armory pages needed.

14 exact image link(s) recorded in JSON.

### cz-revelations

[Revelations overview diagrams](https://codzombified.blogspot.com/2016/11/revelations-map-layout-call-of-duty.html) — Henry / Hazzman, COD Zombified (map-plan series author). Type: **annotated-schematic**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Three linked overview/abstract diagrams; portal graph and real floor geometry require separation.

3 exact image link(s) recorded in JSON.

### cz-moon

[Moon layout](https://codzombified.blogspot.com/2014/01/classic-zombie-map-layouts-from-from.html) — COD Zombified repost; original image author unconfirmed. Type: **annotated-schematic**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Classic BO1 overview; Earth/No Man's Land and lunar floors must remain distinct. Page credits an old ImageShack image, not a reusable license.

1 exact image link(s) recorded in JSON.

### cz-five

[Five floor layout](https://codzombified.blogspot.com/2014/01/classic-zombie-map-layouts-from-from.html) — COD Zombified repost; original image author unconfirmed. Type: **annotated-schematic**. Evidence: **source-page-and-exact-image-links-observed**. Usage status: **permission-not-established**.

Three-level Pentagon setting; elevator/teleporter connectivity must be explicit.

1 exact image link(s) recorded in JSON.

### pearson-tranzit

[BradyGames / Pearson Black Ops II Zombies supplement](https://ptgmedia.pearsoncmg.com/imprint_downloads/brady/colin/black_ops_2_zombies_supplement_11-12.pdf) — BradyGames / Pearson; licensed Call of Duty strategy-guide supplement. Type: **publisher-pdf-annotated-overview-and-floor-plans**. Evidence: **publisher-pdf-text-and-layout-references-observed**. Usage status: **no-reuse-license-observed**.

Primary publisher reference; crops are not separate mode maps. Confirm PDF rendering, resolution and rights before using a crop. Recheck POIs independently; a guide can contain errors.

### sir-cool-whip-verruckt

[Verrückt first and second floor drawings](https://www.flickr.com/photos/sir_cool_whip/albums/72157616015554759/) — Sir Cool Whip. Type: **two-floor-community-drawings**. Evidence: **creator-album-and-second-floor-page-observed**. Usage status: **all-rights-reserved**.

Original WaW-era author attribution is strong. Credit alone does not satisfy an all-rights-reserved image; ask for explicit reuse/adaptation permission if selecting it.

2 exact image link(s) recorded in JSON.

### zedz-origins

[HQ Origins map by ZedzDEMIZie](https://www.reddit.com/r/CODZombies/comments/6wh7nx/hq_map_i_made_to_celebrate_originss_4th_birthday/) — u/ZedzDEMIZie. Type: **annotated-community-overview**. Evidence: **creator-post-image-links-and-creator-permission-comment-observed**. Usage status: **creator-attribution-permission-observed**.

tQgsI94 is version 2 with wind domes and zombie-blood carts. Creator subsequently linked 9aPCMFq with golden dig spots. Informal creator permission is evidenced, not a Creative Commons license or a claim to third-party game rights. Prefer this candidate over unattributed reposts; inspect legibility and baked labels before import.

2 exact image link(s) recorded in JSON.

Creator permission: “Anyone is free to use it for whatever purpose they want as long as they credit me :)” Credit **u/ZedzDEMIZie** and link to the original post. Exact images: [version 2](https://i.imgur.com/tQgsI94.jpg) and [golden-dig update](https://i.imgur.com/9aPCMFq.jpg).

### glitching-queen-origins

[Origins red dig-site diagram already in repository](https://www.glitchingqueen.com/origins.html) — Glitching Queen (credit recorded in docs/chronicles-assets.json). Type: **special-purpose-annotated-location-diagram**. Evidence: **local-file-and-existing-asset-manifest-observed**. Usage status: **not-recorded-in-existing-manifest**.

Already used as Origins guide supporting media. It is a sixteen-red-dig-site specialist reference, not evidence of a clean reusable tactical base.

1 exact image link(s) recorded in JSON.

### nacht-fandom-lead

[Nacht der Untoten gallery floor-plan lead](https://callofduty.fandom.com/wiki/Nacht_der_Untoten) — Original image author unresolved. Type: **floor-plan-gallery-search-lead**. Evidence: **search-index-only-page-access-blocked**. Usage status: **unknown**.

Search index lists Downstair Floor-plan, Upstairs Floor-plan and Map overview. Exact file links, resolution and image-specific rights remain unresolved; not counted as an acquired base.

### nacht-guide

[BO1 Nacht der Untoten walkthrough](https://www.hxchector.com/call-of-duty-black-ops-walkthrough/nacht-der-untoten/) — hXcHector. Type: **text-gameplay-reference**. Evidence: **source-page-observed**. Usage status: **all-rights-reserved-footer**.

Useful original gameplay description, not a base-map image. Distinguish BO1 mechanics from WaW and Chronicles.

### shi-no-numa-legacy

[2009 Shi No Numa map discussion with linked map image](https://gamefaqs.gamespot.com/boards/944199-call-of-duty-world-at-war/49930908) — Forum post by R0yledge989; linked image author unconfirmed. Type: **legacy-map-image-link-unverified**. Evidence: **forum-post-and-exact-image-link-observed**. Usage status: **unknown**.

Potential original WaW loading-screen/overview source, not a confirmed high-resolution floor plan. Resolve the current original file and inspect before use.

1 exact image link(s) recorded in JSON.

### ascension-fandom-lead

[Ascension layout image-file leads](https://callofduty.fandom.com/wiki/Category%3AAscension_images) — Original image author unresolved. Type: **gallery-file-search-lead**. Evidence: **search-index-only-page-access-blocked**. Usage status: **unknown**.

Search index lists File:Ascension map.png and File:Acsension on Paper.PNG (spelling retained). No exact image URL or image-specific rights verified.

### ascension-gameranx

[Ascension walkthrough Map Layout section](https://gameranx.com/features/id/106907/article/call-of-duty-black-ops-3-zombie-chronicles-ascension-map-walkthrough-map-guide/) — Article by Dennis Patrick; image author unverified. Type: **image-type-unverified**. Evidence: **source-html-and-exact-image-link-observed**. Usage status: **unknown**.

Do not label this a usable overhead until pixels are inspected. Header says Chronicles but listed wall weapons include original BO1 entries, so it is not a reliable edition-specific marker dataset.

1 exact image link(s) recorded in JSON.

### ascension-guide

[Ascension guide by RusselRaZe](https://gamefaqs.gamespot.com/ps3/960188-call-of-duty-black-ops/faqs/62247) — RusselRaZe. Type: **text-gameplay-reference**. Evidence: **indexed-author-guide**. Usage status: **unknown**.

Original BO1 landmark/route reference, not an overhead-image source.

### dead-ops-guide

[Dead Ops Arcade walkthrough](https://gamefaqs.gamespot.com/ps3/960188-call-of-duty-black-ops/faqs/62778) — MKillBill. Type: **text-arena-sequence-reference**. Evidence: **indexed-author-guide**. Usage status: **unknown**.

Covers arena/round sequence; no suitable complete tactical base identified. An arena selector is a separate content project.

## Recommended acquisition order

1. **Origins pilot:** inspect both Zedz revisions, retain attribution and add missing underground/excavation/Crazy Place views. Author BO2 and Chronicles POIs separately.
2. **Small shared families:** Verrückt, Kino and Der Riese/The Giant test floors and edition overlays. Resolve image creators/permission and visually compare geometry. When reuse is unsuitable, author original diagrams from gameplay evidence.
3. **TranZit family:** establish PDF usage or use it as reference for original schematics. Add regional and local views, then separate mode bounds for Bus Depot, Diner, Farm and Town.
4. **Room-plan families:** gather the recorded additional COD Zombified pages for Die Rise, Mob, Buried and BO3 originals. Normalize scale, floors, room labels and connections. Fill detached-region gaps.
5. **Unresolved families:** resolve Nacht/Ascension gallery files and the Shi No Numa legacy link or queue original drawings. Plan Dead Ops separately as an arena selector.

## Implementation handoff

Before enabling a map, select a source/version; document usage and credit; acquire the final image(s); record actual dimensions and coordinate origin; define floor/region IDs and calibration landmarks; verify edition/mode geometry; and source each marker independently. Randomized items must show **possible spawn locations**, not all as active objects. Teleporters, floor changes, one-way drops and state-dependent routes need explicit metadata.

The inventory covers all 41 catalogue entries. **Acquisition, permission resolution, visual inspection, complete floor coverage and coordinates remain pending where stated.**

