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
exports.MotionController = void 0;
const common_1 = require("@nestjs/common");
const motion_service_1 = require("./motion.service");
const swagger_1 = require("@nestjs/swagger");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const motion_dto_1 = require("./dto/motion.dto");
const http_logger_1 = require("../../../common/logger/http.logger");
let MotionController = class MotionController {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async move(data) {
        http_logger_1.default.info(`[MOTION] motionControl: ${JSON.stringify(data)}`);
        return this.motionService.motionCommand(data);
    }
};
exports.MotionController = MotionController;
__decorate([
    (0, common_1.Inject)(),
    __metadata("design:type", motion_service_1.MotionService)
], MotionController.prototype, "motionService", void 0);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [motion_dto_1.MotionCommandDto]),
    __metadata("design:returntype", Promise)
], MotionController.prototype, "move", null);
exports.MotionController = MotionController = __decorate([
    (0, swagger_1.ApiTags)('로봇 motion 관련 api (motion)'),
    (0, common_1.Controller)('motion'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], MotionController);
