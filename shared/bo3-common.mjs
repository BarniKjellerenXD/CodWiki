export const reddit = map => `https://www.reddit.com/r/CODZombies/wiki/${map}/`
export const illustrated = map => `https://www.codzombiesguides.com/main-quests/black-ops-3/${map}/`
export const kennedy = map => `https://mmmrkennedy.com/games/BO3/${map.replaceAll('-', '_')}/${map.replaceAll('-', '_')}_guide`
export const image = (map, file, alt) => ({ src: `/images/bo3-${map}/${file}.webp`, alt })
export const step = (id, text, quick, extra = {}) => ({ id, text, quick, ...extra })
export const phase = (id, title, steps, extra = {}) => ({ id, title, steps, tools: [], ...extra })
export const guide = (map, name, intro, cover, phases, sidePhases, sources) => ({
  id: `bo3-${map}`, gameId: 'bo3', name, intro,
  image: `/images/bo3-${map}/${cover}.webp`, phases, sidePhases, sources,
  reviewed: '2026-10-03',
  reviewNote: 'Original instructions cross-checked against Reddit community guides and the illustrated references below on 3 October 2026. Gameplay images: mmmrkennedy, COD Zombies Guides and their credited community creators; game: Activision / Treyarch. Symbols and sequences marked as observations must come from your match. Source and software checks do not replace an in-game playthrough.'
})
