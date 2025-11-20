import winston from 'winston';
import path from 'path';
import fs from 'fs';

export class Logger {
  private logger: winston.Logger;

  constructor(logDir: string = './logs', logLevel: string = 'info') {
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        if (stack) {
          return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
        }
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
    );

    // Create transports
    const transports: winston.transport[] = [
      // Console output
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        ),
      }),

      // Combined log file
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        level: logLevel,
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 30,
      }),

      // Error log file
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 30,
      }),
    ];

    this.logger = winston.createLogger({
      level: logLevel,
      transports,
    });
  }

  error(message: string, ...meta: any[]): void {
    this.logger.error(message, ...meta);
  }

  warn(message: string, ...meta: any[]): void {
    this.logger.warn(message, ...meta);
  }

  info(message: string, ...meta: any[]): void {
    this.logger.info(message, ...meta);
  }

  debug(message: string, ...meta: any[]): void {
    this.logger.debug(message, ...meta);
  }

  log(level: string, message: string, ...meta: any[]): void {
    this.logger.log(level, message, ...meta);
  }
}

// Singleton instance
let logger: Logger | null = null;

export function getLogger(): Logger {
  if (!logger) {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logDir = process.env.LOG_FILE_PATH || './logs';
    logger = new Logger(logDir, logLevel);
  }
  return logger;
}
