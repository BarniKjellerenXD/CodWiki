import data from '../data/remainingReferences.json' with { type: 'json' }
export const mwzMilestoneGroups = data.mwRifts.map(rift => ({ id: String(rift.season), title: `Season ${rift.season} · ${rift.setting}`, fields: [{ id: `story-${rift.season}`, label: `${rift.story} story completed` }, { id: `portal-${rift.season}`, label: 'Personal repeatable portal unlocked' }, ...rift.schematics.map((name, index) => ({ id: `schematic-${rift.season}-${index}`, label: `${name} schematic extracted / owned` }))] }))
export const mwzMilestoneIds = mwzMilestoneGroups.flatMap(group => group.fields.map(field => field.id))
export const MWZ_MILESTONE_KEY = 'codwiki-mwz-milestones-v1'
export function normalizeMwzMilestones(raw) { return Object.fromEntries(mwzMilestoneIds.map(id => [id, raw?.[id] === true])) }
export function readMwzMilestones(raw) { try { const value = JSON.parse(raw); return normalizeMwzMilestones(value?.version === 1 ? value.observations : {}) } catch { return normalizeMwzMilestones({}) } }
