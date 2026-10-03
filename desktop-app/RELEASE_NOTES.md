# CodWiki Desktop release notes

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
