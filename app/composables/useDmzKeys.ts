import { DMZ_KEYS_KEY, normalizeDmzKeys, readDmzKeys } from '#shared/dmz-keys.mjs'

type DmzKeyState = { marks: Record<string, 'held' | 'used'> }

// Key marks persist between matches, apart from Zombies runs and DMZ Orders.
export function useDmzKeys() {
  const state = useState<DmzKeyState>('dmz-keys-v1', () => normalizeDmzKeys({}))
  const ready = useState('dmz-keys-ready', () => false)
  const saveError = useState('dmz-keys-save-error', () => false)
  onMounted(() => {
    if (ready.value) return
    try { state.value = readDmzKeys(localStorage.getItem(DMZ_KEYS_KEY)) } catch {}
    ready.value = true
  })
  function save(next: DmzKeyState) {
    state.value = normalizeDmzKeys(next)
    if (!ready.value) return
    try { localStorage.setItem(DMZ_KEYS_KEY, JSON.stringify({ version: 1, ...state.value })); saveError.value = false } catch { saveError.value = true }
  }
  // Setting a key's current mark again clears it.
  function setMark(id: string, mark: 'held' | 'used') {
    const { [id]: current, ...rest } = state.value.marks
    save({ marks: current === mark ? rest : { ...rest, [id]: mark } })
  }
  const reset = () => save({ marks: {} })
  return { state, ready, saveError, setMark, reset }
}
