"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnvifDeviceModule = void 0;
const common_1 = require("@nestjs/common");
const onvif_service_1 = require("./onvif.service");
const onvif_controller_1 = require("./onvif.controller");
const sockets_module_1 = require("../../sockets/sockets.module");
const variables_module_1 = require("../variables/variables.module");
let OnvifDeviceModule = class OnvifDeviceModule {
};
exports.OnvifDeviceModule = OnvifDeviceModule;
exports.OnvifDeviceModule = OnvifDeviceModule = __decorate([
    (0, common_1.Module)({
        imports: [sockets_module_1.SocketsModule, variables_module_1.VariablesModule],
        providers: [onvif_service_1.OnvifDeviceService],
        controllers: [onvif_controller_1.OnvifDeviceController],
        exports: [onvif_service_1.OnvifDeviceService],
    })
], OnvifDeviceModule);
