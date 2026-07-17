import { app } from 'electron'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { StoredSettings } from '@shared/types'

/**
 * Persistance simple des parametres sous forme de fichier JSON dans le
 * repertoire utilisateur de l'application (`userData`).
 *
 * On evite volontairement toute dependance externe (electron-store) pour
 * garder le projet leger et sans module natif a recompiler sous Windows.
 */

/** Chemin absolu du fichier de configuration. */
function settingsFilePath(): string {
  return join(app.getPath('userData'), 'etiquettes-settings.json')
}

/** Lit les parametres persistes, ou `null` si le fichier n'existe pas / est illisible. */
export async function readSettings(): Promise<StoredSettings | null> {
  try {
    const raw = await fs.readFile(settingsFilePath(), 'utf-8')
    return JSON.parse(raw) as StoredSettings
  } catch {
    return null
  }
}

/** Ecrit les parametres sur le disque (creation ou remplacement). */
export async function writeSettings(settings: StoredSettings): Promise<void> {
  const path = settingsFilePath()
  await fs.writeFile(path, JSON.stringify(settings, null, 2), 'utf-8')
}
