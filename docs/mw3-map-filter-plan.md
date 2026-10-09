# MW3 map filters and Red Worm photo finder

Reviewed 9 October 2026. This extends the existing charcoal-and-gold website and Electron views. It preserves the five overhead maps, all 445 source-backed pins, stable guide anchors, map links and saved guide progress.

## Options and decision

| Approach | Benefits | Tradeoff | Decision |
| --- | --- | --- | --- |
| More flat category buttons | Small code change | Still mixes unrelated quests; long rows grow harder to scan | Reject |
| A tree of checkboxes or dropdowns | Arbitrary combinations | More decisions during a match; recreates the dropdown workflow the user disliked | Reject |
| Activity buttons with a revealed second row | A named task, then a specific type of location; two clicks at most | Requires explicit authored membership | Choose |

Use one activity at a time. Urzikstan has Red Worm, Unstable Rift, Dark Aether, side quests, travel and supplies. Red Worm reveals clue boards, USB devices and fight arenas. Unstable Rift contains only its 54 candidate obelisks. Each seasonal Dark Aether has a Quests group whose first filter contains exactly three contract starters. Season 3 uses obelisks rather than asserting that its starters are Mr. Peeks rabbits. Story relics, blueprint quests, keys, locked rooms, exits, travel and supplies remain independently selectable.

Switching activity or subfilter clears the prior highlighted target so unrelated pins cannot leak into the next task. Explicit guide links open their matching filter, or a quiet selected-locations view for a target spanning filters. Overview search still searches the full index. Per-map preferences validate saved group/subfilter identifiers; older layer, wheel, grid and BO7 perk settings remain compatible.

## Photo tool options

| Approach | Benefits | Tradeoff | Decision |
| --- | --- | --- | --- |
| A static chart beside the guide | All clues exist already | Player still compares the map manually | Keep as a credited reference |
| AI reconstruction or automatic screenshot recognition | Could look cleaner or automate matching | Reconstruction can change factual geometry; recognition adds cost and uncertainty | Reject for this release |
| Select authentic board photos and resolve their known map pins | Directly solves the requested observation-to-location problem | Requires checking all twelve photo bindings | Choose |

The finder appears inside Urzikstan → Red Worm → USB devices and at `/tools/mw3-red-worm-photos`. Both use the same Leaflet map and observation logic. The dedicated route is discoverable through website tools/search and the Electron catalogue. MW3's six native guide entries and its finder stay directly visible instead of folding Urzikstan into a collapsed group when a tool is added. The old generic USB recorder remains retired.

The twelve actual grayscale photos come from [spaz33g's original chart](https://www.reddit.com/r/CODZombies/comments/18yl0fd/my_red_worm_usb_location_cheat_sheet_in_case/), already hosted locally. SVG viewports display the exact photo rectangles from that unchanged asset. Enlarging a clue uses the existing accessible image lightbox. The full original chart and creator credit remain available. No generated geography, watermark removal, resampling or invented photo is needed.

Select up to four distinct observed photos. The map immediately shows only their matching consoles and numbers pins with the chart's photo numbers. Unselect a mistaken clue to replace it; start a new board to clear those observations. Selected photos persist separately from guide completion and filter preferences. A validated `map:red-worm-photos-1-4-8-12` link shares a set without assigning drive letters or claiming collection. The four photographed landmarks identify the active consoles; Alpha/Bravo/Charlie/Delta must still be read in the rucksack.

Desktop places the photo sheet beside the map; phone layouts place the sheet above it and provide a View matching USBs button. Real image-load errors, unavailable storage, empty selection, four selected and keyboard focus have explicit states. No route planner is claimed.

## Verified clue bindings

These numbers belong to the reference sheet, not to the order of photos on the current board or to a USB letter. Each binding was checked against the chart's paired Tac Map crop and numbered overview, then the existing WZHUB coordinate ledger.

| Photo | Visible shape / landmark | Grid | Existing pin |
| --- | --- | --- | --- |
| 1 | Curved road beside a long building — Kotovo Blocks | C1 | usb-key-m2603 |
| 2 | Circular cooling towers — Popov Power | F3 | usb-key-m2597 |
| 3 | Scattered buildings beside winding roads — Zlatyev Array hill | I2 | usb-key-m2596 |
| 4 | Rows of stepped buildings — Al-Abboud Condos | C4 | usb-key-m2575 |
| 5 | Round courtyard in a square roof — Nahr Bathhouse | F4 | usb-key-m2625 |
| 6 | Small buildings on a diagonal road — Opal Palace loading area | G4 | usb-key-m2599 |
| 7 | Domed palace and curving riverbank — Opal Palace | F5 | usb-key-m2598 |
| 8 | Small buildings beside a curving road — Hadiqa Farms | I5 | usb-key-m2606 |
| 9 | Long rectangular roof — Zaravan City | D6 | usb-key-m2595 |
| 10 | Symmetrical stepped building — Shorok Opera House | F7 | usb-key-m2594 |
| 11 | Large building with parallel wings — Community Center | D8 | usb-key-m2604 |
| 12 | Island estate and waterfront dock — Shahin Manor | H8 | usb-key-m2605 |

Coordinate source: [WZHUB's Urzikstan MWZ map](https://wzhub.gg/map/urzikstan/mwz). Mechanic corroboration: [Greylorm walkthrough](https://gameranx.com/features/id/485365/article/modern-warfare-3-zombies-secret-red-worm-boss-fight-greylorm-easter-egg-guide/). The older research's coarse F2/F3 and G7/G8 descriptions are retained in its archive; the finder uses the measured dataset grids.

## Implementation and acceptance

- Add optional typed activity/filter memberships to MW3 datasets. Keep BO7's incumbent category controls. Validate coverage, unique IDs and exact quest memberships.
- Author a twelve-entry photo atlas with source dimensions, crop rectangles and existing pin IDs; validate the source hash to catch image changes that would break the crops.
- Use a shared map viewer, presentational photo sheet, strict selection normalizer and dynamic map target parser. Lazy-load the dedicated tool and artwork.
- Cover filter isolation, legacy settings, incoming guide links, photo selection limits, all twelve bindings, malformed/shared links, saved selections, reset, unavailable storage and image fallback. Verify the real pointer/keyboard, responsive and Electron flows.
- Build and publish through the established GitHub → Vercel and Windows desktop release pipelines. Website and existing Electron installations receive live content; the new desktop package includes the finder in its offline catalogue snapshot.

## Delivery verification

The chosen approach is implemented in all five existing MW3 map datasets and both finder entry points. Validation passed: 289 automated tests (including all 495 possible four-photo selections), six focused photo/filter browser-and-Electron flow groups, six incumbent map regression groups, ten native integration groups and 205 indexable route checks. Fourteen required web/phone/native captures received a fresh finish-review disposition of `ship`, with no material fixes. A clean production build and Windows v1.8.0 installer/portable ZIP packaging succeeded.

Source review and software checks are not an in-game playthrough.
