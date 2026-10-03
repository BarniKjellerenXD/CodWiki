# Search visibility verification

Checked on 3 October 2026. Implements the [search visibility plan](search-visibility-plan.md).

## Implemented behavior

- Existing pages have descriptive, edition-aware titles and descriptions, canonical URLs and Open Graph metadata. Visible headings and navigation keep their existing wording.
- A shared catalogue policy supplies both metadata and the sitemap: 147 indexable pages and 30 accessible, `noindex` planned entries at this revision. The two Outbreak quests and BO7 Super Easter Egg are included separately.
- `/robots.txt` advertises `/sitemap.xml`. Both use the same configured origin as canonical links and the homepage's minimal `WebSite` schema. The default is `https://codzmwiki.com`; `NUXT_PUBLIC_SITE_URL` can override it.
- Planned entries and `/wiki/*` have no canonical and stay out of the sitemap. The viewer awaits its Reddit response and returns an error status if content is unavailable. Redirects, missing pages, tracking parameters and reader fragments do not produce sitemap entries.
- The README discloses the personal project's AI assistance and community sources. Authored source notes and their generated guides now describe adaptation accurately. Six original BO7 guides have a compact source section in Full Details. Existing images and credits are retained; the old Reddit imports do not establish an exact wiki revision, so none is invented.
- No game landing pages, new artwork, keyword paragraphs, analytics or Google account-verification records were added. Guide routes, progress keys and desktop catalogue data are unchanged.

## Local checks

| Check | Result |
| --- | --- |
| `npm test` | 188 tests passed, zero failures. Covers the existing puzzle, navigation and saved-state suite plus eight SEO tests. |
| `npm run build` | Production build passed. Windows dependency tracing required access outside the filesystem sandbox. |
| `npm run check:seo -- http://127.0.0.1:3210` | All 177 catalogue pages returned the expected metadata and status; 147 eligible destinations were discoverable through existing links. |
| Alternate configured origin | The same HTTP suite passed on a second production server with `NUXT_PUBLIC_SITE_URL=https://seo.example.test`. Canonicals, Open Graph URLs, robots, sitemap and homepage schema agreed. |
| Initial HTML | Full guide articles present without executing JavaScript. Homepage heading, unique titles/descriptions, self-canonicals, indexing rules and homepage schema checked. |
| Redirects and errors | Legacy BO7 `.html` guide, retired Liberty Falls vault tool and `/checklist` returned their existing 301 destinations. Missing route returned 404. |
| Reddit unavailable | Network access to Reddit was unavailable in the local environment. The viewer returned 502 with `noindex` and no canonical, rather than a successful empty guide. Successful upstream Reddit content was not independently verified. |
| Generated files | Source wording survives catalogue regeneration. Website catalogue, search/progress data and desktop-generated files have no incidental changes. |

The HTTP checker derives expectations from the catalogue instead of freezing these counts. It inspects `<head>` metadata separately from instructional SVG `<title>` elements.

## Browser checks

Tested the production build on desktop and at a 390 × 844 mobile viewport, using a separate local origin to avoid modifying existing website/dev-server progress.

- Homepage to a planned entry to homepage to Terminus: indexing, canonical and homepage schema tags updated without retaining the previous page's tags.
- Terminus checklist: checked the first part, reloaded and observed it still checked with one of nine parts complete.
- Quick Parts / Full Details: switching views and returning from the tool preserved the existing `#details-power` destination.
- Terminus calculator: X = 10, Y = 11, Z = 20 produced 31, 46 and 21. Reload retained selections and result.
- Ashes of the Damned: opened a quick-step map link, inspected the selected map locations, and returned to the original quick step. Full Details exposed the new Sources and review section through the existing contents navigation.
- Mobile homepage, Terminus guide and calculator: no horizontal document overflow. Existing cards, game selector, reference symbols and reading controls remained usable. Desktop homepage styling matched the existing site.
- The successful browser run reported no console warnings or errors. An earlier browser automation tab timed out during a reload; the same workflow passed in an isolated preview.

These are functional and visual smoke checks. They do not establish field Core Web Vitals, a Lighthouse score, exhaustive browser coverage or in-game guide accuracy. No performance rewrite was justified by this change.

## Deployment and public discovery

The maintainer confirmed that GitHub pushes trigger Vercel deployment. Implementation commit [`0ffbc6e`](https://github.com/BarniKjellerenXD/CodWiki/commit/0ffbc6ec7ee9e5a30570a2e4dd25f6cd710b9112) was pushed to `master`. GitHub's Vercel check reported success for [this deployment](https://vercel.com/barnikjellerenxds-projects/cod-wiki/GB1r9LKNzQXu3VgUDYKQNWpZ6n1x).

The complete HTTP suite then passed against `https://codzmwiki.com`: all 177 catalogue pages, 147 sitemap destinations, metadata, internal discovery, query canonicals, initial guide HTML, legacy redirects, 404 handling and wiki exclusion. The public Reddit viewer returned 502 with `noindex`; successful upstream Reddit availability remains outside the verified results. The HTTP domain redirects to HTTPS with 308. The `www` hostname did not resolve during the check; all generated links use the working apex domain.

The existing local development server was also restarted after its configuration reload stalled, and it serves the updated homepage successfully.

To repeat the public checks, run:

```bash
npm run check:seo -- https://codzmwiki.com
```

Google account verification, Search Console and analytics are outside scope at the maintainer's request. Public links and the robots sitemap reference support automatic discovery. HTTP success shows that a page is available to crawlers; it does not establish Google indexing, selected canonical URLs, ranking, impressions or traffic.
