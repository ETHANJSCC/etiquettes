import { Alert, Stack, TextField, Typography } from '@mui/material'
import type { LabelField } from '../types'
import type { UseLabelsResult } from '../hooks/useLabels'

export interface LabelFormProps {
  /** Etat et actions des etiquettes. */
  labels: UseLabelsResult
}

/** Definition declarative des champs de saisie (evite toute duplication de balisage). */
const FIELDS: ReadonlyArray<{ field: LabelField; label: string; placeholder: string }> = [
  { field: 'name', label: 'Nom', placeholder: 'ex : COFLT012' },
  { field: 'model', label: 'Modèle', placeholder: 'ex : Dell Pro 16 Plus' },
  { field: 'serial', label: 'Numéro de série', placeholder: 'ex : 8H03WB4' }
]

/**
 * Formulaire de saisie des informations d'etiquette.
 *
 * Le contenu saisi est applique en temps reel a toutes les etiquettes
 * selectionnees. Lorsque la selection contient des valeurs differentes pour un
 * champ, celui-ci est laisse vide avec une indication « valeurs multiples ».
 */
export function LabelForm({ labels }: LabelFormProps): JSX.Element {
  const selectionCount = labels.selection.size
  const disabled = selectionCount === 0

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        {disabled
          ? 'Aucune étiquette sélectionnée'
          : `Saisie appliquée à ${selectionCount} étiquette${selectionCount > 1 ? 's' : ''}`}
      </Typography>

      {disabled ? (
        <Alert severity="info" variant="outlined">
          Sélectionnez une ou plusieurs étiquettes sur la planche pour saisir leurs informations.
        </Alert>
      ) : (
        <Stack spacing={2.5}>
          {FIELDS.map(({ field, label, placeholder }) => {
            const mixed = labels.hasMixedValues(field)
            return (
              <TextField
                key={field}
                label={label}
                placeholder={mixed ? 'Valeurs multiples' : placeholder}
                value={labels.commonValue(field)}
                onChange={(e) => labels.applyField(field, e.target.value)}
                helperText={mixed ? 'Les étiquettes sélectionnées ont des valeurs différentes' : ' '}
                fullWidth
                size="small"
                autoComplete="off"
              />
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
