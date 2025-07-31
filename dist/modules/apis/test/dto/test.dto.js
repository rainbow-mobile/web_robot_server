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
exports.CheckTestRunningDto = exports.TestRunningInfoDto = exports.StartTestDto = exports.UpdateTestRecordDto = exports.InsertTestRecordDto = exports.ResponseTestRecordListDto = exports.ResponseTestRecordDto = exports.ResponseTestResultDto = exports.UpdateTestDataDto = exports.InsertTestDataDto = exports.GetTestRecordListDto = exports.GetRecentTestResultDto = exports.GetTestResultBySubjectDto = exports.TestRecordDto = exports.TestResultDto = void 0;
const pagination_request_1 = require("../../../../common/pagination/pagination.request");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const test_entity_1 = require("../entities/test.entity");
const class_transformer_1 = require("class-transformer");
class TestResultDto {
}
exports.TestResultDto = TestResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 ID',
    }),
    __metadata("design:type", Number)
], TestResultDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 레코드 ID',
    }),
    __metadata("design:type", Number)
], TestResultDto.prototype, "testRecordId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'DISPLAY',
        description: '테스트 주제',
    }),
    __metadata("design:type", String)
], TestResultDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: test_entity_1.TestResult.SUCCESS,
        description: '테스트 결과',
        enum: test_entity_1.TestResult,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", String)
], TestResultDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-07-16T07:56:52.000Z',
        description: '테스트 수행 시간',
    }),
    __metadata("design:type", Date)
], TestResultDto.prototype, "testAt", void 0);
class TestRecordDto {
}
exports.TestRecordDto = TestRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 레코드 ID',
    }),
    __metadata("design:type", Number)
], TestRecordDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [],
        description: '테스트 결과 목록',
        type: TestResultDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], TestRecordDto.prototype, "tests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", String)
], TestRecordDto.prototype, "tester", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-07-16T07:56:52.000Z',
        description: '테스트 레코드 생성 시간',
    }),
    __metadata("design:type", Date)
], TestRecordDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-07-16T07:56:52.000Z',
        description: '테스트 레코드 수정 시간',
    }),
    __metadata("design:type", Date)
], TestRecordDto.prototype, "updatedAt", void 0);
class GetTestResultBySubjectDto {
}
exports.GetTestResultBySubjectDto = GetTestResultBySubjectDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'DISPLAY',
        description: '테스트 주제',
    }),
    __metadata("design:type", String)
], GetTestResultBySubjectDto.prototype, "subject", void 0);
class GetRecentTestResultDto {
}
exports.GetRecentTestResultDto = GetRecentTestResultDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((s) => s.trim());
        }
        return value;
    }),
    (0, swagger_1.ApiProperty)({
        example: ['DISPLAY', 'SPEAKER'],
        description: '테스트 주제 배열 (쉼표로 구분된 문자열도 지원)',
        required: false,
        isArray: true,
    }),
    __metadata("design:type", Array)
], GetRecentTestResultDto.prototype, "subjects", void 0);
class GetTestRecordListDto extends pagination_request_1.PaginationRequest {
    constructor() {
        super(...arguments);
        this.orderBy = 'DESC';
    }
}
exports.GetTestRecordListDto = GetTestRecordListDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            if (/^\d+$/.test(value))
                return parseInt(value, 10);
            return value;
        }
        return value;
    }),
    (0, class_validator_1.Validate)((value) => {
        if (value === undefined || value === null)
            return true;
        if (typeof value === 'number') {
            const date = new Date(value);
            return !isNaN(date.getTime()) && date.getTime() > 0;
        }
        if (typeof value === 'string') {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
        return false;
    }, { message: '숫자(timestamp) 또는 ISO 문자열이어야 합니다.' }),
    (0, swagger_1.ApiProperty)({
        type: String,
        description: '테스트 시작일 (timestamp 또는 ISO 문자열)',
        example: '2025-07-16T07:56:52.000Z',
        required: false,
    }),
    __metadata("design:type", Object)
], GetTestRecordListDto.prototype, "startDt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            if (/^\d+$/.test(value))
                return parseInt(value, 10);
            return value;
        }
        return value;
    }),
    (0, class_validator_1.Validate)((value) => {
        if (value === undefined || value === null)
            return true;
        if (typeof value === 'number') {
            const date = new Date(value);
            return !isNaN(date.getTime()) && date.getTime() > 0;
        }
        if (typeof value === 'string') {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
        return false;
    }, { message: '숫자(timestamp) 또는 ISO 문자열이어야 합니다.' }),
    (0, swagger_1.ApiProperty)({
        type: String,
        description: '테스트 종료일 (timestamp 또는 ISO 문자열)',
        example: '2025-07-16T07:56:52.000Z',
        required: false,
    }),
    __metadata("design:type", Object)
], GetTestRecordListDto.prototype, "endDt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((s) => s.trim());
        }
        return value;
    }),
    (0, swagger_1.ApiProperty)({
        example: ['DISPLAY', 'SPEAKER'],
        description: '테스트 주제 배열 (쉼표로 구분된 문자열도 지원)',
        required: false,
        isArray: true,
    }),
    __metadata("design:type", Array)
], GetTestRecordListDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
        required: false,
    }),
    __metadata("design:type", String)
], GetTestRecordListDto.prototype, "tester", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DESC', 'ASC']),
    (0, swagger_1.ApiProperty)({
        example: 'DESC',
        description: '정렬 기준 (DESC, ASC)',
        enum: ['DESC', 'ASC'],
        default: 'DESC',
        required: false,
    }),
    __metadata("design:type", String)
], GetTestRecordListDto.prototype, "orderBy", void 0);
class InsertTestDataDto {
}
exports.InsertTestDataDto = InsertTestDataDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'DISPLAY',
        description: '테스트 주제',
    }),
    __metadata("design:type", String)
], InsertTestDataDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(test_entity_1.TestResult),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: test_entity_1.TestResult.SUCCESS,
        description: '테스트 결과',
        enum: test_entity_1.TestResult,
    }),
    __metadata("design:type", String)
], InsertTestDataDto.prototype, "result", void 0);
class UpdateTestDataDto extends InsertTestDataDto {
}
exports.UpdateTestDataDto = UpdateTestDataDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 레코드 ID',
    }),
    __metadata("design:type", Number)
], UpdateTestDataDto.prototype, "testRecordId", void 0);
class ResponseTestResultDto {
}
exports.ResponseTestResultDto = ResponseTestResultDto;
__decorate([
    (0, class_validator_1.IsArray)({ each: true }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TestResultDto),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: [],
        description: '테스트 결과 목록',
        type: TestResultDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], ResponseTestResultDto.prototype, "items", void 0);
class ResponseTestRecordDto {
}
exports.ResponseTestRecordDto = ResponseTestRecordDto;
__decorate([
    (0, class_validator_1.IsArray)({ each: true }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TestRecordDto),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: [],
        description: '테스트 레코드 목록',
        type: TestRecordDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], ResponseTestRecordDto.prototype, "items", void 0);
class ResponseTestRecordListDto extends ResponseTestRecordDto {
}
exports.ResponseTestRecordListDto = ResponseTestRecordListDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 10,
        description: '페이지 크기',
    }),
    __metadata("design:type", Number)
], ResponseTestRecordListDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '전체 페이지 수',
    }),
    __metadata("design:type", Number)
], ResponseTestRecordListDto.prototype, "totalPage", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: '전체 테스트 결과 수',
    }),
    __metadata("design:type", Number)
], ResponseTestRecordListDto.prototype, "totalCount", void 0);
class InsertTestRecordDto {
}
exports.InsertTestRecordDto = InsertTestRecordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
        required: false,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", String)
], InsertTestRecordDto.prototype, "tester", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, swagger_1.ApiProperty)({
        example: ['DISPLAY', 'SPEAKER'],
        description: '테스트 주제 배열',
        isArray: true,
    }),
    __metadata("design:type", Array)
], InsertTestRecordDto.prototype, "subjects", void 0);
class UpdateTestRecordDto {
}
exports.UpdateTestRecordDto = UpdateTestRecordDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 레코드 ID',
    }),
    __metadata("design:type", Number)
], UpdateTestRecordDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
        nullable: true,
        required: false,
        default: null,
    }),
    __metadata("design:type", String)
], UpdateTestRecordDto.prototype, "tester", void 0);
class StartTestDto {
}
exports.StartTestDto = StartTestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
    }),
    __metadata("design:type", String)
], StartTestDto.prototype, "tester", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 레코드 ID',
    }),
    __metadata("design:type", Number)
], StartTestDto.prototype, "testRecordId", void 0);
class TestRunningInfoDto {
}
exports.TestRunningInfoDto = TestRunningInfoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
    }),
    __metadata("design:type", String)
], TestRunningInfoDto.prototype, "tester", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 레코드 ID',
    }),
    __metadata("design:type", Number)
], TestRunningInfoDto.prototype, "testRecordId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 'test-session-1234567890',
        description: '테스트 세션 ID',
    }),
    __metadata("design:type", String)
], TestRunningInfoDto.prototype, "testSessionId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 종료 시간',
    }),
    __metadata("design:type", Number)
], TestRunningInfoDto.prototype, "testEndTimestamp", void 0);
class CheckTestRunningDto {
}
exports.CheckTestRunningDto = CheckTestRunningDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '테스트 레코드 ID',
        required: false,
        nullable: true,
        default: undefined,
    }),
    __metadata("design:type", Number)
], CheckTestRunningDto.prototype, "testRecordId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
        required: false,
        nullable: true,
        default: undefined,
    }),
    __metadata("design:type", String)
], CheckTestRunningDto.prototype, "tester", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: '테스트 진행 여부',
    }),
    __metadata("design:type", Boolean)
], CheckTestRunningDto.prototype, "isRunning", void 0);
//# sourceMappingURL=test.dto.js.map