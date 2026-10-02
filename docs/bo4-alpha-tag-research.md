# Alpha Omega and Tag der Toten — research and implementation plan

Reviewed 2026-10-02. This is source research, not a claim of a completed in-game verification run.

## Sources consulted before implementation

- [Alpha Omega community wiki](https://www.reddit.com/r/CODZombies/wiki/alpha-omega/): equipment spawn sets; all four Mark II variants; Rushmore sequence; fixed power switches; Avogadro containment.
- [Alpha Omega illustrated walkthrough](https://www.codzombiesguides.com/main-quests/black-ops-4/alpha-omega/): independently checks order, clock interaction controls, Toy Soldier code order, mannequin/orb locations and final APD terminal interaction; supplies authentic gameplay screenshots.
- [Tag community wiki](https://www.reddit.com/r/CODZombies/wiki/tag-der-toten/): power, cranks, equipment, offerings and Seal riddles, three orb cycles, soapstones, generators, charges and final escort.
- [Tag illustrated walkthrough](https://www.codzombiesguides.com/main-quests/black-ops-4/tag-der-toten/): checks item interactions and supplies authentic offering/Seal sightlines.
- [Tag achievement walkthrough](https://www.trueachievements.com/game/Call-of-Duty-Black-Ops-4/walkthrough/20): confirms four normal Pack-a-Punch locations including Lagoon, plus the separate Golden machine; challenge routes and the pipe above the Sunken Path fire.
- [Tag challenge totems](https://www.reddit.com/r/CODZombies/comments/d90itx/): five totems and their task sequences.
- [Tag offering locations](https://www.reddit.com/r/CODZombies/comments/da2wgh/): detailed landmarks for all 20 offerings; cross-check ambiguous room labels against photographed landmarks.
- [Tag charge sequence](https://www.callofdutyzombies.com/easteregg/guides/black_ops_iv_zombies/454_main-easter-eggs/tag-der-toten-salvation-lies-above/power-the-device-r242/): four normal charge locations; Golden charge comes afterward.

## Findings and decisions

The current Alpha guide jumps from clocks to an underspecified final fight. Expand into equipment → five clock targets → red crawler → Toy Soldier / Marlton → timed core / painting codes → fixed power switches → three mannequin defenses / orb → Avogadro. Side sections contain the full frame and four elemental Ray Gun build routes. Only the Telepad and Galvaknuckles are mandatory equipment; do not imply four elemental guns are a quest gate.

The current Tag guide combines distinct repeat stages, loses the second and third orb cycles, and never explains the Shard. Expand into power/cranks → shield and required equipment → two full totems/dials → three offerings and Seal safe → first orb/campfire → hot/cold soapstones, fuse, two red batteries and three electric generators → second orb/campfire and lighthouse lockdown → four normal PaP charges → third local orb/campfire → Golden PaP and moving shield. Five totems exist; only two completed three-challenge totems are needed for dials. All five are for the optional Thundergun. The community wiki's initial “2 of 4” is inconsistent with its own Thundergun section and other sources, so use five. The wiki's Pack-a-Punch location list omits Lagoon; use Beach, Lagoon, Boathouse, Sunken Path and then Golden Iceberg separately.

Layout alternatives considered: (1) one long walkthrough with every weapon branch inline; (2) terse checklist linking out for actual details; (3) quick steps plus full illustrated phases, with optional equipment in side sections and helpers placed at their actual quest steps. Choose (3): preserves the app's existing Quick Parts / Full Details system and makes the guide usable without tabbing to another site.

Alpha tool alternatives: fixed preset clocks from the modern screenshot versus recording all five observed TV clues. Choose observed clues as the default: retain all five existing slot IDs, preserve broadcast order, reject duplicate rooms, draw target analog faces, find the remaining room, and convert its observed time to four keypad digits. Considered current-to-target press counts, but leave them out: the guides establish separate hand controls without establishing whether minute rollover moves the hour hand, so target faces are the reliable aid. Never infer the sixth clock time. Show authentic clock screenshot as recognition reference. Avoid an unverified transcription of the six-set shortcut.

Tag tool alternatives: a long text dropdown versus searchable visual results. Choose a filterable 24-card riddle finder separated into Offering and Seal clue sets, with photographed landmarks, clear action text and explicit selection. Keep the existing `clue` field and route. Search never silently selects a riddle. The existing charge tracker is retained but its labels become exact stages and locations.

Recommended paths: Alpha uses Telepads for the core delivery and the II-V as optional regenerating-ammunition support; optional other variants are fully documented. Tag uses the guaranteed icicle Wunderwaffe and keycard Music Box routes, saving random-box spending for optional endgame weapons. Beach/Specimen Storage totems can be prepared while collecting equipment; explain a reasonable first-run pair after checking tasks. Avoid water while carrying heated soapstones. Finish upgrades before handing the Seal to the Hermit for the lockdown.

## Assets and validation plan

Only observed public gameplay screenshots are downloaded; no generated symbols or reconstructed game screenshots. Image files will live in `public/images/bo4-alpha-omega/` and `public/images/bo4-tag-der-toten/`. Source manifests record exact URLs and attribution. Tool-drawn analog clocks are numeric diagrams, not game symbols.

Validate unique IDs, authored references, every image file, riddle coverage and phase/side-phase completeness; test clock parsing, all six possible remaining rooms, 12 o'clock, duplicate rooms, invalid clues, absent final reading and leading zero output, plus search filtering. Parent integrates data and widget dispatch, then runs generator/build and browser QA. In-game completion remains unverified and is stated in guide review notes.

Later cross-check: [Kennedy's detailed Tag guide](https://mmmrkennedy.com/games/BO4/tag_der_toten/tag_der_toten_guide) specifies the dedicated Gangway dynamite table, rather than the community wiki's broad “any workbench” phrasing; the authored route uses Gangway. It also supplies the five-target free Tundra Gun route, checked against TrueAchievements and the [original snowball-target discussion](https://www.reddit.com/r/CODZombies/comments/d96c8z). The “one mysteries” offering has inconsistent numbered-floor descriptions; use the photographed broken staircase beside the Mystery Box as the unambiguous landmark. The helper retains the older saved clue key while correcting the instructions. The soup ingredient search spots and the Lighthouse Level 2 shield position were also checked against Kennedy.
