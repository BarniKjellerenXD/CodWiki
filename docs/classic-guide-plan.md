# World at War and Black Ops guides

Scope: the remaining 15 catalogue entries, plus the BO2 map-list split. Research reviewed 3 October 2026. Preserve the established guide, Quick Parts, image lightbox and saved-tool workflows.

## Choices

| Option | Assessment | Decision |
| --- | --- | --- |
| Redirect original maps to their remasters | Easy to maintain, but gives players incorrect weapons, rewards and quest requirements | Reject |
| Copy every remaster guide and tool unchanged | Duplicates work and carries remaster-only secrets into earlier games | Reject |
| Share photographs and puzzle components; author edition-specific guides and state | Retains useful references while making original-game rules explicit | Choose |

BO2 keeps TranZit, Die Rise, Mob of the Dead, Buried and Origins directly visible. Bus Depot, Town, Farm, Diner, Nuketown Zombies, Cell Block and Borough move into a collapsed “Survival & extra modes” dropdown. Search and direct links continue to reach every map.

## Coverage and helpers

- World at War: Nacht der Untoten, Verrückt, Shi No Numa and Der Riese. Cover map routes, available equipment, songs, environmental secrets and original Fly Trap targets. Avoid importing BO3 Samantha hunts or The Giant rewards.
- BO1: Kino, Five, Ascension, Call of the Dead, Shangri-La, Moon, the four Rezurrection remasters and Dead Ops Arcade. Separate Call of the Dead's solo and co-op routes. State Moon's original co-op and prior-quest requirements.
- Call of the Dead: solve the coupled lighthouse dials from current values; photograph finder for scattered and random quest objects.
- Shangri-La: reuse photographed symbol pairing and gong observations with BO1 labels; provide wall-tile location references.
- Moon: reuse the sequence recorder and timed-panel/cable photograph finder with independent BO1 saves.
- Fixed short sequences and small location sets remain illustrated guide steps. No generic progress-tracker tools.

## Research and verification

Cross-check Reddit's map wikis against original-game walkthroughs, illustrated community guides and Steam/GameFAQs research. Keep source discrepancies visible in the research record. Reused photos retain their existing credits; new assets receive a provenance manifest.

Validate catalogue coverage, edition-specific mechanics, helper links, image files, decoder results, independent saves and the BO2 grouping. Run the complete test suite and production build, then inspect desktop and phone layouts in one review/fix pass. Record final results here. Source/software checks are not an in-game playthrough.

## Source decisions

Each guide lists its map-specific Reddit wiki, illustrated walkthroughs and supplementary sources. `classic-assets.json` records the downloaded photographs and their original URLs; existing Chronicles assets retain their original manifest.

- Compared original-game routes with the remasters before sharing content. BO1 Ascension has the temporary Death Machine reward; BO1 Moon has the original multiplayer/Richtofen prerequisites. Shangri-La uses Spikemores and original wall-weapon landmarks. BO3 Samantha hunts and the Moon space-dog interaction are excluded.
- Replaced copied weapon/trap tables where they disagreed with original-game walkthroughs. Five has four DEFCON switches, despite a conflicting introductory sentence in one source. Shi No Numa uses the Wunderwaffe. Der Riese uses its original Fly Trap targets and has no Annihilator reward.
- The Dead Ops Reddit entry was unfinished, so its authored walkthrough uses the original GameFAQs guide, Steam community research and other arcade references. BO1's round-40 boss cycle is kept separate from mobile-edition limits.
- Kino's rocket trigger is described inconsistently across sources. The guide gives the documented mannequin interaction and explicitly identifies the alternative film-reel association rather than presenting either as a verified universal prerequisite.
- BO1 and WaW perk behavior, solo revives, added radios and music secrets are specified separately. Shared-location photos may show a remaster; that limitation is disclosed beside the guide sources and inside the tools.

## Implemented and checked

- All 15 remaining maps now have guides: 11 BO1 and 4 WaW, with 90 sections and 221 steps. No planned-map placeholders remain.
- The guides use 183 distinct local images. The new asset manifest contains 73 new images and 5 references to existing assets.
- Seven helpers cover coupled dial solving, photographed item locations, matching symbols, gong observations and Simon memory. They share existing components where appropriate and have separate BO1 save keys.
- Full suite: **175 tests passed**. This includes all 10,000 lighthouse starting states checked against an independent dial simulation, guide/tool anchors, edition rules, image bytes, navigation grouping and save-state isolation.
- Production build passed. All **22 new guide/tool routes** returned HTTP 200 with page headings.
- Desktop (1280 px) and phone (390 px) review covered the dropdown, search, dial inputs/results, saved observations, image zoom, filters/empty states, tile pairs, gong instructions and guide links. The phone view had no horizontal overflow; the browser reported no console errors/warnings.
- One review fix batch made finder links follow the selected quest item and corrected remaster weapon names and ambiguous photo captions. The rebuilt version was confirmed, including the vodka and Moon cable anchors. Browser test observations were cleared after review.

These checks validate the authored content against sources and exercise the software; they do not substitute for playing every quest in-game.
