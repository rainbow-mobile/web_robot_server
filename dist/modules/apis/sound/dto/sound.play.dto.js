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
exports.SoundPlayDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class SoundPlayDto {
}
exports.SoundPlayDto = SoundPlayDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '파일 이름',
        example: 'test.mp3',
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SoundPlayDto.prototype, "fileNm", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, swagger_1.ApiProperty)({
        description: '재생 볼륨',
        example: 100,
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], SoundPlayDto.prototype, "volume", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: '응답을 오디오 재생 끝나고나서 받을지(true), 재생 시작하고 받을지(false)',
        example: false,
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], SoundPlayDto.prototype, "waitDone", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: '반복재생 모드',
        example: false,
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], SoundPlayDto.prototype, "repeat", void 0);
