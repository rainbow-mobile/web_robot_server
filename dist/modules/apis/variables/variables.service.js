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
exports.VariablesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const variables_entity_1 = require("./entity/variables.entity");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const http_logger_1 = require("../../../common/logger/http.logger");
const error_util_1 = require("../../../common/util/error.util");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
let VariablesService = class VariablesService {
    constructor(variablesRepository, socketGateway, configService) {
        this.variablesRepository = variablesRepository;
        this.socketGateway = socketGateway;
        this.configService = configService;
    }
    async getVariables() {
        return this.variablesRepository.find();
    }
    async getVariable(key) {
        const result = await this.variablesRepository.findOne({ where: { key } });
        if (result) {
            return result.value;
        }
        else {
            return null;
        }
    }
    async deleteVariable(key) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.variablesRepository.delete(key);
                resolve({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.DB.SUCCESS_DELETE_200 });
            }
            catch (error) {
                http_logger_1.default.error(`[UPLOAD] deleteVariable: (${key}), ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    async upsertVariable(key, value) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.variablesRepository.save({ key: key, value: value });
                resolve({
                    data: {
                        key: key,
                        value: value,
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.DB.SUCCESS_WRITE_201,
                    },
                });
                if (this.socketGateway.slamnav !== null) {
                    this.socketGateway.slamnav.emit('updateVariable', {
                        key: key,
                        value: value,
                    });
                }
            }
            catch (error) {
                http_logger_1.default.error(`[UPLOAD] upsertVariable : (${key}, ${value}) ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                });
            }
        });
    }
    async updateVariable(key, value) {
        return new Promise(async (resolve, reject) => {
            const result = await this.variablesRepository.findOne({ where: { key } });
            await this.variablesRepository.find({ where: { key } });
            if (result) {
                try {
                    await this.variablesRepository.save({ key: key, value: value });
                    resolve({
                        data: {
                            key: key,
                            value: value,
                            message: http_status_messages_constants_1.HttpStatusMessagesConstants.DB.SUCCESS_WRITE_201,
                        },
                    });
                    if (this.socketGateway.slamnav !== null) {
                        this.socketGateway.slamnav.emit('updateVariable', {
                            key: key,
                            value: value,
                        });
                    }
                }
                catch (error) {
                    http_logger_1.default.error(`[UPLOAD] updateVariable: (${key}, ${value}) ${(0, error_util_1.errorToJson)(error)}`);
                    reject({
                        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                        data: {
                            message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        },
                    });
                }
            }
            else {
                http_logger_1.default.error(`[UPLOAD] updateVariable: (${key}, ${value}) Key Not Found`);
                reject({
                    status: common_1.HttpStatus.NOT_FOUND,
                    data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.DB.NOT_FOUND_404 },
                });
            }
        });
    }
};
exports.VariablesService = VariablesService;
exports.VariablesService = VariablesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(variables_entity_1.VariablesEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        sockets_gateway_1.SocketGateway,
        config_1.ConfigService])
], VariablesService);
//# sourceMappingURL=variables.service.js.map