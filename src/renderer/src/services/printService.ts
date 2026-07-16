import type { ExportPdfResult, LabelContent, LabelSettings, PrintResult } from '../types'
import { buildSheetHtml } from '../utils/sheetHtml'

/**
 * Service d'impression et d'export PDF.
 *
 * Construit le HTML de la planche a partir du contenu et des parametres, puis
 * delegue au processus principal (via `window.etiquettes`) la generation
 * effective, seule capable de produire une sortie A4 au millimetre.
 */

/** Nom de fichier PDF propose par defaut, horodate. */
function defaultPdfName(): string {
  const now = new Date()
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-')
  return `etiquettes-${stamp}.pdf`
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
  return window.etiquettes.exportPdf({ html, defaultFileName: defaultPdfName() })
}
