"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveService = void 0;
const http_logger_1 = require("../../../common/logger/http.logger");
const common_1 = require("@nestjs/common");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
let MoveService = class MoveService {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async moveCommand(data) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                this.socketGateway.server.to('slamnav').emit('move', data);
                http_logger_1.default.info(`[MOVE] moveCommand: ${JSON.stringify(data)}`);
                this.socketGateway.slamnav.once('moveResponse', (data2) => {
                    http_logger_1.default.info(`[MOVE] moveCommand Response: ${JSON.stringify(data2)}`);
                    resolve(data2);
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    reject({
                        status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                        data: { message: '프로그램이 응답하지 않습니다' },
                    });
                }, 5000);
            }
            else {
                reject({
                    status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                    data: { message: '프로그램이 연결되지 않았습니다' },
                });
            }
        });
    }
    async moveJog(data) {
        if (this.socketGateway.slamnav != null) {
            this.socketGateway.server.to('slamnav').emit('move', data);
        }
    }
};
exports.MoveService = MoveService;
exports.MoveService = MoveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], MoveService);
//# sourceMappingURL=move.service.js.map