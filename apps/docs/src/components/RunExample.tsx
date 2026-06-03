import { la } from 'lovely-alert'
import { syncAlertTheme } from '../lib/theme'

/** A "Run" button (React island) that executes a catalog snippet live. */
export default function RunExample({ code }: { code: string }) {
  const run = (): void => {
    syncAlertTheme()
    try {
      const fn = new Function('la', `return (async () => { ${code} })()`)
      void fn(la)
    } catch (error) {
      void la.error('Snippet error', String(error))
    }
  }
  return (
    <button type="button" className="run-btn" onClick={run}>
      ▶ Run
    </button>
  )
}
