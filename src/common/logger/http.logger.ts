import { homedir } from 'os';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { getDataBasePath } from 'src/modules/config/path.config';

const customFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}] ${message}`;
});

const httpLogger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [
    new (DailyRotateFile as any)({
      filename: getDataBasePath() + '/log/http/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
    }),
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
      ),
    }),
  ],
});

export default httpLogger;
