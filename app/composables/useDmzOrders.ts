import { DMZ_ORDERS_KEY, normalizeDmzOrders, readDmzOrders } from '#shared/dmz.mjs'

type DmzOrderState = { counts: Record<string, number>, collapsed: Record<string, boolean> }

// DMZ progress persists between matches, separately from Zombies runs.
export function useDmzOrders() {
  const state = useState<DmzOrderState>('dmz-orders-v1', () => normalizeDmzOrders({}))
  const ready = useState('dmz-orders-ready', () => false)
  const saveError = useState('dmz-orders-save-error', () => false)
  onMounted(() => {
    if (ready.value) return
    try { state.value = readDmzOrders(localStorage.getItem(DMZ_ORDERS_KEY)) } catch {}
    ready.value = true
  })
  function save(next: DmzOrderState) {
    state.value = normalizeDmzOrders(next)
    if (!ready.value) return
    try { localStorage.setItem(DMZ_ORDERS_KEY, JSON.stringify({ version: 1, ...state.value })); saveError.value = false } catch { saveError.value = true }
  }
  const setCount = (id: string, value: number) => save({ ...state.value, counts: { ...state.value.counts, [id]: value } })
  const setCollapsed = (id: string, value: boolean) => save({ ...state.value, collapsed: { ...state.value.collapsed, [id]: value } })
  const reset = () => save({ counts: {}, collapsed: {} })
  return { state, ready, saveError, setCount, setCollapsed, reset }
}
