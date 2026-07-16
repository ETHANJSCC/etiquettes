import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Petit hook mesurant la largeur d'un element du DOM et la maintenant a jour
 * lors des redimensionnements (via `ResizeObserver`).
 *
 * Utilise pour mettre l'apercu de la planche A4 a l'echelle du panneau
 * disponible tout en preservant des proportions exactes.
 */
export function useElementSize(): { ref: (node: HTMLElement | null) => void; width: number } {
  const [width, setWidth] = useState(0)
  const observerRef = useRef<ResizeObserver | null>(null)

  const ref = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect()
    if (!node) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(node)
    observerRef.current = observer
    setWidth(node.getBoundingClientRect().width)
  }, [])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  return { ref, width }
}
