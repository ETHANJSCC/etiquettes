import { useState } from 'react'
import { Button, Stack } from '@mui/material'
import DeselectRoundedIcon from '@mui/icons-material/DeselectRounded'
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import type { UseLabelsResult } from '../hooks/useLabels'
import { ConfirmDialog } from './ConfirmDialog'

export interface SelectionToolbarProps {
  /** Etat et actions des etiquettes. */
  labels: UseLabelsResult
}

/**
 * Barre d'actions de selection.
 *
 * Regroupe les commandes de selection (prochaine libre, tout selectionner,
 * tout deselectionner) et la reinitialisation complete de la planche
 * (protegee par une confirmation).
 */
export function SelectionToolbar({ labels }: SelectionToolbarProps): JSX.Element {
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <Stack spacing={1.25}>
        <Button
          variant="contained"
          startIcon={<NavigateNextRoundedIcon />}
          onClick={labels.selectNextFree}
        >
          Sélectionner la prochaine étiquette
        </Button>

        <Stack direction="row" spacing={1.25}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SelectAllRoundedIcon />}
            onClick={labels.selectAll}
          >
            Tout sélectionner
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DeselectRoundedIcon />}
            onClick={labels.deselectAll}
            disabled={labels.selection.size === 0}
          >
            Tout désélectionner
          </Button>
        </Stack>

        <Button
          variant="outlined"
          color="error"
          startIcon={<RestartAltRoundedIcon />}
          onClick={() => setConfirmReset(true)}
          disabled={labels.filledCount === 0 && labels.selection.size === 0}
        >
          Réinitialiser la planche
        </Button>
      </Stack>

      <ConfirmDialog
        open={confirmReset}
        title="Réinitialiser la planche ?"
        message="Toutes les informations saisies et la sélection seront effacées. Cette action est irréversible."
        confirmLabel="Réinitialiser"
        confirmColor="error"
        onConfirm={() => {
          labels.resetAll()
          setConfirmReset(false)
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  )
}
