import { field, tool, numbers, image } from './remaining-common.mjs'
const colours = ['Red', 'Green', 'Blue', 'Yellow']
const flashes = Array.from({ length: 16 }, (_, i) => `flash-${i}`)
const screens = Array.from({ length: 4 }, (_, i) => `screen-${i}`)
const digits = ['Slam hits', 'Jumps', 'Wall purchases', 'Zombie kills']
export const awTools = [
  tool('aw-descent-simon', 'aw-descent', 'Reception Simon Says', 'Arrange the four monitors from left to right as seen at Reception. Record each flash, including repeats; replay the resulting screen positions. Clear flashes between sequences while keeping the monitor arrangement.', [
    ...screens.map((id, i) => field(id, `Monitor ${i + 1} from the left`, colours)),
    ...flashes.map((id, i) => field(id, `Flash ${i + 1}`, colours)),
  ], {
    guidePhase: 'simon', reference: 'https://mmmrkennedy.com/games/AW/descent/descent_guide',
    groups: [{ id: 'layout', title: 'Reception monitors, left to right', fields: screens }, { id: 'sequence', title: 'Flashes in order', fields: flashes }],
    spatial: { fields: screens, columns: 4, labels: ['1 · left', '2', '3', '4 · right'] },
    sequence: { fields: flashes, options: colours, label: 'Record a flash' },
    resetScopes: [{ id: 'flashes', label: 'Clear flashes', fields: flashes }, { id: 'new-game', label: 'New game: clear layout and flashes', fields: [...screens, ...flashes] }],
    images: [image('asset-1841', 'Reception desk: number its four monitors from left to right')],
  }),
  tool('aw-descent-numbers', 'aw-descent', 'Number panel action planner', 'Read target and current rows left to right. The first digit counts zombies hit, not slam activations. Slams, jumps and kills can overlap; reread the current row after combat. Wall-ammunition purchases do not count.', digits.flatMap((label, i) => [
    field(`target-${i}`, `${i + 1}. ${label}: target`, numbers(10)),
    field(`current-${i}`, `${i + 1}. ${label}: current`, numbers(10)),
  ]), {
    kind: 'solver', guidePhase: 'number-panel', reference: 'https://mmmrkennedy.com/games/AW/descent/descent_guide',
    groups: digits.map((label, i) => ({ id: `digit-${i}`, title: `${i + 1}. ${label}`, fields: [`target-${i}`, `current-${i}`] })),
    resetScopes: [{ id: 'current', label: 'Reread current row', fields: digits.map((_, i) => `current-${i}`) }, { id: 'new-game', label: 'New game: clear both rows', fields: digits.flatMap((_, i) => [`target-${i}`, `current-${i}`]) }],
    images: [image('asset-1842', 'Target row above the current action-controlled number row')],
  }),
]
