// The small quick-link index is loaded with the guide. Artwork, map data and the
// Leaflet component are loaded only when the Map view is first requested.
import type { MapDataset } from '~/types/map'

const mapLoaders = import.meta.glob<MapDataset>('../data/maps/*.json', { import: 'default' })

export function useGuideMap(mapId: string) {
  const data = shallowRef<MapDataset | null>(null)
  const loading = ref(false)
  const error = ref('')
  let pending: Promise<void> | null = null

  function load(): Promise<void> {
    if (data.value) return Promise.resolve()
    if (pending) return pending
    loading.value = true
    error.value = ''
    pending = (async () => {
      try {
        const loader = mapLoaders[`../data/maps/${mapId}.json`]
        if (!loader) throw new Error('Missing map')
        data.value = await loader()
      } catch {
        error.value = 'The map could not be loaded. Try again, or return to your guide.'
      } finally {
        loading.value = false
        pending = null
      }
    })()
    return pending
  }

  return { data, loading, error, load }
}
