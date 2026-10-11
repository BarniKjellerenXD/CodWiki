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
  /** Reviewed physical identity, independent of activity membership. */
  typeId?: string
  activityIds?: string[]
  itemId?: string
  availability?: 'fixed' | 'candidate' | 'conditional' | 'unknown'
  conditions?: string
  /** Optional grid reference and inclusion in the quiet overview. */
  grid?: string
  overview?: boolean
  perkType?: 'machine' | 'mister-peeks'
  precision: 'point' | 'area'
  /** Approximate area radius as a fraction of the shorter artwork dimension. */
  areaRadius?: number
  description: string
  source?: string
  /** Original provider identity retained independently from the safe URL ID. */
  sourceId?: string
  floor?: string
  state?: string
  /** Logical rooms and, when known, specific landing footprints on a cutaway. */
  roomIds?: string[]
  footprintIds?: string[]
}

export interface MapCutaway {
  kind: 'ship'
  defaultFootprint: string
  levels: { id: string; index: number; label: string }[]
  rooms: { id: string; label: string; shortLabel: string }[]
  /** Longitudinal regions; overlaps use lanes, not invented port/starboard geometry. */
  footprints: { id: string; roomId: string; levelId: string; start: number; end: number; lane: number; label?: string }[]
  connections: {
    id: string
    from: string[]
    to: string[]
    kind: 'stairs' | 'descent' | 'route' | 'portal'
    direction: 'both' | 'forward'
    label: string
    note: string
    source: string
    /** A regional route can pass through rooms omitted from this diagram. */
    precision: 'regional' | 'level'
    arrival: 'level' | 'room'
    cost?: number
  }[]
}

export interface MapTarget {
  id: string
  title: string
  locationIds: string[]
  kind?: 'single' | 'candidates' | 'sequence' | 'area' | 'photo-match'
  description?: string
  guideAnchor?: string
  guideId?: string
}

export interface MapFilter {
  id: string
  label: string
  locationIds: string[]
  note?: string
}

export interface MapFilterGroup {
  id: string
  label: string
  defaultFilter: string
  filters: MapFilter[]
}

export interface ReferenceCrop {
  x: number
  y: number
  width: number
  height: number
  sourceWidth: number
  sourceHeight: number
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
  cutaway?: MapCutaway
  /** Authored activity sets; their leaves can be combined with physical types. */
  filterGroups?: MapFilterGroup[]
  coverage?: { kind: 'essentials' | 'guide-linked' | 'schematic'; note: string }
  /** Additional quick-link bindings for child guides sharing this dataset. */
  guideQuickLinks?: Record<string, Record<string, string>>
}

export type GuideMapData = MapDataset
