# BO4 guide completion — research and design

Reviewed 2 October 2026. Blood of the Dead remains the existing authored guide. The other seven maps have been rebuilt from their community walkthroughs and independent illustrated references.

## Layout decision

| Option | Benefit | Cost |
| --- | --- | --- |
| Longer generic forms and paragraphs | Fast to maintain | Players still translate unfamiliar symbols into words |
| Separate quest application for each map | Highly specialized | Splits saved progress and duplicates navigation |
| Detailed guide phases with specialized inline companions | Instructions, actual clue images and calculated actions together | More individual tool interfaces |

Choose the third option, preserving the existing Quick Parts / Full Details views, stable checklist IDs, saved observations, undo and full-page tools. Use one action per step with prerequisite, location, action and observable completion. Put optional equipment into side sections and link it from required quest steps. Show alternatives where they help (free weapon quest versus box, solo versus team assignments); recommend the deterministic route for a first clear. Do not fabricate a glyph or claim that a notebook solves a puzzle.

## Voyage research and corrections

- [r/CODZombies complete map breakdown](https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/) — primary community walkthrough, equipment, main quest and five boss arenas.
- [COD Zombies Guides](https://www.codzombiesguides.com/main-quests/black-ops-4/voyage-of-despair/) — independent detailed walkthrough, clock/lever/outlet/planet photographs and visible success cues.
- [codzombies.info Voyage companion](https://codzombies.info/voyage/) — corroborates clock control mapping, outlet ordering, part locations, planet reset and route.

Clock glyphs are Fire (up triangle), Water (down triangle), Air (barred up triangle), Earth (barred down triangle). The old Electric/Poison labels were incorrect. Bridge controls minutes; Engine Room bottom-left/top-right controls Fire/Water hours; Poop Deck left/right controls Air/Earth hours. Show SVG shapes plus target hand positions and shortest movements **from untouched 12 only**. Existing incorrectly labelled notes remain visible as legacy observations, never silently assigned to a new symbol.

Outlets are a separate puzzle. A Catalyst creates one circle per round in any element order; the lockdowns must be completed Poison, Water, Electric, Fire. The new helper stores the actual random outlet location, circle-ready status and artifact-collected status separately, rejecting duplicate assignments and skipped completion order.

The sky helper keeps eight observed bodies in order, fixes Sun last, includes Neptune in the water, and returns each symbol/orb location with its screenshot. Symbol activation and orb collection are different checkboxes. Recommended first-clear route: shoot one body, collect its orb, then move on; co-op can place collectors near the next location. The guide does not recommend shooting all bodies at once.

The pipe machine is the **Turbine Room** Pack-a-Punch pedestal, sometimes described loosely as Engine Room by the older wiki. Pipe success means water rather than steam, flooding, then the artifact interaction. Sources disagree on whether the machine always moves next round: instruct players to check its actual position.

## Image provenance

Voyage screenshots are unchanged local copies from the COD Zombies Guides page above, which credits MrRoflWaffles, CodeNamePizza and Joltz. Local `public/images/bo4-voyage-of-despair/<name>.webp` maps to `https://www.codzombiesguides.com/content/voyage-of-despair/voyage-of-despair-<name>.webp`; `cover.webp` maps to `https://www.codzombiesguides.com/maps/voyage-of-despair.webp`. The alchemy glyphs and dial illustrations are original SVG interface diagrams checked against the reference screenshots. They represent puzzle shapes, not generated game imagery.

Per-map evidence, decisions and asset provenance are recorded in the IX/Ancient Evil, Night/Classified and Alpha/Tag research documents beside this file. Automated checks and browser review can verify calculations, links, rendering and state; a complete in-game run remains unverified.

## Verification

- Regenerated guide pages, tool pages, search, Quick Parts and desktop navigation with `node scripts/generate-catalogue.mjs`.
- All 104 Node tests pass, including new puzzle calculations, prerequisite validation, duplicate detection, leading-zero codes and compatibility with existing saved fields.
- Nuxt production build succeeds. This checkout needed `npm ci --legacy-peer-deps` because the existing lockfile omits a peer dependency; no dependency versions or lockfile were changed.
- Browser checks covered mobile guide rendering, image loading, actual symbol pickers, Voyage lever instructions, saved state and undo, IX kill order, Night's visual combinations and zodiac sorting, and Alpha Omega's remaining-room and keypad calculation.
