import { useMemo } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createAppTheme } from './theme'
import { useSettings } from './hooks/useSettings'
import { useLabels } from './hooks/useLabels'
import { useThemeMode } from './hooks/useThemeMode'
import { useSites } from './hooks/useSites'
import { AppProvider, type AppContextValue } from './hooks/useAppContext'
import { AppLayout } from './components/AppLayout'

/**
 * Composant racine. Maintient l'état global (paramètres, étiquettes, thème,
 * sites) pour qu'il survive à la navigation entre les pages.
 */
export function App(): JSX.Element {
  const { settings, saveSettings, resetSettings } = useSettings()
  const labels = useLabels(settings.columns * settings.rows)
  const { mode, setMode } = useThemeMode()
  const sites = useSites()

  const theme = useMemo(() => createAppTheme(mode), [mode])

  const context: AppContextValue = {
    settings,
    saveSettings,
    resetSettings,
    labels,
    themeMode: mode,
    setThemeMode: setMode,
    sites
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider value={context}>
        <AppLayout />
      </AppProvider>
    </ThemeProvider>
  )
}
