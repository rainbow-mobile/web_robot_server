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
exports.UpdateController = void 0;
const common_1 = require("@nestjs/common");
const update_service_1 = require("./update.service");
const update_update_dto_1 = require("./dto/update.update.dto");
const swagger_1 = require("@nestjs/swagger");
const update_get_dto_1 = require("./dto/update.get.dto");
let UpdateController = class UpdateController {
    constructor(updateService) {
        this.updateService = updateService;
    }
    updateSoftware(reqUpdateSoftwareDto) {
        return this.updateService.updateSoftware(reqUpdateSoftwareDto);
    }
    pingSendToTarget({ target }) {
        return this.updateService.pingSendToTarget(target);
    }
    getNewVersion(software, { branch = 'main' }) {
        return this.updateService.getNewVersion({
            software,
            branch,
        });
    }
    getCurrentVersion(software) {
        return this.updateService.getCurrentVersion(software);
    }
};
exports.UpdateController = UpdateController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '소프트웨어 업데이트',
        description: '소프트웨어 업데이트를 요청합니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_update_dto_1.ReqUpdateSoftwareDto]),
    __metadata("design:returntype", void 0)
], UpdateController.prototype, "updateSoftware", null);
__decorate([
    (0, common_1.Get)('ping'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_get_dto_1.PingSendToTargetDto]),
    __metadata("design:returntype", void 0)
], UpdateController.prototype, "pingSendToTarget", null);
__decorate([
    (0, common_1.Get)(':software/get-new-version'),
    (0, swagger_1.ApiOperation)({
        summary: '소프트웨어 새로운 버전 조회',
        description: '소프트웨어 새로운 버전을 조회합니다. 위부망 접속이 안될 환경시 400 에러가 발생합니다.',
    }),
    __param(0, (0, common_1.Param)('software')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_get_dto_1.GetNewVersionDto]),
    __metadata("design:returntype", void 0)
], UpdateController.prototype, "getNewVersion", null);
__decorate([
    (0, common_1.Get)(':software/get-current-version'),
    (0, swagger_1.ApiOperation)({
        summary: '소프트웨어 현재 버전 조회',
        description: '소프트웨어 현재 버전을 조회합니다.',
    }),
    __param(0, (0, common_1.Param)('software')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UpdateController.prototype, "getCurrentVersion", null);
exports.UpdateController = UpdateController = __decorate([
    (0, swagger_1.ApiTags)('업데이트 관련 API (update)'),
    (0, common_1.Controller)('update'),
    __metadata("design:paramtypes", [update_service_1.UpdateService])
], UpdateController);
