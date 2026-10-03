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

Navigation and theme files are generated from the repository's shared catalogue
and website theme tokens before `npm start` and `npm run dist:win`.

## Current game library

The shared library contains 66 authored map/mode entries across BO7, BO6, Cold
War, BO4, BO3, BO2, Black Ops and World at War, plus 30 entries marked **Guide
planned**: Infinite Warfare (5), WWII (11 maps and modes), Advanced Warfare (4),
Vanguard (4) and Modern Warfare III (2023; 6 destinations). Planned entries open
working map pages with edition and mode context. Walkthroughs, tools and progress
have not been added for those entries, and they have no default shortcuts.

Game metadata and aliases are authored in `../shared/games.mjs`; planned entries
are authored in `../shared/planned-maps.mjs`. Run the repository's catalogue
generator after changes. See [game library scope and verification](../docs/game-library-plan.md)
for the map/mode distinctions, compatibility checks and validation limits.

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

## Build on other OS (portable zip, no exe icon/metadata editing)
```
npx electron-builder --win zip --x64 -c.win.signAndEditExecutable=false
```
