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
exports.ResponseTestResultListDto = exports.ResponseTestResultDto = exports.UpdateTestDataDto = exports.GetTestResultListDto = exports.GetRecentTestResultBySubjectDto = exports.GetTestResultBySubjectDto = exports.TestResultDto = void 0;
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
        example: test_entity_1.SubjectEnum.DISPLAY,
        description: '테스트 주제',
        enum: test_entity_1.SubjectEnum,
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
        example: 'tester1',
        description: '테스트 수행자',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", String)
], TestResultDto.prototype, "initTester", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1719878400000',
        description: '테스트 수행 시간',
    }),
    __metadata("design:type", Date)
], TestResultDto.prototype, "testAt", void 0);
class GetTestResultBySubjectDto {
}
exports.GetTestResultBySubjectDto = GetTestResultBySubjectDto;
__decorate([
    (0, class_validator_1.IsEnum)(test_entity_1.SubjectEnum),
    (0, swagger_1.ApiProperty)({
        example: test_entity_1.SubjectEnum.DISPLAY,
        description: '테스트 주제',
    }),
    __metadata("design:type", String)
], GetTestResultBySubjectDto.prototype, "subject", void 0);
class GetRecentTestResultBySubjectDto {
}
exports.GetRecentTestResultBySubjectDto = GetRecentTestResultBySubjectDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(test_entity_1.SubjectEnum, { each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((s) => s.trim());
        }
        return value;
    }),
    (0, swagger_1.ApiProperty)({
        example: [test_entity_1.SubjectEnum.DISPLAY, test_entity_1.SubjectEnum.SPEAKER],
        description: '테스트 주제 배열 (쉼표로 구분된 문자열도 지원)',
    }),
    __metadata("design:type", Array)
], GetRecentTestResultBySubjectDto.prototype, "subjects", void 0);
class GetTestResultListDto extends pagination_request_1.PaginationRequest {
    constructor() {
        super(...arguments);
        this.orderBy = 'DESC';
    }
}
exports.GetTestResultListDto = GetTestResultListDto;
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
    (0, class_validator_1.IsNumber)({}, { message: '숫자(timestamp) 또는 ISO 문자열이어야 합니다.' }),
    (0, class_validator_1.IsDateString)({}, { message: 'ISO 날짜문자열이어야 합니다.' }),
    (0, swagger_1.ApiProperty)({
        type: String,
        description: '테스트 시작일 (timestamp 또는 ISO 문자열)',
        example: '1719878400000',
        required: false,
    }),
    __metadata("design:type", Object)
], GetTestResultListDto.prototype, "startDt", void 0);
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
    (0, class_validator_1.IsNumber)({}, { message: '숫자(timestamp) 또는 ISO 문자열이어야 합니다.' }),
    (0, class_validator_1.IsDateString)({}, { message: 'ISO 날짜문자열이어야 합니다.' }),
    (0, swagger_1.ApiProperty)({
        type: String,
        description: '테스트 종료일 (timestamp 또는 ISO 문자열)',
        example: '1719878400000',
        required: false,
    }),
    __metadata("design:type", Object)
], GetTestResultListDto.prototype, "endDt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(test_entity_1.SubjectEnum, { each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map((s) => s.trim());
        }
        return value;
    }),
    (0, swagger_1.ApiProperty)({
        example: [test_entity_1.SubjectEnum.DISPLAY, test_entity_1.SubjectEnum.SPEAKER],
        description: '테스트 주제 배열 (쉼표로 구분된 문자열도 지원)',
        required: false,
        enum: test_entity_1.SubjectEnum,
        isArray: true,
    }),
    __metadata("design:type", Array)
], GetTestResultListDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
        required: false,
    }),
    __metadata("design:type", String)
], GetTestResultListDto.prototype, "initTester", void 0);
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
], GetTestResultListDto.prototype, "orderBy", void 0);
class UpdateTestDataDto {
}
exports.UpdateTestDataDto = UpdateTestDataDto;
__decorate([
    (0, class_validator_1.IsEnum)(test_entity_1.SubjectEnum),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: test_entity_1.SubjectEnum.DISPLAY,
        description: '테스트 주제',
        enum: test_entity_1.SubjectEnum,
    }),
    __metadata("design:type", String)
], UpdateTestDataDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(test_entity_1.TestResult),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        example: test_entity_1.TestResult.SUCCESS,
        description: '테스트 결과',
        enum: test_entity_1.TestResult,
    }),
    __metadata("design:type", String)
], UpdateTestDataDto.prototype, "result", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 'tester1',
        description: '테스트 수행자',
        required: false,
    }),
    __metadata("design:type", String)
], UpdateTestDataDto.prototype, "initTester", void 0);
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
class ResponseTestResultListDto extends ResponseTestResultDto {
}
exports.ResponseTestResultListDto = ResponseTestResultListDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 10,
        description: '페이지 크기',
    }),
    __metadata("design:type", Number)
], ResponseTestResultListDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: '전체 페이지 수',
    }),
    __metadata("design:type", Number)
], ResponseTestResultListDto.prototype, "totalPage", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: '전체 테스트 결과 수',
    }),
    __metadata("design:type", Number)
], ResponseTestResultListDto.prototype, "totalCount", void 0);
//# sourceMappingURL=test.dto.js.map