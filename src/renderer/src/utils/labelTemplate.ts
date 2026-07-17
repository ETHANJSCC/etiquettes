import type { LabelContent } from '../types'
import { LABEL_TEXTS } from './constants'
import { QR_IMAGE_DATA_URL } from './qrImage'

/**
 * Gabarit unique d'une etiquette.
 *
 * Ce module est la SOURCE UNIQUE du rendu d'une etiquette : il est utilise
 * a la fois par l'apercu interactif (composant React) et par le HTML genere
 * pour l'impression / l'export PDF. Ainsi l'ecran et l'impression sont
 * strictement identiques, sans aucune duplication de balisage ou de style.
 *
 * Reproduction fidele du modele Word :
 *  - barre noire superieure : « wienerberger France » (blanc, gras, centre) ;
 *  - corps : QR code a gauche, trois lignes Nom / Modele / S/N a droite ;
 *  - barre noire inferieure : « Helpdesk - Scannez moi ».
 */

/** Echappe les caracteres speciaux HTML pour une insertion sure dans le balisage. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Feuille de style de l'interieur d'une etiquette.
 *
 * Les tailles sont exprimees en `em`, relatives a la `font-size` de base posee
 * sur le conteneur `.etq-label` (proportionnelle a la hauteur de l'etiquette).
 * La mise en page reste donc fidele meme si l'utilisateur recalibre les
 * dimensions dans les Parametres.
 */
export const LABEL_CSS = `
.etq-label {
  position: absolute;
  box-sizing: border-box;
  overflow: hidden;
}
.etq-inner {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  color: #000000;
  /* Police et tailles identiques au modele Word d'origine (Calibri, 8/9/11 pt). */
  font-family: Calibri, "Segoe UI", Carlito, Arial, sans-serif;
  font-size: 9pt;
  line-height: 1.05;
}
.etq-header,
.etq-footer {
  flex: 0 0 20.4%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  color: #ffffff;
  font-weight: 700;
  font-size: 11pt;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}
.etq-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.12em 0.3em;
}
.etq-qr {
  flex: 0 0 29%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.etq-qr img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  image-rendering: pixelated;
}
.etq-fields {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2em;
}
.etq-field {
  display: flex;
  align-items: baseline;
  gap: 0.3em;
  overflow: hidden;
  white-space: nowrap;
}
.etq-key {
  flex: 0 0 auto;
  font-weight: 700;
  font-size: 8pt;
}
.etq-val {
  flex: 1 1 auto;
  min-width: 0;
  font-weight: 700;
  font-size: 9pt;
  overflow: hidden;
  text-overflow: ellipsis;
}
`

/**
 * Genere le HTML interieur d'une etiquette renseignee (barres, QR et champs).
 *
 * @param content Contenu textuel de l'etiquette (nom, modele, numero de serie).
 * @returns Fragment HTML a inserer dans un conteneur `.etq-label`.
 */
export function renderLabelInner(content: LabelContent): string {
  return (
    `<div class="etq-inner">` +
    `<div class="etq-header">${escapeHtml(LABEL_TEXTS.brand)}</div>` +
    `<div class="etq-body">` +
    `<div class="etq-qr"><img src="${QR_IMAGE_DATA_URL}" alt="QR Helpdesk" /></div>` +
    `<div class="etq-fields">` +
    field(LABEL_TEXTS.nameLabel, content.name) +
    field(LABEL_TEXTS.modelLabel, content.model) +
    field(LABEL_TEXTS.serialLabel, content.serial) +
    `</div>` +
    `</div>` +
    `<div class="etq-footer">${escapeHtml(LABEL_TEXTS.footer)}</div>` +
    `</div>`
  )
}

/** Genere une ligne « cle : valeur » du corps de l'etiquette. */
function field(key: string, value: string): string {
  return (
    `<div class="etq-field">` +
    `<span class="etq-key">${escapeHtml(key)}</span>` +
    `<span class="etq-val">${escapeHtml(value)}</span>` +
    `</div>`
  )
}
