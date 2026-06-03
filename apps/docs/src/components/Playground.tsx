import { la } from 'lovely-alert'
import { useState } from 'react'
import { syncAlertTheme } from '../lib/theme'

const DEFAULT_CODE = `await la.open({
  title: 'Hello from the playground',
  text: 'Edit the code and press Run!',
  icon: 'success',
  confetti: true,
})`

/** Live playground (React island): edit code and run it against the real `la` API. */
export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE)

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
    <div className="pg">
      <textarea
        className="pg-editor"
        value={code}
        spellCheck={false}
        onChange={(event) => setCode(event.target.value)}
      />
      <div className="pg-actions">
        <button type="button" className="pg-run" onClick={run}>
          ▶ Run
        </button>
        <button type="button" className="pg-reset" onClick={() => setCode(DEFAULT_CODE)}>
          Reset
        </button>
        <button
          type="button"
          onClick={() => {
            syncAlertTheme()
            void la.toast.success('Hi from a toast!')
          }}
        >
          Toast
        </button>
      </div>
    </div>
  )
}
