# CodZmWiki remaining games implementation

All 30 former placeholders now have authored guides, with 328 main and optional phases, 795 steps and 31 contextual tools. The site keeps its existing charcoal and gold interface, map routes, Quick Parts, Full Details, search and desktop navigation. The implementation is local; it has not been deployed.

## Implementation choices

| Option | Benefit | Cost | Decision |
| --- | --- | --- | --- |
| Handwritten Vue pages for each destination | Maximum layout freedom | Repeats navigation, progress and content rules across 30 pages | Use only for shared interactive components |
| Authored modules and the existing generators | Consistent routes, anchors, search and saved state; independently testable puzzle engines | Requires explicit metadata for branches, illustrated options and reset boundaries | Selected |
| New CMS or backend | Remote editing and account sync | Introduces authentication, migrations and deployment dependencies | Defer until those capabilities are requested |

Guides live in the game-specific `shared/*-guides.mjs` modules. WWII uses additional per-map authoring files. `shared/*-tools.mjs` defines each helper's declared fields, reference pictures, conditional groups and reset scopes. Edit these sources and run `node scripts/generate-catalogue.mjs`; generated pages and JSON are outputs.

Pure evaluators live in `app/utils/iw.mjs`, `ww2.mjs`, `aw.mjs`, `vanguard.mjs` and `mw3.mjs`. Runtime tables are generated into `app/data`; browser code does not import the filesystem-backed authoring helper. This also prevents Windows server-build imports from being rebased outside the checkout.

## Interaction and saved records

The new `Remaining.vue` controls support ordered observations, photographed symbol choices, keyboard-selectable options, Morse pulse buttons, physical monitor layouts, a queen completion board and explicit unknown or contradictory results. Each tool can be used inline or on its own page with the same versioned local state. Undo restores prior observations; scoped resets preserve unrelated records.

Quest route selection distinguishes Final Reich Casual/Hardcore, Beast standard/Director's Cut, and MWZ story/first unlock/ordinary/Elder. Deep links reveal their matching branch. Switching branches retains observations and completion records. Guide run reset preserves account-scoped Director's Cut preparation.

MWZ milestones have a separate versioned local record for story completions, permanent portal access and owned schematics. USB records remain deployment observations. The Red Worm helper requires four different observed, carried drive identities and the current paired-cache arena. It never assigns a permanent USB identity to a landmark. Rune portal lookup retains all 24 distinct exit markers, including shared grid squares, and their photographed ordered codes.

## Illustrations

The selected guide and tool references are indexed in `app/data/remainingImages.json` with source, creator and rights status. Lightweight WebP previews load while reading; enlargement opens the original plate so fine puzzle details remain available. `scripts/prepare-remaining-previews.py` creates previews with Pillow, and the normal catalogue generator copies already prepared assets into `public/images/remaining`.

Image credit does not establish permission to publish a third-party screenshot or chart. Replace or clear those assets before publication. The full original research inventory remains in this folder.

## Verification

Final local validation on 8 October 2026: all 241 automated tests, the production build, 61 new production routes and the representative browser flows pass. SEO checks pass for 208 indexable pages. Seven captures cover 360, 768 and 1440-pixel viewports. The independent review's sole material finding concerned the checkbox label touch target; its correction was scored resolved. Exact coverage and review scope are recorded in [implementation verification](implementation-verification.json).

The automated suite covers guide and tool registration, unique progress anchors, source/image provenance, unknown and contradictory inputs, leading zeroes, independent stages, locked observations, scoped archives and milestone isolation. Exhaustive cases include all 832 raven statue states, 256 base Hammer states, 495 disk selections, 92 queen completions and 24 Terra page permutations. Production browser checks are repeatable with `scripts/verify-remaining-browser.mjs`; pass a Node package root containing Playwright, the local server origin and optionally a Chrome executable.

Run the production checks from the repository root:

```sh
node scripts/generate-catalogue.mjs
npm test
npm run build
node scripts/check-seo.mjs http://127.0.0.1:3100
```

These are source and software checks. Complete live solo/co-op playthroughs remain outstanding. Shadowed Throne's final raven placement includes two direct video demonstrations; its static reference does not supply a complete placement diagram. Archon's ground-rune notebook uses the player's observed shapes and landmarks because a complete photographic chart was unavailable. Several MWZ story and boss stages have accurate text and live objective cues with limited local photography. Imported map grids are reference labels; no uncalibrated interactive map has been added.
