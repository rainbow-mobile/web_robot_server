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
exports.PublishController = exports.DownloadController = exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const upload_service_1 = require("./upload.service");
const http_logger_1 = require("../../../common/logger/http.logger");
const upload_map_dto_1 = require("./dto/upload.map.dto");
const swagger_1 = require("@nestjs/swagger");
const os_1 = require("os");
const path = require("path");
const FormData = require("form-data");
const fs = require("fs");
const axios_1 = require("axios");
const download_map_dto_1 = require("./dto/download.map.dto");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const upload_middleware_1 = require("../../../common/middleware/upload.middleware");
const error_util_1 = require("../../../common/util/error.util");
let UploadController = class UploadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async uploadMap(data, res) {
        const originalFilePath = (0, os_1.homedir)() + '/maps/' + data.mapNm;
        const zipFileName = `${data.name}.zip`;
        const zipFilePath = path.join((0, os_1.homedir)(), 'maps', zipFileName);
        try {
            http_logger_1.default.info(`[UPLOAD] uploadMap: ${JSON.stringify(data)}`);
            await this.uploadService.zipFolder(originalFilePath, zipFilePath);
            http_logger_1.default.info(`[UPLOAD] uploadMap: zip Done`);
            const zipStream = fs.createReadStream(zipFilePath);
            const formData = new FormData();
            formData.append('file', zipStream, { filename: zipFileName });
            formData.append('deleteZipAt', 'Y');
            http_logger_1.default.info(`[UPLOAD] uploadMap: send FRS`);
            const response = await axios_1.default.post(global.frs_api + '/api/maps/frs-map/upload', formData);
            http_logger_1.default.info(`[UPLOAD] uploadMap: send FRS Response: ${JSON.stringify(response.data)}`);
            res.send({ message: '파일 저장 성공' });
        }
        catch (error) {
            http_logger_1.default.error(`[UPLOAD] uploadMap: ${(0, error_util_1.errorToJson)(error)}`);
            res.status(error.status).send(error.data);
        }
        finally {
            fs.unlink(zipFilePath, (err) => {
                if (err)
                    http_logger_1.default.error(`[UPLOAD] uploadMap: Delete ZipFile Failed...${(0, error_util_1.errorToJson)(err)}`);
            });
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('map'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_map_dto_1.UploadMapDto, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadMap", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('파일 전송 관련 API (Upload)'),
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
let DownloadController = class DownloadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async downloadMap(data, res) {
        try {
            http_logger_1.default.info(`[UPLOAD] DownloadMap: ${JSON.stringify(data)}`);
            await this.uploadService.downloadMap(data.name);
            res
                .status(common_1.HttpStatus.CREATED)
                .send({ message: http_status_messages_constants_1.HttpStatusMessagesConstants.MAP.SUCCESS_201 });
        }
        catch (error) {
            http_logger_1.default.error(`[UPLOAD] DownloadMap: Download Fail ${(0, error_util_1.errorToJson)(error.response.data)}`);
            res.status(error.response.status).send();
        }
    }
};
exports.DownloadController = DownloadController;
__decorate([
    (0, common_1.Post)('map'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [download_map_dto_1.DownloadMapDto, Object]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "downloadMap", null);
exports.DownloadController = DownloadController = __decorate([
    (0, swagger_1.ApiTags)('파일 전송 관련 API (Download)'),
    (0, common_1.Controller)('download'),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], DownloadController);
let PublishController = class PublishController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async publishedMap(req, mapNm, res) {
        (0, upload_middleware_1.uploadMiddleware)(req, res, async (err) => {
            if (err) {
                http_logger_1.default.error(`[UPLOAD] PublishMap: ${(0, error_util_1.errorToJson)(err)}`);
                return res
                    .status(400)
                    .send({ message: '파일 업로드 실패', error: err.message });
            }
            try {
                http_logger_1.default.info(`[UPLOAD] PublishMap: Download Done`);
                const zipFilePath = path.join((0, os_1.homedir)(), 'upload', req.file.originalname);
                const extractToPath = path.join((0, os_1.homedir)(), 'maps', mapNm);
                http_logger_1.default.info(`[UPLOAD] PublishMap: ${zipFilePath}, ${extractToPath}`);
                await this.uploadService.unzipFolder(zipFilePath, extractToPath);
                res.status(common_1.HttpStatus.CREATED).send({
                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.MAP.SUCCESS_201,
                    filename: req.file.filename,
                });
            }
            catch (error) {
                http_logger_1.default.error(`[UPLOAD] PublishMap: ${mapNm}, ${req.file.originalname}, ${(0, error_util_1.errorToJson)(error)}`);
                res
                    .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                    .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500);
            }
            finally {
                fs.unlink((0, os_1.homedir)() + '/upload/' + req.file.originalname, (err) => {
                    if (err)
                        http_logger_1.default.error(`[UPLOAD] PublishMap: Delete Zip (${(0, os_1.homedir)() + '/upload' + req.file.originalname}) ${(0, error_util_1.errorToJson)(err)}`);
                    http_logger_1.default.info(`[UPLOAD] PublishMap: Delete Zip (${(0, os_1.homedir)() + '/upload' + req.file.originalname})`);
                });
            }
        });
    }
};
exports.PublishController = PublishController;
__decorate([
    (0, common_1.Post)('map/:mapNm'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('mapNm')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "publishedMap", null);
exports.PublishController = PublishController = __decorate([
    (0, swagger_1.ApiTags)('파일 전송 관련 API (Publish)'),
    (0, common_1.Controller)('publish'),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], PublishController);
//# sourceMappingURL=upload.controller.js.map