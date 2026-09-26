export type ThemeId = 'archive' | 'midnight' | 'forest' | 'ember' | 'paper'
export type FontScale = 'compact' | 'default' | 'relaxed'

export interface ThemeDef {
  id: ThemeId
  name: string
  description: string
  swatch: string
  scheme: 'dark' | 'light'
}

export const THEMES: ThemeDef[] = [
  { id: 'archive', name: 'Archive', description: 'Charcoal & warm gold', swatch: '#ddb363', scheme: 'dark' },
  { id: 'midnight', name: 'Midnight', description: 'Cool blue graphite', swatch: '#5aa6e0', scheme: 'dark' },
  { id: 'forest', name: 'Forest', description: 'Deep moss & amber', swatch: '#c9a94a', scheme: 'dark' },
  { id: 'ember', name: 'Ember', description: 'Dark maroon & copper', swatch: '#e08a4c', scheme: 'dark' },
  { id: 'paper', name: 'Paper', description: 'Light parchment', swatch: '#ad7f22', scheme: 'light' },
]

const STORAGE_KEY = 'codwiki-settings'

interface SettingsState {
  theme: ThemeId
  fontScale: FontScale
}

const state = reactive<SettingsState>({
  theme: 'archive',
  fontScale: 'default',
})

function applyTheme() {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = state.theme
  document.documentElement.dataset.font = state.fontScale
}

function persist() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useSettings() {
  function setTheme(id: ThemeId) {
    state.theme = id
    persist()
    applyTheme()
  }

  function setFontScale(scale: FontScale) {
    state.fontScale = scale
    persist()
    applyTheme()
  }

  function init() {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          if (saved.theme) state.theme = saved.theme
          if (saved.fontScale) state.fontScale = saved.fontScale
        }
      } catch {}
    }
    applyTheme()
  }

  return { state, themes: THEMES, setTheme, setFontScale, init }
}
