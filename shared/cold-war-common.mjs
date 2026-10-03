export const source = map => `https://mmmrkennedy.com/games/BO_CW/${map.replaceAll('-', '_')}/${map.replaceAll('-', '_')}${map === 'outbreak' ? '_CW' : ''}_guide`
export const illustrated = map => `https://www.codzombiesguides.com/main-quests/black-ops-cold-war/${map}/`
export const image = (map, file, alt) => ({ src: `/images/cw-${map}/${file}.webp`, alt })
export const step = (id, text, quick, extra = {}) => ({ id, text, quick, ...extra })
export const phase = (id, title, steps, extra = {}) => ({ id, title, steps, tools: [], ...extra })
export const reviewNote = 'Walkthrough adapted from the community and illustrated references below, with AI-assisted source checks on 3 October 2026. Gameplay photographs: mmmrkennedy; game imagery: Activision / Treyarch. Match-specific numbers and sequences must come from your game. Source and software checks do not replace an in-game playthrough; a full in-game walkthrough has not been performed.'
export const guide = (id, name, intro, cover, phases, sidePhases, sources, extra = {}) => ({ id: `cw-${id}`, gameId: 'cw', name, intro, image: `/images/cw-${id}/${cover}.webp`, phases, sidePhases, sources, reviewed: '2026-10-03', reviewNote, ...extra })
