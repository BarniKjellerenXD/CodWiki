import { TRAIT_BUILD_KEY, normalizeBuild, readBuild, emptyBuild, pickInBuild, buildFromQuery, buildSpent } from '#shared/dmz-traits.mjs'

type TraitBuild = Record<string, string>

// The planned trait build stays in this browser, like the trackers. A build in
// the URL (a shared link) is shown instead until the visitor changes it.
export function useDmzTraits() {
  const route = useRoute()
  const build = useState<TraitBuild>('dmz-traits-v1', () => emptyBuild())
  const ready = useState('dmz-traits-ready', () => false)
  const shared = useState('dmz-traits-shared', () => false)
  const saveError = useState('dmz-traits-save-error', () => false)
  onMounted(() => {
    if (ready.value) return
    const fromLink = buildFromQuery(route.query)
    if (buildSpent(fromLink)) { build.value = fromLink; shared.value = true }
    else { try { build.value = readBuild(localStorage.getItem(TRAIT_BUILD_KEY)) } catch {} }
    ready.value = true
  })
  function save(next: TraitBuild) {
    build.value = normalizeBuild(next)
    shared.value = false
    if (!ready.value) return
    try { localStorage.setItem(TRAIT_BUILD_KEY, JSON.stringify({ version: 1, ...build.value })); saveError.value = false } catch { saveError.value = true }
  }
  const pick = (tree: string, row: number, letter: string) => save(pickInBuild(build.value, tree, row, letter))
  const reset = (tree?: string) => save(tree ? { ...build.value, [tree]: '' } : emptyBuild())
  const spent = computed(() => buildSpent(build.value))
  return { build, ready, shared, saveError, pick, reset, save, spent }
}
