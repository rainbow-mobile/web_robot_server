"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = loggerMiddleware;
const http_logger_1 = require("../logger/http.logger");
function loggerMiddleware(req, res, next) {
    const startRequestTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startRequestTime;
        const message = `[${req.method}] ${req.url}: 응답(${res.statusCode}), 응답시간(${duration}ms), 요청자(${req.ip})`;
        if (!req.url.includes('/sockets/status')) {
            http_logger_1.default.debug(message);
        }
    });
    next();
}
//# sourceMappingURL=logger.middleware.js.map