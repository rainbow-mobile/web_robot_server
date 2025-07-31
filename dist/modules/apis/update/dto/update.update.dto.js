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
exports.ResponseWebUIAppDeleteDto = exports.ResponseWebUIAppAddDto = exports.WebUIAppDeleteDto = exports.WebUIAppAddDto = exports.ReqUpdateSoftwareDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ReqUpdateSoftwareDto {
}
exports.ReqUpdateSoftwareDto = ReqUpdateSoftwareDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '업데이트할 소프트웨어 종류 (예: rrs-server, slamnav2)',
        example: 'slamnav2',
        default: 'slamnav2',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReqUpdateSoftwareDto.prototype, "software", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '업데이트할 브랜치 이름',
        example: 'main',
        default: 'main',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReqUpdateSoftwareDto.prototype, "branch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '업데이트할 버전 이름',
        example: '1.2.4',
        default: '',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReqUpdateSoftwareDto.prototype, "version", void 0);
class WebUIAppAddDto {
}
exports.WebUIAppAddDto = WebUIAppAddDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '앱 이름 배열',
        example: ['app1', 'app2'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], WebUIAppAddDto.prototype, "appNames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '브랜치 이름',
        example: 'main',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WebUIAppAddDto.prototype, "branch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '로봇 UI에 노출할 첫페이지 URL',
        example: '/S100',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WebUIAppAddDto.prototype, "fo", void 0);
class WebUIAppDeleteDto {
}
exports.WebUIAppDeleteDto = WebUIAppDeleteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '앱 이름 배열',
        example: ['app1', 'app2'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], WebUIAppDeleteDto.prototype, "appNames", void 0);
class ResponseWebUIAppAddDto {
}
exports.ResponseWebUIAppAddDto = ResponseWebUIAppAddDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '추가한 앱 이름 배열',
        example: ['app1', 'app2'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], ResponseWebUIAppAddDto.prototype, "appNames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '브랜치 이름',
        example: 'main',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResponseWebUIAppAddDto.prototype, "branch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '로봇 UI에 노출할 첫페이지 URL',
        example: '/S100',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResponseWebUIAppAddDto.prototype, "fo", void 0);
class ResponseWebUIAppDeleteDto {
}
exports.ResponseWebUIAppDeleteDto = ResponseWebUIAppDeleteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '삭제한 앱 이름 배열',
        example: ['app1', 'app2'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], ResponseWebUIAppDeleteDto.prototype, "appNames", void 0);
//# sourceMappingURL=update.update.dto.js.map