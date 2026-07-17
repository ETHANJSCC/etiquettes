import { useState } from 'react'
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip
} from '@mui/material'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import type { AlertColor } from '@mui/material'
import type { LabelContent, LabelSettings } from '../types'
import { exportPdf, exportWord, openInWord, printSheet } from '../services/printService'
import { ConfirmDialog } from './ConfirmDialog'

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
type Busy = 'word-print' | 'word-save' | 'pdf' | 'print' | null

/**
 * Actions d'impression et d'export de la planche.
 *
 * Action principale : « Imprimer via Word », qui ouvre la planche directement
 * dans Word pour conserver le flux d'impression habituel (Ctrl+P, choix du
 * support et de l'imprimante). Les autres options (enregistrer en Word, en PDF,
 * ou impression rapide) sont accessibles via le menu.
 *
 * Dans tous les cas, seules les etiquettes renseignees sont incluses ; les
 * positions vides restent blanches (impression sur feuille entamee).
 */
export function PrintActions({
  contents,
  settings,
  filledCount,
  onNotify
}: PrintActionsProps): JSX.Element {
  const [busy, setBusy] = useState<Busy>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [pdfWarningOpen, setPdfWarningOpen] = useState(false)
  const nothingToPrint = filledCount === 0
  const disabled = nothingToPrint || busy !== null

  /** Execute une action asynchrone en gerant l'etat occupe et les notifications. */
  const run = async (
    kind: Busy,
    action: () => Promise<{ ok: boolean; canceled?: boolean; error?: string }>,
    successMessage: string,
    errorPrefix: string
  ): Promise<void> => {
    setBusy(kind)
    try {
      const result = await action()
      if (result.ok) onNotify(successMessage, 'success')
      else if (!result.canceled) onNotify(`${errorPrefix} : ${result.error ?? 'erreur inconnue'}`, 'error')
    } catch (error) {
      onNotify(`${errorPrefix} : ${asMessage(error)}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleOpenInWord = (): Promise<void> =>
    run(
      'word-print',
      () => openInWord(contents, settings),
      'Ouverture dans Word… utilisez Ctrl+P pour imprimer.',
      'Impossible d’ouvrir Word'
    )

  const handleSaveWord = (): Promise<void> => {
    setMenuAnchor(null)
    return run('word-save', () => exportWord(contents, settings), 'Document Word enregistré.', 'Échec de l’export Word')
  }

  const handleExportPdf = (): Promise<void> => {
    setPdfWarningOpen(false)
    return run('pdf', () => exportPdf(contents, settings), 'PDF enregistré.', 'Échec de l’export PDF')
  }

  const handleQuickPrint = (): Promise<void> => {
    setMenuAnchor(null)
    return run('print', () => printSheet(contents, settings), 'Impression envoyée à l’imprimante.', 'Échec de l’impression')
  }

  const tooltip = nothingToPrint ? 'Renseignez au moins une étiquette' : ''

  return (
    <>
      <Stack direction="row" spacing={1.25}>
        <Tooltip title={tooltip}>
          <span style={{ flex: 1 }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={<PrintRoundedIcon />}
              disabled={disabled}
              onClick={handleOpenInWord}
            >
              Imprimer via Word
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={tooltip}>
          <span>
            <Button
              size="large"
              variant="outlined"
              startIcon={<MoreHorizRoundedIcon />}
              endIcon={<ArrowDropDownRoundedIcon />}
              disabled={disabled}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              Options
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={handleSaveWord}>
          <ListItemIcon>
            <DescriptionRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Enregistrer en Word (.docx)</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null)
            setPdfWarningOpen(true)
          }}
        >
          <ListItemIcon>
            <PictureAsPdfRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Enregistrer en PDF</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleQuickPrint}>
          <ListItemIcon>
            <BoltRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Impression rapide (sans Word)</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={pdfWarningOpen}
        title="Exporter en PDF ?"
        message={
          'À l’impression, les lecteurs PDF réduisent souvent le document à ~96 % ' +
          '(« Ajuster à la page »), ce qui décale légèrement les étiquettes. ' +
          'Pensez à imprimer en « Taille réelle / 100 % ». Pour un alignement garanti, ' +
          'préférez « Imprimer via Word ».'
        }
        confirmLabel="Exporter en PDF"
        onConfirm={handleExportPdf}
        onCancel={() => setPdfWarningOpen(false)}
      />
    </>
  )
}

/** Convertit une valeur inconnue en message d'erreur lisible. */
function asMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
