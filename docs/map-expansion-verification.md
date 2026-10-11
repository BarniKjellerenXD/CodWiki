# Map expansion verification

Completed 11 October 2026 against the final production preview at `http://127.0.0.1:3001`.

## Delivered scope

- 72 interactive catalog maps: 61 added and 11 existing maps updated.
- 90 layers, 87 distinct artwork files, 3,709 locations, 2,056 guide targets and 1,407 guide bindings.
- 48 maps are explicitly labeled partial original schematics with area precision. Two Origins editions share credited creator artwork but have separate target/location data.
- 24 catalog entries remain documented source/geometry gaps. All 96 entries have a row in [implementation coverage](map-expansion-research/implementation-coverage.md).

## Checks and evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Repository tests | 471 passed; zero failures, skips or cancellations | [Test log](map-expansion-research/full-test-run.log) |
| Final production build | Passed with the same source and production configuration, using isolated temporary/output paths | [Build log](map-expansion-research/build-run.log) |
| Map artwork | All 90 layer requests across all 72 datasets returned asset bytes | [Expansion report](map-expansion-research/implementation-previews/expansion-browser-verification.json) |
| Client rendering | Fifteen representative maps rendered from every added game family; zero captured runtime errors | Expansion report and adjacent screenshots |
| Compact filters | Hide all, mixed type union, guide highlights, intentional-empty persistence, photo tool independence and keyboard chooser checks passed | [Control report](map-expansion-research/implementation-previews/browser-verification.json) |
| Guide flow | 22 real Quick/Full link → highlighted map → Back to step flows restored the reader and originating link focus | [Guide-flow report](map-expansion-research/implementation-previews/guide-flow-verification.json) |
| Child guides | Ravenov and Excision load Outbreak's shared atlas and return to their own steps | Expansion report |
| Responsive/theme review | Five supported themes inspected; 390px pages have no horizontal overflow | Expansion/control screenshots |
| SEO/routes | 205 indexable pages passed metadata, SSR content, discovery, sitemap, robots, canonical, redirects and 404 checks | [SEO log](map-expansion-research/seo-run.log) |
| Source/geometry validation | Classic31, CW5 and other12 batch validators passed. BO4/BO6 generators and repository tests validated evidence IDs, types, dimensions, bounds, memberships and anchors | Batch handoffs linked in [implementation notes](map-expansion-implementation.md) |

Visual review repaired one duplicated schematic label. Independent viewer review repaired photo preference overwrites, sequence/area representation at coincident pins, keyboard activation, chooser visibility, and focus restoration. The final production artifact passed the browser checks after those corrections.

## Local build environment

The initial `npm run build` passed. A subsequent rebuild failed when Proton Drive renamed Nuxt's generated `dist` folder to a `Name clash` directory during Nitro packaging. The final build uses [build-local-preview.mjs](../scripts/build-local-preview.mjs) with a fresh directory outside Proton Drive. It retains the project configuration and existing installed dependencies through a directory junction; only temporary build/output locations change. Existing output folders are never cleared by the helper.

Final output: `C:/Users/MainLocalUser/.codex/visualizations/2026/10/11/01a12a67-329a-7730-b28d-c12362794e3d/codwiki-production-final/output/`. The local production server is running on port 3001. No deployment or external publication was performed.

For an ordinary checkout, use `npm run build`. For this synced workspace, run `node scripts/generate-catalogue.mjs` then `node scripts/build-local-preview.mjs <absolute-empty-local-directory>`. Start the resulting `output/server/index.mjs` with `NITRO_HOST=127.0.0.1` and a chosen `NITRO_PORT`, then pass that origin to the browser/SEO scripts.

The build emits nonblocking dependency deprecation and pigpen-font resolution warnings. The SEO check also exercised the existing wiki proxy's 502 response and verified its noindex behavior.

## Practical limits

These checks establish source-to-artwork alignment, internal consistency and working browser flows. They do not constitute in-game playthroughs or a survey of every optional spawn. Native Electron sessions were not manually exercised; existing resize/wheel/guide-state contracts passed repository tests. Per-map notes disclose grouped floors, missing interiors, candidate sites, annotated background icons and omitted connections. Source gaps remain visible in the implementation inventory rather than receiving invented geometry.
