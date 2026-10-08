import { field, tool, image } from './remaining-common.mjs'
const positions = ['Top', 'Bottom', 'Left', 'Right']
const permutations = items => items.length ? items.flatMap((item, i) => permutations(items.filter((_, j) => i !== j)).map(rest => [item, ...rest])) : [[]]
const rejectionOptions = [...new Set(permutations(positions).flatMap(order => order.map((_, i) => order.slice(0, i + 1).join(' → '))))]
const accepted = Array.from({ length: 4 }, (_, i) => `accepted-${i}`)
const rejected = Array.from({ length: 6 }, (_, i) => `rejected-${i}`)
const paperGlyphs = ['木 · wood', '火 · fire', '土 · earth', '美 · beauty', '雨 · rain', '日 · sun', '水 · water', '夜 · night', '風 · wind', '空 · sky', '月 · moon', '金 · gold', '花 · flower', '鳥 · bird', '心 · heart']
const paperLocations = ['Excavation Room', 'Comms Room', 'Dig Site']
const rings = ['Inner', 'Middle', 'Outer']
const stageFields = count => Array.from({ length: count }, (_, i) => [`symbol-${count}-${i}`, `landmark-${count}-${i}`]).flat().concat(`locked-${count}`)
export const vanguardTools = [
  tool('vanguard-terra-pages', 'vanguard-terra-maledicta', 'Lost Tome page order', 'Confirm positions only when a page stays attached. For a rejection, choose the entire accepted prefix followed by the failed next position. A wrong placement resets the door; replay what you have learned. Keep this notebook until a new game.', [
    ...accepted.map((id, i) => field(id, `Accepted position ${i + 1}`, positions)),
    ...rejected.map((id, i) => field(id, `Remembered rejection ${i + 1}`, rejectionOptions)),
  ], {
    kind: 'solver', guidePhase: 'lost-pages', reference: 'https://mmmrkennedy.com/games/VG/terra_maledicta/terra_maledicta_guide',
    groups: [{ id: 'accepted', title: 'Learned accepted prefix', fields: accepted }, { id: 'rejections', title: 'Failed next choices after their accepted prefix', fields: rejected, help: 'Top → Left → Right means Right failed after Top and Left stayed attached. It does not rule out Right elsewhere.' }],
    resetScopes: [{ id: 'rejections', label: 'Correct remembered rejections', fields: rejected }, { id: 'new-game', label: 'New game: clear all learned choices', fields: [...accepted, ...rejected] }],
  }),
  tool('vanguard-shi-no-numa-cipher', 'vanguard-shi-no-numa', 'Monolith paper translator', 'Record each paper and assign its target ring from your wheel observation. Each plate cell pairs a paper symbol on the left with the actual wheel marking on the right. Names below are memory labels; do not enter the Chinese paper character on the wheel.', paperLocations.flatMap((label, i) => [field(`paper-${i}`, `${label}: paper glyph`, paperGlyphs), field(`ring-${i}`, `${label}: target ring`, rings)]), {
    kind: 'reference', guidePhase: 'monolith', reference: 'https://mmmrkennedy.com/games/VG/shi_no_numa_reborn/shi_no_numa_reborn_guide',
    groups: paperLocations.map((title, i) => ({ id: `paper-${i}`, title, fields: [`paper-${i}`, `ring-${i}`] })),
    images: [image('asset-0063', 'Translation plate: three columns, five rows; paper glyph left, wheel glyph right')],
    resetScopes: [{ id: 'new-game', label: 'New game: clear papers and ring assignments', fields: paperLocations.flatMap((_, i) => [`paper-${i}`, `ring-${i}`]) }],
  }),
  tool('vanguard-archon-runes', 'vanguard-the-archon', 'Mindfulness rune sequence', 'Choose the 3-, 4- or 5-symbol preparation round. Give each observed symbol a memorable name and add its ground landmark. Lock the record before traversing. A website label does not identify an unobserved glyph or equip an artifact.', [
    field('stage', 'Preparation sequence length', ['3', '4', '5']),
    ...[3, 4, 5].flatMap(count => [...Array.from({ length: count }, (_, i) => [field(`symbol-${count}-${i}`, `${count}-symbol round: symbol ${i + 1}`, null, { maxLength: 40, readOnlyWhen: { field: `locked-${count}`, value: true } }), field(`landmark-${count}-${i}`, `${count}-symbol round: ground landmark ${i + 1}`, null, { maxLength: 80, readOnlyWhen: { field: `locked-${count}`, value: true } }), field(`previous-symbol-${count}-${i}`, `${count}-symbol previous attempt: symbol ${i + 1}`, null, { maxLength: 40, readOnly: true }), field(`previous-landmark-${count}-${i}`, `${count}-symbol previous attempt: landmark ${i + 1}`, null, { maxLength: 80, readOnly: true })]).flat(), field(`locked-${count}`, `${count}-symbol observation locked`, null, { type: 'check' })]),
  ], {
    guidePhase: 'mindfulness', reference: 'https://mmmrkennedy.com/games/VG/the_archon/the_archon_guide',
    groups: [{ id: 'stage', title: 'Current preparation round', fields: ['stage'] }, ...[3, 4, 5].flatMap(count => [{ id: `stage-${count}`, title: `${count}-symbol record`, fields: stageFields(count), showWhen: { field: 'stage', value: String(count) } }, { id: `previous-${count}`, title: `${count}-symbol previous locked attempt`, fields: Array.from({ length: count }, (_, i) => [`previous-symbol-${count}-${i}`, `previous-landmark-${count}-${i}`]).flat(), showWhen: { field: 'stage', value: String(count) } }])],
    resetScopes: [3, 4, 5].flatMap(count => [{ id: `attempt-${count}`, label: `${count}-symbol new attempt: archive locked record, keep landmarks`, fields: Array.from({ length: count }, (_, i) => `symbol-${count}-${i}`).concat(`locked-${count}`), preserveWhen: { field: `locked-${count}`, value: true }, preserveSnapshot: Object.fromEntries(Array.from({ length: count }, (_, i) => [[`symbol-${count}-${i}`, `previous-symbol-${count}-${i}`], [`landmark-${count}-${i}`, `previous-landmark-${count}-${i}`]]).flat()) }, { id: `stage-${count}`, label: `${count}-symbol clear stage: symbols and landmarks`, fields: stageFields(count) }]),
    images: [image('asset-0113', 'Mindfulness wall symbols: record the shapes shown in your own attempt')],
  }),
]
const archon = vanguardTools.find(definition => definition.id === 'vanguard-archon-runes')
for (const group of archon.groups) if (group.id.startsWith('previous-')) group.collapsible = true
for (const scope of archon.resetScopes) scope.showWhen = { field: 'stage', value: scope.id.slice(-1) }
