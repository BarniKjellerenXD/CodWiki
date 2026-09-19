# CodWiki

Source of truth for **codguides.wolden.eu** (Nuxt 4 site) and the **CodWiki Desktop** Windows app.

## Layout

```
app/            Nuxt 4 site source (pages, components, styles)
  pages/guides/ one .vue per guide (6 guides)
  pages/tools/  one .vue per solver tool (13 tools)
  pages/wiki/   wiki viewer SPA
  components/   GuideArticle, ToolShell, content + helper components, RunChecklist, ImageLightbox, WikiViewer
public/         static assets only (images/, fonts/, favicon) + tool images under tools/
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

The homepage searches map guides, detailed sections, quick quest phases and all 13 tools. Each of the six map guides has Quick Steps and Full Details views, saved checkboxes, pinned sections and mobile contents. Tools retain their inputs and return to the last section of their map guide. The Super Easter Egg is accessed from the homepage; its step checkboxes are independent of the five extracted toys and placed Warden.

Progress is stored locally in `codwiki-progress-v1`. Starting a new run clears only that map's checkboxes; pins, reading preferences, other maps, tools and extracted toys remain saved. Website and desktop browser profiles keep their own progress; there is no account or cloud sync.

`shared/catalogue.json` is the source for map/tool names, routes and desktop shortcut defaults. `node scripts/generate-catalogue.mjs` generates the website catalogue, search index, desktop navigation and desktop theme tokens. It runs automatically before development and builds. Edit quick quest summaries in `app/data/quickQuests.json`; keep step IDs stable so saved progress survives content edits. Full walkthroughs remain in `app/components/guide/`.

Run `npm test` for search, saved progress, reset isolation, guide anchors and desktop compatibility checks. `npm run build` validates the production site.
