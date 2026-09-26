# CodWiki

Source of truth for **codguides.wolden.eu** (Nuxt 4 site) and the **CodWiki Desktop** Windows app.

## Layout

```
app/            Nuxt 4 site source (pages, components, styles)
  pages/guides/ one .vue per guide (6 guides)
  pages/tools/  one .vue per solver tool (14 tools)
  pages/wiki/   wiki viewer SPA
  components/   GuideArticle, ToolShell, content + helper components, RunChecklist, ImageLightbox, WikiViewer
public/         static assets only (images/, fonts/, favicon) + tools/ and map artwork under maps/
desktop-app/    CodWiki Desktop (Electron, Windows) — releases via GitHub Actions (desktop-v*)
```

## Site development

```bash
npm install
npm run dev        # dev server
npm run build      # production build to .output/
node .output/server/index.mjs
```

Stack: Nuxt 4 + Vue 3 + Tailwind (v3 config with the gold/orange palette remap — class names stay cyan/fuchsia for history, colors are brand gold/orange; **no blue**).

Everything is Vue: guide content lives in `app/components/guide/*.vue` (rendered server-side via `GuideArticle`), and each tool is a reactive Vue page in `app/pages/tools/` sharing `ToolShell`. Old `/tools/*.html` and `/guides/*.html` URLs 301-redirect via `server/middleware/legacy-redirect.ts`.

## Desktop app

See `desktop-app/README.md`. Pushes touching `desktop-app/**` build+attach a `desktop-v*` release automatically.

## Companion workflow

The homepage searches map guides, detailed sections, quick quest parts and all 14 tools. Each of the six map guides has Quick Parts, Full Details and Map views, one checkbox per part, pinned sections and scrollable contents. Small map icons beside destinations and grouped location lists open their map; Back to step restores the reader. Maps support pan/zoom (including scroll-to-zoom by default), search, categories and separate region/state layers. Perks includes a Mister Peeks filter for possible Cursed-mode spawns. Shared puzzle components keep inline helpers and full tool pages in sync, with saved inputs, undo and reset. Paradox Junction includes a note-order tracker and piano reference. The Super Easter Egg is accessed from the homepage; its step checkboxes are independent of the five extracted toys and placed Warden.

Progress is stored locally in `codwiki-progress-v1`. Starting a new run clears only that map's checkboxes; pins, reading preferences, other maps, tools and extracted toys remain saved. Website and desktop browser profiles keep their own progress; there is no account or cloud sync.

`shared/catalogue.json` is the source for map/tool names, routes and desktop shortcut defaults. `node scripts/generate-catalogue.mjs` generates the website catalogue, search index, desktop navigation and desktop theme tokens. It runs automatically before development and builds. Edit quick quest summaries in `app/data/quickQuests.json`; keep step IDs stable so saved progress survives content edits. Full walkthroughs remain in `app/components/guide/`.

Map data lives in `app/data/maps/`; local artwork is in `public/maps/`. The catalogue generator also updates the small quick-step map-link registry. Edit full-guide map buttons and stable anchors in the Vue components; the old one-off HTML converter refuses to overwrite mapped guides. See [interactive map maintenance and verification](docs/interactive-map-verification.md) for the data contract, sources and precision limits.

Run `npm test` for puzzle rules, search, saved progress, reset isolation, guide/map anchors, artwork dimensions and desktop upgrade compatibility. `npm run build` validates the production site. See `docs/puzzle-verification.md` for puzzle research sources and verification limits.
