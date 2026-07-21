import { app } from 'electron'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { Site } from '@shared/types'

/** Chemin absolu du fichier de sites. */
function sitesFilePath(): string {
  return join(app.getPath('userData'), 'etiqtool-sites.json')
}

/** Lit la liste des sites persistee, ou un tableau vide si aucune. */
export async function readSites(): Promise<Site[]> {
  try {
    const raw = await fs.readFile(sitesFilePath(), 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Site[]) : []
  } catch {
    return []
  }
}

/** Ecrit la liste des sites sur le disque (creation ou remplacement). */
export async function writeSites(sites: Site[]): Promise<void> {
  await fs.writeFile(sitesFilePath(), JSON.stringify(sites, null, 2), 'utf-8')
}
