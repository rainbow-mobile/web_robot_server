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
    getReleaseAppsBranches(params) {
        return this.updateService.getReleaseAppsBranches(params);
    }
    getReleaseAppsVersionList(params) {
        return this.updateService.getReleaseAppsVersionList(params);
    }
    webUIAppAdd(webUIAppAddDto) {
        return this.updateService.webUIAppAdd(webUIAppAddDto);
    }
    webUIAppDelete(webUIAppDeleteDto) {
        return this.updateService.webUIAppDelete(webUIAppDeleteDto);
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
__decorate([
    (0, common_1.Get)('release-apps/branches'),
    (0, swagger_1.ApiOperation)({
        summary: 'rainbow-release-apps 레포지토리의 브랜치 조회',
        description: 'rainbow-release-apps 레포지토리의 브랜치를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'rainbow-release-apps 레포지토리의 브랜치 조회 성공',
        type: [update_get_dto_1.ResponseReleaseAppsBranchesDto],
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_get_dto_1.GetReleaseAppsBranchesDto]),
    __metadata("design:returntype", void 0)
], UpdateController.prototype, "getReleaseAppsBranches", null);
__decorate([
    (0, common_1.Get)('release-apps/version-list'),
    (0, swagger_1.ApiOperation)({
        summary: 'rainbow-release-apps 레포지토리의 버전 조회',
        description: 'rainbow-release-apps 레포지토리의 버전을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'rainbow-release-apps 레포지토리의 버전 조회 성공',
        type: [update_get_dto_1.ResponseReleaseVersionInfoDto],
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_get_dto_1.GetReleaseAppsVersionListDto]),
    __metadata("design:returntype", void 0)
], UpdateController.prototype, "getReleaseAppsVersionList", null);
__decorate([
    (0, common_1.Post)('web-ui/app/add'),
    (0, swagger_1.ApiOperation)({
        summary: '웹 UI 앱 추가',
        description: '웹 UI 앱을 추가합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '웹 UI 앱 추가 성공',
        type: update_update_dto_1.ResponseWebUIAppAddDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '웹 UI 앱 추가 실패',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '웹 UI 앱 추가 스크립트 파일을 찾을 수 없습니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_update_dto_1.WebUIAppAddDto]),
    __metadata("design:returntype", void 0)
], UpdateController.prototype, "webUIAppAdd", null);
__decorate([
    (0, common_1.Delete)('web-ui/app/delete'),
    (0, swagger_1.ApiOperation)({
        summary: '웹 UI 앱 삭제',
        description: '웹 UI 앱을 삭제합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '웹 UI 앱 삭제 성공',
        type: update_update_dto_1.ResponseWebUIAppDeleteDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '웹 UI 앱 삭제 실패',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '웹 UI 앱 삭제 스크립트 파일을 찾을 수 없습니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_update_dto_1.WebUIAppDeleteDto]),
    __metadata("design:returntype", void 0)
], UpdateController.prototype, "webUIAppDelete", null);
exports.UpdateController = UpdateController = __decorate([
    (0, swagger_1.ApiTags)('업데이트 관련 API (update)'),
    (0, common_1.Controller)('update'),
    __metadata("design:paramtypes", [update_service_1.UpdateService])
], UpdateController);
//# sourceMappingURL=update.controller.js.map