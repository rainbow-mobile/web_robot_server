"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path_config_1 = require("../../modules/config/path.config");
const customFormat = winston_1.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
});
const httpLogger = (0, winston_1.createLogger)({
    level: 'debug',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
    transports: [
        new DailyRotateFile({
            filename: (0, path_config_1.getDataBasePath)() + '/log/http/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'info',
        }),
        new winston_1.transports.Console({
            level: 'info',
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
        }),
    ],
});
exports.default = httpLogger;
//# sourceMappingURL=http.logger.js.map