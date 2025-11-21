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
const network_util_1 = require("../../../common/util/network.util");
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
    async SafetyFieldRequest(dto) {
        return new Promise((resolve, reject) => {
            http_logger_1.default.debug(`[CONTROL] SafetyFieldRequest : ${JSON.stringify(dto)}`);
            if (this.socketGateway.slamnav != null) {
                if (dto.command === 'getField') {
                }
                else if (dto.command === 'setField') {
                    if (dto.set_field === undefined) {
                        reject(new common_1.HttpException(`set_field(${dto.set_field}) 값이 지정되지 않았습니다.`, common_1.HttpStatus.BAD_REQUEST));
                    }
                }
                else if (dto.command === 'resetFlag') {
                    if (dto.reset_flag === undefined || dto.reset_flag === '') {
                        reject(new common_1.HttpException(`reset_flag(${dto.reset_flag}) 값이 지정되지 않았습니다.`, common_1.HttpStatus.BAD_REQUEST));
                    }
                }
                else {
                    reject(new common_1.HttpException(`알 수 없는 command(${dto.command}) 값입니다.`, common_1.HttpStatus.BAD_REQUEST));
                }
                this.socketGateway.slamnav.emit('safetyRequest', (0, network_util_1.stringifyAllValues)({ ...dto, time: Date.now().toString() }));
                http_logger_1.default.info(`[CONTROL] safetyRequest: ${JSON.stringify(dto)}`);
                this.socketGateway.slamnav.once('safetyResponse', (data) => {
                    http_logger_1.default.info(`[CONTROL] safetyResponse: ${JSON.stringify(data)}`);
                    const json = JSON.parse(data);
                    clearTimeout(timeoutId);
                    if (json.result === 'success') {
                        resolve(json);
                    }
                    else {
                        reject(new common_1.HttpException('명령을 수행할 수 없습니다 : ' + data.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR));
                    }
                });
                const timeoutId = setTimeout(() => {
                    reject(new common_1.HttpException('프로그램이 응답하지 않습니다', common_1.HttpStatus.GATEWAY_TIMEOUT));
                }, 5000);
            }
            else {
                reject(new common_1.HttpException('프로그램이 연결되지 않았습니다', common_1.HttpStatus.GATEWAY_TIMEOUT));
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