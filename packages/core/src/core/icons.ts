import type { IconType } from '../types'

/**
 * Inline animated SVG glyphs for the five icon types. Strokes use `pathLength="1"`
 * so the draw animation (stroke-dashoffset 1 → 0, see CSS) is length-independent.
 * Colors come from the surrounding `.la-icon[data-la-icon]` via `currentColor`.
 */
const wrap = (inner: string): string =>
  `<svg class="la-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

const dot = (cx: number, cy: number): string =>
  `<circle class="la-icon-dot" cx="${cx}" cy="${cy}" r="0.9" fill="currentColor" stroke="none"/>`

const ICONS: Record<IconType, string> = {
  success: wrap('<path class="la-icon-draw" pathLength="1" d="M5 12.5l4.5 4.5L19 7"/>'),
  error: wrap(
    '<path class="la-icon-draw" pathLength="1" d="M7 7l10 10"/>' +
      '<path class="la-icon-draw la-icon-draw-2" pathLength="1" d="M17 7L7 17"/>',
  ),
  warning: wrap(`<path class="la-icon-draw" pathLength="1" d="M12 6v8"/>${dot(12, 18)}`),
  info: wrap(`${dot(12, 6.5)}<path class="la-icon-draw" pathLength="1" d="M12 10.5v7.5"/>`),
  question: wrap(
    `<path class="la-icon-draw" pathLength="1" d="M9 9a3 3 0 1 1 4.2 2.8c-1 .6-1.2 1.1-1.2 2.2"/>${dot(12, 18)}`,
  ),
}

export function iconSvg(type: IconType): string {
  return ICONS[type]
}
