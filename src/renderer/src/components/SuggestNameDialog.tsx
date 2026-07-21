import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import type { Site } from '../types'
import { DEVICE_TYPES, type DeviceTypeCode } from '../utils/deviceTypes'
import { suggestComputerName } from '../services/nameSuggestionService'

export interface SuggestNameDialogProps {
  open: boolean
  sites: Site[]
  /** Applique le nom suggéré à l'étiquette / la sélection courante. */
  onApply: (name: string) => void
  onClose: () => void
}

/**
 * Dialogue de suggestion du prochain nom de machine libre : l'utilisateur
 * choisit un site et un type d'appareil, l'application interroge l'Active
 * Directory (via le processus principal) et propose le nom suivant.
 */
export function SuggestNameDialog({
  open,
  sites,
  onApply,
  onClose
}: SuggestNameDialogProps): JSX.Element {
  const [siteId, setSiteId] = useState('')
  const [typeCode, setTypeCode] = useState<DeviceTypeCode>('LT')
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [existingCount, setExistingCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedSite = sites.find((s) => s.id === siteId) ?? null

  const reset = (): void => {
    setSuggestion(null)
    setExistingCount(null)
    setError(null)
  }

  const handleClose = (): void => {
    reset()
    onClose()
  }

  const handleSearch = async (): Promise<void> => {
    if (!selectedSite) return
    setLoading(true)
    reset()
    try {
      const result = await suggestComputerName(selectedSite.prefix, typeCode)
      if (result.ok && result.suggestion) {
        setSuggestion(result.suggestion)
        setExistingCount(result.existingCount ?? 0)
      } else {
        setError(result.error ?? 'Erreur inconnue.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (): void => {
    if (!suggestion) return
    onApply(suggestion)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Suggérer un nom de machine</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            select
            label="Site"
            value={siteId}
            onChange={(e) => {
              setSiteId(e.target.value)
              reset()
            }}
            size="small"
            fullWidth
          >
            {sites.map((site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name} ({site.prefix})
              </MenuItem>
            ))}
          </TextField>

          <ToggleButtonGroup
            value={typeCode}
            exclusive
            fullWidth
            size="small"
            onChange={(_event, value: DeviceTypeCode | null) => {
              if (value) {
                setTypeCode(value)
                reset()
              }
            }}
          >
            {DEVICE_TYPES.map((type) => (
              <ToggleButton key={type.code} value={type.code}>
                {type.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            startIcon={<SearchRoundedIcon />}
            onClick={handleSearch}
            disabled={!selectedSite || loading}
          >
            {loading ? 'Recherche en cours…' : 'Rechercher dans l’Active Directory'}
          </Button>

          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}

          {suggestion && (
            <Alert severity="success" variant="outlined">
              <Typography variant="body2">
                {existingCount} machine{existingCount !== 1 ? 's' : ''} existante
                {existingCount !== 1 ? 's' : ''} avec ce préfixe.
              </Typography>
              <Typography variant="h6">{suggestion}</Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handleApply} variant="contained" disabled={!suggestion}>
          Utiliser ce nom
        </Button>
      </DialogActions>
    </Dialog>
  )
}
