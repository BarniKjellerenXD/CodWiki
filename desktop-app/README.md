# CodWiki Desktop

Windows desktop app for **codguides.wolden.eu** (COD Zombies Wiki Viewer).
Electron shell with a sidebar launcher for all guides + solver tools, dark
near-black/gold theme matching the site.

## Features
- Searchable sidebar with one category per map: Guide first, then its tools. The entire sidebar can be collapsed.
- Guides and tools render inside the app; external links open in the system browser
- Keyboard shortcuts: Ctrl+1..9 (guides/tools), Ctrl+H home, F5/Ctrl+R reload,
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
always load `https://codguides.wolden.eu`; local changes appear there after the
website is deployed. Progress on localhost is separate from production progress.
The webview keeps its existing persistent browser session and has no access to
the host's settings or filesystem APIs.

Navigation and theme files are generated from the repository's shared catalogue
and website theme tokens before `npm start` and `npm run dist:win`.

## 1.3.0 companion update

The shell now supports the site's saved quest checklists, Quick Steps / Full
Details reading flow and tool return links. The sidebar can be searched or
collapsed, and the window can be narrowed to 760px. App and reading settings have
distinct labels. New catalogue entries are appended without resetting existing
custom navigation settings.

## Build (Windows)
```
npm install
npm run dist:win
```
Output in `dist/`: NSIS installer (`CodWiki Setup <ver>.exe`) — Start Menu +
desktop shortcuts, proper app icon.

## Build on other OS (portable zip, no exe icon/metadata editing)
```
npx electron-builder --win zip --x64 -c.win.signAndEditExecutable=false
```
