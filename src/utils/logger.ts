export enum LogLevel {  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

class Logger {
  private format(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();

    const normalizedMeta = this.normalizeMeta(meta);

    return `[${timestamp}] [${level}] ${message}${normalizedMeta ? ` | ${normalizedMeta}` : ""}`;
  }

  private normalizeMeta(meta?: unknown): string | undefined {
    if (!meta) return undefined;

    if (meta instanceof Error) {
      return JSON.stringify({
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      });
    }

    if (typeof meta === "object") {
      try {
        return JSON.stringify(meta);
      } catch {
        return String(meta);
      }
    }

    return String(meta);
  }

  info(message: string, meta?: unknown) {
    console.log(this.format(LogLevel.INFO, message, meta));
  }

  warn(message: string, meta?: unknown) {
    console.warn(this.format(LogLevel.WARN, message, meta));
  }

  error(message: string, meta?: unknown) {
    console.error(this.format(LogLevel.ERROR, message, meta));
  }

  debug(message: string, meta?: unknown) {
    console.debug(this.format(LogLevel.DEBUG, message, meta));
  }
}

export const logger = new Logger();
