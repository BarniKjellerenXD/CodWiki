# CodWiki Desktop release notes

## v1.7.0

- MW3 now has interactive maps for Urzikstan and all four seasonal Dark Aether regions. Use the guide's Map button or an inline map icon to locate an objective and return to its instructions.
- Five credited overhead maps include 445 curated references: portal areas, Red Worm clue walls/USB candidates/arenas, free perks, the chess vault, triangles, possible Unstable Rift obelisks, Dark Aether contracts, exits, keys and secret-quest areas, plus useful support and travel locations.
- Key locations keeps the overview readable. Search names or grid references, filter categories, pan/zoom, toggle the grid, and share a selected-location link. Candidate spawns, approximate areas, floor/height and story/Elder conditions stay explicit.
- Seasonal portal and gold-upgrade instructions link directly to their Urzikstan map areas. No MW3 tool dropdown or progression tracker is reintroduced; saved progress and reading preferences remain compatible.
- Existing v1.6 apps receive the live map content automatically. v1.7 updates the included search keywords and native MW3 library description.

Validated with 281 passing automated tests, ten native integration groups, six focused browser/native map flow groups, desktop/phone/minimum-window review, a production build and Windows installer/ZIP packaging.

See [the map options and implementation plan](https://github.com/BarniKjellerenXD/CodWiki/blob/master/docs/mw3-interactive-map-plan.md). Use the Setup installer to update the app or extract the portable ZIP.

## v1.6.1

- MW3 now offers six direct guides. Urzikstan prioritizes seasonal portal unlocks, the Red Worm fight, eight free-perk Easter eggs, the chessboard vault and triangle rituals.
- Removed all four MW3 tools, the portal/schematic milestone panel and the seasonal route dropdown. Story, relic collection, gold upgrades, portal rituals and optional side quests are readable together. New readers start in Full Details; saved reading preferences remain available.
- Red Worm search opens the Urzikstan guide. Old MW3 tool bookmarks open their corresponding guide section, and existing guide progress and pins retain their IDs.
- The included library now has 96 guide destinations, 104 tools and two child quests across 13 games. Existing v1.6 apps receive the updated navigation automatically from the website.

Validated with 257 passing automated tests, ten native Electron integration groups, five MW3 browser/native flow groups, phone and minimum-window interface checks, a production build and Windows installer/ZIP packaging.

See [the MW3 guide plan and implementation record](https://github.com/BarniKjellerenXD/CodWiki/blob/master/docs/mw3-guide-plan.md). Use the Setup installer to update the app or extract the portable ZIP.

## v1.6.0

- All 13 games are available in the desktop library: 96 maps, modes and destinations, 108 tools and two child quests. The 30 guides previously marked planned now include walkthroughs and 31 new puzzle tools across Infinite Warfare, WWII, Advanced Warfare, Vanguard and Modern Warfare III.
- The guide list updates automatically from codzmwiki.com when the app starts or regains focus. Settings → General provides a manual check and explains whether the app is using the live, saved or included list. Failed checks retain the last usable library.
- Refreshing the library keeps your current page, puzzle observations, selected game, search and custom navigation settings. App identity and browser-profile storage stay compatible with v1.5.
- Custom shortcuts for tools without a default binding now survive restarts. Reset all to defaults also clears those custom bindings correctly.
- Settings → General checks the latest official GitHub Windows release and opens its download page. Use the Setup executable to update the installed app, or extract the portable ZIP.
- Connection recovery retries the puzzle page that failed. Same-site links stay in the app and external references open in the system browser.
- Website content stays isolated from native app settings and filesystem access. Library updates validate their version, destinations, associations and size before saving or applying them.

Validated with 254 passing automated tests, nine native Electron integration groups, a packaged-app live solver/update check, normal/minimum-window interface review, a Nuxt production build and Windows installer/ZIP packaging.

Guides and images load from the website; the saved navigation list does not make the full site available offline. See [the options, implementation plan and verification record](https://github.com/BarniKjellerenXD/CodWiki/blob/master/docs/desktop-1.6-plan.md).

## v1.5.0

- The app now loads https://codzmwiki.com. Website progress and reading preferences are stored per origin and do not automatically transfer from the former domain; app shortcut and sidebar settings retain their existing storage.
- A remembered game selector and focused map list make the thirteen-game library easier to browse. Expand a map for its guides and tools; maps with one destination open directly.
- Global search spans all games, matches aliases and accents, and identifies the edition. Clear search or press Escape to return to the selected game. Guide/tool links, restored pages and shortcuts select the matching game automatically.
- Thirty map entries marked **Guide planned** join the 66 existing authored entries: Infinite Warfare (5), WWII (11 maps and modes), Advanced Warfare (4), Vanguard (4) and Modern Warfare III (2023; 6 destinations). These entries have no walkthroughs, tools, progress or default shortcuts yet.
- The website retains its game rail and mobile selector, with compact rows for planned entries, an independently scrollable rail on short screens and clear empty states for games without tools.
- Existing labels, hidden items, ordering, shortcut bindings and saved progress remain compatible. BO3 Chronicles and BO2 Survival grouping are preserved.
- Keyboard focus survives sidebar rebuilds, and custom navigation labels save when App settings closes.
- A small Windows app link on the website opens the latest GitHub release, with installer and portable ZIP downloads.

Pre-release validation includes 180 passing automated tests, a successful Nuxt production build and an unsigned unpacked Windows build with Electron 44. Browser checks exercised the renderer through mock IPC and an iframe; native Electron IPC and operating-system shortcuts were not verified. See [the implementation record](https://github.com/BarniKjellerenXD/CodWiki/blob/master/docs/game-library-plan.md).

## v1.4.0

CodWiki Desktop v1.4.0 adds the Paradox Note Order & Piano tool and supports the updated guide workflow.

- Six map guides and fourteen tools, grouped by map in the searchable sidebar.
- Paradox Note Order & Piano opens with Ctrl+Alt+1. Existing custom bindings take priority; if that shortcut is already used, assign the new tool a shortcut in Application settings.
- The address bar and selected sidebar item follow links between guides and tools. Newly selected tools scroll into view.
- Numbered tool shortcuts work when Shift produces a symbol on the keyboard layout.
- The website now offers compact Quick Parts with one checkbox per part, scrollable page contents, and rebuilt tools shared between the guide and full tool pages.
- Saved labels, hidden entries, ordering, cleared shortcuts and custom bindings survive the upgrade. Puzzle inputs and quest progress remain in the app's existing browser profile.

Download the Setup `.exe` to update your installed Windows app, or extract the portable `.zip` and run CodWiki.

The app loads codzmwiki.com. Guide and puzzle changes appear when the matching website update is deployed; they are not bundled for offline use. Website and desktop profiles store progress separately.
