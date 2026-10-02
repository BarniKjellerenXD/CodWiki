# BO6 implementation and verification

Verified 2026-10-02. This extends the incumbent BO4/BO7 guide and puzzle workflow to all six BO6 round-based maps, covering Standard-mode setup, equipment, main quests, bosses and documented side activities.

## Implemented coverage

Counts below come from `shared/bo6-guides.mjs` and image-extension files in the six `public/images/bo6-*` directories. Side sections can contain several activities.

| Map | Main steps | Side steps | Side sections | Local images |
| --- | ---: | ---: | ---: | ---: |
| Liberty Falls | 18 | 17 | 7 | 50 |
| Terminus | 22 | 22 | 8 | 54 |
| Citadelle des Morts | 29 | 15 | 7 | 54 |
| The Tomb | 20 | 27 | 7 | 45 |
| Shattered Veil | 22 | 11 | 7 | 22 |
| Reckoning | 23 | 19 | 6 | 32 |
| **Total** | **134** | **111** | **42** | **257** |

There are **245 detailed steps** and **14 tools**. Nine tools use custom controls: Terminus lab, Strauss Counter, Aetherella photos, Raven rings, Citadelle bottle/book symbols, Tomb gateway glyphs, Shattered Veil cipher, Reckoning elements and Reckoning archive files. Five use the existing generic renderer: vault code, Nathan code, knight/orb progress, Tomb trials and Tomb vases. The 257 images comprise 104 launch-map images, 99 Citadelle/Tomb images and 54 later-map images; the two launch `sources.json` files are metadata, not images.

Authoring remains in `shared/bo6-launch.mjs`, `shared/bo6-castle-tomb.mjs` and `shared/bo6-dlc.mjs`, aggregated by `shared/bo6-guides.mjs`. The existing generator produces guide/tool routes, Quick Parts, detailed components, search entries and catalogue/desktop navigation. Edit these authored modules and regenerate; do not edit generated BO6 Vue pages or JSON directly. Tool observations must be declared in their metadata `fields` to survive saved-state normalization.

The implementation preserves stable phase/step IDs, Quick Parts / Full Details, contextual helpers, device-local progress, undo/reset and shared inline/full-page state. It uses the existing typography, gold/orange tokens and guide/workbench patterns. BO6 location guidance uses real local screenshots; no new interactive-map dataset or generated gameplay imagery is introduced.

## Sources and design decisions

The selected direction and alternatives remain in [the guide plan](bo6-guide-plan.md). Source disagreements, mechanics and original image credits are recorded in [launch research](bo6-launch-research.md), [Citadelle/Tomb research](bo6-castle-tomb-research.md) and [Shattered Veil/Reckoning research](bo6-dlc-research.md).

Per-asset provenance is retained in [Liberty Falls sources](../public/images/bo6-liberty-falls/sources.json), [Terminus sources](../public/images/bo6-terminus/sources.json), [Citadelle/Tomb assets](bo6-castle-tomb-assets.json) and [later-map assets](bo6-dlc-assets.json). Photographic symbols retain their source pixels; example screenshots do not supply a player's randomized answer.

## Software verification

- Final full test suite: **126 passed, 0 failed**, none skipped or cancelled. Evidence: `.impeccable/review/tests-final.txt`.
- Final production build completed successfully. Evidence: `.impeccable/review/build-final.txt`, ending with the Nitro preview command and `Build complete!`.
- BO6 tests cover all 216 lab input combinations, Raven mappings, all 56 three-rock combinations, source-image crop bounds, cipher validation, element leading zeros, archive chronology, unique IDs/anchors, catalogue/search/tool associations, local image signatures and saved-state/reset isolation.
- Final review corrected photographic clipping and Tomb trial counting: a recorded return gateway is an observation and does not count toward the eight confirmed actions. The independent finish review returned **PASS**, with no unresolved material findings.

The successful build still reports the optional `pigpen-cipher.ttf` reference, plugin timing diagnostics and dependency export deprecations. The existing OTF is present. These warnings are retained in the build log.

## Browser verification

Local production browser checks used desktop **1440 × 1000** and mobile **390 × 844** viewports. The 390px route smoke check covered all six guides and fourteen tool pages: **20/20** had their expected heading, no horizontal overflow and no broken images among those loaded during the check. Evidence: `.impeccable/review/route-smoke.json`. The checked production-server warning/error log filter was empty.

| Interaction | Observed result |
| --- | --- |
| Terminus: X = 22, Y = 0, Z = 11 | Three entries: **55, 17, 11**; reload restored selections and undo worked. Opening the inline helper in Full Details restored the same state. |
| Raven: two-headed bird skull | **Air / Gemini**, with isolated photographic symbols and bottom-pointer instructions. |
| Citadelle symbols | Ram horns could be recorded in Bottle I; switching to the book stage displayed its separate controls. |
| Tomb: glyphs 1, 5 and 8 | Matching gateway cells highlighted; selection limited to three. |
| Shattered Veil: YETI; clusters E / BCDSTVWXZ / OUY / AI | **3192**. |
| Reckoning: badge, scarf, watch, katana | Chronological code **6342**. |
| Reckoning elements: He; explicit single-letter C | **002** and **006**, respectively. |
| Liberty Falls | Side-section navigation worked; changing a Strauss reading cleared that location's confirmation. |

Final desktop/mobile screenshot review covered Terminus, Raven, Tomb and Citadelle symbols, plus the Shattered Veil, Reckoning and Liberty Falls quick/side views. Evidence is in `.impeccable/review/`, including `terminus-final-*`, `raven-final-*`, `tomb-final-*`, `citadelle-symbols-final-*` and `inline-lab-final.png`. The inline Terminus check found 36 unique SVG clip IDs across the hidden Quick Parts and visible Full Details instances.

These are source, software and bounded browser checks. No full in-game playthrough, performance benchmark or deployment was performed. Lazy images outside the checked loaded states and future gameplay patches are outside these verification results.
