const matches = (state, condition) => !condition || state[condition.field] === condition.value
export const groupVisible = (group, state) => matches(state, group.showWhen)
export const fieldLocked = (field, state) => field.readOnly === true || Boolean(field.lockedBy && state[field.lockedBy]) || Boolean(field.readOnlyWhen && matches(state, field.readOnlyWhen))
export function changeObservation(definition, state, id, value) {
  const field = definition.fields.find(item => item.id === id)
  if (!field || fieldLocked(field, state)) return state
  const next = { ...state, [id]: value }
  if (state[id] !== value) for (const rule of definition.invalidates || []) if (rule.field === id) for (const dependent of rule.fields) {
    const target = definition.fields.find(item => item.id === dependent)
    if (target) next[dependent] = target.type === 'check' ? false : ''
  }
  return next
}
export function clearScope(definition, state, scope) {
  const next = { ...state }
  const byId = new Map(definition.fields.map(field => [field.id, field]))
  if (matches(state, scope.preserveWhen)) for (const [source, target] of Object.entries(scope.preserveSnapshot || {})) if (byId.has(source) && byId.has(target)) next[target] = state[source]
  for (const id of scope.fields) if (byId.has(id)) next[id] = byId.get(id).type === 'check' ? false : ''
  return next
}
