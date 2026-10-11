# BO6 map implementation evidence

Implemented 2026-10-11 from the pinned [DECLASSIFIED repository](https://github.com/Miss-placed/DECLASSIFIED/tree/e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0). This is a community map import with reviewed guide bindings, not a claim that every quest or spawn is mapped.

| Dataset | Locations | Guide targets / quick links | Layers |
|---|---:|---:|---|
| `bo6-liberty-falls` | 130 | 30 | Town |
| `bo6-terminus` | 175 | 37 | Prison; Bio Lab & islands |
| `bo6-citadelle-des-morts` | 145 | 35 | Castle & village |
| `bo6-the-tomb` | 109 | 21 | Excavation & Dark Aether atlas |
| `bo6-shattered-veil` | 125 | 27 | Mansion & underground atlas |
| `bo6-reckoning` | 165 | 23 | Towers 1 & 2; Tower 3 boss atlas |
| **Total** | **849** | **173** | **8** |

## Reproduction and provenance

Run `node scripts/build-bo6-maps.mjs`. Add `--render` for Chrome/Playwright evidence images, or `--inspect` to regenerate only the source extraction and SVGs. The rendering option uses the existing desktop-app Playwright dependency and installed Chrome; the data conversion itself uses only the existing Babel parser.

- Revision: `e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0`.
- Existing research snapshot: `assets/declassified/src/data/maps/blackOps6Maps.tsx`, `sharedSVGProperties.tsx`, and repository `LICENSE`.
- Additional literal source files are under `assets/bo6-source/src/`. `source-manifest.json` records their source URLs, sizes, and SHA-256 hashes.
- `extracted-locations.json` preserves all **854** upstream records including source file, line, original ID, raw `[lat,lng]`, type reference and description.
- `artwork-manifest.json` records the eight shipped SVG hashes and exact source overlay keys/lines.
- Each public BO6 artwork directory contains `LICENSE.txt` and `SOURCE.txt`. The repository MIT notice credits Odinn H & Ben Ashley. No DECLASSIFIED icon images were copied; the shared local icon registry supplies UI symbols.
- Source modules are parsed as AST data, never imported or executed. Only known literal structures, `Item` definitions and `MiscMarker` constructor arguments are read. SVG tags are explicitly allowlisted, event attributes rejected, and external references rejected.

## Coordinate contract

The pinned `sharedSVGProperties.tsx` defines `ImageBounds = [[0,0],[512,512]]`; each BO6 `SVGOverlay` uses `viewBox="0 0 512 512"`. The map uses Leaflet `CRS.Simple`, and `MiscMapMarker` passes `loc` directly to `Marker.position`. Therefore the conversion is:

```text
x = original longitude / 512
y = 1 - original latitude / 512
```

The exported SVGs retain the **512 × 512** viewBox and geometry. JSX attributes become static SVG attributes, CSS spelling is corrected, and a lighter neutral floor palette improves contrast. White/black masks, transforms, paths, patterns, framing and geometry stay intact. No crop or rotation changes the projection. `focusBounds` for Liberty Falls and the Terminus prison changes only the starting viewport.

Terminus intentionally uses the source's two-layer model. Its `terminusIslands` identifier is an alias of `terminusBiolabs`, not a third artwork. Reckoning, Shattered Veil and The Tomb use source atlases with separate spaces arranged beside one another; that arrangement is explicitly described as an atlas rather than physical distance.

IDs use `dc-` plus the UTF-8 hex encoding of the original ID, preserving case and underscores without violating shared URL requirements. `sourceId` retains the original author ID. Every imported pin cites the exact pinned source file and line.

## Semantic review

Physical `typeId` is distinct from a guide activity: perk machines, Wunderfizz, Pack-a-Punch, generators, parts, music items, keys, traps, mechanisms, travel and hidden power-ups have separate leaves. Existing-compatible `category` values are retained. Perk machines explicitly carry `perkType: "machine"`; BO6 music headphones and Citadelle Peeks hide-and-seek collectibles are **not** BO7 Cursed Peeks.

The source's variable spawns use candidate availability. Moving PaP, roaming quest drops, approximate room searches, area-wide puzzles and source reference-only points receive area precision and explanatory text. Quiet overview membership is limited to essential services. Authored guide phases produce separate activity sets; these do not change a location's physical type.

Reviewed corrections include Terminus EMF Fob / Resonator pickup / Research Office computer naming, the Citadelle knight-salute order, the unfinished Stag urn description, and explicit limits on the Reckoning power-surge computer/switch coverage. Mystery Box sites are candidate locations, not promises of active boxes.

### Exclusions

`excluded-locations.json` records five withheld source records:

1. Terminus `da69a`: hard drive has no coordinate; the guide target instead highlights all four published tentacle-trap candidates.
2. Citadelle `OZOnd`: dropped stamp has no fixed position; only the real knight statues are linked.
3. Citadelle `1kPgF`: Ankh drop has no fixed position; the actual wood-bundle and ritual locations remain mapped.
4. Shattered Veil `Pk1Og`: no fixed blue-canister coordinate; four crystal candidates replace it.
5. Reckoning `Q6sId`: the source's “Floor 3” boss marker repeats a Floor 1 coordinate. It is excluded, and the layer note explains why no precise final-floor boss pin is supplied.

## Guide binding contract

All 173 quick links bind existing IDs from `shared/bo6-*.mjs`:

```text
quickLinks[stepId] = stepId
targets[].id = stepId
targets[].guideAnchor = "guide-step-" + stepId
```

The importer asserts that every quick step and matching full-guide anchor exists. Root integration adds the full-guide `ShowOnMap` links from these targets and regenerates the shared quick-link registry. No guide or shared UI files are owned by this importer.

Targets use `single`, `sequence`, `candidates`, or unnumbered `area` groups. Only prescribed traversal/order receives sequence numbering; candidate sets never imply all sites are active. Groups such as three LTG parts or six toys are unnumbered collections. Ordinary nonspatial combat advice and unsupported side activities have no invented map button.

## Verification and limits

- Successfully parsed all eight static SVGs with the same Vue DOM parser used by map tests; no XML processing header, scripts, foreign objects, external hrefs or event handlers are shipped.
- Validated every normalized coordinate, layer membership, safe ID, physical taxonomy entry, target membership and full-guide anchor. The import asserts unique normalized IDs and bounds before writing.
- Rendered all eight full SVGs in installed Chrome, reviewed the combined sheet, and individually inspected overlays with upstream quest IDs and perk pins. `assets/bo6-source/qa/artwork.png` shows the final palette; per-layer `*-pins.png` images are explicitly **raw-source** overlays and include the excluded duplicate-floor record for audit visibility.
- Examples checked visually: Liberty church/LTG/valve/Jet Gun landmarks, Terminus prison versus Bio Lab/islands, Citadelle swords and disconnected dungeon, Tomb murals versus Nexus statues, Shattered Veil mainframe versus mansion/liminal spaces, and Reckoning named room clusters and vault ordering.
- These checks establish correct source-to-artwork alignment and technical compatibility. They do not independently survey all 849 positions inside the game. Existing guide descriptions remain the procedural reference.
- Known incomplete coverage includes unmapped Reckoning optional side activities, final boss-floor pins, some small BO6 collectibles and optional quests. A single published boat-race start or power-surge computer does not claim the complete candidate set. No exact position was synthesized from vague prose.
- Proton Drive produced identical generated-file name-clash copies during writes. Their hashes matched the canonical artifacts before the two duplicates were removed. The importer now skips unchanged file writes to reduce sync churn.

App-wide tests and end-to-end reader/viewer checks are performed by the root integration after catalogue and guide generation; they are separate from the source/coordinate checks above.
