# CodWiki search visibility plan

Prepared 3 October 2026. This plan is for the maintainer and anyone implementing search improvements to `codzmwiki.com`.

The aim is to help players find the guides and tools that already exist, while keeping CodWiki useful during a match and manageable as a personal project. Preserve the current homepage, direct map links, reading views and images. Concentrate on accurate page metadata, reliable discovery, honest attribution and a small amount of maintenance.

**Status:** Local implementation and checks are complete; see [verification and deployment notes](search-visibility-verification.md). Google account verification and Search Console setup were removed from scope at the maintainer's request. Production responses and Google's indexing decisions must be distinguished from local checks.

## Decisions that guide the work

- Keep the homepage's game rail, map catalogue, search, tools and direct links. There will be no new game landing pages or intermediate screens.
- Keep the current visible headings and introduction, including “Ready for your next run?”. More descriptive browser and search titles can be supplied independently.
- Keep Quick Parts, Full Details, interactive maps, inline tools, the desktop app and saved progress working as they do now.
- Retain existing routes, guide anchors and storage identifiers. A search improvement must not invalidate a bookmark or saved run.
- Use the existing artwork and reference images. New screenshots, generated imagery, promotional graphics and image replacement are not required for this work.
- Describe the project as a personal project built with AI assistance, drawing heavily on Reddit and other community sources. Credit discoveries and materials accurately.
- Keep maintenance small. No content quota, routine rewriting, extra articles, pop-ups, advertisements, account requirement or tracking scripts are part of the plan.
- Use public discovery and technical checks. The maintainer does not want to associate a Google account with the domain; Search Console, Google account verification and analytics integration are outside scope.

Success means that relevant searches can lead straight to a useful existing page. Examples include “Terminus guide”, “Origins ice staff code”, “BO6 Terminus calculator” and “CoD Zombies guides”. These are candidate queries based on the site's content, not researched search-volume or competition estimates. The homepage can serve the broad query; individual guides and tools can serve the specific ones.

Search visibility is an opportunity, not a promise of first place. Google may prefer the original source or another resource for a particular query. CodWiki's contribution is its organization, quick reference views and interactive helpers. Google's guidance emphasizes usefulness and accuracy, including when AI is involved. Disclosure should explain how the project was made; it is not a ranking shortcut. [Google guidance on AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).

## Repository baseline before implementation

| Area | Current state | Consequence for this plan |
| --- | --- | --- |
| Guide access | Individual guide routes and ordinary links from the homepage | Improve existing destinations without adding navigation levels. |
| Guide rendering | `GuideArticle.vue` renders Quick Parts and the full article on the server; the full article uses `v-show` | Preserve this. Test that important instructions remain in the initial HTML. |
| Guide titles | Shared title is currently `${title} · CodWiki` | Add the game/version and a truthful page purpose in metadata. |
| Descriptions | Guides use a common “complete walkthrough” sentence; tools generally set only a title | Replace broad claims with descriptions matching each page's actual scope. |
| Discovery | `public/robots.txt` allows crawling; no sitemap implementation was found | Add a generated sitemap and its robots reference. |
| Canonicals | No canonical-link implementation was found | Give each indexable page a consistent preferred URL. |
| Catalogue | 66 authored map/mode entries, 30 planned entries, two additional Outbreak quest routes and 77 active tools | Derive coverage from catalogue data, including child quests and special routes. Authored does not mean fully verified. |
| Attribution | Many guides include Sources and review sections; research and image records exist in the repo | Preserve and improve these records without requiring a new editorial workflow. |
| Compatibility | Legacy guides/tools redirect; `/checklist` redirects to `/` | Keep redirects and omit their source URLs from the sitemap. |

## Phase 1 Project disclosure and accurate credit

The README explains that this is a vibe-coded personal project, that most guide material comes from Reddit and other sources, and that source review and automated tests do not establish a complete in-game playthrough. It also invites corrections and missing credits.

For the website follow-up, review existing attribution text in place. `scripts/generate-expansion.mjs` currently supplies a default “Original concise walkthrough” note, and some authored modules supply their own “Original walkthrough” notes. Prefer wording such as “Walkthrough adapted from the community sources below. Sources reviewed on [recorded date]. This revision has not been verified in a complete in-game run” where that accurately matches the record. Do not imply human review if the record only establishes AI-assisted source checking. Do not invent a date or imply that a gameplay test happened.

Edit the authored `reviewNote` values in `shared/` and the generator's fallback. Editing only generated Vue files would lose the correction at the next build. Review the original BO7 guide source links separately: not every older guide uses the generated attribution section. Add a known missing source link to the existing guide/credit area when its origin can be established; leave unresolved origins recorded as unresolved.

Keep image credits and source manifests. Describe borrowed screenshots as borrowed references, and retain distinctions between a source review date, a content edit and an actual gameplay test. Avoid a blanket statement that all materials are original, all credits are complete or all third-party material is covered by the code's licence.

**Completion check:** The README and revised source notes agree about the project's origins. A fresh catalogue generation preserves the corrected notes. No new attribution banner or reading obstacle is required. A small link to the README's disclosure can be considered later if a suitable existing credit area needs one; it is not a prerequisite for the technical work.

## Phase 2 Descriptive metadata on existing pages

Update HTML titles and meta descriptions through the existing Nuxt head system. Keep page layout, map names, card labels and visible headings intact. Google can choose different title links or snippets, so the metadata is a useful suggestion rather than a guaranteed search-result appearance. [Google title guidance](https://developers.google.com/search/docs/appearance/title-link), [snippet guidance](https://developers.google.com/search/docs/appearance/snippet).

| Existing destination | Proposed title | Description should cover |
| --- | --- | --- |
| `/` | Call of Duty Zombies Guides and Tools — CodWiki | Map guides, Easter egg steps, puzzle tools and progress saved on the device. |
| `/guides/bo6-terminus` | Terminus Guide and Easter Egg — Black Ops 6 — CodWiki | Quest steps, setup and the Beamsmasher helper already on the site. |
| `/guides/bo3-origins` | Origins Guide and Staff Upgrades — Black Ops 3 — CodWiki | The Chronicles version, quest steps and staff references actually covered. |
| `/tools/bo6-terminus-lab` | Terminus Beamsmasher Calculator — BO6 — CodWiki | Entering the observed lab symbols and calculating the corresponding numbers. |
| `/guides/cw-outbreak-ravenov` | Outbreak Ravenov Implications Guide — Cold War — CodWiki | This specific quest, distinct from Operation Excision. |
| `/guides/bo7-super-easter-egg` | BO7 Super Easter Egg Guide — CodWiki | The existing toy quests and final Warden instructions. |

Suggested implementation:

1. Add a small shared metadata resolver using catalogue route, map, game and tool information. Keep short, reviewed title/description overrides in an authored file such as `shared/seo-overrides.mjs`; keep routing and default rules in `shared/seo.mjs`.
2. Add an `app/composables/usePageSeo.ts` wrapper for consistent `useSeoMeta` and `useHead` output. Register it once in `app/app.vue`, covering the homepage, guides, tools, planned entries and the separate Super Easter Egg page. One reactive registration prevents old page metadata from surviving navigation.
3. Include the game/version where maps share a name. Use a general “guide” title for survival/reference pages rather than assigning “main Easter egg” to every map. Describe recorders as recorders and calculators as calculators.
4. Write concise, factual summaries for the example pages first, then check every indexable route's fallback. Avoid unearned “complete”, “all”, “official”, “verified”, “best” or “updated today” claims. Do not turn every spelling or keyword variation into a separate page.
5. Keep head data reactive so navigation between guides, tools and planned entries cannot leave the previous page's title, canonical or robots rule behind. Avoid importing all walkthrough and research content into the browser merely to construct metadata.

For example, a Terminus description could be: “Follow the Terminus quest in Black Ops 6 with setup notes, a Beamsmasher calculator and checklists saved on this device.” It states available features without promising a tested or exhaustive guide.

**Completion check:** Every indexable route has one suitable title and description. Shared map names identify the right game. Metadata works on both a direct page load and navigation within the site. The content on the page supports its description. Existing visible headings stay intact.

## Phase 3 Canonical URLs and reliable discovery

Add a configured public site origin, defaulting to `https://codzmwiki.com`, in `nuxt.config.ts`. Use that same origin for canonical links and the sitemap. Keep existing route slugs.

Each indexable guide and tool should identify its own preferred URL. A tool with a distinct purpose remains canonical to itself, rather than to its parent guide. Leave navigation hashes and saved reader state working normally; omit those fragments and non-content tracking parameters only from canonical metadata and sitemap entries. The current views do not require separate indexable URLs.

Choose a consistent trailing-slash convention matching current links, and inspect production HTTP/HTTPS and www/non-www behavior before changing redirects. Preserve existing legacy redirects. A canonical link expresses a preference; it does not guarantee Google's selection. [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

Implement `/sitemap.xml` as a Nitro route, for example `server/routes/sitemap.xml.ts`, using the catalogue and the same page eligibility rules as the metadata resolver. Include the homepage, authored map guides, the two child Outbreak guides, the separate Super Easter Egg route and active tool pages. Deduplicate routes. Use absolute URLs and proper XML escaping.

Do not list planned entries, redirected/retired tools, legacy `.html` URLs, `/checklist`, wiki proxies, missing pages, search terms or section hashes. Start without `lastmod` unless a dependable date of a substantive page change exists; build time and research-review dates are not automatic substitutes. Omit `priority` and `changefreq`. Reference the sitemap from `/robots.txt` and keep the assets required for rendering accessible. The implementation uses a Nitro robots route instead of the old static file so its domain follows the same runtime configuration as the sitemap and canonical links. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

**Completion check:** The sitemap is valid XML and contains exactly the expected eligible routes. Every listed URL returns a successful page and agrees with its canonical. Direct links to old URLs and bookmarked sections still reach the intended guide or tool.

## Phase 4 Deliberate indexing rules

Use one shared eligibility policy so a page cannot accidentally be marked `noindex` while appearing in the sitemap.

| Page type | Proposed search treatment | Site behavior |
| --- | --- | --- |
| Homepage, authored guides, active tools | Eligible for indexing with their own canonical | Current access and interaction. |
| The 30 Guide planned entries | `noindex`; omit from sitemap until useful guide content is added | Remain reachable in navigation and site search. |
| `/wiki/*` Reddit viewer | `noindex`; omit from sitemap while it is a proxy of external content | Preserve it for anyone who uses it. |
| Legacy `.html` URLs, retired tools and `/checklist` | Preserve their permanent redirects; omit source URLs from sitemap | Existing destinations and bookmarks continue to work. |
| Nonexistent routes | Verify a real HTTP 404 response; omit from sitemap | Keep a useful error experience. |

Excluding planned entries is a choice about what a search visitor can use today, not a claim that placeholders automatically penalize the whole site. Likewise, adapted guides with useful interactive features need not all be excluded just because they cite external sources. The proxy viewer has a different purpose from the authored companion guides.

Return `noindex` in the initial HTML or response header for excluded content. Do not block those URLs in `robots.txt`, because Google needs access to see the rule. Do not use `noindex` as a substitute for canonicals on ordinary query variants. [Google indexing controls](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

**Completion check:** Planned and proxy pages remain accessible but are excluded from the sitemap. Switching from a planned entry to a finished guide clears `noindex`. Adding an authored guide through the normal content workflow makes its eligibility update consistently. Missing pages never masquerade as successful guide pages.

## Phase 5 Existing content and small optional improvements

Confirm that the current homepage's map and tool links appear in the initial HTML, and that each child quest is linked from its parent. A crawler should not need to type into site search to discover a guide. Keep ordinary internal links and their direct destinations. Preserve the server-rendered Full Details content even though Quick Parts is initially selected; do not introduce crawler-specific content or force a different default view. [Google JavaScript guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

Measure the homepage, a long illustrated guide and an interactive tool on mobile. Only pursue a performance change when measurement identifies a real problem. Candidates include an unnecessarily large image, missing dimensions, a blocking request or heavy code loaded before it is needed. Keep reference symbols readable, image enlargement available and map loading lazy. Do not remove useful content to chase a perfect audit score. [Google Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals).

Existing image alt text should explain instructional images. Decorative card artwork can retain empty alt text when the linked card already supplies the name. Do not fill alt text with search phrases or claim that a sourced image was created for CodWiki. Making original images is not part of this plan.

Two optional metadata improvements can follow the essential work:

- Add Open Graph title, description and URL fields for clearer shared links. Reuse an appropriate existing credited image where suitable, or omit the image. This is a sharing improvement, not a promised ranking increase.
- Add a small `WebSite` structured-data object on the homepage identifying CodWiki and its URL. Defer more elaborate schema until the content and visible navigation justify it. A breadcrumb must not invent a game page; authors, dates, reviews and ratings must not be fabricated. There is no need to add FAQ sections or more pages to satisfy a schema type. [Google site-name guidance](https://developers.google.com/search/docs/appearance/site-names), [structured-data rules](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

**Completion check:** Any change in this phase has a stated benefit and measured or directly observable evidence. Images and puzzle references remain usable. No new content production or regular maintenance obligation is introduced.

## Verification before publishing

During implementation, add focused checks for the behavior that could affect the whole catalogue. Useful cases are title/version selection for duplicate map names, inclusion of child and special guides, exclusion of planned and retired routes, and agreement between canonical and sitemap eligibility. Derive the expected route set from the catalogue rather than relying on the counts in this dated plan.

Run the existing `npm test` suite and `npm run build`. Inspect generated changes because those commands can refresh website and desktop catalogue files. Metadata work should not unintentionally change saved-state IDs, desktop shortcut entries or theme files.

Inspect initial HTML from the production build for the homepage, a BO7 guide, a generated guide, both Outbreak quests, the Super Easter Egg page, a tool and a planned entry. Check the wiki proxy, one legacy redirect and one nonexistent path separately. Verify status codes, title/description, canonical, robots rules and actual guide text. Check that an external Reddit failure does not make the proxy appear to be a successful standalone guide.

Use a browser for the behavior that raw HTML cannot establish. Navigate from a planned page to a guide and back; open a saved hash link; switch reading views; use a puzzle tool; reload saved progress; open the interactive map and return to its step. Compare representative mobile and desktop screens with the existing site. These checks protect the experience the maintainer asked to retain.

**Release condition:** Essential metadata, sitemap and indexing checks pass, and the existing guide workflow remains intact. A local build is not evidence of deployed behavior, and a successful deployment is not evidence that Google has indexed it.

## Public discovery and a small maintenance routine

Google can discover a public site through links and can discover its sitemap through `robots.txt`. Search Console is optional. This implementation will not associate a Google account with the domain, submit account-verification records or add analytics. [Google discovery guidance](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [sitemap discovery](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

1. Record the date the changes reach production and run the same read-only page, sitemap, robots and redirect checks against the public domain.
2. Keep the sitemap available at `/sitemap.xml` and referenced by `/robots.txt`. Let ordinary crawling discover the site; this does not require a manual account-based submission.
3. After roughly four to six weeks, an optional public search for the site or a specific map/tool can give a limited indication of discovery. Search results are not a complete indexing report, and absence from a query does not establish a technical failure. The interval is not a promise of rankings. [Google timing guidance](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
4. Thereafter, rerun technical checks after relevant code changes and fix reported broken links or inaccurate instructions. There is no recurring content obligation or automatic monitoring schedule.

Query impressions, click counts and Google's chosen canonical URLs will not be available through this account-free workflow. Record that limitation honestly instead of claiming that a successful page fetch proves indexing or ranking.

Sharing a useful calculator or guide with a community or creator is optional, when relevant and welcome. Link to the exact useful page and credit its sources. There is no backlink quota, outreach campaign or scheduled promotion in this plan.

## Work order and completion boundary

| Order | Deliverable | Depends on | Completion evidence |
| --- | --- | --- | --- |
| 1 | README disclosure and this plan | Repository and maintainer's stated intent | Included with this documentation change. |
| 2 | Shared metadata/eligibility rules and truthful page summaries | Existing catalogue and authored source records | Every intended route has appropriate metadata; no visible layout changes. |
| 3 | Canonicals, sitemap and indexing controls | Shared rules | XML, route, HTML and navigation checks pass together. |
| 4 | Accurate wording in existing attribution notes | Known source/review records | Regeneration retains honest wording and credits. |
| 5 | Build verification and deployment of essential changes | Completed local implementation | Live responses match the verified build. |
| 6 | Public discovery setup | Live sitemap and robots file | Both are publicly fetchable and agree on the site origin; no Google account is required. |
| 7 | Optional sharing metadata and measured performance fixes | A concrete benefit or observed problem | Small verified improvement with no extra reading steps. |
| 8 | Occasional public and technical checks | A published site or a reported issue | A specific correction when needed; no account or recurring content obligation. |

The essential implementation ends after the existing pages are accurately described, discoverable and verified in production. Search rankings remain an ongoing external outcome. Further work should follow actual user needs or observed problems, while preserving the constraints at the start of this plan.
