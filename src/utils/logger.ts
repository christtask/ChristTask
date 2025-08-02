// Production-safe logging utility
// Only logs in development mode, silent in production

export const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log('[DEV]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.error('[DEV ERROR]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn('[DEV WARN]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info('[DEV INFO]', ...args);
    }
  }
};

// For critical errors that should always be logged (even in production)
export const criticalLogger = {
  error: (...args: any[]) => {
    console.error('[CRITICAL]', ...args);
    // In production, you could send this to an error tracking service
    // like Sentry, LogRocket, etc.
  }
}; 