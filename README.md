# CodWiki

Source of truth for **codguides.wolden.eu** (Nuxt 4 site) and the **CodWiki Desktop** Windows app.

## Layout

```
app/            Nuxt 4 site source (pages, components, styles)
  pages/guides/ one .vue per guide (6 guides)
  pages/wiki/   wiki viewer SPA
  components/   RunChecklist, ImageLightbox, WikiViewer
public/         authoritative static content (guides/*.html, tools/*, images/, fonts/)
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

Guide pages fetch their content from `public/guides/<slug>.html` and render it with the wiki styling (pins, pigpen helper, relic/boss/perk cards). Edit guide content in the HTML files; edit presentation in the `.vue` files.

## Desktop app

See `desktop-app/README.md`. Pushes touching `desktop-app/**` build+attach a `desktop-v*` release automatically.
