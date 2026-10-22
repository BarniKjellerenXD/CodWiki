import { DMZ_PRINTER_KEY, PRINT_MAX, normalizePrinterPlan, readPrinterPlan } from '#shared/dmz-stations.mjs'

type DmzPrinterPlan = { plan: Record<string, number> }

// The 3D Printer plan (recipe id → prints) stays in this browser, like the trackers.
export function useDmzPrinter() {
  const state = useState<DmzPrinterPlan>('dmz-printer-v1', () => normalizePrinterPlan({}))
  const ready = useState('dmz-printer-ready', () => false)
  const saveError = useState('dmz-printer-save-error', () => false)
  onMounted(() => {
    if (ready.value) return
    try { state.value = readPrinterPlan(localStorage.getItem(DMZ_PRINTER_KEY)) } catch {}
    ready.value = true
  })
  function save(next: DmzPrinterPlan) {
    state.value = normalizePrinterPlan(next)
    if (!ready.value) return
    try { localStorage.setItem(DMZ_PRINTER_KEY, JSON.stringify({ version: 1, ...state.value })); saveError.value = false } catch { saveError.value = true }
  }
  const prints = (id: string) => state.value.plan[id] || 0
  const change = (id: string, delta: number) => save({ plan: { ...state.value.plan, [id]: Math.max(0, Math.min(PRINT_MAX, prints(id) + delta)) } })
  const clear = () => save({ plan: {} })
  return { state, ready, saveError, prints, change, clear }
}
