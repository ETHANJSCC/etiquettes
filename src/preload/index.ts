import { contextBridge, ipcRenderer } from 'electron'
import {
  IpcChannels,
  type EtiquettesApi,
  type ExportPdfRequest,
  type ExportPdfResult,
  type LabelSettings,
  type PrintRequest,
  type PrintResult
} from '@shared/types'

/**
 * Implementation de l'API exposee au renderer.
 *
 * Chaque methode se contente d'invoquer le canal IPC correspondant : aucune
 * logique metier ici, uniquement une surface de communication typee et sure.
 */
const api: EtiquettesApi = {
  exportPdf: (request: ExportPdfRequest): Promise<ExportPdfResult> =>
    ipcRenderer.invoke(IpcChannels.ExportPdf, request),

  printSheet: (request: PrintRequest): Promise<PrintResult> =>
    ipcRenderer.invoke(IpcChannels.PrintSheet, request),

  loadSettings: (): Promise<LabelSettings | null> =>
    ipcRenderer.invoke(IpcChannels.LoadSettings),

  saveSettings: (settings: LabelSettings): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.SaveSettings, settings)
}

// Expose l'API de facon securisee sous `window.etiquettes`.
contextBridge.exposeInMainWorld('etiquettes', api)
