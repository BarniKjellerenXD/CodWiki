# Homepage navigation and artwork

The October 2026 refinement keeps the existing catalogue and guide flow, adds game shortcuts, and replaces weak map covers with atmospheric game scenes.

## Decisions

- Use a sticky left rail from 1100px and a sticky native selector below that. This keeps every game one action away without hiding the catalogue behind tabs or fitting eight tabs onto a phone.
- Jumping opens a collapsed game, clears search results, focuses its heading and updates the URL through Nuxt. The scroll spy identifies the section in view. Smooth scrolling respects reduced-motion preferences.
- Keep homepage covers in `app/data/mapArtwork.json`, separate from guide photos and generated catalogue data. Instructional close-ups should continue to show the objects used in quest steps.
- Replace 39 covers with curated scenes, including the supplied Shadows of Evil image. Keep existing strong covers. Reuse recognizable remaster scenes for shared locations, as disclosed in the artwork credits.
- Serve 28 new shared artworks as local WebP files with small responsive variants. Source pages, image URLs, map associations and credits are in `home-artwork.json`; the remaining override reuses an existing Mob of the Dead exterior.

## Validation

- All 176 Node tests pass, including artwork/map/source integrity and responsive asset existence checks.
- Production build succeeds.
- Browser inspection at 1440×1000, 390×844 and the actual 405×788 viewport: no horizontal overflow; loaded map images; visible jump targets; clear current-game indication.
- Verified game jumps, search-to-game navigation, reopening collapsed sections, the BO2 survival disclosure, puzzle-tools access and Back to top.
- Verified a BO1 jump followed by Call of the Dead and browser Back restores `#game-bo1`, the selected game and visible focused heading. Reloading a collapsed game anchor opens it before scrolling.
- Final browser console has no errors or warnings. Finish review: ship for the scored navigation fixes.

The local preview is the reviewed artifact; no deployment was requested.
