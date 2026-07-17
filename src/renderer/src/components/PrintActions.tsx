import { useState } from 'react'
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip
} from '@mui/material'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import type { AlertColor } from '@mui/material'
import type { LabelContent, LabelSettings } from '../types'
import { exportPdf, exportWord, printSheet } from '../services/printService'

export interface PrintActionsProps {
  /** Contenu de chaque position. */
  contents: LabelContent[]
  /** Parametres geometriques de la planche. */
  settings: LabelSettings
  /** Nombre d'etiquettes renseignees (0 -> actions desactivees). */
  filledCount: number
  /** Notifie l'utilisateur du resultat d'une action. */
  onNotify: (message: string, severity: AlertColor) => void
}

/** Actions en cours, pour l'affichage des indicateurs de chargement. */
type Busy = 'print' | 'pdf' | 'word' | null

/**
 * Boutons d'impression et d'export de la planche.
 *
 * L'export propose au choix un PDF ou un document Word (.docx). Dans les deux
 * cas, seules les etiquettes renseignees sont incluses ; les positions vides
 * restent blanches, ce qui autorise l'impression sur une feuille entamee.
 */
export function PrintActions({
  contents,
  settings,
  filledCount,
  onNotify
}: PrintActionsProps): JSX.Element {
  const [busy, setBusy] = useState<Busy>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const nothingToPrint = filledCount === 0

  const handlePrint = async (): Promise<void> => {
    setBusy('print')
    try {
      const result = await printSheet(contents, settings)
      if (result.ok) onNotify('Impression envoyée à l’imprimante.', 'success')
      else if (!result.canceled) {
        onNotify(`Échec de l’impression : ${result.error ?? 'erreur inconnue'}`, 'error')
      }
    } catch (error) {
      onNotify(`Échec de l’impression : ${asMessage(error)}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleExportPdf = async (): Promise<void> => {
    setMenuAnchor(null)
    setBusy('pdf')
    try {
      const result = await exportPdf(contents, settings)
      if (result.ok) onNotify('PDF exporté avec succès.', 'success')
      else if (!result.canceled) {
        onNotify(`Échec de l’export PDF : ${result.error ?? 'erreur inconnue'}`, 'error')
      }
    } catch (error) {
      onNotify(`Échec de l’export PDF : ${asMessage(error)}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleExportWord = async (): Promise<void> => {
    setMenuAnchor(null)
    setBusy('word')
    try {
      const result = await exportWord(contents, settings)
      if (result.ok) onNotify('Document Word exporté avec succès.', 'success')
      else if (!result.canceled) {
        onNotify(`Échec de l’export Word : ${result.error ?? 'erreur inconnue'}`, 'error')
      }
    } catch (error) {
      onNotify(`Échec de l’export Word : ${asMessage(error)}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  const tooltip = nothingToPrint ? 'Renseignez au moins une étiquette' : ''
  const disabled = nothingToPrint || busy !== null

  return (
    <Stack direction="row" spacing={1.25}>
      <Tooltip title={tooltip}>
        <span style={{ flex: 1 }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            disabled={disabled}
            onClick={handlePrint}
          >
            Imprimer
          </Button>
        </span>
      </Tooltip>

      <Tooltip title={tooltip}>
        <span style={{ flex: 1 }}>
          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            endIcon={<ArrowDropDownRoundedIcon />}
            disabled={disabled}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            Exporter
          </Button>
        </span>
      </Tooltip>

      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={handleExportPdf}>
          <ListItemIcon>
            <PictureAsPdfRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exporter en PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportWord}>
          <ListItemIcon>
            <DescriptionRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exporter en Word</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  )
}

/** Convertit une valeur inconnue en message d'erreur lisible. */
function asMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
