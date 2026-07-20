import { useState } from 'react'
import { AppBar, Box, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded'
import { EditorPage } from '../pages/EditorPage'
import { SettingsPage } from '../pages/SettingsPage'

/** Onglet (page) actuellement affiche. */
type Page = 'editor' | 'settings'

/**
 * Ossature de l'application : barre de titre, navigation entre l'editeur et la
 * page des parametres, et zone de contenu.
 *
 * La navigation est geree par un simple etat local (pas de routeur) : plus
 * leger et suffisant pour deux pages.
 */
export function AppLayout(): JSX.Element {
  const [page, setPage] = useState<Page>('editor')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          <LocalOfferRoundedIcon />
          <Typography variant="h6" sx={{ flexShrink: 0 }}>
            EtiqTool
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tabs
            value={page}
            onChange={(_event, value: Page) => setPage(value)}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab
              label="Éditeur"
              value="editor"
              icon={<GridViewRoundedIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab
              label="Paramètres"
              value="settings"
              icon={<SettingsRoundedIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* L'editeur reste monte en arriere-plan pour preserver l'apercu ;
            l'etat des etiquettes vit de toute facon dans le contexte applicatif. */}
        {page === 'editor' ? <EditorPage /> : <SettingsPage />}
      </Box>
    </Box>
  )
}
