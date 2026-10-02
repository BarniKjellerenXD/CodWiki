# Cold War implementation and verification

Verified 3 October 2026.

## Delivered coverage

| Guide | Main route | Optional coverage |
| --- | --- | --- |
| Die Maschine | Power/PAP, D.I.E., scope/diary, four upgrades, chamber, Orlov, escape | Coffin dance, hand-trap Legendary upgrade, music, floating zombies, dishes, Intel references, Orda sighting |
| Firebase Z | Three reactors, complete RAI K-84 build, serum, memory Mimics, three crystal tests, satellite, Orda | Bunny loot, Sergei perk, Monkey Bomb upgrade, six jump pads, music, assault waves |
| Mauer der Toten | Klaus, CRBR-S safe, lab, harvesters, headgear, train, uranium, Valentina, final escort | Two extra Klaus upgrades, nightclub/revisit, target challenge, sewer loot, music |
| Forsaken | Teleporter/PAP, Chrysalax, all neutralizer parts, escort, boss stages | TV/Tombstone Perkaholic, pizza, Bubby/song, arcade, Bar race, three weapon-class courses |
| Outbreak hub | Setup and quest selection across all eight regions | Four D.I.E. crates, world events, music, fishing, rare Ronald, tier skip, Zoo Pact/masks |
| Ravenov Implications | Radio, microfilm, projector, bunker keys, launch lights, Legion | Links to preparation rewards; independent quest progress |
| Operation Excision | Rifts, helicopter, red orb, bunny, rover, roof recording, Orda/exfil | Links to preparation/Pact; independent quest progress |

Six contextual tools replace the old Cold War forms: D.I.E. port reference, Firebase dartboard, Mauer safe/clue finder, Forsaken TV recorder/replay, Outbreak location finder and launch-light solver. Two duplicate trackers redirect to their guide sections. All previous main-quest phase and step IDs remain present; existing version-1 tool inputs remain compatible.

291 locally hosted WebP references have source URLs and credits in `cold-war-assets.json`. Their combined size is approximately 42.4 MiB after encoding, down from 165.9 MiB. Guide references load lazily and use the existing enlarge/zoom viewer. Outbreak maps retain annotations; TV crops use the full photograph's coordinate system.

## Automated checks

`npm test`: **139 checks passed, zero failures**. The Cold War regression suite covers:

- Every map, quest, side-section search entry, tool association and generated anchor.
- Original progress IDs, independent Outbreak resets, legacy clue restoration and state sanitization.
- All 20 dartboard positions, repeated stops, missing observations and invalid sectors.
- Fixed safe-room order, leading zeros, incomplete values and all nine clue photographs.
- All six A/B/D launch permutations, every two-observation deduction, missing values and contradictory lights.
- Independent 4/8/12 TV sequences and gaps that must block playback.
- Every region/quest/objective combination, including unavailable objectives.
- Every required image's WebP signature and manifest correspondence.
- Both retired tracker destinations and removal from active discovery.

`npm run build`: **production build passed**. The first exploratory build ran before all assets arrived and correctly failed on missing Outbreak covers; the completed asset set and final builds pass. No package changes or new runtime dependency were needed.

`node scripts/generate-catalogue.mjs`: **idempotent**. A second generation produced identical tracked output. A structured comparison of catalogue, tool definitions, quick quests and search data confirmed that other games' entries are unchanged. `git diff --check` passes.

## Browser verification

Headless Chromium 154 against the production server at **1440 × 1100** and **390 × 844**: **28 scenario groups passed**, no browser runtime/console errors, no horizontal overflow. The run produced 18 screenshots for the initial layouts and final confirmation.

Checked all seven guide pages and six tool pages at both sizes, plus both legacy redirects. Exercised keyboard and pointer dart entry, correction, undo and reload; safe validation and leading zeros; image enlargement and Escape; port selection; launch conflicts and deduction; unavailable Outbreak objectives and map selection; repeated TV colors, manual replay, separate stages, clearing one stage and undoing it. Also verified saved dart values when opening the inline guide helper and returning to the full tool page.

The review led to three usability fixes: phone dart inputs stay above the board; TV stages can be cleared individually; and the shared widget carries the existing puzzle marker so guide contents/reading-position tracking ignore its internal headings. The final confirmation passed after these fixes.

## Verification limits

These are source, software and browser checks. A complete in-game playthrough of each route has not been performed, and randomized spawns, game patches and live timers remain governed by the game. Intel sections describe collection systems and supply references; this update is not a per-season checklist of every individual Intel item. Onslaught and Dead Ops Arcade are outside the story-map scope. The desktop navigation data was regenerated and its existing compatibility tests passed; a new Electron executable was not packaged. Changes are local and have not been published.

For maintenance, edit `shared/cold-war-*.mjs`, `app/utils/coldWar.mjs` and `app/components/puzzle/ColdWar.vue`, then regenerate. Do not hand-edit generated guide Vue or catalogue JSON. Add any new persisted input to the declared tool fields before using it in the widget.
