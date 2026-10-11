# BO4, Cold War and BO6 source research

Research date: 11 October 2026. See [modern-sources.json](modern-sources.json) for 19 guide-specific records with exact sources, layer keys, provenance and caveats.

## Strongest asset collection

[DECLASSIFIED](https://github.com/Miss-placed/DECLASSIFIED) publishes layouts for Cold War and BO6. The original Odinnh repository now contains only two HTML files; the maintained repository is **Miss-placed/DECLASSIFIED**. This distinction prevents building against an obsolete reference.

The research snapshot pins commit `e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0`. It contains 16 legacy SVG layouts (eight round-based layer files and eight Outbreak regions), three modern vector-source files, shared style/layer declarations and provenance documents. The [download manifest](downloaded-assets.json) records every saved file and hash. These are research files, not application code or production artwork. External source files have not been executed.

| Guide | Verified vector keys / source files | Remaining checks |
| --- | --- | --- |
| Liberty Falls | `libertyFalls` | Roof/bank access and geographic calibration |
| Terminus | `terminus_biolab`, `terminus_prison` | Island context, vertical transitions, boss space; a separate islands-only record has no overlay |
| Citadelle des Morts | `citadelle` | Floor composition and cellar coverage |
| The Tomb | `tomb` | Dark Aether Nexus versus tomb geometry |
| Shattered Veil | `shatteredVeil` | Mansion floors and underground spaces |
| Reckoning | `reckoning`, `reckoningBossArena` | Tower floors and teleporter relationships |
| Die Maschine | `dieMaschine`, `dieMaschine_underground` | State-dependent POIs and surface/facility registration |
| Firebase Z | `firebaseZ`, `firebaseZ_spawn` | Main base/village teleport connection |
| Mauer der Toten | `mauerDerToten`, `mauerDerToten_streets` | First key is underground despite its generic name; verify roof representation |
| Forsaken | `forsaken`, `forsaken_underground` | Separated spaces and teleport transitions |
| Outbreak | Alpine, Armada, Collateral, Duga, Golova, Ruka, Sanatorium, Zoo | Ruka silo interiors are not supplied by this legacy set |

The source repository declares MIT, with notices saved for current and legacy files. Review underlying imagery provenance separately; this is not a blanket rights claim for every game-derived asset. Layout completeness, independent spatial accuracy and marker correctness have not been established merely by downloading source.

[WZHUB's directory](https://wzhub.gg/map/bo6-zombies) provides an alternative for all six BO6 maps. Exact provider links were followed and are recorded in the JSON. Their client-rendered geometry was not visually inspected through that provider in this pass, and no reuse license was established. Some URLs use `/mwz` even for BO6; retain observed URLs rather than guessing normalized slugs.

## BO4 original creator references

| Guide | Specific candidate | Evidence / limitation |
| --- | --- | --- |
| Dead of the Night | [PvtLoganator](https://www.reddit.com/r/CODZombies/comments/adh173/i_made_a_map_layout_for_dead_of_the_night/); [credited mirror with Sandkastles alternative](https://codzombified.blogspot.com/2019/03/dead-of-night-map-layout-black-ops-4.html) | Creator collection links and mirror image URLs verified; direct Reddit fetch failed |
| IX | [PvtLoganator](https://www.reddit.com/r/CODZombies/comments/af90as/just_finished_my_map_layout_for_ix/); [DownieHoofd projection via credited mirror](https://codzombified.blogspot.com/2019/03/ix-map-layout-for-call-of-duty-black.html) | Need orthographic/floor separation; do not pin onto perspective artwork as if it were spatially calibrated |
| Voyage of Despair | [TRPG_ original complete map](https://www.reddit.com/r/CODZombies/comments/9ztkzk/voyage_of_despair_complete_map_with_location/) | Original post opened; author offers full PNG and vector PDF archive. PDF archive landing page resolves; actual file inspection remains |
| Blood of the Dead | [PvtLoganator](https://www.reddit.com/r/CODZombies/comments/ae5hjm/as_requested_here_is_the_map_layout_for_blood_of/); [credited image mirror](https://codzombified.blogspot.com/2019/03/blood-of-dead-map-layout-call-of-duty.html) | Creator-linked source and image URLs verified; no unchanged Mob-of-the-Dead data reuse |
| Ancient Evil | [PvtLoganator original](https://www.reddit.com/r/CODZombies/comments/b8vtvk/finally_got_to_play_ancient_evil_yesterday_so_ive/); [RayPoopertonIII annotated edition](https://www.reddit.com/r/CODZombies/comments/cry59h/ancient_evil_detailed_map_fanart_feedback_welcome/) | Posts opened. Comments identify potential missing/misplaced item positions; cross-check markers independently |
| Alpha Omega | [PvtLoganator original](https://www.reddit.com/r/CODZombies/comments/chax94/two_weeks_overdue_but_here_it_is_my_map_layout/) | Creator, image link and collection references directly observed; surface/bunker needs separate review |
| Classified | [PvtLoganator](https://www.reddit.com/r/CODZombies/comments/afmoyd/and_as_promised_here_is_my_map_layout_for/); [credited mirror](https://codzombified.blogspot.com/2019/03/classified-map-layout-call-of-duty.html) | Pentagon floors and Groom Lake; Five is a different edition/layout |
| Tag der Toten | No adequate spatial source verified | Route diagrams, environment screenshots and local lava-state image are not overhead maps; Call of the Dead does not substitute |

No express republication permission was located for these BO4 creator drawings. Preserve credit and contact/permission status in authoring records. Do not silently promote a creator-linked or mirrored candidate to a visually reviewed or cleared asset.

Voyage download links observed in the creator's post: [PNG](https://www.dropbox.com/s/vte5m2kodbfmbdr/vod_fullmap.png?dl=0) and [PDF ZIP landing page](https://www.dropbox.com/scl/fi/8ei5u3xct828ez09aufxg/vod_fullmap.zip?rlkey=gi256m64egtx4zf3hassk55hq&dl=0). The PNG fetch failed in the web reader. They are acquisition leads, not downloaded production assets.

## Local material that must not be mistaken for a layout

`app/data/mapArtwork.json` describes homepage cover art. Cold War Outbreak's local radios/monkeys/projectors and mask references are already useful evidence, but their pins/annotations are baked into the images. BO4 Tag's lava-state image is a gameplay screenshot. Use those references for individual locations and conditions; do not automatically register them as full basemaps.
