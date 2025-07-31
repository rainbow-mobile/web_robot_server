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
exports.UpdateService = void 0;
const common_1 = require("@nestjs/common");
const path = require("path");
const os_1 = require("os");
const fs = require("fs");
const software_c_1 = require("./constants/software.c");
const child_process_1 = require("child_process");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const http_logger_1 = require("../../../common/logger/http.logger");
const crypto = require("crypto");
let UpdateService = class UpdateService {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async checkRepositoryAccess() {
        try {
            const response = await fetch(software_c_1.RELEASE_REPO_URL);
            if (!response.ok) {
                throw new common_1.BadRequestException('Repository access failed');
            }
            return response.ok;
        }
        catch (_error) {
            throw new common_1.BadRequestException('Repository access failed');
        }
    }
    pingSendToTarget(target) {
        (0, child_process_1.exec)(`ping -c 30 ${target}`, (error, stdout, stderr) => {
            if (error) {
                throw new common_1.BadRequestException(stderr);
            }
        });
        return {
            message: 'Ping sent to target',
        };
    }
    updateSoftware({ software, branch, version }) {
        if (software === 'rrs-server' || software === 'rrs') {
            return this.rrsUpdate({ branch, version });
        }
        return this.otherSwUpdate({ branch, version });
    }
    rrsUpdate({ branch, version } = {}) {
        const updateScript = path.join((0, os_1.homedir)(), `rainbow-deploy-kit/rrs-server`, 'rrs-update.sh');
        const rainbowDeployKitDir = path.join((0, os_1.homedir)(), 'rainbow-deploy-kit');
        if (!fs.existsSync(updateScript)) {
            throw new common_1.NotFoundException({
                message: `~/rainbow-deploy-kit/rrs-server/rrs-update.sh 파일을 찾을 수 없습니다.`,
            });
        }
        (0, child_process_1.execSync)('git pull', {
            cwd: rainbowDeployKitDir,
            stdio: 'pipe',
        });
        (0, child_process_1.exec)(`nohup bash ${updateScript} --mode=${branch || 'main'} --version=${version} > /tmp/rrs-update.log 2>&1 &`);
        return { applyReqUpdate: true, version: version || '', rejectReason: '' };
    }
    otherSwUpdate({ branch, version, } = {}) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                const data = {
                    branch: branch || 'main',
                    version: version || '',
                };
                this.socketGateway.server.to('slamnav').emit('swUpdate', data);
                http_logger_1.default.info(`[UPDATE] swUpdate: ${JSON.stringify(data)}`);
                this.socketGateway.slamnav.once('swUpdateResponse', (res) => {
                    if (res) {
                        http_logger_1.default.info(`[UPDATE] software_update Response: ${JSON.stringify(res)}`);
                        http_logger_1.default.info(`[UPDATE] software_update applyReqUpdate: ${JSON.stringify(res.applyReqUpdate)}`);
                        if (res.applyReqUpdate) {
                            res.applyReqUpdate = res.applyReqUpdate === 'true';
                        }
                        else {
                            http_logger_1.default.info(`[UPDATE] software_update applyReqUpdate falsy: ${res.applyReqUpdate}`);
                        }
                        resolve(res);
                    }
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    reject(new common_1.GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
                }, 5000);
            }
            else {
                reject(new common_1.GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
            }
        });
    }
    async getCurrentVersion(software) {
        if (software === 'rrs') {
            return this.getRrsCurrentVersion();
        }
        return this.getOtherSwCurrentVersion({ software });
    }
    async getRrsCurrentVersion() {
        try {
            const rrsDir = path.join((0, os_1.homedir)(), software_c_1.SOFTWARE_DIR['rrs']);
            const versionPath = path.join(rrsDir, 'version.json');
            const versionData = await fs.promises.readFile(versionPath, 'utf-8');
            return JSON.parse(versionData);
        }
        catch (_error) {
            throw new common_1.NotFoundException({
                message: `[rrs] version.json 파일을 찾을 수 없습니다.`,
            });
        }
    }
    async getOtherSwCurrentVersion(data = {}) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.slamnav != null) {
                this.socketGateway.server.to('slamnav').emit('swVersionInfo', data);
                http_logger_1.default.info(`[UPDATE] swVersionInfo: ${JSON.stringify(data)}`);
                this.socketGateway.slamnav.once('swVersionInfoResponse', (res) => {
                    http_logger_1.default.info(`[UPDATE] swVersionInfo Response: ${JSON.stringify(res)}`);
                    resolve(res);
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    reject(new common_1.GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
                }, 5000);
            }
            else {
                reject(new common_1.GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
            }
        });
    }
    async getNewVersion({ software, branch, }) {
        await this.checkRepositoryAccess();
        const newVersionUrl = `${software_c_1.RELEASE_REPO_RAW_URL}/${branch}/${software}/version.json`;
        try {
            const newVersionData = await fetch(newVersionUrl);
            return newVersionData.json();
        }
        catch (_error) {
            throw new common_1.NotFoundException({
                message: `[${software}] ${branch} 브랜치의 version.json 파일을 찾을 수 없습니다.`,
            });
        }
    }
    decryptToken(base64Payload) {
        const keyStr = 'RAINBOW_GITHUB_API_TOKEN';
        const key = crypto.createHash('sha256').update(keyStr).digest();
        const payloadBuffer = Buffer.from(base64Payload, 'base64');
        const iv = payloadBuffer.slice(0, 16);
        const encrypted = payloadBuffer.slice(16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async getReleaseAppsVersionList({ token, branch = 'main', software, }) {
        try {
            const url = `https://api.github.com/repos/rainbow-mobile/rainbow-release-apps/contents/${software}?ref=${branch}`;
            const res = await fetch(url, {
                headers: {
                    Authorization: `Basic ${this.decryptToken(token)}`,
                },
                method: 'GET',
            });
            return res.json();
        }
        catch (error) {
            throw new common_1.BadRequestException({
                message: error.message,
            });
        }
    }
    async getReleaseAppsBranches({ token, per_page, page, }) {
        try {
            const url = `https://api.github.com/repos/rainbow-mobile/rainbow-release-apps/branches?per_page=${per_page}&page=${page}`;
            const res = await fetch(url, {
                headers: {
                    Authorization: `Basic ${this.decryptToken(token)}`,
                },
            });
            return res.json();
        }
        catch (error) {
            throw new common_1.BadRequestException({
                message: error.message,
            });
        }
    }
    async webUIAppAdd({ appNames, branch, fo }) {
        const appAddScript = path.join((0, os_1.homedir)(), `rainbow-deploy-kit/web-ui`, 'fe-add-app.sh');
        const rainbowDeployKitDir = path.join((0, os_1.homedir)(), 'rainbow-deploy-kit');
        if (!fs.existsSync(appAddScript)) {
            throw new common_1.NotFoundException({
                message: `~/rainbow-deploy-kit/web-ui/fe-add-app.sh 파일을 찾을 수 없습니다.`,
            });
        }
        try {
            (0, child_process_1.execSync)('git pull', {
                cwd: rainbowDeployKitDir,
                stdio: 'pipe',
            });
            (0, child_process_1.execSync)(`bash ${appAddScript}${branch ? ` --mode=${branch}` : ''}${fo ? ` --fo=${fo}` : ''} ${appNames.join(' ')}`);
            return { appNames, branch, fo };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                message: error.message,
            });
        }
    }
    async webUIAppDelete({ appNames }) {
        const appDeleteScript = path.join((0, os_1.homedir)(), `rainbow-deploy-kit/web-ui`, 'fe-delete-app.sh');
        const rainbowDeployKitDir = path.join((0, os_1.homedir)(), 'rainbow-deploy-kit');
        if (!fs.existsSync(appDeleteScript)) {
            throw new common_1.NotFoundException({
                message: `~/rainbow-deploy-kit/web-ui/fe-delete-app.sh 파일을 찾을 수 없습니다.`,
            });
        }
        try {
            (0, child_process_1.execSync)('git pull', {
                cwd: rainbowDeployKitDir,
                stdio: 'pipe',
            });
            (0, child_process_1.execSync)(`bash ${appDeleteScript} ${appNames.join(' ')}`);
            return { appNames };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                message: error.message,
            });
        }
    }
};
exports.UpdateService = UpdateService;
exports.UpdateService = UpdateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], UpdateService);
//# sourceMappingURL=update.service.js.map