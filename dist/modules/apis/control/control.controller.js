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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const control_service_1 = require("./control.service");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const http_logger_1 = require("../../../common/logger/http.logger");
const localization_command_dto_1 = require("./dto/localization.command.dto");
const error_util_1 = require("../../../common/util/error.util");
const led_control_dto_1 = require("./dto/led.control.dto");
const lidar_control_dto_1 = require("./dto/lidar.control.dto");
const motor_control_dto_1 = require("./dto/motor.control.dto");
let ControlController = class ControlController {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async mappingStart(res) {
        try {
            const response = await this.controlService.mappingCommand({
                command: 'start',
                time: Date.now().toString(),
            });
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] mapping start: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)}`);
            res.status(error.status).send(error.data);
        }
    }
    async mappingStop(res) {
        try {
            const response = await this.controlService.mappingCommand({
                command: 'stop',
                time: Date.now().toString(),
            });
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] mapping stop: ${error.status} ->${(0, error_util_1.errorToJson)(error.data)}`);
            res.status(error.status).send(error.data);
        }
    }
    async mappingSave(name, res) {
        try {
            if (name == '') {
                http_logger_1.default.warn(`[COMMAND] Mapping Save Parameter Missing : name`);
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: 'Mapping Save Parameter Missing : name' });
            }
            const response = (await this.controlService.mappingCommand({
                command: 'save',
                name: name,
                time: Date.now().toString(),
            }));
            if (!response) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).send({
                    message: 'Mapping Save Failed',
                });
            }
            const parsedResponse = JSON.parse(response);
            if (parsedResponse.result === 'fail') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).send({
                    message: parsedResponse.message,
                });
            }
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] mapping save: ${name}, ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async mappingReload(res) {
        try {
            const response = await this.controlService.mappingCommand({
                command: 'reload',
                time: Date.now().toString(),
            });
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] mapping reload: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)}`);
            res.status(error.status).send(error.data);
        }
    }
    async dockStart(res) {
        try {
            const response = await this.controlService.dockCommand({
                command: 'dock',
                time: Date.now().toString(),
            });
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] dock start: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)}`);
            res.status(error.status).send(error.data);
        }
    }
    async dockStop(res) {
        try {
            const response = await this.controlService.dockCommand({
                command: 'undock',
                time: Date.now().toString(),
            });
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] undock start: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)}`);
            res.status(error.status).send(error.data);
        }
    }
    async localization(data, res) {
        try {
            http_logger_1.default.info(`[COMMAND] Localization: ${JSON.stringify(data)}`);
            if (data.command == 'init') {
                if (data.x == '' || data.y == '' || data.rz == '') {
                    http_logger_1.default.warn(`[COMMAND] Localization Parameter Missing : x, y, rz`);
                    return res
                        .status(common_1.HttpStatus.BAD_REQUEST)
                        .send({ message: `Localization Parameter Missing : x, y, rz` });
                }
            }
            else if (data.command == 'autoinit' || data.command == 'semiautoinit') {
            }
            else if (data.command == 'start' || data.command == 'stop') {
            }
            else {
                http_logger_1.default.warn(`[COMMAND] Localization Command Unknown : ${data.command}`);
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: `Localization Command Unknown : ${data.command}` });
            }
            const response = await this.controlService.Localization({
                ...data,
                time: Date.now().toString(),
            });
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] localization: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)} ${JSON.stringify(data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async ledControl(data, res) {
        try {
            http_logger_1.default.info(`[COMMAND] LED Control : ${data.command}, ${data.led}`);
            const response = await this.controlService.ledControl(data);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] LED Control : ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)} ${JSON.stringify(data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async lidarControl(data, res) {
        try {
            http_logger_1.default.info(`[COMMAND] Lidar Control : ${data.command}, ${data.frequency}`);
            const response = await this.controlService.sendCommand('lidarOnOff', data);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] Lidar Control: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)} ${JSON.stringify(data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async pathControl(data, res) {
        try {
            http_logger_1.default.info(`[COMMAND] Path Control : ${data.command}, ${data.frequency}`);
            const response = await this.controlService.sendCommand('pathOnOff', data);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] Path Control: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)} ${JSON.stringify(data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async motorControl(data, res) {
        try {
            http_logger_1.default.info(`[COMMAND] Motor Control : ${data.command}`);
            const response = await this.controlService.sendCommand('motor', data);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] Motor Control: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)} ${JSON.stringify(data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async randomSeqStart(res) {
        try {
            http_logger_1.default.info(`[COMMAND] RandomSeq Control `);
            const response = await this.controlService.sendCommand('randomseq', {
                command: 'randomseq',
            });
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[COMMAND] RandomSeq Control: ${error.status} -> ${(0, error_util_1.errorToJson)(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
};
exports.ControlController = ControlController;
__decorate([
    (0, common_1.Inject)(),
    __metadata("design:type", control_service_1.ControlService)
], ControlController.prototype, "controlService", void 0);
__decorate([
    (0, common_1.Get)('mapping/start'),
    (0, swagger_1.ApiOperation)({
        summary: '매핑 시작',
        description: '매핑 시작 명령을 전달합니다',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "mappingStart", null);
__decorate([
    (0, common_1.Get)('mapping/stop'),
    (0, swagger_1.ApiOperation)({
        summary: '매핑 종료',
        description: '매핑 종료 명령을 전달합니다',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "mappingStop", null);
__decorate([
    (0, common_1.Get)('mapping/save/:name'),
    (0, swagger_1.ApiOperation)({
        summary: '매핑 시작',
        description: '매핑 시작 명령을 전달합니다',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200,
    }),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "mappingSave", null);
__decorate([
    (0, common_1.Get)('mapping/reload'),
    (0, swagger_1.ApiOperation)({
        summary: '매핑 데이터 리로드',
        description: '매핑 중인 데이터를 리로드 요청합니다',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "mappingReload", null);
__decorate([
    (0, common_1.Get)('dock'),
    (0, swagger_1.ApiOperation)({
        summary: '도킹 시작',
        description: '도킹을 시작합니다(도킹 가능위치에서 실행해야함)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "dockStart", null);
__decorate([
    (0, common_1.Get)('undock'),
    (0, swagger_1.ApiOperation)({
        summary: '도킹 해체',
        description: '도킹을 해체합니다(도킹중인 상태에서 실행해야함)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "dockStop", null);
__decorate([
    (0, common_1.Post)('localization'),
    (0, swagger_1.ApiOperation)({
        summary: '위치초기화',
        description: '위치초기화 명령을 전달합니다',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MAPPING.MAPPING_ACCEPT_200,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [localization_command_dto_1.LocalizationDto, Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "localization", null);
__decorate([
    (0, common_1.Post)('led'),
    (0, swagger_1.ApiOperation)({
        summary: 'LED 제어',
        description: 'LED 색을 변경합니다',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [led_control_dto_1.LedControlDto, Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "ledControl", null);
__decorate([
    (0, common_1.Post)('lidar'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lidar 전송 주기 제어',
        description: 'Lidar 전송 주기를 변경합니다',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lidar_control_dto_1.LidarControlDto, Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "lidarControl", null);
__decorate([
    (0, common_1.Post)('path'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lidar 전송 주기 제어',
        description: 'Lidar 전송 주기를 변경합니다',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lidar_control_dto_1.LidarControlDto, Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "pathControl", null);
__decorate([
    (0, common_1.Post)('motor'),
    (0, swagger_1.ApiOperation)({
        summary: 'MOTOR on/off',
        description: 'MOTOR 전원을 켜거나 끕니다',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [motor_control_dto_1.MotorControlDto, Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "motorControl", null);
__decorate([
    (0, common_1.Post)('randomseq'),
    (0, swagger_1.ApiOperation)({
        summary: 'Random Sequence Start',
        description: '랜덤한 노드를 반복순회합니다 (초기화 필수)',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlController.prototype, "randomSeqStart", null);
exports.ControlController = ControlController = __decorate([
    (0, swagger_1.ApiTags)('SLAMNAV 명령 관련 (control)'),
    (0, common_1.Controller)('control'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], ControlController);
//# sourceMappingURL=control.controller.js.map