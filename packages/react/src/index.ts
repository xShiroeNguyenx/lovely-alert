import { la } from 'lovely-alert'
import { useEffect } from 'react'

/**
 * React binding for lovely-alert. Returns the `la` API and closes any alert
 * still open when the component unmounts.
 *
 * ```tsx
 * const alert = useAlert()
 * <button onClick={() => alert.success('Saved!')}>Save</button>
 * ```
 */
export function useAlert(): typeof la {
  useEffect(
    () => () => {
      if (la.isVisible()) la.close()
    },
    [],
  )
  return la
}

export { la } from 'lovely-alert'
export type * from 'lovely-alert'
