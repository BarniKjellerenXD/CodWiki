# Blood of the Dead guide revision

## Design choice

Three approaches were considered:

| Approach | Strength | Limitation |
| --- | --- | --- |
| Expand the shared text forms | Small change, familiar controls | Still asks players to describe symbols during a run |
| Separate full-screen quest companion | Plenty of space for each puzzle | Duplicates guide navigation and state |
| Specialized widgets within the existing guide | Pictures, practical controls, and the same saved observations inline or full-page | Requires dedicated interfaces for this map |

The third approach is implemented. The Morse helper accepts a digit, typed Morse, or dot/dash taps, then displays the arithmetic and a manual pulse cursor. Power House separates the Simon sequence, three steady generator symbols, observed monitor replacements, and confirmed lever pulls. No fixed generator-to-lever translation is encoded.

## Authored sources and generation

- `shared/blood-of-the-dead.mjs` owns the guide, quick summaries, side quests and illustration captions; it is imported by `shared/expansion-guides.mjs`.
- `shared/expansion-tools.mjs` owns tool schemas. Existing Power House text fields and storage version are preserved so previous notes remain readable.
- `node scripts/generate-catalogue.mjs` regenerates the guide, pages, quick quests, search, catalogue and desktop navigation.
- The original `setup`, `birds`, `morse`, `challenges` and `finale` phase IDs and their numbered step IDs remain present. New side quests do not enter the main quest checklist.
- Added `bo4-blood-trials` and `bo4-blood-skulls`; kept the two existing tool URLs.

## Research

Reviewed 2026-09-30:

- https://www.reddit.com/r/CODZombies/wiki/blood-of-the-dead/ — main quest, five challenge branches, equipment and side quests.
- https://www.codzombiesguides.com/main-quests/black-ops-4/blood-of-the-dead/ — current buoy method and screenshot references.
- https://www.reddit.com/r/CODZombies/comments/xbnzvw/ — community discussion of the discovered buoy method.
- https://mmmrkennedy.com/games/BO4/blood_of_the_dead/blood_of_the_dead_guide — advanced melee upgrades and cross-checks.
- https://www.reddit.com/r/CODZombies/comments/11r79ww/ — Normal difficulty and Custom Mutations restrictions.

Corrections relative to the original outline: Michigan Avenue is a trial, not Citadel; the Docks answer is the sum of three Morse digits; Power House requires actual monitor replacements. The older Reddit Morse trial-and-error route is included as an alternative, while the buoy method is recommended.

## Image provenance

The files in `public/images/blood-of-the-dead/` are local copies to avoid broken external images during a run. They retain their original pixels.

| Local asset | Source URL |
| --- | --- |
| cover.webp | https://www.codzombiesguides.com/maps/blood-of-the-dead.webp |
| powerhouse-symbols.png | https://i.imgur.com/7nSaj1u.png (linked by the Reddit wiki) |
| ritual-wall.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-warden-secret-room.webp |
| spoon-code.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-spoon-numbers.webp |
| buoy-gondola.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-upper-gondola-buoy.webp |
| buoy-yard.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-recreation-yard-buoy.webp |
| buoy-model.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-model-industries-buoy.webp |
| punchcard.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-punchcard.webp |
| monkey.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-monkey-bomb-statue.webp |
| skull-west.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-west-grounds-skull.webp |
| skull-cell.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-cdstreet-skull.webp |
| skull-roof.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-roof-skull.webp |
| skull-docks.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-docks-skull-location.webp |
| skull-eagle.webp | https://www.codzombiesguides.com/content/blood-of-the-dead/botd-wardens-office-skull.webp |

Symbol buttons use SVG viewports into the original sheet. The 1–6 and A–F labels identify pictures only. They never imply 1→A, etc. Source credit appears in the guide and Power House helper.

## Verification boundary

This is a researched implementation, not a claim of a completed in-game playthrough. Confirm quest triggers, visual alignment of symbol variants, each escort's failure recovery, and the solo/co-op ending in game before calling the guide gameplay-verified. Exact bird perches, Redeemer marks and advanced melee sightlines link to the illustrated source references instead of inventing positions.

## Checks completed

- `npm test`: 82 passing tests, including the four new Blood of the Dead cases.
- `npm run build`: successful production build. The existing unresolved `pigpen-cipher.ttf` warning remains unrelated to this revision.
- Headless Chromium against the production server at 1440 px and 390 px: saved inputs after reload, source changes clearing stale replacements, lever confirmation, undo, confirmed/cancelled resets, Morse decoding and pulse cursor, shared inline/full-page inputs, reset isolation across tools, image lightbox and mobile overflow.
- Browser console/page errors: none in the exercised flows. Loaded guide images were checked for failed decoding.
- Visual inspection: guide cover, mobile guide illustrations, Power House reference crops and mobile Morse controls. Adjusted SVG clipping to keep neighboring reference symbols out of each button.

## Release consideration

`.github/workflows/desktop.yml` runs for matching file pushes on every branch and includes a release publishing step. A feature-branch push can therefore publish desktop artifacts. This revision is kept on the local `improve/blood-of-the-dead` branch pending a decision about that release behavior.
