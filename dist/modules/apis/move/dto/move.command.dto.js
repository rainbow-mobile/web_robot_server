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
exports.MoveCommandDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class MoveCommandDto {
}
exports.MoveCommandDto = MoveCommandDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Move 명령',
        example: 'goal',
        required: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "command", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Goal ID (command == goal)',
        example: '',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "goal_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Goal NAME (command == goal)',
        example: '',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "goal_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Map NAME',
        example: '',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "map_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '주행 Method',
        example: 'pp',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '속도 Preset',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "preset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target X (command == target)',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target Y (command == target)',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target Z (command == target)',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "z", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target RZ (command == target)',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "rz", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target VX (command == jog)',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "vx", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target VY (command == jog)',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "vy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Target WZ (command == jog)',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "wz", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: 'Time',
        example: '0',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MoveCommandDto.prototype, "time", void 0);
//# sourceMappingURL=move.command.dto.js.map