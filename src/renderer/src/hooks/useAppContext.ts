import { createContext, useContext } from 'react'
import type { LabelSettings } from '../types'
import type { ThemeMode } from '../theme'
import type { UseLabelsResult } from './useLabels'

/** État global partagé entre les pages (survit à la navigation). */
export interface AppContextValue {
  settings: LabelSettings
  saveSettings: (settings: LabelSettings) => Promise<void>
  resetSettings: () => Promise<void>
  labels: UseLabelsResult
  /** Thème clair / sombre. */
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

const AppContext = createContext<AppContextValue | null>(null)

/** Fournisseur du contexte applicatif (a placer a la racine de l'application). */
export const AppProvider = AppContext.Provider

/** Accede au contexte applicatif. Doit etre utilise sous `<AppProvider>`. */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext doit être utilisé à l’intérieur de <AppProvider>.')
  }
  return context
}
