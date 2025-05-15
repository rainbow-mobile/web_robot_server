"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketsModule = void 0;
const common_1 = require("@nestjs/common");
const sockets_controller_1 = require("./sockets.controller");
const sockets_gateway_1 = require("./gateway/sockets.gateway");
const variables_module_1 = require("../apis/variables/variables.module");
const log_module_1 = require("../apis/log/log.module");
const sockets_service_1 = require("./sockets.service");
const mqtt_service_1 = require("./mqtt/mqtt.service");
const kafka_service_1 = require("./kafka/kafka.service");
const network_service_1 = require("../apis/network/network.service");
const ssh_gateway_1 = require("./gateway/ssh.gateway");
const influx_service_1 = require("../apis/influx/influx.service");
const upload_service_1 = require("../apis/upload/upload.service");
let SocketsModule = class SocketsModule {
};
exports.SocketsModule = SocketsModule;
exports.SocketsModule = SocketsModule = __decorate([
    (0, common_1.Module)({
        imports: [variables_module_1.VariablesModule, log_module_1.LogModule],
        controllers: [sockets_controller_1.SocketsController],
        providers: [
            sockets_gateway_1.SocketGateway,
            upload_service_1.UploadService,
            influx_service_1.InfluxDBService,
            ssh_gateway_1.SSHGateway,
            sockets_service_1.SocketService,
            mqtt_service_1.MqttClientService,
            network_service_1.NetworkService,
            kafka_service_1.KafkaClientService,
        ],
        exports: [sockets_gateway_1.SocketGateway],
    })
], SocketsModule);
//# sourceMappingURL=sockets.module.js.map