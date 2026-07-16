import type { LabelBox, LabelContent, LabelSettings } from '../types'

/**
 * Fonctions pures de calcul de mise en page de la planche.
 * Aucune dependance a React : reutilisables en preview comme a l'impression.
 */

/** Nombre total d'etiquettes sur la planche pour des parametres donnes. */
export function getLabelCount(settings: LabelSettings): number {
  return settings.columns * settings.rows
}

/**
 * Calcule la position (en mm) de chaque etiquette sur la feuille.
 *
 * Les etiquettes sont numerotees ligne par ligne, de gauche a droite puis de
 * haut en bas — exactement comme sur la planche physique.
 */
export function computeLabelBoxes(settings: LabelSettings): LabelBox[] {
  const { columns, rows, marginLeft, marginTop, labelWidth, labelHeight, gapX, gapY } = settings
  const boxes: LabelBox[] = []

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      boxes.push({
        index: row * columns + column,
        column,
        row,
        x: marginLeft + column * (labelWidth + gapX),
        y: marginTop + row * (labelHeight + gapY),
        width: labelWidth,
        height: labelHeight
      })
    }
  }

  return boxes
}

/** Indique si le contenu d'une etiquette est vide (aucun champ renseigne). */
export function isEmptyContent(content: LabelContent): boolean {
  return !content.name.trim() && !content.model.trim() && !content.serial.trim()
}

/**
 * Construit la chaine encodee dans le QR code d'une etiquette.
 * Regroupe les informations principales de la machine pour un scan rapide
 * par le support informatique.
 */
export function buildQrPayload(content: LabelContent): string {
  const lines = [
    content.name.trim() && `Nom: ${content.name.trim()}`,
    content.model.trim() && `Modele: ${content.model.trim()}`,
    content.serial.trim() && `S/N: ${content.serial.trim()}`
  ].filter(Boolean)
  return lines.join('\n')
}

/** Formate un nombre en millimetres pour l'affichage CSS (evite les longues decimales). */
export function mm(value: number): string {
  return `${Number(value.toFixed(3))}mm`
}
