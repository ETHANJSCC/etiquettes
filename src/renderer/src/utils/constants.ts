import type { LabelSettings } from '../types'

/**
 * Constantes de mise en page.
 *
 * Les valeurs geometriques par defaut correspondent a la specification
 * OFFICIELLE de la planche Avery L6011 / LP27/63 (et non plus au releve
 * approximatif du tableau Word), pour un alignement au plus juste.
 *
 * Specification Avery L6011 (A4, 27 etiquettes, 3 x 9) :
 *  - Etiquette              : 63,5 x 29,6 mm
 *  - Marges haute / basse   : 15,3 mm
 *  - Marges gauche / droite : 7,25 mm
 *  - Pas horizontal         : 66,0 mm (colonne a colonne) -> ecart 2,5 mm
 *  - Pas vertical           : 29,6 mm (rangee a rangee)   -> ecart 0 mm
 *
 * Verification : 7,25 + 3 x 63,5 + 2 x 2,5 + 7,25 = 210 mm ; 15,3 + 9 x 29,6 + 15,3 = 297 mm.
 * Conversion : 1 pouce = 1440 twips = 25,4 mm.
 */

/** Largeur d'une feuille A4 en millimetres. */
export const A4_WIDTH_MM = 210

/** Hauteur d'une feuille A4 en millimetres. */
export const A4_HEIGHT_MM = 297

/** Facteur de conversion twips -> millimetres (1 twip = 25,4 / 1440 mm). */
export const TWIP_TO_MM = 25.4 / 1440

/**
 * Version du schema de reglages. Incrementee lorsque les valeurs par defaut
 * changent de facon significative : les reglages persistes d'une version
 * anterieure sont alors ignores au profit des nouveaux defauts (evite de
 * conserver une ancienne calibration devenue incorrecte).
 */
export const SETTINGS_VERSION = 2

/**
 * Parametres par defaut de la planche, conformes a la planche Avery L6011.
 * Utilises tant qu'aucun reglage personnalise (meme version) n'est enregistre.
 */
export const DEFAULT_SETTINGS: LabelSettings = {
  marginTop: 15.3,
  marginBottom: 15.3,
  marginLeft: 7.25,
  marginRight: 7.25,
  gapX: 2.5,
  gapY: 0,
  labelWidth: 63.5,
  labelHeight: 29.6,
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
