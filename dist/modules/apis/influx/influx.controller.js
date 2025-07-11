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
exports.INFLUXController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const influx_service_1 = require("./influx.service");
let INFLUXController = class INFLUXController {
    constructor(influxService) {
        this.influxService = influxService;
    }
    async test(time, res) {
        await this.influxService.testStatus(time);
        res.send();
    }
    async sshConnect(res) {
        try {
            await this.influxService.writeData();
            res.send(await this.influxService.queryData('sensors', 'home'));
        }
        catch (error) {
            console.error(error);
            res.send();
        }
    }
};
exports.INFLUXController = INFLUXController;
__decorate([
    (0, common_1.Get)(':time'),
    __param(0, (0, common_1.Param)('time')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], INFLUXController.prototype, "test", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], INFLUXController.prototype, "sshConnect", null);
exports.INFLUXController = INFLUXController = __decorate([
    (0, swagger_1.ApiTags)('INFLUX 관련 API (influx)'),
    (0, common_1.Controller)('influx'),
    __metadata("design:paramtypes", [influx_service_1.InfluxDBService])
], INFLUXController);
