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
    getTestRecordList(param) {
        return this.testService.getTestRecordAll(param);
    }
    getTestRecord(id) {
        return this.testService.getTestRecord(Number(id));
    }
    getRecentTestResult(param) {
        return this.testService.getRecentTestResult(param);
    }
    getTestResultBySubject(param) {
        return this.testService.getTestResultBySubject(param);
    }
    checkTestRunning(req) {
        const sessionId = req.sessionID;
        return this.testService.checkTestRunning(sessionId);
    }
    startTest(req, param) {
        const sessionId = req.sessionID;
        return this.testService.startTest(param, sessionId);
    }
    endTest(req) {
        const sessionId = req.sessionID;
        return this.testService.endTest(sessionId);
    }
    insertTestRecord(insertTestRecordDto) {
        return this.testService.insertTestRecord(insertTestRecordDto);
    }
    updateTestRecord(updateTestRecordDto) {
        return this.testService.updateTestRecord(updateTestRecordDto);
    }
    upsertTestResult(req, updateTestDataDto) {
        const sessionId = req.sessionID;
        return this.testService.upsertTestResult(updateTestDataDto, sessionId);
    }
};
exports.TestController = TestController;
__decorate([
    (0, common_1.Get)('record/list'),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 결과 목록 조회',
        description: '페이지네이션과 필터링을 지원하는 테스트 결과 목록을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '테스트 결과 목록 조회 성공',
        type: test_dto_1.ResponseTestRecordListDto,
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
    __metadata("design:paramtypes", [test_dto_1.GetTestRecordListDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "getTestRecordList", null);
__decorate([
    (0, common_1.Get)('record/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 레코드 조회',
        description: '테스트 레코드를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '테스트 레코드 조회 성공',
        type: test_dto_1.TestRecordDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "getTestRecord", null);
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
    __metadata("design:paramtypes", [test_dto_1.GetRecentTestResultDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "getRecentTestResult", null);
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
    (0, common_1.Get)('check-test-running'),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 진행 여부 확인',
        description: '테스트 진행 여부를 확인합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '테스트 진행 여부 확인 성공',
        type: test_dto_1.CheckTestRunningDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "checkTestRunning", null);
__decorate([
    (0, common_1.Post)('start'),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 시작',
        description: '테스트를 시작합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '테스트 시작 성공',
        type: test_dto_1.TestRunningInfoDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '이미 진행중인 테스트가 있습니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 내부 오류',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, test_dto_1.StartTestDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "startTest", null);
__decorate([
    (0, common_1.Post)('end'),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 종료',
        description: '테스트를 종료합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '테스트 종료 성공',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '테스트 시작 API를 통해 테스트를 시작하지 않았습니다. 테스트 시작 API를 통해 테스트를 시작하세요.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 내부 오류',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "endTest", null);
__decorate([
    (0, common_1.Post)('record'),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 레코드 생성',
        description: '새로운 테스트 레코드를 생성합니다.',
    }),
    (0, swagger_1.ApiBody)({
        type: test_dto_1.InsertTestRecordDto,
        description: '테스트 레코드 데이터',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '테스트 레코드 생성 성공',
        type: test_dto_1.TestRecordDto,
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
    __metadata("design:paramtypes", [test_dto_1.InsertTestRecordDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "insertTestRecord", null);
__decorate([
    (0, common_1.Put)('record'),
    (0, swagger_1.ApiOperation)({
        summary: '테스트 레코드 수정',
        description: '기존 테스트 레코드를 수정합니다.',
    }),
    (0, swagger_1.ApiBody)({
        type: test_dto_1.UpdateTestRecordDto,
        description: '테스트 레코드 데이터',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '테스트 레코드 수정 성공',
        type: test_dto_1.TestRecordDto,
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
    __metadata("design:paramtypes", [test_dto_1.UpdateTestRecordDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "updateTestRecord", null);
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
        type: test_dto_1.TestResultDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청 데이터',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 내부 오류',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, test_dto_1.UpdateTestDataDto]),
    __metadata("design:returntype", void 0)
], TestController.prototype, "upsertTestResult", null);
exports.TestController = TestController = __decorate([
    (0, swagger_1.ApiTags)('테스트 관리'),
    (0, common_1.Controller)('test'),
    __metadata("design:paramtypes", [test_service_1.TestService])
], TestController);
//# sourceMappingURL=test.controller.js.map