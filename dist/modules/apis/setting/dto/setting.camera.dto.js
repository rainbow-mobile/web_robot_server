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
exports.CameraInfoDto = exports.CameraOrderInfoDto = exports.CameraOrderChangeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CameraOrderChangeDto {
}
exports.CameraOrderChangeDto = CameraOrderChangeDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: '카메라 순서',
        example: {
            cam1: 'serial_number',
            cam2: 'serial_number',
        },
    }),
    __metadata("design:type", Object)
], CameraOrderChangeDto.prototype, "orderInfo", void 0);
class CameraOrderInfoDto {
}
exports.CameraOrderInfoDto = CameraOrderInfoDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: '카메라 순서 정보',
        example: {
            cam1: 'serial_number',
            cam2: 'serial_number',
        },
    }),
    __metadata("design:type", Object)
], CameraOrderInfoDto.prototype, "orderInfo", void 0);
class CameraInfoDto {
}
exports.CameraInfoDto = CameraInfoDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: '카메라 정보',
        example: {
            cam1: 'serial_number',
            cam2: 'serial_number',
        },
    }),
    __metadata("design:type", Object)
], CameraInfoDto.prototype, "info", void 0);
//# sourceMappingURL=setting.camera.dto.js.map