/** Type d'appareil pour la convention de nommage (site + type + numéro). */
export type DeviceTypeCode = 'LT' | 'PC'

/** Types d'appareils gérés par la convention de nommage du support. */
export const DEVICE_TYPES: ReadonlyArray<{ code: DeviceTypeCode; label: string }> = [
  { code: 'LT', label: 'Laptop' },
  { code: 'PC', label: 'PC de bureau' }
]
