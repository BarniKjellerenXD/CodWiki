export const visibleGuidePhases = (phases, branch) => phases.filter(phase => !phase.branches?.length || phase.branches.includes(branch))
export function branchForGuideAnchor(phases, anchor, branch) {
  const phase = phases.find(phase => anchor === `quick-${phase.id}` || anchor === phase.detail || phase.steps.some(step => anchor === `quick-step-${step.id}` || anchor === `guide-step-${step.id}`))
  return phase?.branches?.length && !phase.branches.includes(branch) ? phase.branches[0] : branch
}
