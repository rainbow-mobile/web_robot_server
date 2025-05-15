"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const winston_1 = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const customFormat = winston_1.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
});
const socketLogger = (0, winston_1.createLogger)({
    level: 'debug',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
    transports: [
        new DailyRotateFile({
            filename: (0, os_1.homedir)() + '/log/socket/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'info'
        }),
        new winston_1.transports.Console({
            level: 'debug',
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
        }),
    ],
});
exports.default = socketLogger;
//# sourceMappingURL=socket.logger.js.map