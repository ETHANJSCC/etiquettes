/**
 * Types de domaine partages entre le processus principal (main), le script de
 * pre-chargement (preload) et l'application React (renderer).
 *
 * Ce fichier constitue la source unique de verite pour le modele metier :
 * il ne doit contenir aucune dependance a Electron ni au DOM.
 */

/**
 * Contenu textuel d'une etiquette d'inventaire.
 * Une etiquette est consideree comme « vide » lorsque ces trois champs sont vides.
 */
export interface LabelContent {
  /** Nom / numero d'inventaire de la machine (ex : COFLT012). */
  name: string
  /** Modele du materiel (ex : Dell Pro 16 Plus). */
  model: string
  /** Numero de serie (ex : 8H03WB4). */
  serial: string
}

/**
 * Parametres geometriques de la planche, exprimes en millimetres.
 *
 * Les valeurs par defaut sont deduites du modele Word d'origine et peuvent
 * etre recalibrees par l'utilisateur depuis la page Parametres afin de
 * compenser d'eventuels decalages d'impression.
 */
export interface LabelSettings {
  /** Marge haute de la feuille (mm), du bord jusqu'a la premiere rangee. */
  marginTop: number
  /** Marge basse de la feuille (mm). Indicatif, non contraignant. */
  marginBottom: number
  /** Marge gauche de la feuille (mm), du bord jusqu'a la premiere colonne. */
  marginLeft: number
  /** Marge droite de la feuille (mm). Indicatif, non contraignant. */
  marginRight: number
  /** Espacement horizontal entre deux colonnes d'etiquettes (mm). */
  gapX: number
  /** Espacement vertical entre deux rangees d'etiquettes (mm). */
  gapY: number
  /** Largeur d'une etiquette (mm). */
  labelWidth: number
  /** Hauteur d'une etiquette (mm). */
  labelHeight: number
  /** Nombre de colonnes d'etiquettes sur la planche. */
  columns: number
  /** Nombre de rangees d'etiquettes sur la planche. */
  rows: number
}

/** Une etiquette telle qu'affichee/imprimee : son index sur la planche et son contenu. */
export interface LabelData {
  /** Index de l'etiquette (0 -> columns*rows - 1), en lecture ligne par ligne. */
  index: number
  /** Contenu textuel de l'etiquette. */
  content: LabelContent
}

/**
 * Parametres tels qu'ecrits sur le disque : les reglages geometriques plus un
 * numero de version de schema permettant d'ignorer une ancienne calibration
 * devenue incorrecte.
 */
export interface StoredSettings extends LabelSettings {
  version: number
}

/* --------------------------------------------------------------------------
 * Contrat IPC (renderer <-> main)
 * ------------------------------------------------------------------------ */

/** Noms de canaux IPC, centralises pour eviter les chaines magiques. */
export const IpcChannels = {
  ExportPdf: 'etiquettes:export-pdf',
  ExportWord: 'etiquettes:export-word',
  PrintSheet: 'etiquettes:print-sheet',
  LoadSettings: 'etiquettes:load-settings',
  SaveSettings: 'etiquettes:save-settings'
} as const

/** Requete d'export PDF : le HTML complet de la planche et un nom de fichier propose. */
export interface ExportPdfRequest {
  html: string
  defaultFileName: string
}

/** Resultat d'un export PDF. */
export interface ExportPdfResult {
  ok: boolean
  /** L'utilisateur a annule la boite de dialogue « Enregistrer sous ». */
  canceled?: boolean
  /** Chemin du fichier PDF ecrit en cas de succes. */
  filePath?: string
  /** Message d'erreur eventuel. */
  error?: string
}

/** Requete d'export Word : le document .docx deja genere (octets) et un nom propose. */
export interface ExportWordRequest {
  /** Contenu binaire du fichier .docx. */
  data: Uint8Array
  defaultFileName: string
}

/** Resultat d'un export Word (meme forme que l'export PDF). */
export interface ExportWordResult {
  ok: boolean
  canceled?: boolean
  filePath?: string
  error?: string
}

/** Requete d'impression : le HTML complet de la planche a imprimer. */
export interface PrintRequest {
  html: string
}

/** Resultat d'une impression. */
export interface PrintResult {
  ok: boolean
  /** L'utilisateur a annule la boite de dialogue d'impression. */
  canceled?: boolean
  error?: string
}

/**
 * Interface exposee au renderer via contextBridge (`window.etiquettes`).
 * Elle constitue l'unique surface de contact securisee avec le processus principal.
 */
export interface EtiquettesApi {
  /** Exporte la planche fournie (HTML) en PDF A4 exact. */
  exportPdf(request: ExportPdfRequest): Promise<ExportPdfResult>
  /** Enregistre le document Word (.docx) fourni. */
  exportWord(request: ExportWordRequest): Promise<ExportWordResult>
  /** Ouvre la boite de dialogue d'impression pour la planche fournie (HTML). */
  printSheet(request: PrintRequest): Promise<PrintResult>
  /** Charge les parametres persistes, ou `null` si aucun n'a encore ete enregistre. */
  loadSettings(): Promise<StoredSettings | null>
  /** Enregistre les parametres de facon persistante. */
  saveSettings(settings: StoredSettings): Promise<void>
}
