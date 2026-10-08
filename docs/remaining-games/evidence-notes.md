# Evidence decisions and verification limits

Reviewed on 7 October 2026. This pack combines repository inspection, public walkthroughs, original community references, source photographs and independently checked puzzle mathematics. It does not claim that the thirty routes were played through during this task. The [source registry](sources.json) records the scope of individual references; the [verification report](verification.json) records checks actually performed.

## Decisions the coder should preserve

| Subject | Evidence or conflict | Selected behavior |
| --- | --- | --- |
| Game identities | WWII story chapters share settings with survival maps; three games use Outbreak; several editions use Shi No Numa | Keep every existing map ID and edition. Author thirty entries, with explicit chapter/survival and Vanguard labels |
| Source coverage | The community index labels AW Infection incomplete and Carrier/Descent unstarted | Use the modern detailed routes plus original discovery/tutorial references; do not treat an empty wiki as a full walkthrough |
| Guide architecture | The repository already has generated guide/tool pages, inline tools, saved observations and guide progress | Extend those systems. Remove a planned record only when its matching authored guide is registered |
| Persistent arrays | The current tool sanitizer preserves declared flat fields | Declare bounded slots/cells, or deliberately add and test an array field type. Never assume nested objects survive reload |
| Spaceland / Descent panels | Colour is tied to the observed physical layout | Record the layout separately from each sequence; repeats remain repeats |
| Shaolin Morse | Phone groups represent digits | Require five signals per digit; preserve leading zeroes and invalid group positions |
| Shaolin word list | The reviewed inventory has 71 words, including the bonus entry SAVAGEMADETHIS | Keep the complete inventory and return all candidates. Do not treat the bonus entry as a normal common-word probability |
| Attack chemistry | Recipe costs and a crafted compound's own diamond value are different observations | Calculate each reaction from its placed ingredients, subtract O once, and retain filter context. Pennies/Quarters use Market rear; Dinitro/Phenol/Sludge use Garage. Direct chart review and the original board list support these assignments |
| Attack radio | One negative line sounds superficially positive | Require the affirmative chosen-chemical cue; “crude solution” is not the selected recipe |
| Attack O/filter | Published shortcuts infer a result from restricted known value sets | Baseline uses actual O-marker and TV-band observations. Show ambiguity rather than auto-selecting an inferred match |
| Skull Hop | The original solver uses positive physical-position offsets and wraps zero to Z; the newer reference omits that last conversion | Independent formula and BENZENE fixture supplied. Use SOLVOLYSIS, correcting the original dictionary's spelling. Keep this optional calculation separate from chemistry |
| Beast disk ordering | Older and newer sheets present different reading directions | Use the twelve indexed photographs and the dataset's insertion direction. Evaluate every row and preserve different possible orders |
| Beast handles | Older wiki and modern illustrated routes describe opposite orientation conventions | Select the two agreeing modern routes: snapshot horizontal handles and repeat toward vertical. Ship a recorder, with no unsupported influence matrix |
| Beast finale | Ordinary Mammoths ending and Mephistopheles require different progression | Track account keys/talismans separately. After five Meph rituals, damage during talisman fill, interact with all five, then finish the exposed central boss |
| Shadowed statues | Each affected statue has its own rate; walls differ | Use the row-weighted neighbour matrix. Exhaustive checks identify unreachable observation states; ask for correction, never issue a fabricated route |
| Frozen hammer | The four-block base puzzle and three-stage upgrade apparatus are different objects | Apply the matrix only to base pillars. Use the upgrade's own instruction plate and reset cues |
| Tortured Path | Quest windows and same-lobby continuity matter; survival has a different PaP schedule | Use the complete wave table in the WWII brief. Story batteries: 1/4/7. Survival: 1/5/10. A preparation recommendation is not an asserted engine prerequisite |
| Darkest Shore cannon | Fuse dials and ship positions are two separate tasks | Preserve signs/zeroes and physical dial order; use the eleven-example NinjaNationGaming aiming plate for ships |
| Carrier grenade rows | The machine displays equipment icons | Throw Contact Grenades at those icon moments. Do not ask the player to acquire six unrelated grenades. Baseline uses the original Frag endpoint |
| Descent panel | Slam hits can also count as jumps/kills | Plan slams first, re-observe, then purchases/kills, then jumps. Do not treat four digits as independent actions |
| Terra page order | Wrong physical entries reset the attempt; discovered prefixes still help | Keep prefix-conditional rejection and accepted history across attempts |
| Archon rune art | The linked Myst3ryo chart could not be retrieved; no complete fixed glyph atlas was established | Baseline accepts short symbol labels and observed ground notes for 3/4/5 sequences. A photographed selector is a defined capture enhancement; no invented glyph count or static mapping |
| MWIII mission access | Official launch-era gates and later mission availability differ | Use the available mission and actual named portal/exfil prompt. Personal unlock and squad participation are separate |
| MWIII seasonal contracts | The seasons are different destinations | S2 uses Bounty/Outlast/Extractors. S1 and S3 have their own Escort routes. S5 includes Spore Control. Never copy one season's contract list into all four |
| MWIII entry event | Season 6 announced free ordinary entry; later reports, including September 2026, require Sigils | Label the waiver historical and the entry guidance dated; teach the actual interaction prompt |
| MWIII rewards | S1's Elder progression differs from later random rewards | Separate acquisition, schematic and blueprint goals. Never promise all later-season schematics from one run |
| MWIII portal glyphs | 24 source triplets use eight visually distinguishable glyphs | The photographic atlas and all triplets are supplied. Grid duplicates retain unique marker identities; no guessed Unicode substitution |
| Red Worm | Four locations change per deployment; USB identities are acquired there | Match clue photos, record actual drive IDs, and find the boss site by paired caches/refractors. No permanent Alpha-to-location mapping |
| S3 Smoke Signals | The secret Gyanxi route is available in ordinary or Elder visits | Three contracts, outer spores, Rift Heart, protective minions and boss reward form a separate optional branch |
| S5 Diary | Sources describe different exact kill-count interpretations | Teach blade bounces through grouped Specials and confirm by the actual reward Rift; no guaranteed universal “five kills” claim |
| S5 Infinite Cosmos | Secret fight access and blueprint reward are different conditions | The blueprint requires Elder; show this before the maintenance portal commitment |
| Unstable Rift | Obelisk/Rift spawns are dynamic and public | Use candidate references and observed cues; do not predict a fixed spawn, timer or ownership |

The reference software URLs in `sources.json` are evidence for factual tables, offsets and orientation. The future app should use independently authored utilities. The pack contains no copied third-party runtime in the application.

## What was checked

The durable validator [verify-data.mjs](verify-data.mjs) checks the thirty-map scope, game totals, unique IDs, tool ownership/phase references, dataset sources, local document links, image paths and SHA-256 integrity. It independently enumerates every encoded statue wall, all 256 base-hammer states, all 495 four-symbol disk selections and 340 Skull Hop sequences. It checks the recipe graph, arithmetic fixtures, 92 eight-queen solutions, Morse/word inventories, fifteen Vanguard translation pairs and 24 portal triplets.

Pillow separately decoded all downloaded image files, recorded actual dimensions/formats and checked their recorded hashes. Important chemistry, radio, translation, cannon, Red Worm and portal-code references were visually inspected; most location screenshots received file validation rather than individual fine-detail review. The manifest states these separately.

The JSON dictionaries do not turn a source report into a guarantee that the current game accepted a result. Mathematical fixtures prove the implemented interpretation of the supplied rules; an in-game comparison establishes whether the rule is described and oriented correctly for the displayed edition.

## Artwork and release work

The image catalogue is research material outside `public/`. Source attribution is recorded; public availability does not establish permission to republish a creator's chart or screenshot. The recommended production route is to use these references to select or capture the exact necessary views, then place only the chosen images into maintained production paths. Keep a local authored diagram where it faithfully records verified factual geometry.

Remaining visual work has a concrete [asset plan](asset-guide.md): complete Archon glyph selectors, Meph attack poses, variant-specific exit/boss shots, accurate alt text and calibrated map layers. These are capture/review tasks, not a request for the coder to invent puzzle rules. The baseline Archon memory aid remains implementable without the unavailable chart.

Before publication, play-test the selected routes and their solo/co-op branches, confirm timed windows and visible success/failure cues, and test website/mobile/desktop persistence and navigation. The research task deliberately does not run the app's generators/build, because those would rewrite application files before the requested implementation begins.
