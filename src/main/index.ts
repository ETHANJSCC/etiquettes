import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'node:path'
import {
  IpcChannels,
  type ExportPdfRequest,
  type ExportWordRequest,
  type OpenInWordRequest,
  type PrintRequest,
  type StoredSettings
} from '@shared/types'
import { readSettings, writeSettings } from './settingsStore'
import { exportSheetToPdf, exportWordDocument, openInWord, printSheet } from './printing'

// Interface statique : le rendu logiciel suffit et allège le CPU/GPU.
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

let mainWindow: BrowserWindow | null = null

/** Cree et affiche la fenetre principale de l'application. */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: 'EtiqTool',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  // Liens externes dans le navigateur, jamais dans l'app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  // Bloque toute navigation hors de l'application.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow?.webContents.getURL()) event.preventDefault()
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (rendererUrl) {
    void mainWindow.loadURL(rendererUrl)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/** Enregistre l'ensemble des gestionnaires IPC exposes au renderer. */
function registerIpcHandlers(): void {
  ipcMain.handle(IpcChannels.LoadSettings, () => readSettings())

  ipcMain.handle(IpcChannels.SaveSettings, (_event, settings: StoredSettings) =>
    writeSettings(settings)
  )

  ipcMain.handle(IpcChannels.ExportPdf, (_event, request: ExportPdfRequest) =>
    exportSheetToPdf(mainWindow, request)
  )

  ipcMain.handle(IpcChannels.ExportWord, (_event, request: ExportWordRequest) =>
    exportWordDocument(mainWindow, request)
  )

  ipcMain.handle(IpcChannels.OpenInWord, (_event, request: OpenInWordRequest) =>
    openInWord(request)
  )

  ipcMain.handle(IpcChannels.PrintSheet, (_event, request: PrintRequest) =>
    printSheet(request)
  )

  ipcMain.handle(IpcChannels.GetAppVersion, () => app.getVersion())
}

/** CSP stricte en production (désactivée en dev pour ne pas gêner le HMR Vite). */
function applyContentSecurityPolicy(): void {
  if (process.env['ELECTRON_RENDERER_URL']) return

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data:; font-src 'self' data:; connect-src 'self'; " +
            "object-src 'none'; base-uri 'self'; form-action 'none'"
        ]
      }
    })
  })
}

app.whenReady().then(() => {
  applyContentSecurityPolicy()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    // Sous macOS, recree une fenetre lorsqu'on clique sur l'icone du dock.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quitte l'application quand toutes les fenetres sont fermees (sauf macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
