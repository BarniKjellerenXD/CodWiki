# Blood of the Dead: Building 64 memory helper

Researched 2026-10-02. The Power House trial includes a Simon Says puzzle in **Building 64**, followed by symbol translation in Model Industries and lever pulls back in Power House. This helper records observations; it does not predict the random sequence or a monitor's replacement symbol.

## Options and chosen direction

| Approach | Benefit | Limitation |
| --- | --- | --- |
| Photograph or stitched panorama with hotspots | Recognizable game textures | The available photographs face different directions; stitching would imply a viewpoint that the sources do not provide. Small mobile hotspots would obscure the panels. |
| Schematic room map with real panel references | All six locations visible at once, large tap targets, stable spatial memory | Needs a stated orientation and a clear not-to-scale label. |
| Player-defined names or a text sequence | Flexible and easy to preserve | Requires setup and does not meet the request for a clickable room map. |

Choose a schematic with six tappable locations and linked photographs. Preserve existing player-defined notes separately. Use helper letters or labels that cannot be mistaken for the numbered symbol reference sheet. Do not add a north arrow or measured distances. The source diagram identifies the PaP exit at left, Docks at lower right, generator at lower left, ICR-7 island near the middle-left and punchcard structure at the top.

## Gameplay evidence

- [MMMrKennedy's illustrated walkthrough](https://mmmrkennedy.com/games/BO4/blood_of_the_dead/blood_of_the_dead_guide) documents six panels and five rounds. Each round has a fresh random sequence of one through five flashes; a panel can repeat within a sequence. Its photographs identify the six locations and the starting machine. After the fifth round, record the three steady panels and ignore the blinking decoy.
- [Reddit's complete map wiki](https://www.reddit.com/r/CODZombies/wiki/blood-of-the-dead/) corroborates the five-round puzzle, three resulting symbols, punchcard, and monitor translation. Enter the symbols actually revealed by the monitors; the numbered generator pictures and lettered lever pictures are reference labels, not a fixed conversion table.
- [A Reddit walkthrough with uncut examples](https://www.reddit.com/r/CODZombies/comments/crupku/an_easy_approach_to_the_five_blood_of_the_dead/) recommends short names for the six locations and emphasizes the brief final three-light display. Its video link is [the Simon Says recording](https://streamable.com/6l2yd); the video was not available to the web reader during this research, so it is not claimed as visually verified evidence.
- [A player-confirmed failure/retry discussion](https://www.reddit.com/r/CODZombies/comments/rlorsc/) says to finish the current zombie round and interact with the Kronorium again. [TrueAchievements' walkthrough](https://www.trueachievements.com/game/call-of-duty-black-ops-4/walkthrough/13) also describes new numbers on the following round after a failed trial. The helper should offer a fresh attempt, not silently retain the failed game's sequence or imply that its reset button restarts the game.

The sequence and the three steady panels are different observations. Keep repeats in the sequence; allow only three distinct steady-panel selections. Do not automatically derive the final three from the fifth sequence. A manual replay cursor is useful while entering the recorded sequence in the game, but it must not imply an in-game success check.

## Layout evidence and photo matching

[Epicpine's creator-authored walkthrough](https://ameblo.jp/epicpine99/entry-12416541869.html) contains a [top-down room diagram](https://stat.ameba.jp/user_images/20181108/03/epicpine99/39/2b/j/o1920108014299162716.jpg). The text explains using its six colored locations as a memory aid. The diagram was downloaded for research and inspected alongside all six MMMrKennedy photographs. The diagram itself is not copied into production; the application uses an original, simplified schematic grounded in these landmarks.

The following joins between the diagram and photographs are **visual inferences from the two sources**, not measured game coordinates. Preserve that limitation when describing the map. The two right-wall photographs show their relative order: the wider bank is left of the smaller bank when facing that wall.

| Position on source diagram | Matching photograph | Recognizable landmark |
| --- | --- | --- |
| Orange, left wall above generator | `right_of_generator.webp` | Panel beside the smoking generator |
| Green, upper face of middle-left island | `middle_of_room.webp` | Panel on the ICR-7 island |
| Purple, right face of top structure | `near_china_alley.webp` | Panel by the China Alley doorway and punchcard shelf |
| Yellow, lower face of middle-right island | `left_of_power_box.webp` | Panel beside the power switch structure |
| Red, upper of two right-wall points | `right_of_power_box_2.webp` | Wider wall bank |
| Blue, lower of two right-wall points | `right_of_power_box_1.webp` | Smaller wall bank |

Do not label the PaP exit as the China Alley exit solely from this diagram. The China Alley panel's name comes from the photographed walkthrough. Do not assign generator-symbol numbers automatically from these dim photographs: the schematic's markers describe places, while the existing symbol picker records what the player reads in game.

## Image provenance

The following files under `public/images/blood-of-the-dead/simon/` are unmodified local copies of MMMrKennedy's 2560 × 1440 screenshots. Each was visually inspected. Credit the guide near the reference photographs. The creator's room diagram is evidence for layout only and is not included among production assets.

| Local file | Original image |
| --- | --- |
| `left_of_power_box.webp` | https://mmmrkennedy.com/games/BO4/blood_of_the_dead/pictures/main_ee/anger_and_bargaining/power_house_challenge/left_of_power_box.webp |
| `right_of_power_box_1.webp` | https://mmmrkennedy.com/games/BO4/blood_of_the_dead/pictures/main_ee/anger_and_bargaining/power_house_challenge/right_of_power_box_1.webp |
| `right_of_power_box_2.webp` | https://mmmrkennedy.com/games/BO4/blood_of_the_dead/pictures/main_ee/anger_and_bargaining/power_house_challenge/right_of_power_box_2.webp |
| `near_china_alley.webp` | https://mmmrkennedy.com/games/BO4/blood_of_the_dead/pictures/main_ee/anger_and_bargaining/power_house_challenge/near_china_alley.webp |
| `middle_of_room.webp` | https://mmmrkennedy.com/games/BO4/blood_of_the_dead/pictures/main_ee/anger_and_bargaining/power_house_challenge/middle_of_room.webp |
| `right_of_generator.webp` | https://mmmrkennedy.com/games/BO4/blood_of_the_dead/pictures/main_ee/anger_and_bargaining/power_house_challenge/right_of_generator.webp |
| `stand_here.webp` | https://mmmrkennedy.com/games/BO4/blood_of_the_dead/pictures/main_ee/anger_and_bargaining/power_house_challenge/stand_here.webp |
| `sparking_generator.webp` | https://mmmrkennedy.com/games/BO4/blood_of_the_dead/pictures/main_ee/anger_and_bargaining/power_house_challenge/sparking_generator.webp |

## Verification boundary

Research confirmed that all eight files decode as images and that the source screenshots show the stated landmarks. No in-game playthrough, precise floor-plan survey, timing test or failure-recovery test has been performed. The diagram-to-photo mapping remains a documented visual inference. UI checks should cover repeated flashes, five-round capacity, independent steady-panel selection, undo, a new attempt, reload persistence, reference-image access, and preservation of old custom notes. Those checks are implementation requirements here, not claims that they have already passed.
