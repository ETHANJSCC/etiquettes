import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import {
  IpcChannels,
  type ExportPdfRequest,
  type ExportWordRequest,
  type PrintRequest,
  type StoredSettings
} from '@shared/types'
import { readSettings, writeSettings } from './settingsStore'
import { exportSheetToPdf, exportWordDocument, printSheet } from './printing'

/** Reference vers la fenetre principale (utile pour parenter les dialogues). */
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
    title: 'Etiquettes Inventaire',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  // Ouvre les liens externes dans le navigateur par defaut, jamais dans l'app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  // En developpement, electron-vite expose l'URL du serveur Vite ; en
  // production, on charge le fichier HTML compile.
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

  ipcMain.handle(IpcChannels.PrintSheet, (_event, request: PrintRequest) =>
    printSheet(request)
  )
}

app.whenReady().then(() => {
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
