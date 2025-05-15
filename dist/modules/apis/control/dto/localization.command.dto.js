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
exports.LocalizationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class LocalizationDto {
}
exports.LocalizationDto = LocalizationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Localization 명령',
        example: 'init',
        required: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocalizationDto.prototype, "command", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target X (command == init)',
        example: '0'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocalizationDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target Y (command == init)',
        example: '0'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocalizationDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target Z (command == init)',
        example: '0'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocalizationDto.prototype, "z", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target RZ (command == init)',
        example: '0'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LocalizationDto.prototype, "rz", void 0);
//# sourceMappingURL=localization.command.dto.js.map