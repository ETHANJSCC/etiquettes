import { memo, useMemo } from 'react'
import type { LabelBox, LabelContent } from '../types'
import { isEmptyContent, mm } from '../utils/layout'
import { renderLabelInner } from '../utils/labelTemplate'

export interface LabelCardProps {
  /** Position et dimensions de l'etiquette (mm). */
  box: LabelBox
  /** Contenu textuel de l'etiquette. */
  content: LabelContent
  /** Etiquette selectionnee ? */
  selected: boolean
  /**
   * Appele au clic. `additive` vaut `true` si Ctrl/Cmd est enfonce :
   *  - clic simple  -> selectionne uniquement cette etiquette ;
   *  - Ctrl+clic    -> ajoute / retire cette etiquette de la selection.
   */
  onSelect: (index: number, additive: boolean) => void
}

/**
 * Rendu d'une etiquette dans l'apercu de la planche.
 *
 * Une etiquette renseignee affiche exactement le meme balisage que celui
 * imprime (via `renderLabelInner`). Une etiquette vide affiche un emplacement
 * cliquable discret. La mise en evidence de la selection est purement visuelle
 * et n'apparait jamais a l'impression.
 */
function LabelCardComponent({ box, content, selected, onSelect }: LabelCardProps): JSX.Element {
  const empty = isEmptyContent(content)

  // Le HTML interieur n'est recalcule que si le contenu change (evite de
  // regenerer inutilement le QR code a chaque rendu).
  const innerHtml = useMemo(
    () => (empty ? '' : renderLabelInner(content)),
    [empty, content]
  )

  const className = ['etq-label', selected ? 'etq-selected' : ''].filter(Boolean).join(' ')

  return (
    <div
      className={className}
      role="button"
      aria-pressed={selected}
      aria-label={`Etiquette ${box.index + 1}${empty ? ' (vide)' : ''}`}
      tabIndex={0}
      onClick={(e) => onSelect(box.index, e.ctrlKey || e.metaKey)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(box.index, e.ctrlKey || e.metaKey)
        }
      }}
      style={{
        left: mm(box.x),
        top: mm(box.y),
        width: mm(box.width),
        height: mm(box.height)
      }}
    >
      {empty ? (
        <div className="etq-empty">{box.index + 1}</div>
      ) : (
        <div
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
      )}
      {selected && <div className="etq-selected-tint" />}
    </div>
  )
}

export const LabelCard = memo(LabelCardComponent)
