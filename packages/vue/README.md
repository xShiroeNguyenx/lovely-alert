# @lovely-alert/vue

> Vue bindings for [`lovely-alert`](https://www.npmjs.com/package/lovely-alert).

Ships a plugin that exposes `$la` in templates and provides `la` for injection,
plus a `useAlert()` composable.

## Install

```bash
npm install @lovely-alert/vue lovely-alert vue
```

## Usage

Register the plugin (optional — gives you `$la` in any template):

```ts
import { createApp } from 'vue'
import { LovelyAlertPlugin } from '@lovely-alert/vue'
import App from './App.vue'

createApp(App).use(LovelyAlertPlugin).mount('#app')
```

```vue
<template>
  <button @click="$la.success('Saved!')">Save</button>
</template>
```

Or use the composable directly:

```vue
<script setup lang="ts">
import { useAlert } from '@lovely-alert/vue'
const alert = useAlert()
</script>

<template>
  <button @click="alert.confirm('Delete?', { danger: true })">Delete</button>
</template>
```

Everything from `lovely-alert` is re-exported as well.

## License

[MIT](../../LICENSE) © Nguyễn Sơn Khánh
