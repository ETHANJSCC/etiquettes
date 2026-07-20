import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from './theme'
import { useSettings } from './hooks/useSettings'
import { useLabels } from './hooks/useLabels'
import { AppProvider, type AppContextValue } from './hooks/useAppContext'
import { AppLayout } from './components/AppLayout'

/**
 * Composant racine de l'application.
 *
 * Maintient l'etat global (parametres + etiquettes) au niveau le plus haut
 * afin qu'il survive a la navigation entre l'editeur et les parametres, puis
 * le transmet aux pages via le contexte applicatif.
 */
export function App(): JSX.Element {
  const { settings, saveSettings, resetSettings } = useSettings()
  const labels = useLabels(settings.columns * settings.rows)

  const context: AppContextValue = { settings, saveSettings, resetSettings, labels }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider value={context}>
        <AppLayout />
      </AppProvider>
    </ThemeProvider>
  )
}
