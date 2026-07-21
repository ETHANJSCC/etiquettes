import type { SuggestComputerNameResult } from '../types'
import type { DeviceTypeCode } from '../utils/deviceTypes'

/**
 * Demande au processus principal de suggerer le prochain nom de machine libre
 * pour un site et un type d'appareil donnes (ex : site « COH » + type « LT »
 * -> recherche AD sur le prefixe « COHLT », suggestion « COHLT101 »).
 */
export async function suggestComputerName(
  sitePrefix: string,
  typeCode: DeviceTypeCode
): Promise<SuggestComputerNameResult> {
  return window.etiquettes.suggestComputerName({ prefix: `${sitePrefix}${typeCode}` })
}
