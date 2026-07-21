import type { Site } from '../types'

/** Charge la liste des sites persistee. */
export async function loadSites(): Promise<Site[]> {
  return window.etiquettes.loadSites()
}

/** Enregistre la liste des sites de facon persistante. */
export async function saveSites(sites: Site[]): Promise<void> {
  await window.etiquettes.saveSites(sites)
}

/** Cree un nouveau site (id genere localement). */
export function createSite(name: string, prefix: string): Site {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    prefix: prefix.trim().toUpperCase()
  }
}

/** Un prefixe de site valide : lettres et chiffres uniquement, 1 a 10 caracteres. */
export function isValidSitePrefix(prefix: string): boolean {
  return /^[A-Z0-9]{1,10}$/.test(prefix.trim().toUpperCase())
}
