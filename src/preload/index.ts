import { contextBridge, ipcRenderer } from 'electron'
import {
  IpcChannels,
  type EtiquettesApi,
  type ExportPdfRequest,
  type ExportPdfResult,
  type ExportWordRequest,
  type ExportWordResult,
  type OpenInWordRequest,
  type OpenInWordResult,
  type PrintRequest,
  type PrintResult,
  type Site,
  type StoredSettings,
  type SuggestComputerNameRequest,
  type SuggestComputerNameResult
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

  exportWord: (request: ExportWordRequest): Promise<ExportWordResult> =>
    ipcRenderer.invoke(IpcChannels.ExportWord, request),

  openInWord: (request: OpenInWordRequest): Promise<OpenInWordResult> =>
    ipcRenderer.invoke(IpcChannels.OpenInWord, request),

  printSheet: (request: PrintRequest): Promise<PrintResult> =>
    ipcRenderer.invoke(IpcChannels.PrintSheet, request),

  loadSettings: (): Promise<StoredSettings | null> =>
    ipcRenderer.invoke(IpcChannels.LoadSettings),

  saveSettings: (settings: StoredSettings): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.SaveSettings, settings),

  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IpcChannels.GetAppVersion),

  loadSites: (): Promise<Site[]> => ipcRenderer.invoke(IpcChannels.LoadSites),

  saveSites: (sites: Site[]): Promise<void> => ipcRenderer.invoke(IpcChannels.SaveSites, sites),

  suggestComputerName: (request: SuggestComputerNameRequest): Promise<SuggestComputerNameResult> =>
    ipcRenderer.invoke(IpcChannels.SuggestComputerName, request)
}

// Expose l'API de facon securisee sous `window.etiquettes`.
contextBridge.exposeInMainWorld('etiquettes', api)
