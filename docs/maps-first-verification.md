# Paradox Junction, Astra Malorum and Ashes map verification

Verified on 26 September 2026. Coordinates are normalized from the **top-left of the exact saved artwork**, without cropping or rotation. `precision: "point"` means a published map-marker position; `precision: "area"` means the named room, building or search region. An area marker does not claim the position of an individual shelf, wall item or moving enemy. Community coordinates using different image framing are registered to the saved artwork as documented below.

## Sources and artwork

| Map | Artwork | Coordinate basis |
| --- | --- | --- |
| Paradox Junction | `public/maps/paradox-junction/overview.webp`, 2048 × 2048 | [Official tactical map](https://www.callofduty.com/guides/blackops7/zombies/paradox-junction): public marker coordinates divided by 4096. The atlas itself labels Future on its upper half and Past on its lower half. |
| Astra Malorum | `public/maps/astra-malorum/overview.webp`, 4096 × 4096 | [Official tactical map](https://www.callofduty.com/guides/blackops7/zombies/astra-malorum): public marker coordinates divided by 4096. |
| Astra Malorum — Mars | `public/maps/astra-malorum/mars.webp`, 2048 × 2048 | [Community tactical map](https://codzombiesguides.com/maps/astra-malorum/): public normalized portal, ammo and armor coordinates. [Original arena image](https://codzombiesguides.com/layers/astra-malorum/astra-malorum-mars-layer.webp). |
| Astra Malorum — pylon diagram | `public/maps/astra-malorum/mars-schematic.svg`, 1200 × 900 | Original, explicitly unscaled orientation diagram. [Quest reference photographs](https://codzombiesguides.com/main-quests/black-ops-7/astra-malorum/) confirm that the four distant pylons are opposite the temple and the fifth is above the temple behind the player. It is a separate layer from the real Mars map. |
| Ashes of the Damned | `public/maps/ashes-of-the-damned/overview.webp`, 2048 × 2048 | [Official tactical map](https://www.callofduty.com/guides/blackops7/zombies/ashes-of-the-damned): public marker coordinates divided by 8192. |

Game artwork remains © Activision. Existing layouts are used for the requested fan guide and sources are exposed by the viewer; this does not assert a new license or endorsement. Most quest descriptions and landmarks come from the existing CodWiki walkthroughs. Additional checks used the [Paradox quest and spawn photographs](https://codzombiesguides.com/main-quests/black-ops-7/paradox-junction/), [Ashes quest photographs](https://codzombiesguides.com/main-quests/black-ops-7/ashes-of-the-damned/) and [Ashes region reference](https://callofduty.fandom.com/wiki/Ashes_of_the_Damned).

## Coverage and bindings

All bindings are saved explicitly in `app/data/maps/<slug>.json` and in `<ShowOnMap target="…" />` components in the three full guides. The running application does not infer locations from prose. Each full-guide button has a stable `guide-step-…` anchor; existing `wiki_…` IDs, original guide prose, tools and checkbox IDs remain intact. Table-row destinations also have `data-guide-step` for reader restoration.

| Map | Quick links | Coverage |
| --- | --- | --- |
| Paradox Junction | 19 / 19 | Fixed part rooms and workbench; all RC-XD, headset and ball candidate areas; eight note landmark areas; quest minigames and escorts; clock; boss defense areas; location-bearing side quests, relics and equipment lists. |
| Astra Malorum | 24 / 25 | Three trap rooms, cryopod, Perfusion Machine, books, three planet pages, upper floor, telescope/organ, Mars sequence and boss area; location-bearing side quests, relic portals and equipment lists. |
| Ashes of the Damned | 25 / 25 | Wonder weapon and vehicle routes; Serum; all four challenge regions; ritual rooms, corpse areas and film-reel areas; fog keys/orbs; boss destination; location-bearing side quests, relic portals and equipment lists. |

The unmapped Astra quick step is `phase-1-ol-2`: follow the roaming O.S.C.A.R. for a recording. There is no fixed destination to pin. Quick-step coverage indicates that a useful destination or search area is available, **not** that every object has an exact coordinate.

Named quick targets group multiple stops or possible spawns. Full-guide targets retain their own title, description and anchor, even when they share an area marker. Candidate groups are distinguished from required stops; the eight Paradox notes explicitly require the match's blink-count order, not the displayed marker order.

Legacy `.cheat-grid` and `.quest-grid` summaries are always hidden by `app/assets/css/companion.css`. They contain no new map buttons or map anchors, and no target points into them. Their original text and IDs are preserved. Named targets have been reviewed against the visible walkthrough action, rather than taking the first mention of the same room. The Ashes `relic-object` quick target retains its Blackwater search area without a Full Details destination.

## Cursed-mode Mister Peeks reward spawns

All three community maps explicitly identify the `mister-peeks` marker group as **Cursed Only**, describing Mister Peeks dropping reward eggs when shot. These are the requested perk/loot opportunities, distinct from song headphones, field-upgrade or Mystery Box Peeks, the Mangler Helmet quest, and the ten Aether Shroud Peeks used for the Ashes Teddy Bear relic. Perks are possible egg contents, not guaranteed rewards. We do not assert the community page's uncorroborated spawn probability or duration in the product.

Each dataset has a `cursed-mister-peeks` target with `kind: "candidates"`. Its markers use `category: "perk"`, `perkType: "mister-peeks"`, the state `Cursed mode · possible spawn`, a source URL, and descriptive regional labels. Counts describe the published candidate list and do not imply that every possible spawn has been discovered.

| Map and source | Published candidates added | Artwork registration |
| --- | --- | --- |
| [Ashes community map](https://codzombiesguides.com/maps/ashes-of-the-damned/) | **7**: Janus Towers Plaza, Vandorn Farm, Exit 115, two Ashwood locations, Zarya Cosmodrome, Blackwater Lake | Normalized coordinates transfer directly: the community default map and saved official overview share the same frame. The same seven records repeat across floor layers and are deduplicated. |
| [Astra community map](https://codzombiesguides.com/maps/astra-malorum/) | **8**: Crash Site, three Museum Infinitum exterior locations, Machina Astralis, Abyssal Rim, Observatory Dome, Mars | Main-map community artwork has more surrounding background. Registered transform: `x = 1.544 × sourceX − 0.2720625`, `y = 1.544 × sourceY − 0.271859375`. Mars coordinates transfer directly because the exact source image is already saved locally. |
| [Paradox community map](https://codzombiesguides.com/maps/paradox-junction/) | **4**: two Normal and two Destroyed candidates, around northern Cul-de-Sac and the sides of Trinity Avenue | Each source era occupies its own full image. Destroyed → upper atlas: `x = 0.8905 × sourceX + 0.05448291`, `y = 0.8905 × sourceY − 0.30449121`. Normal → lower atlas: `x = 0.879 × sourceX + 0.06062402`, `y = 0.879 × sourceY + 0.20831836`. |

Registration was checked against the actual source and saved images using normalized image cross-correlation on their common map geometry (scores: Astra 0.956, Paradox Destroyed 0.885, Paradox Normal 0.752). This accounts for map framing, not new gameplay measurements. Published coordinates were retained to their source precision and the transferred positions are rounded to six decimals.

One Paradox Normal candidate is on an off-map roof north of Cul-de-Sac (`sourceX: 0.594`, `sourceY: 0.321`). That location falls beyond the cropped upper edge of the Past half of the saved atlas. Its marker therefore stays inside the Normal area at `x: 0.582750`, `y: 0.508`, uses **area precision**, and explicitly describes the off-map roof search direction. It is not misrepresented as an exact point in the Future half. All other imported candidates retain published-point precision. The ordinary Ashes Teddy Bear relic Peeks remain an unresolved, separate survey task.

## Geography and remaining precision gaps

- **Paradox:** Normal/Past markers use the lower half of the official atlas; Destroyed/Future markers use the upper half. The Dark Heart layer uses the normal neighborhood as an explicitly labelled encounter overview; the art does not depict boss transformations. Upstairs markers share the house footprint and display their floor. RC-XD photographs were inspected and the three source labels match the guide. Exact spawn/shelf pixels, the individual humming mannequins/cysts, flower-pot keys, four-square X, all eight wall-note positions and elevated objects are not surveyed. Note labels provide all eight verified search landmarks. Randomized perks retain official marker descriptions; map geometry cannot predict perk availability. Two misplaced duplicate ammo records in the official Future group were omitted in favor of the matching normal records.
- **Astra:** The main circular Machina room contains the Perfusion/portal machine; the cryopod is separately highlighted in its side room toward Scholar's Way. The planet model, code terminal and Machina page use an upper-floor marker on the shared building footprint. Room highlights do not pinpoint each page/table, valve, display cabinet, clock, skull or lantern. Mars uses real arena art; five symbol pillars and gut piles are an area group until individually surveyed. The four off-map pylons use a separate, labelled order diagram, avoiding invented coordinates on the arena image. The guide's two song entries disagree about the third headphone (Mars versus Observatory Dome); both existing entries retain their own area links and neither is silently treated as a verified exact spawn. Random Aether Crystal/lamp spawns, Bongo positions and the Seed relic pistol are not precisely mapped.
- **Ashes:** Named subrooms use the visible building footprint and/or the official nearby perk/equipment landmark; these are deliberately marked as areas. The Tailor Shop, vehicle garage, Yuri's Lab, cargo container and pier need a finer survey. Power Pumps remain region highlights. Fog landmarks follow the verified clockwise map order and road relationships; individual keys, twelve soul orbs, candidate ARC-XD controllers and roaming enemy drops remain search regions. The floating Sepulcher is identifiable beside Blackwater Lake; no interior driving route or moving combat target is claimed. Unspecified phones, ten Aether-Shroud Mister Peeks spawns and moving Chompy/enemy destinations are not given invented pins.

## Checks performed

- Inspected all three original overview images, the real Mars arena, and Paradox RC-XD / Astra temple-pylon-machine reference photographs.
- Validated unique location/target IDs, all target references, quick bindings, layer references, coordinate bounds and local asset paths.
- Verified every full target's guide anchor exists, every original guide ID is preserved, and all three Vue templates still parse with zero errors.
- Audited the CSS visibility rules and ancestor chains of every new button and target anchor: none occurs in an always-hidden legacy summary, a `hidden` container, or inline `display: none` / `visibility: hidden` content. Collapsible guide cards remain valid destinations because the reader explicitly opens their containing cards before scrolling.
- Removed only the newly added anchors/buttons in a comparison and confirmed the original guide source is otherwise byte-for-byte unchanged.

These checks validate integration and reference consistency. An in-game survey is still required before upgrading the listed area markers to exact object positions.
