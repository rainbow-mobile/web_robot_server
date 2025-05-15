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
exports.LogReadDto = void 0;
const pagination_request_1 = require("../../../../common/pagination/pagination.request");
const date_util_1 = require("../../../../common/util/date.util");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class LogReadDto extends pagination_request_1.PaginationRequest {
}
exports.LogReadDto = LogReadDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: '2025-01-01',
        description: '로그 시작일',
        required: false,
    }),
    __metadata("design:type", String)
], LogReadDto.prototype, "startDt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: date_util_1.DateUtil.formatDateYYYYMMDD(new Date()),
        description: '로그 종료일',
        required: false,
    }),
    __metadata("design:type", String)
], LogReadDto.prototype, "endDt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, swagger_1.ApiProperty)({
        example: ['error', 'warn', 'info', 'debug'],
        required: false,
        description: '로그 레벨'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], LogReadDto.prototype, "levels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: '',
        required: false,
        description: '로그 카테고리'
    }),
    __metadata("design:type", String)
], LogReadDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: '',
        required: false,
        description: '검색옵션'
    }),
    __metadata("design:type", String)
], LogReadDto.prototype, "searchType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: '',
        required: false,
        description: '검색단어'
    }),
    __metadata("design:type", String)
], LogReadDto.prototype, "searchText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: '',
        required: false,
        description: '정렬옵션'
    }),
    __metadata("design:type", String)
], LogReadDto.prototype, "sortOption", void 0);
//# sourceMappingURL=log.read.dto.js.map