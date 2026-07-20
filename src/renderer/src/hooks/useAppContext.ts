import { createContext, useContext } from 'react'
import type { LabelSettings } from '../types'
import type { UseLabelsResult } from './useLabels'

/**
 * Contexte applicatif partage entre les pages.
 *
 * L'etat des etiquettes et les parametres sont maintenus au niveau racine
 * (App) afin de survivre a la navigation entre l'editeur et les parametres.
 */
export interface AppContextValue {
  /** Parametres geometriques actifs. */
  settings: LabelSettings
  /** Persiste un nouveau jeu de parametres. */
  saveSettings: (settings: LabelSettings) => Promise<void>
  /** Restaure les parametres par defaut. */
  resetSettings: () => Promise<void>
  /** Etat et actions des etiquettes. */
  labels: UseLabelsResult
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
