import { createTheme } from '@mui/material/styles'

/**
 * Theme Material UI de l'application.
 *
 * Parti pris volontairement sobre et professionnel : palette neutre (gris
 * ardoise) rehaussee d'un unique accent, typographie lisible, angles doux.
 * Adapte a un usage quotidien par un technicien du support informatique.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#37474f', light: '#62727b', dark: '#102027', contrastText: '#ffffff' },
    secondary: { main: '#b71c1c', contrastText: '#ffffff' },
    background: { default: '#eef1f4', paper: '#ffffff' },
    text: { primary: '#1c2529', secondary: '#5b6b74' }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ['"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTooltip: { defaultProps: { arrow: true } }
  }
})
