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
exports.ConfigResponseDto = exports.ConfigRequestDto = exports.ConfigParameterDto = exports.Result = exports.ConfigParameterType = exports.ConfigCommand = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var ConfigCommand;
(function (ConfigCommand) {
    ConfigCommand["getDriveParam"] = "getDriveParam";
    ConfigCommand["getParam"] = "getParam";
    ConfigCommand["setParam"] = "setParam";
})(ConfigCommand || (exports.ConfigCommand = ConfigCommand = {}));
var ConfigParameterType;
(function (ConfigParameterType) {
    ConfigParameterType["float"] = "float";
    ConfigParameterType["string"] = "string";
    ConfigParameterType["boolean"] = "boolean";
    ConfigParameterType["int"] = "int";
})(ConfigParameterType || (exports.ConfigParameterType = ConfigParameterType = {}));
var Result;
(function (Result) {
    Result["accept"] = "accept";
    Result["reject"] = "reject";
    Result["fail"] = "fail";
    Result["success"] = "success";
})(Result || (exports.Result = Result = {}));
class ConfigParameterDto {
}
exports.ConfigParameterDto = ConfigParameterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '파라미터 이름',
        example: 'param1',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfigParameterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '파라미터 타입',
        example: ConfigParameterType.float,
        required: true,
        enum: ConfigParameterType,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfigParameterDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '파라미터 값. string으로 변환하여 입력하세요.',
        example: '15.0',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfigParameterDto.prototype, "value", void 0);
class ConfigRequestDto {
}
exports.ConfigRequestDto = ConfigRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '파라미터 목록',
        example: [
            {
                name: 'v_limit_jog',
                value: '0.1',
                type: ConfigParameterType.float,
            },
        ],
        required: false,
    }),
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConfigParameterDto),
    __metadata("design:type", Array)
], ConfigRequestDto.prototype, "parameters", void 0);
class ConfigResponseDto extends ConfigRequestDto {
}
exports.ConfigResponseDto = ConfigResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '결과 상태',
        example: Result.accept,
        enum: Result,
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigResponseDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '결과 메시지. result값이 reject, fail일 경우 메시지 내용을 확인하세요.',
        example: '파라미터의 값이 범위를 벗어났습니다.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigResponseDto.prototype, "message", void 0);
//# sourceMappingURL=config.dto.js.map