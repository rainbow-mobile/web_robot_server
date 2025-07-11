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
exports.MoveService = void 0;
const http_logger_1 = require("../../../common/logger/http.logger");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const move_entity_1 = require("./entity/move.entity");
const influxdb3_client_1 = require("@influxdata/influxdb3-client");
const socket_logger_1 = require("../../../common/logger/socket.logger");
const error_util_1 = require("../../../common/util/error.util");
let MoveService = class MoveService {
    constructor(moveRepository, socketGateway) {
        this.moveRepository = moveRepository;
        this.socketGateway = socketGateway;
    }
    async getMoveLog(num, command) {
        try {
            if (num === 0) {
                return await this.moveRepository.find({
                    where: { command },
                    order: { time: 'DESC' },
                });
            }
            else {
                return await this.moveRepository.find({
                    where: { command },
                    order: { time: 'DESC' },
                    take: num,
                });
            }
        }
        catch (error) {
            if (error instanceof influxdb3_client_1.HttpError)
                throw error;
            socket_logger_1.default.error(`[MOVE] getMoveLog : ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async saveLog(data) {
        if (data.command === 'stop' ||
            data.command === 'goal' ||
            data.command === 'target' ||
            data.command === 'pause' ||
            data.command === 'resume') {
            http_logger_1.default.info(`[MOVE] saveLog : ${JSON.stringify(data)}`);
            this.moveRepository.save(data);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            await this.moveRepository.delete({
                time: (0, typeorm_1.LessThan)(oneWeekAgo),
            });
        }
    }
    async moveCommand(data) {
        return new Promise(async (resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                this.socketGateway.server.to('slamnav').emit('move', data);
                http_logger_1.default.info(`[MOVE] moveCommand: ${JSON.stringify(data)}`);
                this.saveLog({
                    command: data.command,
                    goal_id: data.goal_id,
                    goal_name: data.goal_name ?? null,
                    map_name: data.map_name ?? null,
                    x: data.x ? parseFloat(data.x) : null,
                    y: data.x ? parseFloat(data.y) : null,
                    rz: data.rz ? parseFloat(data.rz) : null,
                });
                if (data.goal_id) {
                    global.targetGoalId = data.goal_id;
                }
                else {
                    global.targetGoalId = '';
                }
                if (this.socketGateway.robotState) {
                    global.orinGoalId = this.socketGateway.robotState.goal_node.id;
                }
                else {
                    global.orinGoalId = 'INIT';
                }
                this.socketGateway.slamnav.once('moveResponse', (data2) => {
                    http_logger_1.default.info(`[MOVE] moveCommand Response: ${JSON.stringify(data2)}`);
                    const json = JSON.parse(data2);
                    if (json.result === 'accept') {
                        console.log('here:', json);
                        resolve(json);
                    }
                    else {
                        reject({ data: json, status: common_1.HttpStatus.FORBIDDEN });
                    }
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    reject({
                        status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                        data: { message: '프로그램이 응답하지 않습니다' },
                    });
                }, 5000);
            }
            else {
                reject({
                    status: common_1.HttpStatus.GATEWAY_TIMEOUT,
                    data: { message: '프로그램이 연결되지 않았습니다' },
                });
            }
        });
    }
    async moveJog(data) {
        if (this.socketGateway.slamnav != null) {
            this.socketGateway.server.to('slamnav').emit('move', data);
        }
    }
};
exports.MoveService = MoveService;
exports.MoveService = MoveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(move_entity_1.MoveLogEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        sockets_gateway_1.SocketGateway])
], MoveService);
