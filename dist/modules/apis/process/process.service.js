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
exports.ProcessService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const fs = require("fs");
const ini = require("ini");
const ROBOT_INFO_CONF = 'robot-info.conf';
let ProcessService = class ProcessService {
    constructor(configService) {
        this.configService = configService;
    }
    async getRobotInfo() {
        try {
            const dataBasePath = this.configService.get('dataBasePath');
            let robotInfoConf = path_1.default.join(dataBasePath, ROBOT_INFO_CONF);
            if (!fs.existsSync(robotInfoConf)) {
                await this.writeRobotInfo({});
                robotInfoConf = path_1.default.join(dataBasePath, ROBOT_INFO_CONF);
            }
            const robotInfoData = await fs.promises.readFile(robotInfoConf, 'utf-8');
            const config = ini.parse(robotInfoData);
            return config;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({
                message: `${ROBOT_INFO_CONF} 파일을 읽는데 실패했습니다.`,
                error,
            });
        }
    }
    async writeRobotInfo(body) {
        try {
            const dataBasePath = this.configService.get('dataBasePath');
            const robotInfoConf = path_1.default.join(dataBasePath, ROBOT_INFO_CONF);
            if (fs.existsSync(robotInfoConf)) {
                throw new common_1.BadRequestException({
                    message: `${ROBOT_INFO_CONF} 파일이 이미 존재합니다.`,
                });
            }
            const iniContent = ini.stringify(body);
            await fs.promises.writeFile(robotInfoConf, iniContent, 'utf-8');
            return {
                robotInfo: body,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({
                message: `${ROBOT_INFO_CONF} 파일을 쓰는데 실패했습니다.`,
                error,
            });
        }
    }
    async updateRobotInfo(body) {
        try {
            const dataBasePath = this.configService.get('dataBasePath');
            const robotInfoConf = path_1.default.join(dataBasePath, ROBOT_INFO_CONF);
            const robotInfoData = await fs.promises.readFile(robotInfoConf, 'utf-8');
            const config = ini.parse(robotInfoData);
            Object.assign(config, body);
            const iniContent = ini.stringify(config);
            await fs.promises.writeFile(robotInfoConf, iniContent, 'utf-8');
            return {
                robotInfo: config,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({
                message: `${ROBOT_INFO_CONF} 파일을 업데이트하는데 실패했습니다.`,
                error,
            });
        }
    }
    async deleteRobotInfoData(body) {
        try {
            const dataBasePath = this.configService.get('dataBasePath');
            const robotInfoConf = path_1.default.join(dataBasePath, ROBOT_INFO_CONF);
            const robotInfoData = await fs.promises.readFile(robotInfoConf, 'utf-8');
            const config = ini.parse(robotInfoData);
            if (!config[body.section][body.key]) {
                throw new common_1.BadRequestException({
                    message: `${ROBOT_INFO_CONF} 파일에 ${body.section} 섹션의 ${body.key} 키가 없습니다.`,
                });
            }
            delete config[body.section][body.key];
            const iniContent = ini.stringify(config);
            await fs.promises.writeFile(robotInfoConf, iniContent, 'utf-8');
            return {
                robotInfo: config,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({
                message: `${ROBOT_INFO_CONF} 파일을 삭제하는데 실패했습니다.`,
                error,
            });
        }
    }
};
exports.ProcessService = ProcessService;
exports.ProcessService = ProcessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProcessService);
//# sourceMappingURL=process.service.js.map