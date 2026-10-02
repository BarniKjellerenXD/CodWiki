# BO4 / BO6 tool revision verification

Reviewed 2026-10-02. Tools now concentrate on clue calculation, visual matching and remembering observations that change during a match. Quick Parts remains the quest-completion checklist.

## Decision and scope

The [implementation plan](tool-value-redesign.md) compared hiding trackers, rebuilding every tracker and retiring duplicate progress controls while improving useful helpers. The third option was selected: a more elaborate checklist would still duplicate the guide.

Five BO4 and six BO6 tools were retired, leaving **15 BO4 tools and eight BO6 tools**. Their walkthrough instructions remain in the guides. Liberty Falls now includes all nine Aetherella pickup photographs as individual guide steps, retaining the original route step ID. The [BO4 audit](bo4-tool-value-revision.md) and [BO6 audit](bo6-tool-value-revision.md) record each decision and the completion controls removed from retained tools.

The shared retirement registry sends old tool URLs to their corresponding detailed guide sections. Retired tools are absent from catalogue, search, desktop navigation and inline helper lists. Compatibility pages do not create tool state or erase old storage keys. Retained tools keep their IDs, state versions and legacy field declarations; removed completion flags no longer control calculated answers. Existing guide phase and step IDs remain stable.

## Blood of the Dead room recorder

The Power House helper now presents six clickable panel positions in a fixed overhead schematic. Landmarks and six actual panel photographs help the player orient themselves. Five rounds accept one through five flashes, including repeated panels; numbered observations can be selected to highlight the corresponding position. Remove-last, clear-attempt, round changes and the existing undo controls support corrections.

The final three steady lights are recorded separately from the flashing sequence. Their positions remain visible when switching to the symbol-and-lever stage, where players still enter the symbols they actually observe. Position letters A–F are never treated as symbol translations. Earlier custom panel names and notes remain separate from the spatial recorder.

The [room research](blood-simon-research.md) compares photographic hotspots, a schematic and player-defined labels, and records source links and image provenance. The selected schematic preserves the same orientation on desktop and mobile. It is explicitly not to scale: the joins between the published diagram and panel photographs are documented visual inferences, not surveyed coordinates. Two additional photographs in the guide show the starting generator and viewing position.

## Verification evidence

- The full automated suite passed **130 tests**, including repeated flashes, round capacity, sparse saved-state handling, independent steady-light selection, legacy field preservation, catalogue retirement and guide destinations. Local run log: `.impeccable/review/tool-value-tests-final.txt`.
- The final production build completed successfully with exit code 0. Local run log: `.impeccable/review/tool-value-build-final.txt`.
- All 22 tested retired-route variants—extensionless and `.html` for each of the 11 tools—returned HTTP 301 to the expected guide anchor.
- The initial browser review covered Blood's recorder and eight changed retained helpers at desktop and mobile widths, with 19 screenshots reviewed independently. Checks found no horizontal overflow or broken loaded reference images in those retained-helper views.
- The review's material findings were corrected together: stale sequence suffixes, selected-panel hover contrast, the repeated-flash badge near the left edge, and the Punchcard landmark label. The symbol stage also gained a summary of the separately remembered steady panels.
- Final browser confirmation at 1440 × 1000 and 390 × 844 verified those fixes, including five repeated F flashes and the hovered steady F panel. The mobile map has six 44-pixel targets and no horizontal overflow. The existing dark/gold palette, guide layout and shared tool controls are preserved.
- Interaction checks passed for remove and undo, round change and undo, reset cancellation, reset and undo, reload persistence, the same A–C–A–E–F sequence in the inline guide, and the separate B–D–F steady-light summary on the symbol stage. The real C-panel photograph loaded and enlarged correctly. The Aetherella `.html` URL also reached the expected guide anchor in the browser. No console warnings or errors were reported.

Final screenshots are stored locally under `.impeccable/review/`: `simon-desktop-final.png`, `simon-mobile-final.png`, `simon-repeat-mobile-final.png`, `simon-steady-mobile-final.png` and `simon-symbols-mobile-final.png`.

## Verification limits

An independent final review passed after examining the implementation, the retained-tool screenshots, five final Simon screenshots and the final test/build logs. No material findings remain from that review.

Source review, automated checks and browser inspection do not establish an in-game playthrough. No live timing, failure-recovery or measured floor-plan test was performed. The recorder stores the player's observations; it does not detect game success, restart a trial or predict a random sequence. Source and image-credit details remain in the linked research documents.
