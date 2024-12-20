import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const customFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level}: ${message}`;
});

const socketLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new (DailyRotateFile as any)({
      filename: './log/%DATE%/socket-%DATE%-debug.log',
      datePattern: 'YYYY-MM-DD',
      level: 'debug',
      maxFiles: '1d',
    }),
    new (DailyRotateFile as any)({
      filename: './log/%DATE%/socket-%DATE%-warn.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      maxFiles: '1d',
    }),
    new (DailyRotateFile as any)({
      filename: './log/%DATE%/socket-%DATE%-error.log',
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

export default socketLogger;
