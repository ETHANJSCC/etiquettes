import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LabelContent, LabelField, Selection } from '../types'
import { EMPTY_CONTENT } from '../utils/constants'
import { isEmptyContent } from '../utils/layout'

/** API exposee par le hook de gestion des etiquettes. */
export interface UseLabelsResult {
  /** Contenu de chaque position (longueur = nombre d'etiquettes). */
  contents: LabelContent[]
  /** Ensemble des index selectionnes. */
  selection: Selection
  /** Nombre d'etiquettes renseignees (qui seront imprimees). */
  filledCount: number
  /** Indique si une position est selectionnee. */
  isSelected: (index: number) => boolean
  /** Bascule la selection d'une etiquette (selectionne / deselectionne). */
  toggleLabel: (index: number) => void
  /** Selectionne uniquement cette etiquette (remplace la selection). */
  selectSingle: (index: number) => void
  /** Selectionne toutes les etiquettes. */
  selectAll: () => void
  /** Deselectionne tout (le contenu est conserve). */
  deselectAll: () => void
  /** Selectionne la prochaine etiquette libre (position vide suivante). */
  selectNextFree: () => void
  /** Reinitialise la planche : vide tout le contenu et la selection. */
  resetAll: () => void
  /** Applique une valeur de champ a toutes les etiquettes selectionnees. */
  applyField: (field: LabelField, value: string) => void
  /** Valeur commune d'un champ sur la selection, ou '' si valeurs multiples/aucune. */
  commonValue: (field: LabelField) => string
  /** Indique si un champ a des valeurs differentes au sein de la selection. */
  hasMixedValues: (field: LabelField) => boolean
}

/** Cree un tableau de `count` contenus vides. */
function createEmptyContents(count: number): LabelContent[] {
  return Array.from({ length: count }, () => ({ ...EMPTY_CONTENT }))
}

/**
 * Hook de gestion de l'etat des etiquettes d'une planche.
 *
 * Gere le contenu de chaque position et l'ensemble des positions selectionnees.
 * Le contenu persiste independamment de la selection : selectionner puis
 * remplir, changer de selection, remplir a nouveau, etc.
 *
 * @param count Nombre total d'etiquettes (colonnes x rangees).
 */
export function useLabels(count: number): UseLabelsResult {
  const [contents, setContents] = useState<LabelContent[]>(() => createEmptyContents(count))
  const [selection, setSelection] = useState<Selection>(() => new Set<number>())

  // Redimensionne le tableau de contenu si la geometrie change (conserve l'existant).
  useEffect(() => {
    setContents((prev) => {
      if (prev.length === count) return prev
      const next = createEmptyContents(count)
      for (let i = 0; i < Math.min(prev.length, count); i++) next[i] = prev[i]
      return next
    })
    setSelection((prev) => {
      const next = new Set<number>()
      prev.forEach((i) => {
        if (i < count) next.add(i)
      })
      return next
    })
  }, [count])

  const isSelected = useCallback((index: number) => selection.has(index), [selection])

  const toggleLabel = useCallback((index: number) => {
    setSelection((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const selectSingle = useCallback((index: number) => {
    setSelection(new Set([index]))
  }, [])

  const selectAll = useCallback(() => {
    setSelection(new Set(Array.from({ length: count }, (_, i) => i)))
  }, [count])

  const deselectAll = useCallback(() => setSelection(new Set<number>()), [])

  const selectNextFree = useCallback(() => {
    setSelection((prev) => {
      const start = prev.size > 0 ? Math.max(...prev) + 1 : 0
      // Parcours cyclique a la recherche de la prochaine position vide.
      for (let offset = 0; offset < count; offset++) {
        const index = (start + offset) % count
        if (isEmptyContent(contents[index])) return new Set([index])
      }
      return prev // Aucune position libre : selection inchangee.
    })
  }, [contents, count])

  const resetAll = useCallback(() => {
    setContents(createEmptyContents(count))
    setSelection(new Set<number>())
  }, [count])

  const applyField = useCallback(
    (field: LabelField, value: string) => {
      setContents((prev) => {
        if (selection.size === 0) return prev
        const next = prev.slice()
        selection.forEach((index) => {
          next[index] = { ...next[index], [field]: value }
        })
        return next
      })
    },
    [selection]
  )

  const commonValue = useCallback(
    (field: LabelField): string => {
      const indices = Array.from(selection)
      if (indices.length === 0) return ''
      const first = contents[indices[0]][field]
      return indices.every((i) => contents[i][field] === first) ? first : ''
    },
    [contents, selection]
  )

  const hasMixedValues = useCallback(
    (field: LabelField): boolean => {
      const indices = Array.from(selection)
      if (indices.length < 2) return false
      const first = contents[indices[0]][field]
      return !indices.every((i) => contents[i][field] === first)
    },
    [contents, selection]
  )

  const filledCount = useMemo(
    () => contents.reduce((acc, c) => acc + (isEmptyContent(c) ? 0 : 1), 0),
    [contents]
  )

  return {
    contents,
    selection,
    filledCount,
    isSelected,
    toggleLabel,
    selectSingle,
    selectAll,
    deselectAll,
    selectNextFree,
    resetAll,
    applyField,
    commonValue,
    hasMixedValues
  }
}
