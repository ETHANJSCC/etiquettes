import { AppBar, Box, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { AppContext } from '../hooks/useAppContext'

export interface AppLayoutProps {
  /** Contexte applicatif transmis aux pages via l'Outlet. */
  ctx: AppContext
}

/**
 * Ossature de l'application : barre de titre, navigation entre l'editeur et la
 * page des parametres, et zone de contenu (Outlet du routeur).
 */
export function AppLayout({ ctx }: AppLayoutProps): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = location.pathname.startsWith('/parametres') ? '/parametres' : '/'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          <LocalOfferRoundedIcon />
          <Typography variant="h6" sx={{ flexShrink: 0 }}>
            Étiquettes Inventaire
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tabs
            value={currentTab}
            onChange={(_event, value: string) => navigate(value)}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab
              label="Éditeur"
              value="/"
              icon={<GridViewRoundedIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab
              label="Paramètres"
              value="/parametres"
              icon={<SettingsRoundedIcon />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        <Outlet context={ctx} />
      </Box>
    </Box>
  )
}
