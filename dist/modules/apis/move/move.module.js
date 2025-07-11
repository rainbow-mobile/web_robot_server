"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveModule = void 0;
const common_1 = require("@nestjs/common");
const move_service_1 = require("./move.service");
const move_controller_1 = require("./move.controller");
const sockets_module_1 = require("../../sockets/sockets.module");
const typeorm_1 = require("@nestjs/typeorm");
const move_entity_1 = require("./entity/move.entity");
let MoveModule = class MoveModule {
};
exports.MoveModule = MoveModule;
exports.MoveModule = MoveModule = __decorate([
    (0, common_1.Module)({
        imports: [sockets_module_1.SocketsModule, typeorm_1.TypeOrmModule.forFeature([move_entity_1.MoveLogEntity])],
        providers: [move_service_1.MoveService],
        controllers: [move_controller_1.MoveController],
        exports: [move_service_1.MoveService],
    })
], MoveModule);
