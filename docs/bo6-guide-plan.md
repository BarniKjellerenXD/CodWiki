# BO6 complete map guides

## Scope and research

Add Liberty Falls, Terminus, Citadelle des Morts, The Tomb, Shattered Veil and Reckoning to the existing game → map → guide/tool catalogue. Cover permanent Standard-mode content: setup, main quest, wonder weapons, equipment, bosses and documented side Easter eggs. Distinguish optional rewards from required progression and random observations from fixed solutions. Do not present event-only variants as the base map.

Research uses r/CODZombies community walkthroughs alongside illustrated independent guides and official Call of Duty material. Map-specific research notes record exact sources, corrections and asset provenance. Screenshots must identify real objects and locations; reference-match codes are examples, never the user's answer. Write original explanations, with prerequisites, actions, success cues and recovery where known. Gameplay verification is distinct from source review and software tests.

## Options considered

| Approach | Strength | Limitation | Decision |
| --- | --- | --- | --- |
| Long article with linked videos | Fast to publish; broad coverage | Hard to consult during a round; sends players elsewhere for puzzles | Retain sources as references, not the core experience |
| One universal notebook per map | Easy to build; saves observations | Requires the player to decode shapes and do calculations themselves | Use only for genuinely observational tasks |
| Illustrated guides with specific puzzle helpers | Turns observations into the next in-game action; matches existing BO4/BO7 workflow | Requires verified symbols, validation and tests | Selected |
| New interactive map engine for BO6 | Useful geographical overview | Accurate positional datasets are a separate project; competes with guide depth | Keep existing guide navigation and labeled location images |

## Implementation

- Author three BO6 data modules and aggregate them through the existing content generator. Generate routes, Quick Parts, detailed guides, search entries and desktop navigation together.
- Keep stable explicit phase and step IDs, existing progress storage and the Quick Parts / Full Details views.
- Place relevant tools within the corresponding phase. Share the same saved state between inline and standalone versions.
- Use local gameplay screenshots with descriptive captions, enlarge controls and source manifests.
- Choose visual selectors, validated calculators and sequence trackers from researched mechanics. Blank clues stay unknown; duplicate or malformed observations must not produce a confident answer.
- Verify calculation rules and state handling, complete catalogue associations and local asset references, then build the production application and inspect desktop/mobile guide and tool views.

## Direction contract

**Thesis:** help a player turn the clue on their screen into the correct next action without losing their place in the guide.

**Own-world:** extend the incumbent CodWiki reading and puzzle surfaces, gold/orange accents, existing theme tokens, restrained borders and readable typography. Preserve the established identity.

**Story:** choose a map, prepare equipment, follow the main quest, use a helper at the relevant puzzle, then explore optional rewards.

**First viewport:** existing map header and reading controls, a real map image, useful prerequisite context and the first saved quest phase. A standalone helper starts with its purpose and selectable observations; results sit beside or immediately below the inputs.

**Form:** code-led extension of the incumbent guide/checklist and workbench patterns. No new visual world or generated concept imagery. On narrow screens, wrap clue choices and stack inputs above results; controls retain text labels and keyboard focus.

**Finish:** source notes and asset provenance accompany the implementation; tests, a production build and a bounded visual review establish what has actually been verified. Full in-game validation remains explicitly separate.
