import type { InjectionKey } from 'vue'

export interface GuideMapNavigation {
  open: (target: string, source?: HTMLElement) => void
}

export const GUIDE_MAP_NAVIGATION: InjectionKey<GuideMapNavigation> = Symbol('guide-map-navigation')
