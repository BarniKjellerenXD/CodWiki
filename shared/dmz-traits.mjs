// MW4 DMZ trait trees for the Operators station (checked 22 Oct 2026). The
// research behind it, with every conflict and gap, is in
// docs/research/dmz-traits-meta/. Majors are fixed per tree; Minors are
// rolled per Operator, so a Minor has a tree but no row. Prestige traits seen
// only in a menu screenshot posted before launch are left out.
// Source ids come from intelSources (shared/dmz-intel.mjs) or guideSources.

export const TRAITS_CHECKED = '22 Oct 2026'
export const TRAIT_POINTS = 18
export const TREE_CAP = 9

// Shapes and colours follow the in-game screen; the icons are drawn for CodWiki.
export const traitTrees = [
  { id: 'warfighter', name: 'Warfighter', shape: 'hex', colour: '#e0574a', role: 'Fights and staying alive in them: equipment, regen, a self-revive and extra drops.' },
  { id: 'scout', name: 'Scout', shape: 'circle', colour: '#e3b341', role: 'Loot, crafting, cash and UAV intel, and staying off the enemy UAV.' },
  { id: 'survivalist', name: 'Survivalist', shape: 'square', colour: '#3fb7a8', role: 'Revives, consumables, Last Stand and getting out alive.' },
]

// Rows climb from the bottom. Row 1 is the random starting Minor; Majors sit
// in rows 3, 6 and 9 as fixed pairs; the other rows offer three random Minors.
export const traitRows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(row => ({
  row,
  kind: row === 1 ? 'start' : row % 3 === 0 ? 'major' : 'minor',
  choices: row === 1 ? 1 : row % 3 === 0 ? 2 : 3,
}))

export const traitList = [
  { id: 'equipment-professional', name: 'Equipment Professional', tree: 'Warfighter', kind: 'major', row: 3, pair: 'combat-resistance', effect: 'After you use them, your equipped Lethals and Tacticals refill slowly, up to the slot\'s maximum.', confidence: 'official', intel: 'equipment-professional', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare', 'reddit-has-anyone-else-noticed-the'] },
  { id: 'combat-resistance', name: 'Combat Resistance', tree: 'Warfighter', kind: 'major', row: 3, pair: 'equipment-professional', effect: 'Explosives hurt you less, and enemy Tacticals affect you less.', confidence: 'official', intel: 'combat-resistance', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'viper-sense', name: 'Viper Sense', tree: 'Warfighter', kind: 'major', row: 6, pair: 'quick-fix', effect: 'Thermal scopes and AI targeting systems cannot pick you out.', confidence: 'official', intel: 'viper-sense', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'dmztracker-traits-viper-sense', 'reddit-so-they-changed-how-viper'] },
  { id: 'quick-fix', name: 'Quick Fix', tree: 'Warfighter', kind: 'major', row: 6, pair: 'viper-sense', effect: 'After you kill an enemy Operator or a hostile, your health begins to come back sooner.', confidence: 'official', intel: 'quick-fix', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'possum', name: 'Possum', tree: 'Warfighter', kind: 'major', row: 9, pair: 'adaptive-restock', effect: 'Once per match, after you die you can self-revive into Last Stand with full health.', confidence: 'official', intel: 'possum', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare', 'reddit-those-of-you-who-have', 'reddit-notable-traits-recently-shown-in'] },
  { id: 'adaptive-restock', name: 'Adaptive Restock', tree: 'Warfighter', kind: 'major', row: 9, pair: 'possum', effect: 'Each enemy hostile drops one more item.', numbers: '+1 item', confidence: 'official', intel: 'adaptive-restock', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and'] },
  { id: 'adrenaline-burst', name: 'Adrenaline Burst', tree: 'Warfighter', kind: 'minor', effect: 'Killing an enemy resets your Tactical Sprint.', confidence: 'official', intel: 'adrenaline-burst', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-traits-adrenaline-burst', 'dmzcodex-dmz-skill-trees-traits-guide', 'allthings-mw4-dmz-all-traits-and', 'codmunity-traits'] },
  { id: 'killing-spree', name: 'Killing Spree', tree: 'Warfighter', kind: 'minor', effect: 'Each kill makes your active effects last longer, up to double their normal time.', numbers: 'up to 2x duration', confidence: 'confirmed', intel: 'killing-spree', sources: ['dmztracker-traits-killing-spree', 'dmztracker-traits', 'dmzcodex-traits', 'allthings-mw4-dmz-all-traits-and'] },
  { id: 'lt-hunter', name: 'LT Hunter', tree: 'Warfighter', kind: 'minor', effect: 'Activating a Lieutenant Tower gives extra Lieutenant intel (one guide reads the in-game text as one more Lieutenant revealed).', confidence: 'confirmed', intel: 'lt-hunter', sources: ['dmztracker-traits-lt-hunter', 'dmzcodex-traits-lt-hunter', 'allthings-mw4-dmz-all-traits-and', 'codmunity-traits'] },
  { id: 'final-intel', name: 'Final Intel', tree: 'Warfighter', kind: 'minor', effect: 'The final exfil is marked on your Tac Map from the start of the match.', confidence: 'confirmed', sources: ['dmztracker-traits-final-intel', 'dmztracker-tools-trait-builder', 'reddit-all-warfighter-traits'] },
  { id: 'free-prep', name: 'Free Prep', tree: 'Warfighter', kind: 'minor', effect: 'When you take the Free Loadout, a random Consumable is added to your Backpack.', confidence: 'reported', sources: ['dmztracker-traits-free-prep', 'dmztracker-tools-trait-builder'] },
  { id: 'plate-pouch', name: 'Plate Pouch', tree: 'Warfighter', kind: 'minor', effect: 'You can carry 2 more reserve armor plates.', numbers: '+2 reserve plates', confidence: 'reported', sources: ['dmztracker-traits-plate-pouch', 'dmztracker-tools-trait-builder'] },
  { id: 'supplied-drops', name: 'Supplied Drops', tree: 'Warfighter', kind: 'minor', effect: 'Supply drops have a chance to hold one extra container. It works for the whole squad and stacks.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'bounty-intel', name: 'Bounty Intel', tree: 'Warfighter', kind: 'minor', effect: 'Buying Bounty Intel costs less.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'bounty-hunter', name: 'Bounty Hunter', tree: 'Warfighter', kind: 'minor', effect: 'You get bigger rewards for collecting bounties.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'quick-regen', name: 'Quick Regen', tree: 'Warfighter', kind: 'minor', effect: 'Your health starts to regenerate a little sooner.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'popcorn-lethals', name: 'Popcorn Lethals', tree: 'Warfighter', kind: 'minor', effect: 'Hostiles hit by your Lethals are more likely to drop Lethals.', confidence: 'reported', intel: 'popcorn-lethals', sources: ['dmztracker-traits-popcorn-lethals', 'dmzcodex-traits', 'allthings-mw4-dmz-all-traits-and', 'codmunity-traits'] },
  { id: 'quick-knife', name: 'Quick Knife', tree: 'Warfighter', kind: 'minor', effect: 'Turns your weapon bash into a knife strike. Guides list it in both the Warfighter and Survivalist pools.', confidence: 'reported', sources: ['dmzcodex-traits-quick-knife', 'codmunity-traits'] },
  { id: 'hostile-looter', name: 'Hostile Looter', tree: 'Scout', kind: 'major', row: 3, pair: 'container-looter', effect: 'Enemy hostiles can drop an Uncommon printer ingredient now and then, and very rarely a Rare one.', confidence: 'official', intel: 'hostile-looter', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'container-looter', name: 'Container Looter', tree: 'Scout', kind: 'major', row: 3, pair: 'hostile-looter', effect: 'Containers have a chance to give you one extra item.', confidence: 'official', intel: 'container-looter', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'field-crafting', name: 'Field Crafting', tree: 'Scout', kind: 'major', row: 6, pair: 'uav-upgrade', effect: 'Lets you craft items straight from Common printer resources while you are deployed.', confidence: 'official', intel: 'field-crafting', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'reddit-scout-skill-tree-trait-question'] },
  { id: 'uav-upgrade', name: 'UAV Upgrade', tree: 'Scout', kind: 'major', row: 6, pair: 'field-crafting', effect: 'Your UAVs reach farther, last longer and become Advanced UAVs.', confidence: 'official', intel: 'uav-upgrade', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'overwatch', name: 'Overwatch', tree: 'Scout', kind: 'major', row: 9, pair: 'thermal-padding', effect: 'UAV Towers you switch on stay active for the rest of the match.', confidence: 'official', intel: 'overwatch', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'reddit-overwatch-trait', 'reddit-the-most-obnoxious-trait-in'] },
  { id: 'thermal-padding', name: 'Thermal Padding', tree: 'Scout', kind: 'major', row: 9, pair: 'overwatch', effect: 'UAVs do not show you, and an Advanced UAV only detects you the way a normal UAV would.', confidence: 'official', intel: 'thermal-padding', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'reddit-the-most-obnoxious-trait-in', 'reddit-is-there-seriously-no-way'] },
  { id: 'investor', name: 'Investor', tree: 'Scout', kind: 'minor', effect: 'You get a little more cash when you extract.', confidence: 'official', intel: 'investor', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-traits-investor', 'dmzcodex-dmz-skill-trees-traits-guide', 'allthings-mw4-dmz-all-traits-and', 'codmunity-traits'] },
  { id: 'combat-scavenger', name: 'Combat Scavenger', tree: 'Scout', kind: 'minor', effect: 'Killed hostiles sometimes drop a valuable or a printer ingredient.', confidence: 'confirmed', intel: 'combat-scavenger', sources: ['dmztracker-traits-combat-scavenger', 'dmzcodex-traits-combat-scavenger', 'codmunity-traits'] },
  { id: 'cash-ops', name: 'Cash Ops', tree: 'Scout', kind: 'minor', effect: 'You get 20% more cash for completing Ops.', numbers: '+20% Op cash', confidence: 'reported', sources: ['dmztracker-traits-cash-ops', 'dmztracker-tools-trait-builder'] },
  { id: 'resource-pockets', name: 'Resource Pockets', tree: 'Scout', kind: 'minor', effect: 'Scrapping items gives 20% more printer resources.', numbers: '+20% scrap resources', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder', 'dmzcodex-dmz-skill-trees-traits-guide'] },
  { id: 'stealthy', name: 'Stealthy', tree: 'Scout', kind: 'minor', effect: 'Raises how many enemies you can kill before a Hunt Squad comes for you.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'fast-learner', name: 'Fast Learner', tree: 'Scout', kind: 'minor', effect: 'Your Operator gains slightly more XP. A small brain icon pops up when it triggers. Stacks with Faster Learner.', confidence: 'confirmed', sources: ['dmztracker-traits-fast-learner', 'dmztracker-tools-trait-builder', 'reddit-fast-learner-trait'] },
  { id: 'mini-tracker', name: 'Mini Tracker', tree: 'Scout', kind: 'minor', effect: 'Looting a container nobody opened yet has a 50% chance to send out a radar pulse.', numbers: '50% pulse chance', confidence: 'confirmed', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder', 'dmzcodex-traits', 'codmunity-traits'] },
  { id: 'key-cash', name: 'Key Cash', tree: 'Scout', kind: 'minor', effect: 'Unlocking something with a key pays you cash; rarer keys pay more.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'auto-fill', name: 'Auto Fill', tree: 'Scout', kind: 'minor', effect: 'Your Lethals and Tacticals refill on their own from your Backpack.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'pack-rat', name: 'Pack Rat', tree: 'Scout', kind: 'minor', effect: 'Your 3D Printer resource cap goes up by 20%. Works together with Resource Hoarder.', numbers: '+20% resource capacity', confidence: 'reported', intel: 'pack-rat', sources: ['dmztracker-traits-pack-rat', 'dmzcodex-dmz-skill-trees-traits-guide', 'allthings-mw4-dmz-all-traits-and', 'codmunity-traits'] },
  { id: 'resource-hoarder', name: 'Resource Hoarder', tree: 'Scout', kind: 'minor', effect: 'Increases your 3D Printer resource cap. Works together with Pack Rat.', numbers: 'dmzcodex and codmunity say +20%; dmztracker says the amount is not published', confidence: 'reported', sources: ['dmztracker-traits-resource-hoarder', 'dmzcodex-traits', 'codmunity-traits'] },
  { id: 'field-medic', name: 'Field Medic', tree: 'Scout', kind: 'minor', effect: 'You revive teammates faster.', confidence: 'reported', sources: ['dmzcodex-traits-field-medic', 'codmunity-traits'] },
  { id: 'faster-revive', name: 'Faster Revive', tree: 'Survivalist', kind: 'major', row: 3, pair: 'consumable-duration', effect: 'You revive faster.', confidence: 'official', intel: 'faster-revive', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'consumable-duration', name: 'Consumable Duration', tree: 'Survivalist', kind: 'major', row: 3, pair: 'faster-revive', effect: 'Your consumables last longer.', confidence: 'official', intel: 'consumable-duration', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'impact-smokes', name: 'Impact Smokes', tree: 'Survivalist', kind: 'major', row: 6, pair: 'free-revive', effect: 'Smoke comes out around you when you are downed.', confidence: 'official', intel: 'impact-smokes', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'free-revive', name: 'Free Revive', tree: 'Survivalist', kind: 'major', row: 6, pair: 'impact-smokes', effect: 'The first Wound you take gets fixed on its own.', confidence: 'official', intel: 'free-revive', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'reddit-how-does-the-free-revive'] },
  { id: 'numb-the-pain', name: 'Numb the Pain', tree: 'Survivalist', kind: 'major', row: 9, pair: 'die-hard', effect: 'Guides say revives also give you the Painkiller and Smelling Salts effects. That came from the launch description, which the 23 Oct update corrected without saying what the trait does.', confidence: 'official', intel: 'numb-the-pain', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'die-hard', name: 'Die Hard', tree: 'Survivalist', kind: 'major', row: 9, pair: 'numb-the-pain', effect: 'In Last Stand, getting close to an exfil calls it for you, and you never bleed out while in Last Stand.', confidence: 'official', intel: 'die-hard', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-tools-trait-builder', 'dmzcodex-trait-trees', 'allthings-mw4-dmz-all-traits-and', 'xbox-call-of-duty-modern-warfare'] },
  { id: 'air-superiority', name: 'Air Superiority', tree: 'Survivalist', kind: 'minor', effect: 'UAV Towers and SAM Sites you take stay active longer.', confidence: 'official', intel: 'air-superiority', sources: ['callofduty-call-of-duty-modern-warfare', 'dmztracker-traits-air-superiority', 'dmzcodex-dmz-skill-trees-traits-guide', 'allthings-mw4-dmz-all-traits-and', 'codmunity-traits'] },
  { id: 'metabolism', name: 'Metabolism', tree: 'Survivalist', kind: 'minor', effect: 'Slowly gives back the health you lose when you use the Tourniquet. Xbox Wire describes it more loosely as slowly regaining lost health.', confidence: 'confirmed', intel: 'metabolism', sources: ['xbox-call-of-duty-modern-warfare', 'dmztracker-traits-metabolism', 'dmzcodex-traits', 'allthings-mw4-dmz-all-traits-and', 'codmunity-traits'] },
  { id: 'rescuer', name: 'Rescuer', tree: 'Survivalist', kind: 'minor', effect: 'You move quicker when dragging a downed teammate.', confidence: 'confirmed', sources: ['dmztracker-traits-rescuer', 'dmztracker-tools-trait-builder', 'codmunity-traits'] },
  { id: 'consumable-stacker', name: 'Consumable Stacker', tree: 'Survivalist', kind: 'minor', effect: 'Taking a consumable while the same effect is still running adds the times together, up to twice the normal length.', numbers: 'max 2x base duration', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'rad-blocker', name: 'Rad Blocker', tree: 'Survivalist', kind: 'minor', effect: 'You take less damage from radiation.', confidence: 'confirmed', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder', 'codmunity-traits'] },
  { id: 'resupply', name: 'Resupply', tree: 'Survivalist', kind: 'minor', effect: 'Ammo crates and ammo restocks give you extra ammo, and armor boxes give 2 extra plates. dmzcodex lists it under Scout instead.', numbers: '+2 plates from armor boxes', confidence: 'reported', sources: ['dmztracker-traits-resupply', 'dmztracker-tools-trait-builder'] },
  { id: 'expedited-extraction', name: 'Expedited Extraction', tree: 'Survivalist', kind: 'minor', effect: 'Exfils arrive much faster.', confidence: 'confirmed', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder', 'codmunity-traits'] },
  { id: 'lucky', name: 'Lucky', tree: 'Survivalist', kind: 'minor', effect: 'When you suffer a bad effect or run low on supplies, you have a better chance to find a useful item.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'objective-oriented', name: 'Objective Oriented', tree: 'Survivalist', kind: 'minor', effect: 'Op reward crates come one rarity higher, capped at Rare.', numbers: '+1 rarity tier, max Rare', confidence: 'reported', sources: ['dmztracker-traits-objective-oriented', 'dmztracker-tools-trait-builder'] },
  { id: 'fuel-economy', name: 'Fuel Economy', tree: 'Survivalist', kind: 'minor', effect: 'Vehicles use less fuel.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'faster-learner', name: 'Faster Learner', tree: 'Survivalist', kind: 'minor', effect: 'Your Operator gains slightly more XP. Stacks with Fast Learner.', confidence: 'reported', sources: ['dmztracker-traits', 'dmztracker-tools-trait-builder'] },
  { id: 'impact-smokes-pro', name: 'Impact Smokes Pro', tree: null, kind: 'prestige', effect: 'Stronger version of Impact Smokes that fires when you go down. A player who got it says the smoke is bigger and lasts longer.', confidence: 'official', base: 'impact-smokes', sources: ['callofduty-call-of-duty-modern-warfare-13', 'dmztracker-guides-dmz-patch-notes', 'reddit-anyone-died-on-a-prestiged'] },
  { id: 'possum-pro', name: 'Possum Pro', tree: null, kind: 'prestige', effect: 'Like Possum: after you die you can pick yourself back up into Last Stand. Also, once per match, using the Tourniquet costs no health.', confidence: 'reported', base: 'possum', sources: ['reddit-those-of-you-who-have'] },
  { id: 'viper-sense-pro', name: 'Viper Sense Pro', tree: null, kind: 'prestige', effect: 'A stronger Viper Sense. Its icon shows in the Prestige column of a player\'s prestiged Operator; what it adds is not confirmed yet.', confidence: 'reported', base: 'viper-sense', sources: ['reddit-lvl-70-with-1-prestige'] },
  { id: 'adaptive-restock-pro', name: 'Adaptive Restock Pro', tree: null, kind: 'prestige', effect: 'Pro version of Adaptive Restock. A player says they got it from Prestige; its effect was not described.', confidence: 'reported', base: 'adaptive-restock', sources: ['reddit-anyone-died-on-a-prestiged'] },
]

export const traitRules = [
  { label: 'Trait count', value: '66 traits: 22 per tree, made of 6 Major and 16 Minor positions.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'gamelevate-modern-warfare-4-dmz-operator', 'neonsect-modern-warfare-4-mw4-dmz'] },
  { label: 'Points per Operator', value: 'An Operator earns at most 18 Trait Points, a point for every Dog Tag level. The 18 levels climb from Steel I up to Onyx III (Steel, Bronze, Silver, Gold, Damascus, then Onyx, three levels each). Points stay with the Operator that earned them.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'dexerto-dmz-progression', 'dmztracker-progression'] },
  { label: 'When points arrive', value: 'After a successful exfil, if the Operator\'s Dog Tag levels up. A strong run can give more than one level. An Operator\'s level and your own DMZ player level are two different things.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'dexerto-dmz-progression'] },
  { label: 'Banking points', value: 'Points are banked automatically. You can save them or spend them any time in the Traits menu (left quick menu or Operators station).', confidence: 'official', sources: ['xbox-call-of-duty-modern-warfare', 'callofduty-call-of-duty-modern-warfare'] },
  { label: 'Cost of a trait', value: 'Every pick costs 1 point, Majors too. The row-9 Major is simply the ninth point in that tree.', confidence: 'confirmed', sources: ['dmzcodex-dmz-skill-trees-traits-guide', 'allthings-mw4-dmz-all-traits-and'] },
  { label: 'Tree cap', value: 'Max 9 picks per tree, one per row. 18 points can finish two trees or be spread over all three.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'dmzcodex-dmz-skill-trees-traits-guide'] },
  { label: 'First pick', value: 'The first point you spend in any tree always buys that tree\'s random starting Minor.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'xbox-call-of-duty-modern-warfare', 'dmzcodex-mechanics-trait-acquisition'] },
  { label: 'Branch rule', value: 'Pick one trait in a row to open the next row. Picking one locks out the others in that row. Any node of the next row can be picked.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'xbox-call-of-duty-modern-warfare', 'reddit-lvl-70-with-1-prestige'] },
  { label: 'Majors are fixed', value: 'The six Majors per tree and their rows (3, 6, 9) are the same for every Operator and are always visible.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'reddit-all-warfighter-traits', 'dmztracker-tools-trait-builder', 'reddit-scout-skill-tree-trait-question'] },
  { label: 'Minors are random', value: 'Minors are rolled per Operator: which Minors you get and where they sit change between Operators. Several players report that the Minors differ from one Operator to another. One player also found the same Minor in different trees on two Operators.', confidence: 'confirmed', sources: ['callofduty-call-of-duty-modern-warfare', 'reddit-all-warfighter-traits', 'reddit-those-of-you-who-have', 'gamelevate-modern-warfare-4-dmz-operator'] },
  { label: 'When Minors show', value: 'Hidden Minor rows show \'?\' until you pick in the row below. Screenshots show the reveal goes row by row.', confidence: 'confirmed', sources: ['callofduty-call-of-duty-modern-warfare', 'dmzcodex-trait-trees', 'reddit-lvl-70-with-1-prestige'] },
  { label: 'Permanence and respec', value: 'Picks are locked in. There is no respec or refund. The only resets are Operator Prestige or dismissing the Operator and starting fresh.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'xbox-call-of-duty-modern-warfare', 'dmzcodex-dmz-skill-trees-traits-guide', 'reddit-the-most-obnoxious-trait-in'] },
  { label: 'Reroll by dismissing', value: 'Each new Operator rolls its own Minors. Some players ask whether to dismiss an Operator early to get better rolls; no saved thread shows that this works for the same Operator. Dismissing gives up all normal traits, but Prestige traits stay with that Operator.', confidence: 'reported', sources: ['reddit-all-warfighter-traits', 'reddit-do-traits-randomize-again-after', 'callofduty-call-of-duty-modern-warfare'] },
  { label: 'Does Prestige reroll Minors?', value: 'Not stated officially. One player who prestiged said the random Minors were rolled again.', confidence: 'reported', sources: ['reddit-those-of-you-who-have', 'dmzcodex-dmz-operator-prestige-guide'] },
  { label: 'MIA cost', value: 'A dead Operator goes MIA. Pay DMZ Cash to recover them with all traits but no gear, or dismiss them. The price goes up with Trait Points. You cannot Prestige an MIA Operator.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'xbox-call-of-duty-modern-warfare', 'xbox-dmz-5-features-get-excited'] },
  { label: 'Prestige requirements', value: '18 earned Trait Points (they do not need to be spent), not MIA, plus cash and gear that are all used up. Prestige 1: 200,000 cash, two weapons (Rare or better) that each have 3 attachment slots, plate carrier and backpack both Rare, plus 4 Rare ingredients. Prestige 2: 300,000, Epic gear and weapons with 4 slots. Prestige 3 and every later one: 500,000, Legendary gear and weapons with 4 slots.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'dmzcodex-dmz-operator-prestige-guide', 'dmztracker-progression', 'reddit-cant-prestige-operator-help-please'] },
  { label: 'Prestige blocker bug', value: 'Some players hold the Prestige button and nothing happens. Official workaround (Trello, 21 Oct): use Rare (blue) guns that have just 3 attachment slots and have never carried 4 or more attachments. One player fixed it by swapping guns with 4 or 5 attachments for 3-attachment ones. Another player says every item should be exactly the asked rarity. A guide adds that taking an attachment off an upgraded gun does not count.', confidence: 'official', sources: ['trello-brbxrryp', 'dmztracker-guides-dmz-patch-notes', 'reddit-cant-prestige-operator-help-please', 'reddit-those-of-you-who-have', 'dmzcodex-dmz-operator-prestige-guide'] },
  { label: 'What Prestige does', value: 'Removes all traits and unspent points, takes the cash and gear, and the Dog Tag starts climbing again. You then earn 18 points again.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'dmzcodex-dmz-operator-prestige-guide', 'reddit-lvl-70-with-1-prestige'] },
  { label: 'Permanent Prestige traits', value: 'Each Prestige adds one random Permanent Prestige trait; you cannot choose it, and an Operator holds three at most. It sits in a separate Prestige column, does not use the 18 points, and stays with that Operator through dismissal, a slot change or a skin change. Players who got one so far report \'Pro\' versions of tree traits.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'xbox-call-of-duty-modern-warfare', 'reddit-anyone-died-on-a-prestiged', 'reddit-lvl-70-with-1-prestige', 'dmzcodex-trait-trees', 'reddit-those-of-you-who-have'] },
  { label: 'Prestige 4 and later', value: 'You are offered a new random trait, different from your three. Swap it for one of them or turn it down.', confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'dmzcodex-dmz-operator-prestige-guide', 'reddit-anyone-died-on-a-prestiged'] },
  { label: 'How fast Operators level', value: 'In one thread, four players say they filled, or nearly filled, a whole tree within a few hours or three to four successful runs.', confidence: 'reported', sources: ['reddit-all-warfighter-traits'] },
  { label: 'Known trait bugs', value: 'One player says Equipment Professional stops refilling once both equipment slots are empty, even with spares in the Backpack, so keep at least one Lethal or Tactical in the slot; the same player says it sometimes stops mid-match too. One player on Switch says the Possum revive prompt did nothing, twice. The launch patch fixed Impact Smokes Pro not going off when you are downed.', confidence: 'reported', sources: ['reddit-has-anyone-else-noticed-the', 'reddit-hold-button-to-revive-possum', 'callofduty-call-of-duty-modern-warfare-13'] },
]

export const traitById = id => traitList.find(trait => trait.id === id)
export const treeById = id => traitTrees.find(tree => tree.id === id)
export const traitsIn = (tree, kind) => traitList.filter(trait => trait.tree === treeById(tree)?.name && (!kind || trait.kind === kind))
// The two Majors offered on a Major row of a tree. Which one sits left in game is not recorded.
export const majorPair = (tree, row) => traitsIn(tree, 'major').filter(trait => trait.row === row)
export const traitRule = label => traitRules.find(rule => rule.label === label)

// ---------------------------------------------------------------- Planner
// A build is one string per tree, one letter per row from row 1 up: m for the
// starting Minor, l, m or r for the left, middle or right Minor of a Minor row
// (which Minor sits there is rolled per Operator), and a or b for the first or
// second Major of the pair. Builds are saved on the device and can ride in the URL (?wf=mma…).
// Saved builds live on players' devices: never change the letters or the key.
export const TRAIT_BUILD_KEY = 'codwiki-dmz-traits-v1'
export const buildParams = { warfighter: 'wf', scout: 'sc', survivalist: 'sv' }
const rowLetters = row => ({ start: 'm', minor: 'lmr', major: 'ab' })[traitRows[row - 1].kind]
export const rowChoices = row => [...rowLetters(row)]
export function emptyBuild() { return Object.fromEntries(traitTrees.map(tree => [tree.id, ''])) }
export function normalizeBuild(value) {
  const build = emptyBuild()
  let left = TRAIT_POINTS
  for (const tree of traitTrees) {
    const text = typeof value?.[tree.id] === 'string' ? value[tree.id] : ''
    let ok = ''
    for (const letter of text.slice(0, TREE_CAP)) {
      if (!left || !rowLetters(ok.length + 1).includes(letter)) break
      ok += letter
      left--
    }
    build[tree.id] = ok
  }
  return build
}
export function readBuild(text) {
  try { return normalizeBuild(JSON.parse(text || '{}')) } catch { return emptyBuild() }
}
export const buildSpent = build => traitTrees.reduce((sum, tree) => sum + build[tree.id].length, 0)
// The Major picked on a row, or null for a Minor row or an open row.
export function buildMajor(build, tree, row) {
  const letter = build[tree][row - 1]
  return letter === 'a' || letter === 'b' ? majorPair(tree, row)['ab'.indexOf(letter)] : null
}
// Rows can be picked in order only, as in game.
export function canPick(build, tree, row) {
  return build[tree].length === row - 1 && build[tree].length < TREE_CAP && buildSpent(build) < TRAIT_POINTS
}
// Picking the next row adds it; picking a Major's rival on a picked row swaps
// it; picking a picked node again drops it and every row above it.
export function pickInBuild(build, tree, row, letter) {
  const text = build[tree]
  if (!rowLetters(row).includes(letter)) return build
  if (row <= text.length) {
    const next = text[row - 1] === letter ? text.slice(0, row - 1) : text.slice(0, row - 1) + letter + text.slice(row)
    return normalizeBuild({ ...build, [tree]: next })
  }
  if (!canPick(build, tree, row)) return build
  return normalizeBuild({ ...build, [tree]: text + letter })
}
export function buildToQuery(build) {
  return Object.fromEntries(traitTrees.filter(tree => build[tree.id]).map(tree => [buildParams[tree.id], build[tree.id]]))
}
export function buildFromQuery(query) {
  return normalizeBuild(Object.fromEntries(traitTrees.map(tree => [tree.id, String(query?.[buildParams[tree.id]] || '')])))
}

// 24×24 stroke icons drawn for CodWiki, one per Major. They hint at the effect
// and do not copy the game's art. Minors and Prestige traits share one icon each.
export const traitIcons = {
  'equipment-professional': 'M9 9.5a5 5 0 1 0 6 0 M10 4h4v5.5h-4z M7 4h3',
  'combat-resistance': 'M12 3l7 3v5c0 5-3 8-7 10c-4-2-7-5-7-10V6z M9 12l2 2l4-4',
  'viper-sense': 'M2 12s4-6 10-6s10 6 10 6s-4 6-10 6S2 12 2 12z M12 10a2 2 0 1 0 0.01 0 M4 4l16 16',
  'quick-fix': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5a4 4 0 0 1 7 2.5c0 5.5-7 10-7 10z M12 9.5v5 M9.5 12h5',
  possum: 'M12 18V6 M7 11l5-5l5 5 M5 21h14',
  'adaptive-restock': 'M4 9h16v11H4z M4 9l2-4h12l2 4 M12 12v5 M9.5 14.5h5',
  'hostile-looter': 'M12 3a7 7 0 0 0-7 7v3l2 2v4h10v-4l2-2v-3a7 7 0 0 0-7-7 M9.5 11h.01 M14.5 11h.01 M10 19v-2 M14 19v-2',
  'container-looter': 'M3 7h18v13H3z M3 11h18 M10 11v3h4v-3 M12 3v2',
  'field-crafting': 'M4 20l8-8 M13 5l6 6 M11 7l4-4l6 6l-4 4z',
  'uav-upgrade': 'M12 4a8 8 0 1 0 0.01 0 M12 8a4 4 0 1 0 0.01 0 M12 12l5-5',
  overwatch: 'M12 7V3 M8 21l4-14l4 14 M6 6a8 8 0 0 1 12 0 M9.5 15h5',
  'thermal-padding': 'M6 4h12v16H6z M6 9h12 M6 14h12 M3 3l18 18',
  'faster-revive': 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z',
  'consumable-duration': 'M7 3h10 M7 21h10 M8 3c0 5 8 5 8 9s-8 4-8 9 M16 3c0 5-8 5-8 9s8 4 8 9',
  'impact-smokes': 'M7 18a4 4 0 0 1-.5-8a5.5 5.5 0 0 1 10.5-1a4.5 4.5 0 0 1 0 9z',
  'free-revive': 'M5 15L15 5l4 4L9 19z M10 10h.01 M14 10h.01 M10 14h.01 M14 14h.01',
  'numb-the-pain': 'M4.5 13.5l9-9a4.2 4.2 0 0 1 6 6l-9 9a4.2 4.2 0 0 1-6-6z M9 9l6 6',
  'die-hard': 'M5 21V4 M5 4h12l-2.5 4l2.5 4H5',
}
export const MINOR_ICON = 'M12 5l7 7l-7 7l-7-7z'
export const PRESTIGE_ICON = 'M12 3l7 3v5c0 5-3 8-7 10c-4-2-7-5-7-10V6z M8.5 12.5l1.5-3l2 2l2-2l1.5 3z'
export const traitIcon = trait => traitIcons[trait?.base || trait?.id] || (trait?.kind === 'prestige' ? PRESTIGE_ICON : MINOR_ICON)

// ---------------------------------------------------------------- Player tips
// What players say on r/DMZ about a trait, paraphrased, from posts and comments
// dated 20 Oct 2026 or later. `players` counts separate comments that make the
// point. Read from 168 r/DMZ threads (about 3,200 posts and comments, 20 to
// 22 Oct); the thread list is in docs/research/dmz-traits-meta/reddit-read.json.
export const traitTips = [
  { trait: 'possum', say: 'The most argued-about trait so far. Many players find it too strong in fights: a squad you wiped can stand back up, and a whole squad running it can come back more than once.', players: 8, threads: ['reddit-possum-seems-very-op-in', 'reddit-possum-is-garbage-and-needs', 'reddit-remove-the-possum-perk', 'reddit-the-most-obnoxious-trait-in', 'reddit-counter-the-possum-trait'] },
  { trait: 'possum', say: 'Players who use it say killers often loot and walk away or turn their back, which gives a clean chance to get up and leave. Solo players like it as a safety net.', players: 4, threads: ['reddit-i-love-possum', 'reddit-got-my-revenge-on-a', 'reddit-possum-seems-very-op-in'] },
  { trait: 'possum', say: 'Counter: after a kill, take or drop the player’s gun, armor and backpack away from the body, so a self-revive has nothing to fight with.', players: 3, threads: ['reddit-remove-the-possum-perk'] },
  { trait: 'possum', say: 'Counter: assume the body can get up. Pretend to leave, then watch it from cover or leave a trap on it.', players: 2, threads: ['reddit-remove-the-possum-perk'] },
  { trait: 'possum', say: 'A quick check: look at the dog tag when you loot. A low-level Operator is unlikely to have reached Possum yet.', players: 1, threads: ['reddit-remove-the-possum-perk'] },
  { trait: 'possum', say: 'Possum Pro from Prestige already includes Possum, so an Operator that rolls it does not need Possum from the tree.', players: 1, threads: ['reddit-those-of-you-who-have'] },
  { trait: 'possum', say: 'Bug report: on Switch, holding the button to get up did nothing, twice.', players: 1, threads: ['reddit-hold-button-to-revive-possum'] },
  { trait: 'die-hard', say: 'One player plans a Warfighter and Survivalist build to pair Possum with Die Hard’s endless bleed-out.', players: 1, threads: ['reddit-all-warfighter-traits'] },
  { trait: 'overwatch', say: 'Seen as too strong when paired with UAV Upgrade from the same tree: a squad can keep a town under a permanent Advanced UAV and wait for anyone who walks in.', players: 5, threads: ['reddit-overwatch-trait', 'reddit-the-most-obnoxious-trait-in', 'reddit-scout-uav-upgrade-towers'] },
  { trait: 'overwatch', say: 'Counter: a DDOS on the tower shuts it down so you can take it over.', players: 2, threads: ['reddit-the-most-obnoxious-trait-in', 'reddit-rework-possum-and-overwatch'] },
  { trait: 'overwatch', say: 'Bug report: a Toxic Intercept step that needs a UAV tower would not start because the tower was already switched on with Overwatch.', players: 1, threads: ['reddit-toxic-intercept-overwatch'] },
  { trait: 'uav-upgrade', say: 'Players are not sure it changes UAV towers; the trait text only talks about UAVs.', players: 2, threads: ['reddit-scout-uav-upgrade-towers', 'reddit-the-most-obnoxious-trait-in'] },
  { trait: 'thermal-padding', say: 'It does not make you invisible against enemies with UAV Upgrade: you still show on their UAV, only without the direction marker.', players: 2, threads: ['reddit-is-there-seriously-no-way', 'reddit-scout-uav-upgrade-towers'] },
  { trait: 'thermal-padding', say: 'For full stealth, players use the Sedative Inhaler, which takes you off the mini-map for about a minute.', players: 1, threads: ['reddit-is-there-seriously-no-way'] },
  { trait: 'field-crafting', say: 'One player uses it to craft anti-UAV gear while deployed instead of looting it first.', players: 1, threads: ['reddit-the-most-obnoxious-trait-in'] },
  { trait: 'equipment-professional', say: 'Keep at least one Lethal or Tactical in the slot: once both are used up it stops refilling, even with spares in the backpack. It can also stop mid-match.', players: 1, threads: ['reddit-has-anyone-else-noticed-the'] },
  { trait: 'free-revive', say: 'A player reads it as once per match, bringing you back to full health, where the Tourniquet gives about two thirds.', players: 1, threads: ['reddit-how-does-the-free-revive'] },
  { trait: 'fast-learner', say: 'Its small brain icon pops up every time it triggers, which some find distracting.', players: 1, threads: ['reddit-fast-learner-trait'] },
  { trait: 'viper-sense', say: 'One player calls it too strong.', players: 1, threads: ['reddit-how-to-savely-exfill'] },
]
export const tipsFor = id => traitTips.filter(tip => tip.trait === id)
