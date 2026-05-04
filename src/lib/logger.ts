const isDev = import.meta.env.DEV

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args)
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args)
  },
  error: (label: string, context?: Record<string, unknown>) => {
    console.error(`[${label}]`, context ?? '')
  },
}
