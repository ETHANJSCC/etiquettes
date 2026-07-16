import { useState } from 'react'
import { Button, Stack, Tooltip } from '@mui/material'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import type { AlertColor } from '@mui/material'
import type { LabelContent, LabelSettings } from '../types'
import { exportPdf, printSheet } from '../services/printService'

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
type Busy = 'print' | 'pdf' | null

/**
 * Boutons d'impression et d'export PDF de la planche.
 *
 * Seules les etiquettes renseignees sont imprimees / exportees ; les positions
 * vides restent blanches, ce qui autorise l'impression sur une feuille entamee.
 */
export function PrintActions({
  contents,
  settings,
  filledCount,
  onNotify
}: PrintActionsProps): JSX.Element {
  const [busy, setBusy] = useState<Busy>(null)
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

  const handleExport = async (): Promise<void> => {
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

  const tooltip = nothingToPrint ? 'Renseignez au moins une étiquette' : ''

  return (
    <Stack direction="row" spacing={1.25}>
      <Tooltip title={tooltip}>
        <span style={{ flex: 1 }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            disabled={nothingToPrint || busy !== null}
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
            startIcon={<PictureAsPdfRoundedIcon />}
            disabled={nothingToPrint || busy !== null}
            onClick={handleExport}
          >
            Exporter en PDF
          </Button>
        </span>
      </Tooltip>
    </Stack>
  )
}

/** Convertit une valeur inconnue en message d'erreur lisible. */
function asMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
