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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const os = require("os");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const task_service_1 = require("./task.service");
const http_logger_1 = require("../../../common/logger/http.logger");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const path_1 = require("path");
const task_save_dto_1 = require("./dto/task.save.dto");
const error_util_1 = require("../../../common/util/error.util");
const fs = require("fs");
const os_1 = require("os");
const config_1 = require("@nestjs/config");
let TaskController = class TaskController {
    constructor(socketGateway, configService) {
        this.socketGateway = socketGateway;
        this.configService = configService;
        this.dataBasePath = this.configService.get('dataBasePath');
    }
    async getTaskFile(res) {
        try {
            http_logger_1.default.info(`[TASK] getTaskFile: ${JSON.stringify(this.socketGateway.taskState)}`);
            return res.send(this.socketGateway.taskState);
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] getTaskFile: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getTaskInfo(res) {
        try {
            http_logger_1.default.info(`[TASK] getTaskInfo`);
            const info = await this.taskService.getTaskInfo();
            http_logger_1.default.info(`[TASK] getTaskInfo: file(${info.file}), taskId(${info.id}), running(${info.running}), variables length(${info.variables.length})`);
            return res.send(info);
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] getTaskInfo: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async loadTask(mapName, taskName, res) {
        try {
            http_logger_1.default.info(`loadTask : ${mapName}, ${taskName}`);
            const path = (0, path_1.join)((0, os_1.homedir)(), 'maps', mapName, taskName);
            const path2 = (0, path_1.join)(this.dataBasePath, 'maps', mapName, taskName);
            if (fs.existsSync(path2)) {
                const data = await this.taskService.loadTask(path2);
                return res.send(data);
            }
            else {
                const data = await this.taskService.loadTask(path);
                return res.send(data);
            }
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] loadTask: ${mapName}, ${taskName}, ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async runTask(res) {
        try {
            http_logger_1.default.info(`[TASK] runTask`);
            await this.taskService.runTask();
            return res
                .status(common_1.HttpStatus.ACCEPTED)
                .send({ message: '성공적으로 요청했습니다' });
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] runTask: ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async stopTask(res) {
        try {
            http_logger_1.default.info(`[TASK] stopTask`);
            await this.taskService.stopTask();
            return res
                .status(common_1.HttpStatus.ACCEPTED)
                .send({ message: '성공적으로 요청했습니다' });
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] stopTask Error : ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async readTaskList(mapName, res) {
        try {
            http_logger_1.default.info(`[TASK] readTaskList: ${mapName}`);
            const path = (0, path_1.join)((0, os_1.homedir)(), 'maps', mapName);
            const path2 = (0, path_1.join)(this.dataBasePath, 'maps', mapName);
            if (fs.existsSync(path2)) {
                const data = await this.taskService.getTaskList(path2);
                return res.send(data);
            }
            else {
                const data = await this.taskService.getTaskList(path);
                return res.send(data);
            }
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] readTaskList: ${mapName}, ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async readTask(mapName, taskName, res) {
        try {
            http_logger_1.default.info(`[TASK] readTask: ${mapName},${taskName}`);
            if (taskName.split('.').length == 1) {
                taskName += '.task';
            }
            const path = (0, path_1.join)((0, os_1.homedir)(), 'maps', mapName, taskName);
            const path2 = (0, path_1.join)(this.dataBasePath, 'maps', mapName, taskName);
            if (fs.existsSync(path2)) {
                const data = await this.taskService.parse(path2);
                return res.send(data);
            }
            else {
                const data = await this.taskService.parse(path);
                return res.send(data);
            }
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] readTask: ${mapName}, ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async saveTask(data, mapName, taskName, res) {
        try {
            http_logger_1.default.info(`readTask : ${os.homedir()} ${mapName},${taskName}`);
            if (taskName.split('.').length == 1) {
                taskName += '.task';
            }
            const path = (0, path_1.join)((0, os_1.homedir)(), 'maps', mapName, taskName);
            const path2 = (0, path_1.join)(this.dataBasePath, 'maps', mapName, taskName);
            if (fs.existsSync(path2)) {
                const task = await this.taskService.save(path2, data.data);
                return res.send(task);
            }
            else {
                const task = await this.taskService.save(path, data.data);
                return res.send(task);
            }
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] saveTask: ${mapName}, ${taskName}, ${(0, error_util_1.errorToJson)(error)}`);
            return res.status(error.status).send(error.data);
        }
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Inject)(),
    __metadata("design:type", task_service_1.TaskService)
], TaskController.prototype, "taskService", void 0);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '태스크 데이터 요청',
        description: '태스크 데이터 요청합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTaskFile", null);
__decorate([
    (0, common_1.Get)('info'),
    (0, swagger_1.ApiOperation)({
        summary: '태스크 정보 조회',
        description: '태스크 정보를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTaskInfo", null);
__decorate([
    (0, common_1.Get)('load/:mapName/:taskName'),
    (0, swagger_1.ApiOperation)({
        summary: '태스크 로드',
        description: '태스크를 로드합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.NOT_FOUND_404,
    }),
    __param(0, (0, common_1.Param)('mapName')),
    __param(1, (0, common_1.Param)('taskName')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "loadTask", null);
__decorate([
    (0, common_1.Get)('run'),
    (0, swagger_1.ApiOperation)({
        summary: '태스크 실행',
        description: '태스크 실행을 요청합니다',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "runTask", null);
__decorate([
    (0, common_1.Get)('stop'),
    (0, swagger_1.ApiOperation)({
        summary: '태스크 종료',
        description: '태스크 종료를 요청합니다',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "stopTask", null);
__decorate([
    (0, common_1.Get)('list/:mapName'),
    (0, swagger_1.ApiOperation)({
        summary: '태스크 목록 조회',
        description: '태스크 목록을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.NOT_FOUND_404,
    }),
    __param(0, (0, common_1.Param)('mapName')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "readTaskList", null);
__decorate([
    (0, common_1.Get)('file/:mapName/:taskName'),
    (0, swagger_1.ApiOperation)({
        summary: '태스크 트리 조회',
        description: '태스크 트리를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.SUCCESS_READ_LIST_200,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.NOT_FOUND_404,
    }),
    __param(0, (0, common_1.Param)('mapName')),
    __param(1, (0, common_1.Param)('taskName')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "readTask", null);
__decorate([
    (0, common_1.Post)('file/:mapName/:taskName'),
    (0, swagger_1.ApiOperation)({
        summary: '태스크 트리 저장',
        description: '태스크 트리를 저장합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.SUCCESS_201,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: http_status_messages_constants_1.HttpStatusMessagesConstants.TASK.NOT_FOUND_404,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('mapName')),
    __param(2, (0, common_1.Param)('taskName')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_save_dto_1.TaskSaveDto, String, String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "saveTask", null);
exports.TaskController = TaskController = __decorate([
    (0, swagger_1.ApiTags)('태스크 관련 API (task)'),
    (0, common_1.Controller)('task'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway,
        config_1.ConfigService])
], TaskController);
//# sourceMappingURL=task.controller.js.map