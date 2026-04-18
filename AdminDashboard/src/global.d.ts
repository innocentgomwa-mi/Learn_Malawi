export {}

declare module '@/*' {
  const value: any
  export default value
}

declare global {
  interface Window {
    apiClient: any
  }

  const apiClient: any
}

