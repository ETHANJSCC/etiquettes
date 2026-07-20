import { useCallback, useState } from 'react'
import type { ThemeMode } from '../theme'

const STORAGE_KEY = 'etiqtool:theme-mode'

/** Lit le mode enregistré (clair par défaut). */
function readStoredMode(): ThemeMode {
  return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

/** Gère le thème clair / sombre, conservé d'une session à l'autre. */
export function useThemeMode(): { mode: ThemeMode; setMode: (mode: ThemeMode) => void } {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  return { mode, setMode }
}
