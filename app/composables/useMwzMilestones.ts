import { MWZ_MILESTONE_KEY, normalizeMwzMilestones, readMwzMilestones } from '~/utils/mwzMilestones.mjs'
export function useMwzMilestones() {
  const state = useState<Record<string, boolean>>('mwz-milestones-v1', () => normalizeMwzMilestones({}))
  const ready = useState('mwz-milestones-ready', () => false)
  const saveError = useState('mwz-milestones-save-error', () => false)
  onMounted(() => { if (ready.value) return; try { state.value = readMwzMilestones(localStorage.getItem(MWZ_MILESTONE_KEY)) } catch {} ready.value = true })
  function change(id: string, value: boolean) {
    state.value = normalizeMwzMilestones({ ...state.value, [id]: value })
    if (!ready.value) return
    try { localStorage.setItem(MWZ_MILESTONE_KEY, JSON.stringify({ version: 1, observations: state.value })); saveError.value = false } catch { saveError.value = true }
  }
  return { state, change, saveError }
}
