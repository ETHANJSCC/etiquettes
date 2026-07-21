import { useState } from 'react'
import {
  Alert,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { UseSitesResult } from '../hooks/useSites'
import { isValidSitePrefix } from '../services/sitesService'

export interface SitesManagerProps {
  sites: UseSitesResult
}

/**
 * Gestion des sites (nom + préfixe de nommage, ex : Colomiers -> COH), utilisés
 * pour suggérer le prochain nom de machine libre à partir de l'Active Directory.
 */
export function SitesManager({ sites }: SitesManagerProps): JSX.Element {
  const [name, setName] = useState('')
  const [prefix, setPrefix] = useState('')

  const prefixError = prefix.trim().length > 0 && !isValidSitePrefix(prefix)
  const canAdd = name.trim().length > 0 && isValidSitePrefix(prefix)

  const handleAdd = (): void => {
    if (!canAdd) return
    void sites.addSite(name, prefix)
    setName('')
    setPrefix('')
  }

  return (
    <Stack spacing={1.5}>
      {sites.sites.length === 0 ? (
        <Alert severity="info" variant="outlined">
          Aucun site configuré. Ajoutez un site pour pouvoir suggérer un nom de machine.
        </Alert>
      ) : (
        <List dense disablePadding>
          {sites.sites.map((site) => (
            <ListItem
              key={site.id}
              disableGutters
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => sites.removeSite(site.id)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText primary={site.name} secondary={`Préfixe : ${site.prefix}`} />
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          label="Nom du site"
          placeholder="ex : Colomiers"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Préfixe"
          placeholder="COH"
          size="small"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value.toUpperCase())}
          error={prefixError}
          helperText={prefixError ? 'Lettres/chiffres, 10 caractères max' : ' '}
          sx={{ width: 120 }}
          slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
        />
        <IconButton color="primary" onClick={handleAdd} disabled={!canAdd} sx={{ mt: 0.5 }}>
          <AddCircleRoundedIcon />
        </IconButton>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Le préfixe est la partie fixe du nom des machines de ce site (ex : COH pour COHLT101).
      </Typography>
    </Stack>
  )
}
