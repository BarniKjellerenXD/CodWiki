import { sanitizePuzzleState, migratePuzzleState, legacyPuzzleKeys } from '~/utils/puzzleState.mjs'

// Shared within this Nuxt app (including inline/full-page helpers), isolated per SSR request.
export function usePuzzleState(id: string) {
  const version = ['rings', 'murder'].includes(id) ? 3 : 2
  const state = useState<any>(`puzzle-${id}-v${version}`, () => sanitizePuzzleState(id, {}))
  const ready = useState(`puzzle-${id}-ready`, () => false)
  const history = useState<any[]>(`puzzle-${id}-history`, () => [])
  const saveError = useState(`puzzle-${id}-save-error`, () => false)
  const legacyNotice = useState(`puzzle-${id}-legacy-notice`, () => '')
  const key = `codwiki-puzzle-${id}-v${version}`
  onMounted(() => {
    if (ready.value) return
    try {
      const stored=localStorage.getItem(key) || (version === 3 ? localStorage.getItem(`codwiki-puzzle-${id}-v2`) : null)
      if(stored) state.value=sanitizePuzzleState(id,JSON.parse(stored))
      else {
        const oldId=(legacyPuzzleKeys as Record<string,string>)[id]
        const old=oldId?localStorage.getItem(`codwiki-tool-${oldId}-v1`):null
        if(old) {
          const migrated=migratePuzzleState(id,JSON.parse(old))
          if(migrated) state.value=migrated
          else legacyNotice.value='This helper has changed. Record the current clues again; your older saved input has been kept separately.'
        }
      }
    } catch {}
    ready.value = true
  })
  watch(state, value => {
    if (!ready.value) return
    try { localStorage.setItem(key, JSON.stringify(value)); saveError.value = false } catch { saveError.value = true }
  }, { deep: true })
  function change(next: any) {
    history.value = [...history.value.slice(-29), JSON.parse(JSON.stringify(state.value))]
    legacyNotice.value = ''
    state.value = sanitizePuzzleState(id, next)
  }
  function undo() { const previous = history.value.at(-1); if (previous) { state.value = previous; history.value = history.value.slice(0,-1) } }
  function reset() { change({}) }
  return { state, change, undo, reset, canUndo: computed(() => history.value.length > 0), saveError }
}
