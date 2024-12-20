import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const customFormat = format.printf(({ timestamp, level, message }) => {
  if (level === 'debug') {
    return `${timestamp} ${level}: ${JSON.stringify(message)}`;
  }
  return `${timestamp} ${level}: ${message}`;
});

const httpLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new (DailyRotateFile as any)({
      filename: './log/%DATE%/http-%DATE%-debug.log',
      datePattern: 'YYYY-MM-DD',
      level: 'debug',
      maxFiles: '1d',
    }),
    new (DailyRotateFile as any)({
      filename: './log/%DATE%/http-%DATE%-warn.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      maxFiles: '1d',
    }),
    new (DailyRotateFile as any)({
      filename: './log/%DATE%/http-%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '1d',
    }),
    new transports.Console({
      level: 'debug',
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
      ),
    }),
  ],
});

export default httpLogger;
