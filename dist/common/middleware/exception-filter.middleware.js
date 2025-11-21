"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionFilterMiddleware = void 0;
const common_1 = require("@nestjs/common");
const http_logger_1 = require("../logger/http.logger");
let ExceptionFilterMiddleware = class ExceptionFilterMiddleware {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : 500;
        const message = exception.message;
        console.error(exception);
        http_logger_1.default.warn(`[FILTER] Exception Filter: ${JSON.stringify(exception)}`);
        response.status(status).json({
            status,
            message,
        });
    }
};
exports.ExceptionFilterMiddleware = ExceptionFilterMiddleware;
exports.ExceptionFilterMiddleware = ExceptionFilterMiddleware = __decorate([
    (0, common_1.Catch)()
], ExceptionFilterMiddleware);
//# sourceMappingURL=exception-filter.middleware.js.map