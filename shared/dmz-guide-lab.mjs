// DMZ guide concepts for /dmz/lab/guide: what each draft is, how it scored
// and the mix that shipped. The drafts all read shared/dmz-guide.mjs, so they
// differ in layout only. Delete this file with the guide-* lab pages once the
// lab goes.

export const guideConcepts = [
  {
    id: 'g1', letter: 'G1', path: '/dmz/lab/guide-ladder', name: 'Armor ladder',
    pitch: 'One page, Early to Late. A ladder of vests stays beside the page and marks the tier you are reading; each tier lists its steps in order.',
    bestFor: 'Reading ahead and seeing the whole game at once.',
    pros: ['The whole game in order on one page', 'The sticky ladder always shows where you are'],
    cons: ['About 21,600 px tall on a phone', 'A mid-tier player has to scroll or jump past Early first'],
    phone: '21,600 px for all three tiers',
  },
  {
    id: 'g2', letter: 'G2', path: '/dmz/lab/guide-vest', name: 'Pick your vest',
    pitch: 'The page opens on one question, “What are you wearing?”, with a picture of each vest. Picking one shows that tier as a briefing, with the next tier one tap away.',
    bestFor: 'Players who want to know what to do today, without reading the rest.',
    pros: ['The most visual way in: four vests, one tap', 'Only your tier on screen, with the next one teased at the end'],
    cons: ['Still about 8,300 px per tier on a phone', 'The 2 × 2 picker pushes the plan below the fold on phones'],
    phone: '8,300 px for one tier',
  },
  {
    id: 'g3', letter: 'G3', path: '/dmz/lab/guide-tabs', name: 'Tabs and dropdowns',
    pitch: 'Early, Mid and Late tabs. Each tab is a short list of questions, such as “Which deployment should I pick?”, that open into the answer.',
    bestFor: 'Scanning for one answer.',
    pros: ['Shortest on a phone: about 2,500 px with the questions folded', 'Each question says what is inside before you open it'],
    cons: ['Text first: the pictures hide inside the dropdowns', 'Steps sit in a dropdown inside a dropdown'],
    phone: '2,500 px folded',
  },
  {
    id: 'g4', letter: 'G4', path: '/dmz/lab/guide-ask', name: 'Ask the handler',
    pitch: 'Three quick questions: your vest, what you want next and whether you play solo. The answer is a short plan: your next steps, a deployment and where to go.',
    bestFor: 'A personal next step in under ten seconds.',
    pros: ['The next three unticked steps, nothing else', 'Feels like a briefing from the handler'],
    cons: ['Hides the tiers and the bigger picture', 'The goal-to-deployment advice is new logic to keep up to date'],
    phone: '5,100 px with a plan',
  },
]
export const guideConcept = id => guideConcepts.find(concept => concept.id === id)

// Scored 1–3 at 1366 px and 375 px on 22 Oct 2026. For upkeep and build cost,
// a higher score means less work.
export const guideCriteria = [
  { id: 'order', label: 'Clear order' },
  { id: 'tiers', label: 'Tiers explained' },
  { id: 'visual', label: 'Visual' },
  { id: 'phone', label: 'Phone fit' },
  { id: 'upkeep', label: 'Upkeep' },
  { id: 'cost', label: 'Build cost' },
]
export const guideScores = {
  g1: { order: 2, tiers: 3, visual: 2, phone: 1, upkeep: 3, cost: 3 },
  g2: { order: 3, tiers: 2, visual: 3, phone: 2, upkeep: 3, cost: 3 },
  g3: { order: 2, tiers: 2, visual: 2, phone: 3, upkeep: 3, cost: 3 },
  g4: { order: 3, tiers: 1, visual: 2, phone: 3, upkeep: 2, cost: 2 },
  mix: { order: 3, tiers: 3, visual: 3, phone: 3, upkeep: 3, cost: 2 },
}

export const guideMix = {
  id: 'mix', path: '/dmz/guide', name: 'Pick your stage, then fold the rest',
  parts: ['g2', 'g1', 'g3', 'g4'],
  pitch: 'G2’s picker is the way in, now asking where you are in DMZ: early, mid or late game, with G1’s tier track under it. Your stage opens on its steps in order, with the next unticked step marked, as G4 does. The reference parts, from Lieutenants to the ready checklist, fold into G3-style questions.',
  why: [
    'One tap on a picture was the fastest way to “where am I?” in testing. The stage picker keeps that, with armor as one sign among several rather than the frame.',
    'Folding the reference parts brings a stage down from about 8,300 px to under 4,000 px on a phone.',
    'Marking the next unticked step gives G4’s “what now?” without the extra questions.',
    'It reuses the tested parts, so the only new work is the fold.',
  ],
}
