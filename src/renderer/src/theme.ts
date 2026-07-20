import { createTheme, type Theme } from '@mui/material/styles'

export type ThemeMode = 'light' | 'dark'

/** Construit le thème Material UI pour le mode clair ou sombre. */
export function createAppTheme(mode: ThemeMode): Theme {
  const dark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: dark
        ? { main: '#5f7d8c', light: '#8ba3af', dark: '#3a4b54', contrastText: '#ffffff' }
        : { main: '#37474f', light: '#62727b', dark: '#102027', contrastText: '#ffffff' },
      secondary: { main: dark ? '#ef5350' : '#b71c1c', contrastText: '#ffffff' },
      background: dark
        ? { default: '#12171b', paper: '#1b2228' }
        : { default: '#eef1f4', paper: '#ffffff' },
      text: dark
        ? { primary: '#e6ebee', secondary: '#9fb0b9' }
        : { primary: '#1c2529', secondary: '#5b6b74' },
      divider: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
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
}
