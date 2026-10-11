# Map filtering and marker standard

Research specification and selected implementation, 11 October 2026. Compact controls supersede the exclusive-button recommendation in the earlier MW3 filter plan. The detailed historical rail/drawer proposal below is retained for reference; [implementation notes](../map-expansion-implementation.md) describe the actual shipped behavior.

**User-selected implementation:** Compact toggles, replacing the checkbox rail. Common types are multi-select pressed buttons; More filters discloses grouped additional types and activities. Group buttons use pressed/mixed states, with no required Apply action. Essentials expands into ordinary physical type selections, so disabling Perks actually removes their browsing pins. All locations enables the physical types; Hide all clears the checked set. The OR rules, exact counts, saved-state migration and independent guide/photo state apply. Optional state facets, custom preset labels and the sidebar/drawer below remain proposals rather than implemented features.

## Recommendation and alternatives

| Approach | What improves | What remains difficult | Decision |
| --- | --- | --- | --- |
| Better icons with current single-choice buttons | Visual recognition; smallest migration | Cannot combine perks, upgrades and quest entries | Too limited |
| Multiple-choice horizontal chips | Combines location sets with a modest UI change | Dozens of subtypes overflow, especially on mobile | Keep chips only for presets/current selections |
| **Grouped checkbox rail + presets + shared SVG icons** | Clear legend, arbitrary combinations, predictable semantics, scalable subtype vocabulary | More authoring and storage migration | **Choose** |

The standard is a shallow, two-level list: group → independently selectable leaf. It is not a deeply nested tree or a faceted query builder. The same leaf can exist across games with local labels where terminology differs; unique quest/activity names remain map-specific.

## The four separate meanings

1. **Object type** answers what the map entry represents: Pack-a-Punch, ammo cache, perk machine, part, key, named room, and so on. Every location must have a reviewed `typeId`.
2. **Activity membership** answers what uses it: main quest, a particular wonder-weapon quest, music, Red Worm, etc. One location may belong to several activities; a part remains discoverable under Parts even if also used in a quest.
3. **Availability/conditions** answer whether it is a possible spawn, a conditional interaction, a moving object, or a fixed reference, and which mode/time state applies. A published position does not establish live availability.
4. **Precision** answers how exact the map placement is: point or approximate area. A possible spawn can have an exact coordinate; a permanent landmark can be represented by an approximate area. Do not merge these concepts.

## Stable groups and leaves

Render only populated leaves. The vocabulary below is the baseline, not a requirement to fabricate missing map content. New physical types require an explicit registry entry and icon review. Broad legacy `category` values can be retained temporarily for compatibility but must not determine all semantics.

| Group | Leaf/object IDs | Required distinctions |
| --- | --- | --- |
| Power & upgrades | `power-switch`, `generator`, `pack-a-punch`, `arsenal`, `upgrade-station`, `armor-station` | Power versus PaP versus Arsenal; game-specific upgrades have correct local names |
| Perks | `perk-machine`, `wunderfizz`, `perk-reward`, `cursed-peeks` | Ordinary machine ≠ random reward ≠ Cursed candidate; optional `itemId` identifies a known perk |
| Weapons & supplies | `wall-buy`, `mystery-box`, `ammo-cache`, `armor-buy`, `crafting-table`, `gobblegum`, `fuel-station`, `doghouse` | Weapon box versus wall buy; supplies and helpers retain meaningful subtypes |
| Parts & collectibles | `buildable-part`, `quest-item`, `key`, `clue`, `code-symbol`, `music-item`, `dig-site`, `collectible` | Parts are selectable independently of activities; do not bury all parts behind Main quest |
| Travel & exits | `door-buy`, `fast-travel`, `teleporter`, `portal`, `zipline`, `launch-pad`, `exfil`, `entry-point` | Paid doors ≠ fast travel ≠ exit; distinguish ordinary/final exfil by subtype/condition when sourced |
| Traps & mechanisms | `trap`, `turret`, `workbench`, `ritual-site`, `quest-mechanism`, `fishing-site`, `challenge-starter` | Generic crafting differs from a named quest workbench; no runtime inference from names |
| Quests & activities | `activity:main-quest`, `activity:music`, map-specific IDs such as `activity:red-worm-usbs`, `activity:red-worm-clue-boards`, `activity:unstable-obelisks` | Authored membership; can include areas, parts and machines; never changes the physical icon |
| Areas & landmarks | `spawn-area`, `named-area`, `boss-arena`, `reference-landmark` | A room-area guide target is not a precisely located item |

Namespace global type filters as `type:<type-id>` and activity filters as `activity:<activity-id>`; scope every preference record to the dataset ID. A leaf can match an explicit verified `locationIds` set or be compiled from typed location membership at build time. Prefer a compiled set in the renderer so shared semantics remain easy to test.

Optional narrow children inside Perk machines (specific perks) should use `itemId` and remain at most one disclosed list, not add many global top-level options. Unspecified `Perk-A-Cola` records stay unspecified. Avoid publishing a branded icon that claims an item identity not supported by the record.

## Exact filtering rules

All checked leaf sets combine with **OR**, including leaves in different display groups. Thus Ammo + USB devices + Keys displays all three. A location in two checked leaves appears once. Group membership itself adds no AND condition.

The resulting union is intersected with the selected geography/layer, explicit scenario/mode scope if present, the optional availability facet and the search term. Values within an optional multi-select state facet combine with OR; different dimensions combine with AND. Most maps need only layer and search; advanced facets remain collapsed or absent unless authored metadata is reliable.

```text
browse = union(checked leaf location IDs)
scoped = browse AND active region/layer AND selected documented state
matched = scoped AND current text query
visible = matched OR explicit guide-highlight IDs on this layer/state
```

`Unknown` state must not silently become `fixed`, `standard mode`, or excluded by default. Default state scope is All documented positions. A location with no mode restriction is general; a location with missing/unreviewed availability is marked unknown. A specific mode must never claim certainty about live random spawns. A linked guide location that requires another state prompts a visible state/layer switch instead of drawing it on the wrong map.

Empty checked leaves mean **zero browse pins**, never all. The guide overlay is separate and its extra count is explicit. A true Search all action temporarily uses all discoverable locations as the browse union; it preserves the checked set and makes the scope visible. Search typing never silently expands scope.

Query fields include label, location description, type label, known aliases, layer/region, grid, floor and state text. Changing a checkbox keeps the query and camera position. No automatic fit on every filter change. Fit visible/selected/map remains an explicit command.

## Select all, groups, presets and counts

- Group parent state: unchecked if none of its leaves are enabled; checked if all are enabled; indeterminate otherwise. Parent click selects all children if unchecked/mixed, clears all if fully checked. A separate chevron controls disclosure.
- All locations enables every discoverable leaf; Hide all clears the checked set. Reset to essentials applies the authored baseline. None of these controls resets guide completion, collected observations, game tools or independent notes.
- Presets **replace** the checked set: Essentials, Main quest where authored, All locations, and useful named map activities. Manual leaf edits change preset status to Custom. Presets are shortcuts over transparent checkboxes, not a second hidden filter system.
- Leaf count is its matching locations under layer/search/state, independently of whether that leaf is checked. Parent/preset counts use set union. A zero-current-layer leaf can still indicate matches on other layers; it is not silently disabled.
- Show `N on this layer · M on other layers` for the active result set and `+ K guide locations outside filters` where needed. Do not sum overlapping group counts to obtain map totals.
- “Enabled filters” count means number of checked leaves, not number of locations or groups. Label it clearly in the mobile Filters button. The map caption uses location counts.

Native checkboxes, visible labels, grouping and mixed-state semantics follow the [W3C checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/). Prefer the native `indeterminate` property rather than faking partial selection with styling alone.

## Guide selection and restoration

An incoming guide target wins over persisted browsing for visibility and focus, but it must not overwrite the saved checkbox set. Capture the prior browse context/camera and show a persistent `Guide locations (n)` chip/control. Add its pins as an explicitly labelled overlay with a gold halo, independent of their type icons. The user can toggle the overlay, clear it, fit it, or return to the guide.

Filters continue to work while a guide target is highlighted. Changing a checkbox or preset does not silently discard the target or widen its membership. Clear highlight restores the prior camera only if the user has not manually moved it; preserve any deliberate checkbox edits made while inspecting the target. Back to step restores the exact reader context, scroll and focus under the current GuideArticle contract. A new incoming target replaces the prior highlight; browser back/forward restores the corresponding target. Do not persist an incidental search or guide overlay as the user's default map configuration.

The old BO7 behavior of silently preserving selected pins and the old MW3 behavior of clearing them on activity changes become one explicit model. If an implementation chooses an additional Focus only action, it must be an ephemeral view with a visible return to browse and may not overwrite saved preferences.

## Marker standard

Use local SVG silhouettes, one consistent stroke language and a small category tint family. The object icon stays stable regardless of which activity checkbox revealed it. Category tint is supplementary: the icon, text label and legend also identify the meaning. [W3C use-of-color guidance](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) requires a non-color means of conveying the distinction.

Suggested mappings: power switch → power; upgrade machine → PaP; tools → Arsenal; bottle → perk; dispenser → Wunderfizz; bunny → Cursed Peeks; wall weapon → wall buy; question box → Mystery Box; cartridge/crate → ammo; puzzle piece → part; key → key; music note → music; portal rings → portal; door → bought door; exit/helicopter → exfil; shovel → dig site; hazard bolt → trap; room outline → area. Select and preview final glyphs as one set before authoring every map.

Use a solid marker for point precision and dashed area extent for approximate placement. Candidate/conditional badge conveys availability without changing precision. Keep a stable physical icon when a target has ordered numbers; use a number badge for true sequences and photo reference numbers. Selected = gold halo/outline; focused = additional clear focus ring. Do not let selection color erase type recognition.

[Lucide](https://lucide.dev/license) is a suitable base source for neutral SVGs with license notices retained (ISC and inherited Feather MIT notices where applicable). A handful of game-specific silhouettes can be authored to match. Authentic item art is an optional enhancement only when correct-edition identity, source and reuse status are established; every image has an SVG fallback. Avoid runtime CDN dependence for marker icons.

## Layout and mobile

Desktop has a collapsible left rail around 270–300px and a dominant map. Put filter and location-list views in that rail; details may replace its content with Back. Do not force a permanent right detail rail into the embedded guide width. Expanded wide mode can support details beside the canvas after review.

Mobile/tablet uses the same controls in a drawer or bottom sheet, opened by `Filters (n)` and dismissed by Done, Escape or its close control. Filter changes apply immediately; Done closes the sheet rather than being an additional required save. Restore focus to the trigger. Keep a result count visible and prevent the drawer from trapping ordinary page scrolling when closed. The location list remains usable separately, including when artwork fails.

Aim for approximately 44px row/pin hit areas, with recognizable 28–32px visual markers. This is the product target; [WCAG's target-size minimum guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) specifies 24px with exceptions, including essential spatial pin placement. Dense/coincident pins get a stack/list chooser; never move their factual coordinates. Test 360px screens, landscape, tablet, embedded desktop, expanded mode and Electron zoom.

## Migration and non-negotiable acceptance

Introduce v3 preferences with checked filter IDs, region/layer, wheel/grid and optional disclosure state. Valid explicit empty selections survive. Invalid IDs are dropped; if an old saved set loses every ID, return to Essentials with a clear reset rather than leaving an accidental blank map. Distinguish that migration fallback from an intentional empty v3 record. Keep valid v2/v1 layer and wheel behavior. Migrate old categories to reviewed leaf sets and MW3 group/subfilters to exact activity leaves. Store photo observations and guide completion separately.

Decouple Urzikstan's photo finder from `category === 'red-worm' && subfilter === 'usb-devices'`: checking USBs must not activate a photo workflow automatically. Preserve the separate tool, saved observations, 12 verified photo bindings, four-photo limit and shared photo target hashes.

Acceptance requires: perks + PaP + a quest shown together; all/none/indeterminate correctness; deduplicated counts; explicit outside-filter guide overlay; zero selection staying zero; query/camera/focus preserved on checkbox changes; separate layer counts; points versus candidate areas distinguished; old links and prefs restored; all photo combinations intact; list fallback after artwork/storage failure; keyboard/screen-reader/mobile/Electron review. Start with existing BO7 and MW3 plus one legacy multi-floor pilot before scaling content authoring.
