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
exports.PingSendToTargetDto = exports.GetNewVersionDto = exports.GetSoftwareParamDto = void 0;
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
