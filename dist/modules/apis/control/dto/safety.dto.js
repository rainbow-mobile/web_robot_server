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
exports.ResetSafetyFlagDto = exports.SetSafetyFieldDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SetSafetyFieldDto {
}
exports.SetSafetyFieldDto = SetSafetyFieldDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, swagger_1.ApiProperty)({
        description: '',
        example: 0,
    }),
    __metadata("design:type", Number)
], SetSafetyFieldDto.prototype, "field", void 0);
class ResetSafetyFlagDto {
}
exports.ResetSafetyFlagDto = ResetSafetyFlagDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: '리셋할 플래그 이름을 입력하세요.',
        example: 'bumper',
        enum: ['bumper', 'interlock', 'obstacle', 'operationStop'],
    }),
    __metadata("design:type", String)
], ResetSafetyFlagDto.prototype, "reset_flag", void 0);
//# sourceMappingURL=safety.dto.js.map