import { useMemo } from 'react'
import { GlobalStyles } from '@mui/material'
import type { LabelContent, LabelSettings, Selection } from '../types'
import { A4_HEIGHT_MM, A4_WIDTH_MM } from '../utils/constants'
import { computeLabelBoxes } from '../utils/layout'
import { LABEL_CSS } from '../utils/labelTemplate'
import { useElementSize } from '../hooks/useElementSize'
import { LabelCard } from './LabelCard'

export interface LabelSheetProps {
  /** Contenu de chaque position. */
  contents: LabelContent[]
  /** Parametres geometriques de la planche. */
  settings: LabelSettings
  /** Ensemble des index selectionnes. */
  selection: Selection
  /** Selectionne une etiquette (`additive` = Ctrl/Cmd enfonce : ajout/retrait). */
  onSelect: (index: number, additive: boolean) => void
}

/** Conversion CSS de reference : 1 mm = 96 / 25,4 px. */
const PX_PER_MM = 96 / 25.4
const A4_PX_WIDTH = A4_WIDTH_MM * PX_PER_MM
const A4_PX_HEIGHT = A4_HEIGHT_MM * PX_PER_MM

/** Styles de l'aperçu uniquement (jamais imprimés) : emplacement vide, survol, sélection. */
const PREVIEW_CSS = `
.etq-preview .etq-label { cursor: pointer; transition: filter .12s ease; outline: none; }
.etq-preview .etq-label:hover { filter: brightness(0.96); }
.etq-preview .etq-label:focus-visible { box-shadow: 0 0 0 2px #1976d2; }
.etq-empty {
  width: 100%; height: 100%; box-sizing: border-box;
  display: flex; align-items: center; justify-content: center;
  border: 0.25mm dashed #c2ccd2; color: #b7c2c9; font-weight: 600; font-size: 1.5em;
  background: #fafbfc;
}
.etq-preview .etq-label:hover .etq-empty { border-color: #90a4ae; color: #607d8b; }
.etq-selected { box-shadow: inset 0 0 0 0.8mm #1565c0; }
.etq-selected-tint { position: absolute; inset: 0; background: rgba(21,101,192,0.20); pointer-events: none; }
`

/** Feuille de style combinee, calculee une seule fois (evite un retraitement a chaque rendu). */
const SHEET_STYLES = LABEL_CSS + PREVIEW_CSS

/**
 * Apercu graphique de la planche A4.
 *
 * Le rendu est realise a la taille physique reelle (mm) puis mis a l'echelle
 * du panneau disponible via une transformation CSS, ce qui garantit des
 * proportions strictement identiques au modele et a l'impression.
 */
export function LabelSheet({
  contents,
  settings,
  selection,
  onSelect
}: LabelSheetProps): JSX.Element {
  const { ref, width } = useElementSize()
  // Les positions ne dependent que des parametres : on evite de les recalculer
  // a chaque changement de selection ou de saisie.
  const boxes = useMemo(() => computeLabelBoxes(settings), [settings])

  const rawScale = width > 0 ? width / A4_PX_WIDTH : 1
  const scale = Math.min(1.4, Math.max(0.15, rawScale))

  return (
    <>
      <GlobalStyles styles={SHEET_STYLES} />
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {/* Reserve l'espace correspondant a la planche mise a l'echelle. */}
        <div style={{ width: A4_PX_WIDTH * scale, height: A4_PX_HEIGHT * scale }}>
          <div
            className="etq-preview"
            style={{
              width: `${A4_WIDTH_MM}mm`,
              height: `${A4_HEIGHT_MM}mm`,
              position: 'relative',
              background: '#ffffff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
              border: '1px solid #d4dae0',
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
          >
            {boxes.map((box) => (
              <LabelCard
                key={box.index}
                box={box}
                content={contents[box.index]}
                selected={selection.has(box.index)}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
