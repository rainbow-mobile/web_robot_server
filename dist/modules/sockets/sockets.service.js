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
exports.SocketService = void 0;
const common_1 = require("@nestjs/common");
const sockets_gateway_1 = require("./gateway/sockets.gateway");
const log_service_1 = require("../apis/log/log.service");
let SocketService = class SocketService {
    constructor(socketGateway, logService) {
        this.socketGateway = socketGateway;
        this.logService = logService;
        this.saver = setInterval(() => {
            if (this.socketGateway.slamnav) {
                this.logService.emitStatus(this.socketGateway.robotState, this.socketGateway.slamnav ? true : false, this.socketGateway.taskState);
            }
        }, 10000);
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway, log_service_1.LogService])
], SocketService);
//# sourceMappingURL=sockets.service.js.map