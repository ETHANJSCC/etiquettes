import { useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
  type AlertColor
} from '@mui/material'
import InventoryRoundedIcon from '@mui/icons-material/Inventory2Rounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { useAppContext } from '../hooks/useAppContext'
import { LabelSheet } from '../components/LabelSheet'
import { LabelForm } from '../components/LabelForm'
import { SelectionToolbar } from '../components/SelectionToolbar'
import { PrintActions } from '../components/PrintActions'

/** Etat d'une notification transitoire (snackbar). */
interface Notice {
  open: boolean
  message: string
  severity: AlertColor
}

/**
 * Page principale : apercu de la planche a gauche, panneau de saisie et
 * d'actions a droite.
 *
 * L'utilisateur selectionne des etiquettes sur la planche, renseigne leurs
 * informations, puis imprime ou exporte en PDF. Seules les etiquettes
 * renseignees seront imprimees.
 */
export function EditorPage(): JSX.Element {
  const { settings, labels } = useAppContext()
  const [notice, setNotice] = useState<Notice>({ open: false, message: '', severity: 'success' })

  const notify = (message: string, severity: AlertColor): void =>
    setNotice({ open: true, message, severity })

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Apercu de la planche A4 */}
      <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'auto', p: 3, bgcolor: 'background.default' }}>
        <LabelSheet
          contents={labels.contents}
          settings={settings}
          selection={labels.selection}
          onToggle={labels.toggleLabel}
        />
      </Box>

      {/* Panneau de saisie et d'actions */}
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
        <Stack spacing={3} sx={{ height: '100%' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Saisie des informations
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                icon={<CheckCircleRoundedIcon />}
                color={labels.filledCount > 0 ? 'primary' : 'default'}
                label={`${labels.filledCount} renseignée${labels.filledCount > 1 ? 's' : ''}`}
              />
              <Chip
                size="small"
                variant="outlined"
                icon={<InventoryRoundedIcon />}
                label={`${labels.selection.size} sélectionnée${labels.selection.size > 1 ? 's' : ''}`}
              />
            </Stack>
          </Box>

          <LabelForm labels={labels} />

          <Divider flexItem>Sélection</Divider>
          <SelectionToolbar labels={labels} />

          <Box sx={{ flexGrow: 1 }} />

          <Divider flexItem>Impression</Divider>
          <PrintActions
            contents={labels.contents}
            settings={settings}
            filledCount={labels.filledCount}
            onNotify={notify}
          />
        </Stack>
      </Paper>

      <Snackbar
        open={notice.open}
        autoHideDuration={4000}
        onClose={() => setNotice((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={notice.severity}
          variant="filled"
          onClose={() => setNotice((n) => ({ ...n, open: false }))}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
