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
exports.SocketsController = void 0;
const common_1 = require("@nestjs/common");
const http_logger_1 = require("../../common/logger/http.logger");
const swagger_1 = require("@nestjs/swagger");
const http_status_messages_constants_1 = require("../../common/constants/http-status-messages.constants");
const sockets_gateway_1 = require("./gateway/sockets.gateway");
const variables_service_1 = require("../apis/variables/variables.service");
const socket_logger_1 = require("../../common/logger/socket.logger");
const frs_url_dto_1 = require("./dto/frs.url.dto");
const error_util_1 = require("../../common/util/error.util");
const lidar_onoff_dto_1 = require("./dto/lidar.onoff.dto");
const variables_dto_1 = require("../apis/variables/dto/variables.dto");
let SocketsController = class SocketsController {
    constructor(socketGateway, variableService) {
        this.socketGateway = socketGateway;
        this.variableService = variableService;
    }
    onModuleInit() {
        console.log('socket init');
        this.getVariable();
        setTimeout(() => {
            this.conSocket();
        }, 5000);
    }
    async getVariable() {
        global.robotSerial = await this.variableService.getVariable('robotSerial');
        global.kafka_url = await this.variableService.getVariable('kafka_url');
        global.mqtt_url = await this.variableService.getVariable('mqtt_url');
        global.frs_socket = await this.variableService.getVariable('frs_socket');
        global.frs_api = await this.variableService.getVariable('frs_api');
        global.frs_url = await this.variableService.getVariable('frs_url');
        global.apiUri = await this.variableService.getVariable('apiUri');
        global.socketUri = await this.variableService.getVariable('socketUri');
    }
    async conSocket() {
        socket_logger_1.default.info(`[CONNECT] ConnectSocket : ${global.robotSn}, ${global.frs_socket}`);
        this.socketGateway.connectFrsSocket(global.frs_socket);
    }
    async getFrsUrl(res) {
        try {
            if (!global.frs_url)
                global.frs_url = await this.variableService.getVariable('frs_url');
            if (!global.frs_api)
                global.frs_api = await this.variableService.getVariable('frs_api');
            if (!global.frs_socket)
                global.frs_socket =
                    await this.variableService.getVariable('frs_socket');
            res.send({
                url: global.frs_url,
                socket: global.frs_socket,
                api: global.frs_api,
            });
        }
        catch (error) {
            http_logger_1.default.error(`SOCKET] getFrsUrl: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async updateFrsUrl(data, res) {
        try {
            const url = data.url;
            http_logger_1.default.info(`[SOCKET] set FRS URL: ${JSON.stringify(data)}`);
            if (url == '' || !url.includes('http://')) {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            global.kafka_url = url.replace('http://', '') + ':9092';
            global.mqtt_url = url.replace('http://', 'mqtt://') + ':1883';
            global.frs_url = url;
            global.frs_api = url + ':3000';
            global.frs_socket = url + ':3001/socket/robots';
            await this.variableService.upsertVariable('kafka_url', global.kafka_url);
            await this.variableService.upsertVariable('mqtt_url', global.mqtt_url);
            await this.variableService.upsertVariable('frs_url', global.frs_url);
            await this.variableService.upsertVariable('frs_api', global.frs_api);
            await this.variableService.upsertVariable('frs_socket', global.frs_socket);
            this.socketGateway.connectFrsSocket(global.frs_socket);
            res.send({ url: url, socket: global.frs_socket, api: global.frs_api });
        }
        catch (error) {
            http_logger_1.default.error(`[SOCKET] set FRS URL: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async updateFrsUrlTest(data, res) {
        try {
            const url = data.url;
            http_logger_1.default.warn(`[SOCKET] update FRS URL Test: ${url}`);
            if (url == '' || !url.includes('http://')) {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            global.frs_url = url;
            global.frs_api = url + ':3010';
            global.frs_socket = url + ':3011/socket/robots';
            await this.variableService.upsertVariable('frs_url', global.frs_url);
            await this.variableService.upsertVariable('frs_api', global.frs_api);
            await this.variableService.upsertVariable('frs_socket', global.frs_socket);
            this.socketGateway.connectFrsSocket(global.frs_socket);
            res.send({ url: url, socket: global.frs_socket, api: global.frs_api });
        }
        catch (error) {
            http_logger_1.default.error(`[SOCKET] update FRS URL Test: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getFrsInfo(res) {
        try {
            if (!global.frs_url)
                global.frs_url = await this.variableService.getVariable('frs_url');
            if (!global.frs_api)
                global.frs_api = await this.variableService.getVariable('frs_api');
            if (!global.frs_socket)
                global.frs_socket =
                    await this.variableService.getVariable('frs_socket');
            if (!global.mqtt_url)
                global.mqtt_url = await this.variableService.getVariable('mqtt_url');
            if (!global.kafka_url)
                global.kafka_url = await this.variableService.getVariable('kafka_url');
            res.send({
                connection: global.frsConnect,
                robotSerial: global.robotSerial,
                robotNm: global.robotNm,
                url: global.frs_url,
                mqtt: global.mqtt_url,
                kafka: global.kafka_url,
                kafka_connection: global.kafkaConnect,
                mqtt_connection: global.mqttConnect,
                socket: global.frs_socket,
                api: global.frs_api,
            });
        }
        catch (error) {
            http_logger_1.default.error(`[SOCKET] get FRS: ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getStatus(res) {
        res.send({
            ...this.socketGateway.robotState,
            slam: this.socketGateway.slamnav ? true : false,
            task: this.socketGateway.taskState,
        });
    }
    async lidarOn(data, res) {
        try {
            if (this.socketGateway.slamnav) {
                http_logger_1.default.info(`[SOCKET] lidar OnOff: ${data.command} -> ${data.frequency}`);
                this.socketGateway.slamnav?.emit('lidarOnOff', JSON.stringify({ ...data, time: Date.now().toString() }));
                res.send();
            }
            else {
                throw new common_1.HttpException('SLAMNAV가 연결되지 않았습니다.', common_1.HttpStatus.BAD_GATEWAY);
            }
        }
        catch (error) {
            http_logger_1.default.error(`[SOCKET] lidar OnOff: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async pathOn(data, res) {
        try {
            if (this.socketGateway.slamnav) {
                http_logger_1.default.info(`[SOCKET] path OnOff: ${data.command} -> ${data.frequency}`);
                this.socketGateway.slamnav?.emit('pathOnOff', JSON.stringify({ ...data, time: Date.now().toString() }));
                res.send();
            }
            else {
                throw new common_1.HttpException('SLAMNAV가 연결되지 않았습니다.', common_1.HttpStatus.BAD_GATEWAY);
            }
        }
        catch (error) {
            http_logger_1.default.error(`[SOCKET] path OnOff: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async setRobotSerial(data, res) {
        try {
            http_logger_1.default.info(`[SOCKET] setRobotSerial : ${data.key}, ${data.value}`);
            if (data.key == 'robotSerial') {
                await this.variableService.upsertVariable(data.key, data.value);
                global.robotSerial = data.value;
                this.conSocket();
                res.send({ robotSerial: data.value });
            }
            else {
                res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400);
            }
        }
        catch (error) {
            http_logger_1.default.error(`[SOCKET] setRobotSerial : ${data.key}, ${data.value}, ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async setDebugMode(onoff, res) {
        try {
            if (onoff == 'on') {
                this.socketGateway.setDebugMode(true);
            }
            else {
                this.socketGateway.setDebugMode(false);
            }
            res.send({ onoff: onoff });
        }
        catch (error) {
            http_logger_1.default.error(`[SOCKET] setDebugMode : ${onoff}, ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
};
exports.SocketsController = SocketsController;
__decorate([
    (0, common_1.Get)('frs/url'),
    (0, swagger_1.ApiOperation)({
        summary: 'FRS URL 조회',
        description: 'DB에 저장된 FRS URL 정보 조회 url(URL), socket(SOCKETURL), api(APIURL)',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "getFrsUrl", null);
__decorate([
    (0, common_1.Put)('frs/url'),
    (0, swagger_1.ApiOperation)({
        summary: 'FRS URL 변경',
        description: '입력된 url 값으로 FRS URL 변경 및 재연결시도',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [frs_url_dto_1.FrsUrlDto, Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "updateFrsUrl", null);
__decorate([
    (0, common_1.Put)('frs/url/test'),
    (0, swagger_1.ApiOperation)({
        summary: 'FRS URL 변경',
        description: '입력된 url 값으로 FRS URL 변경 및 재연결시도 (TEST버전으로 3010, 3011 포트로 연결)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [frs_url_dto_1.FrsUrlDto, Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "updateFrsUrlTest", null);
__decorate([
    (0, common_1.Get)('frs'),
    (0, swagger_1.ApiOperation)({
        summary: 'FRS 소켓 정보 요청',
        description: 'connection(FRS연결상태), robotSerial(로봇시리얼넘버), name(로봇이름), url(URL), socket(SOCKETURL), api(APIURL)',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "getFrsInfo", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: '로봇 상태조회',
        description: 'SLAMNAV에서 송신하는 status에 Task state, slam connection 추가하여 조회',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('lidar'),
    (0, swagger_1.ApiOperation)({
        summary: '라이다 통신 ON/Off',
        description: '라이다 소켓 통신 열기, frequency(통신주기)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lidar_onoff_dto_1.EmitOnOffDto, Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "lidarOn", null);
__decorate([
    (0, common_1.Post)('path'),
    (0, swagger_1.ApiOperation)({
        summary: '경로 통신 ON/Off',
        description: '경로 소켓 통신 열기, frequency(통신주기)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lidar_onoff_dto_1.EmitOnOffDto, Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "pathOn", null);
__decorate([
    (0, common_1.Post)('serial'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [variables_dto_1.VariableDto, Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "setRobotSerial", null);
__decorate([
    (0, common_1.Post)('debug/:onoff'),
    __param(0, (0, common_1.Param)('onoff')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocketsController.prototype, "setDebugMode", null);
exports.SocketsController = SocketsController = __decorate([
    (0, swagger_1.ApiTags)('소켓 관련 API (Sockets)'),
    (0, common_1.Controller)('sockets'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway,
        variables_service_1.VariablesService])
], SocketsController);
//# sourceMappingURL=sockets.controller.js.map