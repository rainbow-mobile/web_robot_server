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
exports.ProcessController = void 0;
const common_1 = require("@nestjs/common");
const process_service_1 = require("./process.service");
const swagger_1 = require("@nestjs/swagger");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const http_logger_1 = require("../../../common/logger/http.logger");
let ProcessController = class ProcessController {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async getConnection(res) {
        try {
            res.send(await this.socketGateway.getConnection());
        }
        catch (error) {
            http_logger_1.default.error(`[PROCESS] getConnection: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getRobotInfo() {
        return this.processService.getRobotInfo();
    }
    async writeRobotInfo(body) {
        return this.processService.writeRobotInfo(body);
    }
    async updateRobotInfo(body) {
        return this.processService.updateRobotInfo(body);
    }
};
exports.ProcessController = ProcessController;
__decorate([
    (0, common_1.Inject)(),
    __metadata("design:type", process_service_1.ProcessService)
], ProcessController.prototype, "processService", void 0);
__decorate([
    (0, common_1.Get)('connection'),
    (0, swagger_1.ApiOperation)({
        summary: '프로그램 연결상태 요청',
        description: '프로그램 연결상태를 요청합니다.',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProcessController.prototype, "getConnection", null);
__decorate([
    (0, common_1.Get)('robot-info'),
    (0, swagger_1.ApiOperation)({
        summary: '로봇 정보 요청',
        description: '로봇 정보를 요청합니다.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProcessController.prototype, "getRobotInfo", null);
__decorate([
    (0, common_1.Post)('robot-info'),
    (0, swagger_1.ApiOperation)({
        summary: '로봇 정보 수정',
        description: '로봇 정보를 수정합니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProcessController.prototype, "writeRobotInfo", null);
__decorate([
    (0, common_1.Put)('robot-info'),
    (0, swagger_1.ApiOperation)({
        summary: '로봇 정보 수정',
        description: '로봇 정보를 수정합니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProcessController.prototype, "updateRobotInfo", null);
exports.ProcessController = ProcessController = __decorate([
    (0, swagger_1.ApiTags)('프로그램 관련 API (process)'),
    (0, common_1.Controller)('process'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], ProcessController);
//# sourceMappingURL=process.controller.js.map