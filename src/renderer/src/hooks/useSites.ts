import { useCallback, useEffect, useState } from 'react'
import type { Site } from '../types'
import { createSite, loadSites, saveSites as persistSites } from '../services/sitesService'

/** API exposee par le hook de gestion des sites. */
export interface UseSitesResult {
  /** Sites actuellement configures. */
  sites: Site[]
  /** `true` tant que la liste persistee n'a pas ete chargee. */
  loading: boolean
  /** Ajoute un site et persiste la liste mise a jour. */
  addSite: (name: string, prefix: string) => Promise<void>
  /** Supprime un site et persiste la liste mise a jour. */
  removeSite: (id: string) => Promise<void>
}

/** Hook de gestion des sites (nom + prefixe de nommage), persistes sur le disque. */
export function useSites(): UseSitesResult {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    loadSites()
      .then((loaded) => {
        if (active) setSites(loaded)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const addSite = useCallback(async (name: string, prefix: string) => {
    setSites((prev) => {
      const next = [...prev, createSite(name, prefix)]
      void persistSites(next)
      return next
    })
  }, [])

  const removeSite = useCallback(async (id: string) => {
    setSites((prev) => {
      const next = prev.filter((site) => site.id !== id)
      void persistSites(next)
      return next
    })
  }, [])

  return { sites, loading, addSite, removeSite }
}
