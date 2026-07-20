import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography
} from '@mui/material'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import UndoRoundedIcon from '@mui/icons-material/UndoRounded'
import type { LabelSettings } from '../types'
import { DEFAULT_SETTINGS } from '../utils/constants'
import { useAppContext } from '../hooks/useAppContext'
import { useAppVersion } from '../hooks/useAppVersion'
import { NumberField } from '../components/NumberField'
import { LabelSheet } from '../components/LabelSheet'

/** Champ editable de la page (une cle numerique des parametres + son libelle). */
interface FieldDef {
  key: keyof LabelSettings
  label: string
}

/** Groupes de champs, definis de facon declarative pour eviter la duplication. */
const GROUPS: ReadonlyArray<{ title: string; fields: ReadonlyArray<FieldDef> }> = [
  {
    title: 'Marges de la feuille',
    fields: [
      { key: 'marginTop', label: 'Marge haute' },
      { key: 'marginBottom', label: 'Marge basse' },
      { key: 'marginLeft', label: 'Marge gauche' },
      { key: 'marginRight', label: 'Marge droite' }
    ]
  },
  {
    title: 'Espacement entre étiquettes',
    fields: [
      { key: 'gapX', label: 'Espacement horizontal' },
      { key: 'gapY', label: 'Espacement vertical' }
    ]
  },
  {
    title: 'Dimensions des étiquettes',
    fields: [
      { key: 'labelWidth', label: 'Largeur' },
      { key: 'labelHeight', label: 'Hauteur' }
    ]
  }
]

/** Compare deux jeux de parametres champ par champ. */
function areEqual(a: LabelSettings, b: LabelSettings): boolean {
  return (Object.keys(a) as Array<keyof LabelSettings>).every((k) => a[k] === b[k])
}

/**
 * Page des parametres : permet de recalibrer la geometrie d'impression
 * (marges, espacements, dimensions) afin de compenser d'eventuels decalages.
 * Un apercu en direct reflete immediatement les valeurs saisies.
 */
export function SettingsPage(): JSX.Element {
  const { settings, saveSettings, resetSettings, labels } = useAppContext()
  const appVersion = useAppVersion()
  const [draft, setDraft] = useState<LabelSettings>(settings)
  const [saved, setSaved] = useState(false)

  const dirty = useMemo(() => !areEqual(draft, settings), [draft, settings])

  const setField = (key: keyof LabelSettings, value: number): void =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const handleSave = async (): Promise<void> => {
    await saveSettings(draft)
    setSaved(true)
  }

  const handleResetDefaults = async (): Promise<void> => {
    await resetSettings()
    // Recharge le brouillon depuis les valeurs par defaut nouvellement appliquees.
    setDraft({ ...DEFAULT_SETTINGS })
    setSaved(true)
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Apercu en direct de la geometrie */}
      <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'auto', p: 3, bgcolor: 'background.default' }}>
        <LabelSheet
          contents={labels.contents}
          settings={draft}
          selection={new Set<number>()}
          onSelect={() => undefined}
        />
      </Box>

      {/* Formulaire de reglages */}
      <Paper
        square
        elevation={0}
        sx={{
          width: 390,
          flexShrink: 0,
          borderLeft: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          p: 3
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Paramètres d’impression
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recalibrez la planche si l’impression est légèrement décalée. Toutes les valeurs sont
              en millimètres. Disposition : {settings.columns} colonnes × {settings.rows} rangées.
            </Typography>
          </Box>

          {GROUPS.map((group) => (
            <Box key={group.title}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {group.title}
              </Typography>
              <Box
                sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}
              >
                {group.fields.map((f) => (
                  <NumberField
                    key={f.key}
                    label={f.label}
                    value={draft[f.key]}
                    onChange={(v) => setField(f.key, v)}
                  />
                ))}
              </Box>
            </Box>
          ))}

          <Divider />

          <Stack spacing={1.25}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSave}
              disabled={!dirty}
            >
              Enregistrer
            </Button>
            <Stack direction="row" spacing={1.25}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UndoRoundedIcon />}
                onClick={() => setDraft(settings)}
                disabled={!dirty}
              >
                Annuler
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<RestartAltRoundedIcon />}
                onClick={handleResetDefaults}
              >
                Valeurs par défaut
              </Button>
            </Stack>
          </Stack>

          <Divider />
          <Typography variant="caption" color="text.secondary" align="center">
            Étiquettes Inventaire {appVersion ? `— version ${appVersion}` : ''}
          </Typography>
        </Stack>
      </Paper>

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          Paramètres enregistrés.
        </Alert>
      </Snackbar>
    </Box>
  )
}
