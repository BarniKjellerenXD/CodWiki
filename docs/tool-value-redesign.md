# BO4 / BO6 tool value revision

## Decision before implementation

The player is consulting the site mid-round. Quick Parts already records quest completion; a separate tool must transform a clue or remove meaningful memory work to earn its place. Preserve the existing dark/gold interface, guide content, saved quest IDs and reading controls.

| Option | Consequence | Decision |
| --- | --- | --- |
| Hide trackers behind another category | Less visible clutter, but duplicate work remains | Reject |
| Rebuild every tracker as a new interface | Adds scope without proving practical value | Reject |
| Retire redundant tools, simplify valuable tools, add a verified spatial Simon recorder | Makes the catalogue a set of actual puzzle aids | Choose |

Retire six BO6 tools: Aetherella checklist, Liberty vault notebook, Nathan code notebook, Citadelle knight/orb tracker, Tomb statue trials and Tomb vases. Keep eight tools that decode, calculate or visually organize randomized clues. Move the nine Aetherella sightline photos into the guide before retiring that helper.

Retire five BO4 tools: Blood trial and skull trackers, Ancient Evil theater tracker, Tag challenges and IX Danu round/progress tracker. Keep the visual solvers, clue lookups and memory aids. Remove auxiliary completion controls from retained tools where they duplicate the quest guide; keep selections that represent actual puzzle observations.

Old tool links should open the relevant guide section. Retired tools must disappear from catalogue, search, desktop navigation, Quick Parts and inline helper lists without deleting guide content or saved progress. Existing device-local storage is left alone.

## Blood of the Dead

The job is to record the flashing Building 64 panels by their position, then repeat the recorded sequence in game. Compare a photographic room reference, a landmark-oriented schematic and player-assigned labels. Use source evidence for panel count and placement; never infer real geometry from the current six generic buttons. Favor a spatial layout with explicit orientation, visible numbered sequence, repeated-panel support, undo and clear-current-attempt controls. Keep the existing three steady-symbol / monitor-replacement helper as the next stage.

The room representation must be verified before implementation. A schematic must identify its orientation and state that it is not to scale. Unknown or player-assigned labels must not be silently reinterpreted as physical locations. Desktop and narrow-screen layouts must retain the same orientation.

## Verification

Test catalogue/guide/redirect consistency, sequence recording and repeats, bounds and stale-state handling, undo/reset and old saved observations. Inspect the new map and retained helpers at desktop and mobile widths in one batched pass, fix material findings together and confirm once. Run the full test suite and production build, then sync verified files into the primary checkout and publish to the already authorized GitHub destination.

Research evidence and the final selected room representation are added below as they are established. No in-game playthrough is implied by source or browser verification.

## Selected room representation

Use a fixed overhead schematic grounded in epicpine’s published room diagram, with per-panel photographs from MMMrKennedy. Preserve PaP exit on the left, Docks exit at the lower right, generator at the lower left, ICR-7 island and power-switch island. The photo-to-diagram joins are documented visual inferences; the UI states that the schematic is not to scale and offers the actual photos for orientation. A–F name positions only, never symbol translations.

The current round sets a one-to-five-flash capacity. Repeated positions remain separate ordered observations. Clearing or changing the round resets only the spatial sequence and can be undone. Final steady-light selection is independent and limited to three positions. Old user-named panel notes remain separate, avoiding an unsafe reinterpretation as fixed map positions. The same saved state is shared inline and full-page. See [room research](blood-simon-research.md), [BO4 tool audit](bo4-tool-value-revision.md) and [BO6 tool audit](bo6-tool-value-revision.md).
