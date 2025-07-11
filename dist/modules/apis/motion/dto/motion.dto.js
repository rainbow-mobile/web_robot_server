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
exports.MotionCommandDto = exports.MotionMethod = exports.MotionCommand = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_validator_2 = require("class-validator");
var MotionCommand;
(function (MotionCommand) {
    MotionCommand["MOTION_GATE"] = "motionGate";
})(MotionCommand || (exports.MotionCommand = MotionCommand = {}));
var MotionMethod;
(function (MotionMethod) {
    MotionMethod["SITTING"] = "sitting";
    MotionMethod["STANDING"] = "standing";
    MotionMethod["AIMING"] = "aiming";
    MotionMethod["TROTTING"] = "trotting";
    MotionMethod["TROT_STAIRS"] = "trot_stairs";
    MotionMethod["WAVING"] = "waving";
    MotionMethod["TROT_RUNNING"] = "trot_running";
    MotionMethod["DOOR_OPENING"] = "door_opening";
    MotionMethod["ZMP_INITIALIZING"] = "zmp_initializing";
})(MotionMethod || (exports.MotionMethod = MotionMethod = {}));
class MotionCommandDto {
}
exports.MotionCommandDto = MotionCommandDto;
__decorate([
    (0, class_validator_2.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(MotionCommand, { message: 'Invalid motion command' }),
    (0, swagger_1.ApiProperty)({ description: 'motion 명령' }),
    __metadata("design:type", String)
], MotionCommandDto.prototype, "command", void 0);
__decorate([
    (0, class_validator_2.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(MotionMethod, { message: 'Invalid motion method' }),
    (0, swagger_1.ApiProperty)({ description: 'motion 명령' }),
    __metadata("design:type", String)
], MotionCommandDto.prototype, "method", void 0);
