/**
 * Centralized Logging Utility
 * 
 * Provides consistent logging with levels and optional debug mode.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: process.env.NODE_ENV === 'development',
  level: 'debug',
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(message: string, data?: any): [string, any?] {
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const formattedMessage = `${prefix} ${message}`;
    
    return data !== undefined ? [formattedMessage, data] : [formattedMessage];
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(...this.formatMessage(message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage(message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage(message, data));
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      const [msg, data] = this.formatMessage(message, error);
      console.error(msg, data);
      
      // Log stack trace for Error objects
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
    }
  }

  group(label: string, fn: () => void): void {
    if (this.config.enabled) {
      console.group(this.config.prefix ? `[${this.config.prefix}] ${label}` : label);
      try {
        fn();
      } finally {
        console.groupEnd();
      }
    }
  }
}

// Export factory function to create loggers with specific prefixes
export function createLogger(prefix: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger({ ...config, prefix });
}

// Default logger
export const logger = new Logger();

// Domain-specific loggers
export const messageLogger = createLogger('Message');
export const enquiryLogger = createLogger('Enquiry');
export const sellerLogger = createLogger('Seller');
export const buyerLogger = createLogger('Buyer');
export const appLogger = createLogger('App');
