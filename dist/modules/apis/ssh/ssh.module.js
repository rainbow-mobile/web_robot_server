"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHModule = void 0;
const common_1 = require("@nestjs/common");
const sockets_module_1 = require("../../sockets/sockets.module");
const ssh_service_1 = require("./ssh.service");
const ssh_controller_1 = require("./ssh.controller");
let SSHModule = class SSHModule {
};
exports.SSHModule = SSHModule;
exports.SSHModule = SSHModule = __decorate([
    (0, common_1.Module)({
        imports: [sockets_module_1.SocketsModule],
        controllers: [ssh_controller_1.SSHController],
        providers: [ssh_service_1.SSHService],
    })
], SSHModule);
//# sourceMappingURL=ssh.module.js.map