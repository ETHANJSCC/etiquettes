import { CssBaseline, ThemeProvider } from '@mui/material'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { theme } from './theme'
import { useSettings } from './hooks/useSettings'
import { useLabels } from './hooks/useLabels'
import type { AppContext } from './hooks/useAppContext'
import { AppLayout } from './components/AppLayout'
import { EditorPage } from './pages/EditorPage'
import { SettingsPage } from './pages/SettingsPage'

/**
 * Composant racine de l'application.
 *
 * Maintient l'etat global (parametres + etiquettes) au niveau le plus haut
 * afin qu'il survive a la navigation entre l'editeur et les parametres, puis
 * le transmet aux pages via le contexte du routeur.
 */
export function App(): JSX.Element {
  const { settings, saveSettings, resetSettings } = useSettings()
  const labels = useLabels(settings.columns * settings.rows)

  const context: AppContext = { settings, saveSettings, resetSettings, labels }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          <Route element={<AppLayout ctx={context} />}>
            <Route index element={<EditorPage />} />
            <Route path="parametres" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}
