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
exports.SettingController = void 0;
const common_1 = require("@nestjs/common");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const http_logger_1 = require("../../../common/logger/http.logger");
const setting_service_1 = require("./setting.service");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const swagger_1 = require("@nestjs/swagger");
const setting_preset_dto_1 = require("./dto/setting.preset.dto");
const setting_camera_dto_1 = require("./dto/setting.camera.dto");
const setting_dto_1 = require("./dto/setting.dto");
const config_dto_1 = require("./dto/config.dto");
let SettingController = class SettingController {
    constructor(settingSsocketGatewayervice) {
        this.settingSsocketGatewayervice = settingSsocketGatewayervice;
    }
    generateId() {
        return (Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15));
    }
    async getPduParameter() {
        throw new common_1.HttpException('아직 구현되지 않은 기능입니다.', common_1.HttpStatus.NOT_IMPLEMENTED);
        return this.settingService.settingRequest({
            id: this.generateId(),
            command: config_dto_1.ConfigCommand.getParam,
        });
    }
    async getDriveConfig() {
        return await this.settingService.settingRequest({
            id: this.generateId(),
            command: setting_dto_1.SettingCommand.getDriveParam,
        });
    }
    async setPduParameter(dto) {
        if (dto.param == null || dto.param == undefined || dto.param.length == 0) {
            throw new common_1.HttpException('파라미터를 입력해주세요.', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.settingService.settingRequest({
            id: this.generateId(),
            command: setting_dto_1.SettingCommand.setParam,
            param: dto.param,
        });
    }
    async getSetting(type, res) {
        try {
            if (type == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            const response = await this.settingService.getSetting(type);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[SETTING] getSetting: ${type}, ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async saveSetting(type, data, res) {
        try {
            http_logger_1.default.debug(`[SETTING] save Setting: ${type}, ${JSON.stringify(data)}`);
            if (type == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            const response = await this.settingService.saveSetting(type, data);
            http_logger_1.default.debug(`[SETTING] save Setting Response: ${JSON.stringify(response)}`);
            res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[SETTING] save Setting: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getPresetList(type, res) {
        try {
            http_logger_1.default.debug(`[SETTING] get Preset List: ${type}`);
            if (type == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            const response = await this.settingService.getPresetList(type);
            http_logger_1.default.debug(`[SETTING] get Preset List: ${JSON.stringify(response)}`);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[SETTING] get Preset List: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async makePreset(type, id, res) {
        try {
            http_logger_1.default.debug(`[SETTING] make Preset: type=${type}, id=${id}`);
            if (type == '' || id == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            const response = await this.settingService.makePreset(type, id);
            http_logger_1.default.debug(`[SETTING] make Preset: ${JSON.stringify(response)}`);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[SETTING] make Preset: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getPreset(type, id, res) {
        try {
            http_logger_1.default.debug(`[SETTING] get Preset: type=${type}, id=${id}`);
            if (type == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            const response = await this.settingService.getPreset(type, id);
            http_logger_1.default.debug(`[SETTING] get Preset: ${JSON.stringify(response)}`);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[SETTING] get Preset: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async savePreset(type, id, data, res) {
        try {
            http_logger_1.default.debug(`[SETTING] save Preset: type=${type}, id=${id}, data=${JSON.stringify(data)}`);
            if (type == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            if (isNaN(Number(data.LIMIT_V)) ||
                isNaN(Number(data.LIMIT_V_ACC)) ||
                isNaN(Number(data.LIMIT_W)) ||
                isNaN(Number(data.LIMIT_W_ACC)) ||
                isNaN(Number(data.LIMIT_PIVOT_W)) ||
                isNaN(Number(data.ED_V)) ||
                isNaN(Number(data.DRIVE_EPS)) ||
                isNaN(Number(data.DRIVE_H)) ||
                isNaN(Number(data.DRIVE_K)) ||
                isNaN(Number(data.DRIVE_L)) ||
                isNaN(Number(data.DRIVE_T)) ||
                isNaN(Number(data.ST_V)) ||
                isNaN(Number(data.DRIVE_A)) ||
                isNaN(Number(data.DRIVE_B))) {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            const response = await this.settingService.savePreset(type, id, data);
            http_logger_1.default.debug(`[SETTING] save Preset: ${JSON.stringify(response)}`);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[SETTING] save Preset: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async deletePreset(type, id, res) {
        try {
            http_logger_1.default.debug(`[SETTING] delete Preset: type=${type}, id=${id}`);
            if (type == '' || id == '') {
                return res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400 });
            }
            const response = await this.settingService.deletePreset(type, id);
            http_logger_1.default.debug(`[SETTING] delete Preset: ${JSON.stringify(response)}`);
            return res.send(response);
        }
        catch (error) {
            http_logger_1.default.error(`[SETTING] delete Preset: ${error.status} -> ${error.data}`);
            return res.status(error.status).send(error.data);
        }
    }
    async getCameraInfo() {
        return this.settingService.getCameraInfo();
    }
    async orderChange(data) {
        return this.settingService.cameraOrderChange(data);
    }
};
exports.SettingController = SettingController;
__decorate([
    (0, common_1.Inject)(),
    __metadata("design:type", setting_service_1.SettingService)
], SettingController.prototype, "settingService", void 0);
__decorate([
    (0, common_1.Get)('pdu'),
    (0, swagger_1.ApiOperation)({
        summary: 'PDU 파라미터 조회',
        description: 'PDU 파라미터 조회 명령을 전달합니다',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getPduParameter", null);
__decorate([
    (0, common_1.Get)('pdu/drive'),
    (0, swagger_1.ApiOperation)({
        summary: 'PDU 파라미터 조회',
        description: 'PDU 파라미터 조회 명령을 전달합니다',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getDriveConfig", null);
__decorate([
    (0, common_1.Post)('pdu'),
    (0, swagger_1.ApiOperation)({
        summary: 'PDU 파라미터 설정',
        description: 'PDU 파라미터 설정 명령을 전달합니다',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [setting_dto_1.SettingSetParamRequestDto]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "setPduParameter", null);
__decorate([
    (0, common_1.Get)(':type'),
    (0, swagger_1.ApiOperation)({
        summary: '세팅 파일 요청',
        description: '타입에 해당하는 세팅 파일을 요청합니다.',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getSetting", null);
__decorate([
    (0, common_1.Post)(':type'),
    (0, swagger_1.ApiOperation)({
        summary: '세팅 파일 저장',
        description: '타입에 해당하는 세팅 파일을 저장합니다.',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "saveSetting", null);
__decorate([
    (0, common_1.Get)('preset/:type'),
    (0, swagger_1.ApiOperation)({
        summary: '세팅 프리셋 리스트 요청',
        description: '타입에 해당하는 세팅 프리셋 리스트를 요청합니다.',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getPresetList", null);
__decorate([
    (0, common_1.Post)('preset/:type/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '세팅 프리셋 파일 생성',
        description: '타입에 해당하는 세팅 프리셋을 생성합니다.',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "makePreset", null);
__decorate([
    (0, common_1.Get)('preset/:type/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '세팅 프리셋 파일 요청',
        description: '프리셋 파일 데이터를 요청합니다',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getPreset", null);
__decorate([
    (0, common_1.Put)('preset/:type/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '세팅 프리셋 파일 수정',
        description: '프리셋 파일 데이터를 수정합니다',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, setting_preset_dto_1.PresetDto, Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "savePreset", null);
__decorate([
    (0, common_1.Delete)('preset/:type/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '세팅 프리셋 파일 삭제',
        description: '프리셋 파일을 삭제합니다',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "deletePreset", null);
__decorate([
    (0, common_1.Get)('cam/info'),
    (0, swagger_1.ApiOperation)({
        summary: '카메라 정보 요청',
        description: '카메라 정보를 요청합니다',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '카메라 정보 요청 성공',
        type: setting_camera_dto_1.CameraInfoDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청 데이터',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 내부 오류',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getCameraInfo", null);
__decorate([
    (0, common_1.Post)('cam/order-change'),
    (0, swagger_1.ApiOperation)({
        summary: '카메라 순서 변경',
        description: '카메라 순서를 변경합니다',
    }),
    (0, swagger_1.ApiBody)({
        type: setting_camera_dto_1.CameraOrderChangeDto,
        description: '카메라 순서 변경 데이터',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '카메라 순서 변경 성공',
        type: setting_camera_dto_1.CameraInfoDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청 데이터',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 내부 오류',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [setting_camera_dto_1.CameraOrderChangeDto]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "orderChange", null);
exports.SettingController = SettingController = __decorate([
    (0, swagger_1.ApiTags)('세팅 관련 API (setting)'),
    (0, common_1.Controller)('setting'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], SettingController);
//# sourceMappingURL=setting.controller.js.map