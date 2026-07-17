import type { LabelContent, LabelSettings } from '../types'
import { A4_HEIGHT_MM, A4_WIDTH_MM } from './constants'
import { computeLabelBoxes, isEmptyContent, mm } from './layout'
import { LABEL_CSS, baseFontMm, renderLabelInner } from './labelTemplate'

/**
 * Construction du document HTML complet d'une planche A4, destine a
 * l'impression et a l'export PDF.
 *
 * Regle essentielle : seules les etiquettes renseignees sont rendues ; toutes
 * les autres positions restent totalement blanches. Il est ainsi possible
 * d'imprimer sur une feuille d'etiquettes deja entamee sans rien y reimprimer.
 */

/** Styles de la feuille A4 elle-meme (page, positionnement absolu des etiquettes). */
const SHEET_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: ${A4_WIDTH_MM}mm ${A4_HEIGHT_MM}mm; margin: 0; }
html, body {
  width: ${A4_WIDTH_MM}mm;
  height: ${A4_HEIGHT_MM}mm;
  background: #ffffff;
}
.etq-sheet {
  position: relative;
  width: ${A4_WIDTH_MM}mm;
  height: ${A4_HEIGHT_MM}mm;
  overflow: hidden;
}
`

/**
 * Genere le HTML d'une planche A4 prete a imprimer.
 *
 * @param contents Contenu de chaque position (index 0..columns*rows-1).
 * @param settings Parametres geometriques de la planche (mm).
 * @returns Document HTML autonome (styles inlines, QR codes embarques).
 */
export function buildSheetHtml(contents: LabelContent[], settings: LabelSettings): string {
  const boxes = computeLabelBoxes(settings)
  const fontSize = baseFontMm(settings.labelHeight)

  const labelsHtml = boxes
    .map((box) => {
      const content = contents[box.index]
      // Position vide : on n'imprime rien.
      if (!content || isEmptyContent(content)) return ''

      const style =
        `left:${mm(box.x)};top:${mm(box.y)};` +
        `width:${mm(box.width)};height:${mm(box.height)};` +
        `font-size:${mm(fontSize)}`

      return `<div class="etq-label" style="${style}">${renderLabelInner(content)}</div>`
    })
    .join('')

  return (
    `<!doctype html><html lang="fr"><head><meta charset="utf-8">` +
    `<title>Planche d'etiquettes</title>` +
    `<style>${SHEET_CSS}${LABEL_CSS}</style>` +
    `</head><body><div class="etq-sheet">${labelsHtml}</div></body></html>`
  )
}
