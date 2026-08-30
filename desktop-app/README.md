# CodWiki Desktop

Windows desktop app for **codguides.wolden.eu** (COD Zombies Wiki Viewer).
Electron shell with a sidebar launcher for all guides + solver tools, dark
near-black/gold theme matching the site.

## Features
- Sidebar shortcuts to all 6 guides and 3 solver tools (Ctrl+1..9)
- Guides and tools render inside the app; external links open in the system browser
- Keyboard shortcuts: Ctrl+1..9 (guides/tools), Ctrl+H home, F5/Ctrl+R reload,
  Alt+←/→ back/forward, Ctrl+= / Ctrl+- / Ctrl+0 zoom, F12 devtools
- Remembers the last page you had open (localStorage persists, so guide pins
  and collapsible-section states survive restarts)
- Same-origin `target=_blank` links navigate in-app; everything else opens externally
- Offline-friendly error page with retry when the site can't be reached

## Development
```
npm install
npm start
```

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
