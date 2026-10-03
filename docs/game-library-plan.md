# Game library expansion

## Decision

Players need to reach the map and tool they use during a match as the library grows from eight to thirteen games. Preserve the existing charcoal/gold appearance, guide routes, shortcuts, labels, hidden entries and progress.

| Choice | Benefit | Cost | Decision |
| --- | --- | --- | --- |
| Expand the current game/map tree | Familiar; everything is in one place | Thirteen games and over ninety maps create a long navigation column | Retain grouping, replace the all-open default |
| Horizontal game tabs | A direct click to each game | Long names overflow the narrow desktop sidebar and phones | Declined |
| Game selector + focused map list + global search | One game in view, every game reachable, search crosses editions | One extra action to switch games | Selected |

The desktop selector remembers its game. Restoring a guide or following a link/shortcut selects the matching game automatically. Map tools are collapsed until needed; a map with just one destination opens directly. Search temporarily spans every game, matches all query words and accents/aliases, identifies each edition, and clearing it restores the selected game. Unknown/removed selections recover to the first game. Empty results and fully hidden game entries have explicit recovery text. Keep BO3 Chronicles and BO2 Survival grouping.

The website retains its sticky game navigation and mobile selector. Additional games have compact map rows marked “Guide planned”, honest empty states, dedicated working entry routes and no fabricated artwork, tools or progress. Planned entries remain searchable, including common aliases. The longer desktop game rail must scroll independently on short screens.

## Implemented

1. Centralized game metadata, display order and aliases in `shared/games.mjs`, with planned map records in `shared/planned-maps.mjs`.
2. Generated website entries/search and desktop game/map metadata from the shared catalogue.
3. Added the remembered desktop game selector, global search, route synchronization and a game filter in navigation settings. Sidebar rebuilds preserve keyboard focus on the matching navigation control, and closing settings saves custom-label edits.
4. Extended website discovery with compact ruled rows, explicit planned status, useful entry pages, tool empty states and a game rail that scrolls independently on short screens. Entry-page arrows use inline SVGs.
5. Checked catalogue integrity, saved-setting compatibility, search, navigation, production builds and desktop/mobile renders within the limits below.

## Scope

The thirteen-game catalogue contains 96 map/mode entries: 66 existing authored entries and 30 planned entries. The additions are Infinite Warfare (5), WWII (11 map/mode entries), Advanced Warfare (4), Vanguard (4), and Modern Warfare III **2023** (6 destinations). The user explicitly selected the 2023 Zombies game rather than 2011 Survival.

WWII has five standalone maps plus three Tortured Path chapters and their three distinct survival modes. MWIII includes Urzikstan, the four seasonal Dark Aether destinations and the Unstable Rift; story/normal/elder variants do not pretend to be separate geographical maps. Counts in the UI say “maps & modes” or “destinations” where appropriate.

Scope is the major standalone PC/console Zombies catalogues. Ghosts Extinction, multiplayer maps, MW3 2011 Survival, mobile-only modes and Advanced Warfare's brief Riot Exo Survival bonus wave are outside this expansion. No new walkthroughs or release dates are promised. Existing authored guides remain available.

## Content references (reviewed 2026-10-03)

- [Infinite Warfare map index](https://www.codzombieguides.com/infinite-warfare-zombies) and its linked Exo Zombies / Vanguard indexes: map names and catalogue scope.
- [WWII map and mode index](https://callofduty.fandom.com/wiki/Call_of_Duty:_WWII): distinct Tortured Path chapter and survival entries.
- [Official Tortured Path introduction](https://www.callofduty.com/ar/blog/archives/the-new-nazi-zombies-dlc-puts-a-three-part-spin-on-the-epic-adventure): the three objective-based chapters.
- [Modern Warfare Zombies reference](https://www.codzombieguides.com/modern-warfare-zombies): Urzikstan and story/rift scope.
- [Official Season 4 Reloaded announcement](https://www.callofduty.com/blog/2024/06/call-of-duty-modern-warfare-iii-warzone-wzm-season-4-reloaded-maps-modes-zombies-announcement): Unstable Rift is a wave-based challenge.
- [Official Season 5 Reloaded announcement](https://www.callofduty.com/uk/en/blog/2024/08/call-of-duty-modern-warfare-iii-warzone-wzm-season-5-reloaded-maps-modes-zombies-announcement): final story mission and Dark Aether destination.

Game metadata is authored in `shared/games.mjs`; placeholders in `shared/planned-maps.mjs`. Run `node scripts/generate-catalogue.mjs` after edits. IDs are stable future guide destinations. This is catalogue/source verification, not an in-game playthrough.

## Validation and remaining limits

- Final automated suite: all 180 tests passed, including catalogue integrity, search and saved-setting compatibility.
- The final Nuxt production build passed. The Windows unpacked application built with Electron 44 using the installed Electron distribution and without signing; all six packaged renderer files byte-match the current source.
- Browser checks exercised the actual desktop renderer with mock IPC and an iframe in place of Electron's webview. Keyboard Enter retained focus on the selected map, Tab advanced to the next map, and navigation from the embedded page retained iframe focus. A saved custom label appeared alongside Guide planned and was restored to its default after the check.
- Desktop and mobile website views were captured, including planned entries, navigation and the final SVG arrows. These checks do not verify native Electron IPC, webview integration or operating-system shortcut handling.
- The Impeccable detector could not run because its engine was unavailable and writing its cache was denied. Source review and browser inspection were used; no detector result is claimed.
- The extension retains the incumbent charcoal/gold components and tokens. `DESIGN.md` and `.impeccable/design.json` are absent; this feature did not authorize creating or repairing a design-system record.

The initial implementation was verified locally. Gameplay walkthrough validation is outside this catalogue expansion.

## v1.5.0 release preparation

The production host is now `https://codzmwiki.com`. The homepage offers a small inline Windows app link beneath the introduction, pointing to the latest GitHub release. Desktop and mobile captures confirm it fits without horizontal overflow; the link includes a 44px target, visible focus and an accessible name matching its text.

The Windows release version is 1.5.0. GitHub Actions builds the installer and portable ZIP on pushes affecting the application. The root lockfile was repaired using the runner's npm 10.9.9 after its previous builds reported two missing optional `unplugin` dependencies; the matching `npm ci --dry-run` now passes. Production build and all 180 tests passed before publishing.
