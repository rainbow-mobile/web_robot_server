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
exports.MapService = void 0;
const http_logger_1 = require("../../../common/logger/http.logger");
const common_1 = require("@nestjs/common");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const fs = require("fs");
const Path = require("path");
const moment = require("moment");
const file_util_1 = require("../../../common/util/file.util");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const error_util_1 = require("../../../common/util/error.util");
let MapService = class MapService {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
        this.mapDir = '/data/maps';
        this.mapDir = '/data/maps';
        console.log(this.mapDir);
    }
    async getMapList() {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.parseMapList(this.mapDir);
                resolve(response.list);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async parseMapList(dir, father = { list: [] }) {
        return new Promise(async (resolve, reject) => {
            try {
                const files = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const file of files) {
                    if (file.isDirectory()) {
                        const fullPath = dir + '/' + file.name;
                        const stats = await fs.promises.stat(fullPath);
                        const model = {
                            name: file.name,
                            modifyDt: moment(stats.mtime).format('yyyy-MM-DD HH:mm:ss'),
                            list: [],
                        };
                        const models = await this.parseMapList(fullPath, model);
                        if (models.list.find((obj) => obj.name === 'cloud.csv'))
                            father.list.push(models);
                    }
                    else {
                        if (file.name == 'cloud.csv' ||
                            file.name == 'topo.json' ||
                            file.name.split('.')[1] == 'task') {
                            const fullPath = Path.join(dir, file.name);
                            const stats = await fs.promises.stat(fullPath);
                            father.list.push({
                                name: file.name,
                                modifyDt: moment(stats.mtime).format('yyyy-MM-DD HH:mm:ss'),
                                size: stats.size,
                            });
                        }
                    }
                }
                resolve(father);
            }
            catch (e) {
                http_logger_1.default.error(`[MAP] parseMapList: ${(0, error_util_1.errorToJson)(e)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                });
            }
        });
    }
    async readCloud(mapNm) {
        return await (0, file_util_1.readCsv)(Path.join(this.mapDir, mapNm, 'cloud.csv'));
    }
    async saveCloud(mapNm, data) {
        return await (0, file_util_1.saveCsv)(Path.join(this.mapDir, mapNm, 'cloud.csv'), data);
    }
    async readTopology(mapNm) {
        return await (0, file_util_1.readJson)(Path.join(this.mapDir, mapNm, 'topo.json'));
    }
    async saveTopology(mapNm, data) {
        return await (0, file_util_1.saveJson)(Path.join(this.mapDir, mapNm, 'topo.json'), data);
    }
    async loadMap(mapNm) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                http_logger_1.default.info(`[MAP] loadMap: ${mapNm}`);
                this.socketGateway.server.to('slamnav').emit('load', {
                    command: 'mapload',
                    name: mapNm,
                    time: Date.now().toString(),
                });
                this.socketGateway.slamnav.once('loadResponse', (data) => {
                    http_logger_1.default.info(`[MAP] Slamnav Mapload Response: ${JSON.stringify(data)}`);
                    resolve(data);
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    http_logger_1.default.warn(`[MAP] loadMap: Timeout`);
                    reject({
                        status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                        data: { message: '프로그램이 응답하지 않습니다' },
                    });
                }, 5000);
            }
            else {
                http_logger_1.default.warn(`[MAP] loadMap: Disconnect`);
                reject({
                    status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                    data: { message: '프로그램이 연결되지 않았습니다' },
                });
            }
        });
    }
};
exports.MapService = MapService;
exports.MapService = MapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], MapService);
