export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export const ConsoleLogger: Logger = {
  debug: (...args: unknown[]) => console.debug('[DataStore][DEBUG]', ...args),
  info: (...args: unknown[]) => console.info('[DataStore][INFO]', ...args),
  warn: (...args: unknown[]) => console.warn('[DataStore][WARN]', ...args),
  error: (...args: unknown[]) => console.error('[DataStore][ERROR]', ...args),
};
