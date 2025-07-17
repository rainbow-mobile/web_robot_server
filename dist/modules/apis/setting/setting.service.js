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
exports.SettingService = void 0;
const file_util_1 = require("../../../common/util/file.util");
const common_1 = require("@nestjs/common");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const os_1 = require("os");
const Path = require("path");
const fs = require("fs");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const http_logger_1 = require("../../../common/logger/http.logger");
const error_util_1 = require("../../../common/util/error.util");
const child_process_1 = require("child_process");
let SettingService = class SettingService {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async getSetting(type) {
        const data = await (0, file_util_1.readJson)(Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type, 'config.json'));
        return await this.transformSettingToJson(data);
    }
    async saveSetting(type, data) {
        try {
            const fileData = await this.transformSettingToJson(await (0, file_util_1.readJson)(Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type, 'config.json')));
            const stringData = await this.convertNumbersToStrings(data);
            console.log('!!!!!!!!!!!!!!!!!!!!', stringData);
            const mergeData = await this.deepMerge(fileData, stringData);
            const newData = await this.transformSettingToFile(mergeData);
            const response = await (0, file_util_1.saveJson)(Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type, 'config.json'), newData);
            if (this.socketGateway.slamnav != null) {
                (0, child_process_1.exec)('pm2 restart SLAMNAV2');
            }
            return response;
        }
        catch (error) {
            http_logger_1.default.error(`[SETTING] saveSetting: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async convertNumbersToStrings(obj) {
        const entries = await Promise.all(Object.entries(obj).map(async ([key, value]) => [
            key,
            typeof value === 'number'
                ? value.toString()
                : typeof value === 'object' && value !== null
                    ? await this.convertNumbersToStrings(value)
                    : value,
        ]));
        return Object.fromEntries(entries);
    }
    async getPreset(type, id) {
        return await (0, file_util_1.readJson)(Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type, 'preset_' + id + '.json'));
    }
    async deletePreset(type, id) {
        return await (0, file_util_1.deleteFile)(Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type, 'preset_' + id + '.json'));
    }
    async makePreset(type, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const dir = Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type, 'preset_' + id + '.json');
                if (fs.existsSync(dir)) {
                    reject({
                        status: common_1.HttpStatus.CONFLICT,
                        data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.DUPLICATE_WRITE },
                    });
                }
                else {
                    const tempData = {
                        LIMIT_V: '1.0',
                        LIMIT_W: '45.0',
                        LIMIT_V_ACC: '0.3',
                        LIMIT_V_DCC: '0.1',
                        LIMIT_W_ACC: '180.0',
                        LIMIT_PIVOT_W: '45.0',
                        ST_V: '0.05',
                        ED_V: '0.05',
                        DRIVE_T: '0.0',
                        DRIVE_H: '4.0',
                        DRIVE_A: '0.8',
                        DRIVE_B: '0.05',
                        DRIVE_L: '0.3',
                        DRIVE_K: '0.8',
                        DRIVE_EPS: '0.3',
                    };
                    const response = await (0, file_util_1.saveJson)(dir, tempData);
                    resolve(tempData);
                }
            }
            catch (error) {
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                });
            }
        });
    }
    async savePreset(type, id, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const fileData = await (0, file_util_1.readJson)(Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type, 'preset_' + id + '.json'));
                const mergeData = await this.deepMerge(fileData, data);
                resolve(await (0, file_util_1.saveJson)(Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type, 'preset_' + id + '.json'), mergeData));
            }
            catch (error) {
                http_logger_1.default.error(`[SETTING] savePreset: ${(0, error_util_1.errorToJson)(error)}`);
                reject(error);
            }
        });
    }
    async getPresetList(type) {
        return new Promise(async (resolve, reject) => {
            try {
                const path = Path.join((0, os_1.homedir)(), 'slamnav2', 'config', type);
                const nums = [];
                const files = await fs.promises.readdir(path, { withFileTypes: true });
                for (const file of files) {
                    if (!file.isDirectory()) {
                        if (file.name.split('.')[0].split('_')[0] == 'preset') {
                            if (file.name.split('.')[0].split('_').length > 1) {
                                const num = parseInt(file.name.split('.')[0].split('_')[1]);
                                const newname = 'preset_' + num + '.json';
                                if (file.name == newname) {
                                    nums.push(num);
                                }
                            }
                        }
                    }
                }
                resolve(nums);
            }
            catch (error) {
                http_logger_1.default.error(`[SETTING] getPresetLIst: ${(0, error_util_1.errorToJson)(error)}`);
                if (error.code == 'ENOENT') {
                    reject({
                        status: common_1.HttpStatus.NOT_FOUND,
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.NOT_FOUND_404,
                    });
                }
                else {
                    reject({
                        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.FAIL_READ_500,
                    });
                }
            }
        });
    }
    async transformSettingToJson(data) {
        if (data != undefined) {
            const new_default = {
                ...data.default,
                LIDAR_TF_B_X: data.default.LIDAR_TF_B
                    ? data.default.LIDAR_TF_B.split(',')[0]
                    : 0,
                LIDAR_TF_B_Y: data.default.LIDAR_TF_B
                    ? data.default.LIDAR_TF_B.split(',')[1]
                    : 0,
                LIDAR_TF_B_Z: data.default.LIDAR_TF_B
                    ? data.default.LIDAR_TF_B.split(',')[2]
                    : 0,
                LIDAR_TF_B_RX: data.default.LIDAR_TF_B
                    ? data.default.LIDAR_TF_B.split(',')[3]
                    : 0,
                LIDAR_TF_B_RY: data.default.LIDAR_TF_B
                    ? data.default.LIDAR_TF_B.split(',')[4]
                    : 0,
                LIDAR_TF_B_RZ: data.default.LIDAR_TF_B
                    ? data.default.LIDAR_TF_B.split(',')[5]
                    : 0,
                LIDAR_TF_F_X: data.default.LIDAR_TF_F
                    ? data.default.LIDAR_TF_F.split(',')[0]
                    : 0,
                LIDAR_TF_F_Y: data.default.LIDAR_TF_F
                    ? data.default.LIDAR_TF_F.split(',')[1]
                    : 0,
                LIDAR_TF_F_Z: data.default.LIDAR_TF_F
                    ? data.default.LIDAR_TF_F.split(',')[2]
                    : 0,
                LIDAR_TF_F_RX: data.default.LIDAR_TF_F
                    ? data.default.LIDAR_TF_F.split(',')[3]
                    : 0,
                LIDAR_TF_F_RY: data.default.LIDAR_TF_F
                    ? data.default.LIDAR_TF_F.split(',')[4]
                    : 0,
                LIDAR_TF_F_RZ: data.default.LIDAR_TF_F
                    ? data.default.LIDAR_TF_F.split(',')[5]
                    : 0,
            };
            const new_cam = {
                ...data.cam,
                CAM_TF_0_X: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[0] : 0,
                CAM_TF_0_Y: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[1] : 0,
                CAM_TF_0_Z: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[2] : 0,
                CAM_TF_0_RX: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[3] : 0,
                CAM_TF_0_RY: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[4] : 0,
                CAM_TF_0_RZ: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[5] : 0,
                CAM_TF_1_X: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[0] : 0,
                CAM_TF_1_Y: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[1] : 0,
                CAM_TF_1_Z: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[2] : 0,
                CAM_TF_1_RX: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[3] : 0,
                CAM_TF_1_RY: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[4] : 0,
                CAM_TF_1_RZ: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[5] : 0,
            };
            const newdata = { ...data, default: new_default, cam: new_cam };
            return newdata;
        }
        else {
            return {};
        }
    }
    async transformSettingToFile(data) {
        if (data != undefined) {
            if (data.default) {
                const lidar_tf_b = (data.default.LIDAR_TF_B_X ? data.default.LIDAR_TF_B_X : '0') +
                    ',' +
                    (data.default.LIDAR_TF_B_Y ? data.default.LIDAR_TF_B_Y : '0') +
                    ',' +
                    (data.default.LIDAR_TF_B_Z ? data.default.LIDAR_TF_B_Z : '0') +
                    ',' +
                    (data.default.LIDAR_TF_B_RX ? data.default.LIDAR_TF_B_RX : '0') +
                    ',' +
                    (data.default.LIDAR_TF_B_RY ? data.default.LIDAR_TF_B_RY : '0') +
                    ',' +
                    (data.default.LIDAR_TF_B_RZ ? data.default.LIDAR_TF_B_RZ : '0');
                const lidar_tf_f = (data.default.LIDAR_TF_F_X ? data.default.LIDAR_TF_F_X : '0') +
                    ',' +
                    (data.default.LIDAR_TF_F_Y ? data.default.LIDAR_TF_F_Y : '0') +
                    ',' +
                    (data.default.LIDAR_TF_F_Z ? data.default.LIDAR_TF_F_Z : '0') +
                    ',' +
                    (data.default.LIDAR_TF_F_RX ? data.default.LIDAR_TF_F_RX : '0') +
                    ',' +
                    (data.default.LIDAR_TF_F_RY ? data.default.LIDAR_TF_F_RY : '0') +
                    ',' +
                    (data.default.LIDAR_TF_F_RZ ? data.default.LIDAR_TF_F_RZ : '0');
                const newdefault = {
                    ...data.default,
                    LIDAR_TF_B: lidar_tf_b,
                    LIDAR_TF_F: lidar_tf_f,
                };
                data = await {
                    ...data,
                    default: {
                        ...data.default,
                        LIDAR_TF_B: lidar_tf_b,
                        LIDAR_TF_F: lidar_tf_f,
                    },
                };
            }
            if (data.cam) {
                const camera_tf_0 = (data.cam.CAM_TF_0_X ? data.cam.CAM_TF_0_X : '0') +
                    ',' +
                    (data.cam.CAM_TF_0_Y ? data.cam.CAM_TF_0_Y : '0') +
                    ',' +
                    (data.cam.CAM_TF_0_Z ? data.cam.CAM_TF_0_Z : '0') +
                    ',' +
                    (data.cam.CAM_TF_0_RX ? data.cam.CAM_TF_0_RX : '0') +
                    ',' +
                    (data.cam.CAM_TF_0_RY ? data.cam.CAM_TF_0_RY : '0') +
                    ',' +
                    (data.cam.CAM_TF_0_RZ ? data.cam.CAM_TF_0_RZ : '0');
                const camera_tf_1 = (data.cam.CAM_TF_1_X ? data.cam.CAM_TF_1_X : '0') +
                    ',' +
                    (data.cam.CAM_TF_1_Y ? data.cam.CAM_TF_1_Y : '0') +
                    ',' +
                    (data.cam.CAM_TF_1_Z ? data.cam.CAM_TF_1_Z : '0') +
                    ',' +
                    (data.cam.CAM_TF_1_RX ? data.cam.CAM_TF_1_RX : '0') +
                    ',' +
                    (data.cam.CAM_TF_1_RY ? data.cam.CAM_TF_1_RY : '0') +
                    ',' +
                    (data.cam.CAM_TF_1_RZ ? data.cam.CAM_TF_1_RZ : '0');
                data = {
                    ...data,
                    cam: { ...data.cam, CAM_TF_0: camera_tf_0, CAM_TF_1: camera_tf_1 },
                };
            }
            return data;
        }
        else {
            return {};
        }
    }
    async mergeArrayByKey(oldArray, newArray, key) {
        const mergedArray = [...oldArray];
        newArray.forEach((newItem) => {
            const index = mergedArray.findIndex((oldItem) => oldItem[key] === newItem[key]);
            if (index > -1) {
                mergedArray[index] = { ...mergedArray[index], ...newItem };
            }
            else {
                mergedArray.push(newItem);
            }
        });
        return mergedArray;
    }
    async deepMerge(oldData, newData) {
        const result = { ...oldData };
        for (const key in newData) {
            if (Array.isArray(newData[key])) {
                result[key] = this.mergeArrayByKey(oldData[key] || [], newData[key], 'number');
            }
            else if (typeof newData[key] === 'object' &&
                !Array.isArray(newData[key])) {
                result[key] = await this.deepMerge(oldData[key] || {}, newData[key]);
            }
            else {
                result[key] = newData[key];
            }
        }
        return result;
    }
};
exports.SettingService = SettingService;
exports.SettingService = SettingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], SettingService);
//# sourceMappingURL=setting.service.js.map