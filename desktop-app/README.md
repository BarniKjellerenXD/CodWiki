# CodWiki Desktop

Windows desktop app for **codzmwiki.com** (COD Zombies Wiki Viewer).
[Download the latest Windows release](https://github.com/BarniKjellerenXD/CodWiki/releases/latest): use the Setup executable to install, or extract the portable ZIP.
Electron shell with a sidebar launcher for all guides + solver tools, dark
near-black/gold theme matching the site.

## Features
- Game selector with a focused map list across thirteen games. Maps with tools expand to reveal Guide first, then their tools; a map with one destination opens directly. The entire sidebar can be collapsed.
- Global sidebar search spans games, matches aliases and accents, and labels results by edition. Clear search or press Escape to return to the selected game's map list.
- Remembers the selected game; restored pages, guide/tool links and shortcuts select the matching game automatically. BO3 Chronicles and BO2 Survival grouping remain available.
- Guides and tools render inside the app; external links open in the system browser
- Keyboard shortcuts: Ctrl+1..9 and Ctrl+Shift+1..9 (guides/tools), Ctrl+Alt+1 (Paradox notes), Ctrl+H home, F5 reload,
  Alt+←/→ back/forward, Ctrl+= / Ctrl+- / Ctrl+0 zoom, F12 devtools
- Remembers the last page you had open (localStorage persists, so guide pins
  and collapsible-section states survive restarts)
- Same-origin `target=_blank` links navigate in-app; everything else opens externally
- Offline-friendly error page with retry when the site can't be reached
- Reading themes follow the website; app settings manage shortcuts, sidebar and zoom
- Saved custom labels, tool ordering, hidden items and shortcut bindings survive updates. Older flat ordering is grouped by map automatically.
- The guide library refreshes from the website at startup and when the app regains focus (at most once every 15 minutes). Settings → General also offers a manual refresh. A validated saved list and the included list provide fallbacks when a check fails.
- Settings → General can check the latest official Windows release and open its installer/portable downloads.

## Development
```
npm install
npm start
```

To preview website changes locally, start the Nuxt server in the repository root,
then run the desktop app from this directory in PowerShell:

```powershell
$env:CW_SITE_URL = 'http://127.0.0.1:3000'
npm start
```

Only HTTP loopback origins are accepted for development. Packaged applications
always load `https://codzmwiki.com`; local changes appear there after the
website is deployed. Progress on localhost is separate from production progress.
The webview keeps its existing persistent browser session and has no access to
the host's settings or filesystem APIs.

Navigation, the public `/desktop-catalogue.json` endpoint and theme files are
generated from the repository's shared catalogue and website theme tokens before
`npm start` and `npm run dist:win`.

## Current game library

The included library contains 96 authored maps, modes and destinations across
13 games, 104 tools and two child quests. Infinite Warfare, WWII, Advanced Warfare,
Vanguard and Modern Warfare III contribute 30 complete guides; the first four
also have 27 puzzle tools. MW3 uses six direct guides covering portal unlocks,
side Easter eggs and boss fights. New tools can be assigned shortcuts in App settings; existing bindings
retain their meanings.

Game metadata and aliases are authored in `../shared/games.mjs`. Run the catalogue
generator after changes. The desktop reads only validated navigation metadata
from its own website; it does not download executable app code. A library refresh
preserves the current page, observations, custom labels and shortcuts.

See [desktop 1.6 implementation and verification](../docs/desktop-1.6-plan.md)
and [the detailed guide research](../docs/remaining-games/README.md).
Guides, images and solvers still load from the website and require a connection.
The saved library is a navigation fallback, not an offline copy of the guides.

## 1.4.0 guide and tool update (historical)

The sidebar covers six guides and fourteen tools, including Paradox Note Order
& Piano. It scrolls the selected tool into view, and the address bar follows
in-page navigation between guides and tools. The website's compact Quick Parts,
scrollable contents and shared puzzle inputs work inside the existing webview.
New catalogue entries appear without resetting custom navigation settings or
progress. If a new default shortcut conflicts with an existing saved binding,
the existing binding wins; assign the new tool a free shortcut in App settings.

## Build (Windows)
```
npm install
npm run dist:win
```
Output in `dist/`: NSIS installer (`CodWiki Setup <ver>.exe`) with Start Menu and
desktop shortcuts, plus a portable Windows ZIP. CI regenerates the shared
catalogue and runs compatibility tests before packaging and publishing.

The existing GitHub workflow publishes `desktop-v<version>` whenever desktop
sources change. Increase the package and lockfile versions for a new release.
The same Git push updates the website through its existing Vercel integration.

For native integration verification, run from this directory:

```powershell
npm run test:native
```

The check uses a hidden Electron window, a loopback fixture server and a new
isolated profile. It exercises real IPC, shortcuts, refresh/recovery and saved
browser state without using your installed app's data.

To check a packaged executable against the live site, run from the repository root:

```powershell
node scripts/verify-desktop-live.mjs 'path/to/CodWiki.exe'
```

This also uses an isolated profile and verifies the live MW3 Red Worm guide and the
official GitHub update check.

## Build on other OS (portable zip, no exe icon/metadata editing)
```
npx electron-builder --win zip --x64 -c.win.signAndEditExecutable=false
```
