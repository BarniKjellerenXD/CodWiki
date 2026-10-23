# MW4 DMZ: visual trait tree, Reddit tips and meta weapons — plan

Checked 22 Oct 2026. Research data: `docs/research/dmz-traits-meta/`.

## What the user asked for

1. A trait tree that looks like the one in the game, not a list.
2. Tips around the traits, taken from what players say on Reddit.
3. The weapons players call meta, placed somewhere sensible.
4. Nothing made up: only what sources and players actually say.

## What the game shows (from `structure.json`)

- One TRAITS screen with three tall trees side by side: Warfighter (red, hexagons), Scout (gold, circles), Survivalist (teal, squares), plus a narrow Prestige column.
- Each tree climbs from the bottom in 9 rows. Row 1 is one random Minor. Rows 3, 6 and 9 offer a fixed pair of Majors. Rows 2, 4, 5, 7 and 8 offer three random Minors that show as "?" until you pick in the row below.
- 18 points per Operator, 9 per tree at most, one pick per row, no respec. Minors are rolled per Operator, so nobody can plan Minors in advance; only the Major forks are the same for everyone.

That last point shapes everything: a planner can plan the 9 Major forks and how points split across trees, but it can only show Minors as "a Minor you rolled".

## Tree concepts

| | Concept | What it is | Good | Bad |
|---|---|---|---|---|
| T1 | In-game replica | The three columns as in game, bottom-up, own shapes and colours, "?" for Minor rows. Tap a node for its card. Read-only. | Instantly familiar; shows the real rules visually | You cannot try a build; phones fit one tree at a time |
| T2 | Build planner | T1's look, but tapping nodes plans a build: 18-point counter, 9 per tree, one pick per row, Minor rows count as "any Minor". Saved on the device; a link shares the build. | Answers "where do my 18 points go"; teaches the rules by doing | More code; must be clear that Minors are random |
| T3 | Fork comparison | Per tree, the three Major forks as A-vs-B cards with what players say about each, then the known Minor pool. | Best home for Reddit tips; short and easy to read on phones | Not visual like the game |
| T4 | Radial | Three trees as spokes around the Operator. | Looks striking | Nothing like the game; labels collide; poor on a 375 px phone |

T4 is scored but not built: it fails the "like the game" ask by design.

### Scoring (3 = best; for "build cost", more means less work)

| | Like the game | Phone (375 px) | Desktop (1366 px) | Tips fit | Honest about random Minors | Build cost | Total |
|---|---|---|---|---|---|---|---|
| T1 Replica | 3 | 2 | 3 | 1 | 3 | 3 | 15 |
| T2 Planner | 3 | 2 | 3 | 2 | 2 | 1 | 13 |
| T3 Forks | 1 | 3 | 2 | 3 | 3 | 3 | 15 |
| T4 Radial | 0 | 1 | 2 | 1 | 2 | 2 | 8 |

### Choice: T1 + T2 + T3 in one

Ship the replica as the face of the page, with planning switched on (T2), and open T3's fork card when a Major is tapped:

- The tree looks like the game (T1) and tapping nodes plans a build (T2). Planning is off until "Plan a build" is pressed, so the tree reads cleanly first.
- Tapping a Major opens a side card (a sheet on phones) with its effect, its rival in the fork, and the Reddit tips for that fork (T3).
- Minor rows show "?" frames; the card for a Minor row lists the Minors players have seen in that tree, with a note that each Operator rolls its own.
- Points left, picks per tree and a reset button sit above the tree, like the in-game counters.

The drafts live at `/dmz/lab/traits`, `/dmz/lab/traits-replica`, `/dmz/lab/traits-planner` and `/dmz/lab/traits-forks` (noindex) until the lab is removed.

## Where the meta weapons go

| Option | Good | Bad |
|---|---|---|
| A. New Gunsmith station, `/dmz/gunsmith` | Matches the FOB (the Gunsmith is a real station); own search entry and SEO page; room for how to get each gun | One more station to keep current |
| B. A section on Operators | No new page | Weapons have nothing to do with traits; buries them |
| C. A section in the guide | Players already read the guide | The guide is about what to do next, not a reference; long already |

Choice: **A**, a Gunsmith station named "Meta weapons". It shows:

1. What players on Reddit say, with mention counts from threads posted from 20 Oct on (DMZ early access). Each gun lists the number of separate comments or posts that recommend it, plus short paraphrased reasons.
2. A comparison column with the guide-site tier lists (CODMunity, WZStats, Destructoid), clearly labelled as sites, not players.
3. How to get guns in DMZ (Free Loadout, Weapon Manuals, Gunsmith, blueprints), from the official FOB guide.

The page title says "meta weapons", never "best guns" (`tests/seo.test.mjs`).

## Reddit method

- RSS only (`/r/DMZ/new.rss` paged, and `/comments/<id>/.rss`), 12 s between requests, 90 s after a 429.
- Posts and comments from 2026-10-20 on only.
- A weapon "mention" is a comment that names the gun (or a common nickname) as one they use or recommend. Complaints and questions are not counted as recommendations. One count per comment.
- No usernames, no quotes: tips are paraphrased. No exploit steps, rumours, leaks or datamines.

## Fixes to existing data

- Intel: Adrenaline Burst, Investor and Air Superiority are tagged Major; they are Minors (the random starting Minor on the blog's test Operator).
- Station facts: "33 traits" becomes the official 66 (22 per tree).

## What Reddit said (read 22–23 Oct)

168 r/DMZ threads, 3,075 comments, all from 20–22 Oct.

- **Traits:** Possum dominates the talk: 8 comments call it too strong in PvP, 4 like it as a safety net, and players share counters (move the body's gear away, watch or trap the body, check the dog tag). Overwatch with UAV Upgrade is the other big complaint (5), countered with a DDOS on the tower. Smaller points cover Thermal Padding, Equipment Professional, Free Revive and Fast Learner. All 19 tips are on the trait cards with how many comments make each point.
- **Weapons:** no meta yet. Players mostly asked how to unlock guns. Only five guns got a recommendation, one comment each (Astaroth .57, MAR-9, Rezi 12, VEL 46, Han 86). The page says so plainly and shows six general loadout tips instead of padding the list. The guide-site tier lists stay as a separate, labelled comparison.
- Re-read Reddit after the weekend: the meta should show up once players have unlocked more guns.
