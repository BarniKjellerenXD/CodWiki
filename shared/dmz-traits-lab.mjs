// Trait tree concepts for /dmz/lab/traits: what each draft is, how it scored
// and the mix that shipped on /dmz/operators. The drafts all read
// shared/dmz-traits.mjs, so they differ in layout only. Delete this file with
// the traits-* lab pages once the lab goes. The plan is in
// docs/mw4-dmz-traits-plan.md.

export const traitConcepts = [
  {
    id: 't1', letter: 'T1', path: '/dmz/lab/traits-replica', name: 'In-game replica',
    pitch: 'The TRAITS screen as in game: three columns climbed from the bottom, hexagons, circles and squares, Majors in pairs on rows 3, 6 and 9, and “?” for the random Minors. Tap a node to read it.',
    bestFor: 'Seeing at a glance how the trees work.',
    pros: ['Looks and reads like the game screen', 'Shows the rules (rows, pairs, random Minors) without words'],
    cons: ['Read-only: you cannot try a build', 'Phones fit one tree at a time'],
    phone: 'One tree per tab, about 2,300 px',
  },
  {
    id: 't2', letter: 'T2', path: '/dmz/lab/traits-planner', name: 'Build planner',
    pitch: 'The same tree, but tapping nodes plans a build: 18 points, 9 per tree, one pick per row, with the in-game counters on top. Saved on this device, and a link shares it.',
    bestFor: 'Working out where your 18 points go before you spend them.',
    pros: ['Teaches the rules by doing', 'Saved between visits; shareable by link'],
    cons: ['Minor rows can only record a slot, not which Minor you rolled', 'More code to keep working'],
    phone: 'About 2,600 px with the counters',
  },
  {
    id: 't3', letter: 'T3', path: '/dmz/lab/traits-forks', name: 'Fork comparison',
    pitch: 'Each tree as its three Major forks, A against B, with what players say about each side, then the Minors players have seen.',
    bestFor: 'Deciding between two Majors.',
    pros: ['Best home for the Reddit tips', 'Short and easy to read on a phone'],
    cons: ['Does not look like the game', 'Hides the row-by-row climb'],
    phone: 'About 3,900 px for all three trees',
  },
]
export const traitConcept = id => traitConcepts.find(concept => concept.id === id)

// Scored 1–3 at 1366 px and 375 px on 22 Oct 2026. T4 (radial) was scored in
// the plan and not built. For build cost, a higher score means less work.
export const traitCriteria = [
  { id: 'game', label: 'Like the game' },
  { id: 'phone', label: 'Phone fit' },
  { id: 'desk', label: 'Desktop fit' },
  { id: 'tips', label: 'Tips fit' },
  { id: 'honest', label: 'Random Minors clear' },
  { id: 'cost', label: 'Build cost' },
]
export const traitScores = {
  t1: { game: 3, phone: 2, desk: 3, tips: 1, honest: 3, cost: 3 },
  t2: { game: 3, phone: 2, desk: 3, tips: 2, honest: 2, cost: 1 },
  t3: { game: 1, phone: 3, desk: 2, tips: 3, honest: 3, cost: 3 },
  mix: { game: 3, phone: 2, desk: 3, tips: 3, honest: 3, cost: 1 },
}

export const traitMix = {
  id: 'mix', path: '/dmz/operators', name: 'Replica you can plan on',
  parts: ['t1', 't2', 't3'],
  pitch: 'T1’s replica is the face of the Operators page. “Plan a build” turns on T2’s planner with the in-game counters. Tapping a Major opens T3’s fork card beside the tree: what it does, the Major it competes with and what players say.',
  why: [
    'The tree looks like the game, which is what was asked for.',
    'Planning stays off until asked, so the tree reads cleanly first.',
    'The fork card puts the Reddit tips right next to the node they are about.',
    'Minor rows say plainly that every Operator rolls its own.',
  ],
}
