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
exports.PresetDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class PresetDto {
}
exports.PresetDto = PresetDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '선속도 제한',
        example: '1.5',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "LIMIT_V", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '각속도 제한',
        example: '45.0',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "LIMIT_W", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '선 가속도 제한',
        example: '0.5',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "LIMIT_V_ACC", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '각 가속도 제한',
        example: '90.0',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "LIMIT_W_ACC", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '도착 각속도 제한',
        example: '30.0',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "LIMIT_PIVOT_W", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 시작시점 속도',
        example: '0.1',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "ST_V", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 종료시점 속도',
        example: '0.1',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "ED_V", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 T',
        example: '0.0',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "DRIVE_T", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 H',
        example: '4.0',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "DRIVE_H", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 A',
        example: '0.8',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "DRIVE_A", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 B',
        example: '0.05',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "DRIVE_B", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 L',
        example: '0.5',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "DRIVE_L", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 K',
        example: '0.8',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "DRIVE_K", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 EPS',
        example: '0.3',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PresetDto.prototype, "DRIVE_EPS", void 0);
//# sourceMappingURL=setting.preset.dto.js.map