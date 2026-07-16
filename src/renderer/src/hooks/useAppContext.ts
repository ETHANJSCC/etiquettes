import { useOutletContext } from 'react-router-dom'
import type { LabelSettings } from '../types'
import type { UseLabelsResult } from './useLabels'

/**
 * Contexte applicatif partage entre les pages via le systeme de routage.
 *
 * L'etat des etiquettes et les parametres sont maintenus au niveau racine
 * (App) afin de survivre a la navigation entre l'editeur et les parametres.
 */
export interface AppContext {
  /** Parametres geometriques actifs. */
  settings: LabelSettings
  /** Persiste un nouveau jeu de parametres. */
  saveSettings: (settings: LabelSettings) => Promise<void>
  /** Restaure les parametres par defaut. */
  resetSettings: () => Promise<void>
  /** Etat et actions des etiquettes. */
  labels: UseLabelsResult
}

/** Accede au contexte applicatif typiquement fourni par `<Outlet context=... />`. */
export function useAppContext(): AppContext {
  return useOutletContext<AppContext>()
}
