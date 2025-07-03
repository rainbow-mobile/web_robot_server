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
exports.ControlService = void 0;
const http_logger_1 = require("../../../common/logger/http.logger");
const common_1 = require("@nestjs/common");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
let ControlService = class ControlService {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async mappingCommand(data) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                this.socketGateway.server.to('slamnav').emit('mapping', data);
                http_logger_1.default.info(`[CONTROL] mapping: ${JSON.stringify(data)}`);
                this.socketGateway.slamnav.once('mappingResponse', (data2) => {
                    http_logger_1.default.info(`[CONTROL] mapping Response: ${JSON.stringify(data2)}`);
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
    async ledControl(data) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                this.socketGateway.server
                    .to('slamnav')
                    .emit('led', { ...data, time: Date.now().toString() });
                http_logger_1.default.info(`[CONTROL] led: ${JSON.stringify(data)}`);
                resolve({});
            }
            else {
                reject({
                    status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                    data: { message: '프로그램이 연결되지 않았습니다' },
                });
            }
        });
    }
    async sendCommand(topic, data) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                this.socketGateway.server
                    .to('slamnav')
                    .emit(topic, { ...data, time: Date.now().toString() });
                http_logger_1.default.info(`[CONTROL] sendCommand: ${JSON.stringify(data)}`);
                resolve({});
            }
            else {
                reject({
                    status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                    data: { message: '프로그램이 연결되지 않았습니다' },
                });
            }
        });
    }
    async dockCommand(data) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                this.socketGateway.server.to('slamnav').emit(data.command, data);
                http_logger_1.default.info(`[CONTROL] dock: ${JSON.stringify(data)}`);
                this.socketGateway.slamnav.once(data.command, (data2) => {
                    http_logger_1.default.info(`[CONTROL] dock Response: ${JSON.stringify(data2)}`);
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
    async Localization(data) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                this.socketGateway.server.to('slamnav').emit('localization', data);
                http_logger_1.default.info(`[CONTROL] localization: ${JSON.stringify(data)}`);
                if (data.command == 'start' || data.command == 'stop') {
                    resolve({ command: data.command, result: 'accept' });
                }
                else {
                    this.socketGateway.slamnav.once('localizationResponse', (data2) => {
                        http_logger_1.default.info(`[CONTROL] localization Response: ${JSON.stringify(data2)}`);
                        resolve(data2);
                        clearTimeout(timeoutId);
                    });
                }
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
};
exports.ControlService = ControlService;
exports.ControlService = ControlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], ControlService);
//# sourceMappingURL=control.service.js.map