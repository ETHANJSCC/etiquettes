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

/*
 * Optimisations de performance (a appliquer AVANT que l'application soit prete).
 *
 * L'application n'affiche qu'une interface statique 2D : le rendu materiel (GPU)
 * n'apporte rien et peut au contraire surcharger le processeur / la carte
 * graphique sur des postes d'entreprise modestes, un GPU integre ou une session
 * de bureau a distance. On le desactive donc, ainsi que le calcul d'occlusion
 * des fenetres sous Windows (source connue de consommation CPU au repos).
 */
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

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
      // Configuration securisee : isolation de contexte, bac a sable actif,
      // aucune integration Node dans le renderer.
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      // Inutile pour des references d'inventaire (COFLT012, numeros de serie...) :
      // evite le chargement d'un dictionnaire et la consommation memoire associee.
      spellcheck: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  // Ouvre les liens externes dans le navigateur par defaut, jamais dans l'app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  // Empeche toute navigation hors de l'application (defense en profondeur).
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow?.webContents.getURL()) event.preventDefault()
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

  ipcMain.handle(IpcChannels.OpenInWord, (_event, request: OpenInWordRequest) =>
    openInWord(request)
  )

  ipcMain.handle(IpcChannels.PrintSheet, (_event, request: PrintRequest) =>
    printSheet(request)
  )
}

/**
 * Applique une Content-Security-Policy stricte en production (defense en
 * profondeur). En developpement, on s'abstient pour ne pas gener le
 * rechargement a chaud du serveur Vite.
 */
function applyContentSecurityPolicy(): void {
  const isDev = Boolean(process.env['ELECTRON_RENDERER_URL'])
  if (isDev) return

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
