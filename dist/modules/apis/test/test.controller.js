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
exports.TestController = void 0;
const common_1 = require("@nestjs/common");
const test_service_1 = require("./test.service");
const test_dto_1 = require("./dto/test.dto");
const swagger_1 = require("@nestjs/swagger");
let TestController = class TestController {
    constructor(testService) {
        this.testService = testService;
    }
    getTestResultList(param) {
        return this.testService.getTestResultAll(param);
    }
    getRecentTestResultBySubject(param) {
        return this.testService.getRecentTestResultBySubject(param);
    }
    getTestResultBySubject(param) {
        return this.testService.getTestResultBySubject(param);
    }
    upsertTestResult(updateTestDataDto) {
        return this.testService.upsertTestResult(updateTestDataDto);
    }
};
exports.TestController = TestController;
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 결과 목록 조회',
        description: '페이지네이션과 필터링을 지원하는 테스트 결과 목록을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '테스트 결과 목록 조회 성공',
        type: test_dto_1.ResponseTestResultListDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청 파라미터',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 내부 오류',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_dto_1.GetTestResultListDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "getTestResultList", null);
__decorate([
    (0, common_1.Get)('get-recent'),
    (0, swagger_1.ApiOperation)({
        summary: '주제별 최근 테스트 결과 조회',
        description: '지정된 주제들의 최근 테스트 결과를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '최근 테스트 결과 조회 성공',
        type: test_dto_1.ResponseTestResultDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청 파라미터',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_dto_1.GetRecentTestResultBySubjectDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "getRecentTestResultBySubject", null);
__decorate([
    (0, common_1.Get)('get-by-subject'),
    (0, swagger_1.ApiOperation)({
        summary: '특정 주제 테스트 결과 조회',
        description: '특정 주제의 모든 테스트 결과를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '주제별 테스트 결과 조회 성공',
        type: test_dto_1.ResponseTestResultDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청 파라미터',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_dto_1.GetTestResultBySubjectDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "getTestResultBySubject", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 결과 생성/수정',
        description: '새로운 테스트 결과를 생성하거나 기존 결과를 수정합니다.',
    }),
    (0, swagger_1.ApiBody)({
        type: test_dto_1.UpdateTestDataDto,
        description: '테스트 결과 데이터',
        examples: {
            success: {
                summary: '성공 케이스',
                value: {
                    subject: 'DISPLAY',
                    result: 'SUCCESS',
                    initTester: 'tester1',
                },
            },
            fail: {
                summary: '실패 케이스',
                value: {
                    subject: 'SPEAKER',
                    result: 'FAIL',
                    initTester: 'tester2',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '테스트 결과 생성/수정 성공',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                subject: { type: 'string' },
                result: { type: 'string' },
                initTester: { type: 'string' },
                testAt: { type: 'string', format: 'date-time' },
            },
        },
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
    __metadata("design:paramtypes", [test_dto_1.UpdateTestDataDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "upsertTestResult", null);
exports.TestController = TestController = __decorate([
    (0, swagger_1.ApiTags)('테스트 관리'),
    (0, common_1.Controller)('test'),
    __metadata("design:paramtypes", [test_service_1.TestService])
], TestController);
//# sourceMappingURL=test.controller.js.map