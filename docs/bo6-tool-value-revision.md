# BO6 tool value review — 2026-10-02

The user asked for tools that help solve a puzzle or remember a difficult visual clue, with ordinary quest progress left to Quick Parts. This revises the initial BO6 tool selection without reducing the map guides.

## Options and choice

| Option | Benefit | Problem | Decision |
| --- | --- | --- | --- |
| Keep every tool and rename trackers | Small change | Does not remove the duplicated work the user identified | Rejected |
| Turn every tracker into a more elaborate interface | Could add maps or photographs | Extra controls still do not help with a fixed list of completed tasks | Rejected |
| Retain clue transformations and visual memory tools; put locations and fixed instructions in the guide | Each tool has a specific job during a match | Requires preserving photographs and old links when tools retire | Selected |

The threshold is practical: a tool should calculate an answer, match a hard-to-name image to an action, or preserve a visual sequence that the player must reproduce. A checkbox is not automatically a tracker: the Tomb's three selected rock glyphs and Reckoning's four selected files are puzzle inputs.

## Decisions

| Tool ID | Decision | Useful behavior or guide destination |
| --- | --- | --- |
| `bo6-terminus-lab` | Keep | X/Y/Z image selection produces three terminal entries and explains the arithmetic. |
| `bo6-liberty-strauss` | Simplify | Each observed counter color produces the required lamp color at a photographed projector. Removed confirmation controls and completion totals. |
| `bo6-liberty-aetherella` | Retire | All nine photographed pickup sightlines now appear as individual steps in the Aetherella guide section. |
| `bo6-liberty-vault` | Retire | The guide explains the three photographed note locations, fixed order and leading zeros. |
| `bo6-terminus-nathan` | Retire | The guide explains the clock, card and injury-sign order directly. |
| `bo6-citadelle-raven` | Simplify | Antiquity photographs produce the correct inner/outer ring glyphs. Removed the three portal-progress controls. |
| `bo6-citadelle-symbols` | Simplify | Keeps the six photographed rune sequence, four book eyes and observed trap locations. Removed accepted-rune and completed-page controls. |
| `bo6-citadelle-knights` | Retire | Knight instructions and four orb trials remain in the detailed guide. The former dropdown notebook and completion checks did not derive an answer. |
| `bo6-tomb-symbols` | Keep | Three photographed rock glyphs highlight their exact gateway cells. |
| `bo6-tomb-trials` | Retire | Trial mechanics, charge returns and failure recovery remain in the guide. |
| `bo6-tomb-vases` | Retire | All ten existing photographed vase steps remain in the guide. |
| `bo6-shattered-cipher` | Keep | Letter clusters become a validated four-digit cipher result. |
| `bo6-reckoning-element` | Keep | Ordered monitor initials become an atomic number with the required leading zeros. |
| `bo6-reckoning-files` | Keep | Four observed belongings become chronological file order and a code. |

BO6 now has eight active tools. The exact retained tools are independent of whether every map has the same number of tools.

## Content and saved-state preservation

Existing guide phase and step IDs are unchanged. Aetherella's original `aetherella-route` step remains; nine additional `aetherella-<figure-id>` steps hold the existing source photographs and captions. No assets were replaced or discarded. The former tool's photographs retain their community-guide credits through the guide's source list and original asset manifest.

Strauss, Raven and Citadelle symbol definitions keep their legacy completion fields in the version-1 schema. Their interfaces neither display nor change those fields when new clues are selected, preventing an ordinary observation edit from erasing saved historical input. Explicit reset keeps its established behavior of clearing that helper.

Retired tools must disappear from generated catalogue, search, inline links and desktop navigation. Their old URLs should lead to the corresponding `#details-*` guide section. The central retirement integration owns those redirects and must leave old local-storage keys untouched. The generator previously left obsolete Vue tool pages behind, so removing a metadata entry alone is insufficient.

## Verification scope

Targeted tests cover all 216 Terminus input combinations, the Strauss inversion rules, the preservation of all nine Aetherella sightlines, all 56 three-rock combinations, rune/book ordering, source image bounds and authored guide/tool references. Whole-site generation, redirect checks, build and browser verification are handled by the integration pass. This revision changes tool selection and presentation; it does not claim a new full in-game playthrough.
