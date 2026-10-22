# MW4 DMZ progression guide plan

Status: shipped 2026-10-22 as `/dmz/guide`, a mix of G2, G1, G3 and G4 (see Decision), then reframed the same day from armor tiers to game stages. The drafts stay under `/dmz/lab/guide-*` (noindex) as a record.

## The gap

The DMZ section explains *what exists* (Briefing, Intel, Boss Board, 3D Printer) but not *what to do next* across the whole game. A new player has to read several stations and still has to work out an order. The guide follows an account from the first deploy to the endgame in three stages of the game. Armor is one sign of the stage a player is in, next to DMZ level, Orders, Story Missions and bosses; it is not the frame.

| Stage | Signs you are here | The job |
|---|---|---|
| **Early game** | Below DMZ level 37 · 1- and 2-plate vests · the first Orders pages · Tier 1 Story Missions | Learn the three deployments and Dynamic Ops, clear the first Orders pages, unlock the 3D Printer and print 2-plate vests. |
| **Mid game** | DMZ level 37 and up · your first 3-plate vests · Lieutenants on the Boss Board · Tier 2 Story Missions | Hunt Lieutenants, gather the printer materials for better gear, and build Bank Upgrade II and Uncommon Ingredient Printing. |
| **Late game** | Commanders to kill · Tempered and other Ultra vests · Operation Fallen Ember · Prestige and DMZ level 70 | Take on Commanders for the parts only they drop, print Ultra gear and work through the endgame. |

Each stage says what a player there has, what to do in order, what to print or unlock, and how to tell they are ready for the next stage. It is about the account, not a single match: per-run tactics only appear where they matter for moving on.

It should be visual first. The section already has a lot of text, so each step gets a picture, a diagram or a compact card, and long facts stay in Intel behind a link (the Intel drawer).

## Content sources

- The Intel database already holds the facts: deployment options, all 13 Dynamic Ops with their steps and pay, Story Mission tiers, Side Ops, 7 Lieutenants, the Commanders, the vest list and recipes, the level 2–70 unlock table and the tips. The guide links to those entries and does not copy their details.
- New research (2026-10-22) adds the ordering and advice per stage: what to do first, how players reach 3-plate and Ultra gear, where to farm each material, what to print first, and when a player is ready to move up. Sources are paraphrased; usernames and leaks stay out, and each claim keeps a confidence label under the Intel rules.

## UI concepts

Every concept uses the same guide data, so the comparison is about layout, not content.

| | Concept | Idea | Best at | Weakest at |
|---|---|---|---|---|
| G1 | **Armor ladder** | A vertical ladder of vests, from 1-plate at the bottom to Ultra at the top. Each rung opens into that tier's goals in order, with ticks saved on the device and a "ready to climb" checklist. | The whole-game order at a glance | Long once every rung is open |
| G2 | **Pick your vest** | A selector of vest pictures: "What are you wearing?" Picking one shows that tier as a briefing: what to do now, what to print, where to farm, what is next. The deployments and Dynamic Ops sit inside the Early tier as an in-game *Select Deployment* screen. | A fast answer for where a player is today; creative | Players who want to read ahead |
| G3 | **Tabs and dropdowns** | Early, Mid and Late tabs, each a list of questions that expand into answers. | Cheap, familiar, easy to scan | Still mostly text; little sense of order |
| G4 | **Ask the handler** | Three quick questions (vest, DMZ level, what you want next) lead to a short plan with places from the Tac-Map threat data. | A personal plan | Hides the bigger picture; answers need upkeep |
| G5 | **Field cards** | A swipeable deck, one tip per card with a big picture. | Phones, very visual | Hard to scan or find again; weak for keyboard and screen readers |

G5 is not prototyped: a card deck hides everything but one card, which fails the "easy to find again" test before any build.

### Scoring

Each prototype is tested at 1366 px and 375 px wide and scored 1–3 on:

1. **Clear order:** can a player tell where they are and what to do next in under ten seconds?
2. **Tiers explained:** are the tiers, and the deployments and ops inside Early, easy to compare?
3. **Visual:** how much of the page is pictures, diagrams and cards versus paragraphs?
4. **Phone fit:** no sideways scroll, thumb-sized targets, short screens.
5. **Upkeep:** does it pull facts from Intel, or does it repeat them?
6. **Build cost:** less work scores higher.

## Decision

All four prototypes were built and tested at 1366 px and 375 px on 2026-10-22. Scores out of 18:

| | Order | Tiers | Visual | Phone | Upkeep | Cost | Total |
|---|---|---|---|---|---|---|---|
| G1 Armor ladder | 2 | 3 | 2 | 1 | 3 | 3 | 14 |
| G2 Pick your vest | 3 | 2 | 3 | 2 | 3 | 3 | 16 |
| G3 Tabs and dropdowns | 2 | 2 | 2 | 3 | 3 | 3 | 15 |
| G4 Ask the handler | 3 | 1 | 2 | 3 | 2 | 2 | 13 |
| **Mix (shipped)** | 3 | 3 | 3 | 3 | 3 | 2 | **17** |

Phone heights at 375 px: G1 about 21,600 px for all three tiers, G2 about 8,300 px for one tier, G3 about 2,500 px folded, G4 about 5,100 px with a plan.

The shipped page takes G2's one-tap picker as the way in, G1's track of all three with progress under it, G4's "what now?" by marking the next unticked step and opening it, and G3's folding for the reference parts (Dynamic Ops, Lieutenants, printing, farming, places, mistakes and the ready checklist). Phone heights after the reframe: early game 3,579 px, mid game 2,983 px, late game 2,575 px.

## Stage reframe

The first build asked "What are you wearing?" and named the tiers by armor. The user meant early, mid and late as stages of the whole game, with armor only as an example of how to tell them apart. The live guide now:

- asks "Where are you in DMZ?" with rank stripes (one, two or three chevrons) and a short line per stage;
- lists the signs of each stage, armor being one of four, under "Signs you are here";
- names the stages Early, Mid and Late game in titles, search entries, the station card and the `?stage=` link;
- keeps the content: deployments, Dynamic Ops, Lieutenants, printer materials and tips.

The data keeps the `tier` name in code and the `armor` and `levels` fields, which the lab drafts still read.

## How-to layer

Players found the guide said what to do but not how, so the steps, bosses and materials now carry the how:

- **Steps:** a `how` list on 17 steps (Boss Board intel, Hunt towers, printer upgrades, story mission starts and hard parts, the Doctor's office, Fallen Ember, Prestige).
- **Bosses:** `shared/dmz-playbooks.mjs` has a playbook for each of the 10 Lieutenants and 3 Commanders: find, what it does, the kill in order, bring, avoid, loot. It shows on the guide's hunt cards, the Boss Board cards and the Intel drawer. Gorani is the decoy Lieutenant; his playbook says how to tell the real one.
- **Materials:** the same file has 32 materials with the room or container to search, a route for one run, other ways to get it and the print recipe. It shows on the guide's farm cards and in "Where to find materials" on the Printer page, whose planner totals link to it.
- **Sources:** every playbook lists its own sources; guide-only sources go in `shared/dmz-guide-sources.mjs` and must not repeat an Intel source under a new id. PlayerAuctions is not cited.
- **Fact-check:** a second pass checked each line against its sources. Claims found only on PlayerAuctions were cut, guesses are labelled as guesses, one-off finds say "one find", and the two Commander-only drops show rarity Unknown because no source gives one.

## Images

- **No downloads needed:** rank stripes and sign icons for the stages, vest and plate drawings, op step chains with an icon per step type, material rarity chips, mini-maps cut from the approved Hajin Tac-Map art with the place highlighted, and threat colours from the Tac-Map data.
- **Official images:** candidate press images are listed with file name, source and size for approval. None are downloaded until the user approves them by name.
