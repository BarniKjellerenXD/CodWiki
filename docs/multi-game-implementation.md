# Multi-game implementation

## Implemented

- Four game groups, 33 total map/mode hubs (six existing BO7 plus 27 additions), and two separate Outbreak quest routes.
- 44 new helpers: shared local state, normalization, undo, reset confirmation, inline/full-page reuse, and lazy rendering.
- Original concise guide prose with stable phase/step IDs, source attribution and review date. The pilot guides have additional detailed instructions.
- Deterministic tools for Gorod valves, Blood Morse, Dead of the Night zodiac, Origins ice/fire, Alpha Omega clock parsing and Firebase dart sectors. Tag has 24 exact clue/location lookups. Outbreak launch observations filter the six A/B/D permutations.
- Desktop game/map disclosures, search expansion, independent saved collapse state and existing user shortcut/order preservation.
- BO7 interactive-map capability retained; unsupported map tabs hidden. Existing progress/storage identities retained.

## Authoring and source facts

The `shared/expansion-*.mjs` files are the authored source. Run `node scripts/generate-catalogue.mjs` after edits. Generated pages/components carry a header. The generator does not replace BO7 guide prose or checklists.

The guide source URLs are recorded with each map. Most BO3/BO4 gameplay research uses the r/CODZombies map wikis. Cold War uses Ethan C’s COD Tracker walkthroughs, with COD Zombies Guides for Die Maschine and the updated Blood quest. Supplementary Steam guides cover missing Chronicles quest steps.

Origins glyph pairs were visually compared against the published interactive reference at https://codzombiessolver.com/origins on 2026-09-30. The implementation draws its own minimal SVG glyphs; it does not copy that site’s art or code. Input glyphs express ternary values 0–11; output glyphs use the corresponding base-four stem shapes. Fire uses the reviewed torch values 11, 5, 9, 7, 6, 3, 4, with 4 labelled as the bloodstain.

Gorod’s documented valve graph produces two Hamiltonian routes for each of 30 distinct endpoint pairs; the implementation selects the first in a stable room/edge order. Tests replay every route and retain the independently documented Department Store → Armory → Tank Factory → Infirmary → Dragon Command → Supply Depot fixture.

The Blood Morse tool accepts either decimal buoy digits or five-pulse digit Morse, sums the digits and encodes the decimal result. Tests cover all 1,000 input triples, including zero and two-digit sums.

## Remaining content fidelity work

The whole expansion is available for local review; this change does not deploy the site or publish a desktop release. Several long quests currently have concise stage instructions and link to the source for precise locations. They are not yet exhaustively illustrated, personally playtested walkthroughs.

- Full glyph pickers remain to replace text descriptions for Shadows, Void Bow, terminal boards, Alistair’s lock, Ra enemies and Revelations runes.
- Voyage clocks currently output recorded target times; physical control diagrams and a verified dial mapping are still required. Its celestial recorder now outputs pickup locations in the observed order and validates the final Sun stage.
- Rushmore now provides 30 searchable bonus effects and codes alongside separate match-specific quest notes. Dialogue-only backstory number sequences remain in the source reference.
- Zetsubou tracks one plant, with manual growth stages; multiple saved beds and recipe cards remain to be added.
- Outbreak’s region helper states verified exceptions and links to walkthroughs; a complete landmark directory covering later-added regions remains to be authored.
- Additional fixed references for Shangri-La dials/gongs, Moon excavators, and complete equipment/side-quest locations remain content work.
- Per-map artwork and original/permission-cleared location screenshots remain to be produced. No placeholder image is presented as real map art.

Keep these limitations visible during review. Do not relabel a recorder as a solver or claim gameplay verification merely because automated tests pass.

## Validation

`node --test tests/*.test.mjs` covers catalogue/anchor consistency, all six existing BO7 map datasets, existing puzzles, new calculator rules, malformed input, leading zeros, unknown clues and independent Outbreak progress. Build and browser checks are recorded in the task report.

Verified 2026-09-30: all 78 tests passed. The production Nuxt build passed after permitting Windows junction resolution outside the filesystem sandbox. The authored tool modules are emitted as JSON under `app/data` for reliable server bundling. Production browser checks confirmed guide navigation, saved quest progress after reload, shared inline/full-page decoder input, and no horizontal overflow at a 390px phone viewport. The desktop navigation model is tested; an Electron installer/release has not been built or published.

Proton Drive renamed the completed `.output` directory to a `Name clash` directory while the preview was running, making uncached server chunks disappear. The completed build was copied to an unsynced temporary folder for verification; all 93 catalogue routes then returned HTTP 200. Keep build output outside actively synced storage when reproducing this local preview. No conflict directories or Git staging entries were removed.
