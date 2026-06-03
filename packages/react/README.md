# @lovely-alert/react

> React bindings for [`lovely-alert`](https://www.npmjs.com/package/lovely-alert).

A thin wrapper that re-exports the `la` API and adds a `useAlert()` hook which
auto-closes any still-open alert when the component unmounts.

## Install

```bash
npm install @lovely-alert/react lovely-alert react
```

## Usage

```tsx
import { useAlert } from '@lovely-alert/react'

function SaveButton() {
  const alert = useAlert()
  return <button onClick={() => alert.success('Saved!')}>Save</button>
}
```

Everything from `lovely-alert` is re-exported, so you can also `import { la } from '@lovely-alert/react'`
and use `la.confirm`, `la.prompt`, `la.toast`, `la.open`, the builder, etc.

## License

[MIT](../../LICENSE) © Nguyễn Sơn Khánh
