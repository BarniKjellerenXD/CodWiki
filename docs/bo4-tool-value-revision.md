# BO4 tool value revision

Reviewed 2026-10-02. This revision follows the request to keep tools that solve a puzzle, match a clue or remember information that changes during a match. Quick Parts remains the place for quest completion.

## Choice

Three approaches were considered:

1. Keep the existing catalogue and rename trackers. This would leave the duplicated work in place.
2. Remove every recorder. This would also remove useful memory for fleeting displays and randomized codes.
3. Retire duplicate quest trackers and narrow mixed tools to their useful observation or calculation. This is the chosen approach.

Five of the twenty BO4 tools are retired. Their walkthroughs, images, phase IDs and saved guide step IDs remain. Existing tool links redirect to the relevant guide section through the shared retirement registry.

| Retired tool | Where the instructions remain |
| --- | --- |
| Kronorium & five-trial tracker | Blood of the Dead, book and trial instructions |
| Free Blundergat skull tracker | Blood of the Dead, Blundergat |
| Danu preparation & full-round log | IX, Danu |
| Theater assignments & attack cues | Ancient Evil, theater |
| Tag quest stage & charge tracker | Tag der Toten, machine charges and rituals |

The Danu log could only estimate elapsed rounds. It could not establish actual readiness, and its caveats and item checks already appear in the guide. The other retired tools primarily repeated fixed instructions or completion checkboxes.

## Narrowed tools

| Tool | Retained value | Removed interface |
| --- | --- | --- |
| Element → outlet route | Randomized element-to-location observations, photos and fixed trial ordering | Circle and artifact completion checks |
| Planet order & orb route | Eight fleeting model flashes, fixed Sun last, sequence selection and one photographed destination at a time | Fixed symbol-activation checklist and collected-orb checkboxes |
| Oracle hand location finder | Searchable spoken phrase to exact landmark/photo | Hand-stage and upgrade-pickup checklists |
| Project Skadi photo codes | Four match-specific codes beside identifying photographs, displayed in entry order | Accepted-code checks and Groom Lake round counter |
| Rushmore code reference & observations | Personnel codes, painting codes and bonus-code lookup | Eight duplicate generic purpose/code fields |

The planet route's Previous/Next controls select the body being displayed. They do not claim that an orb has been collected. The selected destination is saved alongside the sequence, so inline and standalone views agree.

The other retained tools supply Morse calculation, clock conversion, authentic glyph identification, scratch arithmetic, randomized shape-to-location matching, tribute arithmetic or spoken-clue lookup. Blood's Power House helper is additionally revised with a spatial Simon sequence interface in the accompanying work.

## State compatibility

Retained tool IDs and versions are unchanged. Existing observation fields remain declared, including fields whose old completion interface was removed. The outlet and Skadi result functions ignore those old flags. Old progress cannot block a valid route or make the interface announce completion.

Rushmore's legacy notebook fields use `hidden: true`; the shared form renderer omits them while the saved-state normalizer continues to retain their values. The planet route adds `route-position` with allowed values `0` through `8`; old saved states start at the first destination.

Retiring a tool does not clear its local-storage record or change guide progress. The catalogue and generated route changes are handled by the shared retirement mechanism.

## Verification

Targeted tests cover outlet ordering, duplicate-location rejection, independence from legacy progress flags, Skadi leading zeroes and fixed ordering, saved field declarations, and the existing clock, glyph, tribute and clue rules. Vue compiler checks passed for Voyage, ChaosHands, NightClassified and Expansion during implementation. The catalogue must be regenerated before the new planet cursor's normalization test can pass.

The revision changes the presentation and utility boundary of existing researched mechanics. It introduces no new claimed puzzle solution. Full in-game playthrough verification remains outstanding.
