# Dead of the Night and Classified guide revision

Research and layout decisions recorded 2026-10-02 before implementation.

## Sources checked

- [r/CODZombies Dead of the Night wiki](https://www.reddit.com/r/CODZombies/wiki/dead-of-the-night/) — setup, spawn groups, all three branches, weapons, boss, side quests and source screenshots.
- [mmmrkennedy Dead of the Night](https://mmmrkennedy.com/games/BO4/dead_of_the_night/dead_of_the_night_guide) — illustrated spawn positions, interactions and failure recovery; warns that generic Capricorn charts differ from the game.
- [r/CODZombies Classified wiki](https://www.reddit.com/r/CODZombies/wiki/classified/) — Project Skadi order, amplifier, shield and high-round ending.
- [mmmrkennedy Classified](https://mmmrkennedy.com/games/BO4/classified/classified_guide) — independent illustrated cross-check; explicit four-switch DEFCON route and Server Room teleporter after amplifier installation.
- [PlayStationTrophies Classified](https://www.playstationtrophies.org/forum/topic/312647-call-of-duty-black-ops-4-classified-trophy-guide-and-roadmap/) — grenade prerequisite, nameplate sequence, Skadi trophy versus round-150 ending. Its numbered code-collection list is not treated as the input order.
- [Dead of the Night symbol-location community discussion](https://www.reddit.com/r/CODZombies/comments/ckmm6v/) — corroborates using shape/location references instead of requiring players to learn glyph names.

## Layout alternatives and chosen route

1. A single chronological wall of text would hide repeated component hunts and optional rewards. Chosen: clear setup, required weapon upgrade path, three independently headed quest branches, boss, then optional side quests. Every step includes a short in-match summary and fuller action details.
2. Dead of the Night: the free Folly route is recommended because it has a known four-clue cost; a lucky Mystery Box Folly is a supported shortcut. Collect silver ingredients while opening rooms, equip silver before the first forest werewolf, then obtain Chaos Theory and Annihilator before finishing branches. Complete Telescope, then Knights, then Effigy for a first clear; co-op may parallelize preparation but regroups for synchronized interactions and lockdowns.
3. Classified: separate the short, deterministic Winter's Howl reward quest from the round-150 endurance ending. Show a practical shield-bench strategy plus a movement/trap alternative; do not imply entering Skadi codes triggers the ending.
4. Tools should produce actions: Folly uses screenshot-based shape choices by color; zodiac uses visual signs and adds all three scratch groups, refusing incomplete/tied/duplicate data; Stake Knife records actual shape order and maps it onto observed garden stone locations; Skadi stores strings including leading zeroes, presents the exact input order and tracks only player-confirmed acceptance/full rounds.

## Corrections and evidence limits

- Classified has four DEFCON switches. The Reddit setup paragraph says four War Room plus one Server Room but its own Skadi sequence lists four total; independent illustrated guide confirms three War Room plus one Server Room.
- Code input order is Shi No Numa, Der Riese, Shangri-La, Kino der Toten. Collection order is unrestricted. Bad input restarts acceptance from Shi No Numa.
- The DOTN Reddit wiki says four vampire bile drops; the illustrated guide says three. Use the observable condition (bile stops dropping/coffin accepts interaction), not a false exact count.
- Zodiac scratches: inspect all three positions before recording an absent group as zero. Unknown remains blank. A failed telescope input rerolls clues. A generic Capricorn glyph must not be presented as exact in-game art.
- Round 150 cutscene triggers at the end of round 149. No Skadi completion requirement is asserted.
- Guide is source-checked, not a claim of a fresh complete in-game verification.

## Asset provenance

Local assets use unmodified gameplay screenshots linked by mmmrkennedy's guide, COD Zombies Guides and the Reddit community wiki. Exact source URLs are recorded in `public/images/bo4-dead-of-the-night/sources.json` and `public/images/bo4-classified/sources.json`. Gameplay belongs to Activision/Treyarch; screenshots are credited to the source guide. Visual selectors use the authentic reference pixels, not generated approximations.

The Folly picker enlarges three lock glyphs from `dotn-alistairs-folley-safe.webp` and the fourth from Reddit's `IWyR5Bp.png`; it does not assign shape semantics based on a guess. Existing user text notes remain visible separately. The zodiac picker enlarges individual cells from COD Zombies Guides' chart; Capricorn instead uses the actual blue dial glyph from `dotn-zodiac-wheel.webp` to avoid the documented chart mismatch. SVG viewport crops keep source files unchanged. The Stake Knife triangles are simple vector redraws of the four photographed alchemical shapes, and the route is derived only from the user's own tree and stone observations.

## Validation

- Five focused Node tests pass: zodiac totals/unknown versus zero/conflicts; Stake Knife observed permutation; Skadi zero preservation, ordered acceptance and downstream invalidation; tool field/guide identifier integrity.
- Both dedicated Vue components parse and compile without errors using the installed Vue compiler.
- Root integration performs catalogue generation, full test/build checks and browser visual QA; no fresh in-game completion was performed.
