import type { LabelContent } from '../types'
import { LABEL_TEXTS } from './constants'
import { QR_IMAGE_DATA_URL } from './qrImage'

// Rendu d'une étiquette, partagé entre l'aperçu React et le HTML d'impression
// (une seule définition, donc écran et impression identiques).

/** Échappe les caractères spéciaux HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Styles de l'intérieur d'une étiquette (barres, corps, QR, champs). */
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
  /* Champs Nom / Modele / S/N : Arial (les barres passent en Calibri ci-dessous). */
  font-family: Arial, Helvetica, sans-serif;
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
  /* Barres « wienerberger France » et « Helpdesk - Scannez moi » : Calibri. */
  font-family: Calibri, "Segoe UI", Carlito, sans-serif;
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

/** HTML intérieur d'une étiquette renseignée, à insérer dans un `.etq-label`. */
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
