declare module 'papaparse' {
  /** Convert data to CSV */
  export function unparse(data: unknown, config?: unknown): string
  const _default: {
    unparse: typeof unparse
  }
  export default _default
}
