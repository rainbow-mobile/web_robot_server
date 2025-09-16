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
exports.SettingSetParamResponseDto = exports.SettingSetParamRequestDto = exports.SettingSavePresetResponseDto = exports.SettingSavePresetRequestDto = exports.SettingDeletePresetResponseDto = exports.SettingDeletePresetRequestDto = exports.SettingCreatePresetResponseDto = exports.SettingCreatePresetRequestDto = exports.SettingGetPresetResponseDto = exports.SettingGetPresetRequestDto = exports.SettingGetPresetListResponseDto = exports.SettingGetPresetListRequestDto = exports.SettingSaveSettingAllResponseDto = exports.SettingSaveSettingAllRequestDto = exports.SettingSaveSettingResponseDto = exports.SettingSaveSettingRequestDto = exports.SettingGetSettingResponseDto = exports.SettingGetSettingRequestDto = exports.SettingResponseSlamnav = exports.SettingRequestSlamnav = exports.SettingResponseDto = exports.SettingRequestDto = exports.SettingParam = exports.SettingCommand = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var Description;
(function (Description) {
    Description["ID"] = "\uC694\uCCAD \uACE0\uC720 \uC544\uC774\uB514. \uC11C\uBC84\uC5D0\uC11C \uC790\uB3D9\uC0DD\uC131\uB418\uBA70 \uADF8\uB300\uB85C \uBC18\uD658.";
    Description["COMMAND"] = "\uC138\uD305 \uBA85\uB839\uC5B4.";
    Description["ROBOT_TYPE"] = "\uB85C\uBD07 \uD0C0\uC785. \uD0C0\uC785\uBCC4\uB85C \uC138\uD305 \uD30C\uC77C \uB0B4\uC6A9\uC774 \uB2E4\uB984";
    Description["TYPE"] = "\uD30C\uB77C\uBBF8\uD130 \uD0C0\uC785. float, string, boolean, int";
    Description["DATA"] = "\uC138\uD305 \uD30C\uC77C \uB0B4\uC6A9. json \uD615\uC2DD\uC73C\uB85C \uC800\uC7A5\uB418\uC5B4 \uC788\uC74C";
    Description["NAME"] = "\uC138\uD305 \uC774\uB984. \uD30C\uC77C \uB0B4\uC6A9\uC744 \uC218\uC815\uD560 \uB54C \uC138\uD305 \uBCC0\uC218\uC758 \uC774\uB984";
    Description["VALUE"] = "\uC138\uD305 \uAC12. \uD30C\uC77C \uB0B4\uC6A9\uC744 \uC218\uC815\uD560 \uB54C \uC138\uD305 \uBCC0\uC218\uC758 \uAC12. \uBAA8\uB4E0 \uAC12\uC740 string \uD615\uC2DD\uC73C\uB85C \uC9C0\uC815\uD558\uC5EC \uC1A1\uC2E0";
    Description["RESULT"] = "\uC138\uD305 \uACB0\uACFC. success, fail";
    Description["MESSAGE"] = "\uC138\uD305 \uACB0\uACFC \uBA54\uC2DC\uC9C0";
    Description["PRESET"] = "\uD504\uB9AC\uC14B \uC774\uB984. \uD504\uB9AC\uC14B \uD30C\uC77C\uC774\uB984\uC774 preset_1.json \uC774\uB77C\uBA74 1\uB85C \uBCF4\uB0B4\uC8FC\uC138\uC694.";
    Description["PRESET_LIST"] = "\uD504\uB9AC\uC14B \uB9AC\uC2A4\uD2B8. \uD504\uB9AC\uC14B \uD30C\uC77C\uC774\uB984\uC774 preset_1.json \uC774\uB77C\uBA74 1\uB85C \uBCF4\uB0B4\uC8FC\uC138\uC694.";
    Description["PARAM"] = "\uD30C\uB77C\uBBF8\uD130. \uD30C\uB77C\uBBF8\uD130\uB294 \uD30C\uB77C\uBBF8\uD130 \uC774\uB984, \uD30C\uB77C\uBBF8\uD130 \uD0C0\uC785, \uD30C\uB77C\uBBF8\uD130 \uAC12\uC73C\uB85C \uAD6C\uC131\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.";
})(Description || (Description = {}));
var SettingCommand;
(function (SettingCommand) {
    SettingCommand["getSetting"] = "getSetting";
    SettingCommand["saveSetting"] = "saveSetting";
    SettingCommand["saveSettingAll"] = "saveSettingAll";
    SettingCommand["getPresetList"] = "getPresetList";
    SettingCommand["getPreset"] = "getPreset";
    SettingCommand["deletePreset"] = "deletePreset";
    SettingCommand["createPreset"] = "createPreset";
    SettingCommand["savePreset"] = "savePreset";
    SettingCommand["getParam"] = "getParam";
    SettingCommand["setParam"] = "setParam";
    SettingCommand["getDriveParam"] = "getDriveParam";
})(SettingCommand || (exports.SettingCommand = SettingCommand = {}));
class SettingParam {
}
exports.SettingParam = SettingParam;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.NAME,
        example: 'SPEAKER',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingParam.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.VALUE,
        example: 'true',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingParam.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.TYPE,
        example: 'float',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingParam.prototype, "type", void 0);
class SettingRequestDto {
}
exports.SettingRequestDto = SettingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.PRESET,
        example: '1',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingRequestDto.prototype, "preset", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.PARAM,
        example: [{ name: 'SPEAKER', type: 'boolean', value: 'true' }],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingParam),
    __metadata("design:type", Array)
], SettingRequestDto.prototype, "param", void 0);
class SettingResponseDto extends SettingRequestDto {
}
exports.SettingResponseDto = SettingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.PRESET_LIST,
        example: ['0', '1'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Array)
], SettingResponseDto.prototype, "list", void 0);
class SettingRequestSlamnav extends SettingRequestDto {
}
exports.SettingRequestSlamnav = SettingRequestSlamnav;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.ID,
        example: '1234567890',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingRequestSlamnav.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.COMMAND,
        example: SettingCommand.getSetting,
        enum: SettingCommand,
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingRequestSlamnav.prototype, "command", void 0);
class SettingResponseSlamnav extends SettingResponseDto {
}
exports.SettingResponseSlamnav = SettingResponseSlamnav;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.ID,
        example: '1234567890',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingResponseSlamnav.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.COMMAND,
        example: SettingCommand.getSetting,
        enum: SettingCommand,
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingResponseSlamnav.prototype, "command", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.RESULT,
        example: 'success',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingResponseSlamnav.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.MESSAGE,
        example: '세팅 완료',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SettingResponseSlamnav.prototype, "message", void 0);
class SettingGetSettingRequestDto {
}
exports.SettingGetSettingRequestDto = SettingGetSettingRequestDto;
class SettingGetSettingResponseDto extends SettingGetSettingRequestDto {
}
exports.SettingGetSettingResponseDto = SettingGetSettingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.DATA,
        example: [{ name: 'SPEAKER', type: 'boolean', value: 'true' }],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingParam),
    __metadata("design:type", Array)
], SettingGetSettingResponseDto.prototype, "param", void 0);
class SettingSaveSettingRequestDto extends SettingGetSettingRequestDto {
}
exports.SettingSaveSettingRequestDto = SettingSaveSettingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.DATA,
        example: [{ name: 'SPEAKER', type: 'boolean', value: 'true' }],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingParam),
    __metadata("design:type", Array)
], SettingSaveSettingRequestDto.prototype, "param", void 0);
class SettingSaveSettingResponseDto extends SettingSaveSettingRequestDto {
}
exports.SettingSaveSettingResponseDto = SettingSaveSettingResponseDto;
class SettingSaveSettingAllRequestDto extends SettingGetSettingRequestDto {
}
exports.SettingSaveSettingAllRequestDto = SettingSaveSettingAllRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.DATA,
        example: [{ name: 'USE_RRS', type: 'boolean', value: 'true' }],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingParam),
    __metadata("design:type", Array)
], SettingSaveSettingAllRequestDto.prototype, "param", void 0);
class SettingSaveSettingAllResponseDto extends SettingSaveSettingAllRequestDto {
}
exports.SettingSaveSettingAllResponseDto = SettingSaveSettingAllResponseDto;
class SettingGetPresetListRequestDto extends SettingGetSettingRequestDto {
}
exports.SettingGetPresetListRequestDto = SettingGetPresetListRequestDto;
class SettingGetPresetListResponseDto extends SettingGetPresetListRequestDto {
}
exports.SettingGetPresetListResponseDto = SettingGetPresetListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.PRESET_LIST,
        example: ['0', '1'],
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Array)
], SettingGetPresetListResponseDto.prototype, "list", void 0);
class SettingGetPresetRequestDto extends SettingGetSettingRequestDto {
}
exports.SettingGetPresetRequestDto = SettingGetPresetRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.PRESET,
        example: '1',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingGetPresetRequestDto.prototype, "preset", void 0);
class SettingGetPresetResponseDto extends SettingGetPresetRequestDto {
}
exports.SettingGetPresetResponseDto = SettingGetPresetResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.DATA,
        example: [{ name: 'LIMIT_V', type: 'float', value: '1.2' }],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingParam),
    __metadata("design:type", Array)
], SettingGetPresetResponseDto.prototype, "param", void 0);
class SettingCreatePresetRequestDto extends SettingGetPresetRequestDto {
}
exports.SettingCreatePresetRequestDto = SettingCreatePresetRequestDto;
class SettingCreatePresetResponseDto extends SettingCreatePresetRequestDto {
}
exports.SettingCreatePresetResponseDto = SettingCreatePresetResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.DATA,
        example: [{ name: 'LIMIT_V', type: 'float', value: '1.2' }],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingParam),
    __metadata("design:type", Array)
], SettingCreatePresetResponseDto.prototype, "data", void 0);
class SettingDeletePresetRequestDto extends SettingGetPresetRequestDto {
}
exports.SettingDeletePresetRequestDto = SettingDeletePresetRequestDto;
class SettingDeletePresetResponseDto extends SettingDeletePresetRequestDto {
}
exports.SettingDeletePresetResponseDto = SettingDeletePresetResponseDto;
class SettingSavePresetRequestDto extends SettingGetPresetRequestDto {
}
exports.SettingSavePresetRequestDto = SettingSavePresetRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.PARAM,
        example: [{ name: 'LIMIT_V', type: 'float', value: '1.2' }],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingParam),
    __metadata("design:type", Array)
], SettingSavePresetRequestDto.prototype, "param", void 0);
class SettingSavePresetResponseDto extends SettingSavePresetRequestDto {
}
exports.SettingSavePresetResponseDto = SettingSavePresetResponseDto;
class SettingSetParamRequestDto {
}
exports.SettingSetParamRequestDto = SettingSetParamRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: Description.PARAM,
        example: [{ name: 'SPEAKER', type: 'boolean', value: 'true' }],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingParam),
    __metadata("design:type", Array)
], SettingSetParamRequestDto.prototype, "param", void 0);
class SettingSetParamResponseDto extends SettingSetParamRequestDto {
}
exports.SettingSetParamResponseDto = SettingSetParamResponseDto;
//# sourceMappingURL=setting.dto.js.map