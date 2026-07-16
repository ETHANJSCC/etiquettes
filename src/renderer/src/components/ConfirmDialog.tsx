import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'

export interface ConfirmDialogProps {
  /** Dialogue ouvert ? */
  open: boolean
  /** Titre du dialogue. */
  title: string
  /** Message explicatif. */
  message: string
  /** Libelle du bouton de confirmation (defaut : « Confirmer »). */
  confirmLabel?: string
  /** Couleur du bouton de confirmation. */
  confirmColor?: 'primary' | 'secondary' | 'error'
  /** Confirmation. */
  onConfirm: () => void
  /** Annulation / fermeture. */
  onCancel: () => void
}

/**
 * Dialogue de confirmation generique, reutilise pour toute action
 * potentiellement destructrice (reinitialisation, etc.).
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  confirmColor = 'primary',
  onConfirm,
  onCancel
}: ConfirmDialogProps): JSX.Element {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Annuler</Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" autoFocus>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
