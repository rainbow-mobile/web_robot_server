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
exports.SequenceDto = void 0;
const equipment_enum_1 = require("../../../common/enum/equipment.enum");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SequenceDto {
}
exports.SequenceDto = SequenceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        description: '시퀀스 이름',
        example: 'READY',
        enum: equipment_enum_1.ManipulatoreOperationName,
        required: true,
    }),
    __metadata("design:type", String)
], SequenceDto.prototype, "operationName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 5),
    (0, swagger_1.ApiProperty)({
        description: '시퀀스 현 상태 (START, END, SET) 중 하나의 값일 것',
        example: equipment_enum_1.GeneralOperationStatus.START,
        enum: equipment_enum_1.GeneralOperationStatus,
        required: false,
    }),
    __metadata("design:type", String)
], SequenceDto.prototype, "operationStatus", void 0);
//# sourceMappingURL=sequence.dto.js.map