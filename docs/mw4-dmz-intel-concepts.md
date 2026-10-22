# MW4 DMZ Intel concepts

Status: clickable concepts built 2026-10-22 under `/dmz/lab` (noindex, not in the sitemap, search or station menu). The user picked the recommended mix with the Ask-first landing (B), and it was built the same day; see [Build](#build) and [What shipped](#what-shipped) at the end. The lab stays until the user has compared it with the result.

## The problem

Intel (`/dmz/intel`) is one long page: 590 cards in 16 categories, a text filter and category chips. It holds a lot of good material, but the first screen shows all of it at once. Players have to know how to filter before the page becomes useful, and a phone scrolls a long way to reach anything.

What Intel holds today:

| Category | Entries | Already has a home elsewhere |
|---|---:|---|
| Hajin locations | 93 | Tac-Map place cards |
| Weapons and gear | 82 | |
| Orders and missions | 71 | Orders tracker (for tracked Orders) |
| Keys and locked rooms | 51 | Key tracker in the Stash |
| Rules of the zone | 42 | Briefing, in part |
| Known issues | 42 | |
| Traits | 37 | |
| Enemies and bosses | 32 | Station menu lists a locked Boss Board |
| 3D Printer and crafting | 32 (23 recipes) | Station menu lists a locked 3D Printer |
| FOB stations | 19 | |
| Cash and progression | 17 | |
| Field notes | 17 | |
| Launch and seasons | 17 | |
| Vehicles | 16 | |
| Operators | 14 | |
| Infil and exfil | 8 | |

Confidence: 304 official, 239 confirmed, 47 reported.

What the data and the existing stations suggest players arrive with:

- **A name they already know:** a key they picked up, a Lieutenant on the kill feed, a recipe. They want one card fast.
- **A job in hand:** printing gear, hunting a boss, finishing an Order, getting out alive. They want the few entries that job needs, in order.
- **A topic to read up on:** traits before a run, how the printer works, what changed this season.
- **A doubt:** is this a bug or me, and when is the next season?

The current page serves the first group (if they type) and the third (if they scroll). It does little for the second and fourth.

## Options

Each option has a clickable concept with real Intel data at the URL shown. Scores from 1 to 3 are on the lab index; 3 is best, so cheap builds and light upkeep score high.

### A. Stations — `/dmz/lab/intel-a`

Split Intel into stations that match the FOB: Boss Board, 3D Printer, Operators, Missions, Armory, Field manual and Status. Locations stay on the Tac-Map and keys stay in the key tracker.

- **Best for:** players who think in game terms ("I am at the printer", "who is this Lieutenant?").
- **Pros:**
  - Matches the station menu, which already shows a locked Boss Board and 3D Printer.
  - Each station gets a layout shaped to its job: a boss roster with places and drops, a print planner that adds up materials, the three trait trees side by side.
  - Short pages: less scrolling on phones, and each page title says what it covers.
- **Cons:**
  - Seven pages to keep in step instead of one.
  - No search across everything unless it is added separately.
  - Old `#intel-` links need mapping to the station that now owns each entry.
- **Cost: high.** Seven pages; the shaped ones (Boss Board, 3D Printer, traits) take longest.

### B. Ask first — `/dmz/lab/intel-b`

Intel opens with one question, "What are you doing right now?", and eight answers: first deploy, I found a key, hunting a boss, printing gear, stuck on an Order, getting out, something broke, what is coming. Each answer shows a short, ordered set of entries and the tool that helps.

- **Best for:** new players, and anyone who opens Intel without a name to search for.
- **Pros:**
  - The friendliest first screen: one question instead of 590 cards.
  - Each answer is short and in reading order, with the right tracker one tap away.
  - Cheap: the database stays as it is; answers are lists of entry IDs and filters.
- **Cons:**
  - Hand-picked answers go stale as Intel grows, so they need a check after each research round.
  - One extra tap for players who already know what they want.
  - "See everything" still ends on today's long list.
- **Cost: low to medium.** One page and a list of answers; keeping answers current is the ongoing cost.

### C. Dossiers — `/dmz/lab/intel-c`

A compact directory of names replaces the wall of cards. Each entry opens as its own dossier with every fact, its sources, the Tac-Map places that list it, and related entries (entries it names, entries that name it, entries at the same places).

- **Best for:** sharing one thing in squad chat, and reading sideways from a boss to their key to their mission.
- **Pros:**
  - Every entry gets a link worth sharing.
  - Room for all facts and sources, plus places and related entries.
  - The directory is dense but calm: names only, grouped, with a filter.
- **Cons:**
  - 590 short pages could look thin to search engines, so most would need noindex or merging.
  - Comparing things, such as traits or recipes, means opening them one by one.
  - Related links are matched from text and need tuning to avoid noise.
- **Cost: medium.** One directory and one dynamic page; related links and search-engine care add more.

### D. In the field — `/dmz/lab/intel-d`

No separate Intel page. Entries appear where the question comes up: an Order lists the recipes and places it names, a Tac-Map card lists its bosses and keys, a key shows its rooms. Any entry opens in a drawer without leaving the station.

- **Best for:** players mid-run who do not want to change page.
- **Pros:**
  - Answers sit next to the task: the Preparation Order shows what its backpack and vest cost to print.
  - No context switch mid-run; the drawer keeps your place.
  - Makes the stations people use most, the trackers and the map, more useful.
- **Cons:**
  - Rules, bugs and dates have no station, so they still need a home.
  - Linking Orders and places to entries needs upkeep.
  - Touches the Tac-Map and the trackers, which other work is changing now.
- **Cost: medium to high.** Spread across three stations, plus a home for what is left over.

### E. Quick find — `/dmz/lab/intel-e`

Intel becomes a search palette. Press `/` or `Ctrl K`, type a few letters, and pick from ranked results with a live preview. A grid square such as `H6` lists the places in it.

- **Best for:** players who know the name.
- **Pros:**
  - The fastest path when you know the name: type, arrow, Enter.
  - Ranked results put name matches first, unlike today's plain filter.
  - Works from every station, which suits a second screen during a match.
- **Cons:**
  - No help for players who do not know what to ask.
  - Little browsing; categories become a row of chips.
  - Phone keyboards cover half the results, so the layout needs care.
- **Cost: low to medium.** One component in the DMZ shell and a ranking helper.

### At a glance

| | Friendly first screen | Finding a known name | Browsing a topic | Use mid-run | Light upkeep | Cheap to build |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| A Stations | 2 | 1 | 3 | 2 | 2 | 1 |
| B Ask first | 3 | 1 | 2 | 1 | 1 | 2 |
| C Dossiers | 2 | 2 | 2 | 1 | 2 | 2 |
| D In the field | 2 | 1 | 1 | 3 | 1 | 1 |
| E Quick find | 1 | 3 | 1 | 3 | 3 | 3 |
| **Mix A + E + B** | 3 | 3 | 3 | 3 | 2 | 1 |

## Recommendation: Stations + Quick find, with Ask-first as the landing

Concept: `/dmz/lab/intel-mix`.

Stations (A) carry browsing. Quick find (E) sits in the DMZ shell on every page for names you know. The Ask-first tiles (B) become the Intel landing and point each question at the station or tracker that answers it.

Why this mix:

1. **It answers the complaint directly.** No page dumps everything; each station does one job.
2. **It finishes what the site already promises.** The Boss Board and 3D Printer are locked stations in the menu today.
3. **Quick find keeps what the current page does well**, searching everything at once, and makes it reachable from any station.
4. **It ships one station at a time.** Old `#intel-` links can redirect to the station that owns each entry, so nothing breaks between steps.
5. **It skips the risky parts for now:** no 590 thin pages (C) and no rework inside the Tac-Map while another session is changing it (D).

What it borrows: the entry drawer from D (any entry opens over the current station, with Back for related entries) and the related-entry groups from C inside that drawer.

What it leaves for later: per-entry pages (C) and Intel inside Order and Tac-Map cards (D). Both can be added once the stations exist, because the drawer and the related-entry helper are the same pieces.

Cost: high overall, but in steps that each ship on their own.

## Step-by-step plan

Each step ends with `npm test` green and a check at desktop and phone widths.

1. **Shared pieces.** Move the entry card, the drawer and the ranking helper out of the lab into `app/components/dmz/` and a small shared module. Tests for ranking (name first, every word must match) and for the drawer's Esc handling (closes the drawer without opening the station menu).
2. **Quick find in the shell.** Add a search button to the rail and dock in `app/pages/dmz.vue`, plus `/` and `Ctrl K`. Results open in the drawer. Grid squares list places and link to the Tac-Map pin. This alone helps today's Intel page.
3. **Unlock the Boss Board.** Add the route, take the lock off its entry in `dmzStations`, add it to `dmzPages` with its own title and description, and regenerate the search index and desktop nav. Tests: page file exists, indexable, in the sitemap, every enemy entry shown.
4. **Unlock the 3D Printer.** Recipe list with the material planner. Save the plan locally the same way the Orders tracker saves its state. Tests: every recipe's materials parse; totals add up. Some named parts have no rarity in the data yet; fill those in during a research round.
5. **Operators and traits station.** Three trees side by side (tabs on phones), then Active Duty, MIA and Dog Tags entries.
6. **Missions, Armory, Field manual and Status.** The generic station list with a filter, grouped by type. Status shows issues by fix state and a dated timeline.
7. **Intel becomes the landing.** `/dmz/intel` shows the Ask-first tiles and Quick find. Its existing hash handler maps each `#intel-<id>` (and any `?c=` category link) to the owning station, so old links keep working. Search index routes for Intel entries move to their stations. Keep the full list one tap away as "Everything" for as long as people use it.
8. **Links from the map and trackers.** Point Tac-Map cards, the key tracker and Orders at the new stations, coordinated with whoever owns the Tac-Map at the time.
9. **Remove the lab.** Delete `app/pages/dmz/lab.vue`, `app/pages/dmz/lab/`, `app/components/dmz/lab/`, `shared/dmz-lab.mjs`, `dmzLabPages` in `shared/dmz.mjs` and its loop in `shared/seo.mjs`, and `tests/dmz-lab.test.mjs`.

## The concepts

| URL | What to try |
|---|---|
| `/dmz/lab` | Side-by-side comparison, scores and the recommendation |
| `/dmz/lab/intel-a` | Stations; `?s=printer` and add a few recipes; open any entry |
| `/dmz/lab/intel-b` | Ask first; pick "Stuck on an Order" or "Hunting a boss" |
| `/dmz/lab/intel-c` | Dossiers; open Bale and follow a related entry |
| `/dmz/lab/intel-d` | In the field; switch between Orders, Tac-Map card and key |
| `/dmz/lab/intel-e` | Quick find; press `/`, type `bale` or `H6`, use the arrow keys |
| `/dmz/lab/intel-mix` | The recommended mix |

How the lab is wired:

- `app/pages/dmz/lab.vue` is a parent route inside the DMZ shell; the concept pages are in `app/pages/dmz/lab/`.
- Components are in `app/components/dmz/lab/`; data helpers are in `shared/dmz-lab.mjs` (read-only use of the Intel, Orders and Tac-Map data).
- Page titles and descriptions are in `dmzLabPages` in `shared/dmz.mjs`. `shared/seo.mjs` registers them as non-indexable, so they get `noindex, follow`, no canonical, and stay out of the sitemap. They are not in `dmzPages`, so the catalogue generator leaves them out of site search and the desktop nav.
- Every concept page shows a "Concept" banner with links to the others. `tests/dmz-lab.test.mjs` checks this, the noindex rules, and the data the concepts rely on.

Known rough edges, fine for drafts:

- Related entries are matched from text, so a few are wrong. For example, a weapon called Dreadnought links to the Dreadnought vehicle.
- The printer plan and the chosen station are not saved between visits.
- In E, Quick find works on its own page only; the real version belongs in the shell (step 2).
- C shows where a dossier URL would live, but no such route exists.

## Build

The user chose the mix: "So i really like mixed and B". Quick find in the shell (step 2) shipped first as the site-wide Spotlight search (`docs/spotlight-search-plan.md`). This section covers the rest.

### Options for where the stations live

1. **Everything on `/dmz/intel`, with stations as `?s=` tabs, as in the mix concept.**
   - Pros: one page to build, and it matches the concept exactly.
   - Cons:
     - Tabs are not separate pages: one title, one description, and a heavy page.
     - The Boss Board and 3D Printer in the station menu would still have no page of their own.
2. **Every station in the rail: seven new stations beside the five live ones.**
   - Pros: every shelf is one click from anywhere.
   - Cons:
     - The rail already holds eight icons. Twelve or more overflow a laptop screen.
     - Missions, Armory, Field manual and Status are not FOB stations, so the game menu would no longer match the game.
3. **FOB stations as pages, the rest as Intel shelves (chosen).**
   - The Boss Board, 3D Printer and Operators are FOB stations that the menu already lists, so they become `/dmz/boss-board`, `/dmz/printer` and `/dmz/operators`.
   - Intel's own shelves sit under it:
     - `/dmz/intel/missions`
     - `/dmz/intel/armory`
     - `/dmz/intel/field-manual`
     - `/dmz/intel/status`
     - `/dmz/intel/all`, the full list, kept as "Everything".
   - `/dmz/intel` becomes the Ask-first landing.
   - Pros:
     - Each page has its own title for search engines.
     - The menu matches the game, and the rail does not grow.
   - Cons: more pages to keep in step. Shared components and one helper module keep that cost down.
4. **One page per entry (`/dmz/intel/<id>`), from concept C.**
   - Rejected for now: 590 thin pages, as the concept warned.

### Options for opening an entry

1. **A drawer in each page, with its own state, as in the lab.**
   - Cons: the Tac-Map and the trackers would need their own copies. Phone Back leaves the page instead of closing the sheet. Links to one entry cannot be shared.
2. **One drawer in the DMZ shell, opened by the address `#intel-<id>` (chosen).**
   - Any DMZ page can open any entry, including the Tac-Map, the key tracker and the Orders tracker.
   - Back closes the drawer, which matters on phones.
   - A link to an entry opens it over its station.
   - Related entries open in place, and Back returns to the previous one.

### Where each entry lives

`intelHome(entry)` in `shared/dmz-stations.mjs` names one home per entry. Spotlight, the search index, the old-link redirect and the drawer's "Go to …" link (named by `intelHomeLabel`) all use it.

| Intel category | Home |
|---|---|
| Enemies and bosses | `/dmz/boss-board` |
| 3D Printer and crafting | `/dmz/printer` |
| Traits, Operators | `/dmz/operators` |
| Orders and missions | `/dmz/intel/missions`. Tracked Orders go to `/dmz/orders#order-<id>`. |
| Weapons and gear | `/dmz/intel/armory` |
| Rules, infil and exfil, vehicles, FOB stations, cash, field notes | `/dmz/intel/field-manual` |
| Known issues, launch and seasons | `/dmz/intel/status` |
| Hajin locations | The Tac-Map, at the entry's own pin when it has one, with the drawer open |
| Keys and locked rooms | The key tracker: the key's card when it is tracked, otherwise the drawer over the tracker |

Old `/dmz/intel#intel-<id>` links go to that home. `/dmz/intel?c=<category>` links go to the category's page. `?c=latest` goes to the newest research round on Everything.

### Steps

1. Move the shared helpers from `shared/dmz-lab.mjs` into `shared/dmz-stations.mjs`, and have the lab re-export them so it keeps working. Add the drawer, dossier, row and find components under `app/components/dmz/intel/`, and the shared styles to the DMZ shell.
2. Add the shell drawer for `#intel-<id>`.
3. Unlock the Boss Board.
4. Unlock the 3D Printer. Its plan is saved on the device, as the trackers are.
5. Move Operators from the briefing anchor to its own page.
6. Build the shelves (Missions, Armory, Field manual, Status) and Everything.
7. Turn `/dmz/intel` into the landing: the Ask-first tiles, Quick find, the stations, and redirects for old links.
8. Point the Tac-Map, key tracker and Orders tracker at the drawer and the new pages. Move Spotlight and search-index routes to `intelHome`. Regenerate.
9. Run tests, check desktop and phone widths, and update the docs. The lab stays until the user has compared it with the result.

### What shipped

All nine steps, on 2026-10-22.

- **Pages.**
  - `/dmz/intel`: the landing. Eight Ask-first tiles: First deploy and Getting out answer in place with numbered short reads (`?need=`), and the rest point to the station that answers them. Below them are Quick find, the station cards and the confidence legend.
  - `/dmz/boss-board`: the roster by tier. Each card shows where the enemy is seen (Tac-Map chips), its drops and how to find it, and the forces are listed after the roster.
  - `/dmz/printer`: the recipes, with a plan that adds up materials. The plan is saved on the device (`dmz-printer-v1`), and on phones a bar leads back to the totals.
  - `/dmz/operators`: the rules, then three trait trees side by side (tabs on phones), then traits outside the trees and the Operator entries.
  - The shelves: `/dmz/intel/missions`, `/armory`, `/field-manual` and `/status` (issues by fix state, then a dated timeline).
  - `/dmz/intel/all`: the old full list, kept as "Everything". It still opens cards in place instead of in the drawer.
- **The drawer.** `#intel-<id>` on any DMZ page opens the entry over that page: a side panel on wide screens, a bottom sheet on phones.
  - Related entries open in place, and Back steps through them.
  - Esc, the backdrop and Close return to the page with focus on the row that opened it.
  - A shared link scrolls its row, or the Tac-Map, into view behind the drawer.
- **Old links.** The `dmz-intel-links` middleware on `/dmz/intel` sends old entry links (`#intel-<id>`, `#sources`) and category links (`?c=`, 301) to their new home. It only acts on first loads and links from other pages, so the landing's own drawer and Back are not redirected.
- **Links from other stations.**
  - Tac-Map cards and reports, the key tracker and the Orders tracker open entries in the drawer.
  - Each Order lists the recipes, bosses and places its tasks name.
- **Search.** Spotlight and the search index use `intelHome`, and each shelf has its own result and desktop shortcut.
- **Tests.** `tests/dmz-stations.test.mjs` covers homes, pages, counts, the planner, the landing tiles and the old-link middleware.

Left for later: per-entry pages (concept C), and Intel inside the Tac-Map's own place cards beyond the existing links.
