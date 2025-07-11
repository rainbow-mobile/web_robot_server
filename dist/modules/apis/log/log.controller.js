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
exports.LogController = void 0;
const log_service_1 = require("./log.service");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const http_logger_1 = require("../../../common/logger/http.logger");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const status_dto_1 = require("./dto/status.dto");
const log_read_dto_1 = require("./dto/log.read.dto");
const pagination_response_1 = require("../../../common/pagination/pagination.response");
const error_util_1 = require("../../../common/util/error.util");
const microservices_1 = require("@nestjs/microservices");
const path = require("path");
const file_util_1 = require("../../../common/util/file.util");
let LogController = class LogController {
    constructor(logService) {
        this.logService = logService;
    }
    async getStatus(param, res) {
        try {
            http_logger_1.default.debug(`[LOG] getStatus Log`);
            const data = await this.logService.getStatus('status', param);
            res.send(data);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getStatus Log : ${(0, error_util_1.errorToJson)(error)}`);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            });
        }
    }
    async getStatusParam(key, res) {
        try {
            http_logger_1.default.debug(`[LOG] getStatusParam : ${key}`);
            const response = await this.logService.getStatusParam(key);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getStatusParam : ${key}, ${error.code}`);
            res.status(error.status).send(error.data);
        }
    }
    async archiveStatus(res) {
        try {
            http_logger_1.default.debug(`[LOG] archiveStatus`);
            const response = await this.logService.archiveOldDataDay();
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] archiveStatus: ${(0, error_util_1.errorToJson)(error)}`);
            res.status(error.status).send(error.data);
        }
    }
    async emitTestStatus(data, res) {
        try {
            http_logger_1.default.debug(`[LOG] emitTestStatus: ${JSON.stringify(data)}`);
            await this.logService.emitStatusTest(data.time);
            res.send();
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] emitTestStatus: ${JSON.stringify(data)}, ${(0, error_util_1.errorToJson)(error)}`);
            res.status(error.status).send(error.data);
        }
    }
    async getApiLog(param, res) {
        try {
            http_logger_1.default.debug(`[LOG] getApiLog: ${JSON.stringify(param)}`);
            const response = await this.logService.getLogs('http', param);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getApiLog: ${JSON.stringify(param)}, ${(0, error_util_1.errorToJson)(error)}`);
            res.status(error.status).send(error.data);
        }
    }
    async getSocketLog(param, res) {
        try {
            http_logger_1.default.debug(`[LOG] getSocketLog: ${JSON.stringify(param)}`);
            const response = await this.logService.getLogs('socket', param);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getSocketLog: ${JSON.stringify(param)}, ${(0, error_util_1.errorToJson)(error)}`);
            res.status(error.status).send(error.data);
        }
    }
    async getAlarmDetails(res) {
        try {
            const response = await this.logService.getAlarmDetails();
            res.send(response);
        }
        catch (error) {
            res.status(error.status).send(error.data);
        }
    }
    async getAlarms() {
        try {
            http_logger_1.default.debug(`[LOG] getAlarms`);
            const response = await this.logService.getAlarms();
            this.logService.setAlarmsFlag(response);
            const result = response.map(({ emitFlag, ...alarm }) => alarm);
            return result;
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getAlarms: ${(0, error_util_1.errorToJson)(error)}`);
            if (error instanceof microservices_1.RpcException)
                throw error;
            throw new microservices_1.RpcException('서버에 에러가 발생했습니다.');
        }
    }
    async getAlarmAll() {
        try {
            http_logger_1.default.debug(`[LOG] getAlarmAll`);
            const response = await this.logService.getAlarmsAll();
            const result = response.map(({ emitFlag, ...alarm }) => alarm);
            return result;
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getAlarmAll: ${(0, error_util_1.errorToJson)(error)}`);
            if (error instanceof microservices_1.RpcException)
                throw error;
            throw new microservices_1.RpcException('서버에 에러가 발생했습니다.');
        }
    }
    async alarmReset() {
        try {
            return this.logService.resetAlarms();
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] alarmReset: ${(0, error_util_1.errorToJson)(error)}`);
            if (error instanceof microservices_1.RpcException)
                throw error;
            throw new microservices_1.RpcException('서버에 에러가 발생했습니다.');
        }
    }
    async getGeneralLog(date) {
        try {
            console.log('getGeneralLog : ', date);
            const _path = path.join('C:/data', 'log', 'samsung-em', date + '_ROBOT.log');
            return this.logService.readGeneralLog(_path);
        }
        catch (error) {
            console.error(error);
            if (error instanceof microservices_1.RpcException)
                throw error;
            throw new microservices_1.RpcException('서버에 에러가 발생했습니다.');
        }
    }
    async deleteGeneralLog(date) {
        try {
            console.log('deleteGeneralLog : ', date);
            const _path = path.join('C:/data', 'log', 'samsung-em', date + '_ROBOT.log');
            return (0, file_util_1.deleteFile)(_path);
        }
        catch (error) {
            console.error(error);
            if (error instanceof microservices_1.RpcException)
                throw error;
            throw new microservices_1.RpcException('서버에 에러가 발생했습니다.');
        }
    }
    async getSlamnavLog(param, res) {
        try {
            http_logger_1.default.debug(`[LOG] getSlamnavLog: ${JSON.stringify(param)}`);
            res.send(new pagination_response_1.PaginationResponse(param.getOffset(), param.getLimit(), []));
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getSlamnavLog: ${JSON.stringify(param)}, ${(0, error_util_1.errorToJson)(error)}`);
            res.status(error.status).send(error.data);
        }
    }
    async getSystemLog(param, res) {
        try {
            http_logger_1.default.debug(`[LOG] getSystemLog Log`);
            const data = await this.logService.getStatus('system', param);
            res.send(data);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getSystemLog Log : ${(0, error_util_1.errorToJson)(error)}`);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            });
        }
    }
    async getSystemCpuLog(param, res) {
        try {
            http_logger_1.default.debug(`[LOG] getSystemCpuLog Log`);
            const data = await this.logService.getSystemCpu(param);
            res.send(data);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getSystemCpuLog Log : ${(0, error_util_1.errorToJson)(error)}`);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            });
        }
    }
    async getSystemProcessLog(param, res) {
        try {
            http_logger_1.default.debug(`[LOG] getSystemProcessLog Log`);
            const data = await this.logService.getSystemProcess(param);
            res.send(data);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getSystemProcessLog Log : ${(0, error_util_1.errorToJson)(error)}`);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            });
        }
    }
    async getSystemCurrent(res) {
        try {
            const data = await this.logService.getSystemCurrent();
            res.send(data);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getSystemCurrent : ${(0, error_util_1.errorToJson)(error)}`);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            });
        }
    }
    async getMemoryUsage(res) {
        try {
            this.logService.readMemoryUsage();
            res.send();
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] readMemoryUsage: ${JSON.stringify(error)}`);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            });
        }
    }
    async getLogValueKey(key, value, res) {
        try {
            http_logger_1.default.debug(`[LOG] getLogValueKey: ${key}, ${value}`);
            const response = await this.logService.getStatusParam(key + '/' + value);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getLogValueKey: ${key}, ${(0, error_util_1.errorToJson)(error)}`);
            res.status(error.status).send(error.data);
        }
    }
    async getLogKey(key, res) {
        try {
            http_logger_1.default.debug(`[LOG] getLogKey: ${key}`);
            const response = await this.logService.getStatusParam(key);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getLogKey: ${key}, ${(0, error_util_1.errorToJson)(error)}`);
            res.status(error.status).send(error.data);
        }
    }
};
exports.LogController = LogController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Status Log 조회',
        description: 'DB에 저장된 Status 리스트 반환',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_read_dto_1.LogReadDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('status/:key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getStatusParam", null);
__decorate([
    (0, common_1.Post)('status/archive'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "archiveStatus", null);
__decorate([
    (0, common_1.Post)('status'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [status_dto_1.StatusTestDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "emitTestStatus", null);
__decorate([
    (0, common_1.Get)('api'),
    (0, swagger_1.ApiOperation)({
        summary: 'API Log 조회',
        description: '파일로 저장된 API 로그 조회 ',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_read_dto_1.LogReadDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getApiLog", null);
__decorate([
    (0, common_1.Get)('socket'),
    (0, swagger_1.ApiOperation)({
        summary: 'Socket Log 조회',
        description: '파일로 저장된 Socket 로그 조회 ',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_read_dto_1.LogReadDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getSocketLog", null);
__decorate([
    (0, common_1.Get)('alarmList'),
    (0, swagger_1.ApiOperation)({
        summary: '정의된 알람 리스트 조회',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getAlarmDetails", null);
__decorate([
    (0, common_1.Get)('alarm'),
    (0, swagger_1.ApiOperation)({
        summary: '현재 활성화된 알람 리스트 조회',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getAlarms", null);
__decorate([
    (0, common_1.Get)('alarm/all'),
    (0, swagger_1.ApiOperation)({
        summary: '알람 리스트(DB) 조회',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getAlarmAll", null);
__decorate([
    (0, common_1.Delete)('alarm'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogController.prototype, "alarmReset", null);
__decorate([
    (0, common_1.Get)('generalLog/:date'),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getGeneralLog", null);
__decorate([
    (0, common_1.Delete)('generalLog/:date'),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "deleteGeneralLog", null);
__decorate([
    (0, common_1.Get)('slamnav'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_read_dto_1.LogReadDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getSlamnavLog", null);
__decorate([
    (0, common_1.Get)('system'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_read_dto_1.LogReadDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getSystemLog", null);
__decorate([
    (0, common_1.Get)('system/cpu'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_read_dto_1.LogReadDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getSystemCpuLog", null);
__decorate([
    (0, common_1.Get)('system/process'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_read_dto_1.LogReadDto, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getSystemProcessLog", null);
__decorate([
    (0, common_1.Get)('system/current'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getSystemCurrent", null);
__decorate([
    (0, common_1.Get)('test/memory'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getMemoryUsage", null);
__decorate([
    (0, common_1.Get)(':key/:value'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getLogValueKey", null);
__decorate([
    (0, common_1.Get)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getLogKey", null);
exports.LogController = LogController = __decorate([
    (0, swagger_1.ApiTags)('로그 관련 API (log)'),
    (0, common_1.Controller)('log'),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogController);
//# sourceMappingURL=log.controller.js.map