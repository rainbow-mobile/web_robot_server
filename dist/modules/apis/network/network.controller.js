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
exports.NetworkController = void 0;
const common_1 = require("@nestjs/common");
const network_service_1 = require("./network.service");
const swagger_1 = require("@nestjs/swagger");
const http_logger_1 = require("../../../common/logger/http.logger");
const network_dto_1 = require("./dto/network.dto");
const network_wifi_dto_1 = require("./dto/network.wifi.dto");
const variables_service_1 = require("../variables/variables.service");
let NetworkController = class NetworkController {
    constructor(networkService, variableService) {
        this.networkService = networkService;
        this.variableService = variableService;
    }
    async getCurrentNetwork(res) {
        try {
            http_logger_1.default.debug(`[NETWORK] getCurrentNetwork`);
            const response = await this.networkService.getNetwork();
            http_logger_1.default.debug(`[NETWORK] getCurrentNetwork: ${JSON.stringify(response)}`);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[NETWORK] getCurrentNetwork: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getCurrentNetworkWifi(res) {
        try {
            http_logger_1.default.debug(`[NETWORK] getCurrentNetworkWifi`);
            const response = await this.networkService.getCurrentWifi();
            http_logger_1.default.debug(`[NETWORK] getCurrentNetworkWifi: ${JSON.stringify(response)}`);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[NETWORK] getCurrentNetworkWifi: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getWifiList(res) {
        try {
            http_logger_1.default.debug(`[NETWORK] getWifiList`);
            const response = await this.networkService.getWifiList();
            http_logger_1.default.debug(`[NETWORK] getWifiList: ${JSON.stringify(response)}`);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[NETWORK] getWifiList: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async scanWifiList(res) {
        try {
            http_logger_1.default.debug(`[NETWORK] scanWifiList`);
            const response = await this.networkService.wifiScan();
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[NETWORK] scanWifiList: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async updateNetwork(data, res) {
        try {
            http_logger_1.default.debug(`[NETWORK] updateNetwork`);
            const response = await this.networkService.setIP(data);
            http_logger_1.default.debug(`[NETWORK] updateNetwork: ${JSON.stringify(response)}`);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[NETWORK] updateNetwork: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async connectWifi(data, res) {
        try {
            http_logger_1.default.debug(`[NETWORK] connectWifi`);
            const response = await this.networkService.connectWifi(data);
            http_logger_1.default.debug(`[NETWORK] connectWifi: ${JSON.stringify(response)}`);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[NETWORK] connectWifi: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
};
exports.NetworkController = NetworkController;
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({
        summary: '현재 네트워크 상태 조회',
        description: '연결된 이더넷, 와이파이, 블루투스테더링 상태 반환',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "getCurrentNetwork", null);
__decorate([
    (0, common_1.Get)('current/wifi'),
    (0, swagger_1.ApiOperation)({
        summary: '현재 와이파이 상태 조회',
        description: '연결된 와이파이 상태 반환',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "getCurrentNetworkWifi", null);
__decorate([
    (0, common_1.Get)('wifi'),
    (0, swagger_1.ApiOperation)({
        summary: '주변 와이파이 리스트 조회',
        description: '연결가능한 주변 와이파이 리스트 반환',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "getWifiList", null);
__decorate([
    (0, common_1.Get)('wifi/scan'),
    (0, swagger_1.ApiOperation)({
        summary: '주변 와이파이 리스트 조회(재스캔)',
        description: '연결가능한 주변 와이파이 리스트 반환 (다시 스캔)',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "scanWifiList", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({
        summary: '연결된 네트워크 정보 수정',
        description: '연결된 네트워크 정보 업데이트',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_dto_1.NetworkDto, Object]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "updateNetwork", null);
__decorate([
    (0, common_1.Post)('wifi'),
    (0, swagger_1.ApiOperation)({
        summary: '와이파이 새로 연결',
        description: '와이파이 새로 연결',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_wifi_dto_1.NetworkWifiDto, Object]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "connectWifi", null);
exports.NetworkController = NetworkController = __decorate([
    (0, swagger_1.ApiTags)('네트워크 관련 API (network)'),
    (0, common_1.Controller)('network'),
    __metadata("design:paramtypes", [network_service_1.NetworkService,
        variables_service_1.VariablesService])
], NetworkController);
//# sourceMappingURL=network.controller.js.map