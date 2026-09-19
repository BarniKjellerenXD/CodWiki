import { emptyProgress, readProgress, ensureRun, resetRun, PROGRESS_KEY } from '~/utils/companion.mjs'

export function useProgress() {
  const progress = useState<any>('companion-progress', emptyProgress)
  const ready = useState('companion-ready', () => false)
  const saveError = useState('companion-save-error', () => false)
  function init() {
    if (ready.value || !import.meta.client) return
    try { progress.value = readProgress(localStorage.getItem(PROGRESS_KEY)) } catch {}
    ready.value = true
  }
  function save() {
    if (!ready.value) return
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value)); saveError.value = false } catch { saveError.value = true }
  }
  function run(id: string) { return ensureRun(progress.value, id) }
  function toggle(id: string, step: string) {
    const current = run(id)
    current.done = current.done.includes(step) ? current.done.filter((s: string) => s !== step) : [...current.done, step]
    save()
  }
  function visit(id: string, title: string, section: string, view?: string) {
    const current = run(id)
    current.section = section
    if (view) current.view = view
    progress.value.last = { route: `/guides/${id}`, title, section }
    save()
  }
  function reset(id: string) { resetRun(progress.value, id); save() }
  onMounted(init)
  return { progress, ready, saveError, init, save, run, toggle, visit, reset }
}
