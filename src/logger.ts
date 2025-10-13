export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export const ConsoleLogger: Logger = {
  debug: (...args: any[]) => console.debug('[DataStore][DEBUG]', ...args),
  info: (...args: any[]) => console.info('[DataStore][INFO]', ...args),
  warn: (...args: any[]) => console.warn('[DataStore][WARN]', ...args),
  error: (...args: any[]) => console.error('[DataStore][ERROR]', ...args),
};
