import { useCallback, useEffect, useState } from 'react'
import type { LabelSettings } from '../types'
import { DEFAULT_SETTINGS } from '../utils/constants'
import { loadSettings, saveSettings as persistSettings } from '../services/settingsService'

/** API exposee par le hook de gestion des parametres. */
export interface UseSettingsResult {
  /** Parametres actuellement actifs. */
  settings: LabelSettings
  /** `true` tant que les parametres persistes n'ont pas ete charges. */
  loading: boolean
  /** Applique et persiste un nouveau jeu de parametres. */
  saveSettings: (next: LabelSettings) => Promise<void>
  /** Restaure et persiste les parametres par defaut (fideles au modele Word). */
  resetSettings: () => Promise<void>
}

/**
 * Hook de gestion des parametres geometriques de la planche.
 *
 * Charge les parametres persistes au montage puis expose des fonctions pour
 * les mettre a jour de facon durable (disque via le processus principal).
 */
export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<LabelSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    loadSettings()
      .then((loaded) => {
        if (active) setSettings(loaded)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const saveSettings = useCallback(async (next: LabelSettings) => {
    setSettings(next)
    await persistSettings(next)
  }, [])

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS)
    await persistSettings(DEFAULT_SETTINGS)
  }, [])

  return { settings, loading, saveSettings, resetSettings }
}
