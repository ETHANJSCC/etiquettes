import type { LabelSettings } from '../types'

/**
 * Constantes de mise en page.
 *
 * Toutes les valeurs geometriques sont deduites du modele Word d'origine
 * (ETIQUETTES.docx). Conversion utilisee : 1 pouce = 1440 twips = 25,4 mm.
 *
 * Releve du modele Word :
 *  - Page A4                : 11905 x 16837 twips = 210 x 297 mm
 *  - Marge haute            : 856 twips  = 15,10 mm
 *  - Marges gauche/droite   : 408 twips  = 7,20 mm (retrait table -15 twips)
 *  - Grille                 : 3 colonnes x 9 rangees = 27 etiquettes
 *  - Largeur etiquette      : 3600 twips = 63,50 mm
 *  - Hauteur etiquette      : 1679 twips = 29,62 mm
 *  - Espacement horizontal  : 144 twips  = 2,54 mm
 *  - Espacement vertical    : 0 mm (rangees jointives)
 */

/** Largeur d'une feuille A4 en millimetres. */
export const A4_WIDTH_MM = 210

/** Hauteur d'une feuille A4 en millimetres. */
export const A4_HEIGHT_MM = 297

/** Facteur de conversion twips -> millimetres (1 twip = 25,4 / 1440 mm). */
export const TWIP_TO_MM = 25.4 / 1440

/**
 * Parametres par defaut de la planche, fideles au modele Word.
 * Utilises tant qu'aucun reglage personnalise n'a ete enregistre.
 */
export const DEFAULT_SETTINGS: LabelSettings = {
  marginTop: 15.1,
  marginBottom: 0,
  marginLeft: 6.9,
  marginRight: 7.2,
  gapX: 2.54,
  gapY: 0,
  labelWidth: 63.5,
  labelHeight: 29.62,
  columns: 3,
  rows: 9
}

/** Textes fixes affiches sur chaque etiquette (non modifiables par l'utilisateur). */
export const LABEL_TEXTS = {
  brand: 'wienerberger France',
  footer: 'Helpdesk - Scannez moi',
  nameLabel: 'Nom :',
  modelLabel: 'Modèle :',
  serialLabel: 'S/N :'
} as const

/** Contenu vide d'une etiquette. */
export const EMPTY_CONTENT = { name: '', model: '', serial: '' } as const
