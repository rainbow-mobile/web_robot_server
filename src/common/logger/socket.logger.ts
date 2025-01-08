import { homedir } from 'os';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const customFormat = format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
});

const socketLogger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new (DailyRotateFile as any)({
      filename: homedir()+'/log/socket/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level:'debug'
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
