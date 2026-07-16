import type { LabelSettings } from '../types'
import { DEFAULT_SETTINGS } from '../utils/constants'

/**
 * Service de gestion des parametres.
 *
 * Encapsule la communication avec le processus principal (persistance disque)
 * et garantit toujours un objet `LabelSettings` complet et valide au renderer.
 */

/** Cle -> borne minimale acceptee (mm). Empeche des valeurs incoherentes. */
const MIN_VALUES: Partial<Record<keyof LabelSettings, number>> = {
  labelWidth: 5,
  labelHeight: 5,
  columns: 1,
  rows: 1
}

/**
 * Fusionne des parametres partiels/inconnus avec les valeurs par defaut et
 * borne les valeurs numeriques pour rester exploitables.
 */
export function normalizeSettings(partial: Partial<LabelSettings> | null | undefined): LabelSettings {
  const merged: LabelSettings = { ...DEFAULT_SETTINGS, ...(partial ?? {}) }

  ;(Object.keys(merged) as Array<keyof LabelSettings>).forEach((key) => {
    const value = merged[key]
    const min = MIN_VALUES[key] ?? 0
    if (!Number.isFinite(value) || value < min) {
      merged[key] = Math.max(min, DEFAULT_SETTINGS[key])
    }
  })

  // Colonnes et rangees doivent etre des entiers.
  merged.columns = Math.round(merged.columns)
  merged.rows = Math.round(merged.rows)

  return merged
}

/** Charge les parametres persistes (ou les valeurs par defaut si aucun). */
export async function loadSettings(): Promise<LabelSettings> {
  const stored = await window.etiquettes.loadSettings()
  return normalizeSettings(stored)
}

/** Enregistre les parametres de facon persistante. */
export async function saveSettings(settings: LabelSettings): Promise<void> {
  await window.etiquettes.saveSettings(normalizeSettings(settings))
}
