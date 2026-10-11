# Map expansion research

Research and implementation evidence · 11 October 2026. The initial research snapshot is retained alongside the implemented datasets and validation records.

Start with [implemented coverage](implementation-coverage.md) and [implementation notes](../map-expansion-implementation.md) for the current result. The source-status counts below describe the original research pass, before implementation. Compact toggles were selected by the user and replace the proposed sidebar/drawer.

The implementation has **72 interactive maps**, including **48 partial original schematics**, with **24 documented gaps**. [Final verification](../map-expansion-verification.md) records 471 passing tests, the production build, real guide/map flows and the local Proton Drive build-path workaround.

The main decision document is [the expansion plan](../map-expansion-plan.md). This folder contains the supporting catalog audit, source inventory, filter specification, and research-only asset references. A discovered image is not automatically suitable for exact coordinates or cleared for publication. Every candidate records its evidence level and remaining work.

Source status terms:

- **Existing**: already present in the application; inspect the existing provenance before reuse.
- **Candidate**: a layout or map provider was directly identified. Coordinate, edition and publication checks remain.
- **Partial**: only rooms, a region, an annotated quest map, or incomplete floor coverage was found.
- **Lead**: mentioned by a creator or search result, but the actual layout was not independently opened.
- **Gap**: no adequate layout was found in this research pass; this does not mean none exists.

Files from different researchers use detailed evidence labels; the consolidated inventory normalizes them without upgrading their confidence.

## Read the package

- [Main expansion plan](../map-expansion-plan.md): selected approach, alternatives, content gates, phases and acceptance criteria.
- [All 96 catalog entries](coverage.md) and [complete JSON](coverage.json): 11 existing, 44 candidates, 18 partial references, 9 leads and 14 gaps.
- [Filter and marker standard](filter-standard.md): exact selection, count, icon, mobile and migration behavior.
- [Current viewer audit](viewer-audit.md) and [dataset inventory](existing-datasets.json): implementation evidence and preservation requirements.
- [Classic game sources](classic-sources.md) / [JSON](classic-sources.json): 41 WaW/BO1/BO2/BO3 entries, including Chronicles.
- [BO4, Cold War and BO6 sources](modern-sources.md) / [JSON](modern-sources.json): 19 entries.
- [Other game sources](other-sources.md) / [JSON](other-sources.json): 25 AW/IW/WWII/Vanguard entries plus the MWIII Unstable Rift scope included in that count.
- [Downloaded asset manifest](downloaded-assets.json): 24 pinned research files, including 16 standalone SVG map images and the BO6 vectors in source form.
- [Preview verification](previews/verification.json): a separate planning concept checked in headless Chrome; this is not a test run of the CodWiki application.

The three interface concepts are displayed in the chat. Their desktop screenshots and a narrow-screen preview are stored in `previews/`. The concept uses illustrative geography and counts, a simplified filter vocabulary and a stacked narrow-screen presentation. The recommended production mobile behavior is the drawer specified in the standard. The Die Maschine source preview checks that one downloaded SVG renders; it does not verify all source geometry or marker coordinates.

## Reproducibility

`consolidate-coverage.mjs` rejects missing, duplicate and unknown catalog IDs. `create-modern-inventory.mjs` reconstructs the modern source rows from the gathered snapshot. `gather-modern-assets.ps1` downloads public research sources and license notices; rerunning it captures the then-current upstream commit, so retain the current manifest when comparing revisions. `verify-planning-preview.cjs` is a local environment-specific mockup check using bundled dependencies and the installed Chrome browser.

During the original research pass, no sources were contacted for permission or external content published. Subsequent local implementation reused licensed vectors, the expressly permitted Origins artwork, and original source-backed diagrams. Each batch handoff records its visual review and coverage limits. Research candidates are not automatically accepted artwork, and source gaps are not proof that no other layouts exist.
