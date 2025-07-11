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
exports.MoveController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const move_service_1 = require("./move.service");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const http_logger_1 = require("../../../common/logger/http.logger");
const move_command_dto_1 = require("./dto/move.command.dto");
const error_util_1 = require("../../../common/util/error.util");
const influxdb3_client_1 = require("@influxdata/influxdb3-client");
let MoveController = class MoveController {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async moveControl(data, res) {
        try {
            http_logger_1.default.info(`[MOVE] moveControl: ${JSON.stringify(data)}`);
            if (data.command == 'goal') {
                if (data.goal_id == '' || data.method == '' || data.preset == '') {
                    http_logger_1.default.warn(`[MOVE] moveControl: move Goal parameter missing`);
                    return res
                        .status(common_1.HttpStatus.BAD_REQUEST)
                        .send({ message: 'parameter missing (id, method, preset)' });
                }
            }
            else if (data.command == 'target') {
                if (data.x == '' ||
                    data.y == '' ||
                    data.rz == '' ||
                    data.method == '' ||
                    data.preset == '') {
                    http_logger_1.default.warn(`[MOVE] moveControl: move Target parameter missing`);
                    return res
                        .status(common_1.HttpStatus.BAD_REQUEST)
                        .send({ message: 'parameter missing (x, y, rz, method, preset)' });
                }
            }
            else if (data.command == 'jog') {
                if (data.vx == '' || data.vy == '' || data.wz == '') {
                    http_logger_1.default.warn(`[MOVE] moveControl: move Target parameter missing`);
                    return res
                        .status(common_1.HttpStatus.BAD_REQUEST)
                        .send({ message: 'parameter missing (x, y, rz, method, preset)' });
                }
            }
            else if (data.command == 'stop' ||
                data.command == 'pause' ||
                data.command == 'resume') {
            }
            else {
                http_logger_1.default.warn(`[MOVE] moveControl: move Command parameter unknown : ${data.command}`);
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: 'Unknown Parameter (command)' });
            }
            const newData = { ...data, time: Date.now().toString() };
            http_logger_1.default.debug(`[MOVE] moveControl: ${JSON.stringify(newData)}`);
            if (data.command != 'jog') {
                const response = await this.moveService.moveCommand(newData);
                http_logger_1.default.debug(`[MOVE] moveControl Response: ${JSON.stringify(response)}`);
                return res.send(response);
            }
            else {
                this.moveService.moveJog(newData);
                return res.send();
            }
        }
        catch (error) {
            http_logger_1.default.error(`[MOVE] moveControl: ${JSON.stringify(data)}, ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async moveStop(res) {
        try {
            const newData = { command: 'stop', time: Date.now().toString() };
            http_logger_1.default.debug(`[MOVE] moveStop: ${JSON.stringify(newData)}`);
            const response = await this.moveService.moveCommand(newData);
            http_logger_1.default.debug(`[MOVE] moveStop Response: ${JSON.stringify(response)}`);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[MOVE] moveStop:  ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async movePause(res) {
        try {
            const newData = { command: 'pause', time: Date.now().toString() };
            http_logger_1.default.debug(`[MOVE] movePause: ${JSON.stringify(newData)}`);
            const response = await this.moveService.moveCommand(newData);
            http_logger_1.default.debug(`[MOVE] movePause Response: ${JSON.stringify(response)}`);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[MOVE] movePause: ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async moveResume(res) {
        try {
            const newData = { command: 'resume', time: Date.now().toString() };
            http_logger_1.default.debug(`[MOVE] moveResume: ${JSON.stringify(newData)}`);
            const response = await this.moveService.moveCommand(newData);
            http_logger_1.default.debug(`[MOVE] moveResume Response: ${JSON.stringify(response)}`);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[MOVE] moveResume: ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async moveLog(num) {
        try {
            return this.moveService.getMoveLog(num);
        }
        catch (error) {
            http_logger_1.default.error(`[MOVE] moveLog: ${(0, error_util_1.errorToJson)(error)}`);
            if (error instanceof influxdb3_client_1.HttpError)
                throw error;
            throw new influxdb3_client_1.HttpError(common_1.HttpStatus.INTERNAL_SERVER_ERROR, '에러가 발생했습니다.');
        }
    }
    async moveGoalLog(num) {
        try {
            return this.moveService.getMoveLog(num, 'goal');
        }
        catch (error) {
            http_logger_1.default.error(`[MOVE] moveGoalLog: ${(0, error_util_1.errorToJson)(error)}`);
            if (error instanceof influxdb3_client_1.HttpError)
                throw error;
            throw new influxdb3_client_1.HttpError(common_1.HttpStatus.INTERNAL_SERVER_ERROR, '에러가 발생했습니다.');
        }
    }
};
exports.MoveController = MoveController;
__decorate([
    (0, common_1.Inject)(),
    __metadata("design:type", move_service_1.MoveService)
], MoveController.prototype, "moveService", void 0);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '이동 명령',
        description: `이동 명령을 요청합니다.
     command의 값에는 goal, target, jog, stop, pause, resume 이 존재합니다.
     command가 goal인 경우, id, method, preset을 파라메터로 인식합니다.
     command가 target인 경우, x,y,z,rz,method,preset을 파라메터로 인식합니다.
     command가 jog인 경우, vx, vy, wz를 파라메터로 인식합니다.
     그 외의 command는 파라메터를 입력받지 않습니다.
     method는 주행방식을 선언합니다. 기본 pp (point to point) 방식으로 주행하며 그 외 주행방식은 아직 미지원합니다.
     preset은 지정된 속도프리셋을 설정합니다. 아직 미지원합니다.`,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MOVE.MOVE_ACCEPT_200,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [move_command_dto_1.MoveCommandDto, Object]),
    __metadata("design:returntype", Promise)
], MoveController.prototype, "moveControl", null);
__decorate([
    (0, common_1.Get)('stop'),
    (0, swagger_1.ApiOperation)({
        summary: '이동 정지 명령',
        description: '이동 정지를 요청합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MOVE.MOVE_ACCEPT_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MoveController.prototype, "moveStop", null);
__decorate([
    (0, common_1.Get)('pause'),
    (0, swagger_1.ApiOperation)({
        summary: '이동 일시정지 명령',
        description: '이동 일시정지를 요청합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MOVE.MOVE_ACCEPT_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MoveController.prototype, "movePause", null);
__decorate([
    (0, common_1.Get)('resume'),
    (0, swagger_1.ApiOperation)({
        summary: '이동 재개 명령',
        description: '이동 재개를 요청합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.MOVE.MOVE_ACCEPT_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MoveController.prototype, "moveResume", null);
__decorate([
    (0, common_1.Get)('log/:num'),
    (0, swagger_1.ApiOperation)({
        summary: '이동 명령 이력 조회',
        description: '이동 명령 이력을 조회합니다. ',
    }),
    __param(0, (0, common_1.Param)('num')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MoveController.prototype, "moveLog", null);
__decorate([
    (0, common_1.Get)('log/goal/:num'),
    (0, swagger_1.ApiOperation)({
        summary: 'Goal 이동 명령 이력 조회',
        description: 'Goal 이동 명령 이력을 조회합니다. ',
    }),
    __param(0, (0, common_1.Param)('num')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MoveController.prototype, "moveGoalLog", null);
exports.MoveController = MoveController = __decorate([
    (0, swagger_1.ApiTags)('이동 관련 API (move)'),
    (0, common_1.Controller)('move'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], MoveController);
