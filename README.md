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
