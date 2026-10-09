# MW3 guide revision

The player needs readable portal-unlock and Easter-egg instructions. The previous
seasonal route selector hid most of the walkthrough, while four tools and an
account milestone panel added choices that duplicated the game or guide.

## Options and chosen approach

| Option | Benefit | Cost | Choice |
| --- | --- | --- | --- |
| Merge all MW3 content into one guide | One entry point | A long page mixes four portal rituals and several different maps | Keep Urzikstan as the starting overview |
| Keep six guides with direct section links | Clear map context; complete unlock steps and side quests visible together | Requires reorganizing existing sections | **Chosen** |
| Keep the tools as optional panels | Retains existing selectors | Leaves the controls the user wants removed | Retire the MW3 tools |

The existing charcoal/gold guide system stays in place. No replacement visual
identity, new puzzle app, or account tracker is introduced.

## Guide structure

- **Urzikstan:** short deployment setup; a static overview linking all four Dark
  Aether rituals; Red Worm preparation, current clue photographs, four USBs,
  refractors/storm, combat and exit; eight individually illustrated free-perk
  activities; the chessboard vault; purple triangles; other activities; contracts,
  equipment, story finales, local rune travel and extraction reference.
- **Season 1 / Al Bagra Fortress:** Bad Signal, purple relic collection, gold
  upgrades, the pedestal ritual, repeat visits and optional locked equipment rooms.
- **Season 2 / Sa’id City:** Countermeasures and its three obelisks, Urzikstan
  upgrades, the Nahr ritual, repeat visits, stadium music and exits.
- **Season 3 / Zarqwa:** Union, its two crystal sequences, purple relics and their
  separate summonings, the island ritual, repeat visits and Gyanxi / Smoke Signals.
- **Unstable Rift:** three ammo-mod obelisks, public entry, five combat phases
  and completion/extraction.
- **Season 5 / Highrise:** Ascension, the three Echo relics and their upgrades,
  the Opal Palace ritual, repeat visits and the Elder-only Infinite Cosmos quest.

All sections remain visible regardless of a legacy `?branch=` query. Important
eligibility requirements, including Elder-only Infinite Cosmos, stay in the
instructions. Direct topic buttons use ordinary guide anchors. Fresh MW3 readers
start in Full Details; existing reading choices and Quick Parts remain supported.

## Tools and compatibility

The portal code lookup, Red Worm USB record, Dark Aether reward reference and
Union rune record leave the website search/catalogue, inline panels and desktop
navigation. Their four old URLs return permanent redirects to useful guide
sections, including legacy `.html` URLs. No saved browser observations or account
milestone keys are cleared. The old milestone format reader remains for legacy
data compatibility; the panel is no longer rendered.

Existing guide step and section IDs stay intact. Activities moved into their own
sections retain their completion IDs. An immutable pre-change fixture protects
229 existing anchors across the six guides. The desktop shows six direct guide
links and recognizes Red Worm / Greylorm aliases for Urzikstan.

## Implementation and sources

Authoring remains in `shared/mw3-guides.mjs`. The generator emits the six page
components, guide contents, quick steps, search and website/desktop catalogues
from the same source. It no longer inserts the MWZ milestone component.
`GuideArticle.vue` accepts an optional reading default and explicit section links;
other games keep their existing defaults. Retired URLs use the existing shared
retirement middleware and client compatibility pages.

The illustrated ritual steps retain the existing researched sources and image
credits. This revision also checked the [official Season 5 announcement](https://www.callofduty.com/uk/en/blog/2024/08/call-of-duty-modern-warfare-iii-warzone-wzm-season-5-reloaded-maps-modes-zombies-announcement),
[Greylorm instructions](https://gameranx.com/features/id/485365/article/modern-warfare-3-zombies-secret-red-worm-boss-fight-greylorm-easter-egg-guide/)
and [chessboard vault reference](https://www.gamerevolution.com/guides/954826-mw3-zombies-easter-egg-solve-chessboard-puzzle-open-vault-unlock-modern-warfare).
The original research pack remains under `docs/remaining-games/`. Content and
software review do not claim a full in-game playthrough.

## Verification and release

The full automated suite passes **257 tests**, including all six guides, portal
prerequisite order, eight illustrated perks, Red Worm coverage, 229 legacy anchors,
retirement redirects and guide/desktop discovery. Ten native Electron integration
groups and five focused MW3 browser/native flow groups pass without runtime errors.
The focused flows cover all six complete guides, desktop and phone topic links,
saved reading preferences, completion and pins, and legacy tool redirects.

The Nuxt production build, SEO checks across 204 indexable pages and Windows
v1.6.1 installer/ZIP packaging succeed. Six responsive website and actual Electron
captures were reviewed together; the finish review found no material fixes.
GitHub publishes the Windows release and Vercel deploys the website automatically
from the production branch. After publishing, verify the deployed catalogue,
guide routes, legacy redirects, release assets and packaged app against the live
website.
