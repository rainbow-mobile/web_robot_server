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
exports.SoundController = void 0;
const common_1 = require("@nestjs/common");
const sound_service_1 = require("./sound.service");
const swagger_1 = require("@nestjs/swagger");
const sound_play_dto_1 = require("./dto/sound.play.dto");
const fs = require("fs");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const http_logger_1 = require("../../../common/logger/http.logger");
const upload_middleware_1 = require("../../../common/middleware/upload.middleware");
const os = require("os");
const error_util_1 = require("../../../common/util/error.util");
let SoundController = class SoundController {
    constructor(soundService) {
        this.soundService = soundService;
    }
    async playSound(body, res) {
        try {
            if (body.fileNm.split('.').length < 2 ||
                body.fileNm.split('.')[1] != 'mp3') {
                res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send({ message: 'fileNm is not mp3 format' });
            }
            else {
                if (body.repeat) {
                    const response = await this.soundService.playLoop(body);
                    res.send(response);
                }
                else {
                    const response = await this.soundService.play(body);
                    res.send(response);
                }
            }
        }
        catch (error) {
            res.status(error.status).send(error.data);
        }
    }
    async playStop(res) {
        this.soundService.stop();
        res.send();
    }
    async getFileList(res) {
        const response = await this.soundService.getList('./public/sound');
        res.send(response);
    }
    async deleteSound(name, res) {
        try {
            const path = os.homedir() + '/sounds/' + name;
            http_logger_1.default.info(`[SOUND] Delete: ${path}`);
            if (fs.existsSync(path)) {
                fs.unlinkSync(path);
                res.send(http_status_messages_constants_1.HttpStatusMessagesConstants.SUCCESS_DELETE_200);
            }
            else {
                res.status(common_1.HttpStatus.BAD_REQUEST).send({ message: 'file not found' });
            }
        }
        catch (error) {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                code: error,
            });
        }
    }
    async addSoundFile(req, res) {
        (0, upload_middleware_1.soundMiddleware)(req, res, async (err) => {
            if (err) {
                http_logger_1.default.error(`[SOUND] addSoundFile: ${(0, error_util_1.errorToJson)(err)}`);
                return res
                    .status(400)
                    .send({ message: '파일 업로드 실패', error: err.message });
            }
            try {
                http_logger_1.default.info(`[SOUND] addSoundFile: Download Done ${req.file.originalname}`);
                res.status(common_1.HttpStatus.CREATED).send({
                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.SUCCESS_201,
                    filename: req.file.filename,
                });
            }
            catch (error) {
                http_logger_1.default.error(`[SOUND] addSoundFile: ${(0, error_util_1.errorToJson)(error)}`);
                if (!req.file) {
                    res
                        .status(common_1.HttpStatus.BAD_REQUEST)
                        .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400);
                }
                else {
                    res
                        .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                        .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500);
                }
            }
        });
    }
};
exports.SoundController = SoundController;
__decorate([
    (0, common_1.Post)('play'),
    (0, swagger_1.ApiOperation)({
        summary: '사운드 플레이',
        description: '경로 내 사운드 플레이',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sound_play_dto_1.SoundPlayDto, Object]),
    __metadata("design:returntype", Promise)
], SoundController.prototype, "playSound", null);
__decorate([
    (0, common_1.Post)('stop'),
    (0, swagger_1.ApiOperation)({
        summary: '사운드 플레이 종료',
        description: '현재 재생중인 플레이 종료',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoundController.prototype, "playStop", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '사운드 파일 리스트',
        description: '경로 내 사운드 파일 리스트 반환',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoundController.prototype, "getFileList", null);
__decorate([
    (0, common_1.Delete)(':name'),
    (0, swagger_1.ApiOperation)({
        summary: '사운드 파일 삭제',
        description: '경로 내 사운드 파일 삭제',
    }),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SoundController.prototype, "deleteSound", null);
__decorate([
    (0, common_1.Post)('add'),
    (0, swagger_1.ApiOperation)({
        summary: '사운드 파일 추가',
        description: '경로 내 사운드 파일 추가 (form-data file에 파일(mp3)넣어서 POST)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SoundController.prototype, "addSoundFile", null);
exports.SoundController = SoundController = __decorate([
    (0, swagger_1.ApiTags)('사운드 관련 API (sound)'),
    (0, common_1.Controller)('sound'),
    __metadata("design:paramtypes", [sound_service_1.SoundService])
], SoundController);
//# sourceMappingURL=sound.controller.js.map