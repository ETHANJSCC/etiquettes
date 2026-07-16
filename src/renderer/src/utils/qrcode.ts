import qrcode from 'qrcode-generator'

/**
 * Generation de QR codes sous forme de chaine SVG autonome.
 *
 * Le SVG est utilise a la fois :
 *  - dans l'apercu React (via `dangerouslySetInnerHTML`) ;
 *  - dans le HTML genere pour l'impression et l'export PDF.
 *
 * Un niveau de correction d'erreur eleve (« H », ~30 %) permet d'incruster le
 * logo « W » de Wienerberger au centre sans compromettre la lisibilite.
 */

/** Nombre de modules « silencieux » (marge blanche) autour du QR code. */
const QUIET_ZONE = 2

/**
 * Genere le SVG d'un QR code encodant `text`.
 *
 * @param text  Donnees a encoder. Si vide, un SVG vide (transparent) est renvoye.
 * @returns Chaine SVG complete, dimensionnee via `viewBox` (mise a l'echelle libre).
 */
export function generateQrSvg(text: string): string {
  if (!text.trim()) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>'
  }

  const qr = qrcode(0, 'H')
  qr.addData(text)
  qr.make()

  const count = qr.getModuleCount()
  const size = count + QUIET_ZONE * 2

  // Un unique <path> regroupe tous les modules sombres : SVG compact et net.
  let path = ''
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        const x = col + QUIET_ZONE
        const y = row + QUIET_ZONE
        path += `M${x},${y}h1v1h-1z`
      }
    }
  }

  // Pastille blanche centrale + lettre « W » (logo Wienerberger).
  const center = size / 2
  const logoRadius = size * 0.16
  const fontSize = logoRadius * 1.7

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`,
    `<rect width="${size}" height="${size}" fill="#ffffff"/>`,
    `<path d="${path}" fill="#000000"/>`,
    `<circle cx="${center}" cy="${center}" r="${logoRadius}" fill="#ffffff"/>`,
    `<text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="Arial, Helvetica, sans-serif" font-weight="700" ` +
      `font-size="${fontSize}" fill="#000000">W</text>`,
    `</svg>`
  ].join('')
}
