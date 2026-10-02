# BO6: Shattered Veil and Reckoning research

Reviewed 2026-10-02. Authoring source: `shared/bo6-dlc.mjs`. Do not edit generated guide components directly. Gameplay has not been personally verified; that limitation is visible in each guide. Root agent owns generation, catalogue integration and global browser/build checks.

## Scope and chosen structure

Shattered Veil has 7 main phases covering setup, Mark II, all canisters, all three variants paired with their rituals and Z-Rex. Its 7 side sections cover Wunderwaffe, Donut, bell perk, Marine SP, S.A.M. trap, fog experiment, sleepwalking, thermal ghost, song and hidden power-ups.

Reckoning has 9 main phases covering setup, Fowler/DNA, Gorgofex, Franken-Klaus, archive code, brain/energy delivery, fungal head, portal lockdown and both boss endings. Its 6 side sections cover both weapon upgrades, paintings/Aether Blade, Aetherella, turret upgrades, ring/accelerator/Deadshot perks, self-revive, shooting galleries, the later-discovered basketball crystal, Kazimir production, bins/vending, songs, cosmetic secrets and hidden power-ups.

Alternatives considered:

1. A single continuous essay is complete but hard to use during a run. Rejected in favor of existing Quick Parts plus expandable Full Details.
2. Generic item checklists reproduce the prose and do little calculation. Rejected as the principal tools.
3. Fixed cipher tables save input but different sites identify the same Shattered Veil board by different corners. Selected a direct letter-cluster decoder with the actual board image and visible intermediate counts.
4. Reckoning generic note fields would make users calculate chronology and atomic numbers themselves. Selected an ordered monitor decoder and a four-document visual selector. Their outputs are deterministic, validated and independently tested.

The helpers preserve the incumbent dark/gold interface, use existing `usePuzzleState` persistence and undo, label every input, provide 44px controls, expose output through a live region and confirm resets. Their inline and full-page states are shared. There are no invented game symbols or generated gameplay pictures.

## Principal evidence

The source arrays in the module contain the full bibliography. Research combined these sources; wording and routing are original, with brief factual extracts cross-checked rather than copying any full walkthrough.

| Source | Evidence used / reconciliation role |
|---|---|
| [r/CODZombies Shattered Veil wiki](https://www.reddit.com/r/CODZombies/wiki/shattered-veil/) | Coverage inventory, equipment locations, four Nursery board codes, current variant assignments and side quests |
| [Shattered Veil Reddit guide](https://www.reddit.com/r/CODZombies/comments/1jqgm62/shattered_veil_easter_egg_guide/) | Community route, canisters and variant progression |
| [Second Shattered Veil Reddit guide](https://www.reddit.com/r/CODZombies/comments/1jqcwa8/) | Independent route check; early incorrect canister-to-variant association was not adopted |
| [COD Zombies Guides Shattered Veil](https://www.codzombiesguides.com/main-quests/black-ops-6/shattered-veil/) | Screenshot provenance, interactable recognition, ritual completion and recovery cues |
| [PC Gamer](https://www.pcgamer.com/games/fps/call-of-duty-black-ops-6-shattered-veil-easter-egg/) | Setup, ritual spawns, distinction between example clues and match data |
| [Dexerto](https://www.dexerto.com/call-of-duty/shattered-veil-main-story-easter-egg-guide-black-ops-6-zombies-3175322/) | Count the whole letter cluster, including the requested letter |
| [Gameranx variants](https://gameranx.com/features/id/534161/article/black-ops-6-zombies-how-to-get-all-ray-gun-mark-ii-variants-on-shattered-veil/) | Variant build routes and one-free-Mark-II constraint |
| [Gameranx main quest](https://gameranx.com/features/id/534194/article/black-ops-6-zombies-shattered-veil-main-quest-easter-egg-guide/) | Three painting rituals and variant dependencies |
| [Shattered Veil Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3457623351) | Plant failure recovery, Library item alternatives and late boss movement |
| [Detonated Shattered Veil sides](https://detonated.com/all-shattered-veil-side-easter-eggs-in-black-ops-6-zombies-rewards-season-3/) | Sleepwalking/thermal ghost and S.A.M. status-based route |
| [Wunderwaffe side guide](https://codzombiesguides.com/side-quests/black-ops-6/shattered-veil/free-wunderwaffe-dg-2) | One fully completed ritual prerequisite |
| [Fog experiment](https://thebasedotaku.com/guides/black-ops-6-shattered-veil-jason-blundell-fog-rolling-in-easter-egg-walkthrough/) | Vermin/microwave/fan/chimney sequence |
| [r/CODZombies Reckoning wiki](https://www.reddit.com/r/CODZombies/wiki/reckoning/) | Archive reference dates/digits, monitor order, side coverage and images |
| [Reckoning Reddit route](https://www.reddit.com/r/CODZombies/comments/1mmzzy3/i_made_a_fairly_easy_to_understand_guide_for_the/) | Route ordering, carry recovery, comments correcting monitor order and Vermin-first feed |
| [Reckoning hunt](https://www.reddit.com/r/CODZombies/comments/1mi7kg4/reckoning_easter_egg_hunt_general_map_discussion/) | Discovery context and cross-checks |
| [COD Zombies Guides Reckoning](https://www.codzombiesguides.com/main-quests/black-ops-6/reckoning/) | Screenshot provenance, DNA final-entry gate, Klaus trial and both encounters |
| [Game8 Reckoning](https://game8.co/games/Call-of-Duty-Black-Ops-6/archives/542978) | Setup overview; full body unavailable to the browser, not relied on for detailed uncertain mechanics |
| [Earlier Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3544165787) | Corroborates routes; incorrect cyst count and internally reversed boss recommendation rejected |
| [Current Reckoning Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3764532618) | Captured devices must be picked back up; independent boss-choice correction; basketball discovery |
| [Detonated Reckoning sides](https://detonated.com/all-reckoning-side-easter-eggs-and-rewards-in-black-ops-6-zombies/) | Painting positions, reward activities and music |
| [MargwaNetwork](https://margwa.net/reckoning) | Side reward cross-check; longer detector-song repetition explains retry note |
| [Gameranx Aetherella](https://gameranx.com/features/id/547560/article/black-ops-6-zombies-how-to-complete-the-aetherella-easter-egg-on-reckoning/) | Initial companion activation; its once-per-match assertion is superseded by later community sources |
| [COD Zombie Guides Reckoning](https://www.codzombieguides.com/reckoning) | Kazimir station, gallery and newer basketball reference |
| [Call of Duty wiki Reckoning](https://callofduty.fandom.com/wiki/Reckoning_(Zombies)) | Repeat Aetherella charge and basketball location/final shot |

## Important reconciliations

- **Nursery board corners:** Reddit labels boards by bottom-left OUY/M/NI/S; COD:ZG labels top-left E/BCDEF/OSTUHJLD/AIOUY. No mixed lookup was shipped. A direct-count solver avoids this ambiguity. The source photo has `E / BCDSTVWXZ / KLMNPQR / OUY / FGHJ / AI`, yielding CRAB 9729, YETI 3192, MOTH 7394 and WORM 9377; all four are tested.
- **Canisters:** Any empty canister can be used for any station. A canister acquisition method does not uniquely name a variant. W = Henge/Supply Depot/Distillery; P = Serpent Mound/Director’s/Banquet; R = Conservatory/Garden Pond/Library.
- **Library book symbols:** Sources disagree between trial-and-error and a fixed described symbol order. The guide uses the game’s blue-confirmation behavior and real screenshot, which works without inventing symbol artwork or asserting an unverified layout.
- **Library item locations:** The illustrated guide lists fewer positions than the wiki/Steam guide. Wider community-reported alternatives are identified as such, rather than silently deleting them.
- **Marine SP cap:** The wiki records Pack-a-Punch II, while an early article describes a III save/reload workaround. Ship normal upgrade behavior, do not require a historical glitch, and make the conflicting cap explicit.
- **S.A.M. trap:** Different sources describe different terminal orders/round timing. The guide follows boot/clean/infected status cues and returns the actual dropped disk, rather than promising a deterministic one-round shortcut.
- **Cyst feed:** Three weakened Vermin, then three weakened zombies, absorbed near the container. “Roughly ten zombies” from the older Steam guide is rejected against current wiki, illustrated guide and Reddit corrections.
- **Reckoning monitors:** Deadshot initial first; family-tank initial second; one-word mode is explicit, so a missing observation never silently becomes a one-letter answer. Words change each round. Atomic numbers are padded to three digits.
- **Archive dates:** 6 Badge 1985-06-28; 1 Collar 1985-07-15; 3 Scarf 1985-08-21; 4 Watch 1985-09-02; 5 Goggles 1985-10-12; 2 Katana 1985-12-08. Exactly four are selected. Each card uses the wiki’s actual document screenshot.
- **Franken-Klaus:** Activating the S.A.M. screen alone is not enough; finish its nearby-kills trial. The Gorgofex-spawned Uber Klaus can energize the hanging body before transfer, or a later one can be used.
- **Portal levers:** Sources say four, five, six, or player-dependent. The shipped instruction is to flip each active red lever green until the completion flash; no unsupported fixed count.
- **No-return and boss choice:** DNA vial is required for final entry. Clearing portal crystals alone is unsafe. Tower 3 is the point of no return. Helping Richtofen fights S.A.M.; helping S.A.M. fights Richtofen. The Gorgofex upgrade choice is separate.
- **Boss health fractions:** S.A.M. intermissions are described as thirds in the wiki and quarters in other guides. Guide follows the observable trial transition instead of asserting a fraction.
- **Aetherella:** Early guide calls it once per match; later wiki/Steam describe the returned figure in the beam. Guide says recharge when it actually reappears.
- **Later basketball secret:** Corroborated by current Steam, COD Zombie Guides, Call of Duty wiki and a February/March 2026 discovery video. Distinct from the launch-day Reception shooting gallery.
- **Attic:** No reliable Shattered Veil attic side-quest evidence found; search results conflated Haven’s Hollow mansion navigation with Zombies. No invented quest added.

## Asset and implementation verification

`docs/bo6-dlc-assets.json` records each local file, original URL, source page, credit and review date. 54 real screenshots total, approximately 13.5 MB. Every downloaded asset is referenced by a guide or helper; none is a decorative unused download. The Nursery board and Badge document were visually inspected at source resolution. All symbols are game screenshots or standard periodic element notation.

Custom widget: `app/components/puzzle/Bo6Dlc.vue`. Registered tool IDs: `bo6-shattered-cipher`, `bo6-reckoning-element`, `bo6-reckoning-files`. Fields are declared in the metadata so existing state normalization, local persistence and shared inline/full-page behavior work unchanged.

Pure helper tests: `node --test tests/bo6-dlc.test.mjs` — 5 passing tests covering all four photo board codes, incomplete/duplicate/invalid clusters, monitor order and leading zeros, stale second-monitor input, archive chronology and exactly-four selection. Root independently compiled the Vue SFC and will run global tests/build and browser QA.
