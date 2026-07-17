import type {
  ExportPdfResult,
  ExportWordResult,
  LabelContent,
  LabelSettings,
  OpenInWordResult,
  PrintResult
} from '../types'
import { buildSheetHtml } from '../utils/sheetHtml'
import { buildWordDocument } from '../utils/wordDocument'

/**
 * Service d'impression et d'export PDF.
 *
 * Construit le HTML de la planche a partir du contenu et des parametres, puis
 * delegue au processus principal (via `window.etiquettes`) la generation
 * effective, seule capable de produire une sortie A4 au millimetre.
 */

/** Nom de fichier horodate pour l'export, avec l'extension demandee. */
function defaultFileName(extension: string): string {
  const now = new Date()
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-')
  return `etiquettes-${stamp}.${extension}`
}

/** Imprime la planche : ouvre la boite de dialogue d'impression du systeme. */
export async function printSheet(
  contents: LabelContent[],
  settings: LabelSettings
): Promise<PrintResult> {
  const html = buildSheetHtml(contents, settings)
  return window.etiquettes.printSheet({ html })
}

/** Exporte la planche en PDF A4 : ouvre la boite de dialogue « Enregistrer sous ». */
export async function exportPdf(
  contents: LabelContent[],
  settings: LabelSettings
): Promise<ExportPdfResult> {
  const html = buildSheetHtml(contents, settings)
  return window.etiquettes.exportPdf({ html, defaultFileName: defaultFileName('pdf') })
}

/** Exporte la planche en document Word (.docx) : ouvre « Enregistrer sous ». */
export async function exportWord(
  contents: LabelContent[],
  settings: LabelSettings
): Promise<ExportWordResult> {
  const data = await buildWordDocument(contents, settings)
  return window.etiquettes.exportWord({ data, defaultFileName: defaultFileName('docx') })
}

/**
 * Genere la planche au format Word et l'ouvre directement dans Word, pret a
 * imprimer (l'utilisateur conserve son flux habituel : Ctrl+P dans Word).
 */
export async function openInWord(
  contents: LabelContent[],
  settings: LabelSettings
): Promise<OpenInWordResult> {
  const data = await buildWordDocument(contents, settings)
  return window.etiquettes.openInWord({ data })
}
