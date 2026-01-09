// ✅ CENTRALIZED ERROR LOGGING SERVICE
// Provides unified error tracking and logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export class LoggerService {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log at debug level
   */
  static debug(context: string, message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.debug(`[${context}] ${message}`, data);
    }
    this.captureLog('debug', context, message, data);
  }

  /**
   * Log at info level
   */
  static info(context: string, message: string, data?: unknown) {
    console.info(`[${context}] ${message}`, data);
    this.captureLog('info', context, message, data);
  }

  /**
   * Log at warn level
   */
  static warn(context: string, message: string, data?: unknown) {
    console.warn(`[${context}] ${message}`, data);
    this.captureLog('warn', context, message, data);
  }

  /**
   * Log at error level - recommended for use with try/catch
   */
  static error(context: string, message: string, error?: Error | unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    console.error(`[${context}] ${message}`, errorObj);
    
    this.captureLog('error', context, message, undefined, {
      message: errorObj.message,
      stack: errorObj.stack,
      code: (error as any)?.code,
    });
  }

  /**
   * Capture log entry for analytics/monitoring
   * In production, send to external service (Sentry, LogRocket, etc)
   */
  private static captureLog(
    level: LogLevel,
    context: string,
    message: string,
    data?: unknown,
    error?: LogEntry['error']
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
    };

    if (data !== undefined) {
      entry.data = data;
    }

    if (error) {
      entry.error = error;
    }

    // TODO: In production, send to error tracking service
    // Sentry.captureMessage(message, level);
    // or custom API endpoint
  }

  /**
   * Create a scoped logger for a specific component/service
   */
  static createScoped(context: string) {
    return {
      debug: (msg: string, data?: unknown) => this.debug(context, msg, data),
      info: (msg: string, data?: unknown) => this.info(context, msg, data),
      warn: (msg: string, data?: unknown) => this.warn(context, msg, data),
      error: (msg: string, error?: Error | unknown) => this.error(context, msg, error),
    };
  }
}
