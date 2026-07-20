import {
  AlignmentType,
  BorderStyle,
  convertMillimetersToTwip,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  VerticalMergeType,
  WidthType,
  type IBorderOptions
} from 'docx'
import type { LabelContent, LabelSettings } from '../types'
import { LABEL_TEXTS } from './constants'
import { isEmptyContent } from './layout'
import { QR_IMAGE_DATA_URL } from './qrImage'

/**
 * Generation d'un document Word (.docx) reproduisant la planche d'etiquettes.
 *
 * La geometrie (marges, largeurs de colonnes, hauteurs de rangees) est calquee
 * sur les parametres Avery, en twips, pour un alignement fidele a l'impression.
 * Seules les etiquettes renseignees recoivent un contenu ; les autres restent
 * des cellules vides.
 */

/** Bordure invisible (les etiquettes n'ont pas de cadre, seulement les barres noires). */
const NO_BORDER: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const NO_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
  insideHorizontal: NO_BORDER,
  insideVertical: NO_BORDER
}
const ZERO_MARGINS = { top: 0, bottom: 0, left: 0, right: 0 }

/**
 * Polices appliquees explicitement a chaque texte (sans cela, Word retombe sur
 * Times New Roman) :
 *  - barres noires (haut / bas)      -> Calibri ;
 *  - champs Nom / Modele / S/N       -> Arial.
 */
const BAR_FONT = 'Calibri'
const FIELD_FONT = 'Arial'

/** Decode l'image QR (data URL base64) en octets bruts pour l'insertion Word. */
function qrImageBytes(): Uint8Array {
  const base64 = QR_IMAGE_DATA_URL.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Paragraphe d'une barre noire (haut/bas) : texte blanc, gras, centre. */
function barParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 22, font: BAR_FONT })]
  })
}

/** Cellule d'une barre noire occupant toute la largeur de l'etiquette. */
function barCell(text: string): TableCell {
  return new TableCell({
    columnSpan: 2,
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: '000000' },
    verticalAlign: VerticalAlign.CENTER,
    borders: NO_BORDERS,
    margins: { top: 0, bottom: 0, left: convertMillimetersToTwip(1), right: convertMillimetersToTwip(1) },
    children: [barParagraph(text)]
  })
}

/** Paragraphe « cle : valeur » d'un champ (cle 8 pt, valeur 9 pt, gras). */
function fieldParagraph(key: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { before: 0, after: 0 },
    children: [
      new TextRun({ text: `${key} `, bold: true, size: 16, font: FIELD_FONT }),
      new TextRun({ text: value, bold: true, size: 18, font: FIELD_FONT })
    ]
  })
}

/** Cellule d'un champ (colonne de droite du corps). */
function fieldCell(key: string, value: string): TableCell {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    borders: NO_BORDERS,
    margins: { top: 0, bottom: 0, left: convertMillimetersToTwip(1), right: 0 },
    children: [fieldParagraph(key, value)]
  })
}

/** Cellule du QR code (fusionnee verticalement sur les trois lignes de champs). */
function qrCell(isRestart: boolean, qrSizePx: number): TableCell {
  return new TableCell({
    verticalMerge: isRestart ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
    verticalAlign: VerticalAlign.CENTER,
    borders: NO_BORDERS,
    margins: ZERO_MARGINS,
    children: isRestart
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [
              new ImageRun({
                type: 'png',
                data: qrImageBytes(),
                transformation: { width: qrSizePx, height: qrSizePx }
              })
            ]
          })
        ]
      : [new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })]
  })
}

/**
 * Construit la table interne d'une etiquette renseignee :
 * barre haute, corps (QR + 3 champs), barre basse.
 */
function labelTable(content: LabelContent, labelWidthTwip: number, rowHeightTwip: number): Table {
  const qrColWidth = convertMillimetersToTwip(18)
  const fieldsColWidth = labelWidthTwip - qrColWidth
  const barHeight = Math.round(rowHeightTwip * 0.204)
  const fieldHeight = Math.round((rowHeightTwip - 2 * barHeight) / 3)
  // Taille du QR : legerement inferieure a la hauteur du corps.
  const qrSizePx = Math.round((rowHeightTwip - 2 * barHeight) / 1440 * 96) - 2

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: labelWidthTwip, type: WidthType.DXA },
    columnWidths: [qrColWidth, fieldsColWidth],
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        height: { value: barHeight, rule: 'exact' },
        cantSplit: true,
        children: [barCell(LABEL_TEXTS.brand)]
      }),
      new TableRow({
        height: { value: fieldHeight, rule: 'exact' },
        cantSplit: true,
        children: [qrCell(true, qrSizePx), fieldCell(LABEL_TEXTS.nameLabel, content.name)]
      }),
      new TableRow({
        height: { value: fieldHeight, rule: 'exact' },
        cantSplit: true,
        children: [qrCell(false, qrSizePx), fieldCell(LABEL_TEXTS.modelLabel, content.model)]
      }),
      new TableRow({
        height: { value: fieldHeight, rule: 'exact' },
        cantSplit: true,
        children: [qrCell(false, qrSizePx), fieldCell(LABEL_TEXTS.serialLabel, content.serial)]
      }),
      new TableRow({
        height: { value: barHeight, rule: 'exact' },
        cantSplit: true,
        children: [barCell(LABEL_TEXTS.footer)]
      })
    ]
  })
}

/** Cellule vide (position non renseignee : reste blanche a l'impression). */
function emptyLabelCell(widthTwip: number): TableCell {
  return new TableCell({
    width: { size: widthTwip, type: WidthType.DXA },
    borders: NO_BORDERS,
    margins: ZERO_MARGINS,
    children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })]
  })
}

/** Cellule contenant une etiquette renseignee. */
function filledLabelCell(content: LabelContent, widthTwip: number, rowHeightTwip: number): TableCell {
  return new TableCell({
    width: { size: widthTwip, type: WidthType.DXA },
    borders: NO_BORDERS,
    margins: ZERO_MARGINS,
    children: [labelTable(content, widthTwip, rowHeightTwip)]
  })
}

/** Cellule d'espacement horizontal entre deux colonnes d'etiquettes. */
function spacerCell(widthTwip: number): TableCell {
  return new TableCell({
    width: { size: widthTwip, type: WidthType.DXA },
    borders: NO_BORDERS,
    margins: ZERO_MARGINS,
    children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })]
  })
}

/**
 * Genere le document Word (.docx) de la planche et renvoie ses octets.
 *
 * @param contents Contenu de chaque position (index 0..columns*rows-1).
 * @param settings Parametres geometriques (mm).
 */
export async function buildWordDocument(
  contents: LabelContent[],
  settings: LabelSettings
): Promise<Uint8Array> {
  const labelWidth = convertMillimetersToTwip(settings.labelWidth)
  const spacerWidth = convertMillimetersToTwip(settings.gapX)
  const rowHeight = convertMillimetersToTwip(settings.labelHeight)

  // Largeurs de colonnes de la table externe : label, espaceur, label, ...
  const columnWidths: number[] = []
  for (let c = 0; c < settings.columns; c++) {
    if (c > 0) columnWidths.push(spacerWidth)
    columnWidths.push(labelWidth)
  }

  const rows: TableRow[] = []
  for (let r = 0; r < settings.rows; r++) {
    const cells: TableCell[] = []
    for (let c = 0; c < settings.columns; c++) {
      if (c > 0) cells.push(spacerCell(spacerWidth))
      const index = r * settings.columns + c
      const content = contents[index]
      cells.push(
        content && !isEmptyContent(content)
          ? filledLabelCell(content, labelWidth, rowHeight)
          : emptyLabelCell(labelWidth)
      )
    }
    rows.push(
      new TableRow({
        height: { value: rowHeight, rule: 'exact' },
        cantSplit: true,
        children: cells
      })
    )
  }

  const table = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: columnWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths,
    borders: NO_BORDERS,
    rows
  })

  const doc = new Document({
    creator: 'EtiqTool',
    title: "Planche d'etiquettes",
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297)
            },
            margin: {
              top: convertMillimetersToTwip(settings.marginTop),
              bottom: convertMillimetersToTwip(settings.marginBottom),
              left: convertMillimetersToTwip(settings.marginLeft),
              right: convertMillimetersToTwip(settings.marginRight)
            }
          }
        },
        children: [table]
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  const buffer = await blob.arrayBuffer()
  return new Uint8Array(buffer)
}
