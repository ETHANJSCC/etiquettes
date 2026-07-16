import { InputAdornment, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

export interface NumberFieldProps {
  /** Libelle du champ. */
  label: string
  /** Valeur numerique courante. */
  value: number
  /** Unite affichee en suffixe (defaut : « mm »). */
  unit?: string
  /** Pas d'increment (defaut : 0,1). */
  step?: number
  /** Valeur minimale autorisee. */
  min?: number
  /** Appele a chaque valeur numerique valide. */
  onChange: (value: number) => void
}

/**
 * Champ de saisie numerique reutilisable (avec unite).
 *
 * Conserve un etat texte local pour autoriser les etats intermediaires
 * (champ vide, virgule decimale) sans perturber la valeur numerique parente,
 * et accepte indifferemment la virgule ou le point comme separateur decimal.
 */
export function NumberField({
  label,
  value,
  unit = 'mm',
  step = 0.1,
  min = 0,
  onChange
}: NumberFieldProps): JSX.Element {
  const [text, setText] = useState(String(value))

  // Resynchronise l'affichage lorsque la valeur parente change (ex : reset).
  useEffect(() => {
    setText((prev) => (parseFloat(prev.replace(',', '.')) === value ? prev : String(value)))
  }, [value])

  return (
    <TextField
      label={label}
      value={text}
      onChange={(e) => {
        const raw = e.target.value
        setText(raw)
        const parsed = parseFloat(raw.replace(',', '.'))
        if (Number.isFinite(parsed) && parsed >= min) onChange(parsed)
      }}
      type="text"
      inputMode="decimal"
      size="small"
      fullWidth
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>
        },
        htmlInput: { step, min, inputMode: 'decimal' }
      }}
    />
  )
}
