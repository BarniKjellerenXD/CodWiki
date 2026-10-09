export interface MapSource {
  name: string
  url: string
  note?: string
}

export interface MapLayer {
  id: string
  label: string
  image: string
  width: number
  height: number
  note?: string
  /** Optional top-left / bottom-right normalized viewport for a shared atlas. */
  focusBounds?: [[number, number], [number, number]]
}

export interface MapLocation {
  id: string
  label: string
  layerId: string
  /** Normalized coordinates measured from the artwork's top-left corner. */
  x: number
  y: number
  category: string
  /** Optional grid reference and inclusion in the quiet overview. */
  grid?: string
  overview?: boolean
  perkType?: 'machine' | 'mister-peeks'
  precision: 'point' | 'area'
  /** Approximate area radius as a fraction of the shorter artwork dimension. */
  areaRadius?: number
  description: string
  source?: string
  floor?: string
  state?: string
}

export interface MapTarget {
  id: string
  title: string
  locationIds: string[]
  kind?: 'single' | 'candidates' | 'sequence' | 'area'
  description?: string
  guideAnchor?: string
}

export interface MapDataset {
  id: string
  name: string
  defaultLayer: string
  grid?: { columns: string[]; rows: string[] }
  sources: MapSource[]
  layers: MapLayer[]
  locations: MapLocation[]
  targets: MapTarget[]
  quickLinks: Record<string, string>
}

export type GuideMapData = MapDataset
