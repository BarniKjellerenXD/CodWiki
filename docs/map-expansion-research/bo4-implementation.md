# BO4 regional map implementation

Seven BO4 guides now have original **partial regional schematics**, totaling **126 area markers and 180 guide targets / quick links**. These diagrams deliberately do not claim surveyed item positions or complete floor geometry. Tag der Toten remains a source gap.

| Guide | Area markers | Guide links | Drawn routes |
|---|---:|---:|---:|
| Voyage of Despair | 18 | 20 | 5 |
| Blood of the Dead | 19 | 36 | 6 |
| IX | 18 | 25 | 5 |
| Ancient Evil | 18 | 21 | 4 |
| Dead of the Night | 19 | 31 | 4 |
| Classified | 15 | 18 | 4 |
| Alpha Omega | 19 | 29 | 5 |

Regenerate only these owned datasets and artwork with `node scripts/build-bo4-maps.mjs`; use `--render` to regenerate Chrome screenshots under `bo4-previews/`. No catalogue, shared viewer, guide component or unrelated dataset is modified by the script.

## Evidence and boundaries

The accepted creator layouts in `modern-sources.json` remain useful research references, but their republication permission was unresolved. None of their pixels or geometry were copied or traced. The shipped SVGs use the shared original diagram renderer and the existing source-checked BO4 guide prose. The implementation's [machine-readable evidence](bo4-implementation.json) gives the exact guide step and text behind every one of the 33 route lines.

Solid lines mean a traversable **regional route**, often through omitted rooms; they do not assert direct door adjacency. Dashed lines mean the explicitly named elevator or teleporter connection. The Ancient Evil arrow represents the documented outbound Pegasus ride. Disconnected cards mean that this partial diagram makes no assertion about the intermediate route, not that the region is inaccessible.

All markers have `precision: "area"`; their coordinates place labels within schematic cards. Physical types such as power switch, Pack-a-Punch, workbench, part, code mechanism and transport remain separate from the named-area and activity sets. PaP candidate pedestals are described as candidates rather than multiple simultaneously active machines. Main-quest and side-quest activity membership may overlap a physical type.

Guide links are generated only when an instruction explicitly names a mapped region or has a manually reviewed service/quest-area binding. Broad terms such as “stage,” a character surname, and an unqualified “cauldron” are excluded from matching because they can refer to another location or a narrative state. Every emitted target has a real full-guide `guide-step-*` anchor and a matching existing quick-step ID. Root integration installs `ShowOnMap` links and regenerates the quick-link registry.

## Per-map limits

- **Voyage:** deck groups and five documented route links; Bridge/State Rooms/Lounge and Engine/Boiler are deliberately grouped. Interior stair routes, Galley detail and precise part spawns are incomplete. Flooded/drained states are explained without pretending to be new physical layouts.
- **Blood:** BO4-specific spawn buildings, Catwalk, prison, Warden region, waterfront and fast travel. Several floors are grouped. Citadel/Roof stair detail is not drawn. This is not a Mob of the Dead geometry reuse.
- **IX:** four tower regions, Temple, Pit and Flooded Crypt. Three floors per tower are grouped; bridge and underground corridor routes are compressed. Pit/Crypt door adjacency is not asserted.
- **Ancient Evil:** city and Dark Side groups with the documented Pegasus/ballista route. The full post-PaP teleporter network, shrine/item pin sets and separate boss islands are omitted.
- **Dead of the Night:** mansion, cellar and outside regions with explicit fireplace/forest/cemetery routes. This is the least complete connectivity drawing; unverified interior connections stay absent. Many candidate items remain guide photographs.
- **Classified:** office, War Room, labs, Panic Room and Groom Lake connections. Teleporter prerequisites are stated, including the changed Panic Room route after amplifier installation. BO1 Five data is not reused.
- **Alpha Omega:** surface and bunker region groups; player-placed Telepads are explicitly conditional. Exact house entrances, full bunker corridors, moving enemies and currently affected vents are not invented.
- **Tag der Toten:** unavailable. Call of the Dead art/POIs are not substituted for the expanded BO4 map.

## Verification

The generator validates source steps, region evidence, unique marker IDs, normalized bounds, target membership and every existing full-guide anchor. Its segment/rectangle geometry check rejects a route crossing an unrelated region card, which could falsely imply another connection. This caught the initial Alpha Omega drawing and was fixed before handoff.

All seven SVGs were rendered in installed Chrome and visually inspected at 1400 × 980. Region cards, route labels, transport distinctions and coverage notices are readable. A Blood of the Dead crossing-label overlap and an Ancient Evil overlong route label were repaired. Public files are local SVGs with `SOURCE.txt` attribution/evidence notices. Final datasets were separately checked against the shared physical type registry and the SVG dimensions used by the map tests.

These checks establish internally consistent diagrams and source-backed guide destinations. They do not substitute for full in-game route verification, nor make these schematics equivalent to the eight calibrated BO6 vector layers. Root integration performs the complete app tests and browser reader/map navigation checks.
