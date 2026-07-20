import { useEffect, useState } from 'react'

/**
 * Recupere la version de l'application (celle de `package.json`, deja
 * utilisee par electron-builder pour nommer les executables generes).
 *
 * Utile lors d'un deploiement a plusieurs postes : le support peut demander
 * « quelle version as-tu ? » et la comparer a la derniere diffusee.
 */
export function useAppVersion(): string {
  const [version, setVersion] = useState('')

  useEffect(() => {
    let active = true
    window.etiquettes
      .getAppVersion()
      .then((v) => {
        if (active) setVersion(v)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  return version
}
