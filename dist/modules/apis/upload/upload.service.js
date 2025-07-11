"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs");
const http_logger_1 = require("../../../common/logger/http.logger");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const error_util_1 = require("../../../common/util/error.util");
const axios_1 = require("axios");
const path_1 = require("path");
let UploadService = class UploadService {
    constructor() {
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, '/data/upload/');
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            },
        });
        this.upload = multer({ storage: this.storage });
    }
    async downloadMap(fileName) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios_1.default.get(global.frs_api + '/api/maps/frs-map/download', {
                    responseType: 'stream',
                    params: { attachmentFileDtlFlNm: fileName, deleteZipAt: 'Y' },
                });
                const pathDir = (0, path_1.join)('/data/maps');
                const fileStream = fs.createWriteStream((0, path_1.join)(pathDir, fileName));
                response.data.pipe(fileStream);
                fileStream.on('finish', async () => {
                    http_logger_1.default.info(`[UPLOAD] DownloadMap: Done`);
                    const zipFilePath = (0, path_1.join)(pathDir, fileName);
                    const extractToPath = pathDir;
                    http_logger_1.default.info(`[UPLOAD] DownloadMap: Zip (${zipFilePath}, ${extractToPath})`);
                    await this.unzipFolder(zipFilePath, extractToPath);
                    resolve({});
                    http_logger_1.default.info(`[UPLOAD] DownloadMap: Zip Done`);
                    fs.unlink(zipFilePath, (err) => {
                        if (err)
                            http_logger_1.default.error(`[UPLOAD] DownloadMap: Zip Delete Fail ${(0, error_util_1.errorToJson)(err)}`);
                        http_logger_1.default.info(`[UPLOAD] DownloadMap: Zip Delete Done`);
                    });
                });
            }
            catch (error) {
                http_logger_1.default.error(`[UPLOAD] DownloadMap: ${(0, error_util_1.errorToJson)(error)}`);
                reject(error);
            }
        });
    }
    async zipFolder(sourceFolderPath, zipFilePath) {
        return new Promise((resolve, reject) => {
            try {
                const zip = new AdmZip();
                const addFilesRecursively = async (folderPath, zipFolderPath = '') => {
                    const files = fs.readdirSync(folderPath);
                    files.forEach((file) => {
                        const filePath = (0, path_1.join)(folderPath, file);
                        const stat = fs.statSync(filePath);
                        if (stat.isDirectory()) {
                            addFilesRecursively(filePath, (0, path_1.join)(zipFolderPath, file));
                        }
                        else {
                            zip.addLocalFile(filePath, zipFolderPath);
                        }
                    });
                };
                addFilesRecursively(sourceFolderPath);
                zip.writeZip(zipFilePath);
                http_logger_1.default.info(`[UPLOAD] zipFolder: Done ${zipFilePath}`);
                resolve(zipFilePath);
            }
            catch (error) {
                http_logger_1.default.error(`[UPLOAD] zipFolder: ${sourceFolderPath}, ${zipFilePath}, ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                });
            }
        });
    }
    async unzipFolder(zipFilePath, extractToPath) {
        return new Promise((resolve, reject) => {
            try {
                http_logger_1.default.info(`[UPLOAD] unzipFoler: ${zipFilePath}, ${extractToPath}`);
                const zip = new AdmZip(zipFilePath);
                if (!fs.existsSync(extractToPath)) {
                    fs.mkdirSync(extractToPath, { recursive: true });
                }
                zip.extractAllTo(extractToPath, true);
                http_logger_1.default.info(`[UPLOAD] unzipFolder: Done ${extractToPath}`);
                resolve('');
            }
            catch (error) {
                http_logger_1.default.error(`[UPLOAD] unzipFolder: ${zipFilePath}, ${extractToPath}, ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                });
            }
        });
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map