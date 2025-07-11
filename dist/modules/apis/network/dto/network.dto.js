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
exports.NetworkDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class NetworkDto {
}
exports.NetworkDto = NetworkDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '네트워크 이름',
        example: '',
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NetworkDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '네트워크 디바이스 이름',
        example: 'eno1',
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NetworkDto.prototype, "device", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '네트워크 아이피',
        example: '',
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NetworkDto.prototype, "ip", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '네트워크 게이트웨이',
        example: '',
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NetworkDto.prototype, "gateway", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '네트워크 서브넷',
        example: '',
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NetworkDto.prototype, "mask", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, swagger_1.ApiProperty)({
        description: '네트워크 DNS',
        example: '',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], NetworkDto.prototype, "dns", void 0);
