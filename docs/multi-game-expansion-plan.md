# Multi-game guides and tools expansion plan

Date: 28 September 2026. Status: proposal only; no application changes implemented.

## 1. Recommended direction

Expand CodWiki into a Zombies companion organized as **Game → Map → Guide and tools**. Keep the existing reading experience and visual theme. Add a game layer to the shared catalogue so the website and Windows app use the same names, relationships and destinations.

On the homepage, build on the existing Black Ops 7 heading: show a vertical list of collapsible game sections. In the desktop app, use the same hierarchy in its sidebar. Search, recent activity and optional favorites provide shortcuts around that hierarchy.

Initial game order: **Black Ops 7, Black Ops Cold War, Black Ops 4, Black Ops 3**. This is display order, not implementation priority. Add other games in their appropriate position when their first useful content is ready; avoid empty "coming soon" sections.

Use community guides as research for maintained CodWiki walkthroughs. Write concise instructions suited to Quick Parts and Full Details, credit the sources, and place helpers beside the steps that need them. The published guide should work without a live Reddit request.

**First expansion release: three guides and five helpers.**

| Game | First map | First helpers |
| --- | --- | --- |
| BO3 | Origins, explicitly the Zombies Chronicles version | Ice Staff symbol decoder; Staff Upgrades reference and tracker |
| BO4 | Dead of the Night | Zodiac ordering helper; Alistair's Folly symbol recorder |
| Cold War | Mauer der Toten | CRBR-S safe combination recorder |

Build Mauer first as a smaller implementation trial, then Origins and Dead of the Night. Together they exercise a simple recorder, symbol input, branching upgrades, a calculation, and game/version labels. Priorities are based on usefulness and implementation coverage, not measured audience demand.

Next add Der Eisendrache and Gorod Krovi, then expand the three game libraries in small batches. Interactive map artwork is a later addition for new maps, so it does not hold up usable guides and tools.

## 2. What the current project already provides

This plan is based on the current repository and selected community sources. It is not an in-game verification or a visual audit of the deployed website.

| Existing foundation | Consequence for this plan |
| --- | --- |
| `shared/catalogue.json` holds six BO7 maps and fourteen standalone tools. | Extend the existing source of truth rather than maintain separate lists for each client. |
| `scripts/generate-catalogue.mjs` generates website data, search and desktop navigation. | Generate game grouping and labels here too. |
| `app/pages/index.vue` has a hardcoded BO7 heading and one shared map grid. | Replace the single section with reusable game sections. |
| `GuideArticle.vue` supplies Quick Parts, Full Details, saved progress and a Map view. | Reuse the reader, making optional features conditional. |
| `PuzzlePage.vue`, `PuzzleWidget.vue` and `usePuzzleState.ts` share inline and standalone helpers. | Add new helpers through a registry and reuse the same state in both placements. |
| Desktop `groupNavigation()` currently groups only by map. | Add game grouping above maps while preserving saved labels, hidden entries and order. |
| The desktop webview loads the website, but `renderer/nav.js` is bundled with the app. | A site deployment updates page content; a new sidebar catalogue currently needs an app release. |
| `/wiki/[page]` fetches Reddit at runtime; the main guides are local Vue content. | Build new maintained guides with the local content path. |
| `convert-guides.mjs` is a protected, one-off BO7 migration script. | Do not turn it loose on maintained guides or reuse it as a bulk import pipeline. |
| Progress is local to each browser/app profile. | This expansion can preserve local progress; cross-device synchronization is a separate feature. |

## 3. Navigation ideas considered

| Idea | Strength | Limitation | Decision |
| --- | --- | --- | --- |
| Stack a full map grid for every game | Closest to the current homepage | Produces a very long page as the library grows | Use collapsible sections instead |
| Horizontal game tabs | Fast switching with a few titles | Becomes crowded on phones and when more games arrive | Optional compact switcher inside a guide later |
| A single game dropdown | Compact | Hides the available library and makes discovery weaker | Useful as a tools filter, not the homepage structure |
| A permanent game/map tree everywhere | Clear hierarchy and direct access | Consumes reading space on the website, especially alongside guide contents | Use in the desktop sidebar |
| Separate game homepages | Clear links and room for game-specific content | Adds an extra step if it is the only way in | Add lightweight hubs using the same catalogue |
| A search-only start screen | Excellent for players who know the name | Poor for browsing unfamiliar maps and seeing coverage | Keep search as a shortcut |
| A favorites-first dashboard | Fast for repeat players | New users have nothing saved; favorites alone do not organize the library | Add a small optional area after the first release |

**Chosen combination:** collapsible game sections on the website, a nested game/map sidebar in the desktop app, and shared global search. Add direct game hub links without requiring players to visit a hub before opening a map.

### Website behavior

1. Keep the existing homepage introduction, Continue card and search.
2. Below them, show the four game headings vertically. Expand BO7 for a first visit; restore the last expanded game on later visits. Allow users to open additional sections deliberately.
3. Each heading shows its name and the number of published guides/tools, plus an explicit expand button and separate game-hub link.
4. Inside a game, show compact map cards: map name, thumbnail, saved progress if relevant, Open guide and a tool-count link. A map should be reachable directly from this screen.
5. Keep tools beside their map and beside relevant guide steps. Retain the existing tools directory with Game, Map and tool-type filters; default it to the selected game. Preserve `/#tools` links.
6. Put game-wide quests, such as BO7's Super Easter Egg, inside their game section above its map list.
7. Within BO3, use simple subheadings for original maps and Zombies Chronicles. These are labels, not another mandatory navigation level.
8. Add a compact game/map switcher and breadcrumbs to guide/tool headers. Keep the existing contents panel focused on the current guide's sections.
9. On phones, use the same vertical sections. Put the game/map browser in a drawer; avoid placing another permanent sidebar beside the reader.

### Desktop behavior

```text
Search guides and tools
Continue / Favorites                 [favorites added after the pilot]

v Black Ops 7
    Super Easter Egg
  > Ashes of the Damned
  > Astra Malorum
  > ...
> Black Ops Cold War
> Black Ops 4
v Black Ops 3
  > Der Eisendrache                   [later release]
  v Origins · Zombies Chronicles
      Guide
      Ice Staff Decoder
      Staff Upgrades
```

- Opening a guide or tool reveals its game and map, including when reached through a shortcut or a link inside the webview.
- Remember expansion choices, scroll position and the selected item. Game switching must not reset a run.
- Search temporarily reveals matching groups; clearing the search restores the user's expansion state.
- Keep all visible tools under their map. User ordering can change games, maps within a game, and tools within a map without detaching tools from their parent.
- Preserve existing shortcut assignments. New entries can have no default shortcut; users can assign one. Do not attempt to assign a numbered shortcut to every future guide.
- Keep the website's game browser compact inside the webview so the desktop sidebar does not compete with a second permanent navigation tree.
- Use disclosure buttons with `aria-expanded`, native keyboard operation and visible focus. Expand/collapse must not navigate accidentally.

### Search and returning to a run

- Search guides, sections, quick parts, game-wide quests and tools across all published games by default.
- Display context such as `BO3 · Origins · Tool` on every result.
- Add aliases such as `BOIII`, `BO3`, `Cold War`, `CW`, `DE`, `DOTN`, `PaP`, and `ice staff`. Ambiguous results must retain their game labels.
- Apply the game name and aliases to every kind of search entry, not just whole-guide results.
- Optional game filters narrow results; searching another game must still be possible without navigating away first.
- Opening a helper from a step and returning should restore that guide, reading view and step. Inline and standalone views use the same saved input.
- Keep global Continue as the most recent guide; add per-game recent entries later if useful. Derive identity from catalogue IDs rather than displayed names.

## 4. Turning Reddit guides into CodWiki guides

The [r/CODZombies guide index](https://www.reddit.com/r/CODZombies/wiki/index/) is a strong discovery list. Its Cold War guide links point to COD Tracker, and its maintenance section flags gaps in older guides. Treat the index as a source directory, not as a guarantee of completeness.

Two concrete examples affect implementation:

- The [Origins wiki](https://www.reddit.com/r/CODZombies/wiki/origins/) includes a Chronicles changes section alongside original-game material. Build the BO3 guide deliberately from the appropriate version; do not import every table unchanged.
- The [Shadows of Evil wiki](https://www.reddit.com/r/CODZombies/wiki/shadows-of-evil/) identifies the four-player finale but leaves its final walkthrough unfinished. A complete CodWiki guide needs another source for that part.

### Editorial workflow for one map

1. **Create a source record.** Store the game/version, original URLs, named authors or contributor/history links, access date, revision where available, coverage and known gaps.
2. **Inventory the useful content.** Identify setup, prerequisites, quest branches, failure conditions, wonder weapons, parts, rewards and puzzle inputs. Separate main-quest requirements from optional content.
3. **Check critical claims.** Cross-check player-count requirements, mode restrictions, puzzle mappings, irreversible quest steps and reset behavior against another walkthrough or gameplay evidence. Record disagreements instead of silently selecting a rule.
4. **Write the CodWiki guide.** Use original concise wording and the site's layout. Credit and link the community sources. Use original or permitted illustrations; record attribution and reuse terms for any copied assets or substantial licensed text.
5. **Create Quick Parts.** One completion control per meaningful objective, short actionable bullets and direct links to the matching full section. Stable IDs must survive wording changes.
6. **Add helpers at the point of use.** Include an inline helper or a clearly named tool link, with the same helper available from the map's tool list.
7. **Review as a player.** Follow the guide from setup through completion, verify ordering and prerequisites, and check that missing images do not make a step unusable.
8. **Publish a complete slice.** Release the guide and its working helper together. Keep unfinished imports outside public navigation and search.
9. **Maintain reviewed updates.** Check source revisions when revisiting a map or receiving a correction; review the difference before changing published instructions. Do not automatically replace authored content.

A future import assistant can extract headings, links and draft source notes into a staging directory. It should not overwrite authored guides or publish arbitrary source HTML. Imported markup needs an allowlist and safe URL handling before preview; HTML stripping with regular expressions alone is not a content boundary.

### Standard guide template

| Area | Content |
| --- | --- |
| Header | Game, map/version, main-quest availability and relevant player/mode requirements |
| Setup | Power, Pack-a-Punch, essentials and equipment needed for this objective |
| Quick Parts | Compact route through the selected quest, with clear prerequisites |
| Full Details | Explanations, locations, diagrams, troubleshooting and branch differences |
| Wonder weapons / buildables | Separate upgrade paths and part references |
| Side quests | Optional rewards and activities, kept outside main-quest progress |
| Tools | Solvers, recorders, references and trackers relevant to this map |
| Map | Shown only when there is a verified interactive map dataset and suitable artwork |
| Sources | Credits, source links, review date and specific unresolved limitations |

Survival maps can use a setup checklist instead of a main-quest checklist. Outbreak needs a mode overview and separately tracked quests, with region-specific references. Neither should be forced into a conventional boss-quest template.

## 5. Guide and tool backlog

These are proposed product features. A source link supports the underlying feature, not a claim that the future tool's implementation has been verified. Full puzzle tables, symbols, variants and outputs still need verification before development.

Tool types:

- **Solver:** computes an answer from clues, using a verified rule or lookup.
- **Recorder:** remembers an observed code or sequence; does not infer information the player has not collected.
- **Tracker:** tracks actions, parts or milestones.
- **Reference:** makes a fixed pattern, location list or upgrade path easy to retrieve.

### Black Ops 3

| Map | Tool ideas | Priority |
| --- | --- | --- |
| [Origins — Chronicles](https://www.reddit.com/r/CODZombies/wiki/origins/) | Ice Staff symbol decoder; four-staff upgrade reference/tracker; later Fire Staff symbol lookup, Lightning Staff reference and generator/part tracker | Pilot |
| [Der Eisendrache](https://www.reddit.com/r/CODZombies/wiki/der-eisendrache/) | Bow upgrade selector/tracker; Void Bow clue recorder; terminal sequence recorder; equipment checklist | Next |
| [Gorod Krovi](https://www.reddit.com/r/CODZombies/wiki/gorod-krovi/) | Valve solver; bomb-order recorder; S.O.P.H.I.A. task tracker | Next |
| [Shadows of Evil](https://www.reddit.com/r/CODZombies/wiki/shadows-of-evil/) | Train symbol recorder; ritual/egg tracker; four-player finale role checklist | Next, after closing source gaps |
| Zetsubou No Shima | Plant recipe reference; watering/round log; KT-4 upgrade and trial checklist | Research backlog |
| Revelations | Buildable/upgrade checklist; bone and other collectible tracker; sequence recorder where verified | Research backlog |
| The Giant | Fly Trap target reference and tracker | Coverage batch |
| Moon — Chronicles | Simon sequence recorder; excavator reference; quest equipment checklist | Research backlog; verify BO3 differences |
| Shangri-La — Chronicles | Matching-symbol notebook; co-op role and step checklist | Research backlog |
| Ascension — Chronicles | Quest equipment and player-role checklist | Coverage batch |
| Nacht der Untoten, Verrückt, Shi No Numa, Kino der Toten — Chronicles | Setup, location and side-quest references where useful | Coverage batch; no invented main-quest solver |

The complete BO3 library target is its six original maps plus eight Chronicles maps. Keep original-game versions separate when BO1/BO2/WaW are eventually added.

### Black Ops 4

| Map | Tool ideas | Priority |
| --- | --- | --- |
| [Dead of the Night](https://www.reddit.com/r/CODZombies/wiki/dead-of-the-night/) | Zodiac sum/order helper; Alistair's Folly symbol recorder; later silver-bullet parts tracker and fireplace-order reference | Pilot |
| [Voyage of Despair](https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/) | Clock-to-dial helper; planet-order recorder; elemental outlet tracker | Next |
| [Blood of the Dead](https://www.reddit.com/r/CODZombies/wiki/blood-of-the-dead/) | Morse input notebook; symbol/number reference; challenge tracker | Next; verify current Morse method first |
| [IX](https://www.reddit.com/r/CODZombies/wiki/ix/) | Ra symbol-order recorder; Danu preparation/round tracker; skull-location reference | Next |
| [Ancient Evil](https://www.reddit.com/r/CODZombies/wiki/ancient-evil/) | Gauntlet selection and upgrade tracker; challenge reference | Coverage batch |
| [Alpha Omega](https://www.reddit.com/r/CODZombies/wiki/alpha-omega/) | Rushmore code lookup; clock/code recorder; Ray Gun upgrade tracker | Coverage batch |
| [Tag der Toten](https://www.reddit.com/r/CODZombies/wiki/tag-der-toten/) | Challenge-totem tracker; item-location reference; quest-step tracker | Coverage batch |
| [Classified](https://www.reddit.com/r/CODZombies/wiki/classified/) | Project Skadi code recorder; setup/high-round milestone checklist | Coverage batch; distinguish survival objective from puzzle quest |

All eight BO4 maps belong in the eventual library. Chaos/Aether can be small labels or filters later; they do not need another layer in the main navigation.

### Black Ops Cold War

| Map/mode | Tool ideas | Priority |
| --- | --- | --- |
| [Mauer der Toten](https://tracker.gg/cold-war/articles/black-ops-cold-war-zombies-mauer-der-toten-guide) | CRBR-S safe recorder; Klaus upgrade checklist embedded in the guide | Pilot |
| [Firebase Z](https://tracker.gg/cold-war/articles/black-ops-cold-war-zombies-firebase-z-guide) | RAI K-84 dartboard helper; Mimic memory tracker; satellite reference | Next |
| Die Maschine | D.I.E. upgrade selector/reference; buildable checklist; main-quest tracker | Next; find a readable complete source |
| [Forsaken](https://tracker.gg/cold-war/articles/black-ops-cold-war-zombies-forsaken-guide) | Chrysalax acquisition checklist; crystal/part tracker; boss preparation reference | Coverage batch; verify each proposed feature |
| [Outbreak](https://tracker.gg/cold-war/articles/black-ops-cold-war-zombies-outbreak-guide) | Separate Ravenov Implications and Operation Excision checklists; region reference selector; observed radio/signal notebook; later game-wide quest completion checklist | After round-based maps |

Treat Outbreak as one mode hub with two main-quest entries, not as several copies of a conventional map. The initial Cold War target is four round-based maps plus that hub. Dead Ops Arcade and Onslaught are later scope.

### More ideas, ranked by when they help

| Feature | Decision |
| --- | --- |
| Inline helper + full-page helper with shared inputs | Include from the pilot |
| Compact prerequisites and mode/player requirements | Include from the pilot |
| Game-aware global search and aliases | Include in the foundation |
| Game-wide quest/completion area | Support structurally now; add content when verified |
| Favorite maps and tools | Add after the pilot |
| Personal quest notes attached to a step | Useful later; keep locally saved |
| A compact view of pinned helpers for a second monitor | Useful later; start by reusing standalone tool pages |
| Simple co-op role assignments saved on one device | Useful later for relevant maps; do not imply live team synchronization |
| Guided setup vs main quest vs wonder weapon paths | Add after the template proves useful; keep progress for each objective distinct |
| A "what do I need before starting?" checklist | Start as concise guide content, then consider filters |
| Interactive maps and room/part location search | Add selectively after guide publication and artwork verification |
| Source credits and a last-reviewed date | Include from the pilot |
| Structured correction reports with map/step context | Add later using an existing appropriate feedback channel |
| Downloadable offline game packs | Separate project; the current desktop error/retry screen is not offline guide support |
| Shared party sessions or cloud progress | Later; requires a service, identity and conflict handling |
| Screenshot OCR or automatic audio/Morse recognition | Research later; manual inputs must work first |
| Automatic game-state detection or overlays | Separate scope; not required for this content expansion |
| BO6, BO2, BO1, WaW, IW and WWII sections | Future library additions using the same structure |

## 6. Concrete behavior of the first five helpers

| Helper | Player input | Output and interaction |
| --- | --- | --- |
| Origins Ice Staff Decoder | Select the observed tablet symbol | Show the matching target symbol prominently, with an optional comparison reference. Verify the complete mapping before release. |
| Origins Staff Upgrades | Choose a staff and record completed upgrade objectives | Show that staff's route and references. Link to the same Ice Decoder where required. Fixed patterns are references, not invented calculations. |
| Dead of the Night Zodiac | Choose the three observed signs and record their scratch counts | Calculate totals and show the entry order. Blank means unknown; a confirmed absent mark can count as zero. Flag ambiguous input rather than guess. |
| Alistair's Folly Symbols | Record the symbol observed for each named color | Show a persistent lock reference. Colors also have text labels; recording a clue does not mark the weapon quest complete. |
| Mauer CRBR-S Safe | Record each observed room index and its hidden number | Display the combination in room-index order. Allow corrections and preserve input formatting. This is a recorder, not a code generator. |

Mechanic references: [Origins staff instructions](https://www.reddit.com/r/CODZombies/wiki/origins/), [Dead of the Night weapons and telescope quest](https://www.reddit.com/r/CODZombies/wiki/dead-of-the-night/), and [COD Tracker's CRBR-S guide](https://tracker.gg/cold-war/articles/black-ops-cold-war-zombies-mauer-der-toten-free-crbr-s-guide).

Every helper needs named inputs, an obvious result or incomplete-input state, corrections, undo and reset where stateful, and shared saved input between inline/full-page use. Never show an old answer as current after changing a clue. Avoid requiring a click for every action performed in the game.

## 7. Technical plan

### Catalogue and identity

Extend the current catalogue rather than introducing a database or CMS for this expansion:

| Record | Proposed fields / responsibility |
| --- | --- |
| Game | Stable `id`, full/short names, aliases, display order, hub route |
| Map or mode | Stable `id`, `gameId`, name, existing-style guide route, image, aliases, optional collection label, `kind: map/mode`, publication status and capabilities |
| Tool | Stable `id`, parent map ID, name, route, tool type, optional shortcut and guide-section association; derive game from the parent |
| Quest | Stable `id`, game ID, optional map/mode ID, route and progress identity; supports BO7 Super EE and the two Outbreak quests |
| Source record | URLs, credits, accessed/reviewed dates, version scope, revision if available, coverage gaps and asset attribution |

Capabilities should identify which views actually exist, including quick guide, full guide, main quest and interactive map. Publication status controls whether an entry appears in public output. Do not infer completion from the presence of a source URL.

Identity examples:

```text
Existing BO7 map ID: ashes-of-the-damned           [unchanged]
New BO3 map ID:      bo3-origins
New BO4 map ID:      bo4-dead-of-the-night
New Cold War ID:     cw-mauer-der-toten
New tool ID:         bo3-origins-ice-staff

Game hub:           /games/bo3
New guide:          /guides/bo3-origins
New tool:           /tools/bo3-origins-ice-staff
Existing guide:     /guides/ashes-of-the-damned    [unchanged]
```

Game-prefixed new IDs prevent future collisions such as BO2 Origins versus BO3 Origins. Flat guide/tool routes fit the current progress validator and existing page conventions. Introduce an explicit guide/progress ID or catalogue lookup in reader components instead of relying indefinitely on the final URL segment.

Keep existing BO7 map IDs, step IDs, routes, tool-state keys and pin-storage keys. Add game metadata without renaming the old entries. Preserve the separate BO7 toy/Warden completion model when introducing generic quest metadata.

For Outbreak, use one parent mode ID plus separate quest IDs/progress records. The desktop map group can contain Overview, Quest 1, Quest 2 and Tools at the same depth. Quest completion is distinct from checking off a reading step.

### Content and loading

- Keep existing authored Vue walkthroughs and shared reader components for the first release.
- Add new guide content using stable prefixed filenames; avoid a simultaneous rewrite of all BO7 content into another content system.
- Split new quick-guide/source data into per-guide authoring files as the library grows. Generate the compatibility aggregates consumed by the current reader until it is ready to load per-guide data.
- Move new puzzle components and large datasets to explicit lazy loaders. The present eager `PuzzleWidget.vue` registry should not make every page load every game's tools.
- Keep common UI components for symbol selection, ordered slots and part tracking, but verify each game's rules separately. Similar-looking puzzles do not necessarily share mechanics.
- Generate the search index, website catalogue and desktop navigation from the same published entries. Validate relationships and routes before writing generated output.
- Preserve full-guide heading/anchor indexing when adding explicit quest records or optional views.

### BO7 assumptions that need attention first

| Area | Current assumption | Planned change |
| --- | --- | --- |
| Homepage | One BO7 heading, BO7-specific SEO and fallback names | Render from game metadata and use game-aware labels/descriptions |
| Catalogue generator | Every map receives `bo7` search keywords; Super EE is appended manually | Derive aliases from the parent game and generate quests explicitly |
| Guide reader | Map button is always shown; map ID comes from route tail | Respect capabilities and explicit catalogue identity |
| Guide reset copy | Mentions Super EE toys on every map | Use neutral or game-specific copy while preserving reset behavior |
| Map tests | Every map must have artwork/data and Cursed Mister Peeks entries | Scope artwork tests to maps with that capability; keep the BO7 feature assertions for the maps that support it |
| Companion tests | Every entry needs quick main-quest phases and a unique default shortcut | Validate quick content only when present; allow survival/setup guides and absent shortcuts |
| Quest navigation | Tests exclude BO7 Super EE from desktop navigation | Deliberately replace that rule with game-level quest grouping; keep its existing route and state |
| Puzzle state | Central mappings/validators mainly cover BO7 tools | Register new tools with unique state identities, validators and explicit schema versions |
| Desktop grouping | A flat sequence of map headings and items | Render game groups, map groups and optional game-level quest links |

### Desktop release and catalogue updates

For the pilot, ship the website content first, then a compatible desktop release with the new bundled navigation. An older app can still reach new content through the website homepage; its sidebar will not magically acquire new entries.

After the pilot, the best maintenance improvement is a **versioned navigation JSON file generated with the site**. An updated desktop app can read it from the configured site origin, validate it, and keep the last valid catalogue plus a bundled fallback. This removes the need for an installer release for every content-only addition.

That later change must update the app's main-process navigation/action registry, shortcut settings and renderer together. Updating only the sidebar would leave new custom shortcuts unable to resolve. Accept supported data and same-origin relative routes only; never execute remote navigation code. On a missing, invalid or incompatible feed, retain the last valid navigation and all saved user customization. Publish the feed with its destination pages as one site release.

Actual offline guide packs remain separate: a cached list of routes is not cached guide content.

## 8. Delivery sequence

| Phase | Deliverable | Completion check |
| --- | --- | --- |
| 1. Foundation | Game metadata; reusable game sections/hubs; nested desktop navigation; game-aware search; optional guide/map capabilities; compatibility fixes | Existing BO7 routes, tools, progress and shortcuts still work; unpublished fixtures exercise more than one game |
| 2. First complete slice | Mauer guide and CRBR-S recorder, plus the source record and standard guide template | A reader can open a step, use the helper, return and resume on the website and desktop |
| 3. Pilot release | Add Origins and Dead of the Night, with the remaining four helpers | Three new game sections, three guides and five helpers; paired site/app release; no empty advertised tools |
| 4. Useful expansion | Der Eisendrache and Gorod Krovi; then Firebase Z, Voyage, IX, Shadows and Blood in reviewed batches | Each batch adds usable guides and the highest-value associated tools; source gaps resolved per guide |
| 5. Complete the libraries | Remaining BO3/Chronicles, BO4 and Cold War maps; Outbreak with distinct quest progress | Coverage grows without changing the navigation model; survival and mode guides work correctly |
| 6. Follow-on improvements | Favorites, remote navigation catalogue, selected interactive maps and other justified extras | Each feature solves an observed problem without blocking content publication |

Phases 4–6 can interleave after the pilot. Prioritize the remote navigation catalogue as the first maintenance improvement when content batches become frequent. Keep the next content batch small, usually two or three maps. Measure the editing and verification effort on the pilot before attaching calendar estimates to all 27 new map/mode hubs.

The eventual requested library is 14 BO3 maps, 8 BO4 maps and 5 Cold War map/mode hubs, in addition to the existing 6 BO7 maps. Separate Outbreak quest pages and game-wide quests are additional entries, not extra maps.

## 9. Validation and definition of done

Implementation should include meaningful automated checks for:

- Unique IDs/routes, valid game/map/tool relationships, published-only navigation and valid internal links.
- Search aliases, game labels and game filters, including fixtures with the same map name in two different games.
- Existing saved BO7 progress, pins, custom labels, hidden entries and shortcut bindings surviving the catalogue extension.
- Progress and puzzle inputs remaining isolated between games, maps and separate Outbreak quests.
- Guide-to-tool return location, shared inline/full-page state, corrections, undo and reset isolation.
- Verified solver examples and invalid/incomplete input. Test a rule independently of the UI; do not validate a lookup solely against another copy of itself.
- Guides without an interactive map displaying no broken Map tab, while existing BO7 map links retain their behavior.
- Conditional tests for BO7-only features instead of weakening those existing checks globally.
- Navigation generated consistently for website and desktop; optional shortcuts and user conflicts handled correctly.

For each release, run the repository tests and production build, then inspect representative pages in a browser and the desktop app. Check narrow screens, keyboard use, 200% zoom, game/map expansion, long lists and return navigation. Recheck the expanded catalogue after release.

A new map is ready when its published objectives have coherent Quick Parts/Full Details, its requirements and sources are clear, its advertised tools work, its links resolve, and its saved state survives navigation/reload. Gameplay verification status must be recorded accurately; source review alone is not a playtest.

## 10. Planning evidence and remaining research

Inspected the homepage, shared catalogue/generator, guide and puzzle shells, saved-state utilities, Reddit viewer/import script, desktop navigation/runtime/settings and relevant tests. No builds or tests were run for this document-only planning change.

Read the Reddit index and selected BO3/BO4 guides, and followed its Cold War links to the original COD Tracker articles. The strongest researched tool candidates are Origins symbols, Dead of the Night zodiac/symbols, Gorod valves/bomb order, Voyage clocks and Mauer's safe recorder.

Before implementing each later candidate, confirm its exact inputs, output, variant restrictions, current source completeness and usable visual references. In particular, close Shadows' finale gap, separate BO3 Chronicles from original-game instructions, validate Blood's Morse approach, and obtain a readable complete Die Maschine source; the index-linked page did not expose a usable walkthrough in this research pass.

This document is the planning deliverable. It proposes no deployment, content import, app release or automated source monitoring at this stage.
