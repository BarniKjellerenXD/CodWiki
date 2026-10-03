// Catalogue entries only. Do not create quest progress or tools until authored.
// Scope and sources: docs/game-library-plan.md.
const entry = (gameId, slug, name, mode, edition, description, extra = {}) => ({
  id: `${gameId}-${slug}`, gameId, name, route: `/guides/${gameId}-${slug}`,
  status: 'planned', interactiveMap: false, image: '', group: '',
  mode, edition, description, ...extra,
})

export const plannedMaps = [
  entry('iw', 'zombies-in-spaceland', 'Zombies in Spaceland', 'Round-based Zombies', 'Launch map', 'The opening chapter of Infinite Warfare Zombies, set in a 1980s theme park.'),
  entry('iw', 'rave-in-the-redwoods', 'Rave in the Redwoods', 'Round-based Zombies', 'Sabotage', 'The second film in Willard Wyler’s Zombies story.'),
  entry('iw', 'shaolin-shuffle', 'Shaolin Shuffle', 'Round-based Zombies', 'Continuum', 'Infinite Warfare’s kung-fu Zombies chapter.'),
  entry('iw', 'attack-of-the-radioactive-thing', 'Attack of the Radioactive Thing', 'Round-based Zombies', 'Absolution', 'The monster-movie chapter of Infinite Warfare Zombies.'),
  entry('iw', 'the-beast-from-beyond', 'The Beast from Beyond', 'Round-based Zombies', 'Retribution', 'The final Infinite Warfare Zombies map. Future coverage will include the map quest and the Director’s Cut finale.', { aliases: ['Mephistopheles', 'Directors Cut', 'super easter egg'] }),

  entry('ww2', 'the-final-reich', 'The Final Reich', 'Round-based Zombies', 'Launch map', 'WWII’s opening story map. The guided and hardcore quest routes will share this entry.'),
  entry('ww2', 'groesten-haus', 'Gröesten Haus', 'Survival', 'Bonus map', 'The compact survival map from WWII’s Zombies prologue.', { aliases: ['Groesten Haus', 'Grosten Haus', 'Prologue'] }),
  entry('ww2', 'the-darkest-shore', 'The Darkest Shore', 'Round-based Zombies', 'The Resistance', 'The first DLC chapter of WWII Zombies.'),
  entry('ww2', 'the-shadowed-throne', 'The Shadowed Throne', 'Round-based Zombies', 'The War Machine', 'The Berlin chapter of WWII Zombies.'),
  entry('ww2', 'the-frozen-dawn', 'The Frozen Dawn', 'Round-based Zombies', 'Shadow War', 'The final story map in WWII Zombies.'),
  entry('ww2', 'into-the-storm', 'Into the Storm', 'Objective-based chapter', 'The Tortured Path · Chapter 1', 'The first chapter of The Tortured Path. Bodega Cervantes is the separate survival version of this setting.', { group: 'tortured-path', aliases: ['Bodega Cervantes'] }),
  entry('ww2', 'across-the-depths', 'Across the Depths', 'Objective-based chapter', 'The Tortured Path · Chapter 2', 'The second chapter of The Tortured Path. U.S.S. Mount Olympus is the separate survival version of this setting.', { group: 'tortured-path', aliases: ['USS Mount Olympus'] }),
  entry('ww2', 'beneath-the-ice', 'Beneath the Ice', 'Objective-based chapter', 'The Tortured Path · Chapter 3', 'The third chapter of The Tortured Path. Altar of Blood is the separate survival version of this setting.', { group: 'tortured-path', aliases: ['Altar of Blood'] }),
  entry('ww2', 'bodega-cervantes', 'Bodega Cervantes', 'Survival', 'The Tortured Path', 'Round-based survival in the setting of Into the Storm; the chapter’s timed objectives use a separate entry.', { group: 'survival', aliases: ['Into the Storm'] }),
  entry('ww2', 'uss-mount-olympus', 'U.S.S. Mount Olympus', 'Survival', 'The Tortured Path', 'Round-based survival in the setting of Across the Depths.', { group: 'survival', aliases: ['USS Mount Olympus', 'Across the Depths'] }),
  entry('ww2', 'altar-of-blood', 'Altar of Blood', 'Survival', 'The Tortured Path', 'Round-based survival in the setting of Beneath the Ice.', { group: 'survival', aliases: ['Beneath the Ice'] }),

  entry('aw', 'outbreak', 'Outbreak', 'Exo Zombies', 'Havoc', 'Advanced Warfare’s first Exo Zombies map. This is a different experience from Cold War’s Outbreak.'),
  entry('aw', 'infection', 'Infection', 'Exo Zombies', 'Ascendance', 'The Burger Town chapter of Exo Zombies.', { aliases: ['Burger Town'] }),
  entry('aw', 'carrier', 'Carrier', 'Exo Zombies', 'Supremacy', 'The third chapter of Exo Zombies, aboard an Atlas carrier.'),
  entry('aw', 'descent', 'Descent', 'Exo Zombies', 'Reckoning', 'The final Exo Zombies chapter, set at the underwater Trident Retreat.'),

  entry('vanguard', 'der-anfang', 'Der Anfang', 'Objective-based Zombies', 'Launch map', 'Vanguard’s opening Zombies experience, with a Stalingrad hub and portal objectives.'),
  entry('vanguard', 'terra-maledicta', 'Terra Maledicta', 'Objective-based Zombies', 'Season 2', 'Vanguard’s second objective-based Zombies experience.'),
  entry('vanguard', 'shi-no-numa', 'Shi No Numa', 'Round-based Zombies', 'Season 4', 'The Vanguard reimagining, with its own quest and mechanics. World at War, Black Ops and Chronicles have separate guides.'),
  entry('vanguard', 'the-archon', 'The Archon', 'Round-based Zombies', 'Season 5', 'The final Vanguard Zombies map and confrontation with Kortifex.'),

  entry('mw3', 'urzikstan', 'Urzikstan', 'Open-world Zombies', 'Operation Deadbolt', 'The main Modern Warfare Zombies deployment zone. Future coverage will cover setup, contracts and story missions.'),
  entry('mw3', 'dark-aether-season-1', 'Dark Aether · Season 1', 'Dark Aether Rift', 'Season 1', 'The first Dark Aether destination, including the Bad Signal story mission and its repeatable rift.', { group: 'rifts', aliases: ['Bad Signal', 'Al Bagra Fortress'] }),
  entry('mw3', 'dark-aether-season-2', 'Dark Aether · Season 2', 'Dark Aether Rift', 'Season 2 Reloaded', 'The second Dark Aether destination, associated with the Countermeasures story mission.', { group: 'rifts', aliases: ['Countermeasures', 'Said City', 'Sa’id City'] }),
  entry('mw3', 'dark-aether-season-3', 'Dark Aether · Season 3', 'Dark Aether Rift', 'Season 3 Reloaded', 'The third Dark Aether destination, associated with the Union story mission.', { group: 'rifts', aliases: ['Union', 'Zarqwa Hydroelectric'] }),
  entry('mw3', 'unstable-rift', 'Unstable Rift', 'Wave-based challenge', 'Season 4 Reloaded', 'The separate wave-based rift challenge introduced in Season 4 Reloaded.', { group: 'rifts' }),
  entry('mw3', 'dark-aether-season-5', 'Dark Aether · Season 5', 'Dark Aether Rift', 'Season 5 Reloaded', 'The final Dark Aether destination, associated with the Ascension story mission.', { group: 'rifts', aliases: ['Ascension', 'Entity', 'Highrise'] }),
]
