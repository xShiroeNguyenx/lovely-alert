/** Ambient declarations for Vite's `?inline` / `?raw` asset imports. */

declare module '*.css?inline' {
  const css: string
  export default css
}

declare module '*?raw' {
  const content: string
  export default content
}
