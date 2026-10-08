# CodWiki Desktop 1.6

The desktop app needs the completed five-game expansion and a way to keep its
navigation current after future website releases. The player should reach a
guide or solver quickly while preserving the current match's observations and
their existing shortcuts.

## Options and decision

| Option | Advantages | Cost and limitations | Decision |
| --- | --- | --- | --- |
| Rebuild the existing wrapper with a new fixed sidebar | Small change; keeps the existing profile | Future guide and tool additions need another desktop release | Include as the initial bundled fallback |
| Synchronize a versioned navigation catalogue, with saved and bundled fallbacks | Current guide list; small installer; preserves existing browser state; no duplicate content pipeline | Guides still require the website; metadata needs validation and failure recovery | **Chosen for 1.6** |
| Bundle the complete website and images for offline use | Guides can work without a connection | Larger downloads; separate asset/update lifecycle; routing, storage and content freshness need an offline design | Defer until offline use is a product requirement |
| Replace the embedded browser with native Electron `WebContentsView` | Follows Electron's recommended direction for new embedded-content work | Requires rewriting layout, focus, navigation and view lifecycle together | Separate migration; retain the tested current wrapper for this update |

Electron's current [webview documentation](https://www.electronjs.org/docs/latest/api/webview-tag)
recommends alternatives for new embedded-content architectures. This release
keeps the established wrapper and checks its actual Electron 44 behavior;
`WebContentsView` is a distinct future migration, not necessary to publish the
completed library. The chosen approach introduces no new runtime dependency.

## User behavior

1. The included or last saved library renders immediately. The first release
   includes 13 games, 96 guide destinations, 108 tools and two child quests.
2. The app requests `/desktop-catalogue.json` from its configured website origin
   at startup and when it regains focus. Automatic attempts are limited to one
   every 15 minutes; overlapping requests share one result.
3. A valid response updates game selection, search, sidebar entries and the
   settings game filter. Existing entry IDs preserve labels, ordering, visibility
   and shortcuts. Refreshing never reloads the current guide or tool.
4. Settings → General shows library source and counts. **Check for guide updates**
   bypasses the interval. Failed checks keep the current library and give a
   retry instruction. An unsupported schema directs the player to app downloads.
5. **Check for app updates** compares the installed version with the stable
   `desktop-vX.Y.Z` GitHub release. **Open Windows downloads** opens the official
   release page. Native binaries are installed using the existing installer;
   catalogue synchronization is automatic.
6. A failed page load offers **Retry this page**, retaining the attempted puzzle
   route. Website observations resume from the same browser storage.

## Data and process boundaries

- `scripts/generate-catalogue.mjs` derives the bundled navigation and public
  metadata endpoint from the same shared game/map/tool catalogue. No separate
  manually maintained list exists.
- Schema v1 contains `games` and `entries`. Each entry includes its stable ID,
  map, game, label, search keywords, kind and same-site guide/tool route. The app
  computes a revision from the normalized fields; it never trusts a remote hash.
- `desktop-app/catalogue.js` validates schema, size, unique IDs, internal route
  shape and map/game associations. It strips unknown fields. Requests omit
  credentials, reject redirects, time out after eight seconds and cap the
  streamed response at 2 MiB even without a Content-Length header.
- Valid metadata is saved as `codwiki-library-v1.json` in the existing user-data
  directory through a temporary file and rename. Broken saved files fall back to
  the included list. If saving fails, the fetched list works for this session.
- Main-process `net.fetch` performs metadata requests. The local renderer receives
  allowlisted metadata through preload IPC. Native settings/update IPC accepts
  only the host window's main frame. The remote guest remains sandboxed with
  context isolation and Node integration disabled, following Electron's
  [security guidance](https://www.electronjs.org/docs/latest/tutorial/security).
- App ID `eu.wolden.codguides`, product name, production origin, default guest
  session and storage keys stay compatible. No browser-state migration or reset
  is performed. Website and desktop browser profiles remain separate.
- All navigation IDs receive a shortcut setting, including `null` defaults.
  This fixes loss of custom bindings on newer tools during settings migration.
  Saved bindings take priority over conflicting newly introduced defaults.
- Saved custom labels being edited are retained during background broadcasts.
  Guides stay first in each map group; existing grouping/search behavior remains.

## Implementation sequence

1. Generate versioned public metadata alongside the included navigation.
2. Add validation, request limits, cache persistence and a throttled refresh
   manager in the main process.
3. Merge settings against current entries without resetting user choices.
4. Refresh renderer navigation in place and expose useful status/actions in
   existing General settings. Preserve the charcoal/gold visual system.
5. Add the official desktop-release check and correct failed-page retry behavior.
6. Run unit regression tests, actual hidden-window Electron integration checks,
   normal/minimum-window visual checks and a production website build.
7. Package the Windows installer and portable ZIP, publish through the existing
   GitHub workflow, and verify Vercel serves the matching metadata revision.

## Verification

The regression suite covers complete catalogue generation, legacy route aliases,
unsafe and malformed metadata rejection, streamed size limits, cache persistence,
failed checks, timeouts, throttling, concurrent requests, settings migration and
official release/version validation. See `tests/desktop-catalogue.test.mjs`.

`scripts/verify-desktop.mjs` uses Playwright's
[Electron automation API](https://playwright.dev/docs/api/class-electron), a hidden
native window, a loopback fixture server and an isolated user-data directory.
It tests real host IPC, guest isolation, native input events, live catalogue
additions/removals, edited labels, settings persistence, browser observation
storage, restart recovery, internal/external links and retry of a failed puzzle
page. Test fixtures never modify the installed app's profile. Visual captures and
the run report are generated under ignored `.impeccable/review/desktop/`.

Local verification on 8 October 2026:

- **254 automated tests passed**, including 13 new desktop catalogue/update
  regressions. The Nuxt production build completed successfully and includes the
  generated endpoint, revision `058908594dc3cb1a3372`.
- **Nine native integration groups passed** with real Electron 44 IPC and input
  events. Restart tests retained the saved library, last puzzle route, browser
  observations, custom/cleared shortcuts, hidden entries, labels and zoom.
- **Three packaged-app live checks passed** against codzmwiki.com: the actual MWZ
  portal solver returned I6 for destination m2112, the guest had no native bridge,
  and the official GitHub release check worked. The packaged executable ignored
  a spoofed development origin and retained the solved puzzle with a collapsed
  sidebar at minimum window size.
- The **Windows installer and portable ZIP built successfully**. Executable
  resources report CodWiki 1.6.0.0 / file version 1.6.0. Playwright is a development
  dependency and is excluded from the shipped app.
- Native captures at **1440×920 and 760×620** have no horizontal overflow. The
  independent finish reviewer returned **ship** for the changed Electron UI,
  preserving the incumbent visual system. Existing loading/topbar detector
  warnings do not concern the new controls.
- GitHub CI runs the full regression suite and native Electron checks before
  creating the installer/ZIP and publishing the desktop release. Push publishing
  is limited to the production `master` branch.

The pre-publication live run correctly used the included fallback because the
new endpoint was not deployed yet. Deployment and release receipts are verified
separately after publishing; local reports are in the ignored review directory.

## Scope

This release synchronizes navigation and displays the live guides/solvers. It
does not bundle offline guide assets, replace the browser view architecture, or
silently install executable updates. Content research and gameplay limitations
remain documented in `docs/remaining-games/`; desktop verification does not
claim an in-game puzzle playthrough.
