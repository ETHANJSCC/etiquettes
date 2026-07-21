import { useState } from 'react'
import { Alert, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from '@mui/material'
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded'
import type { LabelField } from '../types'
import type { UseLabelsResult } from '../hooks/useLabels'
import type { UseSitesResult } from '../hooks/useSites'
import { SuggestNameDialog } from './SuggestNameDialog'

export interface LabelFormProps {
  /** Etat et actions des etiquettes. */
  labels: UseLabelsResult
  /** Sites configurés, pour la suggestion de nom via l'Active Directory. */
  sites: UseSitesResult
}

/** Champs de saisie hors « Nom » (qui a un traitement particulier, voir plus bas). */
const OTHER_FIELDS: ReadonlyArray<{ field: LabelField; label: string; placeholder: string }> = [
  { field: 'model', label: 'Modèle', placeholder: 'ex : Dell Pro 16 Plus' },
  { field: 'serial', label: 'Numéro de série', placeholder: 'ex : 8H03WB4' }
]

/**
 * Formulaire de saisie des informations d'etiquette.
 *
 * Le contenu saisi est applique en temps reel a toutes les etiquettes
 * selectionnees. Lorsque la selection contient des valeurs differentes pour un
 * champ, celui-ci est laisse vide avec une indication « valeurs multiples ».
 *
 * Le champ Nom propose en plus une suggestion automatique du prochain nom de
 * machine libre (recherche dans l'Active Directory par site + type d'appareil).
 */
export function LabelForm({ labels, sites }: LabelFormProps): JSX.Element {
  const [suggestOpen, setSuggestOpen] = useState(false)
  const selectionCount = labels.selection.size
  const disabled = selectionCount === 0
  const nameMixed = labels.hasMixedValues('name')

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        {disabled
          ? 'Aucune étiquette sélectionnée'
          : `Saisie appliquée à ${selectionCount} étiquette${selectionCount > 1 ? 's' : ''}`}
      </Typography>

      {disabled ? (
        <Alert severity="info" variant="outlined">
          Cliquez sur une étiquette de la planche pour saisir ses informations.
          <br />
          Astuce : <strong>Ctrl+clic</strong> pour en sélectionner plusieurs et leur appliquer le
          même contenu.
        </Alert>
      ) : (
        <Stack spacing={2.5}>
          <TextField
            label="Nom"
            placeholder={nameMixed ? 'Valeurs multiples' : 'ex : COFLT012'}
            value={labels.commonValue('name')}
            onChange={(e) => labels.applyField('name', e.target.value)}
            helperText={nameMixed ? 'Les étiquettes sélectionnées ont des valeurs différentes' : ' '}
            fullWidth
            size="small"
            autoComplete="off"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Suggérer le prochain nom libre (Active Directory)">
                      <IconButton
                        size="small"
                        onClick={() => setSuggestOpen(true)}
                        disabled={sites.sites.length === 0}
                      >
                        <TravelExploreRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }
            }}
          />

          {OTHER_FIELDS.map(({ field, label, placeholder }) => {
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

      <SuggestNameDialog
        open={suggestOpen}
        sites={sites.sites}
        onApply={(name) => labels.applyField('name', name)}
        onClose={() => setSuggestOpen(false)}
      />
    </Stack>
  )
}
