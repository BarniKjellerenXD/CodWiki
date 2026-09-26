/** Map hashes share the guide's existing anchor namespace. */
export function decodeGuideHash(hash = '') {
  try { return decodeURIComponent(String(hash).replace(/^#/, '')) } catch { return '' }
}

export function mapTargetFromAnchor(anchor) {
  if (anchor === 'map') return ''
  if (typeof anchor === 'string' && /^map:[a-z0-9-]+$/.test(anchor)) return anchor.slice(4)
  return null
}

export function mapAnchor(target = '') {
  return typeof target === 'string' && /^[a-z0-9-]+$/.test(target) ? `map:${target}` : 'map'
}

export function phaseForAnchor(phases, anchor, precedingHeadings = []) {
  const direct = phases.find(phase => phase.detail === anchor || phase.legacy === anchor || `quick-${phase.id}` === anchor ||
    phase.steps.some(step => `quick-step-${step.id}` === anchor))
  if (direct) return direct
  // An individual full-guide step belongs to its nearest mapped section.
  // Stop at the chapter boundary so a side quest cannot inherit the final
  // main-quest phase simply because it appears later in the document.
  for (const heading of [...precedingHeadings].reverse()) {
    const phase = phases.find(phase => phase.detail === heading.id || phase.legacy === heading.id)
    if (phase) return phase
    if (heading.level === 1) break
  }
}

export function readerView(value) { return value === 'full' ? 'full' : 'quick' }

export function readReaderContext(run) {
  const saved = run?.reader
  if (saved && ['quick', 'full'].includes(saved.view) && typeof saved.section === 'string' && !saved.section.startsWith('map:') && saved.section !== 'map') {
    return { view: saved.view, section: saved.section }
  }
  return { view: readerView(run?.view), section: typeof run?.section === 'string' && !run.section.startsWith('map:') && run.section !== 'map' ? run.section : '' }
}
