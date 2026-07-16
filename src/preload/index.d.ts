import type { EtiquettesApi } from '@shared/types'

/**
 * Declaration globale : rend `window.etiquettes` typee dans tout le renderer.
 */
declare global {
  interface Window {
    etiquettes: EtiquettesApi
  }
}

export {}
