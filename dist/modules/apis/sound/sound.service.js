"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundService = void 0;
const http_logger_1 = require("../../../common/logger/http.logger");
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const playSound = require("play-sound");
const fs = require("fs");
const os = require("os");
const error_util_1 = require("../../../common/util/error.util");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
let SoundService = class SoundService {
    constructor() {
        this.player = playSound();
        this.curPlay = null;
        this.isLooping = false;
    }
    async play(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const path = './public/sound/' + body.fileNm;
                if (this.curPlay) {
                    http_logger_1.default.info(`[SOUND] Play spawnargs FileName: ${this.curPlay.spawnargs?.[1]}`);
                    http_logger_1.default.info(`[SOUND] Play Body FileNamess: ${path}`);
                    await this.stop();
                }
                if (fs.existsSync(path)) {
                    this.curPlay = this.player.play(path, { mplayer: ['-ao', 'pulse', '-volume', body.volume] }, (err) => {
                        if (err) {
                            http_logger_1.default.error(`[SOUND] Play: ${JSON.stringify(err)}`);
                            reject({
                                status: common_1.HttpStatus.BAD_REQUEST,
                                data: { message: err },
                            });
                        }
                        else {
                            http_logger_1.default.info(`[SOUND] Play: Done (${path})}`);
                            resolve(path);
                        }
                    });
                    if (!body.waitDone) {
                        http_logger_1.default.info(`[SOUND] Play: Start (waitDone false)}`);
                        resolve(path);
                    }
                }
                else {
                    reject({
                        status: common_1.HttpStatus.BAD_REQUEST,
                        data: { message: 'file not found' },
                    });
                }
            }
            catch (error) {
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        code: error,
                    },
                });
            }
        });
    }
    async playLoop(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const path = './public/sound/' + body.fileNm;
                if (this.curPlay) {
                    http_logger_1.default.info(`[SOUND] Play spawnargs FileName: ${this.curPlay.spawnargs?.[1]}`);
                    http_logger_1.default.info(`[SOUND] Play Body FileNamess: ${path}`);
                    await this.stop();
                }
                if (fs.existsSync(path)) {
                    this.isLooping = true;
                    const playNext = () => {
                        if (!this.isLooping)
                            return;
                        this.curPlay = this.player.play(path, { mplayer: ['-ao', 'pulse', '-volume', body.volume] }, (err) => {
                            if (err) {
                                http_logger_1.default.error(`[SOUND] PlayLoop: ${JSON.stringify(err)}`);
                                this.isLooping = false;
                                reject({
                                    status: common_1.HttpStatus.BAD_REQUEST,
                                    data: { message: err },
                                });
                            }
                            else {
                                http_logger_1.default.info(`[SOUND] PlayLoop: Done (${path})}`);
                                if (this.isLooping) {
                                    playNext();
                                }
                            }
                        });
                    };
                    playNext();
                    resolve(path);
                }
                else {
                    reject({
                        status: common_1.HttpStatus.BAD_REQUEST,
                        data: { message: 'file not found' },
                    });
                }
            }
            catch (error) {
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        code: error,
                    },
                });
            }
        });
    }
    async stop() {
        const platform = os.platform();
        this.isLooping = false;
        if (this.curPlay) {
            this.curPlay.kill();
            this.curPlay = null;
        }
        const killCommand = platform === 'linux' || platform === 'darwin'
            ? 'pkill -f mplayer'
            : platform === 'win32'
                ? 'taskkill /IM mplayer.exe /F'
                : '';
        if (killCommand) {
            await new Promise((resolve) => {
                (0, child_process_1.exec)(killCommand, () => resolve());
            });
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        return 'Sound stopped';
    }
    async getList(path) {
        try {
            const files = await fs.promises.readdir(path, { withFileTypes: true });
            const list = [];
            files.map((file) => {
                if (file.name.split('.').length > 1) {
                    list.push(file.name);
                }
            });
            return list;
        }
        catch (e) {
            http_logger_1.default.error(`[SOUND] getList: ${(0, error_util_1.errorToJson)(e)}`);
        }
    }
};
exports.SoundService = SoundService;
exports.SoundService = SoundService = __decorate([
    (0, common_1.Injectable)()
], SoundService);
//# sourceMappingURL=sound.service.js.map