import { getDataBasePath } from 'src/modules/config/path.config';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const LOG_DIR = getDataBasePath() + '/log';

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
      filename: LOG_DIR + '/socket/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
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
