import { DMZ_GUIDE_KEY, normalizeGuideProgress, readGuideProgress } from '#shared/dmz-guide.mjs'

type DmzGuideProgress = { done: string[], tier: string }

// Ticked guide steps stay in this browser, like the trackers.
export function useDmzGuide() {
  const state = useState<DmzGuideProgress>('dmz-guide-v1', () => normalizeGuideProgress({}))
  const ready = useState('dmz-guide-ready', () => false)
  const saveError = useState('dmz-guide-save-error', () => false)
  onMounted(() => {
    if (ready.value) return
    try { state.value = readGuideProgress(localStorage.getItem(DMZ_GUIDE_KEY)) } catch {}
    ready.value = true
  })
  function save(next: DmzGuideProgress) {
    state.value = normalizeGuideProgress(next)
    if (!ready.value) return
    try { localStorage.setItem(DMZ_GUIDE_KEY, JSON.stringify({ version: 1, ...state.value })); saveError.value = false } catch { saveError.value = true }
  }
  const isDone = (tier: string, step: string) => state.value.done.includes(`${tier}:${step}`)
  const toggle = (tier: string, step: string) => {
    const key = `${tier}:${step}`
    save({ ...state.value, done: isDone(tier, step) ? state.value.done.filter(item => item !== key) : [...state.value.done, key] })
  }
  const doneIn = (tier: string) => state.value.done.filter(key => key.startsWith(`${tier}:`)).length
  const clear = (tier: string) => save({ ...state.value, done: state.value.done.filter(key => !key.startsWith(`${tier}:`)) })
  const remember = (tier: string) => save({ ...state.value, tier })
  return { state, ready, saveError, isDone, toggle, doneIn, clear, remember }
}
