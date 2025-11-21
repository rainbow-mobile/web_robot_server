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
exports.ResponseReleaseVersionInfoDto = exports.ResponseReleaseAppsBranchesDto = exports.CommitDto = exports.GetReleaseAppsVersionListDto = exports.GetReleaseAppsBranchesDto = exports.PingSendToTargetDto = exports.GetNewVersionDto = exports.GetSoftwareParamDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GetSoftwareParamDto {
}
exports.GetSoftwareParamDto = GetSoftwareParamDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: '소프트웨어 종류 (예: rrs, slamnav2)',
        example: 'slamnav2',
    }),
    __metadata("design:type", String)
], GetSoftwareParamDto.prototype, "software", void 0);
class GetNewVersionDto {
}
exports.GetNewVersionDto = GetNewVersionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: '브랜치 이름',
        default: 'main',
    }),
    __metadata("design:type", String)
], GetNewVersionDto.prototype, "branch", void 0);
class PingSendToTargetDto {
}
exports.PingSendToTargetDto = PingSendToTargetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: '타겟 호스트',
        default: '192.168.1.1',
    }),
    __metadata("design:type", String)
], PingSendToTargetDto.prototype, "target", void 0);
class GetReleaseAppsBranchesDto {
}
exports.GetReleaseAppsBranchesDto = GetReleaseAppsBranchesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'encrypted token',
        default: '3bJyXEJA/FvAYWnbAIsj6T96+217WeqR4HpdmuNTGcG/dzYaOLjjWkz3bjR1NGYQqj8nMS8A6N91bnaCTveF0Q==',
    }),
    __metadata("design:type", String)
], GetReleaseAppsBranchesDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: '한 페이지에 보여지는 브랜치 개수',
        default: 10,
    }),
    __metadata("design:type", Object)
], GetReleaseAppsBranchesDto.prototype, "per_page", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: '페이지 번호',
        default: 1,
    }),
    __metadata("design:type", Object)
], GetReleaseAppsBranchesDto.prototype, "page", void 0);
class GetReleaseAppsVersionListDto {
}
exports.GetReleaseAppsVersionListDto = GetReleaseAppsVersionListDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'encrypted token',
        default: '3bJyXEJA/FvAYWnbAIsj6T96+217WeqR4HpdmuNTGcG/dzYaOLjjWkz3bjR1NGYQqj8nMS8A6N91bnaCTveF0Q==',
    }),
    __metadata("design:type", String)
], GetReleaseAppsVersionListDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: '브랜치 이름',
        default: 'main',
    }),
    __metadata("design:type", String)
], GetReleaseAppsVersionListDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'software 이름',
        example: 'slamnav2, rrs-server, web-ui',
        default: 'slamnav2',
    }),
    __metadata("design:type", String)
], GetReleaseAppsVersionListDto.prototype, "software", void 0);
class CommitDto {
}
exports.CommitDto = CommitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'commit sha',
    }),
    __metadata("design:type", String)
], CommitDto.prototype, "sha", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'commit url',
    }),
    __metadata("design:type", String)
], CommitDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'commit name',
    }),
    __metadata("design:type", String)
], CommitDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'commit protected',
    }),
    __metadata("design:type", Boolean)
], CommitDto.prototype, "protected", void 0);
class ResponseReleaseAppsBranchesDto {
}
exports.ResponseReleaseAppsBranchesDto = ResponseReleaseAppsBranchesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'branch name',
    }),
    __metadata("design:type", String)
], ResponseReleaseAppsBranchesDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'branch protected',
    }),
    __metadata("design:type", Boolean)
], ResponseReleaseAppsBranchesDto.prototype, "protected", void 0);
class ResponseReleaseVersionInfoDto {
}
exports.ResponseReleaseVersionInfoDto = ResponseReleaseVersionInfoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'version name',
    }),
    __metadata("design:type", String)
], ResponseReleaseVersionInfoDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'version path',
    }),
    __metadata("design:type", String)
], ResponseReleaseVersionInfoDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'version sha',
    }),
    __metadata("design:type", String)
], ResponseReleaseVersionInfoDto.prototype, "sha", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'version size',
    }),
    __metadata("design:type", Number)
], ResponseReleaseVersionInfoDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'version url',
    }),
    __metadata("design:type", String)
], ResponseReleaseVersionInfoDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'version download url',
    }),
    __metadata("design:type", String)
], ResponseReleaseVersionInfoDto.prototype, "download_url", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiPropertyOptional)({
        description: 'version links',
    }),
    __metadata("design:type", Object)
], ResponseReleaseVersionInfoDto.prototype, "_links", void 0);
//# sourceMappingURL=update.get.dto.js.map