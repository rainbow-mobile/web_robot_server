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
exports.MapController = void 0;
const common_1 = require("@nestjs/common");
const map_service_1 = require("./map.service");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const swagger_1 = require("@nestjs/swagger");
const http_logger_1 = require("../../../common/logger/http.logger");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const goal_read_dto_1 = require("./dto/goal.read.dto");
const error_util_1 = require("../../../common/util/error.util");
const pagination_response_1 = require("../../../common/pagination/pagination.response");
let MapController = class MapController {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async getList(res) {
        try {
            http_logger_1.default.debug(`[MAP] getList`);
            const response = await this.mapService.getMapList();
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[MAP] getList: ${error.status} -> $${JSON.stringify(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getCurrentMapName(res) {
        try {
            http_logger_1.default.debug(`[MAP] getCurrentMapName: ${this.socketGateway.robotState.map.map_name}`);
            res.send(JSON.stringify(this.socketGateway.robotState.map.map_name));
        }
        catch (error) {
            http_logger_1.default.error(`[MAP] getCurrentMapName: ${JSON.stringify(error)}`);
            return res
                .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500);
        }
    }
    async loadMap(mapNm, res) {
        try {
            http_logger_1.default.debug(`[MAP] loadMap: ${mapNm}`);
            if (mapNm == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: '맵 이름이 지정되지 않았습니다' });
            }
            const response = await this.mapService.loadMap(mapNm);
            http_logger_1.default.info(`[MAP] loadMap Response: ${JSON.stringify(response)}`);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[MAP] loadMap ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getCloud(mapNm, res) {
        try {
            http_logger_1.default.debug(`[MAP] getCloud: ${mapNm}`);
            const response = await this.mapService.readCloud(mapNm);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[MAP] getCloud ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async saveCloud(mapNm, data, res) {
        try {
            http_logger_1.default.debug(`[MAP] saveCloud: ${mapNm}`);
            if (mapNm == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: '맵 이름이 지정되지 않았습니다' });
            }
            else if (!Array.isArray(data) || data.length == 0) {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: '클라우드 데이터가 지정되지 않았습니다' });
            }
            const response = await this.mapService.saveCloud(mapNm, data);
            res.send(response);
            http_logger_1.default.info(`[MAP] saveCloud -> auto map load ${mapNm}`);
            this.socketGateway.slamnav?.emit('load', {
                command: 'mapload',
                name: mapNm,
                time: Date.now().toString(),
            });
        }
        catch (error) {
            http_logger_1.default.error(`[MAP] saveCloud ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getTopology(mapNm, res) {
        try {
            http_logger_1.default.debug(`[MAP] getTopology: ${mapNm}`);
            if (mapNm == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: '맵 이름이 지정되지 않았습니다' });
            }
            const response = await this.mapService.readTopology(mapNm);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[MAP] getTopology ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async saveTopology(mapNm, data, res) {
        try {
            http_logger_1.default.debug(`[MAP] saveTopology: ${mapNm}`);
            if (mapNm == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: '맵 이름이 지정되지 않았습니다' });
            }
            else if (!Array.isArray(data) || data.length == 0) {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: '토폴로지 데이터가 지정되지 않았습니다' });
            }
            const response = await this.mapService.saveTopology(mapNm, data);
            res.send(response);
            http_logger_1.default.info(`[MAP] saveTopology -> auto map load ${mapNm}`);
            this.socketGateway.slamnav?.emit('load', {
                command: 'mapload',
                name: mapNm,
                time: Date.now().toString(),
            });
        }
        catch (error) {
            http_logger_1.default.error(`[MAP] saveTopology ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getNodes(mapNm, param, res) {
        try {
            http_logger_1.default.debug(`[MAP] getNodes: ${mapNm}, ${param.pageNo}, ${param.pageSize}, ${param.type}, ${param.searchText}`);
            if (mapNm == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: '맵 이름이 지정되지 않았습니다' });
            }
            const data = await this.mapService.readTopology(mapNm);
            const goals = [];
            console.log(data.length);
            if (Array.isArray(data)) {
                data.map((node) => {
                    if (node.type == param.type) {
                        if (param.searchText != '' && param.searchText != undefined) {
                            if (node.id
                                .toLowerCase()
                                .includes(param.searchText.toLowerCase()) ||
                                node.name.toLowerCase().includes(param.searchText.toLowerCase())) {
                                goals.push({
                                    id: node.id,
                                    name: node.name,
                                    x: node.pose.split(',')[0],
                                    y: node.pose.split(',')[1],
                                    rz: node.pose.split(',')[5],
                                });
                            }
                        }
                        else {
                            goals.push({
                                id: node.id,
                                name: node.name,
                                x: node.pose.split(',')[0],
                                y: node.pose.split(',')[1],
                                rz: node.pose.split(',')[5],
                            });
                        }
                    }
                });
            }
            const totalItems = goals.length;
            let startIndex = (Number(param.pageNo) - 1) * Number(param.pageSize);
            let endIndex = startIndex + Number(param.pageSize);
            if (param.sortOption == 'name') {
                goals.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            }
            else {
                goals.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
            }
            while (startIndex >= totalItems) {
                param.pageNo--;
                startIndex = (Number(param.pageNo) - 1) * Number(param.pageSize);
                endIndex = startIndex + Number(param.pageSize);
            }
            console.log(totalItems, startIndex, endIndex);
            const items = goals.slice(startIndex, endIndex);
            console.log(items);
            res.send(new pagination_response_1.PaginationResponse(goals.length, Number(param.pageSize), items));
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getStatus Log : ${(0, error_util_1.errorToJson)(error)}`);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            });
        }
    }
    async getGoals(mapNm, res) {
        try {
            http_logger_1.default.debug(`[MAP] getGoals: ${mapNm}`);
            if (mapNm == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: '맵 이름이 지정되지 않았습니다' });
            }
            const response = await this.mapService.readTopology(mapNm);
            const goals = [];
            if (Array.isArray(response)) {
                response.map((node) => {
                    if (node.type == 'GOAL' || node.type == 'INIT') {
                        goals.push({
                            id: node.id,
                            name: node.name,
                            x: node.pose.split(',')[0],
                            y: node.pose.split(',')[1],
                            rz: node.pose.split(',')[5],
                        });
                    }
                });
            }
            goals.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            console.log('goals', goals);
            res.send(goals);
        }
        catch (error) {
            http_logger_1.default.error(`[MAP] getGoals ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`);
            return res.status(error.status).send(error.data);
        }
    }
};
exports.MapController = MapController;
__decorate([
    (0, common_1.Inject)(),
    __metadata("design:type", map_service_1.MapService)
], MapController.prototype, "mapService", void 0);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '맵 리스트 요청',
        description: '로봇의 맵 리스트를 요청합니다. cloud.csv가 없는 폴더는 반환하지 않습니다.',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({
        summary: '현재 로드된 맵 이름 요청',
        description: '로봇의 맵 이름을 요청합니다.',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "getCurrentMapName", null);
__decorate([
    (0, common_1.Post)('load/:mapNm'),
    (0, swagger_1.ApiOperation)({
        summary: '맵 로드 요청',
        description: 'SLAMNAV에 맵 로드를 요청합니다.',
    }),
    __param(0, (0, common_1.Param)('mapNm')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "loadMap", null);
__decorate([
    (0, common_1.Get)('cloud/:mapNm'),
    (0, swagger_1.ApiOperation)({
        summary: '맵 클라우드 요청',
        description: '맵 클라우드 데이터를 요청합니다.',
    }),
    __param(0, (0, common_1.Param)('mapNm')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "getCloud", null);
__decorate([
    (0, common_1.Post)('cloud/:mapNm'),
    (0, swagger_1.ApiOperation)({
        summary: '맵 클라우드 저장',
        description: '맵 클라우드 데이터를 저장합니다.',
    }),
    __param(0, (0, common_1.Param)('mapNm')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "saveCloud", null);
__decorate([
    (0, common_1.Get)('topo/:mapNm'),
    (0, swagger_1.ApiOperation)({
        summary: '맵 토폴로지 요청',
        description: '맵 토폴로지 데이터를 요청합니다.',
    }),
    __param(0, (0, common_1.Param)('mapNm')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "getTopology", null);
__decorate([
    (0, common_1.Post)('topo/:mapNm'),
    (0, swagger_1.ApiOperation)({
        summary: '맵 토폴로지 저장',
        description: '맵 토폴로지 데이터를 저장합니다.',
    }),
    __param(0, (0, common_1.Param)('mapNm')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "saveTopology", null);
__decorate([
    (0, common_1.Get)('nodes/:mapNm'),
    (0, swagger_1.ApiOperation)({
        summary: '맵 노드 리스트 요청 (페이지네이션)',
        description: '맵 노드 리스트를 요청합니다.',
    }),
    __param(0, (0, common_1.Param)('mapNm')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, goal_read_dto_1.GoalReadDto, Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "getNodes", null);
__decorate([
    (0, common_1.Get)('goals/:mapNm'),
    (0, swagger_1.ApiOperation)({
        summary: '맵 골 리스트 요청',
        description: '맵 골 리스트를 요청합니다.',
    }),
    __param(0, (0, common_1.Param)('mapNm')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MapController.prototype, "getGoals", null);
exports.MapController = MapController = __decorate([
    (0, swagger_1.ApiTags)('맵 관련 API (map)'),
    (0, common_1.Controller)('map'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], MapController);
//# sourceMappingURL=map.controller.js.map