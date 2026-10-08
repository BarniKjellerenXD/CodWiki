import data from '../data/remainingReferences.json' with { type: 'json' }
import { waiting, invalid, ready } from './remainingCore.mjs'
export function evaluateMW3(id, state, definition = {}) {
  if (id === 'mw3-rune-portals') {
    if (!state.mode) return waiting('Choose a lookup method.')
    let destination
    if (state.mode === 'Destination') destination = data.mwRunePortals.destinations.find(d => d.id === state.destination)
    else {
      const glyphs = [0, 1, 2].map(i => state[`glyph-${i}`])
      if (glyphs.some(g => !g)) return waiting('Record all three glyphs in shot order.')
      destination = data.mwRunePortals.destinations.find(d => d.glyphIds.every((g, i) => g === glyphs[i]))
      if (!destination) return invalid('No recorded exit matches that ordered triplet. Compare all three photographs and their order.')
    }
    if (!destination) return waiting('Choose a destination marker.')
    return ready([`Exit ${destination.grid} · ${destination.id}`, 'Shoot the full photographed plate from left to right at any entrance. Source entry cost: 1,000 Essence; check the current interaction prompt.'], 'Destination code', { images: definition.portalImages?.[destination.id] || [], destination: destination.id })
  }
  if (id === 'mw3-red-worm-usbs') {
    const drives = [0, 1, 2, 3].map(i => state[`drive-${i}`])
    const sites = [0, 1, 2, 3].map(i => state[`photo-${i}`])
    if (new Set(drives.filter(Boolean)).size !== drives.filter(Boolean).length) return invalid('Two records have the same USB identity. Read each carried item again.')
    if (new Set(sites.filter(Boolean)).size !== sites.filter(Boolean).length) return invalid('Two wall photos are matched to one site. Compare the clue photographs again.')
    const count = drives.filter((d, i) => data.redWorm.driveIdentities.includes(d) && sites[i] && state[`carried-${i}`]).length
    const missing = data.redWorm.driveIdentities.filter(d => !drives.some((value, i) => value === d && state[`carried-${i}`] && sites[i]))
    if (count !== 4) return { ...waiting(`${count}/4 different drives recorded and carried. Missing: ${missing.join(', ')}.`), lines: ['If a teammate carries a drive, agree who will insert it. Update this record after dropping or losing an item.'] }
    if (!state.arena || !state.caches) return waiting('All four drives carried. Find and record this deployment’s paired ammo caches and refractors.')
    return ready([`Arena: ${state.arena}`, 'Insert each drive into its matching refractor after the storm reaches this site. Check the in-game interaction and all squad members’ preparation before starting.'], 'Four drives and arena recorded')
  }
  if (id === 'mw3-dark-aether-reference') {
    if (!state.goal) return waiting('Choose your objective.')
    const rewardRift = data.mwRifts.find(r => r.schematics.includes(state.reward))
    const rift = rewardRift || data.mwRifts.find(r => String(r.season) === state.season)
    if (!rift) return waiting('Choose a season or desired schematic.')
    if (state.goal === 'Blueprint' && ![3, 5].includes(rift.season)) return invalid('This reference covers Smoke Signals in Season 3 and Infinite Cosmos in Season 5. Choose that destination.')
    const branch = { Story: 'story', 'First portal unlock': 'unlock', Acquisitions: 'ordinary', Schematics: 'elder', Blueprint: rift.season === 5 ? 'elder' : 'ordinary' }[state.goal]
    const lines = [`Season ${rift.season} · ${rift.setting} · ${rift.story}`]
    if (state.goal === 'Story') lines.push(`Use the ${rift.story} mission portal. Story completion awards gold ${rift.goldAtStoryEnd}; it is separate from the repeatable Sigil contract run.`)
    if (state.goal === 'First portal unlock') lines.push(`Collect and upgrade: ${rift.relics.join(', ')}. Offer all four gold relics at the matching Urzikstan pedestals, then defeat the gate guardian.`)
    if (state.goal === 'Acquisitions' || state.goal === 'Schematics') lines.push(state.goal === 'Schematics' ? 'Elder Sigil · source timer 15 minutes. Read the current portal prompt.' : 'Triangular Sigil · source timer 30 minutes. Read the current portal prompt.', `Schematic set: ${rift.schematics.join(', ')}. ${rift.season === 1 ? 'Season 1 rewards progress through completed contracts.' : 'Later-season rewards can repeat; missing schematics are not guaranteed in one run.'}`, 'An acquisition is a consumable item; an exfiled schematic unlocks crafting. An old ordinary-entry waiver is not a permanent rule.')
    if (state.goal === 'Blueprint') lines.push(rift.season === 5 ? 'Infinite Cosmos STG44 · Elder only. Finish the hidden IT Thumb Drive / Maintenance Key route and Entity’s Echo encounter.' : 'Smoke Signals RAM-7 · ordinary or Elder. Complete the three contracts, then the Rift Heart and Gyanxi route.')
    return ready(lines, 'Entry and reward reference', { links: [{ href: `/guides/${rift.mapId}?branch=${branch}`, label: `Open ${state.goal.toLowerCase()} steps` }] })
  }
  if (id === 'mw3-union-runes') {
    const lines = []
    for (const crystal of ['a', 'b']) {
      const runes = [0, 1, 2].map(i => state[`${crystal}-rune-${i}`])
      if (state[`${crystal}-done`] && runes.some(r => !r)) return invalid(`Crystal ${crystal.toUpperCase()} is marked complete but its three observations are incomplete.`)
      lines.push(`Crystal ${crystal.toUpperCase()}: ${runes.map((r, i) => r ? `${i + 1}. ${r}${state[`${crystal}-place-${i}`] ? ` at ${state[`${crystal}-place-${i}`]}` : ''}` : `${i + 1}. unrecorded`).join(' → ')}${state[`${crystal}-done`] ? ' · broken / accepted' : ''}`)
    }
    return (state['a-done'] && state['b-done']) ? ready(lines, 'Both crystals confirmed') : { ...waiting('Find and shoot each crystal’s matching wall runes in recorded order; mark complete only after the crystal breaks.'), lines }
  }
  return null
}
