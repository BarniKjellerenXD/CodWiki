# Spotlight search plan

Status: built 2026-10-22. It follows the Intel concepts in [mw4-dmz-intel-concepts.md](mw4-dmz-intel-concepts.md): the user liked Quick find (E), the recommended mix and Ask-first (B), and asked for one search that opens from anywhere on the site, with a shortcut and a button, and finds anything (a place on a map, an item, a step).

## What exists today

- The home page has a search box over `app/data/searchIndex.json`: 2,854 entries covering guides, guide sections, quest parts, tools and part of DMZ. It is bundled into the home page (954 KB), so it is not usable anywhere else. Ranking is coarse: exact name, starts with, contains, or anything else.
- Not searchable anywhere:
  - 3,723 interactive-map spots on 72 maps (perk machines, Pack-a-Punch, wall buys, quest items …)
  - about 1,700 quick quest steps
  - the Super Easter Egg steps
  - MW3 rune portals
  - the DMZ key tracker cards
  - the smaller Tac-Map pins
  - Order cards, which had no deep link
- Most of these already have deep links: `#map:<id>` selects a pin on a guide's map, `#quick-step-<id>` opens a step, and `?pin=`, `#intel-` and `#key-` cover DMZ. They just had no search pointing at them.

## Options

### 1. Promote the home search

Move the home search box into a site-wide dialog. Keep the same index and ranking.

- **Pros:** smallest change, and it returns the same results as home.
- **Cons:**
  - Nothing new becomes findable: no map spots, steps, keys or portals.
  - The coarse ranking gets worse as the index grows.
  - The 954 KB index would need splitting anyway.
- **Cost:** low.

### 2. Spotlight: one lazy index of everything, ranked in the browser (chosen)

- A generated index covers every guide, section, quest part, step, tool, map spot, portal and DMZ result.
- It is fetched the first time the dialog opens, then ranked on the device as you type.
- Results are grouped, with a preview pane on wide screens.
- Scope chips: Everything, This map, Zombies, DMZ.
- It also has recent picks, suggestions for the current page, and a few actions.

- **Pros:**
  - Instant results on every keystroke, from any page, including mid-match on a phone with poor signal.
  - New content becomes searchable by adding it to one builder.
- **Cons:**
  - A larger first download when the dialog first opens: about 186 KB gzipped, plus 136 KB of preview text on wide screens only.
  - The index must be rebuilt with the catalogue, which already happens before dev, build and the desktop app.
- **Cost:** medium to high.

### 3. Server search API

A Nitro route ranks results on the server, and the dialog fetches as you type.

- **Pros:** a tiny client, and it could search full guide text.
- **Cons:**
  - A round trip per keystroke, which is poor on a phone mid-match.
  - It breaks `nuxt generate` static output.
  - It runs into the Windows dev issue with shared modules in Nitro (see the `nitro.externals.inline` note in `nuxt.config.ts`).
- **Cost:** medium.

### 4. Separate Zombies and DMZ palettes

Each mode gets its own dialog and index.

- **Pros:** smaller downloads, and each palette is themed for its mode.
- **Cons:**
  - It breaks "search anything from anywhere": a DMZ key can't be found from a Zombies page.
  - Two components to maintain.
- **Cost:** medium.

### 5. A full-text search library (MiniSearch, FlexSearch, Fuse)

- **Pros:** built-in typo tolerance and full-text search.
- **Cons:**
  - A new dependency.
  - The index grows by megabytes if guide prose is included.
  - Fuzzy matching on everything gives noisy results.
  - Guide prose has no linkable units smaller than steps and sections, which option 2 already indexes.
- **Cost:** medium.

**Why option 2:** it is the only option that meets the request: anything, from anywhere, at once. It keeps working on a phone with poor signal, needs no new dependency, and reuses the deep links that already exist. Typo tolerance is built into the ranking (see below) instead of coming from a library.

## How it works

### Data

`scripts/build-spotlight.mjs` runs at the end of `scripts/generate-catalogue.mjs`. It writes two static files to `public/spotlight/` and their content hashes to `app/data/spotlightVersion.json`.

- The dialog fetches the files with `?v=<hash>`, so a rebuilt index is never served stale from a cache.
- They are fetched, not imported. A dynamic `import()` in the composable would sit in the entry chunk, and Nuxt prefetches the entry chunk's dynamic imports on every page. That would download the whole index on every visit.

`public/spotlight/index.json` holds 7,197 results (930 KB, 186 KB gzipped):

- **Rows are arrays:** `[name, kind, route, map, context, keywords, badge]`.
- **Maps are listed once:** `maps[id] = [name, game, aliases, guide route]`. Rows reference a map by id, and a row's route can be stored relative to that map's guide route.
- **The route is each result's id**, so it is unique, and recents survive rebuilds.
- **Spots that share a label on one map**, such as three ammo caches, become one result. It opens the first of them and says how many there are.
- **Contents:**
  - pulled from `searchIndex.json`: guides, sections, quest parts and tools;
  - quick steps from `quickQuests.json`;
  - Super Easter Egg steps;
  - map spots from `app/data/maps/*.json`;
  - rune portals;
  - DMZ: pages (the stations and each Intel shelf), briefing sections, every Tac-Map pin, Orders, key tracker cards, and Intel entries. Each Intel entry opens at `intelHome(entry)` from `shared/dmz-stations.mjs`: its station or shelf with the entry's drawer open. Locations open on the Tac-Map at their pin, keys open the key tracker, and tracked Orders open the Orders tracker.

`public/spotlight/text.json` holds preview text: guide intros, tool help, spot descriptions, step text, Intel and key summaries (630 KB, 136 KB gzipped). It is fetched only when the preview pane shows, including when a window is widened with the dialog open.

### Ranking

The ranking lives in `shared/spotlight.mjs`.

- **Matching:**
  - Every query word must appear in the result's name, kind, context, keywords or map aliases (bo3, Black Ops III …).
  - Words of one or two letters must start a word, so "a" doesn't match everything.
  - Accents are ignored (Kowakujō).
  - Names also match with their spaces removed, so "packapunch", "raygun" and "quickrevive" work.
- **Score:**
  - The name exactly: 1000. Starting with the phrase: 500. The phrase at a word start: 300. Anywhere in the name: 150, for phrases of three letters or more.
  - Per word: 40 at a word start in the name, 20 elsewhere in the name (three letters or more), 4 when it is only in context or keywords. So "ee" finds the Easter egg quests, not every name with "ee" inside a word.
  - Grid squares such as H6 add 60 when the result is in that square.
  - Kind weight: guides and stations above sections above steps.
- **Context:** results from the map you are on get +550; results from the same mode get +30. DMZ has one map, so on DMZ pages every DMZ result gets the +550. So:
  - on the Origins guide, "pack a punch" opens Origins' own Pack-a-Punch before an exact match on another map, while passing mentions don't jump the queue;
  - "origins" on the BO2 Origins guide puts BO2 first;
  - "h6" on a DMZ page lists the Hajin places in H6 before Zombies spots in H6, while "serum" still finds the Zombies tool.
- **Typos:** only when nothing matches exactly, one typo is allowed per word of four letters or more (two for eight or more), checked against result names only. The dialog then says it is showing close spellings.

### Interface

`app/components/spotlight/` and `app/composables/useSpotlight.ts`, mounted in `app/app.vue`.

- **Opening it:** Ctrl K or ⌘K from anywhere, `/` when not typing, a search button beside the settings gear, and a search button in the DMZ station rail.
  - The home page's search box opens it too. Typing there calls `openSpotlight(text)`, and keys typed while the dialog loads follow into its field. Enter in the empty box opens it with recents. When the dialog closes, the box empties and gets focus back. The home page has no index or result list of its own any more, so both searches rank the same way and the home page is usable before the index loads.
  - The shortcuts don't open it over another dialog (settings, an image, the DMZ station menu or an Intel drawer).
  - Ctrl K closes it again, and focus returns to where it was. This also happens with Esc, the Esc button or the scrim, but not after opening a result.
- **Empty query:** recent picks, "On this page" suggestions (this map's guide, tools and quest parts, or the DMZ stations), Try chips and a Jump to row. This is the Ask-first idea from the Intel concepts.
- **Results:**
  - The top hit comes first, then groups (guides and pages, tools, map spots, steps and sections, DMZ).
  - Each group ends in a "Show all" option that the arrow keys reach. Opening a group shows up to 150 of its results, with a note to add a word when there are more.
  - Matched words are highlighted.
  - Arrow keys move, Enter opens, Ctrl Enter opens in a new tab, Esc closes. Esc doesn't also open the DMZ station menu.
- **Accessibility:**
  - The field is a combobox over one listbox. The listbox holds only options and their groups, and each option's id comes from its result.
  - The result count is announced from inside the dialog.
  - Tab stays inside the dialog.
- **Preview pane** on wide screens. Phones get a full-screen sheet with the input at the top and a Cancel button. The layout follows the window when it is resized or rotated while open.
- **Actions:** reading settings, themes, and switching between Zombies and DMZ.
- **Look:** charcoal and gold with the site themes on Zombies pages, and the DMZ look on DMZ pages.

### Landing

Destinations highlight what was picked:

- guide steps, phases and headings;
- map pins, through the existing `#map:` selection;
- Order cards, via the new `#order-<id>`;
- key cards, through their existing `is-target`;
- Intel entries, which open in the DMZ shell's Intel drawer over their station, with the entry's row scrolled into view behind it.

## Checks

- `tests/spotlight.test.mjs`:
  - every route opens a real page;
  - every hash or query points at a real step, pin, spot, key, Order, Intel entry or section;
  - coverage of every source;
  - ranking cases (serum, Bale, Kino, Kowakujō, BO2 and BO3 Origins in context, the jugernog typo, H6 in DMZ and on DMZ pages, packapunch, raygun, ee);
  - scopes and grouping;
  - size budgets, and version hashes that match the files;
  - nothing in `app/` refers to the data files except the composable's fetch, so the index stays out of page bundles and prefetches;
  - the home page hands its text to Spotlight, and nothing in `app/` imports `searchIndex.json`.
- The old home-search cases (serum, Kowakujō, BO2 Survival maps, edition names and aliases) now run on the Spotlight index in `companion`, `classic` and `game-library` tests.
- Browser checks at 1440, 1024, 768 and 375 widths on the home page, a guide, a tool and DMZ pages, covering keyboard flows, themes and the console.

## Later

- Done 2026-10-22: the DMZ stations from the Intel plan shipped, and the builder sends Intel results to their station through `intelHome`.
- Give generic spot labels ("Wall Buy (M14)") their map's area names when the map data gains them, so duplicate spots on large maps can be told apart.
