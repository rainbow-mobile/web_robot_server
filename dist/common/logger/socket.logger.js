"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_config_1 = require("../../modules/config/path.config");
const winston_1 = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const LOG_DIR = (0, path_config_1.getDataBasePath)() + '/log';
const customFormat = winston_1.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
});
const socketLogger = (0, winston_1.createLogger)({
    level: 'debug',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
    transports: [
        new DailyRotateFile({
            filename: LOG_DIR + '/socket/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'info',
        }),
        new winston_1.transports.Console({
            level: 'debug',
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
        }),
    ],
});
exports.default = socketLogger;
//# sourceMappingURL=socket.logger.js.map