/**
 * Types du renderer.
 *
 * On reexporte les types de domaine partages (source unique de verite) et on
 * y ajoute les types propres a l'interface utilisateur.
 */
export type {
  LabelContent,
  LabelSettings,
  StoredSettings,
  Site,
  SuggestComputerNameRequest,
  SuggestComputerNameResult,
  ExportPdfRequest,
  ExportPdfResult,
  ExportWordRequest,
  ExportWordResult,
  OpenInWordRequest,
  OpenInWordResult,
  PrintRequest,
  PrintResult,
  EtiquettesApi
} from '@shared/types'

import type { LabelContent } from '@shared/types'

/** Nom d'un champ editable d'une etiquette. */
export type LabelField = keyof LabelContent

/**
 * Position calculee d'une etiquette sur la planche, en millimetres.
 * Produite par le calcul de mise en page a partir des parametres.
 */
export interface LabelBox {
  index: number
  /** Abscisse du coin superieur gauche (mm). */
  x: number
  /** Ordonnee du coin superieur gauche (mm). */
  y: number
  /** Largeur (mm). */
  width: number
  /** Hauteur (mm). */
  height: number
  /** Indice de colonne (0 -> columns-1). */
  column: number
  /** Indice de rangee (0 -> rows-1). */
  row: number
}

/** Ensemble (immuable) des index d'etiquettes selectionnees. */
export type Selection = ReadonlySet<number>
