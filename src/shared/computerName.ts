/**
 * Calcule le prochain nom de machine libre pour un prefixe donne (ex : COHLT),
 * a partir des noms de machines existants (deja filtres par l'appelant sur ce
 * prefixe).
 *
 * Reprend la regle suivie manuellement par le support : le numero le plus
 * eleve deja attribue + 1 (et non le premier numero libre), sur 3 chiffres
 * (ex : COHLT101). Au-dela de 999, le numero n'est plus tronque.
 */
export function computeNextComputerName(prefix: string, existingNames: string[]): string {
  const upperPrefix = prefix.toUpperCase()
  const pattern = new RegExp(`^${upperPrefix}(\\d+)$`, 'i')

  let maxNumber = 0
  for (const name of existingNames) {
    const match = pattern.exec(name.trim())
    if (match) {
      const value = parseInt(match[1], 10)
      if (value > maxNumber) maxNumber = value
    }
  }

  const padded = String(maxNumber + 1).padStart(3, '0')
  return `${upperPrefix}${padded}`
}
