# CodWiki

Source of truth for **codzmwiki.com** (Nuxt 4 site) and the **CodWiki Desktop** Windows app.

[Download the Windows app](https://github.com/BarniKjellerenXD/CodWiki/releases/latest) as an installer or portable ZIP. The website also links to the latest release beneath its homepage introduction.

## Layout

```
app/            Nuxt 4 site source (pages, components, styles)
  pages/guides/ one .vue per guide (including separate Outbreak quests)
  pages/tools/  one .vue per solver, recorder, tracker or reference
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

The homepage searches map guides, detailed sections, quick quest parts and the tool catalogue. Guides have Quick Parts and Full Details views; the six BO7 maps also have interactive Map views, one checkbox per part, pinned sections and scrollable contents. Small map icons beside destinations and grouped location lists open their map; Back to step restores the reader. Maps support pan/zoom (including scroll-to-zoom by default), search, categories and separate region/state layers. Perks includes a Mister Peeks filter for possible Cursed-mode spawns. Shared puzzle components keep inline helpers and full tool pages in sync, with saved inputs, undo and reset. Paradox Junction includes a note-order tracker and piano reference. The Super Easter Egg is accessed from the homepage; its step checkboxes are independent of the five extracted toys and placed Warden.

Progress is stored locally in `codwiki-progress-v1`. Starting a new run clears only that map's checkboxes; pins, reading preferences, other maps, tools and extracted toys remain saved. Website and desktop browser profiles keep their own progress; there is no account or cloud sync.

`shared/catalogue.json` supplies map/tool names, routes and desktop shortcut defaults. Game names, display order and aliases are authored in `shared/games.mjs`; planned map entries live in `shared/planned-maps.mjs`. `node scripts/generate-catalogue.mjs` refreshes the shared catalogue from the authored expansion modules and generates the website catalogue, search index, desktop navigation and desktop theme tokens. It runs automatically before development and builds. Edit quick quest summaries in `app/data/quickQuests.json`; keep step IDs stable so saved progress survives content edits. Full walkthroughs remain in `app/components/guide/`.

Map data lives in `app/data/maps/`; local artwork is in `public/maps/`. The catalogue generator also updates the small quick-step map-link registry. Edit full-guide map buttons and stable anchors in the Vue components; the old one-off HTML converter refuses to overwrite mapped guides. See [interactive map maintenance and verification](docs/interactive-map-verification.md) for the data contract, sources and precision limits.

Run `npm test` for puzzle rules, search, saved progress, reset isolation, guide/map anchors, artwork dimensions and desktop upgrade compatibility. `npm run build` validates the production site. See `docs/puzzle-verification.md` for puzzle research sources and verification limits.

## Multi-game content

The library covers thirteen games with 66 authored map/mode entries and 30 planned entries. BO7, BO6, Cold War, BO4, BO3, BO2, Black Ops and World at War have authored guides. BO6 includes all six round-based maps, from Liberty Falls and Terminus through Reckoning. BO3 separates original maps from Zombies Chronicles; BO2 groups Survival and extra modes separately; Outbreak has two independent quest routes.

Infinite Warfare (5 entries), WWII (11 maps and modes), Advanced Warfare (4), Vanguard (4) and Modern Warfare III (2023; 6 destinations) have searchable map entries marked **Guide planned**. WWII distinguishes The Tortured Path story chapters from their survival maps; MWIII covers Urzikstan, four seasonal Dark Aether destinations and the Unstable Rift. These entries provide edition and mode context, with no walkthroughs, puzzle tools, artwork or progress invented for them. Modern Warfare III means the 2023 Zombies game; MW3 2011 Survival is outside this expansion.

The website keeps its sticky game rail on wide screens and compact game selector on phones. Planned games use compact text rows, and the game rail scrolls independently on short screens. The desktop sidebar remembers one selected game, shows its map list and reveals a map's tools when expanded. A map with one destination opens directly. Global search crosses games and matches aliases and accents; clearing it restores the selected game's list. Restored pages, guide links and shortcuts select the matching game automatically. Existing labels, hidden entries, ordering, shortcut assignments and progress remain compatible; new entries have no default shortcut. See [game library scope and verification](docs/game-library-plan.md).

Author expansion guides in `shared/expansion-guides.mjs`, tool definitions in `shared/expansion-tools.mjs`, and reviewed lookup facts in `shared/expansion-references.mjs`. `scripts/generate-expansion.mjs` is run by the catalogue generator and emits the Vue pages, detailed guide components and quick-step data. Do not edit those generated expansion files directly. Existing BO7 content remains authored in its original files. Keep guide, phase, step and tool IDs stable when improving prose.

New tools share the existing versioned state and undo/reset behavior. Calculations live in `app/utils/expansionTools.mjs`; the shared form renderer loads lazily. The ice/fire glyphs are locally drawn SVGs. Text notebooks are explicitly labelled recorders; they do not infer unknown glyphs. The interactive Map view appears only for maps with a dataset.

BO4 guides include illustrated setup, main quests, equipment branches and boss instructions. Their authored modules are `shared/blood-of-the-dead.mjs` and `shared/bo4-*.mjs`; specialized tools share saved state between inline and full-page views. See `docs/bo4-guide-redesign.md` and the per-map research files for sources, choices and validation. Full in-game walkthrough verification remains outstanding.

All six original BO3 maps have illustrated setup, full quest routes, equipment upgrades and side Easter eggs. Author them in `shared/bo3-*.mjs`; `shared/bo3-guides.mjs` aggregates the maps, `bo3-tools.mjs` defines eight contextual helpers, and `bo3-references.mjs` holds photographed glyph crops and location data. The generator emits `app/data/bo3References.json`; the UI and pure rules use `app/utils/bo3.mjs`. Existing version-1 observations and quest IDs remain compatible. See [BO3 choices and scope](docs/bo3-guide-plan.md), [research and verification](docs/bo3-research-verification.md), and [image provenance](docs/bo3-assets.json). Zombies Chronicles retains its earlier coverage.

BO6 guides are authored in `shared/bo6-launch.mjs`, `shared/bo6-castle-tomb.mjs` and `shared/bo6-dlc.mjs`, aggregated by `shared/bo6-guides.mjs`. They include illustrated equipment and quest instructions, optional Easter eggs and contextual puzzle tools. Calculators use pure helpers in `app/utils/bo6*.mjs`; custom widgets live in `app/components/puzzle/` and use the existing versioned saved-state system. See `docs/bo6-guide-plan.md`, the three `docs/bo6-*-research.md` files and asset manifests for design choices, source reconciliation and screenshot credits. Add new observations to each tool’s declared `fields` so saved-state sanitization retains them. Run the catalogue generator after changing authored data; do not edit the generated BO6 Vue pages or JSON directly.

See [BO6 implementation and verification](docs/bo6-verification.md) for coverage, tested scenarios and remaining gameplay verification limits.

Cold War now has illustrated guides for Die Maschine, Firebase Z, Mauer der Toten, Forsaken and Outbreak, including both separate Outbreak story quests and reference maps for all eight regions. Author the content in `shared/cold-war-launch.mjs`, `shared/cold-war-finale.mjs` and `shared/cold-war-outbreak.mjs`; `shared/cold-war-guides.mjs` aggregates the guides and six tool definitions. Pure puzzle/location rules live in `app/utils/coldWar.mjs`, with a shared inline/full-page widget in `app/components/puzzle/ColdWar.vue`. Preserve existing progress IDs and version-1 input fields. Mimic-memory and neutralizer trackers redirect to their guide steps. See [design choices](docs/cold-war-guide-plan.md), [research and reconciliations](docs/cold-war-research.md), [image provenance](docs/cold-war-assets.json) and [verification](docs/cold-war-verification.md). Run the catalogue generator after editing authored modules.

BO4 and BO6 now offer 15 and eight active tools respectively, focused on clue solving, visual matching and sequence memory. Duplicate quest trackers have moved back to the guides; their old URLs redirect to the relevant sections. Blood of the Dead includes a clickable Simon Says room recorder with panel photographs and a separate steady-light memory stage. See [tool revision decisions and verification](docs/tool-value-verification.md) for the audit, compatibility behavior and verification limits.
