# AW, IW, WWII, Vanguard and Unstable Rift map-source research

Reviewed 11 October 2026. Planning only; no application code or map images added.

The manifest [other-sources.json](./other-sources.json) contains one row for each of the **25 current guide IDs** in this scope, checked against `docs/remaining-games/maps.json` and the retained edition metadata in `shared/planned-maps.mjs`.

**12 guides have an actual image reference observed in a source page, one has a creator-post search lead, and 12 have no usable overhead located in this research pass.** There are 19 unique direct image references and 44 related regional-layout page links. These are acquisition candidates, not production-ready map assets. “No overhead found” means this research did not locate one; it does not establish that none exists.

## Evidence levels and limits

- **Page-verified image candidate:** the source page/HTML actually contains the recorded image URL in a map section. Completeness, calibration and visual quality are still unverified.
- **Regional drawing candidate:** a creator has drawn an area or floor. A set of drawings may cover a level, but their separate scales/orientations cannot be assumed to form one continuous map.
- **Search lead:** a relevant result was found but the underlying image or creator could not be inspected.
- **Reference only:** a guide screenshot, puzzle, in-game schematic or route graph; these must not be advertised as a usable overhead.
- All reuse/derivative permissions remain **unknown** unless later documented. A credit line, source download button or public URL does not establish a license.

External browser inspection failed with the environment's MXC G: volume error. The web tool also could not display Steam image endpoints. Consequently remote images are explicitly **visual-review pending**. Source HTML was read successfully, and all seven listed local images were visually inspected. No uncertain remote image was downloaded.

## Recommended source families

**COD Zombified / Henry (“Hazzman”) is the best original-creator lead for all four AW and all four Vanguard guides.** The creator publishes regional overhead drawings and often separates floors. The manifest records an actual full-size image link from each map's representative page and all 44 observed related layout pages:

| Guide | Edition | Source coverage observed | First candidate |
|---|---|---|---|
| `aw-outbreak` — Outbreak | Havoc | 5 regional pages, including spawn, Administration, Holding, Exo Testing and Morgue | [Holding Room](https://codzombified.blogspot.com/2015/01/call-of-duty-advanced-warfare-exo_28.html) |
| `aw-infection` — Infection | Ascendance | 6 regions: Hoard More, Value Voltage, Atlas Command, upper/lower Sewers, Burger Town | [Burger Town](https://codzombified.blogspot.com/2015/04/burger-town-map-layout-for-infection.html) |
| `aw-carrier` — Carrier | Supremacy | 7 pages: spawn, Armory, Bio Lab, Cargo, Hangar, Lift, Moon Pool | [Spawn](https://codzombified.blogspot.com/2015/06/carrier-exo-zombies-map-layout-call-of.html) |
| `aw-descent` — Descent | Reckoning | 8 pages: Landing, Reception/Promenade, Concierge/Great Hall, Galleria, Spa, Lounge, Tidal Generator, Annex | [Galleria](https://codzombified.blogspot.com/2015/08/galleria-map-layout-for-descent-exo.html) |
| `vanguard-der-anfang` — Der Anfang | Launch plus later content | 4 hub-region pages; portal destinations still need separate coverage | [Apartments](https://codzombified.blogspot.com/2021/11/der-anfang-map-layout-apartments-area.html) |
| `vanguard-terra-maledicta` — Terra Maledicta | Season 2 | 4 Egypt-region pages; portal/Dark Aether destinations separate | [Temple](https://codzombified.blogspot.com/2022/02/terra-maledicta-temple-area-map-layout.html) |
| `vanguard-shi-no-numa` — Shi No Numa | Season 4 | 6 pages: main hut, Doctors, Fishing, Storage, Comm Room, new Dig Site | [Main hut floors](https://codzombified.blogspot.com/2022/06/shi-no-numa-main-spawn-map-layout-call.html) |
| `vanguard-the-archon` — The Archon | Season 5 | 4 Egypt-region pages; Kortifex/Dark Aether arena separate | [Temple](https://codzombified.blogspot.com/2022/09/archon-map-layout-temple-area-call-of.html) |

Do not use these eight guide IDs to imply eight complete single-image maps. The safest first implementation would use an area/floor selector for the creator's separate drawings. Only combine drawings after verifying scale, orientation, entrances and overlap.

The Archon needs its own geometry validation: the [creator's page](https://codzombified.blogspot.com/2022/09/archon-map-layout-temple-area-call-of.html) describes closed connections compared with Terra Maledicta and a moved Pack-a-Punch. Shared artwork with only changed markers would therefore be unsafe.

## Infinite Warfare

| Guide | Edition | Result and concrete candidate |
|---|---|---|
| `iw-zombies-in-spaceland` | Launch | [ZombieSlaya Mr.'s Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2462403426) explicitly introduces a map image; exact image URL is in the manifest. Check surface park, tunnels, projector room and Afterlife space independently. A [secondary host](https://www.zombiescodex.com/infinite-warfare/zombies-in-spaceland/) labels a 2048 × 1268 image “Layout,” but its original provenance is unresolved. |
| `iw-rave-in-the-redwoods` | Sabotage | [ZombieSlaya Mr.'s Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2589580023) explicitly introduces a map image. Check the lodge floors, mines, boat, Turtle Island and projector/boss spaces. Rave mode should condition markers rather than duplicate the physical map. |
| `iw-shaolin-shuffle` | Continuum | [Elliot's Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2644508979) has an image under “Map Layout.” Check rooftops, subway and lair; original graphic creator is not established by the guide-author name. |
| `iw-attack-of-the-radioactive-thing` | Absolution | No usable overhead located. The [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2711831705) explicitly says it does not supply a map layout. This is a capture/original-cartography backlog item unless a better asset is found. |
| `iw-the-beast-from-beyond` | Retribution | No usable overhead located. Existing [mmmrkennedy guide](https://mmmrkennedy.com/games/IW/the_beast_from_beyond/the_beast_from_beyond_guide) supports location research. Station, cinema, cryptid arena and Mephistopheles must not be placed on a fictitious continuous plane. |

A useful extraction detail: the Rave Steam guide's first large image is introductory material. The actual map comes **after** the explicit “Below is a map…” caption. The manifest records the latter; do not use the first image automatically.

## WWII

| Guide | Edition | Result and next action |
|---|---|---|
| `ww2-the-final-reich` | Launch | [Original-looking creator post](https://www.reddit.com/r/CODZombies/comments/17xkm7o) titled “Celebrating the release of my Final Reich guides on YouTube by posting my map layout!” found through search. Reddit fetch failed; creator and actual image URL unresolved. Strong lead, not a verified asset. Need town/bunker layers and boss-space coverage. |
| `ww2-groesten-haus` | Bonus survival | No usable overhead located. [CODZombie](https://www.codzombie.com/atlas/groesten-haus) explicitly offers a not-to-scale route diagram. The [official Groesten Haus tour](https://www.callofduty.com/blog/archives/defend-this-haus-a-brief-tour-of-groesten-haus) is the Multiplayer edition, with different playable exterior boundaries; it is not the survival-map base. |
| `ww2-the-darkest-shore` | The Resistance | No usable overhead located. [CODZombie's atlas entry](https://www.codzombie.com/atlas/the-darkest-shore) is explicitly a route diagram. Need verified beach/cliff/bunker geometry and minecart links. |
| `ww2-the-shadowed-throne` | The War Machine | Existing projector screenshot is a coarse regional schematic. A [secondary Layout image](https://www.zombiescodex.com/world-war-ii/the-shadowed-throne/) at 1040 × 658 is an unreviewed lead; might also be a schematic. Do not treat the regional puzzle map as detailed streets/building floors. |
| `ww2-the-frozen-dawn` | Shadow War | No usable overhead located. Existing “orrery_map” is a puzzle photo, not geometry. Use [guide references](https://mmmrkennedy.com/games/WW2/the_frozen_dawn/the_frozen_dawn_guide) for later capture/calibration. |
| `ww2-into-the-storm` | The Tortured Path ch. 1 | No usable overhead located. Potential shared geometry with Bodega Cervantes only after boundary/door review. Chapter objectives require their own marker set. |
| `ww2-across-the-depths` | The Tortured Path ch. 2 | No usable overhead located. Potential shared geometry with U.S.S. Mount Olympus; split ship decks and keep chapter objectives separate. |
| `ww2-beneath-the-ice` | The Tortured Path ch. 3 | No usable overhead located. Potential shared geometry with Altar of Blood; inspect sealed spaces and elevations. |
| `ww2-bodega-cervantes` | The Tortured Path survival | No usable overhead located. The same setting as Into the Storm, but survival lockers/Mystery Box and quest interactions differ. |
| `ww2-uss-mount-olympus` | The Tortured Path survival | No usable overhead located. [Existing survival guide](https://mmmrkennedy.com/games/WW2/the_tortured_path/survival_maps/uss_mount_olympus_guide) provides location references. |
| `ww2-altar-of-blood` | The Tortured Path survival | No usable overhead located. Keep its survival marker set independent from Beneath the Ice. |

The [Tortured Path guide](https://mmmrkennedy.com/games/WW2/the_tortured_path/the_tortured_path_guide) is a useful primary screenshot/location source for the three chapters, but is not an overhead asset. The six entries could eventually use three validated geometry families with independent chapter/survival overlays; that is a planning recommendation, not verified interchangeability.

## MW3 Unstable Rift

`mw3-unstable-rift` (Season 4 Reloaded) has **no arena overhead located**. The [official patch notes](https://www.callofduty.com/patchnotes/2024/05/call-of-duty-modern-warfare-iii-season-4-patch-notes) identify the separate escalating-wave challenge. Obelisk/entrance preparation occurs on Urzikstan; it is not the arena map.

Existing local `wzhub-m3267-1.jpg` is a first-person obelisk location screenshot from [WZHUB's Urzikstan marker](https://wzhub.gg/map/urzikstan/mwz?p=m3267). Prefer a contextual link to Urzikstan with the relevant obelisk filters selected until a true arena map is sourced. Do not reuse a seasonal Dark Aether map for this arena.

## Existing files named “map”: visual audit

All paths below are relative to `docs/remaining-games/`; exact page/image URLs remain in the JSON manifest.

| Asset | What the pixels actually show | Accept as interactive base? |
|---|---|---|
| `asset-0462-clown_map.webp` (Shadowed Throne) | In-game projected schematic, annotated with coarse area names | No; supporting region diagram only |
| `asset-0483-map.webp` (Shadowed Throne) | Church interior showing Brandenburg/Berlin puzzle board | No |
| `asset-0484-morse_map.webp` (Shadowed Throne) | Close-up of that geographic puzzle board with targets | No |
| `asset-0736-orrery_map.webp` (Frozen Dawn) | Orrery wall/photo with ball and room annotations | No |
| `asset-0068-war_room_map.webp` (Vanguard Shi No Numa) | Angled in-game region-map prop, partially obstructed by weapon; no detailed floors | No |
| `asset-1263-phone_morse_code_map.webp` (Shaolin) | Morse first-digit infographic, not geography | No |
| `wzhub-m3267-1.jpg` (Unstable Rift preparation) | First-person Urzikstan obelisk photo | No |

The Shaolin infographic visibly credits **/u/RayPoopertonIII**. The existing asset manifest credits only mmmrkennedy/game imagery. Before any reuse, resolve and preserve the original graphic credit; the host and image author are different facts.

## Acquisition and release recommendation

1. Review the three Steam map images and COD Zombified regional drawings at original resolution. Record pixel dimensions, legibility, watermarks, floor coverage and creator signatures; ask the original creator for a clean-layer version/reuse terms if needed.
2. Resolve permission or choose original validated cartography before copying/adapting external artwork. Retain creator marks. Keep exact source pages and source-image checksums in the eventual asset record.
3. Start these games with **IW Spaceland/Rave/Shaolin and the eight AW/Vanguard regional series**, subject to the gates above. A visible area selector is preferable to distorted stitching.
4. Resolve Final Reich's creator lead next. Keep Shadowed Throne as a schematic candidate until detailed geometry is confirmed.
5. Treat the remaining 12 unresolved entries as explicit research/capture work, not as automatic missing-content failures. A useful guide can link its nearest validated context map while clearly naming its coverage.
6. For each accepted map, verify every layer boundary, connector, jump/drop/portal, mode variant and representative marker against gameplay. Only then mark that guide as having an interactive map.

No contact messages were sent and no license was assumed. No application implementation was performed.
