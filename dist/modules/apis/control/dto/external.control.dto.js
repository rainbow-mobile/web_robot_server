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
exports.ExternalCommandDto = exports.FootCommand = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var FootCommand;
(function (FootCommand) {
    FootCommand["Move"] = "footMove";
    FootCommand["Stop"] = "footStop";
})(FootCommand || (exports.FootCommand = FootCommand = {}));
class ExternalCommandDto {
}
exports.ExternalCommandDto = ExternalCommandDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    (0, swagger_1.ApiProperty)({
        enum: FootCommand,
        example: FootCommand.Move,
        description: '전달할 명령을 입력하세요. Foot명령의 경우 footMove, footStop이 있습니다.',
    }),
    __metadata("design:type", String)
], ExternalCommandDto.prototype, "command", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: '이동할 위치값을 입력하세요.',
        required: false,
    }),
    __metadata("design:type", Number)
], ExternalCommandDto.prototype, "pose", void 0);
//# sourceMappingURL=external.control.dto.js.map