import { app, BrowserWindow, dialog, shell } from 'electron'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type {
  ExportPdfRequest,
  ExportPdfResult,
  ExportWordRequest,
  ExportWordResult,
  OpenInWordRequest,
  OpenInWordResult,
  PrintRequest,
  PrintResult
} from '@shared/types'

// Impression et export : le renderer fournit le HTML A4, chargé ici dans une
// fenêtre masquée pour une sortie fidèle et indépendante de l'interface.

/** Fenêtre masquée chargée avec le HTML fourni. */
async function createHiddenSheetWindow(html: string): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
  await win.loadURL(dataUrl)

  return win
}

/**
 * Exporte la planche fournie en PDF au format A4 exact.
 * Ouvre une boite de dialogue « Enregistrer sous ».
 */
export async function exportSheetToPdf(
  parent: BrowserWindow | null,
  request: ExportPdfRequest
): Promise<ExportPdfResult> {
  const saveOptions = {
    title: 'Exporter la planche en PDF',
    defaultPath: request.defaultFileName,
    filters: [{ name: 'Document PDF', extensions: ['pdf'] }]
  }
  const save = parent
    ? await dialog.showSaveDialog(parent, saveOptions)
    : await dialog.showSaveDialog(saveOptions)

  if (save.canceled || !save.filePath) {
    return { ok: false, canceled: true }
  }

  let win: BrowserWindow | null = null
  try {
    win = await createHiddenSheetWindow(request.html)
    const pdf = await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      // Les marges physiques sont deja gerees dans le HTML de la planche.
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      // Laisse la regle CSS @page (A4) piloter la taille de page.
      preferCSSPageSize: true
    })
    await fs.writeFile(save.filePath, pdf)
    return { ok: true, filePath: save.filePath }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  } finally {
    win?.destroy()
  }
}

/**
 * Enregistre le document Word (.docx) fourni via une boite de dialogue
 * « Enregistrer sous ».
 */
export async function exportWordDocument(
  parent: BrowserWindow | null,
  request: ExportWordRequest
): Promise<ExportWordResult> {
  const saveOptions = {
    title: 'Exporter la planche en Word',
    defaultPath: request.defaultFileName,
    filters: [{ name: 'Document Word', extensions: ['docx'] }]
  }
  const save = parent
    ? await dialog.showSaveDialog(parent, saveOptions)
    : await dialog.showSaveDialog(saveOptions)

  if (save.canceled || !save.filePath) {
    return { ok: false, canceled: true }
  }

  try {
    await fs.writeFile(save.filePath, request.data)
    return { ok: true, filePath: save.filePath }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Ecrit le document Word fourni dans un fichier temporaire puis l'ouvre avec
 * l'application associee (Word). L'utilisateur retrouve ainsi son flux habituel
 * (Ctrl+P dans Word) pour imprimer, avec le choix du support et de l'imprimante.
 */
export async function openInWord(request: OpenInWordRequest): Promise<OpenInWordResult> {
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filePath = join(app.getPath('temp'), `Etiquettes-${stamp}.docx`)
    await fs.writeFile(filePath, request.data)

    const errorMessage = await shell.openPath(filePath)
    if (errorMessage) {
      return { ok: false, error: errorMessage }
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Ouvre la boite de dialogue d'impression du systeme pour la planche fournie.
 * Les positions vides restent totalement blanches (impression sur feuille entamee).
 *
 * L'echelle est forcee a 100 % pour garantir un alignement au millimetre :
 * toute mise a l'echelle (« ajuster a la page ») decalerait l'impression.
 */
export async function printSheet(request: PrintRequest): Promise<PrintResult> {
  let win: BrowserWindow | null = null
  try {
    win = await createHiddenSheetWindow(request.html)
    const target = win
    return await new Promise<PrintResult>((resolve) => {
      target.webContents.print(
        {
          silent: false,
          printBackground: true,
          scaleFactor: 100,
          pageSize: 'A4',
          margins: { marginType: 'none' }
        },
        (success, failureReason) => {
          if (success) {
            resolve({ ok: true })
          } else if (failureReason === 'cancelled') {
            resolve({ ok: false, canceled: true })
          } else {
            resolve({ ok: false, error: failureReason })
          }
        }
      )
    })
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  } finally {
    // La fenetre est detruite apres un court delai pour laisser le spooler
    // recuperer le document a imprimer.
    const toDestroy = win
    if (toDestroy) {
      setTimeout(() => toDestroy.destroy(), 5000)
    }
  }
}
